import { useState, useEffect, useCallback, useRef } from 'react'
import { nakesApi } from '../../../lib/api'
import type { EscalationItem } from '../../../lib/types'
import { SkeletonCard } from './Common'

interface NotifikasiViewProps {
  showToast: (msg: string, type: 'ok' | 'err') => void
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

export default function NotifikasiView({ showToast }: NotifikasiViewProps) {
  const [escalations, setEscalations] = useState<EscalationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actingId, setActingId] = useState<string | null>(null)
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
  const openCount = escalations.filter(e => e.status === 'sent' || e.status === 'viewed').length

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', background: '#F4F5F7' }}>
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #F0F1F4', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Notifikasi & Eskalasi Klinis</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Alert risiko pasien &amp; status tindak lanjut · auto-refresh 60 dtk</div>
          </div>
          <div style={{ background: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 13px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280' }}>{loading ? '…' : `${openCount} Perlu Tindak Lanjut`}</span>
          </div>
        </div>

        {loading && (
          <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} h={60} />)}
          </div>
        )}

        {!loading && error && (
          <div style={{ padding: '32px 22px', textAlign: 'center' }}>
            <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 12 }}>{error}</div>
            <button onClick={() => { setLoading(true); fetchEscalations() }} style={{ background: '#EEF2FF', color: '#5B6BF0', border: '1px solid rgba(91,107,240,0.18)', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Coba Lagi</button>
          </div>
        )}

        {!loading && !error && escalations.length === 0 && (
          <div style={{ padding: '48px 22px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
            Tidak ada notifikasi eskalasi. Antrean terisi otomatis saat ada pasien dengan pembacaan ekstrem atau tren memburuk.
          </div>
        )}

        {!loading && !error && escalations.map(alert => {
          const isDone = alert.status === 'acted' || alert.status === 'dismissed'
          const score = alert.risk_score
          const alertColor = getHealthColor(score)
          const alertBg = score < 40 ? '#FFF5F5' : (score < 70 ? '#FFFDF0' : '#F0FDF8')
          const alertBorder = score < 40 ? 'rgba(239,68,68,0.15)' : (score < 70 ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)')
          return (
            <div key={alert.id} style={{ padding: '18px 22px', borderBottom: '1px solid #F4F5F7', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: alertBg, border: `1px solid ${alertBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={alertColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{alert.patient_name}</span>
                  <span style={{ background: alertBg, color: alertColor, fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, border: `1px solid ${alertBorder}` }}>Health: {score}</span>
                  <span style={{ background: '#EEF2FF', color: '#5B6BF0', fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20, border: '1px solid rgba(91,107,240,0.12)' }}>{TIER_LABEL[alert.tier] ?? alert.tier}</span>
                  {alert.risk_status && (
                    <span style={{ background: '#F7F8FA', color: '#6B7280', fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20, border: '1px solid #E5E7EB', textTransform: 'capitalize' }}>{alert.risk_status}</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#334155', marginBottom: 4, fontWeight: 500 }}>🔴 {TIER_TRIGGER[alert.tier] ?? 'Eskalasi klinis'}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF' }}>{formatWaktu(alert.sent_at || alert.created_at)} · Status: {alert.status}</div>
              </div>
              <div style={{ flexShrink: 0 }}>
                {isDone ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F0FDF8', color: '#10B981', borderRadius: 8, padding: '9px 14px', fontSize: 12, fontWeight: 700, border: '1px solid rgba(16,185,129,0.2)', whiteSpace: 'nowrap' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12" /></svg>
                    Sudah Ditindak
                  </div>
                ) : (
                  <button
                    onClick={() => handleFollowUp(alert)}
                    disabled={actingId === alert.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: actingId === alert.id ? '#FCA5A5' : '#EF4444', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 15px', fontSize: 12, fontWeight: 700, cursor: actingId === alert.id ? 'wait' : 'pointer', whiteSpace: 'nowrap', boxShadow: '0 3px 10px rgba(239,68,68,0.25)' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12" /></svg>
                    {actingId === alert.id ? 'Memproses…' : 'One-Tap Follow Up'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
