import type { RiskFactor } from '../../../lib/types'

interface ShapCardProps {
  factors: RiskFactor[]
  loading?: boolean
}

// Peta nama fitur model → label klinis Bahasa Indonesia
const FEATURE_LABEL: Record<string, string> = {
  hba1c: 'HbA1c',
  hba1c_pct: 'HbA1c',
  fasting_glucose: 'Gula Darah Puasa',
  fasting_glucose_mgdl: 'Gula Darah Puasa',
  systolic_bp: 'Tensi Sistolik',
  systolic_bp_mmhg: 'Tensi Sistolik',
  diastolic_bp: 'Tensi Diastolik',
  diastolic_bp_mmhg: 'Tensi Diastolik',
  bmi: 'BMI',
  ldl: 'Kolesterol LDL',
  ldl_mgdl: 'Kolesterol LDL',
  hdl: 'Kolesterol HDL',
  egfr: 'Fungsi Ginjal (eGFR)',
  uacr: 'UACR (Ginjal)',
  triglycerides: 'Trigliserida',
  total_cholesterol: 'Kolesterol Total',
  waist_circumference: 'Lingkar Pinggang',
  physical_activity: 'Aktivitas Fisik',
  smoking_status: 'Status Merokok',
  cvd_risk: 'Risiko Kardiovaskular',
}

function labelFor(feature?: string | null): string {
  if (!feature) return 'Faktor Lain'
  if (FEATURE_LABEL[feature]) return FEATURE_LABEL[feature]
  return feature
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

const CardShell = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 3px rgba(15,36,68,0.04)', border: '1px solid #ECEEF3', display: 'flex', flexDirection: 'column' }}>{children}</div>
)

const Header = (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #F1F5F9' }}>
    <div>
      <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 13.5, color: '#111827' }}>Atribusi Faktor</p>
      <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF' }}>Kontribusi tiap faktor terhadap risiko</p>
    </div>
    <span style={{ background: '#F5F3FF', borderRadius: 6, padding: '3px 9px', fontSize: 10, fontWeight: 700, color: '#7C3AED', letterSpacing: '0.3px' }}>AI</span>
  </div>
)

export default function ShapCard({ factors, loading = false }: ShapCardProps) {
  if (loading) {
    return <CardShell>{Header}<div style={{ flex: 1, minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 12.5 }}>Memuat faktor risiko…</div></CardShell>
  }

  if (!factors || factors.length === 0) {
    return (
      <CardShell>
        {Header}
        <div style={{ flex: 1, minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#9CA3AF' }}>
          <span style={{ fontSize: 22 }}>🧬</span>
          <p style={{ margin: 0, fontSize: 12.5, textAlign: 'center' }}>Belum ada skor risiko AI untuk pasien ini.</p>
        </div>
      </CardShell>
    )
  }

  // Koersi defensif: backend bisa kirim shap_value sebagai string.
  const sv = (f: RiskFactor) => { const n = Number(f.shap_value); return Number.isFinite(n) ? n : 0 }
  const maxAbs = Math.max(...factors.map(f => Math.abs(sv(f))), 0.0001)

  return (
    <CardShell>
      {Header}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        {factors.map((f, i) => {
          const value = sv(f)
          // direction "positive" = menaikkan risiko (buruk) → merah; "negative" = menurunkan (baik) → teal
          const isRisk = (f.direction ?? '').toLowerCase() === 'positive'
          const color = isRisk ? '#EF4444' : '#0D9488'
          const barWidth = `${Math.max(8, Math.round((Math.abs(value) / maxAbs) * 100))}%`
          return (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#374151' }}>{labelFor(f.feature)}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'IBM Plex Mono, monospace' }}>
                  {value >= 0 ? '+' : ''}{value.toFixed(2)}
                </span>
              </div>
              <div style={{ height: 6, background: '#F0F1F4', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: barWidth, background: color, borderRadius: 99 }} />
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 10.5, color: '#9CA3AF', lineHeight: 1.4 }}>
                {isRisk ? 'Menaikkan risiko' : 'Menurunkan risiko'} · dampak {Math.abs(value).toFixed(2)} poin
              </p>
            </div>
          )
        })}
      </div>
    </CardShell>
  )
}
