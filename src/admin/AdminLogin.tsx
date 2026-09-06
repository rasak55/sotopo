import React, { useState } from 'react'
import { adminLogin, getAssetUrl } from './adminApi'
import { AdminUser } from './adminTypes'

interface AdminLoginProps {
  onLoginSuccess: (user: AdminUser) => void
  onBackToPublic: () => void
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToPublic }) => {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await adminLogin(username.trim(), password.trim())
      onLoginSuccess(res.admin)
    } catch (err: any) {
      setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1302] via-[#2a1b07] to-[#120b02] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Subtle decorative background circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#f9a825]/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-primary/20 p-8 z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary to-[#ffb957] p-3 shadow-lg shadow-primary/30 mb-4">
            <img src={getAssetUrl('/images/logo.png')} alt="ศ.ต.ภ. Logo" className="w-full h-full object-contain filter drop-shadow" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ระบบจัดการข้อมูล ศ.ต.ภ.</h1>
          <p className="text-sm text-gray-600 mt-1 font-medium">เข้าสู่ระบบสำหรับเจ้าหน้าที่และผู้ดูแลระบบ (Admin Portal)</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm animate-shake">
            <span className="material-symbols-outlined text-red-500 text-lg flex-shrink-0 mt-0.5">error</span>
            <div>{error}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              ชื่อผู้ใช้งาน (Username)
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                person
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน..."
                className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Quick Demo Credentials hint */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber-700 text-base">key</span>
              <span>บัญชีเริ่มต้น: <strong>admin</strong> / <strong>admin123</strong></span>
            </div>
            <button
              type="button"
              onClick={() => {
                setUsername('admin')
                setPassword('admin123')
              }}
              className="text-primary hover:underline font-semibold"
            >
              เติมอัตโนมัติ
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-primary to-[#b87700] hover:from-[#6b4500] hover:to-primary text-white font-semibold rounded-xl shadow-lg shadow-primary/30 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>กำลังเข้าสู่ระบบ...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl">login</span>
                <span>เข้าสู่ระบบจัดการ</span>
              </>
            )}
          </button>
        </form>

        {/* Back to public link */}
        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <button
            onClick={onBackToPublic}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary transition"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>กลับสู่หน้าหลักเว็บไซต์ ศ.ต.ภ.</span>
          </button>
        </div>
      </div>
    </div>
  )
}
