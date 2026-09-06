import React, { useState, useEffect } from 'react'
import { getAuthToken, getStoredAdminUser, clearAuthToken, adminVerify } from './adminApi'
import { AdminUser } from './adminTypes'
import { AdminLogin } from './AdminLogin'
import { AdminLayout } from './AdminLayout'
import { AdminDashboard } from './AdminDashboard'
import { AdminApplications } from './AdminApplications'
import { AdminNews } from './AdminNews'
import { AdminAnnouncements } from './AdminAnnouncements'
import { AdminCommittees } from './AdminCommittees'
import { AdminOffices } from './AdminOffices'
import { AdminSettings } from './AdminSettings'

interface AdminAppProps {
  currentHash: string
  onNavigatePublic: (hash: string) => void
}

export const AdminApp: React.FC<AdminAppProps> = ({ currentHash, onNavigatePublic }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(getStoredAdminUser())
  const [loading, setLoading] = useState(true)

  // Derive subtab from current hash: e.g. '#/admin/news' -> 'news', '#/admin' -> 'dashboard'
  const getSubTabFromHash = (hash: string) => {
    const parts = hash.replace('#/admin', '').replace('/', '').trim()
    return parts || 'dashboard'
  }

  const [activeTab, setActiveTab] = useState(getSubTabFromHash(currentHash))

  useEffect(() => {
    setActiveTab(getSubTabFromHash(currentHash))
  }, [currentHash])

  // Verify auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken()
      if (!token) {
        setAdminUser(null)
        setLoading(false)
        return
      }

      try {
        const user = await adminVerify()
        setAdminUser(user)
      } catch (e) {
        setAdminUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLoginSuccess = (user: AdminUser) => {
    setAdminUser(user)
    window.location.hash = '#/admin/dashboard'
  }

  const handleLogout = () => {
    clearAuthToken()
    setAdminUser(null)
    window.location.hash = '#/admin'
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    window.location.hash = `#/admin/${tab}`
  }

  const handleBackToPublic = () => {
    onNavigatePublic('#/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1c1303] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-[#ffb957] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-white/70">กำลังตรวจสอบสิทธิ์การเข้าใช้งาน ศ.ต.ภ. Admin...</p>
      </div>
    )
  }

  if (!adminUser) {
    return (
      <AdminLogin
        onLoginSuccess={handleLoginSuccess}
        onBackToPublic={handleBackToPublic}
      />
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard onNavigate={handleTabChange} />
      case 'applications':
        return <AdminApplications />
      case 'news':
        return <AdminNews />
      case 'announcements':
        return <AdminAnnouncements />
      case 'committees':
        return <AdminCommittees />
      case 'offices':
        return <AdminOffices />
      case 'settings':
        return <AdminSettings user={adminUser} onUserUpdated={setAdminUser} />
      default:
        return <AdminDashboard onNavigate={handleTabChange} />
    }
  }

  return (
    <AdminLayout
      user={adminUser}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onLogout={handleLogout}
      onBackToPublic={handleBackToPublic}
    >
      {renderContent()}
    </AdminLayout>
  )
}
