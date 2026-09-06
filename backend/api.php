<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Load .env file
function loadEnv($path) {
    if (!file_exists($path)) return;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $key = trim($name);
            $val = trim($value);
            $_ENV[$key] = $val;
            $_SERVER[$key] = $val;
            putenv("{$key}={$val}");
        }
    }
}
loadEnv(dirname(__DIR__) . '/.env');

function getEnvVar($key, $default = '') {
    $val = getenv($key);
    if ($val !== false && $val !== '') return $val;
    if (isset($_ENV[$key]) && $_ENV[$key] !== '') return $_ENV[$key];
    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') return $_SERVER[$key];
    return $default;
}

$db_connection = getEnvVar('DB_CONNECTION', 'mysql');
$db_host = getEnvVar('DB_HOST', '127.0.0.1');
$db_port = getEnvVar('DB_PORT', '3306');
$db_name = getEnvVar('DB_NAME', 'sotopo');
$db_user = getEnvVar('DB_USER', 'root');
$db_pass = getEnvVar('DB_PASS', '');

try {
    if ($db_connection === 'mysql' && !empty($db_host) && !empty($db_name)) {
        $dsn = "mysql:host=$db_host;port=$db_port;dbname=$db_name;charset=utf8mb4";
        $db = new PDO($dsn, $db_user, $db_pass);
    } else {
        $db_file = __DIR__ . '/database.sqlite';
        $db = new PDO("sqlite:" . $db_file);
    }
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Auto-create admins table if not exists
    $db->exec("CREATE TABLE IF NOT EXISTS `admins` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `username` VARCHAR(100) NOT NULL UNIQUE,
        `password_hash` VARCHAR(255) NOT NULL,
        `full_name` VARCHAR(255) NOT NULL,
        `role` VARCHAR(50) NOT NULL DEFAULT 'admin',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Check if default admin exists
    $adminCheck = $db->query("SELECT COUNT(*) as count FROM admins")->fetch();
    if ($adminCheck && intval($adminCheck['count']) === 0) {
        $defaultHash = password_hash('admin123', PASSWORD_BCRYPT);
        $stmt = $db->prepare("INSERT INTO admins (username, password_hash, full_name, role) VALUES (?, ?, ?, ?)");
        $stmt->execute(['admin', $defaultHash, 'ผู้ดูแลระบบ ศ.ต.ภ. ส่วนกลาง', 'superadmin']);
    }
} catch (PDOException $e) {
    // If SQLite error with AUTO_INCREMENT or MySQL error
    try {
        if (!isset($db)) {
            $db_file = __DIR__ . '/database.sqlite';
            $db = new PDO("sqlite:" . $db_file);
            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        }
    } catch (PDOException $ex) {
        echo json_encode(["status" => "error", "message" => "Database connection failed: " . $e->getMessage()]);
        exit;
    }
}

// Token helper
define('AUTH_SECRET', 'sotopo_admin_secret_salt_key_2026');

function generateToken($admin) {
    $payload = [
        'id' => $admin['id'],
        'username' => $admin['username'],
        'full_name' => $admin['full_name'],
        'role' => $admin['role'],
        'time' => time()
    ];
    $json = json_encode($payload);
    $signature = hash_hmac('sha256', $json, AUTH_SECRET);
    return base64_encode($json) . '.' . $signature;
}

function verifyToken() {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : (isset($headers['authorization']) ? $headers['authorization'] : '');
    
    if (empty($authHeader) && isset($_GET['token'])) {
        $authHeader = 'Bearer ' . $_GET['token'];
    }

    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        $parts = explode('.', $token);
        if (count($parts) === 2) {
            $json = base64_decode($parts[0]);
            $signature = $parts[1];
            if (hash_hmac('sha256', $json, AUTH_SECRET) === $signature) {
                $payload = json_decode($json, true);
                // Token valid for 7 days
                if (isset($payload['time']) && (time() - $payload['time']) < 7 * 86400) {
                    return $payload;
                }
            }
        }
    }
    return null;
}

