import { MOCK_LOGS } from '../dokterMockData'

interface LogCardProps {
  patientIdx: number
}

export default function LogCard({ patientIdx }: LogCardProps) {
  const safeIdx = Math.min(patientIdx, MOCK_LOGS.length - 1)
  const logs = MOCK_LOGS[safeIdx]

  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      padding: '18px 20px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
      border: '1px solid #F0F1F4',
      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #F1F5F9',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 2px 8px rgba(16,185,129,0.1)',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 14.5, color: '#1E293B', letterSpacing: '-0.2px' }}>Log Harian Pasien</span>
        </div>
        {/* <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          background: '#F0FDF9', border: '1px solid #D1FAE5',
          borderRadius: 6, padding: '3px 9px',
          fontSize: 10.5, fontWeight: 600, color: '#059669',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981' }} />
          via WhatsApp · hari ini
        </span> */}
      </div>

      {/* Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {logs.map((log, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: i < logs.length - 1 ? 18 : 0 }}>
            {/* Time */}
            <span style={{
              fontSize: 10.5, color: '#B0B7C3',
              fontFamily: 'IBM Plex Mono, monospace',
              minWidth: 38, textAlign: 'right',
              paddingTop: 1, fontWeight: 500, flexShrink: 0,
            }}>
              {log.time}
            </span>

            {/* Dot + line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                background: log.dot, marginTop: 2,
              }} />
              {i < logs.length - 1 && (
                <div style={{ width: 1, flex: 1, background: '#E8ECF2', marginTop: 5, minHeight: 18 }} />
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, paddingBottom: 2, paddingTop: 1 }}>
              <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{log.text}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF', lineHeight: 1.4 }}>{log.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
