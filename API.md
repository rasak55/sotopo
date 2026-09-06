# เอกสารข้อกำหนดระบบ API (API Specification)

ระบบ API ของ **ศ.ต.ภ. (SOTOPO)** พัฒนาด้วยภาษา PHP ในรูปแบบ RESTful JSON API โดยมีจุดเชื่อมต่อหลักอยู่ที่ไฟล์ `backend/api.php`

---

## 🌐 ภาพรวมการเชื่อมต่อ (General Information)

- **Base URL (Local Development)**: `http://localhost/sotopo/backend/api.php` หรือ `http://127.0.0.1:8000/backend/api.php`
- **Response Format**: `application/json; charset=UTF-8`
- **CORS Policy**: เปิดให้เรียกใช้งานได้จากทุก Origin (`Access-Control-Allow-Origin: *`)
- **HTTP Methods ที่รองรับ**: `GET`, `POST`, `OPTIONS`

### โครงสร้างผลลัพธ์มาตรฐาน (Standard Response Structure)

#### กรณีสำเร็จ (Success)
```json
{
  "status": "success",
  "data": [ ... ],
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

| Method | Endpoint Parameter | คำอธิบาย |
|---|---|---|
| `GET` | `?endpoint=news` | ดึงรายการข่าวสาร/กิจกรรม หรือดูข่าวสารราย ID |
| `GET` | `?endpoint=committees` | ดึงรายนามคณะกรรมการ ศ.ต.ภ. ทั้งหมด |
| `GET` | `?endpoint=offices` | ดึงข้อมูลที่ตั้งสำนักงานและศูนย์ประสานงาน |
| `GET` | `?endpoint=announcements` | ค้นหาและดูประกาศรายชื่อพระภิกษุที่ได้รับอนุมัติ (พร้อม Pagination) |
| `GET` | `?endpoint=status` | ตรวจสอบสถานะคำขอตามรหัสติดตาม (Tracking Number) |
| `POST` | `?endpoint=submit_application` | ยื่นคำร้องขออนุมัติเดินทางไปต่างประเทศออนไลน์ |

---

## 📖 รายละเอียดแต่ละ Endpoint (Detailed API Reference)

### 1. ข่าวสารและกิจกรรม (News API)

#### `GET /backend/api.php?endpoint=news`

ดึงรายการข่าวสารทั้งหมด หรือค้นหา/กรองตามเงื่อนไข

##### Query Parameters:
| พารามิเตอร์ | ชนิดข้อมูล | จำเป็น | คำอธิบาย |
|---|---|---|---|
| `id` | Integer | ไม่จำเป็น | ระบุเพื่อดูเนื้อหาข่าวรายข้อแบบละเอียด (Full Rich Content) |
| `tag` | String | ไม่จำเป็น | กรองข่าวตามหมวดหมู่ (เช่น `'ข่าวสาร'`, `'ประกาศ'`, `'สาระน่ารู้'`, `'การอบรม'`) |
| `search` | String | ไม่จำเป็น | ค้นหาคำสำคัญในหัวข้อข่าว สรุปย่อ หรือเนื้อหา |
| `limit` | Integer | ไม่จำเป็น | จำกัดจำนวนข่าวที่ส่งกลับ (เช่น `limit=4`) |

##### ตัวอย่าง Request:
```http
GET /backend/api.php?endpoint=news&tag=ข่าวสาร&limit=5
```

##### ตัวอย่าง Response (รายการข่าว):
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "tag": "ข่าวสาร",
      "date": "๑๒ กรกฎาคม ๒๕๖๙",
      "title": "การประชุมคณะกรรมการ ศ.ต.ภ. ครั้งที่ ๕/๒๕๖๙ พิจารณาคำขอเดินทางไปต่างประเทศ",
      "summary": "สรุปผลการพิจารณาคำขอเดินทางไปปฏิบัติศาสนกิจในต่างประเทศประจำเดือนกรกฎาคม ๒๕๖๙ อนุมัติพระธรรมทูตจำนวน ๔๕ รูป",
      "image_url": "/images/news1.jpg"
    }
  ]
}
```

##### ตัวอย่าง Request (ข่าวรายข้อ):
```http
GET /backend/api.php?endpoint=news&id=1
```

