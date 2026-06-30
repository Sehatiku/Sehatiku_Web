import { buildChart } from './Common'
import type { NakesDailyLog } from '../../../lib/types'

interface TrendChartProps {
  dailyLogs: NakesDailyLog[]
  loading?: boolean
  chartParam: 'glucose' | 'bp'
  chartRange: 7 | 14
  onParamChange: (p: 'glucose' | 'bp') => void
  onRangeChange: (r: 7 | 14) => void
}

const CardShell = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 2px rgba(0,0,0,0.06)', border: '1px solid #F0F1F4' }}>{children}</div>
)

export default function TrendChart({
  dailyLogs,
  loading = false,
  chartParam,
  chartRange,
  onParamChange,
  onRangeChange,
}: TrendChartProps) {
  const threshold = chartParam === 'glucose' ? 130 : 140
  const unit = chartParam === 'glucose' ? 'mg/dL' : 'mmHg'
  const paramLabel = chartParam === 'glucose' ? 'Gula Darah' : 'Tensi Sistolik'

  // Susun deret dari log harian (urut kronologis), buang nilai kosong/non-numerik.
  const sorted = [...dailyLogs].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
  const series = sorted
    .map(d => (chartParam === 'glucose' ? d.blood_sugar : d.systolic))
    .filter(v => v != null)
    .map(v => Number(v))
    .filter(v => Number.isFinite(v))

  const Header = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <p style={{ margin: 0, fontWeight: 700, fontSize: 13.5, color: '#111827' }}>Tren Parameter Harian</p>
      <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 8, padding: 3, gap: 2 }}>
        {(['glucose', 'bp'] as const).map(p => (
          <button key={p} onClick={() => onParamChange(p)} style={{
            padding: '4px 11px', borderRadius: 6, border: 'none',
            background: chartParam === p ? '#fff' : 'transparent',
            color: chartParam === p ? '#111827' : '#9CA3AF',
            fontSize: 11.5, fontWeight: chartParam === p ? 700 : 500,
            cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
            boxShadow: chartParam === p ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s',
          }}>
            {p === 'glucose' ? 'Gula Darah' : 'Tensi'}
          </button>
        ))}
      </div>
    </div>
  )

  if (loading) {
    return <CardShell>{Header}<div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 12.5 }}>Memuat tren…</div></CardShell>
  }

  if (series.length < 2) {
    return (
      <CardShell>
        {Header}
        <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#9CA3AF' }}>
          <span style={{ fontSize: 24 }}>📈</span>
          <p style={{ margin: 0, fontSize: 12.5 }}>Belum cukup data {paramLabel.toLowerCase()} untuk grafik tren.</p>
        </div>
      </CardShell>
    )
  }

  const pts = series.slice(-chartRange)
  const currentVal = pts[pts.length - 1]
  const isHigh = currentVal >= threshold
  const chart = buildChart(series, threshold, chartRange)

  return (
    <CardShell>
      {Header}
      {/* Current value row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: isHigh ? '#EF4444' : '#10B981', fontFamily: 'IBM Plex Mono, monospace' }}>{currentVal}</span>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>{unit}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: isHigh ? '#FEF2F2' : '#F0FDF9', border: `1px solid ${isHigh ? '#FECACA' : '#A7F3D0'}`, borderRadius: 6, padding: '2px 7px', fontSize: 10.5, fontWeight: 700, color: isHigh ? '#DC2626' : '#059669' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: isHigh ? '#EF4444' : '#10B981' }} />
            {isHigh ? 'Di atas Normal' : 'Normal'}
          </span>
        </div>
        <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 7, padding: 2, gap: 1 }}>
          {([7, 14] as const).map(r => (
            <button key={r} onClick={() => onRangeChange(r)} style={{
              padding: '3px 9px', borderRadius: 5, border: 'none',
              background: chartRange === r ? '#fff' : 'transparent',
              color: chartRange === r ? '#111827' : '#9CA3AF',
              fontSize: 11, fontWeight: chartRange === r ? 700 : 500,
              cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
              boxShadow: chartRange === r ? '0 1px 2px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s',
            }}>
              {r}d
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <svg viewBox="0 0 672 210" style={{ width: '100%', display: 'block' }}>
        <rect x="48" y={chart.dangerY} width="576" height={chart.dangerH} fill="rgba(239,68,68,0.04)" />
        <line x1="48" y1={chart.dangerY} x2="624" y2={chart.dangerY} stroke="#EF4444" strokeWidth="1.5" strokeDasharray="5 4" />
        <polygon points={chart.areaPoints} fill="rgba(91,107,240,0.06)" />
        <polyline points={chart.linePoints} fill="none" stroke="#5B6BF0" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        {chart.dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r="3" fill="#fff" stroke={d.inDanger ? '#EF4444' : '#5B6BF0'} strokeWidth="2" />
        ))}
        {chart.yLabels.map((yl, i) => (
          <text key={i} x="42" y={yl.y + 4} textAnchor="end" fontSize="10" fill="#C4CBD4">{yl.label}</text>
        ))}
        {chart.xLabels.map((xl, i) => (
          <text key={i} x={xl.x} y="198" textAnchor="middle" fontSize="10" fill="#C4CBD4">{xl.label}</text>
        ))}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#6B7280' }}>
          <span style={{ width: 12, height: 2.5, background: '#5B6BF0', borderRadius: 2, display: 'inline-block' }} />
          {paramLabel}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9CA3AF' }}>
          <span style={{ width: 12, height: 2.5, background: '#EF4444', borderRadius: 2, display: 'inline-block', opacity: 0.7 }} />
          Batas ({threshold} {unit})
        </span>
      </div>
    </CardShell>
  )
}
