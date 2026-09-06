import React, { useState, useEffect } from 'react'

const BASE_URL = import.meta.env.BASE_URL || '/';
const API_BASE = BASE_URL.endsWith('/') ? `${BASE_URL}backend` : `${BASE_URL}/backend`;
const getAssetUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return BASE_URL.endsWith('/') ? `${BASE_URL}${cleanPath}` : `${BASE_URL}/${cleanPath}`;
};

// --- Types & Interfaces ---
interface NewsItem {
  id: number
  tag: string
  date: string
  title: string
  summary: string
  image_url: string
}

interface CommitteeMember {
  id: number
  name: string
  role: string
  description: string
  image_url: string
  level: number
}

interface Announcement {
  id: number
  announcement_number: string
  topic: string
  monk_name: string
  temple: string
  destination: string
  approve_date: string
}

interface Office {
  id: number
  name: string
  address: string
  phone: string
  hours: string
  type: string
}

interface TrackingData {
  tracking_number: string
  monk_name: string
  temple: string
  destination: string
  status: string
  step: number
  updated_at: string
}

export default function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Listen to hash changes for routing
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/')
      setMobileMenuOpen(false)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Navigation Helper
  const navigateTo = (hash: string) => {
    window.location.hash = hash
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 md:px-12 h-20 bg-white/95 backdrop-blur-sm border-b border-outline-variant transition-all duration-300">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('#/')}>
          <img
            className="h-12 w-auto"
            alt="ศ.ต.ภ. Emblem"
            src={getAssetUrl('/images/logo.png')}
          />
          <span className="font-bold text-2xl text-primary font-be-vietnam">ศ.ต.ภ.</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: 'หน้าแรก', hash: '#/' },
            { label: 'คณะกรรมการ', hash: '#/committee' },
            { label: 'ข้อมูลสำนักงาน', hash: '#/office' },
            { label: 'ขั้นตอนการเดินทาง', hash: '#/visa' },
            { label: 'ประกาศรายชื่อ', hash: '#/announcements' },
            { label: 'คู่มือการเดินทาง', hash: '#/guide' },
          ].map((item) => {
            const isActive = currentHash === item.hash || (item.hash === '#/' && currentHash === '#/home')
            return (
              <a
                key={item.hash}
                href={item.hash}
                className={`font-semibold text-sm transition-all duration-200 pb-1 border-b-2 ${
                  isActive
                    ? 'text-primary border-primary'
                    : 'text-on-surface-variant border-transparent hover:text-primary hover:border-primary/50'
                }`}
              >
                {item.label}
              </a>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 text-primary hover:bg-surface-container rounded-full transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-20 z-40 bg-white md:hidden flex flex-col p-6 gap-6 border-b border-outline-variant animate-fadeIn">
          {[
            { label: 'หน้าแรก', hash: '#/' },
            { label: 'คณะกรรมการ', hash: '#/committee' },
            { label: 'ข้อมูลสำนักงาน', hash: '#/office' },
            { label: 'ขั้นตอนการเดินทาง', hash: '#/visa' },
            { label: 'ประกาศรายชื่อ', hash: '#/announcements' },
            { label: 'คู่มือการเดินทาง', hash: '#/guide' },
          ].map((item) => {
            const isActive = currentHash === item.hash || (item.hash === '#/' && currentHash === '#/home')
            return (
              <a
                key={item.hash}
                href={item.hash}
                className={`text-lg font-semibold py-2 px-4 rounded-lg transition-colors ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {item.label}
              </a>
            )
          })}
        </div>
      )}

      {/* Main Content */}
      <main className="pt-20 flex-grow">
        {currentHash === '#/' || currentHash === '#/home' ? (
          <HomePage navigateTo={navigateTo} />
        ) : currentHash === '#/committee' ? (
          <CommitteePage />
        ) : currentHash === '#/office' ? (
          <OfficePage />
        ) : currentHash === '#/visa' ? (
          <VisaPage />
        ) : currentHash === '#/announcements' ? (
          <AnnouncementsPage />
        ) : currentHash === '#/guide' ? (
          <GuidePage />
        ) : (
          <div className="py-20 text-center">
            <h2 className="text-2xl font-bold text-error">ไม่พบหน้าเว็บที่คุณต้องการ</h2>
            <button className="mt-4 px-6 py-2 bg-primary text-white rounded-lg" onClick={() => navigateTo('#/')}>
              กลับหน้าแรก
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-6 md:px-12 flex flex-col items-center gap-6 bg-surface-container-low border-t border-outline-variant">
        <div className="flex flex-col items-center gap-3 mb-4">
          <img
            className="h-14 w-auto opacity-90"
            alt="ศ.ต.ภ. Footer Emblem"
            src={getAssetUrl('/images/footer_logo.png')}
          />
          <span className="font-semibold text-lg text-on-surface">ศ.ต.ภ.</span>
        </div>
        <div className="flex flex-wrap justify-center gap-8 mb-6">
          <a className="text-sm text-on-surface-variant hover:text-primary underline transition-all" href="https://www.onab.go.th" target="_blank" rel="noreferrer">
            สำนักงานพระพุทธศาสนาแห่งชาติ
          </a>
          <a className="text-sm text-on-surface-variant hover:text-primary underline transition-all" href="https://consular.mfa.go.th" target="_blank" rel="noreferrer">
            กระทรวงการต่างประเทศ
          </a>
          <a className="text-sm text-on-surface-variant hover:text-primary underline transition-all" href="#/office">
            ติดต่อเรา
          </a>
          <a className="text-sm text-on-surface-variant hover:text-primary underline transition-all" href="#/">
            แผนผังเว็บไซต์
          </a>
        </div>
        <div className="text-center text-sm text-on-surface-variant">
          <p className="font-semibold text-secondary mb-1">ศูนย์ควบคุมการไปต่างประเทศของพระภิกษุสามเณร (ศ.ต.ภ.)</p>
          <p>© 2026 ศูนย์ควบคุมการไปต่างประเทศของพระภิกษุสามเณร (ศ.ต.ภ.). สงวนลิขสิทธิ์.</p>
        </div>
      </footer>
    </div>
  )
}

// ==========================================
// 1. Home Page Component
// ==========================================
function HomePage({ navigateTo }: { navigateTo: (hash: string) => void }) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [trackingNo, setTrackingNo] = useState('')
  const [trackingResult, setTrackingResult] = useState<TrackingData | null>(null)
  const [trackingError, setTrackingError] = useState('')
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)

  // Submit Application Form State
  const [formMonkName, setFormMonkName] = useState('')
  const [formTemple, setFormTemple] = useState('')
  const [formDestination, setFormDestination] = useState('')
  const [formSubmitSuccess, setFormSubmitSuccess] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    // Fetch News Articles
    fetch(`${API_BASE}/api.php?endpoint=news`)
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 'success') {
          setNews(res.data)
        }
      })
      .catch((err) => console.error('Failed to fetch news:', err))
  }, [])

  const handleTrackStatus = (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingNo.trim()) return

    setTrackingLoading(true)
    setTrackingError('')
    setTrackingResult(null)

    fetch(`${API_BASE}/api.php?endpoint=status&tracking_number=${encodeURIComponent(trackingNo.trim())}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 'success') {
          setTrackingResult(res.data)
        } else {
          setTrackingError(res.message || 'ไม่พบข้อมูลเลขที่อ้างอิงนี้')
        }
      })
      .catch(() => setTrackingError('เกิดข้อผิดพลาดในการติดต่อฐานข้อมูล'))
      .finally(() => setTrackingLoading(false))
  }

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formMonkName || !formTemple || !formDestination) return

    setFormLoading(true)
    setFormSubmitSuccess(null)

    fetch(`${API_BASE}/api.php?endpoint=submit_application`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monk_name: formMonkName,
        temple: formTemple,
        destination: formDestination,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 'success') {
          setFormSubmitSuccess(res.data.tracking_number)
          // Pre-fill search with the new tracking ID
          setTrackingNo(res.data.tracking_number)
          setFormMonkName('')
          setFormTemple('')
          setFormDestination('')
        }
      })
      .catch(() => alert('เกิดข้อผิดพลาดในการยื่นคำร้อง'))
      .finally(() => setFormLoading(false))
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center brightness-[0.85]"
            style={{
              backgroundImage: `url("${getAssetUrl('/images/hero_bg.jpg')}")`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent"></div>
        </div>
        <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-[1200px]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-container/20 border border-primary/30 rounded-full mb-4">
              <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
              <span className="text-xs font-semibold text-on-primary-container">ประกาศอย่างเป็นทางการ</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-primary mb-6 leading-tight font-be-vietnam">
              ศูนย์ควบคุมการไปต่างประเทศ
              <br />
              ของพระภิกษุสามเณร (ศ.ต.ภ.)
            </h1>
            <p className="text-lg text-on-surface-variant mb-8 leading-relaxed">
              กำกับดูแลและอำนวยความสะดวกในการจาริกไปต่างประเทศของพระภิกษุสามเณรตามระเบียบมหาเถรสมาคม
              เพื่อความเรียบร้อยและความมั่นคงของพระพุทธศาสนา
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#tracker-section"
                className="px-8 py-3 bg-primary text-white font-semibold rounded-lg shadow-sm hover:brightness-110 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined">description</span>
                ตรวจสอบสถานะคำขอ
              </a>
              <button
                onClick={() => navigateTo('#/visa')}
                className="px-8 py-3 border-2 border-outline text-on-surface font-semibold rounded-lg hover:bg-surface-container transition-all flex items-center gap-2"
              >
                ระเบียบปฏิบัติ
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tracker Section */}
      <section id="tracker-section" className="py-12 bg-white border-y border-outline-variant scroll-mt-24">
        <div className="container mx-auto px-6 md:px-12 max-w-[1200px]">
          <div className="max-w-3xl mx-auto bg-background p-6 md:p-8 rounded-xl border border-outline-variant shadow-sm">
            <h3 className="text-xl font-bold text-primary text-center mb-6 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">track_changes</span>
              ระบบตรวจสอบสถานะหนังสืออนุมัติไปต่างประเทศ
            </h3>
            <form onSubmit={handleTrackStatus} className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="กรอกเลขที่ใบสมัคร เช่น ST-2026-0001"
                value={trackingNo}
                onChange={(e) => setTrackingNo(e.target.value)}
                className="flex-grow px-4 py-3 rounded-lg border border-outline focus:outline-none focus:ring-2 focus:ring-primary bg-white text-base"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
                disabled={trackingLoading}
              >
                {trackingLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span className="material-symbols-outlined">search</span>
                    ค้นหาข้อมูล
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="text-primary hover:underline font-semibold text-sm flex items-center justify-center gap-1 mx-auto"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                จำลองยื่นคำขอเดินทางใหม่เพื่อรับรหัสติดตาม
              </button>
            </div>

            {trackingError && (
              <div className="mt-6 p-4 bg-error-container text-on-error-container rounded-lg border border-error/20 flex items-center gap-2">
                <span className="material-symbols-outlined text-error">info</span>
                <span className="font-semibold text-sm">{trackingError}</span>
              </div>
            )}

            {trackingResult && (
              <div className="mt-8 border-t border-outline-variant pt-6 animate-fadeIn">
                <h4 className="text-lg font-bold text-on-surface mb-4">ข้อมูลคำร้องของคุณ:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-lg border border-outline-variant text-sm">
                  <div>
                    <span className="text-on-surface-variant block">พระภิกษุผู้ขอเดินทาง:</span>
                    <strong className="text-base text-primary">{trackingResult.monk_name}</strong>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block">สังกัดวัด:</span>
                    <strong className="text-base">{trackingResult.temple}</strong>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block">ประเทศปลายทาง:</span>
                    <strong className="text-base">{trackingResult.destination}</strong>
                  </div>
                  <div>
                    <span className="text-on-surface-variant block">อัปเดตล่าสุดเมื่อ:</span>
                    <strong className="text-base">{trackingResult.updated_at}</strong>
                  </div>
                </div>

                <div className="mt-6">
                  <h5 className="font-bold text-sm text-on-surface-variant mb-4">ขั้นตอนการพิจารณาคำร้อง:</h5>
                  {/* Progress Line */}
                  <div className="relative flex justify-between items-center w-full mt-8 mb-4">
                    <div className="absolute left-0 right-0 h-1 bg-outline-variant z-0 top-1/2 -translate-y-1/2"></div>
                    <div
                      className="absolute left-0 h-1 bg-primary z-0 top-1/2 -translate-y-1/2 transition-all duration-500"
                      style={{ width: `${((trackingResult.step - 1) / 3) * 100}%` }}
                    ></div>

                    {[
                      { step: 1, label: 'ยื่นคำขอ' },
                      { step: 2, label: 'ตรวจเอกสาร' },
                      { step: 3, label: 'เสนอลงนาม' },
                      { step: 4, label: 'อนุมัติแล้ว' },
                    ].map((s) => {
                      const isActive = trackingResult.step >= s.step
                      return (
                        <div key={s.step} className="flex flex-col items-center relative z-10">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                              isActive ? 'bg-primary text-white scale-110 shadow-sm' : 'bg-outline-variant text-on-surface-variant'
                            }`}
                          >
                            {s.step}
                          </div>
                          <span
                            className={`text-xs font-semibold mt-2 text-center max-w-[80px] ${
                              isActive ? 'text-primary font-bold' : 'text-on-surface-variant'
                            }`}
                          >
                            {s.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 text-center font-semibold mt-8 text-primary">
                    สถานะปัจจุบัน: {trackingResult.status}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Spotlight: มติมหาเถรสมาคม */}
      <section className="py-16 bg-surface-container-lowest">
        <div className="container mx-auto px-6 md:px-12 max-w-[1200px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 relative">
              <div className="aspect-[3/4] rounded-xl overflow-hidden border border-outline-variant shadow-lg group">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt="Official Thai Document"
                  src={getAssetUrl('/images/doc.jpg')}
                />
                <div className="absolute inset-0 bg-primary/10"></div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary-container rounded-lg -z-10 opacity-20"></div>
            </div>
            <div className="lg:col-span-7">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-on-surface border-l-4 border-primary pl-4 leading-tight">
                  มติมหาเถรสมาคม ครั้งที่ ๑๔/๒๕๖๔
                </h2>
                <p className="text-lg text-on-surface-variant leading-relaxed">
                  ประกาศฉบับสำคัญเกี่ยวกับการปรับปรุงระเบียบและแนวทางการขอหนังสือเดินทางสำหรับพระภิกษุสามเณร
                  และการขอยกเว้นค่าธรรมเนียมในกรณีที่เหมาะสม เพื่อให้สอดคล้องกับสถานการณ์ปัจจุบัน
                </p>
                <ul className="space-y-4 py-2">
                  {[
                    'การกำหนดหลักเกณฑ์การเดินทางไปปฏิบัติศาสนกิจในต่างประเทศ',
                    'ขั้นตอนการตรวจสอบคุณสมบัติของผู้ขอรับหนังสือเดินทาง',
                    'มาตรการดูแลพระธรรมทูตและพระภิกษุในต่างแดน',
                  ].map((text, idx) => (
                    <li key={idx} className="flex gap-3 items-start text-base">
                      <span className="material-symbols-outlined text-primary mt-1">check_circle</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-4">
                  <a
                    href="#/guide"
                    className="px-6 py-3 bg-secondary-container text-on-secondary-container font-semibold rounded-lg inline-flex items-center gap-2 hover:brightness-95 transition-all text-sm"
                  >
                    <span className="material-symbols-outlined">download</span>
                    ดาวน์โหลดประกาศฉบับเต็ม (PDF)
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services and Online Features */}
      <section className="py-16 bg-surface">
        <div className="container mx-auto px-6 md:px-12 max-w-[1200px]">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-on-surface mb-2">บริการและข้อมูลออนไลน์</h3>
            <div className="thai-divider mx-auto w-32 mb-6"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: 'edit_note',
                title: 'ยื่นคำขอใหม่',
                desc: 'แบบฟอร์มขอความเห็นชอบเดินทางไปต่างประเทศ',
                action: () => setIsSubmitModalOpen(true),
              },
              {
                icon: 'task',
                title: 'สถานะการพิจารณา',
                desc: 'ตรวจสอบขั้นตอนปัจจุบันของคำร้อง',
                action: () => {
                  const el = document.getElementById('tracker-section')
                  el?.scrollIntoView({ behavior: 'smooth' })
                },
              },
              {
                icon: 'menu_book',
                title: 'คู่มือปฏิบัติ',
                desc: 'เอกสารแนะนำสำหรับพระสังฆาธิการ',
                action: () => navigateTo('#/guide'),
              },
              {
                icon: 'help',
                title: 'คำถามที่พบบ่อย',
                desc: 'รวมข้อสงสัยเกี่ยวกับการทำหนังสือเดินทาง',
                action: () => navigateTo('#/guide'),
              },
            ].map((card, idx) => (
              <div
                key={idx}
                onClick={card.action}
                className="group p-6 bg-surface-container-low border border-outline-variant hover:border-primary rounded-xl transition-all hover:shadow-md cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors">{card.icon}</span>
                </div>
                <h4 className="text-lg font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">{card.title}</h4>
                <p className="text-xs text-on-surface-variant">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6 md:px-12 max-w-[1200px]">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h3 className="text-2xl font-bold text-on-surface">ข่าวประชาสัมพันธ์ล่าสุด</h3>
              <p className="text-sm text-on-surface-variant mt-1">ติดตามความเคลื่อนไหวและประกาศจาก ศ.ต.ภ.</p>
            </div>
            <a href="#/" onClick={() => alert('ฟังก์ชันอยู่ระหว่างพัฒนาระบบคลังข่าวสาร')} className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
              ดูข่าวทั้งหมด
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news.map((item) => (
              <div key={item.id} className="flex flex-col group cursor-pointer bg-white rounded-xl border border-outline-variant overflow-hidden hover:shadow-md transition-all">
                <div className="aspect-video overflow-hidden border-b border-outline-variant">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt={item.title}
                    src={getAssetUrl(item.image_url)}
                  />
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-primary-container text-on-primary-container text-[10px] font-bold rounded">
                      {item.tag}
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">{item.date}</span>
                  </div>
                  <h5 className="text-base font-bold text-on-surface mb-2 group-hover:text-primary transition-colors leading-snug">
                    {item.title}
                  </h5>
                  <p className="text-sm text-on-surface-variant line-clamp-2 mt-auto">
                    {item.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Model-Driven Mock Application Submission Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-outline-variant p-6 relative animate-scaleUp">
            <button
              onClick={() => {
                setIsSubmitModalOpen(false)
                setFormSubmitSuccess(null)
              }}
              className="absolute top-4 right-4 p-1 text-on-surface-variant hover:bg-surface-container rounded-full"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">add_circle</span>
              จำลองการขอยื่นหนังสือเดินทางใหม่
            </h3>

            {formSubmitSuccess ? (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-6xl text-primary mb-4 animate-bounce">check_circle</span>
                <h4 className="text-xl font-bold text-on-surface mb-2">ยื่นคำขอเรียบร้อย!</h4>
                <p className="text-sm text-on-surface-variant mb-6">
                  ระบบจำลองได้ออกรหัสติดตามคำร้องสำหรับพระภิกษุสามเณร ดังนี้
                </p>
                <div className="bg-primary/10 border border-primary/30 p-3 rounded-lg font-mono text-lg font-bold text-primary mb-6">
                  {formSubmitSuccess}
                </div>
                <p className="text-xs text-on-surface-variant mb-6">
                  คุณสามารถคัดลอกรหัสข้างต้นเพื่อใช้ตรวจสอบสถานะการพิจารณาในหน้าหลักได้ทันที
                </p>
                <button
                  onClick={() => {
                    setIsSubmitModalOpen(false)
                    setFormSubmitSuccess(null)
                  }}
                  className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg hover:brightness-110 transition-all text-sm"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-1">
                    ชื่อพระภิกษุ / สามเณร (คำนำหน้าตามด้วยชื่อและฉายา)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น พระมหาประเสริฐ สุเมโธ"
                    value={formMonkName}
                    onChange={(e) => setFormMonkName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-outline focus:outline-none focus:ring-1 focus:ring-primary bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-1">
                    สังกัดวัดที่สังฆาธิการรับรอง
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น วัดบวรนิเวศวิหาร"
                    value={formTemple}
                    onChange={(e) => setFormTemple(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-outline focus:outline-none focus:ring-1 focus:ring-primary bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-on-surface-variant mb-1">
                    ประเทศปลายทางที่เดินทางไปปฏิบัติศาสนกิจ
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น สหรัฐอเมริกา"
                    value={formDestination}
                    onChange={(e) => setFormDestination(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-outline focus:outline-none focus:ring-1 focus:ring-primary bg-white text-sm"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg hover:brightness-110 transition-all text-sm flex justify-center items-center gap-2"
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">send</span>
                        บันทึกคำร้องและสุ่มรหัส
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ==========================================
// 2. Committee Page Component
// ==========================================
function CommitteePage() {
  const [members, setMembers] = useState<CommitteeMember[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetch(`${API_BASE}/api.php?endpoint=committees`)
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 'success') {
          setMembers(res.data)
        }
      })
      .catch((err) => console.error('Failed to fetch committees:', err))
  }, [])

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const chairman = filteredMembers.filter((m) => Number(m.level) === 1)
  const viceChairmen = filteredMembers.filter((m) => Number(m.level) === 2)
  const regularMembers = filteredMembers.filter((m) => Number(m.level) === 3)

  return (
    <div className="py-12 bg-background">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-primary tracking-widest mb-2 block font-mono">
            ADMINISTRATIVE BOARD
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-on-surface mb-4 font-be-vietnam">
            คณะกรรมการศูนย์ควบคุมการไปต่างประเทศ
          </h1>
          <p className="text-base text-on-surface-variant max-w-2xl mx-auto">
            รายนามคณะกรรมการผู้ทรงคุณวุฒิที่กำกับดูแลและอำนวยความสะดวกในการปฏิบัติศาสนกิจในต่างประเทศของพระภิกษุสามเณร
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto relative mb-12">
          <input
            type="text"
            placeholder="ค้นหาชื่อหรือตำแหน่งกรรมการ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-white text-sm"
          />
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">
            search
          </span>
        </div>

        {/* Level 1: Chairman */}
        {chairman.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xl font-bold text-primary mb-6 flex items-center justify-center gap-3">
              <span className="h-px w-12 bg-primary/30"></span>
              ประธานคณะกรรมการ
              <span className="h-px w-12 bg-primary/30"></span>
            </h2>
            <div className="flex justify-center">
              {chairman.map((item) => (
                <div
                  key={item.id}
                  className="committee-card group relative bg-white border border-outline-variant p-6 max-w-sm w-full transition-all duration-300 hover:shadow-lg rounded-xl"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-primary group-hover:w-full transition-all duration-500 rounded-t-xl"></div>
                  <div className="aspect-[3/4] mb-4 bg-surface-container-high overflow-hidden relative rounded-lg">
                    <img
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={item.name}
                      src={getAssetUrl(item.image_url)}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-on-surface mb-1">{item.name}</h3>
                  <p className="text-sm font-semibold text-primary mb-2">{item.role}</p>
                  <div className="h-px w-12 bg-outline-variant mx-auto mb-3"></div>
                  <p className="text-sm text-on-surface-variant">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Level 2: Vice Chairmen */}
        {viceChairmen.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xl font-bold text-primary mb-6 flex items-center justify-center gap-3">
              <span className="h-px w-12 bg-primary/30"></span>
              รองประธานคณะกรรมการ
              <span className="h-px w-12 bg-primary/30"></span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {viceChairmen.map((item) => (
                <div
                  key={item.id}
                  className="committee-card group relative bg-white border border-outline-variant p-5 flex flex-col md:flex-row gap-5 transition-all duration-300 hover:shadow-md rounded-xl"
                >
                  <div className="absolute top-0 left-0 w-1 h-0 bg-primary group-hover:h-full transition-all duration-500 rounded-l-xl"></div>
                  <div className="w-full md:w-36 aspect-[3/4] bg-surface-container-high overflow-hidden shrink-0 rounded-lg">
                    <img className="w-full h-full object-cover" alt={item.name} src={getAssetUrl(item.image_url)} />
                  </div>
                  <div className="flex flex-col justify-center text-left">
                    <h3 className="text-lg font-bold text-on-surface mb-1">{item.name}</h3>
                    <p className="text-sm font-semibold text-primary mb-2">{item.role}</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Level 3: Members & Secretaries */}
        {regularMembers.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-primary mb-6 flex items-center justify-center gap-3">
              <span className="h-px w-12 bg-primary/30"></span>
              กรรมการและฝ่ายเลขานุการ
              <span className="h-px w-12 bg-primary/30"></span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {regularMembers.map((item) => (
                <div
                  key={item.id}
                  className="committee-card bg-white border border-outline-variant p-4 transition-all hover:bg-surface-container-low rounded-xl text-left"
                >
                  <div className="aspect-square mb-4 bg-surface-container-high overflow-hidden rounded-lg">
                    <img className="w-full h-full object-cover" alt={item.name} src={getAssetUrl(item.image_url)} />
                  </div>
                  <h4 className="text-base font-bold text-on-surface mb-1">{item.name}</h4>
                  <p className="text-xs font-semibold text-primary mb-2">{item.role}</p>
                  <p className="text-xs text-on-surface-variant leading-snug">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ==========================================
// 3. Office & Contact Page Component (Stitch UI)
// ==========================================
function OfficePage() {
  const [offices, setOffices] = useState<Office[]>([])

  useEffect(() => {
    fetch(`${API_BASE}/api.php?endpoint=offices`)
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 'success') {
          setOffices(res.data)
        }
      })
      .catch((err) => console.error('Failed to fetch offices:', err))
  }, [])

  return (
    <div>
      {/* Wat Saket Hero Header Banner */}
      <section className="relative h-64 md:h-80 overflow-hidden flex items-center px-6 md:px-12">
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center brightness-[0.9]"
            style={{ backgroundImage: `url("${getAssetUrl('/images/wat_saket.jpg')}")` }}
          />
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px]"></div>
        </div>
        <div className="relative z-10 max-w-[1200px] mx-auto w-full">
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-md font-be-vietnam">
            ข้อมูลติดต่อและสถานที่
          </h1>
          <p className="text-base md:text-lg text-white/90 max-w-2xl mt-2">
            ศูนย์ควบคุมการไปต่างประเทศของพระภิกษุสามเณร (ศ.ต.ภ.) และจุดบริการกงสุลทั่วประเทศ
          </p>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 my-12">
        {/* Bento Layout for Office Info */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
          {/* Main HQ Card (Wat Saket) */}
          <div className="md:col-span-7 bg-white border border-outline-variant p-6 md:p-8 rounded-xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4 text-primary">
                <span className="material-symbols-outlined text-3xl">account_balance</span>
                <h2 className="text-2xl font-bold font-be-vietnam">สำนักงาน ศ.ต.ภ. (ส่วนกลาง)</h2>
              </div>
              <div className="thai-divider my-4"></div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-primary shrink-0 text-2xl">location_on</span>
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">ที่อยู่</p>
                    <p className="text-base text-on-surface-variant leading-relaxed">
                      วัดสระเกศ ราชวรมหาวิหาร เขตป้อมปราบศัตรูพ่าย กรุงเทพมหานคร 10100
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-primary shrink-0 text-2xl">schedule</span>
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">เวลาทำการ</p>
                    <p className="text-base text-on-surface-variant leading-relaxed">
                      วันจันทร์ - วันศุกร์: 08.30 - 16.30 น.<br />
                      (ปิดทำการในวันหยุดนักขัตฤกษ์)
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-primary shrink-0 text-2xl">call</span>
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">ติดต่อสอบถาม</p>
                    <p className="text-base text-on-surface-variant leading-relaxed">
                      โทรศัพท์: 0 2621 2280<br />
                      โทรสาร: 0 2621 2281
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://maps.google.com/?q=วัดสระเกศราชวรมหาวิหาร"
                target="_blank"
                rel="noreferrer"
                className="bg-primary text-white px-6 py-3 font-bold rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">directions</span>
                ขอเส้นทาง
              </a>
              <button className="border border-primary text-primary px-6 py-3 font-bold rounded-lg hover:bg-primary/5 transition-colors">
                ส่งข้อความติดต่อ
              </button>
            </div>
          </div>

          {/* Interactive Map Card (Wat Saket Map) */}
          <div className="md:col-span-5 flex flex-col">
            <div className="h-full min-h-[340px] bg-surface-container border border-outline-variant rounded-xl overflow-hidden relative shadow-sm group">
              <img
                src={getAssetUrl('/images/wat_saket_map.jpg')}
                alt="Map of Wat Saket"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm border border-outline-variant">
                <span className="material-symbols-outlined text-primary">zoom_in</span>
              </div>
              <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <p className="text-white text-xs font-bold font-mono">
                  พิกัดสำนักงาน: 13.7538° N, 100.5056° E (วัดสระเกศ ราชวรมหาวิหาร)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Passport Services Section */}
        <div className="mt-12">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-3 font-be-vietnam">
              สถานที่ให้บริการหนังสือเดินทาง
            </h2>
            <p className="text-sm md:text-base text-on-surface-variant">
              รายชื่อสำนักงานหนังสือเดินทาง (DPA) ที่พระภิกษุสามเณรสามารถเข้ารับบริการทำหนังสือเดินทางประเภทต่างๆ ทั่วประเทศไทย
            </p>
          </div>

          {/* Search & Filter */}
          <div className="bg-surface-container-low p-4 rounded-xl flex flex-col md:flex-row gap-4 mb-8 items-center border border-outline-variant">
            <div className="relative flex-1 w-full">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                type="text"
                placeholder="ค้นหาจังหวัด หรือ ชื่อสำนักงาน..."
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
              />
            </div>
            <select className="w-full md:w-52 py-2.5 px-4 bg-white border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm">
              <option>ทุกภูมิภาค</option>
              <option>กรุงเทพและปริมณฑล</option>
              <option>ภาคกลาง</option>
              <option>ภาคเหนือ</option>
              <option>ภาคตะวันออกเฉียงเหนือ</option>
              <option>ภาคใต้</option>
            </select>
          </div>

          {/* Location Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offices.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-outline-variant p-6 rounded-xl flex flex-col justify-between hover:border-primary transition-all shadow-sm"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-primary-container/30 text-on-primary-container px-2.5 py-0.5 rounded text-xs font-bold">
                      {item.type === 'MAIN' ? 'กรุงเทพฯ' : item.type === 'BRANCH' ? 'ส่วนภูมิภาค' : 'หน่วยงานราชการ'}
                    </span>
                    <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                  </div>
                  <h3 className="text-lg font-bold text-on-surface mb-2 font-be-vietnam">{item.name}</h3>
                  <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">{item.address}</p>
                </div>
                <div className="border-t border-outline-variant/60 pt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                    <p className="text-on-surface-variant">{item.hours}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">call</span>
                    <p className="text-on-surface-variant font-mono">{item.phone}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 4. Visa & Procedures Page Component (Stitch UI)
// ==========================================
function VisaPage() {
  return (
    <div className="py-12 bg-background">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4 font-be-vietnam">
            ขั้นตอนการดำเนินการ
          </h1>
          <p className="text-base text-on-surface-variant max-w-3xl mx-auto">
            ระเบียบและขั้นตอนการขออนุญาตเดินทางไปต่างประเทศของพระภิกษุสามเณร และการขอหนังสือนำวีซ่า (Visa) เพื่อความถูกต้องและเป็นสิริมงคลในการปฏิบัติศาสนกิจ
          </p>
        </div>

        {/* Procedure Flowchart (Bento Style Grid) */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_tree</span>
            <h2 className="text-2xl font-bold text-on-surface font-be-vietnam">แผนภูมิขั้นตอนการขออนุญาตฯ</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Step 1 */}
            <div className="md:col-span-4 bg-white border border-outline-variant p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center text-primary font-bold">01</div>
                <span className="material-symbols-outlined text-primary bg-primary-container/20 p-2 rounded">edit_document</span>
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">ยื่นคำขอ</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                เจ้าอาวาสต้นสังกัดรวบรวมเอกสารและยื่นเรื่องผ่านเจ้าคณะปกครองตามลำดับชั้น
              </p>
            </div>

            {/* Step 2 */}
            <div className="md:col-span-4 bg-white border border-outline-variant p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center text-primary font-bold">02</div>
                <span className="material-symbols-outlined text-primary bg-primary-container/20 p-2 rounded">fact_check</span>
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">ตรวจสอบเอกสาร</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                สำนักงาน ศ.ต.ภ. ตรวจสอบความถูกต้องของเอกสารและคุณสมบัติของผู้ขอเดินทาง
              </p>
            </div>

            {/* Step 3 */}
            <div className="md:col-span-4 bg-white border border-outline-variant p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center text-primary font-bold">03</div>
                <span className="material-symbols-outlined text-primary bg-primary-container/20 p-2 rounded">verified</span>
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">เสนออนุมัติ</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                เสนอที่ประชุมคณะกรรมการ ศ.ต.ภ. เพื่อพิจารณาอนุมัติการเดินทาง
              </p>
            </div>

            {/* Step 4 */}
            <div className="md:col-span-6 bg-white border border-outline-variant p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center text-primary font-bold">04</div>
                <span className="material-symbols-outlined text-primary bg-primary-container/20 p-2 rounded">description</span>
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">ออกหนังสือนำ</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                เมื่ออนุมัติแล้ว สำนักงานจะออกหนังสือนำไปยื่นคำร้องขอหนังสือเดินทาง (Passport) หรือวีซ่า (Visa)
              </p>
            </div>

            {/* Step 5 */}
            <div className="md:col-span-6 bg-primary-container p-6 rounded-xl flex items-center gap-6 shadow-sm">
              <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shrink-0 shadow">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>flight_takeoff</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-primary-container mb-1">พร้อมเดินทาง</h3>
                <p className="text-sm text-on-primary-container/80 leading-relaxed">
                  รับเอกสารฉบับสมบูรณ์เพื่อดำเนินการในขั้นตอนต่อไปที่กระทรวงการต่างประเทศ
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="thai-divider my-12"></div>

        {/* Visa Application Steps & Document Checklist */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>language</span>
            <h2 className="text-2xl font-bold text-on-surface font-be-vietnam">ขั้นตอนการขอหนังสือนำวีซ่า (Visa)</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Detailed Steps Timeline */}
            <div className="space-y-6">
              <div className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">1</div>
                  <div className="w-px h-full bg-outline-variant mt-2"></div>
                </div>
                <div className="pb-6">
                  <span className="text-xs font-bold text-primary">ขั้นตอนที่ 1</span>
                  <h3 className="text-lg font-bold text-on-surface mb-1">ตรวจสอบประเภทวีซ่า</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    ตรวจสอบประเภทวีซ่าตามวัตถุประสงค์การเดินทาง เช่น วีซ่าเพื่อการเผยแผ่ศาสนา หรือวีซ่าท่องเที่ยวปฏิบัติธรรม
                  </p>
                </div>
              </div>

              <div className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">2</div>
                  <div className="w-px h-full bg-outline-variant mt-2"></div>
                </div>
                <div className="pb-6">
                  <span className="text-xs font-bold text-primary">ขั้นตอนที่ 2</span>
                  <h3 className="text-lg font-bold text-on-surface mb-1">จัดเตรียมเอกสารสำคัญ</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    รวบรวมเอกสารส่วนตัวและเอกสารรับรองจากวัดต้นสังกัด รวมถึงหนังสือเชิญจากต่างประเทศ (ถ้ามี)
                  </p>
                </div>
              </div>

              <div className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">3</div>
                </div>
                <div>
                  <span className="text-xs font-bold text-primary">ขั้นตอนที่ 3</span>
                  <h3 className="text-lg font-bold text-on-surface mb-1">ยื่นคำร้องที่ ศ.ต.ภ.</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    ยื่นความประสงค์ขอหนังสือนำวีซ่าต่อสำนักงาน ศ.ต.ภ. เพื่อออกหนังสือถึงสถานทูตหรือสถานกงสุล
                  </p>
                </div>
              </div>
            </div>

            {/* Document Checklist Card */}
            <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm h-fit">
              <div className="bg-primary p-4 flex items-center gap-3 text-white">
                <span className="material-symbols-outlined">list_alt</span>
                <h3 className="text-lg font-bold">รายการเอกสารที่ต้องใช้</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-3 p-3 bg-surface-container-low rounded-lg">
                  <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <div>
                    <p className="text-sm font-bold text-on-surface">หนังสือเดินทาง (Passport)</p>
                    <p className="text-xs text-on-surface-variant">ที่มีอายุเหลือไม่น้อยกว่า 6 เดือน</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-surface-container-low rounded-lg">
                  <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <div>
                    <p className="text-sm font-bold text-on-surface">มติมหาเถรสมาคม / เอกสารอนุมัติจาก ศ.ต.ภ.</p>
                    <p className="text-xs text-on-surface-variant">ฉบับจริงหรือสำเนาที่รับรองถูกต้อง</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-surface-container-low rounded-lg">
                  <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <div>
                    <p className="text-sm font-bold text-on-surface">หนังสือเชิญจากวัดหรือหน่วยงานในต่างประเทศ</p>
                    <p className="text-xs text-on-surface-variant">ต้องระบุวัตถุประสงค์และระยะเวลาการเดินทางชัดเจน</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-surface-container-low rounded-lg">
                  <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <div>
                    <p className="text-sm font-bold text-on-surface">ใบสุทธิพระภิกษุสามเณร</p>
                    <p className="text-xs text-on-surface-variant">สำเนาหน้าที่มีชื่อและข้อมูลการอุปสมบท</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-outline-variant">
                  <button className="w-full bg-secondary-container text-on-secondary-container py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-secondary-container/80 transition-colors">
                    <span className="material-symbols-outlined text-lg">download</span>
                    ดาวน์โหลดแบบฟอร์มทั้งหมด
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 5. Announcements List Page Component
// ==========================================
function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const limit = 8

  useEffect(() => {
    setLoading(true)
    fetch(`${API_BASE}/api.php?endpoint=announcements&search=${encodeURIComponent(searchTerm)}&page=${currentPage}&limit=${limit}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 'success') {
          setAnnouncements(res.data)
          if (res.pagination) {
            setTotalPages(res.pagination.total_pages)
          }
        }
      })
      .catch((err) => console.error('Failed to fetch announcements:', err))
      .finally(() => setLoading(false))
  }, [searchTerm, currentPage])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to page 1 on search
  }

  return (
    <div className="py-12 bg-background">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="relative py-12 px-6 md:px-12 mb-12 rounded-2xl overflow-hidden border border-outline-variant bg-gradient-to-r from-primary via-primary/90 to-primary-fixed-dim text-white shadow-md">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
            style={{ backgroundImage: `url("${getAssetUrl('/images/hero_bg.jpg')}")` }}
          />
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold text-primary-fixed tracking-widest mb-2 block font-mono">
              OFFICIAL APPROVED LISTS
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 font-be-vietnam text-white">
              ประกาศรายชื่อพระภิกษุสามเณรผู้ได้รับอนุมัติเดินทาง
            </h1>
            <p className="text-base text-surface-container-low max-w-2xl mx-auto">
              สืบค้นข้อมูลใบอนุมัติเดินทางไปปฏิบัติศาสนกิจในต่างประเทศ (เล่มหนังสือเดินทางราชการ)
              จากฐานข้อมูลระบบตรวจประทับ ศ.ต.ภ.
            </p>
          </div>
        </div>

        {/* Table & Controls Panel */}
        <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-bold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined">table_chart</span>
              ตารางข้อมูลใบอนุมัติเดินทางล่าสุด
            </h3>
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="ค้นหาชื่อ, สังกัดวัด, ปลายทาง..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-white text-xs md:text-sm"
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
                search
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
              <p className="text-sm text-on-surface-variant">กำลังดึงข้อมูลฐานข้อมูล...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="py-20 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-2">find_in_page</span>
              <p className="text-sm text-on-surface-variant">ไม่พบรายการข้อมูลในฐานข้อมูลที่ค้นหา</p>
            </div>
          ) : (
            <div>
              {/* Responsive table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant font-bold">
                      <th className="p-3">เลขที่หนังสืออนุมัติ</th>
                      <th className="p-3">พระภิกษุสามเณร</th>
                      <th className="p-3">สังกัดวัด</th>
                      <th className="p-3">ประเทศปลายทาง</th>
                      <th className="p-3">วันที่ได้รับอนุมัติ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.map((item) => (
                      <tr key={item.id} className="border-b border-outline-variant/60 hover:bg-surface-container-lowest transition-colors">
                        <td className="p-3 font-semibold text-primary">{item.announcement_number}</td>
                        <td className="p-3 font-semibold">{item.monk_name}</td>
                        <td className="p-3 text-on-surface-variant">{item.temple}</td>
                        <td className="p-3 text-on-surface-variant">
                          <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold">
                            {item.destination}
                          </span>
                        </td>
                        <td className="p-3 text-on-surface-variant">{item.approve_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-outline-variant">
                  <span className="text-xs text-on-surface-variant">
                    หน้า {currentPage} จากทั้งหมด {totalPages} หน้า
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 bg-surface border border-outline rounded-lg text-xs font-semibold hover:bg-surface-container disabled:opacity-50 transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                      ก่อนหน้า
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 bg-surface border border-outline rounded-lg text-xs font-semibold hover:bg-surface-container disabled:opacity-50 transition-all flex items-center gap-1"
                    >
                      ถัดไป
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 6. Travel Guide Page Component
// ==========================================
function GuidePage() {
  const [activeSection, setActiveSection] = useState('prep')
  const [searchText, setSearchText] = useState('')

  const sections = [
    {
      id: 'prep',
      title: '๑. การเตรียมตัวก่อนเดินทาง',
      icon: 'inventory_2',
      content: [
        'พระภิกษุสามเณรผู้ประสงค์ขอเดินทางจะต้องมีใบอนุญาตเดินทาง ศ.ต.ภ. อย่างถูกต้อง',
        'ควรจัดเตรียมของใช้อัฐบริขารส่วนตัว ยารักษาโรคประจำตัว และผ้าไตรจีวรสำรองให้เรียบร้อย',
        'เอกสารสำคัญที่ต้องถือติดตัว ได้แก่ ใบพาสปอร์ตราชการ (สีน้ำเงิน) ใบอนุมัติ ศ.ต.ภ. ต้นฉบับ และจดหมายรับรองจากสมาคมพุทธในประเทศปลายทาง',
      ],
    },
    {
      id: 'rules',
      title: '๒. ข้อปฏิบัติระหว่างเดินทาง',
      icon: 'airline_seat_recline_extra',
      content: [
        'รักษาจริยวัตรและสมณสัญญาอย่างเคร่งครัด สงบเสงี่ยมงามในธรรมวินัยในทุกกิริยาบทระหว่างโดยสารเครื่องบินหรือระบบขนส่งสาธารณะ',
        'การขบฉันภัตตาหารในต่างแดนควรคำนึงถึงกาลเวลาที่กำหนดตามวินัยสงฆ์ และงดเว้นการฉันอาหารหลังเที่ยงเว้นแต่น้ำปานะ',
        'การจัดสรรที่นั่งในยานพาหนะสาธารณะควรหลีกเลี่ยงการนั่งข้างสตรีเพศอย่างใกล้ชิดหากไม่มีผู้ร่วมเดินทางที่เป็นสุภาพบุรุษ',
      ],
    },
    {
      id: 'stay',
      title: '๓. การปฏิบัติตนเมื่อพำนักในต่างประเทศ',
      icon: 'temple_buddhist',
      content: [
        'สังกัดพำนักอยู่ ณ วัดหรือศูนย์ปฏิบัติธรรมตามพิกัดที่ระบุไว้ในใบคำร้อง และไม่จาริกออกไปในสถานที่อโคจร',
        'เอื้อเฟื้อต่อประเพณีและวัฒนธรรมท้องถิ่นของประเทศนั้นๆ โดยไม่กระทบต่อข้อหลักพระวินัย',
        'เมื่อมีเหตุต้องอยู่พำนักเกินกำหนดเนื่องจากการขยายเวลาการเผยแผ่ จะต้องดำเนินการยื่นคำขออนุมัติขยายเวลากับ ศ.ต.ภ. ล่วงหน้าอย่างน้อย ๓๐ วัน',
      ],
    },
    {
      id: 'emergency',
      title: '๔. ข้อมูลติดต่อและเหตุฉุกเฉิน',
      icon: 'emergency',
      content: [
        'เบอร์ติดต่อด่วนสำนักงาน ศ.ต.ภ. กลาง: 02-629-5854',
        'เบอร์ติดต่อสถานเอกอัครราชทูตและสถานกงสุลใหญ่ไทยประจำประเทศนั้นๆ ควรคัดลอกติดตัวไว้เสมอ',
        'กรณีเจ็บไข้ได้ป่วยเฉุกเฉินหรือเกิดอุบัติเหตุ ควรติดต่อประสานงานสมาคมพุทธสงฆ์ไทยในต่างแดนหรือหัวหน้าสายพระธรรมทูตโดยทันทีเพื่อประสานขอรับความช่วยเหลือทางการแพทย์',
      ],
    },
  ]

  // Filter content based on search text
  const filteredSections = sections.map((sec) => ({
    ...sec,
    content: sec.content.filter((text) => text.toLowerCase().includes(searchText.toLowerCase())),
  })).filter((sec) => sec.content.length > 0 || sec.title.toLowerCase().includes(searchText.toLowerCase()))

  return (
    <div className="py-12 bg-background">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="relative py-12 px-6 md:px-12 mb-12 rounded-2xl overflow-hidden border border-outline-variant bg-gradient-to-r from-primary via-primary/90 to-primary-fixed-dim text-white shadow-md">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
            style={{ backgroundImage: `url("${getAssetUrl('/images/hero_bg.jpg')}")` }}
          />
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold text-primary-fixed tracking-widest mb-2 block font-mono">
              TRAVELER MANUALS
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 font-be-vietnam text-white">
              คู่มือการเดินทางและการเดินทางไปต่างแดน
            </h1>
            <p className="text-base text-surface-container-low max-w-2xl mx-auto">
              คำแนะนำสำหรับพระธรรมทูตและพระสังฆาธิการระหว่างปฏิบัติภารกิจทางพระพุทธศาสนาในต่างแดน
              เพื่อธำรงไว้ซึ่งความเลื่อมใสศรัทธา
            </p>
          </div>
        </div>

        {/* Grid navigation layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar controls */}
          <div className="md:col-span-4 space-y-4">
            {/* Guide search */}
            <div className="relative">
              <input
                type="text"
                placeholder="สืบค้นเนื้อหาคู่มือ..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-white text-xs md:text-sm"
              />
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
                search
              </span>
            </div>

            {/* Section tabs */}
            <div className="bg-white border border-outline-variant rounded-xl overflow-hidden p-2 space-y-1">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-2 transition-all ${
                    activeSection === sec.id ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{sec.icon}</span>
                  {sec.title}
                </button>
              ))}
            </div>
          </div>

          {/* Guide contents */}
          <div className="md:col-span-8 bg-white border border-outline-variant rounded-xl p-6 md:p-8 shadow-sm">
            {filteredSections.length === 0 ? (
              <div className="text-center py-10">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">info</span>
                <p className="text-sm text-on-surface-variant">ไม่พบข้อมูลหัวข้อคู่มือที่คุณกำลังสืบค้น</p>
              </div>
            ) : (
              sections
                .filter((sec) => sec.id === activeSection)
                .map((sec) => (
                  <div key={sec.id} className="animate-fadeIn">
                    <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2 border-b border-outline-variant pb-4">
                      <span className="material-symbols-outlined">{sec.icon}</span>
                      {sec.title}
                    </h3>
                    <div className="space-y-6">
                      {sec.content.map((pText, pIdx) => (
                        <div key={pIdx} className="flex gap-3 items-start text-sm leading-relaxed text-on-surface-variant">
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary shrink-0 flex items-center justify-center font-bold text-xs">
                            {pIdx + 1}
                          </div>
                          <p>{pText}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
