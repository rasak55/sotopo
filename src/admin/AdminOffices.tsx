import React, { useState, useEffect } from 'react'
import { adminGetOffices, adminSaveOffice, adminDeleteOffice } from './adminApi'
import { OfficeItem } from './adminTypes'

export const AdminOffices: React.FC = () => {
  const [offices, setOffices] = useState<OfficeItem[]>([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentOffice, setCurrentOffice] = useState<Partial<OfficeItem> | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchOffices = async () => {
    setLoading(true)
    try {
      const data = await adminGetOffices()
      setOffices(data)
    } catch (err: any) {
      showToast(err.message || 'โหลดข้อมูลสำนักงานล้มเหลว', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOffices()
  }, [])

  const handleOpenCreate = () => {
    setCurrentOffice({
      id: 0,
      name: '',
      address: '',
      phone: '',
      hours: 'วันจันทร์ - วันศุกร์: 08.30 - 16.30 น.',
      type: 'HQ'
    })
    setIsEditModalOpen(true)
  }

  const handleOpenEdit = (item: OfficeItem) => {
    setCurrentOffice({ ...item })
    setIsEditModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentOffice?.name || !currentOffice?.address) {
      showToast('กรุณากรอกชื่อสำนักงานและที่ตั้ง', 'error')
      return
    }

    setSaving(true)
    try {
      await adminSaveOffice(currentOffice)
      showToast('บันทึกข้อมูลสำนักงานเรียบร้อยแล้ว')
      setIsEditModalOpen(false)
      fetchOffices()
    } catch (err: any) {
      showToast(err.message || 'บันทึกล้มเหลว', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`ยืนยันการลบสำนักงาน "${name}" ใช่หรือไม่?`)) {
      return
    }

    try {
      await adminDeleteOffice(id)
      showToast('ลบข้อมูลสำนักงานเรียบร้อยแล้ว')
      fetchOffices()
    } catch (err: any) {
      showToast(err.message || 'ลบล้มเหลว', 'error')
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'HQ':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">สำนักงานใหญ่ (ส่วนกลาง)</span>
      case 'BRANCH':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300">ศูนย์ประสานงาน</span>
      case 'OVERSEAS':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-900 border border-purple-300">ศูนย์ต่างประเทศ</span>
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">หน่วยงานร่วม</span>
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
          <h1 className="text-2xl font-bold text-gray-900">ข้อมูลสำนักงานและจุดติดต่อ</h1>
          <p className="text-xs text-gray-500 mt-0.5">จัดการที่ตั้งสำนักงานใหญ่ ศูนย์ประสานงาน และเบอร์โทรศัพท์</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-[#a66b00] text-white rounded-xl text-sm font-semibold shadow-md transition cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          <span>เพิ่มสำนักงานใหม่</span>
        </button>
      </div>

      {/* Offices Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-400 mt-2">กำลังโหลดข้อมูลสำนักงาน...</p>
          </div>
        ) : offices.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">apartment</span>
            <p className="text-sm font-medium">ไม่พบข้อมูลสำนักงาน</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs uppercase font-semibold text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">ชื่อสำนักงาน / จุดติดต่อ</th>
                  <th className="px-6 py-4">ประเภท</th>
                  <th className="px-6 py-4">ที่อยู่และสถานที่ตั้ง</th>
                  <th className="px-6 py-4">เบอร์โทรศัพท์</th>
                  <th className="px-6 py-4">เวลาทำการ</th>
                  <th className="px-6 py-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {offices.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/20 transition">
                    <td className="px-6 py-4 font-bold text-gray-900 text-sm">
                      {item.name}
                    </td>
                    <td className="px-6 py-4">
                      {getTypeBadge(item.type)}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-700 max-w-xs">
                      {item.address}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono font-medium text-gray-800">
                      {item.phone}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {item.hours}
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
                        title="ลบสำนักงาน"
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

      {/* Edit / Create Office Modal */}
      {isEditModalOpen && currentOffice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {currentOffice.id && currentOffice.id > 0 ? 'แก้ไขข้อมูลสำนักงาน' : 'เพิ่มสำนักงานใหม่'}
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">ชื่อสำนักงาน / จุดประสานงาน *</label>
                <input
                  type="text"
                  value={currentOffice.name || ''}
                  onChange={(e) => setCurrentOffice({ ...currentOffice, name: e.target.value })}
                  placeholder="เช่น สำนักงาน ศ.ต.ภ. (ส่วนกลาง)"
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary font-semibold text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">ประเภทสำนักงาน</label>
                <select
                  value={currentOffice.type || 'HQ'}
                  onChange={(e) => setCurrentOffice({ ...currentOffice, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="HQ">สำนักงานใหญ่ (ส่วนกลาง)</option>
                  <option value="BRANCH">ศูนย์ประสานงาน (สาขา)</option>
                  <option value="OVERSEAS">ศูนย์ประสานงานต่างประเทศ</option>
                  <option value="PARTNER">หน่วยงานร่วม / พันธมิตร</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">ที่อยู่และสถานที่ตั้ง *</label>
                <textarea
                  value={currentOffice.address || ''}
                  onChange={(e) => setCurrentOffice({ ...currentOffice, address: e.target.value })}
                  placeholder="เช่น วัดสระเกศ ราชวรมหาวิหาร เขตป้อมปราบศัตรูพ่าย กรุงเทพมหานคร 10100"
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={currentOffice.phone || ''}
                    onChange={(e) => setCurrentOffice({ ...currentOffice, phone: e.target.value })}
                    placeholder="เช่น 0 2621 2280"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">เวลาทำการ</label>
                  <input
                    type="text"
                    value={currentOffice.hours || ''}
                    onChange={(e) => setCurrentOffice({ ...currentOffice, hours: e.target.value })}
                    placeholder="เช่น วันจันทร์ - ศุกร์: 08.30 - 16.30 น."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary text-xs"
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
    </div>
  )
}
