import { MOCK_SHAP } from '../dokterMockData'

const isMockMode = import.meta.env.VITE_MOCK === 'true'

interface ShapCardProps {
  patientIdx: number
}

export default function ShapCard({ patientIdx }: ShapCardProps) {
  if (!isMockMode) {
    return (
      <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1.5px solid #DCDFE8', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8A93A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
        <span style={{ fontSize: 13, color: '#636B78', fontWeight: 600 }}>Atribusi faktor AI belum tersedia</span>
      </div>
    )
  }

  const safeIdx = Math.min(patientIdx, MOCK_SHAP.length - 1)
  const factors = MOCK_SHAP[safeIdx]
  return (
    <div style={{ background: 'linear-gradient(160deg, #FCFAFF 0%, #F5F0FF 100%)', borderRadius: 16, padding: '18px 20px', border: '1.5px solid #E9D5FF', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 18 }}>&#x1F916;</span>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#4C1D95' }}>Atribusi Faktor (AI)</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {factors.map((f, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#2B2D42' }}>{f.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: f.color, fontFamily: 'IBM Plex Mono, monospace' }}>{f.valText}</span>
            </div>
            <div style={{ height: 8, background: '#DCDFE8', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: f.barWidth, background: f.barBg, borderRadius: 4 }} />
            </div>
            <p style={{ fontSize: 11, color: '#636B78', margin: '3px 0 0' }}>{f.note}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 14, paddingTop: 12, borderTop: '1px solid #E9D5FF' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#636B78' }}>
          <span style={{ width: 10, height: 10, background: '#EF4444', borderRadius: 2, display: 'inline-block' }} />
          Menurunkan kesehatan
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#636B78' }}>
          <span style={{ width: 10, height: 10, background: '#1EC8A5', borderRadius: 2, display: 'inline-block' }} />
          Meningkatkan kesehatan
        </span>
      </div>
    </div>
  )
}
