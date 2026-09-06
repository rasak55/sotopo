import React, { useState, useEffect } from 'react'
import {
  adminGetApplications,
  adminSaveApplication,
  adminDeleteApplication
} from './adminApi'
import { ApplicationItem } from './adminTypes'

export const AdminApplications: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stepFilter, setStepFilter] = useState(0)

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [currentApp, setCurrentApp] = useState<Partial<ApplicationItem> | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchApps = async () => {
    setLoading(true)
    try {
      const data = await adminGetApplications(search, stepFilter)
      setApplications(data)
    } catch (err: any) {
      showToast(err.message || 'โหลดข้อมูลล้มเหลว', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApps()
  }, [stepFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchApps()
  }

  const handleOpenCreate = () => {
    setCurrentApp({
      id: 0,
      tracking_number: '',
      monk_name: '',
      temple: '',
      destination: '',
      status: 'ยื่นคำขอเข้าระบบ / รอตรวจสอบเอกสาร',
      step: 1
    })
    setIsEditModalOpen(true)
  }

  const handleOpenEdit = (app: ApplicationItem) => {
    setCurrentApp({ ...app })
    setIsEditModalOpen(true)
  }

  const handleOpenDetail = (app: ApplicationItem) => {
    setCurrentApp({ ...app })
    setIsDetailModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentApp?.monk_name || !currentApp?.temple || !currentApp?.destination) {
      showToast('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', 'error')
      return
    }

    setSaving(true)
    try {
      await adminSaveApplication(currentApp)
      showToast('บันทึกข้อมูลเรียบร้อยแล้ว')
      setIsEditModalOpen(false)
      fetchApps()
    } catch (err: any) {
      showToast(err.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleQuickStepChange = async (app: ApplicationItem, newStep: number) => {
    const statusMap: Record<number, string> = {
      1: 'ยื่นคำขอเข้าระบบ / รอตรวจสอบเอกสาร',
      2: 'ตรวจสอบเอกสารเสร็จสิ้น กำลังเสนอคณะกรรมการ',
      3: 'อยู่ระหว่างเสนอเลขาธิการ ศ.ต.ภ. ลงนาม',
      4: 'อนุมัติเรียบร้อย (รับเอกสารได้ที่ ศ.ต.ภ.)'
    }

    try {
      await adminSaveApplication({
        ...app,
        step: newStep,
        status: statusMap[newStep] || app.status
      })
      showToast(`เปลี่ยนสถานะเป็นขั้นตอนที่ ${newStep} เรียบร้อยแล้ว`)
      fetchApps()
    } catch (err: any) {
      showToast(err.message || 'เปลี่ยนสถานะไม่สำเร็จ', 'error')
    }
  }

  const handleDelete = async (id: number, trackingNumber: string) => {
    if (!window.confirm(`ยืนยันการลบคำขอรหัส ${trackingNumber} ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`)) {
      return
    }

    try {
      await adminDeleteApplication(id)
      showToast('ลบรายการคำขอเรียบร้อยแล้ว')
      fetchApps()
    } catch (err: any) {
      showToast(err.message || 'ลบไม่สำเร็จ', 'error')
    }
  }

  const getStepBadge = (step: number) => {
    switch (step) {
      case 1:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">1. ยื่นคำขอ</span>
      case 2:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">2. ตรวจสอบเอกสาร</span>
      case 3:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">3. เสนอ กก. ศ.ต.ภ.</span>
      case 4:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">4. อนุมัติแล้ว</span>
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">รอดำเนินการ</span>
    }
  }

  return (
    <div className="space-y-6">
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

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการคำขอเดินทางไปต่างประเทศ</h1>
          <p className="text-xs text-gray-500 mt-0.5">รายการคำขอติดตามสถานะทั้งหมดในระบบ ศ.ต.ภ.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-[#a66b00] text-white rounded-xl text-sm font-semibold shadow-md transition cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          <span>เพิ่มคำขอใหม่</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3 justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหารหัสติดตาม, ชื่อพระ, วัด, ปลายทาง..."
            className="w-full pl-10 pr-20 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-gray-200 hover:bg-gray-300 text-xs font-semibold rounded-lg text-gray-700 transition"
          >
            ค้นหา
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-gray-500 flex-shrink-0">กรองตามขั้นตอน:</span>
          {[
            { id: 0, label: 'ทั้งหมด' },
            { id: 1, label: 'ขั้นตอน 1' },
            { id: 2, label: 'ขั้นตอน 2' },
            { id: 3, label: 'ขั้นตอน 3' },
            { id: 4, label: 'ขั้นตอน 4' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStepFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex-shrink-0 cursor-pointer ${
                stepFilter === tab.id
                  ? 'bg-primary text-white font-semibold shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-400 mt-2">กำลังโหลดข้อมูลคำขอ...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">inbox</span>
            <p className="text-sm font-medium">ไม่พบรายการคำขอที่ตรงกับเงื่อนไข</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs uppercase font-semibold text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">รหัสติดตาม</th>
                  <th className="px-6 py-4">ผู้ยื่นคำขอ / วัด</th>
                  <th className="px-6 py-4">ประเทศปลายทาง</th>
                  <th className="px-6 py-4">สถานะ & ขั้นตอน</th>
                  <th className="px-6 py-4">เปลี่ยนขั้นตอนด่วน</th>
                  <th className="px-6 py-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-amber-50/20 transition">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-gray-900 text-xs">{app.tracking_number}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{app.updated_at}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{app.monk_name}</div>
                      <div className="text-xs text-gray-500">{app.temple}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-700">
                      {app.destination}
                    </td>
                    <td className="px-6 py-4">
                      <div>{getStepBadge(app.step)}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">{app.status}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={app.step}
                        onChange={(e) => handleQuickStepChange(app, parseInt(e.target.value))}
                        className="text-xs font-semibold py-1 px-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                      >
                        <option value={1}>1. ยื่นคำขอ</option>
                        <option value={2}>2. ตรวจสอบเอกสาร</option>
                        <option value={3}>3. เสนอ กก. ศ.ต.ภ.</option>
                        <option value={4}>4. อนุมัติแล้ว</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenDetail(app)}
                        className="p-1.5 text-gray-500 hover:text-primary rounded-lg hover:bg-gray-100 transition"
                        title="ดูรายละเอียด"
                      >
                        <span className="material-symbols-outlined text-base">visibility</span>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(app)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 transition"
                        title="แก้ไขข้อมูล"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(app.id, app.tracking_number)}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition"
                        title="ลบคำขอ"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Create Modal */}
      {isEditModalOpen && currentApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {currentApp.id && currentApp.id > 0 ? 'แก้ไขข้อมูลคำขอเดินทาง' : 'เพิ่มคำขอเดินทางใหม่'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {currentApp.id && currentApp.id > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">รหัสติดตาม (Tracking Number)</label>
                  <input
                    type="text"
                    value={currentApp.tracking_number || ''}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm font-mono text-gray-500 cursor-not-allowed"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">ชื่อพระภิกษุ / สามเณร *</label>
                <input
                  type="text"
                  value={currentApp.monk_name || ''}
                  onChange={(e) => setCurrentApp({ ...currentApp, monk_name: e.target.value })}
                  placeholder="เช่น พระมหาประเสริฐ สุเมโธ"
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">วัดต้นสังกัด *</label>
                <input
                  type="text"
                  value={currentApp.temple || ''}
                  onChange={(e) => setCurrentApp({ ...currentApp, temple: e.target.value })}
                  placeholder="เช่น วัดบวรนิเวศวิหาร กรุงเทพมหานคร"
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">วัดหรือประเทศปลายทาง *</label>
                <input
                  type="text"
                  value={currentApp.destination || ''}
                  onChange={(e) => setCurrentApp({ ...currentApp, destination: e.target.value })}
                  placeholder="เช่น วัดไทยลอสแองเจลิส สหรัฐอเมริกา"
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">ขั้นตอนการดำเนินงาน (Step)</label>
                  <select
                    value={currentApp.step || 1}
                    onChange={(e) => setCurrentApp({ ...currentApp, step: parseInt(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={1}>1. ยื่นคำขอเข้าระบบ</option>
                    <option value={2}>2. ตรวจสอบเอกสาร</option>
                    <option value={3}>3. เสนอ กก. ศ.ต.ภ.</option>
                    <option value={4}>4. อนุมัติเรียบร้อย</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">ข้อความสถานะ</label>
                  <input
                    type="text"
                    value={currentApp.status || ''}
                    onChange={(e) => setCurrentApp({ ...currentApp, status: e.target.value })}
                    placeholder="ข้อความระบุสถานะ..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-[#a66b00] text-white text-sm font-semibold shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                  <span>บันทึกข้อมูล</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail View Modal */}
      {isDetailModalOpen && currentApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">description</span>
                <h3 className="text-lg font-bold text-gray-900">รายละเอียดคำขอเดินทาง</h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <div className="text-xs text-amber-800 font-semibold">รหัสติดตาม (Tracking Number)</div>
                  <div className="text-lg font-mono font-bold text-gray-900">{currentApp.tracking_number}</div>
                </div>
                <div>{getStepBadge(currentApp.step || 1)}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-400">พระภิกษุผู้ยื่นคำขอ</div>
                  <div className="font-semibold text-gray-900 mt-0.5">{currentApp.monk_name}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">วัดต้นสังกัด</div>
                  <div className="font-semibold text-gray-900 mt-0.5">{currentApp.temple}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400">ปลายทางที่เดินทางไปปฏิบัติศาสนกิจ</div>
                <div className="font-semibold text-gray-900 mt-0.5">{currentApp.destination}</div>
              </div>

              <div>
                <div className="text-xs text-gray-400">สถานะปัจจุบัน</div>
                <div className="font-medium text-gray-800 mt-0.5">{currentApp.status}</div>
              </div>

              <div>
                <div className="text-xs text-gray-400">วันที่และเวลาที่อัปเดตล่าสุด</div>
                <div className="text-gray-600 mt-0.5">{currentApp.updated_at}</div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
