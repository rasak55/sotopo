# แผนการดำเนินงานและสถาปัตยกรรมเชิงเทคนิค (Technical Implementation Plan)

## โครงการพัฒนาระบบ ศ.ต.ภ. (SOTOPO)

---

## 🎯 1. ภาพรวมแผนงาน (Plan Overview)

แผนการดำเนินงานนี้จัดทำขึ้นเพื่อเป็นกรอบการพัฒนาและบำรุงรักษาระบบ **ศูนย์ควบคุมการไปต่างประเทศของพระภิกษุสามเณร (ศ.ต.ภ.)** ให้ครอบคลุมทั้งระบบหน้าบ้านสำหรับประชาชน/พระภิกษุ และระบบหลังบ้านสำหรับเจ้าหน้าที่ผู้ดูแลระบบ

---

## 📅 2. ลำดับระยะการพัฒนา (Development Phases)

### Phase 1: การออกแบบและวางโครงสร้างพื้นฐาน (Foundation & UI Design)
- [x] วิเคราะห์ความต้องการและข้อกำหนดของมหาเถรสมาคมและ ศ.ต.ภ.
- [x] กำหนด Palette สี Material Design 3 โทนสีทองจีวรสงฆ์ (`primary: #835400`)
- [x] ออกแบบโครงสร้าง Client-Side Hash Routing ใน React 19 + TypeScript
- [x] วางระบบ Assets, โลโก้, รูปภาพคณะกรรมการ และภาพข่าวสาร

### Phase 2: พัฒนาระบบฐานข้อมูลและ RESTful Backend (Backend & Database)
- [x] ออกแบบฐานข้อมูล MySQL 7 ตาราง พร้อมความสัมพันธ์ Foreign Keys
- [x] สร้าง Data Seeding เริ่มต้นใน `mysql.sql` สำหรับข่าวสาร กรรมการ ประกาศ และคำขอ
- [x] พัฒนา `backend/api.php` รองรับการเชื่อมต่อ PDO MySQL และ Fallback SQLite
- [x] พัฒนาฟังก์ชันจัดการ `.env` และการตั้งค่า CORS Headers

### Phase 3: พัฒนาระบบหน้าบ้านและระบบติดตามสถานะ (Public Portal & Tracking)
- [x] พัฒนาหน้าแรก (HomePage) พร้อมวิดเจ็ตติดตามสถานะ Real-time (Step 1-4)
- [x] พัฒนาระบบยื่นคำร้องขออนุมัติออนไลน์พร้อมออกรหัสติดตามอัตโนมัติ (`ST-YYYY-XXXX`)
- [x] พัฒนาหน้าแสดงข่าวสารพร้อม Modal อ่านฉบับเต็มแบบ Rich Content
- [x] พัฒนาหน้าทะเบียนประกาศผลอนุมัติ (AnnouncementsPage) พร้อมระบบค้นหาและแบ่งหน้า
- [x] พัฒนาหน้าทำเนียบคณะกรรมการ (CommitteePage), ข้อมูลสำนักงาน (OfficePage), ขั้นตอนการเดินทาง (VisaPage) และคู่มือดาวน์โหลด (GuidePage)

### Phase 4: พัฒนาระบบหลังบ้านสำหรับเจ้าหน้าที่ (Admin Back-Office)
- [x] สร้างตาราง `admins` และระบบความปลอดภัย BCrypt Password Hashing
- [x] พัฒนาระบบเข้าสู่ระบบ (`AdminLogin`) และออก Bearer Token HMAC-SHA256
- [x] พัฒนาแผงควบคุมสถิติ (`AdminDashboard`) พร้อมสรุปตัวเลขและ Workflow Pipeline
- [x] พัฒนาระบบจัดการคำขอเดินทาง (`AdminApplications`) พร้อม Quick Step Selector
- [x] พัฒนาระบบจัดการข่าวสาร (`AdminNews`) พร้อมตัวแก้ไข Rich HTML และ Preset รูปภาพ
- [x] พัฒนาระบบจัดการประกาศผลและรายชื่อพระภิกษุ (`AdminAnnouncements`)
- [x] พัฒนาระบบจัดการคณะกรรมการ (`AdminCommittees`) และสำนักงาน (`AdminOffices`)
- [x] พัฒนาระบบตั้งค่าโปรไฟล์และเปลี่ยนรหัสผ่าน (`AdminSettings`)

### Phase 5: การทดสอบ การปรับปรุงประสิทธิภาพ และความปลอดภัย (Hardening & Deployment)
- [x] แก้ไขปัญหา 404 บน Asset Paths ด้วยการครอบ `getAssetUrl()`
- [x] ปรับปรุง Vite Proxy ให้รองรับทั้ง `/sotopo/backend` และ `/backend`
- [x] เชื่อมโยง Symlink โฟลเดอร์โปรเจกต์กับ XAMPP `htdocs`
- [x] ทดสอบการ Build Production (`npm run build`) ผ่าน 100%
- [x] จัดทำเอกสารระบบครบถ้วนและ Backup ขึ้นบน GitHub

---

## 🛠️ 3. แผนการติดตั้งและ Deploy (Deployment Procedure)

### สภาพแวดล้อม Development (Local)
1. ดึงโค้ดจาก Git: `git clone https://github.com/rasak55/sotopo.git`
2. ติดตั้ง Dependencies: `npm install`
3. นำเข้าฐานข้อมูล: `mysql -u root -p < mysql.sql`
4. คัดลอก `.env.example` ไปเป็น `.env` และตั้งค่าการเชื่อมต่อ
5. รัน Dev Server: `npm run dev`

### สภาพแวดล้อม Production Server
1. รัน `npm run build` เพื่อสร้าง Production Bundle ใน `dist/`
2. อัปโหลดไฟล์จาก `dist/` ไปยัง Web Root Directory ของ Server
3. อัปโหลดโฟลเดอร์ `backend/` และไฟล์ `.env`
4. ตั้งค่า Web Server (Apache/Nginx) ให้ชี้ไปยัง Web Root
5. นำเข้า `mysql.sql` บน Production MySQL Server
6. ตรวจสอบว่า PHP Extension `pdo_mysql` เปิดใช้งานใน `php.ini`
