import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { nakesApi } from '../../lib/api'
import type { PatientQueueItem, NakesDetail, ConsultationResult, NakesPatientDetailData } from '../../lib/types'


// Subcomponents & Views
import { ToastNotif } from './components/Common'
import PasienView from './components/PasienView'
import NotifikasiView from './components/NotifikasiView'
import ProfilNakesView from './components/ProfilNakesView'
import KeluhanView from './components/KeluhanView'

type ActiveView = 'pasien' | 'notif' | 'profil' | 'keluhan'
type QueueFilter = 'all' | 'bahaya' | 'waswas' | 'aman'

export default function DokterDashboardPage({ onLogout }: { onLogout: () => void }) {

  const { user } = useAuth()

  const [activeView, setActiveView] = useState<ActiveView>('pasien')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const searchQuery = ''
  const [queue, setQueue] = useState<PatientQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [contacted, setContacted] = useState<Set<string>>(new Set())
  const [chartParam, setChartParam] = useState<'glucose' | 'bp'>('glucose')
  const [chartRange, setChartRange] = useState<7 | 14>(7)
  const [trenPatientId, setTrenPatientId] = useState<string | null>(null)
  const [trenSearch, setTrenSearch] = useState('')

  // Detail pasien (real BE) — dipakai modal antrean & panel tren
  const [patientDetail, setPatientDetail] = useState<NakesPatientDetailData | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [escalationCount, setEscalationCount] = useState(0)


  // Doctor profile states
  const [doctorProfile, setDoctorProfile] = useState<NakesDetail | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [consultations, setConsultations] = useState<ConsultationResult[]>([])

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type })
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 3800)
  }, [])

  const fetchData = useCallback(async () => {
    // Antrean pasien adalah konten inti dashboard. Konsultasi bersifat pelengkap —
    // kegagalannya tidak boleh mengosongkan seluruh dashboard. Pakai allSettled
    // agar satu endpoint yang error tidak menjatuhkan yang lain.
    //
    // Backend (Railway) bisa cold-start dan membalas 5xx transien pada request
    // pertama setelah idle — retry dengan backoff agar UX tidak langsung gagal.
    const getQueueWithRetry = async (attempts = 3) => {
      for (let i = 0; i < attempts; i++) {
        try {
          return await nakesApi.getPatientQueue()
        } catch (e) {
          const status = (e as { status?: number })?.status
          const transient = status === undefined || status >= 500
          if (i < attempts - 1 && transient) {
            await new Promise(r => setTimeout(r, 1200 * (i + 1)))
            continue
          }
          throw e
        }
      }
      throw new Error('unreachable')
    }

    const [queueRes, consultationsRes] = await Promise.allSettled([
      getQueueWithRetry(),
      nakesApi.getConsultations(),
    ])

    if (queueRes.status === 'fulfilled') {
      setQueue(queueRes.value.data)
      setFetchError(null)
    } else {
      const err = queueRes.reason as { status?: number; message?: string } | undefined
      console.error('Gagal memuat antrean pasien:', err)
      const detail =
        err?.status === 401
          ? 'Sesi Anda telah berakhir. Silakan login kembali.'
          : err?.status && err.status >= 500
            ? `Server sedang bermasalah (error ${err.status}). Kami akan mencoba lagi otomatis.`
            : err?.status
              ? `Gagal memuat data (error ${err.status}).`
              : 'Gagal memuat data. Periksa koneksi Anda.'
      setFetchError(detail)
    }

    if (consultationsRes.status === 'fulfilled') {
      setConsultations(consultationsRes.value)
    }

    setLoading(false)
  }, [])

  const fetchDoctorProfile = useCallback(async () => {
    try {
      setLoadingProfile(true)
      const res = await nakesApi.getProfile()
      setDoctorProfile(res)
      setProfileError(null)
    } catch {
      setProfileError('Gagal memuat profil nakes.')
    } finally {
      setLoadingProfile(false)
    }
  }, [])

  const handleReviewConsultation = useCallback(async (id: string, notes: string) => {
    try {
      await nakesApi.replyConsultation(id, notes)
      showToast('Rekomendasi keluhan berhasil dikirim', 'ok')
      fetchData()
    } catch {
      showToast('Gagal mengirim rekomendasi keluhan', 'err')
    }
  }, [fetchData, showToast])

  const fetchEscalationCount = useCallback(async () => {
    try {
      const res = await nakesApi.getEscalations({ page: 1, size: 100 })
      setEscalationCount(res.data.filter(e => e.status === 'sent' || e.status === 'viewed').length)
    } catch {
      /* badge stays 0 if fail */
    }
  }, [])

  useEffect(() => {
    fetchData()
    fetchDoctorProfile()
    fetchEscalationCount()
    intervalRef.current = setInterval(() => {
      fetchData()
      fetchEscalationCount()
    }, 60_000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [fetchData, fetchDoctorProfile, fetchEscalationCount])

  const selectedPatient = useMemo(() => queue.find(p => p.patient_id === selectedId) ?? null, [queue, selectedId])
  const trenPatient = useMemo(() => queue.find(p => p.patient_id === trenPatientId) ?? null, [queue, trenPatientId])

  const detailsCacheRef = useRef<Record<string, NakesPatientDetailData>>({})

  // Ambil detail klinis pasien (baseline, log harian, tren skor, faktor risiko) dari BE
  // setiap kali pasien dibuka di modal antrean atau panel tren.
  const openPatientId = selectedId ?? trenPatientId
  useEffect(() => {
    if (!openPatientId) { setPatientDetail(null); return }
    let cancelled = false

    const cached = detailsCacheRef.current[openPatientId]
    if (cached) {
      setPatientDetail(cached)
      setDetailLoading(false)
    } else {
      setDetailLoading(true)
      setPatientDetail(null)
    }

    nakesApi.getPatientDetail(openPatientId)
      .then(d => {
        if (!cancelled) {
          detailsCacheRef.current[openPatientId] = d
          setPatientDetail(d)
        }
      })
      .catch(() => {
        if (!cancelled && !detailsCacheRef.current[openPatientId]) {
          setPatientDetail(null)
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false)
      })

    return () => { cancelled = true }
  }, [openPatientId])

  const handleContact = useCallback((id: string) => {
    setContacted(prev => new Set([...prev, id]))
    showToast('Pasien berhasil dihubungi', 'ok')
  }, [showToast])

  const handleLogout = useCallback(() => {
    onLogout()
  }, [onLogout])

  // KPI values — status enum sudah dari BE (bahaya | waswas | aman)
  const totalCount = queue.length
  const bahayaCount = queue.filter(p => p.status === 'bahaya').length
  const waswasCount = queue.filter(p => p.status === 'waswas').length
  const amanCount = queue.filter(p => p.status === 'aman').length
  const pendingComplaintsCount = consultations.filter(c => c.status === 'open').length

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Plus Jakarta Sans, sans-serif', background: '#F4F6FA' }}>
      <div style={{ flex: 1, display: 'flex', background: '#F4F6FA', padding: 10, gap: 10, overflow: 'hidden', height: '100%', width: '100%' }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .anim-blink { }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #c1c9d8; border-radius: 3px; }
      `}</style>

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      {/* ── COLLAPSIBLE SIDEBAR ── */}
      <div style={{
        width: isSidebarCollapsed ? 68 : 240,
        minWidth: isSidebarCollapsed ? 68 : 240,
        background: 'linear-gradient(180deg, #1E2775 0%, #161C5C 100%)',
        borderRadius: 18,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        boxShadow: '4px 0 24px rgba(26, 32, 102, 0.18)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        color: '#ffffff',
        padding: '14px 0 12px',
      }}>
        {/* Header (Branding Box) */}
        <div style={{ padding: '0 12px 12px' }}>
          <div style={{
            background: isSidebarCollapsed ? 'transparent' : 'rgba(255, 255, 255, 0.06)',
            border: isSidebarCollapsed ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 12,
            padding: isSidebarCollapsed ? 0 : '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
            transition: 'all 0.3s',
          }}>
            {isSidebarCollapsed ? (
              <img
                src="/logo sehatiku.png"
                alt="Sehatiku"
                onClick={() => setIsSidebarCollapsed(false)}
                style={{
                  height: 36,
                  width: 36,
                  objectFit: 'contain',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                title="Expand Sidebar"
              />
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: 'rgba(255, 255, 255, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <img src="/logo sehatiku.png" alt="Sehatiku" style={{ height: 22, width: 22, objectFit: 'contain' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', lineHeight: '1.2' }}>Sehatiku</span>
                    <span style={{ fontSize: 10.5, color: 'rgba(255, 255, 255, 0.55)', marginTop: 2, fontWeight: 600 }}>Portal Dokter</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarCollapsed(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: 8,
                    width: 30,
                    height: 30,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  title="Collapse Sidebar"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>


        {/* Grouped menu items with dynamic search filtering */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(() => {
            const groups: Array<{
              title: string
              items: Array<{ id: ActiveView; label: string; count?: number; icon: React.ReactNode }>
            }> = [
                {
                  title: 'Layanan Medis',
                  items: [
                    { id: 'pasien', label: 'Pasien Saya', count: totalCount, icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
                    { id: 'keluhan', label: 'Review Keluhan', count: pendingComplaintsCount, icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg> }
                  ]
                },
                {
                  title: 'Sistem',
                  items: [
                    { id: 'notif', label: 'Notifikasi', count: escalationCount, icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg> },
                    { id: 'profil', label: 'Profil Saya', icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg> }
                  ]
                }
              ]

            return groups.map((group, gIdx) => {
              const filteredItems = group.items.filter(item =>
                item.label.toLowerCase().includes(searchQuery.toLowerCase())
              )

              if (filteredItems.length === 0) return null

              return (
                <div key={group.title} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  paddingTop: gIdx > 0 ? 12 : 0,
                  borderTop: gIdx > 0 ? '1px dashed rgba(255, 255, 255, 0.12)' : 'none',
                }}>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: 'rgba(255, 255, 255, 0.48)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.9px',
                    padding: '0 6px 4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    opacity: isSidebarCollapsed ? 0 : 1,
                    height: isSidebarCollapsed ? 0 : 'auto',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}>
                    {group.title}
                  </div>

                  {filteredItems.map(item => {
                    const isSelected = activeView === item.id
                    return (
                      <div
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '9px 10px',
                          borderRadius: 10,
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                          color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                          transition: 'all 0.2s',
                          justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                        }}
                        onMouseEnter={e => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
                          }
                        }}
                        onMouseLeave={e => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)'
                          }
                        }}
                        title={isSidebarCollapsed ? item.label : undefined}
                      >
                        <div style={{
                          color: isSelected ? '#0D9488' : 'inherit',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 22,
                        }}>
                          {item.icon}
                        </div>
                        <span style={{
                          fontSize: 13,
                          fontWeight: isSelected ? 700 : 500,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          opacity: isSidebarCollapsed ? 0 : 1,
                          width: isSidebarCollapsed ? 0 : 'auto',
                          marginLeft: isSidebarCollapsed ? 0 : 2,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          flex: 1,
                        }}>
                          {item.label}
                        </span>
                        {item.count !== undefined && item.count > 0 && !isSidebarCollapsed && (
                          <span style={{
                            background: item.id === 'notif' ? '#EF4444' : item.id === 'keluhan' ? '#F59E0B' : '#0D9488',
                            color: '#ffffff',
                            fontSize: 11,
                            fontWeight: 800,
                            borderRadius: 12,
                            padding: '2px 8px',
                          }}>
                            {item.count}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })
          })()}
        </div>

        {/* Nakes identity card (who is logged in) */}
        <div style={{ padding: '8px 10px 0' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 12,
            padding: isSidebarCollapsed ? 0 : '9px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
            height: isSidebarCollapsed ? 40 : 'auto',
            transition: 'all 0.3s',
            overflow: 'hidden',
          }}>
            <div style={{
              width: isSidebarCollapsed ? 28 : 32,
              height: isSidebarCollapsed ? 28 : 32,
              borderRadius: 9,
              flexShrink: 0,
              background: 'rgba(13, 148, 136, 0.18)',
              color: '#2DD4BF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 800,
            }}>
              {(user?.name ?? 'N')
                .replace(/^dr\.?\s*/i, '')
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map(w => w[0]?.toUpperCase())
                .join('')}
            </div>
            <div style={{
              minWidth: 0,
              flex: 1,
              opacity: isSidebarCollapsed ? 0 : 1,
              width: isSidebarCollapsed ? 0 : 'auto',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name ?? 'Nakes'}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.45)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.role === 'kader' ? 'Kader Pemantauan' : user?.role === 'admin' ? 'Admin Faskes' : 'Dokter Penanggung Jawab'}
              </div>
            </div>
          </div>
        </div>

        {/* Pinned Logout Action (pinned bottom) */}
        <div style={{
          padding: '10px 0 0',
          borderTop: '1px dashed rgba(255, 255, 255, 0.12)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 10px',
              borderRadius: 10,
              cursor: 'pointer',
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#EF4444',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              width: isSidebarCollapsed ? 36 : 'calc(100% - 20px)',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              margin: '0 auto',
              border: '1px solid rgba(239, 68, 68, 0.25)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)'
            }}
            title={isSidebarCollapsed ? "Keluar Sesi" : undefined}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <span style={{
              fontSize: 14.5,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              opacity: isSidebarCollapsed ? 0 : 1,
              width: isSidebarCollapsed ? 0 : 'auto',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              Keluar Sesi
            </span>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, background: '#ffffff', borderRadius: 18, boxShadow: '0 8px 30px rgba(15, 36, 68, 0.04)', border: '1px solid #E2E8F0' }}>

        {/* Topbar */}
        <header style={{
          height: 48, background: '#fff', borderBottom: '1px solid #DCDFE8', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px',
        }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#2B2D42' }}>
              {activeView === 'pasien' ? 'Pasien Saya'
                : activeView === 'notif' ? 'Notifikasi & Eskalasi'
                  : activeView === 'keluhan' ? 'Review Keluhan Pasien'
                    : 'Profil Tenaga Medis'}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: '#636B78' }}>
              {activeView === 'pasien'
                ? `${totalCount} pasien terdaftar`
                : activeView === 'notif'
                  ? 'Alert risiko & tindak lanjut klinis'
                  : activeView === 'keluhan'
                    ? `${pendingComplaintsCount} keluhan menunggu respons`
                    : 'Informasi akun Portal Sehatiku'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F0FDF8', border: '1px solid #A7ECD9', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#159E84' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0D9488', display: 'inline-block' }} />
              Mode: Dokter
            </span>
            <button onClick={() => setActiveView('notif')} title="Notifikasi & Eskalasi" style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#636B78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {escalationCount > 0 && (
                <span style={{
                  position: 'absolute', top: 0, right: 0, width: 14, height: 14,
                  background: '#EF4444', borderRadius: '50%', fontSize: 9, fontWeight: 700,
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {escalationCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* View area */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {/* Error state */}
          {fetchError && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 12 }}>
              <span style={{ fontSize: 36 }}>&#x26A0;&#xFE0F;</span>
              <p style={{ margin: 0, fontSize: 15, color: '#636B78' }}>{fetchError}</p>
              <button onClick={fetchData} style={{
                background: '#5B6BF0', color: '#fff', border: 'none', borderRadius: 8,
                padding: '8px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}>
                Coba Lagi
              </button>
            </div>
          )}

          {/* ── VIEW: Pasien Saya (Antrean + Tren digabung) ───────────────────── */}
          {!fetchError && activeView === 'pasien' && (
            <PasienView
              loading={loading}
              queue={queue}
              queueFilter={queueFilter}
              setQueueFilter={setQueueFilter}
              setSelectedId={setSelectedId}
              selectedPatient={selectedPatient}
              contacted={contacted}
              handleContact={handleContact}
              chartParam={chartParam}
              setChartParam={setChartParam}
              chartRange={chartRange}
              setChartRange={setChartRange}
              consultations={consultations}
              totalCount={totalCount}
              bahayaCount={bahayaCount}
              waswasCount={waswasCount}
              amanCount={amanCount}
              setTrenPatientId={setTrenPatientId}
              trenPatient={trenPatient}
              trenSearch={trenSearch}
              setTrenSearch={setTrenSearch}
              patientDetail={patientDetail}
              detailLoading={detailLoading}
            />
          )}

          {/* ── VIEW: Review Keluhan Pasien ─────────────────────────────────── */}
          {!fetchError && activeView === 'keluhan' && (
            <KeluhanView
              queue={queue}
              consultations={consultations}
              onReviewConsultation={handleReviewConsultation}
            />
          )}

          {/* ── VIEW: Notifikasi & Eskalasi ─────────────────────────────────────
              Selalu di-mount (disembunyikan via CSS, bukan unmount) agar data
              sudah siap saat tab dibuka — tidak perlu fetch ulang tiap switch. */}
          <div style={{ display: !fetchError && activeView === 'notif' ? 'flex' : 'none', flex: 1, minHeight: 0, flexDirection: 'column', overflow: 'hidden' }}>
            <NotifikasiView showToast={showToast} onUpdateEscalationCount={setEscalationCount} />
          </div>

          {/* ── VIEW 4: Profil Saya (sama, tetap ter-mount) ─────────────────── */}
          <div style={{ display: !fetchError && activeView === 'profil' ? 'flex' : 'none', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
            <ProfilNakesView
              profile={doctorProfile}
              loading={loadingProfile}
              error={profileError}
              queueLength={queue.length}
              bahayaCount={bahayaCount}
              waswasCount={waswasCount}
              amanCount={amanCount}
            />
          </div>
        </div>
      </div>

    </div>

      {/* Toast */}
      {toast && <ToastNotif msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Logout confirm modal ── */}
      {showLogoutConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(43,45,66,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)', animation: 'fadeIn 0.2s ease-out' }}
          onMouseDown={e => { if (e.target === e.currentTarget) setShowLogoutConfirm(false) }}
        >
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 380, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(15,36,68,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#2B2D42' }}>Keluar dari Portal?</p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#8A93A1' }}>Anda perlu login kembali untuk masuk.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowLogoutConfirm(false)} style={{
                flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid #DCDFE8', background: '#fff',
                color: '#636B78', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}>
                Batal
              </button>
              <button onClick={() => { setShowLogoutConfirm(false); handleLogout() }} style={{
                flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: '#EF4444',
                color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}>
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
