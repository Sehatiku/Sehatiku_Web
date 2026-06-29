import { MOCK_LOGS } from '../dokterMockData'

const isMockMode = import.meta.env.VITE_MOCK === 'true'

interface LogCardProps {
  patientIdx: number
}

export default function LogCard({ patientIdx }: LogCardProps) {
  if (!isMockMode) {
    return (
      <div style={{ background: '#fff', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8A93A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span style={{ fontSize: 13, color: '#636B78', fontWeight: 600 }}>Belum ada log catatan harian</span>
      </div>
    )
  }

  const safeIdx = Math.min(patientIdx, MOCK_LOGS.length - 1)
  const logs = MOCK_LOGS[safeIdx]
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#2B2D42' }}>Log Harian Pasien</span>
        <span style={{ background: '#F0FDF8', border: '1px solid #A7ECD9', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: '#159E84' }}>
          via WhatsApp &middot; hari ini
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {logs.map((log, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: i < logs.length - 1 ? 14 : 0 }}>
            <span style={{ fontSize: 11, color: '#8A93A1', fontFamily: 'IBM Plex Mono, monospace', minWidth: 36, textAlign: 'right', paddingTop: 2 }}>{log.time}</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: log.dot, flexShrink: 0 }} />
              {i < logs.length - 1 && <div style={{ width: 2, flex: 1, background: '#DCDFE8', marginTop: 4, minHeight: 20 }} />}
            </div>
            <div style={{ flex: 1, paddingBottom: i < logs.length - 1 ? 4 : 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#2B2D42' }}>{log.text}</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#636B78' }}>{log.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
