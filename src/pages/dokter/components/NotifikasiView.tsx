import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { nakesApi } from '../../../lib/api'
import type { EscalationItem, PatientQueueItem } from '../../../lib/types'
import { escalationItemIsDone, escalationStatusIsPending } from '../../../lib/utils'
import { SkeletonCard, DISEASE_LABEL } from './Common'

interface NotifikasiViewProps {
  showToast: (msg: string, type: 'ok' | 'err') => void
  onUpdateEscalationCount?: (count: number) => void
}

const TIER_TRIGGER: Record<string, string> = {
  acute_today: 'Pembacaan ekstrem / transisi ke status bahaya hari ini',
  trend_this_week: 'Status waswas bertahan beberapa hari terakhir',
}

function initials(name: string): string {
  if (!name) return 'P'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return parts[0].slice(0, 2).toUpperCase()
}

export default function NotifikasiView({ showToast, onUpdateEscalationCount }: NotifikasiViewProps) {
  const [escalations, setEscalations] = useState<EscalationItem[]>([])
  const [patientQueue, setPatientQueue] = useState<PatientQueueItem[]>([])
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
    nakesApi.getPatientQueue(1, 100)
      .then(res => setPatientQueue(res.data))
      .catch(err => console.error('Gagal memuat queue:', err))
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

  const sortedEscalations = useMemo<EscalationItem[]>(() => {
    return [...filteredEscalations].sort((a, b) => {
      const aDone = escalationItemIsDone(a)
      const bDone = escalationItemIsDone(b)
      if (aDone && !bDone) return 1
      if (!aDone && bDone) return -1
      const aTime = new Date(a.sent_at || a.created_at).getTime()
      const bTime = new Date(b.sent_at || b.created_at).getTime()
      return bTime - aTime
    })
  }, [filteredEscalations])

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

          {!loading && !error && sortedEscalations.map(alert => {
            const isDone = escalationItemIsDone(alert)
            const score = alert.risk_score
            const alertColor = getHealthColor(score)

            const patient = patientQueue.find(p => p.patient_id === alert.patient_id)
            const age = patient?.age ?? '—'
            const disease = patient?.disease_type ? (DISEASE_LABEL[patient.disease_type] || patient.disease_type) : '—'

            // Background according to screenshot (F0F4FF for open/pending, F8FAFC or white for done)
            const cardBg = isDone ? '#F8FAFC' : '#EEF2FF'
            const cardBorder = isDone ? '1px solid #E2E8F0' : '1px solid #C7D2FE'

            return (
              <div
                key={alert.id}
                style={{
                  background: cardBg,
                  border: cardBorder,
                  borderRadius: 14,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                  position: 'relative',
                  transition: 'all 0.15s ease'
                }}
              >

                {/* Left Circular Initials Avatar bubble */}
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: alertColor,
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {initials(alert.patient_name)}
                </div>

                {/* Middle Content */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  {/* Top Line: Alert Trigger Reason (Meriang style) */}
                  <div style={{
                    fontWeight: 750,
                    fontSize: 13.5,
                    color: isDone ? '#475569' : '#1E3A8A',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    marginBottom: 3
                  }}>
                    {TIER_TRIGGER[alert.tier] ?? 'Eskalasi klinis terdeteksi'}
                  </div>

                  {/* Bottom Line: Patient Details (Suharto Wibowo · 67 thn · Diabetes) */}
                  <p style={{
                    margin: 0,
                    fontSize: 11.5,
                    color: '#6B7280',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontWeight: 500
                  }}>
                    <span style={{ fontWeight: 700, color: isDone ? '#475569' : '#3B4CC0' }}>{alert.patient_name}</span>
                    {` · ${age} thn · ${disease}`}
                  </p>
                </div>

                {/* Right Action Button or Done Badge */}
                <div style={{ flexShrink: 0 }}>
                  {isDone ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      borderRadius: 999,
                      padding: '3px 10px',
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#059669',
                      whiteSpace: 'nowrap'
                    }}>
                      Selesai
                    </span>
                  ) : (
                    <button
                      onClick={() => handleFollowUp(alert)}
                      disabled={actingId === alert.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        background: '#DC2626',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: actingId === alert.id ? 'wait' : 'pointer',
                        whiteSpace: 'nowrap',
                        opacity: actingId === alert.id ? 0.75 : 1,
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => { if (actingId !== alert.id) e.currentTarget.style.background = '#B91C1C' }}
                      onMouseLeave={e => { if (actingId !== alert.id) e.currentTarget.style.background = '#DC2626' }}
                    >
                      {actingId === alert.id ? 'Memproses…' : 'Follow Up'}
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

