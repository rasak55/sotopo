import React, { useState } from 'react'
import { adminChangePassword, setStoredAdminUser } from './adminApi'
import { AdminUser } from './adminTypes'

interface AdminSettingsProps {
  user: AdminUser
  onUserUpdated: (user: AdminUser) => void
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ user, onUserUpdated }) => {
  const [fullName, setFullName] = useState(user.full_name || '')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword && newPassword !== confirmPassword) {
      showToast('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน', 'error')
      return
    }

    if (newPassword && newPassword.length < 6) {
      showToast('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร', 'error')
      return
    }

    setSaving(true)
    try {
      await adminChangePassword({
        full_name: fullName,
        old_password: oldPassword || undefined,
        new_password: newPassword || undefined
      })

      const updatedUser = { ...user, full_name: fullName }
      setStoredAdminUser(updatedUser)
      onUserUpdated(updatedUser)

      showToast('บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      showToast(err.message || 'บันทึกล้มเหลว', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold flex items-center gap-2 transition-all ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ตั้งค่าผู้ใช้งานและรหัสผ่าน</h1>
        <p className="text-xs text-gray-500 mt-0.5">แก้ไขข้อมูลส่วนตัวและเปลี่ยนรหัสผ่านเข้าสู่ระบบ</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-[#ffb957] flex items-center justify-center text-white font-bold text-2xl shadow-md">
              {fullName ? fullName.charAt(0) : user.username.charAt(0)}
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{fullName || user.username}</div>
              <div className="text-xs text-gray-500">ชื่อผู้ใช้: <strong className="font-mono text-gray-700">{user.username}</strong> | สิทธิ์: <strong className="text-primary uppercase">{user.role}</strong></div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">ชื่อ-นามสกุล / ตำแหน่งผู้ดูแลระบบ</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="เช่น เจ้าหน้าที่ฝ่ายสารสนเทศ ศ.ต.ภ."
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">lock_reset</span>
              <span>เปลี่ยนรหัสผ่าน (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">รหัสผ่านปัจจุบัน (Old Password)</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านปัจจุบันเพื่อยืนยัน..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">รหัสผ่านใหม่ (New Password)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="อย่างน้อย 6 ตัวอักษร..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">ยืนยันรหัสผ่านใหม่ (Confirm New Password)</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-[#a66b00] text-white text-sm font-semibold shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              <span>บันทึกการตั้งค่า</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
