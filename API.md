# เอกสารข้อกำหนดระบบ API (API Specification)

ระบบ API ของ **ศ.ต.ภ. (SOTOPO)** พัฒนาด้วยภาษา PHP ในรูปแบบ RESTful JSON API โดยมีจุดเชื่อมต่อหลักอยู่ที่ไฟล์ `backend/api.php`

---

## 🌐 ภาพรวมการเชื่อมต่อ (General Information)

- **Base URL (Local Development)**: `http://localhost/sotopo/backend/api.php` หรือ `http://127.0.0.1:8000/backend/api.php`
- **Response Format**: `application/json; charset=UTF-8`
- **CORS Policy**: เปิดให้เรียกใช้งานได้จากทุก Origin (`Access-Control-Allow-Origin: *`)
- **HTTP Methods ที่รองรับ**: `GET`, `POST`, `OPTIONS`
- **Authentication Header**: `Authorization: Bearer <TOKEN>` (สำหรับ Admin Endpoints)

### โครงสร้างผลลัพธ์มาตรฐาน (Standard Response Structure)

#### กรณีสำเร็จ (Success)
```json
{
  "status": "success",
  "data": [ ... ],
  "message": "ข้อความอธิบาย (ถ้ามี)",
  "pagination": { ... } // (กรณีมี Pagination)
}
```

#### กรณีเกิดข้อผิดพลาด (Error)
```json
{
  "status": "error",
  "message": "ข้อความอธิบายข้อผิดพลาด"
}
```

---

## 📌 สรุปรายการ Endpoints (Endpoints Summary)

### 1. ฝั่งหน้าบ้าน (Public Endpoints)
| Method | Endpoint Parameter | คำอธิบาย |
|---|---|---|
| `GET` | `?endpoint=news` | ดึงรายการข่าวสาร/กิจกรรม หรือดูข่าวสารราย ID |
| `GET` | `?endpoint=committees` | ดึงรายนามคณะกรรมการ ศ.ต.ภ. ทั้งหมด |
| `GET` | `?endpoint=offices` | ดึงข้อมูลที่ตั้งสำนักงานและศูนย์ประสานงาน |
| `GET` | `?endpoint=announcements` | ค้นหาและดูประกาศรายชื่อพระภิกษุที่ได้รับอนุมัติ (พร้อม Pagination) |
| `GET` | `?endpoint=status` | ตรวจสอบสถานะคำขอตามรหัสติดตาม (Tracking Number) |
| `POST` | `?endpoint=submit_application` | ยื่นคำร้องขออนุมัติเดินทางไปต่างประเทศออนไลน์ |

### 2. ฝั่งหลังบ้าน (Admin Endpoints - ต้องแนบ Bearer Token)
| Method | Endpoint Parameter | คำอธิบาย |
|---|---|---|
| `POST` | `?endpoint=admin_login` | เข้าสู่ระบบผู้ดูแลระบบ (ไม่ต้องแนบ Token) |
| `GET` | `?endpoint=admin_verify` | ตรวจสอบความถูกต้องของ Token |
| `GET` | `?endpoint=admin_stats` | ดึงสถิติภาพรวมสำหรับ Dashboard |
| `GET` | `?endpoint=admin_applications` | ดึงรายการคำขอทั้งหมด (พร้อมตัวกรองและค้นหา) |
| `POST` | `?endpoint=admin_save_application` | สร้างหรือแก้ไขคำขอ และปรับเปลี่ยนขั้นตอน Step 1-4 |
| `POST` | `?endpoint=admin_delete_application` | ลบคำขอเดินทาง |
| `GET` | `?endpoint=admin_news` | ดึงรายการข่าวสารทั้งหมดสำหรับหน้าจัดการ |
| `POST` | `?endpoint=admin_save_news` | สร้างหรือแก้ไขข่าวสาร (Rich HTML Content) |
| `POST` | `?endpoint=admin_delete_news` | ลบข่าวสาร |
| `GET` | `?endpoint=admin_announcements` | ดึงรายการประกาศพร้อมรายชื่อพระภิกษุในแต่ละประกาศ |
| `POST` | `?endpoint=admin_save_announcement` | สร้างหรือแก้ไขประกาศและชุดรายชื่อพระภิกษุ |
| `POST` | `?endpoint=admin_delete_announcement` | ลบประกาศและรายชื่อพระภิกษุ |
| `POST` | `?endpoint=admin_save_committee` | เพิ่มหรือแก้ไขข้อมูลกรรมการ |
| `POST` | `?endpoint=admin_delete_committee` | ลบข้อมูลกรรมการ |
| `POST` | `?endpoint=admin_save_office` | เพิ่มหรือแก้ไขข้อมูลสำนักงาน |
| `POST` | `?endpoint=admin_delete_office` | ลบข้อมูลสำนักงาน |
| `POST` | `?endpoint=admin_change_password` | เปลี่ยนรหัสผ่านหรือแก้ไขโปรไฟล์แอดมิน |

