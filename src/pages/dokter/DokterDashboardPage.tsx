import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { nakesApi } from '../../lib/api'
import type { PatientQueueItem, NakesDetail, ConsultationResult, NakesPatientDetailData } from '../../lib/types'
import { initials } from '../../lib/utils'

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

  const handleDoctorBadgeClick = useCallback(() => {
    setActiveView('profil')
    fetchDoctorProfile()
  }, [fetchDoctorProfile])

  const handleReviewConsultation = useCallback(async (id: string, notes: string) => {
    try {
      await nakesApi.replyConsultation(id, notes)
      showToast('Rekomendasi keluhan berhasil dikirim', 'ok')
      fetchData()
    } catch {
      showToast('Gagal mengirim rekomendasi keluhan', 'err')
    }
  }, [fetchData, showToast])

  useEffect(() => {
    fetchData()
    intervalRef.current = setInterval(fetchData, 60_000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [fetchData])

  const selectedPatient = useMemo(() => queue.find(p => p.patient_id === selectedId) ?? null, [queue, selectedId])
  const trenPatient = useMemo(() => queue.find(p => p.patient_id === trenPatientId) ?? null, [queue, trenPatientId])

  // Ambil detail klinis pasien (baseline, log harian, tren skor, faktor risiko) dari BE
  // setiap kali pasien dibuka di modal antrean atau panel tren.
  const openPatientId = selectedId ?? trenPatientId
  useEffect(() => {
    if (!openPatientId) { setPatientDetail(null); return }
    let cancelled = false
    setDetailLoading(true)
    setPatientDetail(null)
    nakesApi.getPatientDetail(openPatientId)
      .then(d => { if (!cancelled) setPatientDetail(d) })
      .catch(() => { if (!cancelled) setPatientDetail(null) })
      .finally(() => { if (!cancelled) setDetailLoading(false) })
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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Plus Jakarta Sans, sans-serif', background: '#F4F5F7' }}>
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
      <aside style={{
        width: 252, minWidth: 252,
        background: 'linear-gradient(180deg, #1E2775 0%, #161C5C 100%)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        color: '#fff', position: 'relative', zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 24px 16px', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
          <img
            src="/logo_sehatiku_horizontal.png"
            alt="Sehatiku"
            style={{ height: 34, objectFit: 'contain', display: 'block' }}
          />
        </div>

        {/* Nav */}
        <div style={{ padding: '14px 10px 8px', flex: 1, overflowY: 'auto' }}>
          <p style={{ margin: '16px 0 10px 10px', fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.42)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Menu Klinis</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[
              {
                id: 'pasien' as const, label: 'Pasien Saya', icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                )
              },
              {
                id: 'keluhan' as const, label: 'Review Keluhan', icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                )
              },
              {
                id: 'notif' as const, label: 'Notifikasi', icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                )
              },
            ].map(nav => {
              const active = activeView === nav.id
              return (
                <button key={nav.id} onClick={() => setActiveView(nav.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8,
                  border: 'none',
                  background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.65)', cursor: 'pointer', width: '100%', textAlign: 'left',
                  fontWeight: active ? 700 : 500, fontSize: 13, fontFamily: 'Plus Jakarta Sans, sans-serif',
                  transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)' } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' } }}
                >
                  <span style={{ opacity: active ? 1 : 0.75, display: 'flex', alignItems: 'center', width: 18, flexShrink: 0, color: active ? '#0D9488' : 'currentColor' }}>{nav.icon}</span>
                  <span style={{ flex: 1 }}>{nav.label}</span>
                  {nav.id === 'pasien' && totalCount > 0 && (
                    <span style={{ background: '#0D9488', color: '#fff', borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>
                      {totalCount}
                    </span>
                  )}
                  {nav.id === 'keluhan' && pendingComplaintsCount > 0 && (
                    <span style={{ background: '#F59E0B', color: '#fff', borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>
                      {pendingComplaintsCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Patient summary */}
          <div style={{ margin: '20px 2px 0', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ margin: '12px 0 10px 10px', fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.42)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Ringkasan Pasien Saya</p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { dot: '#EF4444', label: 'Risiko Bahaya', val: bahayaCount, valColor: '#FCA5A5' },
                { dot: '#F59E0B', label: 'Perlu Pantau', val: waswasCount, valColor: '#FCD34D' },
                { dot: '#0D9488', label: 'Status Aman', val: amanCount, valColor: '#5EEAD4' },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 10px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: item.valColor, fontFamily: 'IBM Plex Mono, monospace' }}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Doctor badge */}
        <div
          onClick={handleDoctorBadgeClick}
          style={{
            margin: '8px 12px 14px', borderRadius: 10,
            padding: '10px 12px', background: 'rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 10,
            cursor: 'pointer', transition: 'background 0.18s',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #0D9488, #38BDF8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 13, flexShrink: 0,
          }}>
            {initials(doctorProfile?.full_name ?? user?.name ?? 'DR')}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {doctorProfile?.full_name ?? user?.name ?? 'Dokter'}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.42)', fontWeight: 500 }}>
              {doctorProfile?.specialization ?? (user?.role === 'dokter' ? 'Dokter Umum' : user?.role === 'kader' ? 'Kader Kesehatan' : 'Admin')}
            </p>
          </div>
        </div>

        {/* Logout */}
        <div style={{ padding: '8px 12px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={() => setShowLogoutConfirm(true)} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: 'transparent', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
            padding: '9px 12px', fontSize: 12.5, fontWeight: 600, color: '#F87171', cursor: 'pointer',
            fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.18s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Keluar
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          height: 58, background: '#fff', borderBottom: '1px solid #DCDFE8', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
        }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#2B2D42' }}>
              {activeView === 'pasien' ? 'Pasien Saya'
                : activeView === 'notif' ? 'Notifikasi & Eskalasi'
                  : activeView === 'keluhan' ? 'Review Keluhan Pasien'
                    : 'Profil Tenaga Medis'}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#636B78' }}>
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
              {bahayaCount > 0 && (
                <span style={{
                  position: 'absolute', top: 0, right: 0, width: 14, height: 14,
                  background: '#895CF6', borderRadius: '50%', fontSize: 9, fontWeight: 700,
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {bahayaCount}
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

          {/* ── VIEW: Notifikasi & Eskalasi ───────────────────────────────────── */}
          {!fetchError && activeView === 'notif' && (
            <NotifikasiView showToast={showToast} />
          )}

          {/* ── VIEW 4: Profil Saya ───────────────────────────────────────────── */}
          {!fetchError && activeView === 'profil' && (
            <ProfilNakesView
              profile={doctorProfile}
              loading={loadingProfile}
              error={profileError}
              queueLength={queue.length}
              bahayaCount={bahayaCount}
              waswasCount={waswasCount}
              amanCount={amanCount}
            />
          )}
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
