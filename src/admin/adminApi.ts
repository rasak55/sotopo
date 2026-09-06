import {
  AdminUser,
  AdminStats,
  ApplicationItem,
  NewsItem,
  AnnouncementItem,
  CommitteeItem,
  OfficeItem
} from './adminTypes'

const BASE_URL = import.meta.env.BASE_URL || '/'
const API_BASE = BASE_URL.endsWith('/') ? `${BASE_URL}backend/api.php` : `${BASE_URL}/backend/api.php`

export const getAssetUrl = (path: string) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return BASE_URL.endsWith('/') ? `${BASE_URL}${cleanPath}` : `${BASE_URL}/${cleanPath}`
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem('sotopo_admin_token')
}

export const setAuthToken = (token: string) => {
  localStorage.setItem('sotopo_admin_token', token)
}

export const clearAuthToken = () => {
  localStorage.removeItem('sotopo_admin_token')
  localStorage.removeItem('sotopo_admin_user')
}

export const getStoredAdminUser = (): AdminUser | null => {
  const user = localStorage.getItem('sotopo_admin_user')
  return user ? JSON.parse(user) : null
}

export const setStoredAdminUser = (user: AdminUser) => {
  localStorage.setItem('sotopo_admin_user', JSON.stringify(user))
}

const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    throw new Error(`HTTP Error ${res.status}`)
  }
  return await res.json()
}

// 1. Auth API
export const adminLogin = async (username: string, password: string): Promise<{ token: string; admin: AdminUser }> => {
  const res = await authFetch(`${API_BASE}?endpoint=admin_login`, {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })
  if (res.status !== 'success') {
    throw new Error(res.message || 'Login failed')
  }
  setAuthToken(res.token)
  setStoredAdminUser(res.admin)
  return res
}

export const adminVerify = async (): Promise<AdminUser> => {
  const res = await authFetch(`${API_BASE}?endpoint=admin_verify`)
  if (res.status !== 'success') {
    clearAuthToken()
    throw new Error(res.message || 'Session expired')
  }
  return res.admin
}

// 2. Stats API
export const adminGetStats = async (): Promise<AdminStats> => {
  const res = await authFetch(`${API_BASE}?endpoint=admin_stats`)
  if (res.status !== 'success') {
    throw new Error(res.message || 'Failed to fetch stats')
  }
  return res.data
}

// 3. Applications API
export const adminGetApplications = async (search = '', step = 0): Promise<ApplicationItem[]> => {
  const params = new URLSearchParams()
  params.append('endpoint', 'admin_applications')
  if (search) params.append('search', search)
  if (step > 0) params.append('step', step.toString())

  const res = await authFetch(`${API_BASE}?${params.toString()}`)
  if (res.status !== 'success') {
    throw new Error(res.message || 'Failed to fetch applications')
  }
  return res.data
}

export const adminSaveApplication = async (app: Partial<ApplicationItem>): Promise<any> => {
  const res = await authFetch(`${API_BASE}?endpoint=admin_save_application`, {
    method: 'POST',
    body: JSON.stringify(app)
  })
  if (res.status !== 'success') {
    throw new Error(res.message || 'Failed to save application')
  }
  return res
}

export const adminDeleteApplication = async (id: number): Promise<any> => {
  const res = await authFetch(`${API_BASE}?endpoint=admin_delete_application`, {
    method: 'POST',
    body: JSON.stringify({ id })
  })
  if (res.status !== 'success') {
    throw new Error(res.message || 'Failed to delete application')
  }
  return res
}

// 4. News API
export const adminGetNews = async (): Promise<NewsItem[]> => {
  const res = await authFetch(`${API_BASE}?endpoint=admin_news`)
  if (res.status !== 'success') {
    throw new Error(res.message || 'Failed to fetch news')
  }
  return res.data
}

