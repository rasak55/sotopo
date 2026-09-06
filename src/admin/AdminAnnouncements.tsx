import React, { useState, useEffect } from 'react'
import {
  adminGetAnnouncements,
  adminSaveAnnouncement,
  adminDeleteAnnouncement
} from './adminApi'
import { AnnouncementItem, ApprovedMonkItem } from './adminTypes'

export const AdminAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewMonksModalOpen, setIsViewMonksModalOpen] = useState(false)
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Partial<AnnouncementItem> | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const data = await adminGetAnnouncements()
      setAnnouncements(data)
    } catch (err: any) {
      showToast(err.message || 'โหลดข้อมูลประกาศล้มเหลว', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const filteredAnnouncements = announcements.filter((item) => {
    return (
      item.announcement_number.toLowerCase().includes(search.toLowerCase()) ||
      item.topic.toLowerCase().includes(search.toLowerCase())
    )
  })

  const handleOpenCreate = () => {
    setCurrentAnnouncement({
      id: 0,
      announcement_number: '',
      topic: '',
      approve_date: new Intl.DateTimeFormat('th-TH', { dateStyle: 'long' }).format(new Date()),
      monks: [
        { monk_name: '', temple: '', destination: '', approve_date: '' }
      ]
    })
    setIsEditModalOpen(true)
  }

  const handleOpenEdit = (item: AnnouncementItem) => {
    setCurrentAnnouncement({
      ...item,
      monks: item.monks && item.monks.length > 0 ? [...item.monks] : [{ monk_name: '', temple: '', destination: '', approve_date: '' }]
    })
    setIsEditModalOpen(true)
  }

  const handleOpenViewMonks = (item: AnnouncementItem) => {
    setCurrentAnnouncement(item)
    setIsViewMonksModalOpen(true)
  }

  const handleAddMonkRow = () => {
    if (!currentAnnouncement) return
    const monks = currentAnnouncement.monks || []
    setCurrentAnnouncement({
      ...currentAnnouncement,
      monks: [...monks, { monk_name: '', temple: '', destination: '', approve_date: currentAnnouncement.approve_date || '' }]
    })
  }

  const handleRemoveMonkRow = (index: number) => {
    if (!currentAnnouncement) return
    const monks = [...(currentAnnouncement.monks || [])]
    monks.splice(index, 1)
    setCurrentAnnouncement({ ...currentAnnouncement, monks })
  }

  const handleMonkChange = (index: number, field: keyof ApprovedMonkItem, val: string) => {
    if (!currentAnnouncement) return
    const monks = [...(currentAnnouncement.monks || [])]
    monks[index] = { ...monks[index], [field]: val }
    setCurrentAnnouncement({ ...currentAnnouncement, monks })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentAnnouncement?.announcement_number || !currentAnnouncement?.topic) {
      showToast('กรุณากรอกเลขที่ประกาศและหัวข้อเรื่อง', 'error')
      return
    }

    setSaving(true)
    try {
      await adminSaveAnnouncement(currentAnnouncement)
      showToast('บันทึกประกาศและรายชื่อพระภิกษุเรียบร้อยแล้ว')
      setIsEditModalOpen(false)
      fetchAnnouncements()
    } catch (err: any) {
      showToast(err.message || 'บันทึกล้มเหลว', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number, number: string) => {
    if (!window.confirm(`ยืนยันการลบประกาศเลขที่ "${number}" ใช่หรือไม่? รายชื่อพระภิกษุที่ผูกกับประกาศนี้จะถูกลบทั้งหมด`)) {
      return
    }

    try {
      await adminDeleteAnnouncement(id)
      showToast('ลบประกาศเรียบร้อยแล้ว')
      fetchAnnouncements()
    } catch (err: any) {
      showToast(err.message || 'ลบล้มเหลว', 'error')
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการประกาศผลและรายชื่อพระภิกษุ</h1>
          <p className="text-xs text-gray-500 mt-0.5">ประกาศมติ ศ.ต.ภ. และรายชื่อพระภิกษุสามเณรที่ได้รับอนุมัติเดินทาง</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-[#a66b00] text-white rounded-xl text-sm font-semibold shadow-md transition cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          <span>สร้างประกาศใหม่</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาเลขที่ประกาศ, หัวข้อเรื่อง..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Announcements Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-400 mt-2">กำลังโหลดรายการประกาศ...</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">campaign</span>
            <p className="text-sm font-medium">ไม่พบรายการประกาศมติ</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs uppercase font-semibold text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">เลขที่ประกาศ</th>
                  <th className="px-6 py-4">หัวข้อเรื่อง</th>
                  <th className="px-6 py-4">วันที่มติ</th>
                  <th className="px-6 py-4">จำนวนพระภิกษุที่อนุมัติ</th>
                  <th className="px-6 py-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAnnouncements.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/20 transition">
                    <td className="px-6 py-4 font-bold text-gray-900 text-sm">
                      {item.announcement_number}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800 max-w-md">
                      {item.topic}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {item.approve_date}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleOpenViewMonks(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">group</span>
                        <span>{item.monk_count || 0} รูป (คลิกดู)</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 transition"
                        title="แก้ไขประกาศและรายชื่อ"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.announcement_number)}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition"
                        title="ลบประกาศ"
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

      {/* Edit / Create Announcement Modal */}
      {isEditModalOpen && currentAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {currentAnnouncement.id && currentAnnouncement.id > 0 ? 'แก้ไขประกาศและรายชื่อพระภิกษุ' : 'สร้างประกาศผลมติใหม่'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">เลขที่ประกาศ *</label>
                  <input
                    type="text"
                    value={currentAnnouncement.announcement_number || ''}
                    onChange={(e) => setCurrentAnnouncement({ ...currentAnnouncement, announcement_number: e.target.value })}
                    placeholder="เช่น ศ.ต.ภ. ๕/๒๕๖๙"
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary font-semibold text-gray-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">วันที่มติเห็นชอบ *</label>
                  <input
                    type="text"
                    value={currentAnnouncement.approve_date || ''}
                    onChange={(e) => setCurrentAnnouncement({ ...currentAnnouncement, approve_date: e.target.value })}
                    placeholder="เช่น ๑๒ กรกฎาคม ๒๕๖๙"
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">หัวข้อเรื่อง (Topic) *</label>
                <input
                  type="text"
                  value={currentAnnouncement.topic || ''}
                  onChange={(e) => setCurrentAnnouncement({ ...currentAnnouncement, topic: e.target.value })}
                  placeholder="เช่น อนุมัติพระภิกษุสามเณรเดินทางไปปฏิบัติศาสนกิจในต่างประเทศ ประจำงวดเดือนกรกฎาคม ๒๕๖๙"
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Approved Monks Sub-form */}
              <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-base">groups</span>
                    <span>รายชื่อพระภิกษุที่ได้รับอนุมัติในประกาศนี้ ({currentAnnouncement.monks?.length || 0} รูป)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMonkRow}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-[#a66b00] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    <span>เพิ่มรูป</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {currentAnnouncement.monks?.map((monk, idx) => (
                    <div key={idx} className="p-3 bg-white border border-gray-200 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-2 relative items-center">
                      <div className="sm:col-span-1">
                        <input
                          type="text"
                          value={monk.monk_name}
                          onChange={(e) => handleMonkChange(idx, 'monk_name', e.target.value)}
                          placeholder="ชื่อพระภิกษุ *"
                          required
                          className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <input
                          type="text"
                          value={monk.temple}
                          onChange={(e) => handleMonkChange(idx, 'temple', e.target.value)}
                          placeholder="วัดต้นสังกัด *"
                          required
                          className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <input
                          type="text"
                          value={monk.destination}
                          onChange={(e) => handleMonkChange(idx, 'destination', e.target.value)}
                          placeholder="วัด / ประเทศปลายทาง *"
                          required
                          className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="sm:col-span-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={monk.approve_date}
                          onChange={(e) => handleMonkChange(idx, 'approve_date', e.target.value)}
                          placeholder="วันที่อนุมัติ"
                          className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveMonkRow(idx)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
                          title="ลบแถวนี้"
                        >
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      </div>
                    </div>
                  ))}
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
                  <span>บันทึกประกาศ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Monks Modal */}
      {isViewMonksModalOpen && currentAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{currentAnnouncement.announcement_number}</h3>
                <p className="text-xs text-gray-500">{currentAnnouncement.topic}</p>
              </div>
              <button
                onClick={() => setIsViewMonksModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                รายชื่อพระภิกษุสามเณร ({currentAnnouncement.monks?.length || 0} รูป)
              </div>
              {currentAnnouncement.monks?.map((monk, idx) => (
                <div key={idx} className="p-3 bg-amber-50/40 border border-amber-100 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-gray-900">{idx + 1}. {monk.monk_name}</div>
                    <div className="text-gray-600 mt-0.5">วัด: {monk.temple}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-primary">{monk.destination}</div>
                    <div className="text-gray-400 mt-0.5">{monk.approve_date}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={() => setIsViewMonksModalOpen(false)}
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