##### ตัวอย่าง Response:
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "tag": "ข่าวสาร",
    "date": "๑๒ กรกฎาคม ๒๕๖๙",
    "title": "การประชุมคณะกรรมการ ศ.ต.ภ. ครั้งที่ ๕/๒๕๖๙ พิจารณาคำขอเดินทางไปต่างประเทศ",
    "summary": "สรุปผลการพิจารณาคำขอเดินทางไปปฏิบัติศาสนกิจในต่างประเทศประจำเดือนกรกฎาคม ๒๕๖๙ อนุมัติพระธรรมทูตจำนวน ๔๕ รูป",
    "content": "<p>เมื่อวันที่ ๑๒ กรกฎาคม ๒๕๖๙ คณะกรรมการศูนย์ควบคุมการไปต่างประเทศของพระภิกษุสามเณร (ศ.ต.ภ.) ได้จัดประชุมครั้งที่ ๕/๒๕๖๙...</p>",
    "image_url": "/images/news1.jpg"
  }
}
```

---

### 2. ทำเนียบคณะกรรมการ (Committees API)

#### `GET /backend/api.php?endpoint=committees`

ดึงข้อมูลรายนามคณะกรรมการ ศ.ต.ภ. เรียงตามลำดับชั้นบริหาร (`level`)

##### ตัวอย่าง Request:
```http
GET /backend/api.php?endpoint=committees
```

##### ตัวอย่าง Response:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "พระพรหมบัณฑิต (ประยูร ธมฺมจิตฺโต)",
      "role": "ประธานคณะกรรมการ ศ.ต.ภ.",
      "description": "กรรมการมหาเถรสมาคม, เจ้าอาวาสวัดประยุรวงศาวาสวรวิหาร, ประธานสภาสากลวันวิสาขบูชาโลก",
      "image_url": "/images/comm1.jpg",
      "level": 1
    },
    {
      "id": 2,
      "name": "พระธรรมโพธิวงศ์ (วีรยุทธ์ วีรยุทฺโธ)",
      "role": "รองประธานคณะกรรมการ",
      "description": "เจ้าอาวาสวัดไทยพุทธคยา หัวหน้าพระธรรมทูตสายประเทศอินเดีย-เนปาล",
      "image_url": "/images/comm2.jpg",
      "level": 2
    }
  ]
}
```

---

### 3. ข้อมูลสำนักงาน (Offices API)

#### `GET /backend/api.php?endpoint=offices`

ดึงข้อมูลสำนักงานใหญ่และศูนย์ประสานงาน

##### ตัวอย่าง Request:
```http
GET /backend/api.php?endpoint=offices
```

##### ตัวอย่าง Response:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "สำนักงานใหญ่ ศ.ต.ภ. (ศูนย์ประสานงานส่วนกลาง)",
      "address": "วัดสระเกศราชวรมหาวิหาร แขวงบ้านบาตร เขตป้อมปราบศัตรูพ่าย กรุงเทพมหานคร 10100",
      "phone": "02-621-1085, 02-621-1086",
      "hours": "วันจันทร์ - วันศุกร์ เวลา 08.30 - 16.30 น.",
      "type": "สำนักงานใหญ่"
    },
    {
      "id": 2,
      "name": "ศูนย์อำนวยความสะดวกหนังสือเดินทาง (วัดประยุรวงศาวาส)",
      "address": "วัดประยุรวงศาวาสวรวิหาร แขวงวัดกัลยาณ์ เขตธนบุรี กรุงเทพมหานคร 10600",
      "phone": "02-465-5592",
      "hours": "วันจันทร์ - วันเสาร์ เวลา 09.00 - 16.00 น.",
      "type": "ศูนย์ประสานงาน"
    }
  ]
}
```

---

### 4. ประกาศผลการอนุมัติ (Announcements API)

#### `GET /backend/api.php?endpoint=announcements`

ค้นหารายชื่อพระภิกษุสามเณรที่ได้รับการอนุมัติการเดินทาง พร้อมระบบแบ่งหน้า

##### Query Parameters:
| พารามิเตอร์ | ชนิดข้อมูล | ค่าเริ่มต้น | คำอธิบาย |
|---|---|---|---|
| `search` | String | `""` | ค้นหาจากชื่อพระ, วัดต้นสังกัด, ประเทศปลายทาง หรือเลขที่ประกาศ |
| `page` | Integer | `1` | หมายเลขหน้าที่ต้องการดึงข้อมูล |
| `limit` | Integer | `10` | จำนวนรายการต่อหน้า |

##### ตัวอย่าง Request:
```http
GET /backend/api.php?endpoint=announcements&search=สหรัฐอเมริกา&page=1&limit=10
```

##### ตัวอย่าง Response:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "announcement_id": 1,
      "monk_name": "พระมหาบุญช่วย ปญฺญาวชิโร",
      "temple": "วัดสระเกศราชวรมหาวิหาร",
      "destination": "วัดไทยลอสแองเจลิส รัฐแคลิฟอร์เนีย สหรัฐอเมริกา",
      "approve_date": "๑๒ ก.ค. ๒๕๖๙",
      "announcement_number": "ศ.ต.ภ. ๕/๒๕๖๙",
      "topic": "อนุมัติพระภิกษุสามเณรเดินทางไปปฏิบัติศาสนกิจในต่างประเทศ ประจำงวดเดือนกรกฎาคม ๒๕๖๙"
    }
  ],
  "pagination": {
    "total_items": 45,
    "current_page": 1,
    "limit": 10,
    "total_pages": 5
  }
}
```

