import React, { useState } from 'react'
import { AdminUser } from './adminTypes'

interface AdminLayoutProps {
  user: AdminUser
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
  onBackToPublic: () => void
  children: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  user,
  activeTab,
  onTabChange,
  onLogout,
  onBackToPublic,
  children
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const navItems = [
    { id: 'dashboard', label: 'แผงควบคุมภาพรวม', icon: 'dashboard' },
    { id: 'applications', label: 'จัดการคำขอเดินทาง', icon: 'assignment' },
    { id: 'news', label: 'จัดการข่าวสารและกิจกรรม', icon: 'newspaper' },
    { id: 'announcements', label: 'จัดการประกาศผลและรายชื่อ', icon: 'campaign' },
    { id: 'committees', label: 'ทำเนียบคณะกรรมการ', icon: 'groups' },
    { id: 'offices', label: 'ข้อมูลสำนักงานและจุดติดต่อ', icon: 'apartment' },
    { id: 'settings', label: 'ตั้งค่าผู้ใช้งานและรหัสผ่าน', icon: 'manage_accounts' }
  ]

  const handleNavClick = (id: string) => {
    onTabChange(id)
    setMobileSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#f7f6f4] text-[#1e1e1e] flex font-sans">
      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-[#1c1303] text-white flex flex-col z-50 transition-transform duration-300 ease-in-out border-r border-[#3a2707] shadow-xl ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-6 border-b border-[#3a2707] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="ศ.ต.ภ. Logo" className="h-10 w-auto object-contain" />
            <div>
              <div className="font-bold text-lg text-[#ffb957] font-be-vietnam tracking-wide">ศ.ต.ภ. ADMIN</div>
              <div className="text-xs text-white/60">ศูนย์ควบคุมการไปต่างประเทศ</div>
            </div>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden text-white/70 hover:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* User Info Badge */}
        <div className="p-4 mx-4 my-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-[#f9a825] flex items-center justify-center text-white font-bold text-sm shadow-md">
            {user.full_name ? user.full_name.charAt(0) : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{user.full_name || user.username}</div>
            <div className="text-xs text-[#ffb957] uppercase tracking-wider font-mono font-medium">{user.role}</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-[#9c6500] text-white shadow-md shadow-primary/20 font-semibold'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={`material-symbols-outlined text-xl ${isActive ? 'text-white' : 'text-white/60'}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer Actions */}
        <div className="p-4 border-t border-[#3a2707] space-y-2">
          <button
            onClick={onBackToPublic}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold transition"
          >
            <span className="material-symbols-outlined text-base">public</span>
            <span>ดูหน้าเว็บสาธารณะ</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-semibold transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900 capitalize">
                {navItems.find((n) => n.id === activeTab)?.label || 'แผงควบคุม'}
              </h2>
              <div className="text-xs text-gray-500">ระบบบริหารจัดการและกำกับดูแล ศ.ต.ภ.</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 bg-gray-100 py-1.5 px-3 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>เซิร์ฟเวอร์พร้อมใช้งาน</span>
            </div>

            <button
              onClick={onBackToPublic}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-xs font-medium text-gray-700 transition"
              title="เปิดดูหน้าเว็บหลัก"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              <span>หน้าเว็บไซต์</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
