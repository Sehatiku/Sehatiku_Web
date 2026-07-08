import { useState, useEffect, useCallback, useRef } from 'react'
import { faskesApi } from '../../../lib/api'
import type { EscalationItem, FaskesPatientItem } from '../../../lib/types'
import { escalationItemIsDone, escalationStatusIsPending } from '../../../lib/utils'

const DISEASE_LABEL: Record<string, string> = {
  diabetes_t2: 'Diabetes',
  hypertension: 'Hipertensi',
  both: 'Kombinasi (DM & HT)',
}

function initials(name: string): string {
  if (!name) return 'P'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return parts[0].slice(0, 2).toUpperCase()
}

interface EskalasiTabProps {
  showToastMsg: (msg: string) => void
}



const TIER_TRIGGER: Record<string, string> = {
  acute_today: 'Pembacaan ekstrem / transisi ke status bahaya hari ini',
  trend_this_week: 'Status waswas bertahan beberapa hari terakhir',
}

export default function EskalasiTab({ showToastMsg }: EskalasiTabProps) {
  const [escalations, setEscalations] = useState<EscalationItem[]>([])
  const [patients, setPatients] = useState<FaskesPatientItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actingId, setActingId] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchEscalations = useCallback(async () => {
    try {
      const res = await faskesApi.getEscalations({ page: 1, size: 100 })
      setEscalations(res.data)
      setError(null)
    } catch (e) {
      const status = (e as { status?: number })?.status
      console.error('Gagal memuat eskalasi:', e)
      setError(
        status === 401 || status === 403
          ? 'Sesi tidak memiliki akses ke antrean eskalasi. Coba login ulang.'
          : 'Gagal memuat antrean eskalasi. Coba lagi beberapa saat.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      await fetchEscalations()
    }
    load()
    faskesApi.getPatients(1, 100)
      .then(res => setPatients(res.data))
      .catch(err => console.error(err))
    // Auto-refresh tiap 60 detik (konsisten dengan antrean eskalasi nakes)
    intervalRef.current = setInterval(fetchEscalations, 60_000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchEscalations])

  const handleFollowUp = useCallback(async (e: EscalationItem) => {
    setActingId(e.id)
    try {
      await faskesApi.actEscalation(e.id)
      setEscalations(prev =>
        prev.map(x => (x.id === e.id ? { ...x, status: 'acted', acted_at: new Date().toISOString() } : x)),
      )
      showToastMsg(`✓ Tindak lanjut ${e.patient_name} dicatat. Pasien akan segera dihubungi oleh nakes.`)
    } catch (err) {
      const status = (err as { status?: number })?.status
      // 409 = eskalasi sudah ditutup; tetap tandai selesai agar UI konsisten.
      if (status === 409) {
        setEscalations(prev => prev.map(x => (x.id === e.id ? { ...x, status: 'acted' } : x)))
        showToastMsg('Eskalasi ini sudah ditindaklanjuti sebelumnya.')
      } else {
        showToastMsg('⚠️ Gagal mencatat tindak lanjut. Coba lagi.')
      }
    } finally {
      setActingId(null)
    }
  }, [showToastMsg])

  const getHealthColor = (score: number) => {
    if (score >= 70) return '#10B981'
    if (score >= 40) return '#F59E0B'
    return '#EF4444'
  }

  const openCount = escalations.filter(e => escalationStatusIsPending(e.status) && !e.acted_at).length

  return (
    <div className="anim-fadein">
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 3px rgba(15,36,68,0.04)', border: '1px solid #ECEEF3', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#2B2D42' }}>Log Eskalasi Klinis</div>
            <div style={{ fontSize: 11, color: '#8A93A1', marginTop: 2 }}>Histori sinyal kritis &amp; status tindak lanjut tenaga kesehatan · auto-refresh 60 dtk</div>
          </div>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '6px 13px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#8A93A1' }}>{loading ? '…' : `${openCount} Perlu Tindak Lanjut`}</span>
          </div>
        </div>

        {loading && (
          <div style={{ padding: '40px 22px', textAlign: 'center', color: '#8A93A1', fontSize: 13 }}>Memuat antrean eskalasi…</div>
        )}

        {!loading && error && (
          <div style={{ padding: '32px 22px', textAlign: 'center' }}>
            <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 12 }}>{error}</div>
            <button onClick={() => { setLoading(true); fetchEscalations() }} style={{ background: '#5B6BF0', color: '#fff', border: 'none', borderRadius: 12, padding: '9px 18px', fontSize: 12.5, fontWeight: 700, boxShadow: '0 3px 10px rgba(91,107,240,0.25)', cursor: 'pointer' }}>Coba Lagi</button>
          </div>
        )}

        {!loading && !error && escalations.length === 0 && (
          <div style={{ padding: '40px 22px', textAlign: 'center', color: '#8A93A1', fontSize: 13 }}>
            Belum ada eskalasi klinis. Antrean akan terisi otomatis saat ada pasien dengan pembacaan ekstrem atau tren memburuk.
          </div>
        )}

        {!loading && !error && [...escalations].sort((a, b) => {
          const aDone = escalationItemIsDone(a)
          const bDone = escalationItemIsDone(b)
          if (aDone && !bDone) return 1
          if (!aDone && bDone) return -1
          const aTime = new Date(a.sent_at || a.created_at).getTime()
          const bTime = new Date(b.sent_at || b.created_at).getTime()
          return bTime - aTime
        }).map(alert => {
          const isDone = escalationItemIsDone(alert)
          const score = alert.risk_score
          const alertColor = getHealthColor(score)

          const patient = patients.find(p => p.patient_id === alert.patient_id)
          const age = patient?.age ?? '—'
          const disease = patient?.disease_type ? (DISEASE_LABEL[patient.disease_type] || patient.disease_type) : '—'

          // Background according to screenshot (F0F4FF for open/pending, F8FAFC or white for done)
          const cardBg = isDone ? '#F8FAFC' : '#EEF2FF'
          const cardBorder = isDone ? '1px solid #E2E8F0' : '1px solid #C7D2FE'

          return (
            <div
              key={alert.id}
              style={{
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: cardBg,
                border: cardBorder,
                borderRadius: 14,
                margin: '8px 12px',
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
                  {TIER_TRIGGER[alert.tier] ?? 'Eskalasi klinis'}
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
  )
}
