import { useState, useEffect, useCallback, useRef } from 'react'
import { nakesApi } from '../../../lib/api'
import type { EscalationItem } from '../../../lib/types'
import { escalationItemIsDone, escalationStatusIsPending } from '../../../lib/utils'
import { SkeletonCard } from './Common'

interface NotifikasiViewProps {
  showToast: (msg: string, type: 'ok' | 'err') => void
  onUpdateEscalationCount?: (count: number) => void
}

const TIER_LABEL: Record<string, string> = {
  acute_today: 'Akut Hari Ini',
  trend_this_week: 'Tren Pekan Ini',
}

const TIER_TRIGGER: Record<string, string> = {
  acute_today: 'Pembacaan ekstrem / transisi ke status bahaya hari ini',
  trend_this_week: 'Status waswas bertahan beberapa hari terakhir',
}

function formatWaktu(iso: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

export default function NotifikasiView({ showToast, onUpdateEscalationCount }: NotifikasiViewProps) {
  const [escalations, setEscalations] = useState<EscalationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actingId, setActingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'acted'>('all')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchEscalations = useCallback(async () => {
    try {
      const res = await nakesApi.getEscalations({ page: 1, size: 100 })
      setEscalations(res.data)
      setError(null)
    } catch (e) {
      const status = (e as { status?: number })?.status
      console.error('Gagal memuat eskalasi:', e)
      setError(
        status === 401 || status === 403
          ? 'Sesi tidak memiliki akses ke antrean eskalasi. Coba login ulang.'
          : 'Gagal memuat notifikasi eskalasi. Coba lagi beberapa saat.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEscalations()
    intervalRef.current = setInterval(fetchEscalations, 60_000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [fetchEscalations])

  useEffect(() => {
    const pending = escalations.filter(e => escalationStatusIsPending(e.status) && !e.acted_at).length
    onUpdateEscalationCount?.(pending)
  }, [escalations, onUpdateEscalationCount])

  const handleFollowUp = useCallback(async (e: EscalationItem) => {
    setActingId(e.id)
    try {
      await nakesApi.actEscalation(e.id)
      setEscalations(prev => prev.map(x => (x.id === e.id ? { ...x, status: 'acted', acted_at: new Date().toISOString() } : x)))
      showToast(`Tindak lanjut ${e.patient_name} dicatat`, 'ok')
    } catch (err) {
      const status = (err as { status?: number })?.status
      if (status === 409) {
        setEscalations(prev => prev.map(x => (x.id === e.id ? { ...x, status: 'acted' } : x)))
        showToast('Eskalasi ini sudah ditindaklanjuti sebelumnya', 'ok')
      } else {
        showToast('Gagal mencatat tindak lanjut', 'err')
      }
    } finally {
      setActingId(null)
    }
  }, [showToast])

  const getHealthColor = (score: number) => (score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444')

  // KPI Calculations
  const totalCount = escalations.length
  const pendingCount = escalations.filter(e => escalationStatusIsPending(e.status) && !e.acted_at).length
  const actedCount = escalations.filter(e => escalationItemIsDone(e)).length

  // Filter logic
  const filteredEscalations = escalations.filter(alert => {
    if (activeTab === 'pending') return escalationStatusIsPending(alert.status) && !alert.acted_at
    if (activeTab === 'acted') return escalationItemIsDone(alert)
    return true
  })

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', padding: '20px 24px', background: 'transparent', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <style>{`
        @keyframes pulse-red {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes pulse-orange {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(245, 158, 11, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .pulse-red-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #EF4444;
          animation: pulse-red 2s infinite;
        }
        .pulse-orange-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #F59E0B;
          animation: pulse-orange 2s infinite;
        }
        .btn-gradient-red {
          background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-gradient-red:hover:not(:disabled) {
          background: linear-gradient(135deg, #F87171 0%, #EF4444 100%);
          box-shadow: 0 6px 18px rgba(239, 68, 68, 0.35);
          transform: translateY(-1px);
        }
        .btn-gradient-red:active:not(:disabled) {
          transform: translateY(0);
        }
        .notif-card {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .notif-card:hover {
          transform: translateY(-2.5px);
          background: rgba(255, 255, 255, 0.65) !important;
          border-color: rgba(255, 255, 255, 0.85) !important;
          box-shadow: 0 16px 36px 0 rgba(31, 38, 135, 0.08) !important;
        }
      `}</style>

      {/* ── KPI Metrics Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, flexShrink: 0 }}>
        {/* KPI 1: Total Eskalasi */}
        <div style={{ background: 'rgba(255, 255, 255, 0.45)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: 16, padding: '16px 18px', border: '1px solid rgba(255, 255, 255, 0.6)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 12.5, color: '#64748B', fontWeight: 500 }}>Total Eskalasi</p>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B6BF0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
          </div>
          <p style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: '#2B2D42', fontFamily: 'IBM Plex Mono, monospace', lineHeight: 1 }}>
            {loading ? '…' : totalCount}
          </p>
          <p style={{ margin: 0, fontSize: 11.5, color: '#9CA3AF' }}>Seluruh riwayat eskalasi</p>
        </div>

        {/* KPI 2: Perlu Tindak Lanjut */}
        <div style={{
          background: pendingCount > 0 ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.85) 0%, rgba(194, 65, 12, 0.85) 100%)' : 'rgba(255, 255, 255, 0.45)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: 16,
          padding: '16px 18px',
          border: pendingCount > 0 ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: pendingCount > 0 ? '0 8px 24px rgba(239, 68, 68, 0.15)' : '0 8px 32px 0 rgba(31, 38, 135, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: pendingCount > 0 ? '#fff' : 'inherit'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 12.5, color: pendingCount > 0 ? 'rgba(255,255,255,0.85)' : '#64748B', fontWeight: 500 }}>Perlu Tindak Lanjut</p>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: pendingCount > 0 ? 'rgba(255,255,255,0.18)' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={pendingCount > 0 ? '#ffffff' : '#EF4444'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
          </div>
          <p style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: pendingCount > 0 ? '#ffffff' : '#EF4444', fontFamily: 'IBM Plex Mono, monospace', lineHeight: 1 }}>
            {loading ? '…' : pendingCount}
          </p>
          <p style={{ margin: 0, fontSize: 11.5, color: pendingCount > 0 ? 'rgba(255,255,255,0.7)' : '#9CA3AF' }}>Membutuhkan atensi medis</p>
        </div>

        {/* KPI 3: Sudah Ditindak */}
        <div style={{ background: 'rgba(255, 255, 255, 0.45)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: 16, padding: '16px 18px', border: '1px solid rgba(255, 255, 255, 0.6)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 12.5, color: '#64748B', fontWeight: 500 }}>Selesai Ditindak</p>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          <p style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: '#0D9488', fontFamily: 'IBM Plex Mono, monospace', lineHeight: 1 }}>
            {loading ? '…' : actedCount}
          </p>
          <p style={{ margin: 0, fontSize: 11.5, color: '#9CA3AF' }}>Kondisi teratasi &amp; dicatat</p>
        </div>

        {/* KPI 4 removed: 'Akut vs Tren' */}
      </div>

      {/* ── Filter Tabs & Main Container ── */}
      <div style={{
        background: 'rgba(255,255,255,0.5)',
        backdropFilter: 'blur(16px) saturate(130%)',
        WebkitBackdropFilter: 'blur(16px) saturate(130%)',
        borderRadius: 20,
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
        border: '1px solid rgba(255,255,255,0.6)',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        {/* Header with Filters */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1E293B' }}>Daftar Eskalasi Klinis</div>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>Menampilkan alert risiko medis terdeteksi sistem</div>
          </div>

          {/* Filter segment */}
          <div style={{ display: 'flex', background: 'rgba(241, 245, 249, 0.4)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: 10, padding: 3, gap: 2 }}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '6px 14px', borderRadius: 8, border: 'none',
                background: activeTab === 'all' ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
                color: activeTab === 'all' ? '#0F172A' : '#64748B',
                fontSize: 12, fontWeight: activeTab === 'all' ? 700 : 500,
                cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                boxShadow: activeTab === 'all' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              Semua ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              style={{
                padding: '6px 14px', borderRadius: 8, border: 'none',
                background: activeTab === 'pending' ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
                color: activeTab === 'pending' ? '#0F172A' : '#64748B',
                fontSize: 12, fontWeight: activeTab === 'pending' ? 700 : 500,
                cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                boxShadow: activeTab === 'pending' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              Perlu Tindak Lanjut ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('acted')}
              style={{
                padding: '6px 14px', borderRadius: 8, border: 'none',
                background: activeTab === 'acted' ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
                color: activeTab === 'acted' ? '#0F172A' : '#64748B',
                fontSize: 12, fontWeight: activeTab === 'acted' ? 700 : 500,
                cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                boxShadow: activeTab === 'acted' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              Sudah Ditindak ({actedCount})
            </button>
          </div>
        </div>

        {/* Content View */}
        <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} h={88} />)}
            </div>
          )}

          {!loading && error && (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ color: '#EF4444', fontSize: 13.5, marginBottom: 16, fontWeight: 500 }}>{error}</div>
              <button onClick={() => { setLoading(true); fetchEscalations() }} style={{ background: '#5B6BF0', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(91,107,240,0.2)' }}>Coba Lagi</button>
            </div>
          )}

          {!loading && !error && filteredEscalations.length === 0 && (
            <div style={{ padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Antrean Bersih</div>
              <div style={{ fontSize: 12, maxWidth: 360, lineHeight: 1.5 }}>
                {activeTab === 'pending'
                  ? 'Semua eskalasi klinis telah ditindaklanjuti. Pertahankan performa luar biasa ini!'
                  : activeTab === 'acted'
                    ? 'Belum ada riwayat tindakan eskalasi yang tersimpan.'
                    : 'Tidak ada notifikasi eskalasi dalam sistem saat ini.'}
              </div>
            </div>
          )}

          {!loading && !error && filteredEscalations.map(alert => {
            const isDone = escalationItemIsDone(alert)
            const score = alert.risk_score
            const alertColor = getHealthColor(score)

            // Premium glassmorphism card styling colors
            const cardBg = 'rgba(255, 255, 255, 0.4)'
            const leftIndicator = alertColor

            // Icon backdrop background (translucent tinted)
            const iconBg = score < 40 ? 'rgba(239, 68, 68, 0.08)' : (score < 70 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)')
            const iconBorder = score < 40 ? 'rgba(239, 68, 68, 0.2)' : (score < 70 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)')

            return (
              <div
                key={alert.id}
                className="notif-card"
                style={{
                  background: cardBg,
                  border: '1px solid rgba(255, 255, 255, 0.45)',
                  borderRadius: 16,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.03)'
                }}
              >
                {/* Visual Accent Left Edge */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 5,
                  background: leftIndicator
                }} />

                {/* Left Warning Symbol */}
                <div style={{
                  width: 36,
                  height: 36,
                  minWidth: 36,
                  borderRadius: 10,
                  background: iconBg,
                  border: `1px solid ${iconBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={alertColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>

                {/* Middle Content */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{alert.patient_name}</span>

                    {/* Health Score Pill */}
                    <span style={{
                      background: iconBg,
                      color: alertColor,
                      fontSize: 9.5,
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 18,
                      border: `1px solid ${iconBorder}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: alertColor }} />
                      Health: {score}
                    </span>

                    {/* Tier Tag with dynamic icons */}
                    <span style={{
                      background: 'rgba(79, 70, 229, 0.05)',
                      color: '#4F46E5',
                      fontSize: 9.5,
                      fontWeight: 600,
                      padding: '1px 6px',
                      borderRadius: 18,
                      border: '1px solid rgba(79, 70, 229, 0.15)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3
                    }}>
                      {alert.tier === 'acute_today' ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      )}
                      {TIER_LABEL[alert.tier] ?? alert.tier}
                    </span>

                    {/* Risk status badge */}
                    {alert.risk_status && (
                      <span style={{
                        background: 'rgba(71, 85, 105, 0.05)',
                        color: '#475569',
                        fontSize: 9.5,
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: 18,
                        border: '1px solid rgba(71, 85, 105, 0.15)',
                        textTransform: 'capitalize'
                      }}>
                        {alert.risk_status}
                      </span>
                    )}
                  </div>

                  {/* Trigger banner block */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: score < 40 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    color: score < 40 ? '#991B1B' : '#92400E',
                    marginBottom: 4,
                    border: `1px solid ${score < 40 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)'}`
                  }}>
                    <span className={score < 40 ? "pulse-red-dot" : "pulse-orange-dot"} />
                    {TIER_TRIGGER[alert.tier] ?? 'Eskalasi klinis terdeteksi'}
                  </div>

                  {/* Footer metadata */}
                  <div style={{ fontSize: 10, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{formatWaktu(alert.sent_at || alert.created_at)}</span>
                    <span>•</span>
                    <span style={{ textTransform: 'capitalize' }}>Status: {alert.status}</span>
                  </div>
                </div>

                {/* Right Action Button */}
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: 2 }}>
                  {isDone ? (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'rgba(16, 185, 129, 0.08)',
                      color: '#047857',
                      borderRadius: 10,
                      padding: '6px 11px',
                      fontSize: 11,
                      fontWeight: 700,
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      whiteSpace: 'nowrap'
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Ditindak
                    </div>
                  ) : (
                    <button
                      onClick={() => handleFollowUp(alert)}
                      disabled={actingId === alert.id}
                      className="btn-gradient-red"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        color: '#fff',
                        border: 'none',
                        borderRadius: 10,
                        padding: '6px 12px',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: actingId === alert.id ? 'wait' : 'pointer',
                        whiteSpace: 'nowrap',
                        opacity: actingId === alert.id ? 0.75 : 1
                      }}
                    >
                      {actingId === alert.id ? (
                        <>
                          <svg style={{ animation: 'spin 1s linear infinite' }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="2" x2="12" y2="6" />
                            <line x1="12" y1="18" x2="12" y2="22" />
                            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                            <line x1="2" y1="12" x2="6" y2="12" />
                            <line x1="18" y1="12" x2="22" y2="12" />
                            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                          </svg>
                          Memproses…
                        </>
                      ) : (
                        <>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Follow Up
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

