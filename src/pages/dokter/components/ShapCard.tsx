import { MOCK_SHAP } from '../dokterMockData'

interface ShapCardProps {
  patientIdx: number
}

export default function ShapCard({ patientIdx }: ShapCardProps) {
  const safeIdx = Math.min(patientIdx, MOCK_SHAP.length - 1)
  const factors = MOCK_SHAP[safeIdx]

  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      padding: '18px 20px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
      border: '1px solid #F0F1F4',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #F1F5F9' }}>
        <div>
          <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 13.5, color: '#111827' }}>Atribusi Faktor</p>
          <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF' }}>Kontribusi tiap faktor terhadap risiko</p>
        </div>
        <span style={{
          background: '#F5F3FF', borderRadius: 6, padding: '3px 9px',
          fontSize: 10, fontWeight: 700, color: '#7C3AED', letterSpacing: '0.3px',
        }}>
          AI
        </span>
      </div>

      {/* Factors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        {factors.map((f, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: '#374151' }}>{f.label}</span>
              <span style={{
                fontSize: 12, fontWeight: 700, color: f.color,
                fontFamily: 'IBM Plex Mono, monospace',
              }}>{f.valText}</span>
            </div>
            <div style={{ height: 6, background: '#F0F1F4', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: f.barWidth, background: f.barBg, borderRadius: 99 }} />
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 10.5, color: '#9CA3AF', lineHeight: 1.4 }}>{f.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
