import { buildChart, StatusPill } from './Common'
import { MOCK_GLUCOSE, MOCK_BP } from '../dokterMockData'

const isMockMode = import.meta.env.VITE_MOCK === 'true'

interface TrendChartProps {
  patientIdx: number
  chartParam: 'glucose' | 'bp'
  chartRange: 7 | 14
  onParamChange: (p: 'glucose' | 'bp') => void
  onRangeChange: (r: 7 | 14) => void
}

export default function TrendChart({
  patientIdx,
  chartParam,
  chartRange,
  onParamChange,
  onRangeChange,
}: TrendChartProps) {
  if (!isMockMode) {
    return (
      <div style={{ background: '#fff', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8A93A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        <span style={{ fontSize: 13, color: '#636B78', fontWeight: 600 }}>Belum ada data parameter harian</span>
      </div>
    )
  }

  const safeIdx = Math.min(patientIdx, MOCK_GLUCOSE.length - 1)
  const glucoseData = MOCK_GLUCOSE[safeIdx]
  const bpData = MOCK_BP[safeIdx]
  const data = chartParam === 'glucose' ? glucoseData : bpData
  const threshold = chartParam === 'glucose' ? 130 : 140
  const unit = chartParam === 'glucose' ? 'mg/dL' : 'mmHg'
  const paramLabel = chartParam === 'glucose' ? 'Gula Darah' : 'Tensi Sistolik'
  const pts = data.slice(-chartRange)
  const currentVal = pts[pts.length - 1]
  const isHigh = currentVal >= threshold
  const chart = buildChart(data, threshold, chartRange)

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#2B2D42' }}>Tren Parameter Harian</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['glucose', 'bp'] as const).map(p => (
            <button key={p} onClick={() => onParamChange(p)} style={{
              padding: '4px 11px', borderRadius: 8, border: `1.5px solid ${chartParam === p ? '#5B6BF0' : '#DCDFE8'}`,
              background: chartParam === p ? '#EEEFFE' : '#fff', color: chartParam === p ? '#5B6BF0' : '#636B78',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              {p === 'glucose' ? 'Gula Darah' : 'Tensi'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: isHigh ? '#EF4444' : '#059669', fontFamily: 'IBM Plex Mono, monospace', fontVariantNumeric: 'tabular-nums' }}>
            {currentVal}
          </span>
          <span style={{ fontSize: 13, color: '#636B78' }}>{unit}</span>
          <StatusPill label={isHigh ? 'Di atas Normal' : 'Normal'} risk={isHigh ? 'kritis' : 'rendah'} />
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {([7, 14] as const).map(r => (
            <button key={r} onClick={() => onRangeChange(r)} style={{
              padding: '3px 10px', borderRadius: 7, border: `1.5px solid ${chartRange === r ? '#5B6BF0' : '#DCDFE8'}`,
              background: chartRange === r ? '#EEEFFE' : '#fff', color: chartRange === r ? '#5B6BF0' : '#636B78',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}>
              {r}d
            </button>
          ))}
        </div>
      </div>

      <svg viewBox="0 0 672 210" style={{ width: '100%', display: 'block' }}>
        <rect x="48" y={chart.dangerY} width="576" height={chart.dangerH} fill="rgba(239,68,68,0.06)" />
        <line x1="48" y1={chart.dangerY} x2="624" y2={chart.dangerY} stroke="#EF4444" strokeWidth="1.5" strokeDasharray="5 4" />
        <polygon points={chart.areaPoints} fill="rgba(21,101,216,0.07)" />
        <polyline points={chart.linePoints} fill="none" stroke="#5B6BF0" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
        {chart.dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r="3" fill="#fff" stroke={d.inDanger ? '#EF4444' : '#5B6BF0'} strokeWidth="2" />
        ))}
        {chart.yLabels.map((yl, i) => (
          <text key={i} x="42" y={yl.y + 4} textAnchor="end" fontSize="10" fill="#8A93A1">{yl.label}</text>
        ))}
        {chart.xLabels.map((xl, i) => (
          <text key={i} x={xl.x} y="198" textAnchor="middle" fontSize="10" fill="#8A93A1">{xl.label}</text>
        ))}
      </svg>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#4A5260' }}>
          <span style={{ width: 14, height: 3, background: '#5B6BF0', borderRadius: 2, display: 'inline-block' }} />
          {paramLabel}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#EF4444' }}>
          <span style={{ width: 14, height: 3, background: '#EF4444', borderRadius: 2, display: 'inline-block' }} />
          Batas Bahaya ({threshold} {unit})
        </span>
      </div>
    </div>
  )
}
