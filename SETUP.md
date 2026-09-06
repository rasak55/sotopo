# คู่มือการติดตั้งและตั้งค่าระบบ (Setup & Installation Guide)

เอกสารนี้อธิบายขั้นตอนการติดตั้ง การกำหนดค่าสภาพแวดล้อม และการรันระบบ **ศ.ต.ภ. (SOTOPO)** ทั้งในสภาพแวดล้อม Development และ Production

---

## 1. ความต้องการของระบบ (Prerequisites)

ก่อนเริ่มการติดตั้ง กรุณาตรวจสอบว่าเครื่องของท่านติดตั้งซอฟต์แวร์ต่อไปนี้เรียบร้อยแล้ว:

| ซอฟต์แวร์ | เวอร์ชันขั้นต่ำที่แนะนำ | รายละเอียด |
|---|---|---|
| **Node.js** | v18.0.0 หรือใหม่กว่า | รัน Vite และจัดการ Frontend Packages |
| **npm** | v9.0.0 หรือใหม่กว่า | Node Package Manager (มาพร้อม Node.js) |
| **PHP** | v8.0 หรือใหม่กว่า | รัน Backend API (รองรับ `pdo_mysql`, `pdo_sqlite`) |
| **MySQL / MariaDB** | MySQL 5.7+ / 8.0+ หรือ MariaDB 10.4+ | ฐานข้อมูลหลัก (ผ่าน XAMPP, Laragon, MAMP หรือ Native) |
| **Web Server (Optional)** | Apache / Nginx | สำหรับ Host Backend API ในสภาพแวดล้อมจริง |

---

## 2. ขั้นตอนการติดตั้ง (Installation Steps)

### ขั้นตอนที่ 1: ดึงโค้ดโปรเจกต์ (Clone Repository)
```bash
git clone https://github.com/rasak55/sotopo.git
cd sotopo
```

### ขั้นตอนที่ 2: ติดตั้ง Node Modules
ติดตั้ง dependencies ที่จำเป็นสำหรับ Frontend:
```bash
npm install
```

### ขั้นตอนที่ 3: กำหนดค่าไฟล์ Environment (.env)
คัดลอกไฟล์ `.env.example` ไปเป็น `.env`:
```bash
cp .env.example .env
```
เปิดไฟล์ `.env` และแก้ไขการตั้งค่าให้ตรงกับ MySQL ในเครื่องของท่าน:
```env
# Database Connection
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=sotopo
DB_USER=root
DB_PASS=
```
> **หมายเหตุ**: หากใช้ XAMPP ปกติค่า `DB_USER` จะเป็น `root` และ `DB_PASS` จะเว้นว่างไว้ พอร์ตมาตรฐานคือ `3306`

---

## 3. การติดตั้งและนำเข้าฐานข้อมูล (Database Setup)

### วิธีที่ 1: นำเข้าผ่าน Command Line (CLI)
สร้างฐานข้อมูลและนำเข้าข้อมูล Seed เริ่มต้นด้วยคำสั่งเดียว:
```bash
mysql -u root -p < mysql.sql
```
*(หากไม่มีรหัสผ่าน ให้กด Enter ข้ามได้ทันที)*

### วิธีที่ 2: นำเข้าผ่าน phpMyAdmin (XAMPP / Laragon / MAMP)
1. เปิดบราวเซอร์ไปที่ `http://localhost/phpmyadmin/`
2. คลิกเมนู **Import** (นำเข้า) ด้านบน
3. คลิก **Choose File** (เลือกไฟล์) และเลือกไฟล์ `mysql.sql` ที่อยู่ในโฟลเดอร์โปรเจกต์
4. คลิกปุ่ม **Go** (ดำเนินการ) ด้านล่าง
5. ระบบจะสร้างฐานข้อมูล `sotopo` พร้อมตารางและข้อมูลตัวอย่าง 6 ตารางให้อัตโนมัติ

---

## 4. การรันระบบในสภาพแวดล้อม Development (Local Running)

### การรัน Frontend (Vite)
รันคำสั่ง:
```bash
npm run dev
```
ผลลัพธ์:
```text
  VITE v6.0.0  ready in 250 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```