function getJsonInput() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?: [];
}

// Handling API Endpoints
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';

switch ($endpoint) {

    // ==========================================
    // 🌐 PUBLIC ENDPOINTS
    // ==========================================

    case 'news':
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        if ($id > 0) {
            $stmt = $db->prepare("SELECT * FROM news WHERE id = ?");
            $stmt->execute([$id]);
            $item = $stmt->fetch();
            if ($item) {
                $item['id'] = intval($item['id']);
                echo json_encode(["status" => "success", "data" => $item]);
            } else {
                echo json_encode(["status" => "error", "message" => "ไม่พบข้อมูลข่าวสาร"]);
            }
        } else {
            $tag = isset($_GET['tag']) ? trim($_GET['tag']) : '';
            $search = isset($_GET['search']) ? trim($_GET['search']) : '';
            $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 0;

            $sql = "SELECT * FROM news WHERE 1=1";
            $params = [];
            if ($tag !== '' && $tag !== 'ทั้งหมด' && $tag !== 'all') {
                $sql .= " AND tag = ?";
                $params[] = $tag;
            }
            if ($search !== '') {
                $sql .= " AND (title LIKE ? OR summary LIKE ? OR content LIKE ?)";
                $like = "%" . $search . "%";
                $params[] = $like;
                $params[] = $like;
                $params[] = $like;
            }
            $sql .= " ORDER BY id DESC";
            if ($limit > 0) {
                $sql .= " LIMIT " . $limit;
            }

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $rows = $stmt->fetchAll();
            foreach ($rows as &$row) {
                $row['id'] = intval($row['id']);
            }
            echo json_encode(["status" => "success", "data" => $rows]);
        }
        break;

    case 'committees':
        $rows = $db->query("SELECT * FROM committees ORDER BY level ASC, id ASC")->fetchAll();
        foreach ($rows as &$row) {
            $row['id'] = intval($row['id']);
            $row['level'] = intval($row['level']);
        }
        echo json_encode(["status" => "success", "data" => $rows]);
        break;

    case 'offices':
        $stmt = $db->query("SELECT * FROM offices ORDER BY id ASC");
        $rows = $stmt->fetchAll();
        foreach ($rows as &$row) {
            $row['id'] = intval($row['id']);
        }
        echo json_encode(["status" => "success", "data" => $rows]);
        break;

    case 'announcements':
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
        if ($page < 1) $page = 1;
        if ($limit < 1) $limit = 10;
        $offset = ($page - 1) * $limit;

        if ($search !== '') {
            $count_stmt = $db->prepare("SELECT COUNT(*) as count 
                FROM approved_monks am 
                JOIN announcements a ON am.announcement_id = a.id 
                WHERE am.monk_name LIKE ? OR am.temple LIKE ? OR am.destination LIKE ? OR a.announcement_number LIKE ?");
            $like_val = "%" . $search . "%";
            $count_stmt->execute([$like_val, $like_val, $like_val, $like_val]);
            $total_items = $count_stmt->fetch()['count'];

            $query_stmt = $db->prepare("SELECT am.*, a.announcement_number, a.topic 
                FROM approved_monks am 
                JOIN announcements a ON am.announcement_id = a.id 
                WHERE am.monk_name LIKE ? OR am.temple LIKE ? OR am.destination LIKE ? OR a.announcement_number LIKE ? 
                ORDER BY am.id DESC LIMIT ? OFFSET ?");
            $query_stmt->bindValue(1, $like_val, PDO::PARAM_STR);
            $query_stmt->bindValue(2, $like_val, PDO::PARAM_STR);
            $query_stmt->bindValue(3, $like_val, PDO::PARAM_STR);
            $query_stmt->bindValue(4, $like_val, PDO::PARAM_STR);
            $query_stmt->bindValue(5, $limit, PDO::PARAM_INT);
            $query_stmt->bindValue(6, $offset, PDO::PARAM_INT);
            $query_stmt->execute();
            $data = $query_stmt->fetchAll();
        } else {
            $total_items = $db->query("SELECT COUNT(*) as count FROM approved_monks")->fetch()['count'];
            
            $query_stmt = $db->prepare("SELECT am.*, a.announcement_number, a.topic 
                FROM approved_monks am 
                JOIN announcements a ON am.announcement_id = a.id 
                ORDER BY am.id DESC LIMIT ? OFFSET ?");
            $query_stmt->bindValue(1, $limit, PDO::PARAM_INT);
            $query_stmt->bindValue(2, $offset, PDO::PARAM_INT);
            $query_stmt->execute();
            $data = $query_stmt->fetchAll();
        }

        foreach ($data as &$d) {
            $d['id'] = intval($d['id']);
            $d['announcement_id'] = intval($d['announcement_id']);
        }

        echo json_encode([
            "status" => "success",
            "data" => $data,
            "pagination" => [
                "total_items" => intval($total_items),
                "current_page" => $page,
                "limit" => $limit,
                "total_pages" => ceil($total_items / $limit)
            ]
        ]);
        break;

    case 'status':
        $tracking_number = isset($_GET['tracking_number']) ? trim($_GET['tracking_number']) : '';
        if ($tracking_number === '') {
            echo json_encode(["status" => "error", "message" => "Tracking number is required"]);
            break;
        }

        $stmt = $db->prepare("SELECT * FROM applications WHERE tracking_number = ?");
        $stmt->execute([$tracking_number]);
        $app = $stmt->fetch();

        if ($app) {
            $app['id'] = intval($app['id']);
            $app['step'] = intval($app['step']);
            echo json_encode(["status" => "success", "data" => $app]);
        } else {
            echo json_encode(["status" => "error", "message" => "ไม่พบข้อมูลรหัสติดตามนี้ในระบบ กรุณาตรวจสอบอีกครั้ง"]);
        }
        break;

    case 'submit_application':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(["status" => "error", "message" => "Only POST method is allowed"]);
            break;
        }

        $input = getJsonInput();
        $monk_name = isset($input['monk_name']) ? trim($input['monk_name']) : '';
        $temple = isset($input['temple']) ? trim($input['temple']) : '';
        $destination = isset($input['destination']) ? trim($input['destination']) : '';

        if ($monk_name === '' || $temple === '' || $destination === '') {
            echo json_encode(["status" => "error", "message" => "Please fill in all required fields"]);
            break;
        }

        $year = date('Y');
        $count = $db->query("SELECT COUNT(*) as count FROM applications")->fetch()['count'] + 1;
        $tracking_number = sprintf("ST-%s-%04d", $year, $count);

        try {
            $stmt = $db->prepare("INSERT INTO applications (tracking_number, monk_name, temple, destination, status, step, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $updated_at = date('Y-m-d H:i');
            $stmt->execute([
                $tracking_number,
                $monk_name,
                $temple,
                $destination,
                "ยื่นคำขอเข้าระบบ / รอตรวจสอบเอกสาร",
                1,
                $updated_at
            ]);

            echo json_encode([
                "status" => "success",
                "message" => "ยื่นคำขอเรียบร้อยแล้ว",
                "data" => [
                    "tracking_number" => $tracking_number,
                    "monk_name" => $monk_name,
                    "temple" => $temple,
                    "destination" => $destination,
                    "status" => "ยื่นคำขอเข้าระบบ / รอตรวจสอบเอกสาร",
                    "step" => 1,
                    "updated_at" => $updated_at
                ]
            ]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Failed to submit application: " . $e->getMessage()]);
        }
        break;

    // ==========================================
    // 🔐 ADMIN AUTH & DASHBOARD
    // ==========================================

    case 'admin_login':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(["status" => "error", "message" => "Only POST is allowed"]);
            break;
        }

        $input = getJsonInput();
        $username = isset($input['username']) ? trim($input['username']) : '';
        $password = isset($input['password']) ? trim($input['password']) : '';

        if (empty($username) || empty($password)) {
            echo json_encode(["status" => "error", "message" => "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน"]);
            break;
        }

        $stmt = $db->prepare("SELECT * FROM admins WHERE username = ?");
        $stmt->execute([$username]);
        $admin = $stmt->fetch();

        if ($admin && password_verify($password, $admin['password_hash'])) {
            $token = generateToken($admin);
            unset($admin['password_hash']);
            $admin['id'] = intval($admin['id']);
            echo json_encode([
                "status" => "success",
                "message" => "เข้าสู่ระบบสำเร็จ",
                "token" => $token,
                "admin" => $admin
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง"]);
        }
        break;

    case 'admin_verify':
        $auth = verifyToken();
        if (!$auth) {
            echo json_encode(["status" => "error", "message" => "Unauthorized token"]);
            break;
        }
        $stmt = $db->prepare("SELECT id, username, full_name, role FROM admins WHERE id = ?");
        $stmt->execute([$auth['id']]);
        $admin = $stmt->fetch();
        if ($admin) {
            $admin['id'] = intval($admin['id']);
            echo json_encode(["status" => "success", "admin" => $admin]);
        } else {
            echo json_encode(["status" => "error", "message" => "User not found"]);
        }
        break;

    case 'admin_stats':
        $auth = verifyToken();
        if (!$auth) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]);
            break;
        }

        $total_apps = intval($db->query("SELECT COUNT(*) as count FROM applications")->fetch()['count']);
        $step1_apps = intval($db->query("SELECT COUNT(*) as count FROM applications WHERE step = 1")->fetch()['count']);
        $step2_apps = intval($db->query("SELECT COUNT(*) as count FROM applications WHERE step = 2")->fetch()['count']);
        $step3_apps = intval($db->query("SELECT COUNT(*) as count FROM applications WHERE step = 3")->fetch()['count']);
        $step4_apps = intval($db->query("SELECT COUNT(*) as count FROM applications WHERE step = 4")->fetch()['count']);
        $total_news = intval($db->query("SELECT COUNT(*) as count FROM news")->fetch()['count']);
        $total_announcements = intval($db->query("SELECT COUNT(*) as count FROM announcements")->fetch()['count']);
        $total_monks = intval($db->query("SELECT COUNT(*) as count FROM approved_monks")->fetch()['count']);
        $total_committees = intval($db->query("SELECT COUNT(*) as count FROM committees")->fetch()['count']);

        $recent_apps = $db->query("SELECT * FROM applications ORDER BY id DESC LIMIT 5")->fetchAll();
        foreach ($recent_apps as &$r) {
            $r['id'] = intval($r['id']);
            $r['step'] = intval($r['step']);
        }

        echo json_encode([
            "status" => "success",
            "data" => [
                "total_applications" => $total_apps,
                "pending_applications" => ($step1_apps + $step2_apps + $step3_apps),
                "approved_applications" => $step4_apps,
                "step1_count" => $step1_apps,
                "step2_count" => $step2_apps,
                "step3_count" => $step3_apps,
                "step4_count" => $step4_apps,
                "total_news" => $total_news,
                "total_announcements" => $total_announcements,
                "total_approved_monks" => $total_monks,
                "total_committees" => $total_committees,
                "recent_applications" => $recent_apps
            ]
        ]);
        break;

    // ==========================================
    // 📝 ADMIN APPLICATIONS CRUD
    // ==========================================

    case 'admin_applications':
        $auth = verifyToken();
        if (!$auth) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]);
            break;
        }

        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        $step = isset($_GET['step']) ? intval($_GET['step']) : 0;
        
        $sql = "SELECT * FROM applications WHERE 1=1";
        $params = [];

        if ($step > 0) {
            $sql .= " AND step = ?";
            $params[] = $step;
        }

        if ($search !== '') {
            $sql .= " AND (tracking_number LIKE ? OR monk_name LIKE ? OR temple LIKE ? OR destination LIKE ? OR status LIKE ?)";
            $like = "%" . $search . "%";
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
            $params[] = $like;
        }

        $sql .= " ORDER BY id DESC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();
        foreach ($rows as &$row) {
            $row['id'] = intval($row['id']);
            $row['step'] = intval($row['step']);
        }

        echo json_encode(["status" => "success", "data" => $rows]);
        break;

    case 'admin_save_application':
        $auth = verifyToken();
        if (!$auth) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]);
            break;
        }

        $input = getJsonInput();
        $id = isset($input['id']) ? intval($input['id']) : 0;
        $monk_name = isset($input['monk_name']) ? trim($input['monk_name']) : '';
        $temple = isset($input['temple']) ? trim($input['temple']) : '';
        $destination = isset($input['destination']) ? trim($input['destination']) : '';
        $step = isset($input['step']) ? intval($input['step']) : 1;
        $status = isset($input['status']) ? trim($input['status']) : '';
        $tracking_number = isset($input['tracking_number']) ? trim($input['tracking_number']) : '';
        $updated_at = date('Y-m-d H:i');

        if (empty($monk_name) || empty($temple) || empty($destination)) {
            echo json_encode(["status" => "error", "message" => "กรุณากรอกข้อมูลให้ครบถ้วน"]);
            break;
        }

        // Auto default status based on step if empty
        if (empty($status)) {
            $statusOptions = [
                1 => "ยื่นคำขอเข้าระบบ / รอตรวจสอบเอกสาร",
                2 => "ตรวจสอบเอกสารเสร็จสิ้น กำลังเสนอคณะกรรมการ",
                3 => "อยู่ระหว่างเสนอเลขาธิการ ศ.ต.ภ. ลงนาม",
                4 => "อนุมัติเรียบร้อย (รับเอกสารได้ที่ ศ.ต.ภ.)"
            ];
            $status = isset($statusOptions[$step]) ? $statusOptions[$step] : "อยู่ระหว่างดำเนินการ";
        }

        if ($id > 0) {
            // Update
            $stmt = $db->prepare("UPDATE applications SET monk_name = ?, temple = ?, destination = ?, status = ?, step = ?, updated_at = ? WHERE id = ?");
            $stmt->execute([$monk_name, $temple, $destination, $status, $step, $updated_at, $id]);
            echo json_encode(["status" => "success", "message" => "อัปเดตข้อมูลคำขอเรียบร้อยแล้ว"]);
        } else {
            // Create
            if (empty($tracking_number)) {
                $year = date('Y');
                $count = $db->query("SELECT COUNT(*) as count FROM applications")->fetch()['count'] + 1;
                $tracking_number = sprintf("ST-%s-%04d", $year, $count);
            }
            $stmt = $db->prepare("INSERT INTO applications (tracking_number, monk_name, temple, destination, status, step, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$tracking_number, $monk_name, $temple, $destination, $status, $step, $updated_at]);
            $newId = $db->lastInsertId();
            echo json_encode([
                "status" => "success",
                "message" => "บันทึกคำขอใหม่เรียบร้อยแล้ว",
                "data" => ["id" => intval($newId), "tracking_number" => $tracking_number]
            ]);
        }
        break;

    case 'admin_delete_application':
        $auth = verifyToken();
        if (!$auth) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]);
            break;
        }
        $input = getJsonInput();
        $id = isset($input['id']) ? intval($input['id']) : 0;
        if ($id > 0) {
            $stmt = $db->prepare("DELETE FROM applications WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(["status" => "success", "message" => "ลบรายการคำขอเรียบร้อยแล้ว"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid ID"]);
        }
        break;

    // ==========================================
    // 📰 ADMIN NEWS CRUD
    // ==========================================

    case 'admin_news':
        $auth = verifyToken();
        if (!$auth) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]);
            break;
        }

        $rows = $db->query("SELECT * FROM news ORDER BY id DESC")->fetchAll();
        foreach ($rows as &$row) {
            $row['id'] = intval($row['id']);
        }
        echo json_encode(["status" => "success", "data" => $rows]);
        break;

    case 'admin_save_news':
        $auth = verifyToken();
        if (!$auth) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]);
            break;
        }

        $input = getJsonInput();
        $id = isset($input['id']) ? intval($input['id']) : 0;
        $tag = isset($input['tag']) ? trim($input['tag']) : 'ข่าวสาร';
        $date = isset($input['date']) ? trim($input['date']) : date('d/m/Y');
        $title = isset($input['title']) ? trim($input['title']) : '';
        $summary = isset($input['summary']) ? trim($input['summary']) : '';
        $content = isset($input['content']) ? trim($input['content']) : '';
        $image_url = isset($input['image_url']) ? trim($input['image_url']) : '/images/news1.jpg';

        if (empty($title) || empty($summary)) {
            echo json_encode(["status" => "error", "message" => "กรุณาระบุหัวข้อข่าวและสรุปย่อ"]);
            break;
        }

        if ($id > 0) {
            $stmt = $db->prepare("UPDATE news SET tag = ?, date = ?, title = ?, summary = ?, content = ?, image_url = ? WHERE id = ?");
            $stmt->execute([$tag, $date, $title, $summary, $content, $image_url, $id]);
            echo json_encode(["status" => "success", "message" => "อัปเดตข่าวสารเรียบร้อยแล้ว"]);
        } else {
            $stmt = $db->prepare("INSERT INTO news (tag, date, title, summary, content, image_url) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$tag, $date, $title, $summary, $content, $image_url]);
            echo json_encode(["status" => "success", "message" => "เพิ่มข่าวสารใหม่เรียบร้อยแล้ว", "id" => intval($db->lastInsertId())]);
        }
        break;

    case 'admin_delete_news':
        $auth = verifyToken();
        if (!$auth) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]);
            break;
        }
        $input = getJsonInput();
        $id = isset($input['id']) ? intval($input['id']) : 0;
        if ($id > 0) {
            $stmt = $db->prepare("DELETE FROM news WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(["status" => "success", "message" => "ลบข่าวสารเรียบร้อยแล้ว"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid ID"]);
        }
        break;

    // ==========================================
    // 📜 ADMIN ANNOUNCEMENTS & APPROVED MONKS
    // ==========================================

    case 'admin_announcements':
        $auth = verifyToken();
        if (!$auth) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]);
            break;
        }

        $announcements = $db->query("SELECT * FROM announcements ORDER BY id DESC")->fetchAll();
        foreach ($announcements as &$a) {
            $a['id'] = intval($a['id']);
            $monksStmt = $db->prepare("SELECT * FROM approved_monks WHERE announcement_id = ? ORDER BY id ASC");
            $monksStmt->execute([$a['id']]);
            $monks = $monksStmt->fetchAll();
            foreach ($monks as &$m) {
                $m['id'] = intval($m['id']);
                $m['announcement_id'] = intval($m['announcement_id']);
            }
            $a['monks'] = $monks;
            $a['monk_count'] = count($monks);
        }

        echo json_encode(["status" => "success", "data" => $announcements]);
        break;

    case 'admin_save_announcement':
        $auth = verifyToken();
        if (!$auth) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]);
            break;
        }

        $input = getJsonInput();
        $id = isset($input['id']) ? intval($input['id']) : 0;
        $announcement_number = isset($input['announcement_number']) ? trim($input['announcement_number']) : '';
        $topic = isset($input['topic']) ? trim($input['topic']) : '';
        $approve_date = isset($input['approve_date']) ? trim($input['approve_date']) : '';
        $monks = isset($input['monks']) && is_array($input['monks']) ? $input['monks'] : [];

        if (empty($announcement_number) || empty($topic)) {
            echo json_encode(["status" => "error", "message" => "กรุณากรอกเลขที่ประกาศและหัวข้อเรื่อง"]);
            break;
        }

        if ($id > 0) {
            $stmt = $db->prepare("UPDATE announcements SET announcement_number = ?, topic = ?, approve_date = ? WHERE id = ?");
            $stmt->execute([$announcement_number, $topic, $approve_date, $id]);
            $announcement_id = $id;

            // Delete old monks to resync
            $db->prepare("DELETE FROM approved_monks WHERE announcement_id = ?")->execute([$id]);
        } else {
            $stmt = $db->prepare("INSERT INTO announcements (announcement_number, topic, approve_date) VALUES (?, ?, ?)");
            $stmt->execute([$announcement_number, $topic, $approve_date]);
            $announcement_id = intval($db->lastInsertId());
        }

        // Insert monks
        if (!empty($monks)) {
            $insertMonk = $db->prepare("INSERT INTO approved_monks (announcement_id, monk_name, temple, destination, approve_date) VALUES (?, ?, ?, ?, ?)");
            foreach ($monks as $m) {
                $m_name = isset($m['monk_name']) ? trim($m['monk_name']) : '';
                $m_temple = isset($m['temple']) ? trim($m['temple']) : '';
                $m_destination = isset($m['destination']) ? trim($m['destination']) : '';
                $m_date = !empty($m['approve_date']) ? trim($m['approve_date']) : $approve_date;

                if (!empty($m_name)) {
                    $insertMonk->execute([$announcement_id, $m_name, $m_temple, $m_destination, $m_date]);
                }
            }
        }

        echo json_encode(["status" => "success", "message" => "บันทึกประกาศและรายชื่อพระภิกษุเรียบร้อยแล้ว", "id" => $announcement_id]);
        break;

    case 'admin_delete_announcement':
        $auth = verifyToken();
        if (!$auth) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]);
            break;
        }

        $input = getJsonInput();
        $id = isset($input['id']) ? intval($input['id']) : 0;
        if ($id > 0) {
            $db->prepare("DELETE FROM approved_monks WHERE announcement_id = ?")->execute([$id]);
            $db->prepare("DELETE FROM announcements WHERE id = ?")->execute([$id]);
            echo json_encode(["status" => "success", "message" => "ลบประกาศและรายชื่อพระภิกษุเรียบร้อยแล้ว"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid ID"]);
        }
        break;

    // ==========================================
    // 👥 ADMIN COMMITTEES CRUD
    // ==========================================

    case 'admin_save_committee':
        $auth = verifyToken();
        if (!$auth) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]);
            break;
        }

        $input = getJsonInput();
        $id = isset($input['id']) ? intval($input['id']) : 0;
        $name = isset($input['name']) ? trim($input['name']) : '';
        $role = isset($input['role']) ? trim($input['role']) : '';
        $description = isset($input['description']) ? trim($input['description']) : '';
        $image_url = isset($input['image_url']) ? trim($input['image_url']) : '/images/comm1.jpg';
        $level = isset($input['level']) ? intval($input['level']) : 2;

        if (empty($name) || empty($role)) {
            echo json_encode(["status" => "error", "message" => "กรุณากรอกชื่อและตำแหน่ง"]);
            break;
        }

        if ($id > 0) {
            $stmt = $db->prepare("UPDATE committees SET name = ?, role = ?, description = ?, image_url = ?, level = ? WHERE id = ?");
            $stmt->execute([$name, $role, $description, $image_url, $level, $id]);
            echo json_encode(["status" => "success", "message" => "อัปเดตข้อมูลกรรมการเรียบร้อยแล้ว"]);
        } else {
            $stmt = $db->prepare("INSERT INTO committees (name, role, description, image_url, level) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$name, $role, $description, $image_url, $level]);
            echo json_encode(["status" => "success", "message" => "เพิ่มกรรมการใหม่เรียบร้อยแล้ว"]);
        }
        break;

    case 'admin_delete_committee':
        $auth = verifyToken();
        if (!$auth) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]);
            break;
        }

        $input = getJsonInput();
        $id = isset($input['id']) ? intval($input['id']) : 0;
        if ($id > 0) {
            $db->prepare("DELETE FROM committees WHERE id = ?")->execute([$id]);
            echo json_encode(["status" => "success", "message" => "ลบข้อมูลกรรมการเรียบร้อยแล้ว"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid ID"]);
        }
        break;

    // ==========================================
    // 🏢 ADMIN OFFICES CRUD
    // ==========================================

    case 'admin_save_office':
        $auth = verifyToken();
        if (!$auth) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]);
            break;
        }

        $input = getJsonInput();
        $id = isset($input['id']) ? intval($input['id']) : 0;
        $name = isset($input['name']) ? trim($input['name']) : '';
        $address = isset($input['address']) ? trim($input['address']) : '';
        $phone = isset($input['phone']) ? trim($input['phone']) : '';
        $hours = isset($input['hours']) ? trim($input['hours']) : '';
        $type = isset($input['type']) ? trim($input['type']) : 'HQ';

        if (empty($name) || empty($address)) {
            echo json_encode(["status" => "error", "message" => "กรุณากรอกชื่อและที่ตั้งสำนักงาน"]);
            break;
        }

        if ($id > 0) {
            $stmt = $db->prepare("UPDATE offices SET name = ?, address = ?, phone = ?, hours = ?, type = ? WHERE id = ?");
            $stmt->execute([$name, $address, $phone, $hours, $type, $id]);
            echo json_encode(["status" => "success", "message" => "อัปเดตข้อมูลสำนักงานเรียบร้อยแล้ว"]);
        } else {
            $stmt = $db->prepare("INSERT INTO offices (name, address, phone, hours, type) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$name, $address, $phone, $hours, $type]);
            echo json_encode(["status" => "success", "message" => "เพิ่มสำนักงานใหม่เรียบร้อยแล้ว"]);
        }
        break;

    case 'admin_delete_office':
        $auth = verifyToken();
        if (!$auth) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]);
            break;
        }

        $input = getJsonInput();
        $id = isset($input['id']) ? intval($input['id']) : 0;
        if ($id > 0) {
            $db->prepare("DELETE FROM offices WHERE id = ?")->execute([$id]);
            echo json_encode(["status" => "success", "message" => "ลบข้อมูลสำนักงานเรียบร้อยแล้ว"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid ID"]);
        }
        break;

    // ==========================================
    // ⚙️ ADMIN PROFILE & PASSWORD
    // ==========================================

    case 'admin_change_password':
        $auth = verifyToken();
        if (!$auth) {
            echo json_encode(["status" => "error", "message" => "Unauthorized"]);
            break;
        }

        $input = getJsonInput();
        $old_password = isset($input['old_password']) ? trim($input['old_password']) : '';
        $new_password = isset($input['new_password']) ? trim($input['new_password']) : '';
        $full_name = isset($input['full_name']) ? trim($input['full_name']) : '';

        $stmt = $db->prepare("SELECT * FROM admins WHERE id = ?");
        $stmt->execute([$auth['id']]);
        $admin = $stmt->fetch();

        if (!$admin) {
            echo json_encode(["status" => "error", "message" => "Admin not found"]);
            break;
        }

        if (!empty($new_password)) {
            if (empty($old_password) || !password_verify($old_password, $admin['password_hash'])) {
                echo json_encode(["status" => "error", "message" => "รหัสผ่านเดิมไม่ถูกต้อง"]);
                break;
            }
            if (strlen($new_password) < 6) {
                echo json_encode(["status" => "error", "message" => "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร"]);
                break;
            }
            $newHash = password_hash($new_password, PASSWORD_BCRYPT);
            $db->prepare("UPDATE admins SET password_hash = ?, full_name = ? WHERE id = ?")->execute([$newHash, $full_name ?: $admin['full_name'], $admin['id']]);
        } else {
            if (!empty($full_name)) {
                $db->prepare("UPDATE admins SET full_name = ? WHERE id = ?")->execute([$full_name, $admin['id']]);
            }
        }

        echo json_encode(["status" => "success", "message" => "อัปเดตข้อมูลผู้ดูแลระบบเรียบร้อยแล้ว"]);
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Endpoint not found"]);
        break;
}
