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
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

$driver = $db->getAttribute(PDO::ATTR_DRIVER_NAME);

// Handling API Endpoints
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';

switch ($endpoint) {
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

        $input = json_decode(file_get_contents('php://input'), true);
        $monk_name = isset($input['monk_name']) ? trim($input['monk_name']) : '';
        $temple = isset($input['temple']) ? trim($input['temple']) : '';
        $destination = isset($input['destination']) ? trim($input['destination']) : '';

        if ($monk_name === '' || $temple === '' || $destination === '') {
            echo json_encode(["status" => "error", "message" => "Please fill in all required fields"]);
            break;
        }

        // Generate tracking number
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

    default:
        echo json_encode(["status" => "error", "message" => "Endpoint not found"]);
        break;
}
