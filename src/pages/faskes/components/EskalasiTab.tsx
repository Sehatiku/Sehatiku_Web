import { useState } from 'react'

interface EscalationAlert {
  id: number
  patient: string
  disease: string
  healthScore: number
  trigger: string
  time: string
  sent: string
}

interface EskalasiTabProps {
  showToastMsg: (msg: string) => void
}

export default function EskalasiTab({ showToastMsg }: EskalasiTabProps) {
  const [followedUpIds, setFollowedUpIds] = useState<number[]>([])
  const [escalationAlerts] = useState<EscalationAlert[]>([])

  const getHealthColor = (score: number) => {
    if (score >= 70) return '#10B981' // Sehat (Green)
    if (score >= 40) return '#F59E0B' // Waswas (Yellow)
    return '#EF4444' // Parah (Red)
  }

  return (
    <div className="anim-fadein">
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #DCDFE8', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#2B2D42' }}>Log Eskalasi Klinis</div>
            <div style={{ fontSize: 11, color: '#8A93A1', marginTop: 2 }}>Histori sinyal kritis &amp; status tindak lanjut tenaga kesehatan</div>
          </div>
          <div style={{ background: '#F7F8FA', border: '1px solid #DCDFE8', borderRadius: 8, padding: '6px 13px' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#8A93A1' }}>{escalationAlerts.length} Alert</span>
          </div>
        </div>

        {escalationAlerts.length === 0 && (
          <div style={{ padding: '40px 22px', textAlign: 'center', color: '#8A93A1', fontSize: 13 }}>
            Belum ada eskalasi klinis. Endpoint notifikasi &amp; eskalasi belum tersedia di backend.
          </div>
        )}
        {escalationAlerts.map(alert => {
          const isFollowedUp = followedUpIds.includes(alert.id)
          const alertColor = getHealthColor(alert.healthScore)
          const alertBg = alert.healthScore < 40 ? '#FFF5F5' : (alert.healthScore < 70 ? '#FFFDF0' : '#F0FDF8')
          const alertBorder = alert.healthScore < 40 ? 'rgba(239,68,68,0.15)' : (alert.healthScore < 70 ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)')
          
          return (
            <div key={alert.id} style={{ padding: '18px 22px', borderBottom: '1px solid #F4F5F7', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: alertBg, border: `1px solid ${alertBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={alertColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#2B2D42' }}>{alert.patient}</span>
                  <span style={{ background: alertBg, color: alertColor, fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, border: `1px solid ${alertBorder}` }}>Health: {alert.healthScore}</span>
                  <span style={{ background: '#EEEFFE', color: '#5B6BF0', fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20, border: '1px solid rgba(91,107,240,0.12)' }}>{alert.disease}</span>
                </div>
                <div style={{ fontSize: 13, color: '#334155', marginBottom: 4, fontWeight: 500 }}>🔴 {alert.trigger}</div>
                <div style={{ fontSize: 11, color: '#8A93A1' }}>{alert.time} · {alert.sent}</div>
              </div>
              <div style={{ flexShrink: 0 }}>
                {isFollowedUp ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F0FDF8', color: '#10B981', borderRadius: 8, padding: '9px 14px', fontSize: 12, fontWeight: 700, border: '1px solid rgba(16,185,129,0.2)', whiteSpace: 'nowrap' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12" /></svg>
                    Sudah Ditindak
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setFollowedUpIds(prev => [...prev, alert.id])
                      showToastMsg(`✓ Tindak lanjut ${alert.patient} dicatat. Pasien akan segera dihubungi oleh nakes.`)
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EF4444', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 15px', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 3px 10px rgba(239,68,68,0.25)' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12" /></svg>
                    One-Tap Follow Up
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
