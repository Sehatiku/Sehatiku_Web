import { initials } from '../../../lib/utils'
import type { RiskLabel, DiseaseType } from '../../../lib/types'

// ─── Color helpers ────────────────────────────────────────────────────────────

export const RISK_COLOR: Record<RiskLabel, { text: string; bg: string; border: string; edge: string; sqBg: string }> = {
  kritis: { text: '#DC2626', bg: '#FEF2F2', border: '#FECACA', edge: '#EF4444', sqBg: '#EF4444' },
  sedang: { text: '#D97706', bg: '#FFFBEB', border: '#FDE68A', edge: '#F59E0B', sqBg: '#F59E0B' },
  rendah: { text: '#059669', bg: '#F0FDF4', border: '#A7F3D0', edge: '#0D9488', sqBg: '#0D9488' },
}

export function getSafeRiskColor(label?: string | null) {
  if (!label) return RISK_COLOR.rendah
  const l = label.toLowerCase()
  if (l === 'kritis' || l === 'bahaya' || l === 'high') return RISK_COLOR.kritis
  if (l === 'sedang' || l === 'waswas' || l === 'medium') return RISK_COLOR.sedang
  return RISK_COLOR.rendah
}


export const DISEASE_LABEL: Record<DiseaseType, string> = {
  diabetes_t2: 'Diabetes',
  hypertension: 'Hipertensi',
  both: 'DM + HT',
}

export const DISEASE_COLOR: Record<DiseaseType, { text: string; bg: string }> = {
  diabetes_t2: { text: '#7C5CFC', bg: '#F3F0FE' },
  hypertension: { text: '#0369A1', bg: '#F0F9FF' },
  both: { text: '#9A3412', bg: '#FFF7ED' },
}

// ─── SVG Chart builder ────────────────────────────────────────────────────────

export function buildChart(data: number[], dangerThreshold: number, range: number) {
  const pts = data.slice(-range)
  const minV = Math.min(...pts, dangerThreshold) * 0.85
  const maxV = Math.max(...pts, dangerThreshold) * 1.1
  const X0 = 48, X1 = 624, Y0 = 24, Y1 = 180
  const toX = (i: number) => X0 + (i / (pts.length - 1)) * (X1 - X0)
  const toY = (v: number) => Y1 - ((v - minV) / (maxV - minV)) * (Y1 - Y0)
  const dangerY = toY(dangerThreshold)
  const linePoints = pts.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')
  const areaPoints = `${toX(0)},${Y1} ` + pts.map((v, i) => `${toX(i)},${toY(v)}`).join(' ') + ` ${toX(pts.length - 1)},${Y1}`
  const dots = pts.map((v, i) => ({ cx: toX(i), cy: toY(v), inDanger: v >= dangerThreshold }))
  const yLabels = [
    { label: Math.round(minV).toString(), y: Y1 },
    { label: Math.round((minV + maxV) / 2).toString(), y: (Y0 + Y1) / 2 },
    { label: Math.round(maxV).toString(), y: Y0 },
  ]
  const today = new Date()
  const xLabels = pts.map((_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (pts.length - 1 - i))
    return { x: toX(i), label: `${d.getDate()}/${d.getMonth() + 1}` }
  }).filter((_, i) => i % Math.ceil(pts.length / 7) === 0 || i === pts.length - 1)
  const dangerH = Math.max(0, Y1 - dangerY)
  return { linePoints, areaPoints, dots, yLabels, xLabels, dangerY, dangerH }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

export function ToastNotif({ msg, type, onClose }: { msg: string; type: 'ok' | 'err'; onClose: () => void }) {
  const ok = type === 'ok'
  const bg = ok ? '#ECFDF5' : '#FEF2F2'
  const color = ok ? '#065F46' : '#991B1B'
  const accent = ok ? '#10B981' : '#EF4444'
  const border = ok ? '#D1FAE5' : '#FEE2E2'
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: bg, color,
      borderRadius: 12, padding: '14px 18px', fontSize: 13, fontWeight: 600,
      boxShadow: '0 8px 30px rgba(15,36,68,0.12)', maxWidth: 420,
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      display: 'flex', alignItems: 'flex-start', gap: 11,
      borderLeft: `4px solid ${accent}`,
      borderTop: `1px solid ${border}`,
      borderRight: `1px solid ${border}`,
      borderBottom: `1px solid ${border}`,
      lineHeight: '1.45',
    }}>
      {ok ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
          <polyline points="20,6 9,17 4,12" />
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )}
      <span>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color, cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0, opacity: 0.6 }}>
        &times;
      </button>
    </div>
  )
}

export function SkeletonCard({ w = '100%', h = 80 }: { w?: string; h?: number }) {
  return (
    <div style={{
      width: w, height: h,
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%', borderRadius: 12,
      animation: 'shimmer 1.4s infinite',
    }} />
  )
}

export function AvatarCircle({ name, size = 36, bg }: { name: string; size?: number; bg: string }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: Math.round(size * 0.35),
      fontFamily: 'Plus Jakarta Sans, sans-serif', flexShrink: 0,
    }}>
      {initials(name)}
    </div>
  )
}

export function HealthScoreBadge({ score }: { score: number }) {
  let bg = '#10B981' // Green
  if (score < 40) bg = '#EF4444' // Red
  else if (score < 70) bg = '#F59E0B' // Yellow

  return (
    <div style={{
      width: 40, height: 40, borderRadius: 10, background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: 13,
      fontFamily: 'IBM Plex Mono, monospace', flexShrink: 0,
    }}>
      {score}
    </div>
  )
}

export function StatusPill({ label, risk }: { label: string; risk?: string }) {
  const c = getSafeRiskColor(risk)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 20, padding: '3px 9px', fontSize: 10.5, fontWeight: 700, color: c.text,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.edge, flexShrink: 0 }} />
      {label}
    </span>
  )
}

export function DiseasePill({ type }: { type?: DiseaseType }) {
  const t = type || 'diabetes_t2'
  const c = DISEASE_COLOR[t] || DISEASE_COLOR['diabetes_t2']
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: c.bg, borderRadius: 20, padding: '3px 9px',
      fontSize: 10.5, fontWeight: 700, color: c.text,
    }}>
      {DISEASE_LABEL[t] || 'Diabetes'}
    </span>
  )
}
