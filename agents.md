# คู่มือและข้อกำหนดสำหรับ AI Agent (Agents Guidelines)

เอกสารนี้ระบุบริบท กฎเกณฑ์ มาตรฐานการเขียนโค้ด และแนวทางปฏิบัติสำหรับ AI Coding Assistant และ Agent ที่ร่วมพัฒนาในโปรเจกต์ **ศ.ต.ภ. (SOTOPO)**

---

## 🏛️ 1. อัตลักษณ์และบริบทของโปรเจกต์ (Project Identity & Context)

- **ชื่อโปรเจกต์**: ศ.ต.ภ. - ศูนย์ควบคุมการไปต่างประเทศของพระภิกษุสามเณร (SOTOPO)
- **หน่วยงานต้นสังกัด**: มหาเถรสมาคม, สำนักงานพระพุทธศาสนาแห่งชาติ
- **ภาษาหลักที่ใช้ในการแสดงผล**: ภาษาไทย (ฟอนต์ Sarabun เป็นหลัก ผสาน Be Vietnam Pro สำหรับตัวเลขและภาษาอังกฤษ)
- **โทนสีหลัก (Theme Palette)**:
  - `Primary`: `#835400` (สีทองอร่าม/จีวรสงฆ์เข้ม)
  - `Primary Container`: `#f9a825` (สีทองอำพันสว่าง)
  - `Background`: `#fcf9f8` (สีขาวนวล)
  - `Surface`: `#fcf9f8` / `#ffffff`
  - `Secondary`: `#75584d`
  - `On-Surface`: `#1b1c1c`

---

## 🛠️ 2. มาตรฐานเทคโนโลยีที่ใช้ (Tech Stack & Conventions)

### 2.1 Frontend
- **Framework**: React 19 (Functional Components with Hooks only)
- **Language**: TypeScript (Strict Type Safety, no arbitrary `any`)
- **Bundler / Dev Server**: Vite 6
- **Styling**: Tailwind CSS (ผ่าน Dynamic Tailwind Config ใน `index.html`)
- **Icons**: Google Material Symbols Outlined (`<span className="material-symbols-outlined">icon_name</span>`)
- **Routing**: Client-side Hash Routing (`currentHash` state + `window.location.hash`)
  - หน้าบ้าน: `#/`, `#/committee`, `#/office`, `#/visa`, `#/announcements`, `#/guide`
  - หลังบ้าน: `#/admin`, `#/admin/applications`, `#/admin/news`, `#/admin/announcements`, `#/admin/committees`, `#/admin/offices`, `#/admin/settings`
- **Asset Handling**: ทุกการเรียกรูปภาพจาก `public/` ต้องครอบด้วยฟังก์ชัน `getAssetUrl(path)` เพื่อรองรับ Vite `base: '/sotopo/'`

### 2.2 Backend
- **Language**: PHP 8.x
- **Endpoint Router**: `backend/api.php`
- **Response Protocol**: RESTful JSON (`application/json; charset=UTF-8`)
- **Database Driver**: PDO (PHP Data Objects)
- **Security Standards**:
  - **SQL Injection**: ต้องใช้ Prepared Statements (`$db->prepare(...)` + `$stmt->execute(...)`) เสมอ ห้ามนำตัวแปรไปต่อสตริงใน SQL เด็ดขาด
  - **Password Hashing**: ใช้ `password_hash($pass, PASSWORD_BCRYPT)` และ `password_verify()`
  - **Authentication**: Bearer Token HMAC-SHA256 พร้อมการตรวจสอบเวลาหมดอายุ
  - **CORS**: รองรับ Headers และ HTTP Preflight (`OPTIONS`)

### 2.3 Database
- **Engine**: MySQL 8.x / MariaDB 10.4+ (InnoDB, `utf8mb4_unicode_ci`)
- **Fallback**: SQLite 3 (`backend/database.sqlite`)
- **Migration & Schema**: กำหนดไว้ใน [mysql.sql](./mysql.sql) และ [schema.md](./schema.md)

---

## 📝 3. กฎและข้อบังคับสำหรับ Agent (Agent Behavioral Rules)

1. **การรักษาความสมบูรณ์ของเอกสาร (Documentation Integrity)**:
   - รักษาคอมเมนต์ ดอกเมนต์ และเอกสารที่มีอยู่เดิมอย่างเคร่งครัด
   - เมื่อเพิ่ม แก้ไข หรือเปลี่ยนแปลงฟังก์ชัน ต้องอัปเดตเอกสารที่เกี่ยวข้อง (`API.md`, `DATABASE.md`, `README.md`, `CHANGELOG.md` ฯลฯ)
2. **การจัดการ Path และ Link**:
   - ลิงก์ไฟล์ใน Markdown ต้องใช้รูปแบบ `[filename](file:///absolute/path/to/file)`
   - หลีกเลี่ยง Hardcoded URL ที่ไม่ผ่าน Base URL
3. **การทดสอบความถูกต้องก่อนส่งมอบ (Verification First)**:
   - ตรวจสอบ Type Safety และ Build Bundle ด้วย `npm run build` ทุกครั้ง
   - ตรวจสอบไวยากรณ์ PHP ด้วย `php -l backend/api.php`
4. **การจัดการ Git**:
   - ใช้รูปแบบ **Conventional Commits** (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `chore:`)
   - ตรวจสอบ `git status` ให้แน่ใจว่า Working Tree สะอาด

---

## 📂 4. แผนผังโฟลเดอร์หลัก (Key Directories)

- `src/` : คอมโพเนนต์หน้าบ้านและ Logic การทำงานหลัก
- `src/admin/` : คอมโพเนนต์โมดูลระบบหลังบ้าน (Admin Dashboard, CRUD, Auth)
- `backend/` : RESTful API Controller และ Logic ฝั่งเซิร์ฟเวอร์
- `public/` : Static Assets (รูปภาพโลโก้ กรรมการ ข่าวสาร ภาพหน้าจอ)
