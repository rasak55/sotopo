import React, { useState, useEffect } from 'react'
import {
  adminGetCommittees,
  adminSaveCommittee,
  adminDeleteCommittee,
  getAssetUrl
} from './adminApi'
import { CommitteeItem } from './adminTypes'

export const AdminCommittees: React.FC = () => {
  const [committees, setCommittees] = useState<CommitteeItem[]>([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentCommittee, setCurrentCommittee] = useState<Partial<CommitteeItem> | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchCommittees = async () => {
    setLoading(true)
    try {
      const data = await adminGetCommittees()
      setCommittees(data)
    } catch (err: any) {
      showToast(err.message || 'โหลดข้อมูลคณะกรรมการล้มเหลว', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommittees()
  }, [])

  const handleOpenCreate = () => {
    setCurrentCommittee({
      id: 0,
      name: '',
      role: '',
      description: '',
      image_url: '/images/comm1.jpg',
      level: 3
    })
    setIsEditModalOpen(true)
  }

  const handleOpenEdit = (item: CommitteeItem) => {
    setCurrentCommittee({ ...item })
    setIsEditModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentCommittee?.name || !currentCommittee?.role) {
      showToast('กรุณากรอกชื่อและตำแหน่ง', 'error')
      return
    }

    setSaving(true)
    try {
      await adminSaveCommittee(currentCommittee)
      showToast('บันทึกข้อมูลคณะกรรมการเรียบร้อยแล้ว')
      setIsEditModalOpen(false)
      fetchCommittees()
    } catch (err: any) {
      showToast(err.message || 'บันทึกล้มเหลว', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`ยืนยันการลบข้อมูล "${name}" ใช่หรือไม่?`)) {
      return
    }

    try {
      await adminDeleteCommittee(id)
      showToast('ลบข้อมูลเรียบร้อยแล้ว')
      fetchCommittees()
    } catch (err: any) {
      showToast(err.message || 'ลบล้มเหลว', 'error')
    }
  }

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">1. ประธาน</span>
      case 2:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">2. รองประธาน</span>
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">3. กรรมการ</span>
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
          <h1 className="text-2xl font-bold text-gray-900">ทำเนียบคณะกรรมการ ศ.ต.ภ.</h1>
          <p className="text-xs text-gray-500 mt-0.5">จัดการรายนามประธาน รองประธาน และกรรมการศูนย์ควบคุม</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-[#a66b00] text-white rounded-xl text-sm font-semibold shadow-md transition cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          <span>เพิ่มกรรมการใหม่</span>
        </button>
      </div>

      {/* Committees Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-400 mt-2">กำลังโหลดรายนามคณะกรรมการ...</p>
          </div>
        ) : committees.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">groups</span>
            <p className="text-sm font-medium">ไม่พบข้อมูลคณะกรรมการ</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs uppercase font-semibold text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">รูปภาพ</th>
                  <th className="px-6 py-4">ชื่อ / สมณศักดิ์</th>
                  <th className="px-6 py-4">ตำแหน่งใน ศ.ต.ภ.</th>
                  <th className="px-6 py-4">ลำดับชั้น</th>
                  <th className="px-6 py-4">ข้อมูลสังเขป</th>
                  <th className="px-6 py-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {committees.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/20 transition">
                    <td className="px-6 py-4 w-20">
                      <img
                        src={getAssetUrl(item.image_url || '/images/comm1.jpg')}
                        alt={item.name}
                        className="w-12 h-14 rounded-lg object-cover border border-gray-200 shadow-xs"
                      />
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 text-sm">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-primary font-semibold text-xs">
                      {item.role}
                    </td>
                    <td className="px-6 py-4">
                      {getLevelLabel(item.level)}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 max-w-xs">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1 w-28">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 transition"
                        title="แก้ไขข้อมูล"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition"
                        title="ลบกรรมการ"
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

      {/* Edit / Create Committee Modal */}
      {isEditModalOpen && currentCommittee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {currentCommittee.id && currentCommittee.id > 0 ? 'แก้ไขข้อมูลกรรมการ' : 'เพิ่มกรรมการใหม่'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">ชื่อ / สมณศักดิ์ *</label>
                <input
                  type="text"
                  value={currentCommittee.name || ''}
                  onChange={(e) => setCurrentCommittee({ ...currentCommittee, name: e.target.value })}
                  placeholder="เช่น พระพรหมบัณฑิต (ประยูร ธมฺมจิตฺโต)"
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary font-semibold text-gray-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">ตำแหน่งใน ศ.ต.ภ. *</label>
                  <input
                    type="text"
                    value={currentCommittee.role || ''}
                    onChange={(e) => setCurrentCommittee({ ...currentCommittee, role: e.target.value })}
                    placeholder="เช่น ประธานคณะกรรมการ ศ.ต.ภ."
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">ลำดับชั้นการจัดเรียง (Level)</label>
                  <select
                    value={currentCommittee.level || 3}
                    onChange={(e) => setCurrentCommittee({ ...currentCommittee, level: parseInt(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={1}>1 - ประธานกรรมการ</option>
                    <option value={2}>2 - รองประธานกรรมการ</option>
                    <option value={3}>3 - กรรมการ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">รายละเอียดสังเขป / ตำแหน่งปกครองสงฆ์</label>
                <textarea
                  value={currentCommittee.description || ''}
                  onChange={(e) => setCurrentCommittee({ ...currentCommittee, description: e.target.value })}
                  placeholder="เช่น กรรมการมหาเถรสมาคม, เจ้าอาวาสวัดประยุรวงศาวาส..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">รูปภาพประจำตัว (Image URL)</label>
                <input
                  type="text"
                  value={currentCommittee.image_url || ''}
                  onChange={(e) => setCurrentCommittee({ ...currentCommittee, image_url: e.target.value })}
                  placeholder="/images/comm1.jpg หรือ ลิงก์รูปภาพ..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {/* Preset image buttons */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-xs text-gray-400">รูปภาพมาตรฐาน:</span>
                  {['/images/comm1.jpg', '/images/comm2.jpg', '/images/comm3.jpg', '/images/comm4.jpg', '/images/comm5.jpg', '/images/comm6.jpg'].map((img) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setCurrentCommittee({ ...currentCommittee, image_url: img })}
                      className="text-xs text-primary hover:underline"
                    >
                      {img.split('/').pop()?.replace('.jpg', '')}
                    </button>
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
                  <span>บันทึกข้อมูล</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
