# Backend API - ศูนย์ควบคุมการไปต่างประเทศของพระภิกษุสามเณร (ศ.ต.ภ.)

โฟลเดอร์นี้บรรจุซอร์สโค้ดฝั่ง Backend API สำหรับให้บริการข้อมูลแก่ระบบ Frontend

---

## 🛠️ โครงสร้างไฟล์ Backend

```text
backend/
├── README.md        # คู่มือการทำงานของ Backend API
└── api.php          # RESTful JSON Router & Database Controller
```

---

## ⚙️ การทำงานหลักของ `api.php`

1. **การจัดการ CORS และ Headers**:
   - กำหนด `Content-Type: application/json; charset=UTF-8`
   - รองรับ Preflight Request (`OPTIONS`) สำหรับการยิง Cross-Domain จากเครื่องมือหรือ Frontend
2. **การโหลด Environment Variable**:
   - ฟังก์ชัน `loadEnv()` อ่านไฟล์ `.env` ที่ Root ไดเรกทอรีอัตโนมัติ
   - กำหนดค่า Host, Port, Database, User และ Password
3. **การเชื่อมต่อฐานข้อมูล (Database Connection)**:
   - ใช้ **PDO (PHP Data Objects)** เพื่อประสิทธิภาพและความปลอดภัย
   - เชื่อมต่อไปยัง MySQL ตามค่าใน `.env`
   - มีระบบสำรอง (Fallback) ไปยัง SQLite (`backend/database.sqlite`) หากไม่ได้กำหนดค่า MySQL
4. **การเราต์คำขอ (Request Routing)**:
   - ตรวจสอบ Parameter `endpoint` ผ่าน Query String
   - ประมวลผลและตอบกลับข้อมูลในรูปแบบ JSON

---

## 🚀 การทดสอบ Backend แยกเดี่ยว (Testing Backend Independently)

สามารถทดสอบรัน PHP Server แยกเดี่ยวได้โดยใช้ Built-in Server ของ PHP:

```bash
# รันจาก Root โฟลเดอร์โปรเจกต์
php -S 127.0.0.1:8000
```

### ตัวอย่าง Endpoint สำหรับทดสอบใน Browser / Postman / cURL:

1. **ดูข่าวสารทั้งหมด:**
   ```bash
   curl http://127.0.0.1:8000/backend/api.php?endpoint=news
   ```

2. **ดูรายชื่อคณะกรรมการ:**
   ```bash
   curl http://127.0.0.1:8000/backend/api.php?endpoint=committees
   ```

3. **ตรวจสอบสถานะคำขอ:**
   ```bash
   curl "http://127.0.0.1:8000/backend/api.php?endpoint=status&tracking_number=ST-2026-0001"
   ```

4. **ทดสอบยื่นคำขอใหม่ (POST):**
   ```bash
   curl -X POST http://127.0.0.1:8000/backend/api.php?endpoint=submit_application \
     -H "Content-Type: application/json" \
     -d '{"monk_name":"พระทดสอบ ระบบดี","temple":"วัดทดสอบ","destination":"วัดไทยนิวยอร์ก สหรัฐอเมริกา"}'
   ```

---

## 🔒 ความปลอดภัย (Security)

- โค้ดทั้งหมดใช้ **Prepared Statements** (`$db->prepare(...)` และ `$stmt->execute(...)`) เพื่อป้องกันการโจมตีประเภท **SQL Injection**
- มีการตรวจสอบชนิดข้อมูลและ sanitize ข้อมูลนำเข้า (`intval()`, `trim()`, `htmlspecialchars` เมื่อจำเป็น)