เปิดบราวเซอร์ไปที่ `http://localhost:5173/`

### การรัน Backend PHP
คุณสามารถเลือกวิธีการรัน Backend ได้ 2 รูปแบบ:

#### แบบที่ 1: วางโปรเจกต์ใน Web Server (เช่น XAMPP `htdocs`)
หากโฟลเดอร์โปรเจกต์อยู่ใน `htdocs` (เช่น `C:/xampp/htdocs/sotopo/` หรือ `/Applications/XAMPP/htdocs/sotopo/`)
- Backend API จะทำงานที่ URL: `http://localhost/sotopo/backend/api.php`
- เมื่อรัน Vite Frontend จะสามารถเรียกเชื่อมต่อ Backend ได้ทันที

#### แบบที่ 2: ใช้ PHP Built-in Server สำหรับทดสอบ
หากต้องการรัน PHP Server แยกต่างหากที่ Root โปรเจกต์:
```bash
php -S 127.0.0.1:8000
```
- ทดสอบทดลองเรียกดู API: `http://127.0.0.1:8000/backend/api.php?endpoint=news`

---

## 5. การ Build สำหรับ Production (Production Deployment)

### 1. Build Frontend
สร้างไฟล์ Production Bundle สำหรับ Static Web Hosting:
```bash
npm run build
```
ผลลัพธ์จะถูกสร้างไว้ในโฟลเดอร์ `dist/`

### 2. นำไฟล์ขึ้น Production Server
1. คัดลอกเนื้อหาทั้งหมดในโฟลเดอร์ `dist/` ไปไว้ที่ Root Web Directory ของ Web Server (เช่น `/var/www/html/` หรือ `public_html/`)
2. คัดลอกโฟลเดอร์ `backend/` และไฟล์ `.env` ไปไว้ใน Web Server
3. ตรวจสอบว่า PHP Extension `pdo_mysql` เปิดใช้งานใน `php.ini` บน Server เรียบร้อยแล้ว
4. นำเข้าไฟล์ `mysql.sql` เข้า MySQL บน Production Database

---

## 6. การแก้ไขปัญหาที่พบบ่อย (Troubleshooting)

### ❓ ปัญหาที่ 1: เชื่อมต่อฐานข้อมูลไม่สำเร็จ ("Database connection failed")
- **สาเหตุ**: Service MySQL ยังไม่ได้สตาร์ท หรือข้อมูลการเชื่อมต่อใน `.env` ไม่ถูกต้อง
- **วิธีแก้**:
  1. ตรวจสอบว่า MySQL Server เปิดทำงานอยู่
  2. ตรวจสอบชื่อ Host, Port, Database, User, Password ในไฟล์ `.env`
  3. หากพอร์ต MySQL ชนกัน (เช่นเปลี่ยนไปใช้ 3307) ให้ระบุ `DB_PORT=3307` ใน `.env`

### ❓ ปัญหาที่ 2: ติดปัญหา CORS (Cross-Origin Resource Sharing)
- **สาเหตุ**: มีการย้ายโดเมนหรือเปิดผ่านพอร์ตที่ผิดปกติ
- **วิธีแก้**: ตรวจสอบที่หัวไฟล์ `backend/api.php` ว่ามี Header อนุญาต CORS เรียบร้อย (`header("Access-Control-Allow-Origin: *");`)

### ❓ ปัญหาที่ 3: หน้าจอแสดงผลไม่ถูกต้อง หรือ Style ไม่โหลด
- **สาเหตุ**: มีการบล็อก CDN หรือเชื่อมต่ออินเทอร์เน็ตไม่ได้ (Tailwind CSS CDN และ Google Fonts)
- **วิธีแก้**: ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต เนื่องจาก `index.html` โหลดฟอนต์และ CDN Tailwind

---

หากมีข้อสงสัยหรือพบปัญหาเพิ่มเติม สามารถดูรายละเอียด API ได้ที่ [API.md](./API.md) หรือฐานข้อมูลที่ [DATABASE.md](./DATABASE.md)
