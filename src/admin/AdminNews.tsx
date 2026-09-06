import React, { useState, useEffect } from 'react'
import { adminGetNews, adminSaveNews, adminDeleteNews, getAssetUrl } from './adminApi'
import { NewsItem } from './adminTypes'

export const AdminNews: React.FC = () => {
  const [newsList, setNewsList] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('ทั้งหมด')

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentNews, setCurrentNews] = useState<Partial<NewsItem> | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchNews = async () => {
    setLoading(true)
    try {
      const data = await adminGetNews()
      setNewsList(data)
    } catch (err: any) {
      showToast(err.message || 'โหลดข้อมูลข่าวสารล้มเหลว', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  const tags = ['ทั้งหมด', 'ข่าวสาร', 'ประกาศ', 'สาระน่ารู้', 'การอบรม', 'ระเบียบ ศ.ต.ภ.', 'มติมส.', 'บริการ']

  const filteredNews = newsList.filter((item) => {
    const matchesTag = tagFilter === 'ทั้งหมด' || item.tag === tagFilter
    const matchesSearch =
      search === '' ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase())
    return matchesTag && matchesSearch
  })

  const handleOpenCreate = () => {
    setCurrentNews({
      id: 0,
      tag: 'ข่าวสาร',
      date: new Intl.DateTimeFormat('th-TH', { dateStyle: 'long' }).format(new Date()),
      title: '',
      summary: '',
      content: '<p>รายละเอียดเนื้อหาข่าว...</p>',
      image_url: '/images/news1.jpg'
    })
    setIsEditModalOpen(true)
  }

  const handleOpenEdit = (item: NewsItem) => {
    setCurrentNews({ ...item })
    setIsEditModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentNews?.title || !currentNews?.summary) {
      showToast('กรุณากรอกหัวข้อข่าวและสรุปย่อ', 'error')
      return
    }

    setSaving(true)
    try {
      await adminSaveNews(currentNews)
      showToast('บันทึกข่าวสารเรียบร้อยแล้ว')
      setIsEditModalOpen(false)
      fetchNews()
    } catch (err: any) {
      showToast(err.message || 'บันทึกล้มเหลว', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`ยืนยันการลบข่าว "${title}" ใช่หรือไม่?`)) {
      return
    }

    try {
      await adminDeleteNews(id)
      showToast('ลบข่าวสารเรียบร้อยแล้ว')
      fetchNews()
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
          <h1 className="text-2xl font-bold text-gray-900">จัดการข่าวสารและกิจกรรม</h1>
          <p className="text-xs text-gray-500 mt-0.5">เผยแพร่ข่าว มติมหาเถรสมาคม และบทความสาระน่ารู้</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-[#a66b00] text-white rounded-xl text-sm font-semibold shadow-md transition cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          <span>เพิ่มข่าวสารใหม่</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาหัวข้อข่าว, สรุป..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-semibold text-gray-500 flex-shrink-0">หมวดหมู่:</span>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setTagFilter(tag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex-shrink-0 cursor-pointer ${
                tagFilter === tag
                  ? 'bg-primary text-white font-semibold shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* News Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-400 mt-2">กำลังโหลดรายการข่าวสาร...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">newspaper</span>
            <p className="text-sm font-medium">ไม่พบรายการข่าวสาร</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs uppercase font-semibold text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">รูปภาพ</th>
                  <th className="px-6 py-4">หมวดหมู่ & วันที่</th>
                  <th className="px-6 py-4">หัวข้อข่าว / สรุปย่อ</th>
                  <th className="px-6 py-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredNews.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/20 transition">
                    <td className="px-6 py-4 w-24">
                      <img
                        src={getAssetUrl(item.image_url || '/images/news1.jpg')}
                        alt={item.title}
                        className="w-16 h-12 rounded-lg object-cover border border-gray-200"
                      />
                    </td>
                    <td className="px-6 py-4 w-48">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 mb-1">
                        {item.tag}
                      </span>
                      <div className="text-xs text-gray-400">{item.date}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 line-clamp-1">{item.title}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{item.summary}</div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1 w-28">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 transition"
                        title="แก้ไขข่าว"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition"
                        title="ลบข่าว"
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

      {/* Edit / Create News Modal */}
      {isEditModalOpen && currentNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {currentNews.id && currentNews.id > 0 ? 'แก้ไขข่าวสาร' : 'เพิ่มข่าวสารใหม่'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">หมวดหมู่ (Tag) *</label>
                  <select
                    value={currentNews.tag || 'ข่าวสาร'}
                    onChange={(e) => setCurrentNews({ ...currentNews, tag: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="ข่าวสาร">ข่าวสาร</option>
                    <option value="ประกาศ">ประกาศ</option>
                    <option value="สาระน่ารู้">สาระน่ารู้</option>
                    <option value="การอบรม">การอบรม</option>
                    <option value="ระเบียบ ศ.ต.ภ.">ระเบียบ ศ.ต.ภ.</option>
                    <option value="มติมส.">มติมส.</option>
                    <option value="บริการ">บริการ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">วันที่เผยแพร่ *</label>
                  <input
                    type="text"
                    value={currentNews.date || ''}
                    onChange={(e) => setCurrentNews({ ...currentNews, date: e.target.value })}
                    placeholder="เช่น ๑๒ กรกฎาคม ๒๕๖๙"
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">หัวข้อข่าว (Title) *</label>
                <input
                  type="text"
                  value={currentNews.title || ''}
                  onChange={(e) => setCurrentNews({ ...currentNews, title: e.target.value })}
                  placeholder="กรอกหัวข้อข่าว..."
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary font-semibold text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">สรุปย่อ (Summary) *</label>
                <textarea
                  value={currentNews.summary || ''}
                  onChange={(e) => setCurrentNews({ ...currentNews, summary: e.target.value })}
                  placeholder="ข้อความสรุปสั้นๆ สำหรับแสดงในการ์ดหน้าแรก..."
                  rows={2}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">รูปภาพประกอบ (Image URL)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentNews.image_url || ''}
                    onChange={(e) => setCurrentNews({ ...currentNews, image_url: e.target.value })}
                    placeholder="/images/news1.jpg หรือ ลิงก์รูปภาพ..."
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {/* Preset image buttons */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-400">รูปภาพมาตรฐาน:</span>
                  {['/images/news1.jpg', '/images/news2.jpg', '/images/news3.jpg'].map((img) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setCurrentNews({ ...currentNews, image_url: img })}
                      className="text-xs text-primary hover:underline"
                    >
                      {img.split('/').pop()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">เนื้อหาข่าวฉบับเต็ม (Full Content / HTML)</label>
                <textarea
                  value={currentNews.content || ''}
                  onChange={(e) => setCurrentNews({ ...currentNews, content: e.target.value })}
                  placeholder="<p>เนื้อหาข่าวแบบละเอียด รองรับ HTML เช่น <strong>ข้อความ</strong> <ul><li>รายการ</li></ul></p>"
                  rows={6}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
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
                  <span>บันทึกข่าวสาร</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
