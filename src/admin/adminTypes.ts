export interface AdminUser {
  id: number
  username: string
  full_name: string
  role: string
}

export interface AdminStats {
  total_applications: number
  pending_applications: number
  approved_applications: number
  step1_count: number
  step2_count: number
  step3_count: number
  step4_count: number
  total_news: number
  total_announcements: number
  total_approved_monks: number
  total_committees: number
  recent_applications: ApplicationItem[]
}

export interface ApplicationItem {
  id: number
  tracking_number: string
  monk_name: string
  temple: string
  destination: string
  status: string
  step: number
  updated_at: string
}

export interface NewsItem {
  id: number
  tag: string
  date: string
  title: string
  summary: string
  content?: string
  image_url: string
}

export interface ApprovedMonkItem {
  id?: number
  announcement_id?: number
  monk_name: string
  temple: string
  destination: string
  approve_date: string
}

export interface AnnouncementItem {
  id: number
  announcement_number: string
  topic: string
  approve_date: string
  monk_count?: number
  monks?: ApprovedMonkItem[]
}

export interface CommitteeItem {
  id: number
  name: string
  role: string
  description: string
  image_url: string
  level: number
}

export interface OfficeItem {
  id: number
  name: string
  address: string
  phone: string
  hours: string
  type: string
}