export const adminSaveNews = async (news: Partial<NewsItem>): Promise<any> => {
  const res = await authFetch(`${API_BASE}?endpoint=admin_save_news`, {
    method: 'POST',
    body: JSON.stringify(news)
  })
  if (res.status !== 'success') {
    throw new Error(res.message || 'Failed to save news')
  }
  return res
}

export const adminDeleteNews = async (id: number): Promise<any> => {
  const res = await authFetch(`${API_BASE}?endpoint=admin_delete_news`, {
    method: 'POST',
    body: JSON.stringify({ id })
  })
  if (res.status !== 'success') {
    throw new Error(res.message || 'Failed to delete news')
  }
  return res
}

// 5. Announcements API
export const adminGetAnnouncements = async (): Promise<AnnouncementItem[]> => {
  const res = await authFetch(`${API_BASE}?endpoint=admin_announcements`)
  if (res.status !== 'success') {
    throw new Error(res.message || 'Failed to fetch announcements')
  }
  return res.data
}

export const adminSaveAnnouncement = async (item: Partial<AnnouncementItem>): Promise<any> => {
  const res = await authFetch(`${API_BASE}?endpoint=admin_save_announcement`, {
    method: 'POST',
    body: JSON.stringify(item)
  })
  if (res.status !== 'success') {
    throw new Error(res.message || 'Failed to save announcement')
  }
  return res
}

export const adminDeleteAnnouncement = async (id: number): Promise<any> => {
  const res = await authFetch(`${API_BASE}?endpoint=admin_delete_announcement`, {
    method: 'POST',
    body: JSON.stringify({ id })
  })
  if (res.status !== 'success') {
    throw new Error(res.message || 'Failed to delete announcement')
  }
  return res
}

// 6. Committees API
export const adminGetCommittees = async (): Promise<CommitteeItem[]> => {
  const res = await authFetch(`${API_BASE}?endpoint=committees`)
  if (res.status !== 'success') {
    throw new Error(res.message || 'Failed to fetch committees')
  }
  return res.data
}

export const adminSaveCommittee = async (item: Partial<CommitteeItem>): Promise<any> => {
  const res = await authFetch(`${API_BASE}?endpoint=admin_save_committee`, {
    method: 'POST',
    body: JSON.stringify(item)
  })
  if (res.status !== 'success') {
    throw new Error(res.message || 'Failed to save committee member')
  }
  return res
}

export const adminDeleteCommittee = async (id: number): Promise<any> => {
  const res = await authFetch(`${API_BASE}?endpoint=admin_delete_committee`, {
    method: 'POST',
    body: JSON.stringify({ id })
  })
  if (res.status !== 'success') {
    throw new Error(res.message || 'Failed to delete committee member')
  }
  return res
}

// 7. Offices API
export const adminGetOffices = async (): Promise<OfficeItem[]> => {
  const res = await authFetch(`${API_BASE}?endpoint=offices`)
  if (res.status !== 'success') {
    throw new Error(res.message || 'Failed to fetch offices')
  }
  return res.data
}

export const adminSaveOffice = async (item: Partial<OfficeItem>): Promise<any> => {
  const res = await authFetch(`${API_BASE}?endpoint=admin_save_office`, {
    method: 'POST',
    body: JSON.stringify(item)
  })
  if (res.status !== 'success') {
    throw new Error(res.message || 'Failed to save office')
  }
  return res
}

export const adminDeleteOffice = async (id: number): Promise<any> => {
  const res = await authFetch(`${API_BASE}?endpoint=admin_delete_office`, {
    method: 'POST',
    body: JSON.stringify({ id })
  })
  if (res.status !== 'success') {
    throw new Error(res.message || 'Failed to delete office')
  }
  return res
}

// 8. Settings API
export const adminChangePassword = async (data: { old_password?: string; new_password?: string; full_name?: string }): Promise<any> => {
  const res = await authFetch(`${API_BASE}?endpoint=admin_change_password`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
  if (res.status !== 'success') {
    throw new Error(res.message || 'Failed to update settings')
  }
  return res
}
