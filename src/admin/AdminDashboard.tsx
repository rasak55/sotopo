import React, { useEffect, useState } from 'react'
import { adminGetStats } from './adminApi'
import { AdminStats } from './adminTypes'

interface AdminDashboardProps {
  onNavigate: (tab: string) => void
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminGetStats()
      setStats(data)
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถโหลดข้อมูลสถิติได้')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm">กำลังโหลดข้อมูลภาพรวม...</p>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl text-red-500">error</span>
          <span>{error || 'เกิดข้อผิดพลาดในการโหลดข้อมูล'}</span>
        </div>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    )
  }

  const getStepBadge = (step: number) => {
    switch (step) {
      case 1:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">1. ยื่นคำขอ</span>
      case 2:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">2. ตรวจสอบเอกสาร</span>
      case 3:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">3. เสนอ กก. ศ.ต.ภ.</span>
      case 4:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">4. อนุมัติเรียบร้อย</span>
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">รอดำเนินการ</span>
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Actions Bar */}
      <div className="bg-gradient-to-r from-[#2c1d04] via-[#422c06] to-[#1e1302] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-medium mb-3 backdrop-blur-xs">
            <span className="material-symbols-outlined text-sm">verified</span>
            <span>ระบบศูนย์บัญชาการข้อมูล ศ.ต.ภ.</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-sans tracking-tight">
            ยินดีต้อนรับสู่แผงควบคุมผู้ดูแลระบบ
          </h1>
          <p className="text-white/70 text-sm mt-1 max-w-xl">
            จัดการคำขอเดินทางไปต่างประเทศของพระภิกษุสามเณร ข่าวสาร มติมหาเถรสมาคม และข้อมูลคณะกรรมการแบบเรียลไทม์
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => onNavigate('applications')}
            className="px-4 py-2.5 bg-primary hover:bg-[#a66b00] text-white rounded-xl text-xs font-bold transition shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>จัดการคำขอ</span>
          </button>
          <button
            onClick={() => onNavigate('news')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 backdrop-blur-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">post_add</span>
            <span>เพิ่มข่าวสาร</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Applications */}
        <div
          onClick={() => onNavigate('applications')}
          className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition duration-200">
              <span className="material-symbols-outlined text-2xl">assignment</span>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-gray-100 text-gray-600">ทั้งหมด</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{stats.total_applications}</div>
          <div className="text-xs font-medium text-gray-500 mt-1">คำขอเดินทางทั้งหมดในระบบ</div>
        </div>

        {/* Card 2: Pending Applications */}
        <div
          onClick={() => onNavigate('applications')}
          className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition duration-200">
              <span className="material-symbols-outlined text-2xl">pending_actions</span>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-blue-50 text-blue-700">กำลังดำเนินการ</span>
          </div>
          <div className="text-3xl font-extrabold text-blue-600">{stats.pending_applications}</div>
          <div className="text-xs font-medium text-gray-500 mt-1">ขั้นตอนที่ 1 ถึง 3 รอพิจารณา</div>
        </div>

        {/* Card 3: Approved Applications */}
        <div
          onClick={() => onNavigate('applications')}
          className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition duration-200">
              <span className="material-symbols-outlined text-2xl">check_circle</span>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-emerald-50 text-emerald-700">อนุมัติแล้ว</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">{stats.approved_applications}</div>
          <div className="text-xs font-medium text-gray-500 mt-1">ออกหนังสืออนุมัติเรียบร้อย</div>
        </div>

        {/* Card 4: News & Announcements */}
        <div
          onClick={() => onNavigate('news')}
          className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition duration-200">
              <span className="material-symbols-outlined text-2xl">newspaper</span>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-purple-50 text-purple-700">สื่อสาร</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{stats.total_news}</div>
          <div className="text-xs font-medium text-gray-500 mt-1">ข่าวสาร / {stats.total_announcements} ประกาศมติ</div>
        </div>
      </div>

      {/* 4 Steps Breakdown Cards */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">conversion_path</span>
          <span>สถิติตามขั้นตอนการดำเนินงาน 4 ขั้นตอน (Workflow Pipeline)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-amber-800">ขั้นตอนที่ 1: ยื่นคำขอ</div>
              <div className="text-xs text-amber-600">รอตรวจสอบความถูกต้อง</div>
            </div>
            <div className="text-2xl font-bold text-amber-800">{stats.step1_count}</div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-blue-800">ขั้นตอนที่ 2: ตรวจสอบ</div>
              <div className="text-xs text-blue-600">ตรวจเอกสาร & คุณสมบัติ</div>
            </div>
            <div className="text-2xl font-bold text-blue-800">{stats.step2_count}</div>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-purple-800">ขั้นตอนที่ 3: เสนอพิจารณา</div>
              <div className="text-xs text-purple-600">ที่ประชุม กก. ศ.ต.ภ.</div>
            </div>
            <div className="text-2xl font-bold text-purple-800">{stats.step3_count}</div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-emerald-800">ขั้นตอนที่ 4: อนุมัติ</div>
              <div className="text-xs text-emerald-600">ออกหนังสือรับรอง</div>
            </div>
            <div className="text-2xl font-bold text-emerald-800">{stats.step4_count}</div>
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">คำขอเดินทางล่าสุด (Recent Submissions)</h3>
            <p className="text-xs text-gray-500">รายการคำขอล่าสุดที่ยื่นเข้าสู่ระบบ ศ.ต.ภ.</p>
          </div>
          <button
            onClick={() => onNavigate('applications')}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>ดูทั้งหมด ({stats.total_applications})</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-xs uppercase font-semibold text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3.5">รหัสติดตาม</th>
                <th className="px-6 py-3.5">พระภิกษุ / วัดต้นสังกัด</th>
                <th className="px-6 py-3.5">ปลายทาง</th>
                <th className="px-6 py-3.5">สถานะ</th>
                <th className="px-6 py-3.5">วันที่อัปเดต</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.recent_applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    ยังไม่มีรายการคำขอในระบบ
                  </td>
                </tr>
              ) : (
                stats.recent_applications.map((app) => (
                  <tr key={app.id} className="hover:bg-amber-50/30 transition">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 text-xs">
                      {app.tracking_number}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{app.monk_name}</div>
                      <div className="text-xs text-gray-500">{app.temple}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-700">
                      {app.destination}
                    </td>
                    <td className="px-6 py-4">
                      {getStepBadge(app.step)}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {app.updated_at}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
