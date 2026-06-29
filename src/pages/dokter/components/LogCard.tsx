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
      borderRadius: 20,
      padding: '24px',
      boxShadow: '0 4px 20px -2px rgba(43,45,66,0.04), 0 2px 6px -1px rgba(43,45,66,0.02)',
      border: '1px solid #E2E8F0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, borderBottom: '1px solid #EFF1F5', paddingBottom: 14 }}>
        <span style={{ fontWeight: 800, fontSize: 15.5, color: '#1A2066', letterSpacing: '-0.2px' }}>Log Harian Pasien</span>
        <span style={{
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: 20,
          padding: '4px 12px',
          fontSize: 11,
          fontWeight: 700,
          color: '#065F46',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
          via WhatsApp &middot; hari ini
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {logs.map((log, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: i < logs.length - 1 ? 16 : 0 }}>
            {/* Time label */}
            <span style={{
              fontSize: 11.5,
              color: '#64748B',
              fontFamily: 'IBM Plex Mono, monospace',
              minWidth: 42,
              textAlign: 'right',
              paddingTop: 3,
              fontWeight: 700,
            }}>
              {log.time}
            </span>

            {/* Timeline node */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: '#fff',
                border: `3px solid ${log.dot}`,
                boxShadow: `0 0 0 3px ${log.dot}20`,
                flexShrink: 0,
              }} />
              {i < logs.length - 1 && (
                <div style={{
                  width: 2,
                  flex: 1,
                  background: '#E2E8F0',
                  marginTop: 6,
                  marginBottom: 2,
                  minHeight: 24,
                }} />
              )}
            </div>

            {/* Content box */}
            <div style={{
              flex: 1,
              paddingBottom: i < logs.length - 1 ? 4 : 0,
              background: '#F8FAFC',
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid #EFF1F5',
            }}>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: '#1E293B' }}>{log.text}</p>
              <p style={{ margin: '3px 0 0', fontSize: 11.5, color: '#64748B', fontWeight: 500, lineHeight: 1.4 }}>{log.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