---

### 5. ติดตามสถานะคำขอ (Status Tracking API)

#### `GET /backend/api.php?endpoint=status`

ตรวจสอบสถานะคำขอผ่านรหัสติดตาม

##### Query Parameters:
| พารามิเตอร์ | ชนิดข้อมูล | จำเป็น | คำอธิบาย |
|---|---|---|---|
| `tracking_number` | String | **จำเป็น** | รหัสติดตามคำขอ (เช่น `ST-2026-0001`) |

##### ตัวอย่าง Request:
```http
GET /backend/api.php?endpoint=status&tracking_number=ST-2026-0001
```

##### ตัวอย่าง Response (พบข้อมูล):
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "tracking_number": "ST-2026-0001",
    "monk_name": "พระสมุห์เอกชัย กิตฺติญาโณ",
    "temple": "วัดประยุรวงศาวาสวรวิหาร",
    "destination": "วัดพุทธาวาส รัฐเท็กซัส สหรัฐอเมริกา",
    "status": "เสนอคณะกรรมการ ศ.ต.ภ. พิจารณา",
    "step": 3,
    "updated_at": "2026-07-14 10:30"
  }
}
```

##### ตัวอย่าง Response (ไม่พบข้อมูล):
```json
{
  "status": "error",
  "message": "ไม่พบข้อมูลรหัสติดตามนี้ในระบบ กรุณาตรวจสอบอีกครั้ง"
}
```

---

### 6. ยื่นคำร้องขออนุมัติออนไลน์ (Submit Application API)

#### `POST /backend/api.php?endpoint=submit_application`

ยื่นคำร้องขออนุมัติเดินทางไปต่างประเทศออนไลน์

##### Headers:
```http
Content-Type: application/json
```

##### Request Body:
```json
{
  "monk_name": "พระมหาธนภัทร ฐิตสิริ",
  "temple": "วัดพระเชตุพนวิมลมังคลาราม",
  "destination": "วัดไทยกรุงวอชิงตัน ดี.ซี. สหรัฐอเมริกา"
}
```

##### ตัวอย่าง Response (สำเร็จ):
```json
{
  "status": "success",
  "message": "ยื่นคำขอเรียบร้อยแล้ว",
  "data": {
    "tracking_number": "ST-2026-0006",
    "monk_name": "พระมหาธนภัทร ฐิตสิริ",
    "temple": "วัดพระเชตุพนวิมลมังคลาราม",
    "destination": "วัดไทยกรุงวอชิงตัน ดี.ซี. สหรัฐอเมริกา",
    "status": "ยื่นคำขอเข้าระบบ / รอตรวจสอบเอกสาร",
    "step": 1,
    "updated_at": "2026-09-06 13:00"
  }
}
```

---

## 🔒 ความปลอดภัยและข้อแนะนำ (Security Best Practices)

1. **SQL Injection Protection**: ใช้ PDO Prepared Statements ในทุก Query ที่มีการรับพารามิเตอร์จากภายนอก
2. **Input Sanitization**: ตรวจสอบและ Trim ค่าพารามิเตอร์ก่อนบันทึกหรือประมวลผล
3. **Environment Security**: ไฟล์ `.env` ควรถูกป้องกันไม่ให้เปิดอ่านผ่านเว็บตรงๆ ใน Production Web Server (กำหนดใน `.htaccess` หรือ Nginx config)
