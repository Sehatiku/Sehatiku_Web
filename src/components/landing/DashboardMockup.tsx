import { C } from '../../lib/constants'

export default function DashboardMockup() {
  const chips = [
    { label: 'Bahaya', count: 2, col: '#895CF6' },
    { label: 'Waswas', count: 3, col: C.primary },
    { label: 'Aman',   count: 3, col: C.teal },
  ]
  const rows = [
    { init: 'AS', name: 'Ahmad Suharto', score: 92, w: '92%', col: '#895CF6', avatarBg: 'rgba(137,92,246,0.1)' },
    { init: 'SR', name: 'Siti Rahayu',   score: 87, w: '87%', col: C.primary,  avatarBg: 'rgba(99,102,241,0.1)'  },
    { init: 'HB', name: 'Hasan Basri',   score: 34, w: '34%', col: C.teal,     avatarBg: 'rgba(20,185,160,0.1)'  },
  ]
  return (
    <div style={{
      background: C.white, borderRadius: 20, border: `1px solid ${C.cardBorder}`,
      padding: 20, filter: 'drop-shadow(rgba(30,36,51,0.16) 0px 30px 70px)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: C.dark }}>Antrean Prioritas Pasien</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgb(238,240,254)', borderRadius: 7, padding: '5px 10px' }}>
          <div className="anim-blink" style={{ width: 6, height: 6, borderRadius: '50%', background: C.primary }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: C.primary }}>AI Auto-Sorted</span>
        </div>
      </div>
      {/* Risk chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 15 }}>
        {chips.map(c => (
          <div key={c.label} style={{
            flex: 1, background: 'rgb(250,250,254)',
            borderWidth: '2px 1px 1px', borderStyle: 'solid',
            borderColor: `${c.col} rgb(240,238,250) rgb(240,238,250)`,
            borderRadius: 9, padding: '9px 11px',
          }}>
            <div style={{ fontSize: 8, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{c.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: c.col }}>{c.count}</div>
          </div>
        ))}
      </div>
      {/* Patient rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map(r => (
          <div key={r.name} style={{
            display: 'flex', alignItems: 'center', gap: 11,
            background: 'rgb(250,250,254)', border: `1px solid rgb(240,238,250)`,
            borderRadius: 11, padding: '10px 12px',
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: r.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: r.col }}>
              {r.init}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: C.dark }}>{r.name}</div>
              <div style={{ height: 4, background: 'rgb(240,238,250)', borderRadius: 3, marginTop: 5, overflow: 'hidden' }}>
                <div style={{ width: r.w, height: '100%', background: r.col, borderRadius: 3 }} />
              </div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: r.col, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 800 }}>
              {r.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