---

## 📖 รายละเอียด Public Endpoints

### 1. ข่าวสารและกิจกรรม (News API)
`GET /backend/api.php?endpoint=news`
- Parameters: `id`, `tag`, `search`, `limit`

### 2. ทำเนียบคณะกรรมการ (Committees API)
`GET /backend/api.php?endpoint=committees`

### 3. ข้อมูลสำนักงาน (Offices API)
`GET /backend/api.php?endpoint=offices`

### 4. ประกาศผลการอนุมัติ (Announcements API)
`GET /backend/api.php?endpoint=announcements`
- Parameters: `search`, `page`, `limit`

### 5. ติดตามสถานะคำขอ (Status Tracking API)
`GET /backend/api.php?endpoint=status&tracking_number=ST-2026-0001`

### 6. ยื่นคำร้องขออนุมัติออนไลน์ (Submit Application API)
`POST /backend/api.php?endpoint=submit_application`

---

## 🔐 รายละเอียด Admin Endpoints

### 1. เข้าสู่ระบบ (Admin Login)
#### `POST /backend/api.php?endpoint=admin_login`
```json
// Request Body
{
  "username": "admin",
  "password": "admin123"
}

// Response Body
{
  "status": "success",
  "message": "เข้าสู่ระบบสำเร็จ",
  "token": "eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiJ9...",
  "admin": {
    "id": 1,
    "username": "admin",
    "full_name": "ผู้ดูแลระบบ ศ.ต.ภ. ส่วนกลาง",
    "role": "superadmin"
  }
}
```

### 2. ดึงสถิติภาพรวม (Admin Stats)
#### `GET /backend/api.php?endpoint=admin_stats`
```json
// Response Body
{
  "status": "success",
  "data": {
    "total_applications": 8,
    "pending_applications": 6,
    "approved_applications": 2,
    "step1_count": 2,
    "step2_count": 2,
    "step3_count": 2,
    "step4_count": 2,
    "total_news": 8,
    "total_announcements": 9,
    "total_approved_monks": 45,
    "total_committees": 6,
    "recent_applications": [ ... ]
  }
}
```

### 3. จัดการคำขอ (Save Application)
#### `POST /backend/api.php?endpoint=admin_save_application`
```json
// Request Body
{
  "id": 1,
  "monk_name": "พระมหาประเสริฐ สุเมโธ",
  "temple": "วัดบวรนิเวศวิหาร",
  "destination": "สหรัฐอเมริกา",
  "status": "อนุมัติเรียบร้อย (รับเอกสารได้ที่ ศ.ต.ภ.)",
  "step": 4
}
```

### 4. จัดการประกาศและรายชื่อพระภิกษุ (Save Announcement with Monks)
#### `POST /backend/api.php?endpoint=admin_save_announcement`
```json
// Request Body
{
  "id": 0,
  "announcement_number": "ศ.ต.ภ. ๖/๒๕๖๙",
  "topic": "อนุมัติพระภิกษุสามเณรเดินทางไปปฏิบัติศาสนกิจในต่างประเทศ",
  "approve_date": "๑ สิงหาคม ๒๕๖๙",
  "monks": [
    {
      "monk_name": "พระมหาทดสอบ ฐิตธมฺโม",
      "temple": "วัดสระเกศ",
      "destination": "สหรัฐอเมริกา",
      "approve_date": "๑ สิงหาคม ๒๕๖๙"
    }
  ]
}
```
