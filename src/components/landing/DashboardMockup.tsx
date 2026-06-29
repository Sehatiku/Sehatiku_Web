import { C } from '../../lib/constants'

/**
 * Hero visual — "Pusat Kendali" bento: a small live clinical command-center
 * (Health Score gauge + ECG monitor, risk-trend sparkline, triage list, KPI).
 */
export default function DashboardMockup() {
  const tile: React.CSSProperties = {
    background: C.white, borderRadius: 18, border: `1px solid ${C.cardBorder}`,
    padding: 16, boxShadow: '0 1px 3px rgba(30,36,51,0.05)',
  }
  // ECG heartbeat path tiled twice for seamless scroll
  const beat = 'M0 22 H22 L28 22 L33 8 L40 36 L47 14 L52 22 H90'
  const triage = [
    { init: 'AS', name: 'Ahmad Suharto', score: 92, w: '92%', col: '#895CF6', bg: 'rgba(137,92,246,0.1)' },
    { init: 'HB', name: 'Hasan Basri', score: 34, w: '34%', col: C.teal, bg: 'rgba(20,185,160,0.1)' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.18fr 1fr', gap: 13, filter: 'drop-shadow(rgba(30,36,51,0.14) 0px 26px 60px)' }}>

      {/* A — Health Score gauge + ECG monitor */}
      <div style={{ ...tile, gridColumn: '1', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
            <svg width="64" height="64" viewBox="0 0 76 76" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="38" cy="38" r="34" fill="none" stroke="rgb(236,234,248)" strokeWidth="7" />
              <circle className="gauge-fill" cx="38" cy="38" r="34" fill="none" stroke="url(#gg)" strokeWidth="7" strokeLinecap="round" />
              <defs>
                <linearGradient id="gg" x1="0" y1="0" x2="76" y2="76">
                  <stop stopColor="#14B9A0" /><stop offset="1" stopColor="#6366F1" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 19, fontWeight: 800, color: C.dark, fontFamily: 'IBM Plex Mono, monospace', lineHeight: 1 }}>78</span>
              <span style={{ fontSize: 7, fontWeight: 700, color: C.muted, letterSpacing: '0.4px' }}>/100</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.dark }}>Health Score</div>
            <div style={{ fontSize: 10.5, color: C.tealLabel, fontWeight: 600, marginTop: 2 }}>Cohort · membaik ↑</div>
            <div style={{ fontSize: 9.5, color: C.muted, marginTop: 1 }}>diperbarui tiap hari</div>
          </div>
        </div>

        {/* ECG monitor strip */}
        <div style={{ position: 'relative', height: 46, background: 'rgb(250,250,254)', borderRadius: 10, overflow: 'hidden', border: '1px solid rgb(240,238,250)' }}>
          <svg width="100%" height="46" viewBox="0 0 180 46" preserveAspectRatio="none">
            <g className="ecg-scroll">
              <path d={beat} fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d={beat} transform="translate(90,0)" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d={beat} transform="translate(180,0)" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
          <span style={{ position: 'absolute', top: 6, left: 9, fontSize: 8, fontWeight: 700, color: C.muted, letterSpacing: '0.6px' }}>LIVE · BPM 72</span>
        </div>
      </div>

      {/* B — Risk trend sparkline */}
      <div style={{ ...tile, gridColumn: '2', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: C.dark }}>Tren Risiko</div>
          <span style={{ fontSize: 9, fontWeight: 800, color: C.tealLabel, background: 'rgb(230,250,245)', borderRadius: 20, padding: '2px 7px' }}>−12 ↓</span>
        </div>
        <div style={{ fontSize: 9.5, color: C.muted, marginTop: 2, marginBottom: 8 }}>7 hari terakhir</div>
        <svg width="100%" height="58" viewBox="0 0 150 58" preserveAspectRatio="none" style={{ flex: 1 }}>
          <defs>
            <linearGradient id="spk" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="rgba(99,102,241,0.20)" /><stop offset="1" stopColor="rgba(99,102,241,0)" />
            </linearGradient>
          </defs>
          <polygon points="2,44 2,40 26,32 50,36 74,22 98,26 122,12 148,16 148,44" fill="url(#spk)" />
          <polyline className="spark-draw" points="2,40 26,32 50,36 74,22 98,26 122,12 148,16" fill="none" stroke={C.primary} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="148" cy="16" r="3.4" fill="#fff" stroke={C.primary} strokeWidth="2.4" />
        </svg>
      </div>

      {/* C — Triage list */}
      <div style={{ ...tile, gridColumn: '1 / span 2' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: C.dark }}>Antrean Prioritas</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgb(238,240,254)', borderRadius: 7, padding: '4px 9px' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.primary }} />
            <span style={{ fontSize: 9, fontWeight: 700, color: C.primary }}>AI Auto-Sorted</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {triage.map(r => (
            <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'rgb(250,250,254)', border: '1px solid rgb(240,238,250)', borderRadius: 11, padding: '9px 11px' }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: r.col, flexShrink: 0 }}>{r.init}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: C.dark }}>{r.name}</div>
                <div style={{ height: 4, background: 'rgb(240,238,250)', borderRadius: 3, marginTop: 5, overflow: 'hidden' }}>
                  <div className="bar-grow" style={{ width: r.w, height: '100%', background: r.col, borderRadius: 3 }} />
                </div>
              </div>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: r.col, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12.5, fontWeight: 800, fontFamily: 'IBM Plex Mono, monospace', flexShrink: 0 }}>{r.score}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
