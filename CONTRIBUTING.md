# แนวทางการมีส่วนร่วมในการพัฒนา (Contributing Guidelines)

ขอขอบคุณทุกท่านที่สนใจร่วมพัฒนาและปรับปรุงระบบ **ศ.ต.ภ. (SOTOPO)** เพื่อให้การทำงานร่วมกันเป็นระเบียบ เรียบร้อย และมีประสิทธิภาพสูงสุด กรุณาปฏิบัติตามแนวทางด้านล่างนี้

---

## 🌿 กระบวนการทำงานกับ Git (Git Workflow)

1. **Fork หรือสร้าง Branch ใหม่** จาก Branch `main`:
   ```bash
   git checkout -b feature/your-feature-name
   # หรือ
   git checkout -b fix/your-bugfix-name
   ```
2. **การตั้งชื่อ Commit (Conventional Commits)**:
   - `feat:` เพิ่มฟีเจอร์หรือความสามารถใหม่
   - `fix:` แก้ไขบั๊กหรือข้อผิดพลาด
   - `docs:` แก้ไขหรือเพิ่มเอกสารประกอบ (Markdown / Documentation)
   - `style:` ปรับแต่ง UI / CSS / Formatting โดยไม่กระทบ Logic
   - `refactor:` ปรับโครงสร้างโค้ดโดยไม่เปลี่ยนแปลงผลลัพธ์
   - `perf:` ปรับปรุงประสิทธิภาพความเร็วของระบบ
   - `chore:` งานจัดการทั่วไป (Dependencies, Build config)

---

## 💻 มาตรฐานการเขียนโค้ด (Coding Standards)

### Frontend (TypeScript / React)
- ใช้ **Functional Components** และ **React Hooks**
- ระบุ Type หรือ Interface สำหรับ Props และ State อย่างชัดเจน
- ใช้ Utility Classes ของ Tailwind CSS ตาม Palette สีที่กำหนดใน `index.html`
- ตรวจสอบ Type Safety ก่อน Commit:
  ```bash
  npm run build
  ```

### Backend (PHP / SQL)
- เขียนโค้ดตามมาตรฐาน **PSR-12**
- ใช้ **PDO Prepared Statements** เสมอสำหรับทุก Query ที่มี User Input เพื่อป้องกัน SQL Injection
- จัดรูปแบบการตอบกลับให้ตรงตามมาตรฐาน `{ "status": "success" | "error", "data": ... }`
- เข้ารหัสตัวอักษรแบบ **UTF-8 / utf8mb4**

---

## 🧪 การทดสอบก่อนส่ง Pull Request (Pre-PR Checklist)

- [ ] รัน `npm run build` ผ่านโดยไม่มีข้อผิดพลาดของ TypeScript หรือ Vite
- [ ] ทดสอบ Endpoint API ทั้งหมดว่าคืนค่า JSON ที่ถูกต้อง
- [ ] ตรวจสอบว่าไม่มี Credential หรือรหัสผ่านส่วนตัวหลุดเข้าไปใน Commit
- [ ] อัปเดตเอกสารที่เกี่ยวข้อง (เช่น `API.md`, `DATABASE.md` หรือ `CHANGELOG.md`) หากมีการเปลี่ยนแปลงโครงสร้าง
