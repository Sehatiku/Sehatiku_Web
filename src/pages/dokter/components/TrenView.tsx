import type { PatientQueueItem } from '../../../lib/types'
import type { MockMetricSet } from '../dokterMockData'
import { MOCK_RISK_TREND } from '../dokterMockData'
import {
  SkeletonCard,
  AvatarCircle,
  StatusPill,
  DiseasePill,
  HealthScoreBadge,
  RISK_COLOR,
} from './Common'

type QueueFilter = 'all' | 'bahaya' | 'waswas' | 'aman'

interface TrenViewProps {
  loading: boolean
  queue: PatientQueueItem[]
  setTrenPatientId: (id: string | null) => void
  trenPatient: PatientQueueItem | null
  trenSearch: string
  setTrenSearch: (s: string) => void
  trenFilter: QueueFilter
  setTrenFilter: (f: QueueFilter) => void
  trenList: PatientQueueItem[]
  safeTrenIdx: number
  safeTrenMetrics: MockMetricSet
}

export default function TrenView({
  loading,
  queue,
  setTrenPatientId,
  trenPatient,
  trenSearch,
  setTrenSearch,
  trenFilter,
  setTrenFilter,
  trenList,
  safeTrenIdx,
  safeTrenMetrics,
}: TrenViewProps) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '22px 26px' }}>
      {!trenPatient ? (
        /* ── Patient list ── */
        <div>
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: '0 0 2px', fontWeight: 800, fontSize: 22, color: '#2B2D42', letterSpacing: '-0.4px' }}>Tren & Riwayat</p>
            <p style={{ margin: 0, fontSize: 13, color: '#8A93A1' }}>Pilih pasien untuk melihat tren health score &amp; riwayat klinis 6 bulan terakhir</p>
          </div>

          {/* Search + filter bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid #DCDFE8', borderRadius: 12, padding: '10px 12px', marginBottom: 14, boxShadow: '0 1px 3px rgba(15,36,68,0.04)' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A93A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                value={trenSearch}
                onChange={e => setTrenSearch(e.target.value)}
                placeholder="Cari nama pasien…"
                style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid #DCDFE8', borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 5, background: '#F7F8FA', borderRadius: 9, padding: 3 }}>
              {(['all', 'bahaya', 'waswas', 'aman'] as const).map(f => (
                <button key={f} onClick={() => setTrenFilter(f)} style={{
                  padding: '6px 14px', borderRadius: 7, border: 'none',
                  background: trenFilter === f ? '#fff' : 'transparent',
                  boxShadow: trenFilter === f ? '0 1px 3px rgba(15,36,68,0.1)' : 'none',
                  color: trenFilter === f ? '#5B6BF0' : '#636B78',
                  fontSize: 12, fontWeight: trenFilter === f ? 700 : 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}>
                  {f === 'all' ? 'Semua' : f === 'bahaya' ? 'Bahaya' : f === 'waswas' ? 'Waswas' : 'Aman'}
                </button>
              ))}
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#8A93A1', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {loading ? '…' : `${trenList.length} hasil`}
            </span>
          </div>

          {/* List card */}
          <div style={{ background: '#fff', border: '1px solid #DCDFE8', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,36,68,0.05)' }}>
            {/* Sehatiku signature: AI-sorted strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: 'linear-gradient(90deg, rgba(91,107,240,0.07), rgba(30,200,165,0.05))', borderBottom: '1px solid #EFF1F5' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B6BF0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#5B6BF0' }}>Diurutkan otomatis berdasarkan prioritas skor kesehatan</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#159E84', background: '#F0FDF8', border: '1px solid #A7ECD9', borderRadius: 20, padding: '2px 9px', marginLeft: 'auto' }}>AI Auto-Sorted</span>
            </div>
            {/* Column header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.1fr 90px 110px 90px 100px 28px', alignItems: 'center', gap: 12, padding: '11px 18px 11px 21px', background: '#F7F8FA', borderBottom: '1px solid #DCDFE8' }}>
              {['Nama Pasien', 'Penyebab Utama', 'Kepatuhan', 'Penyakit', 'Status', 'Health Score', ''].map((h, i) => (
                <span key={i} style={{ fontSize: 10, fontWeight: 700, color: '#636B78', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: i === 5 ? 'right' : 'left' }}>{h}</span>
              ))}
            </div>

            {loading ? (
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} h={48} />)}
              </div>
            ) : trenList.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '54px 0', gap: 10 }}>
                <span style={{ fontSize: 34 }}>&#x1F4CA;</span>
                <p style={{ margin: 0, color: '#8A93A1', fontSize: 13 }}>{queue.length === 0 ? 'Belum ada pasien terdaftar.' : 'Tidak ada pasien yang cocok.'}</p>
              </div>
            ) : (
              trenList.map((p, idx) => {
                const c = RISK_COLOR[p.risk_label]
                return (
                  <div
                    key={p.patient_id}
                    onClick={() => setTrenPatientId(p.patient_id)}
                    style={{
                      display: 'grid', gridTemplateColumns: '1.2fr 1.1fr 90px 110px 90px 100px 28px', alignItems: 'center', gap: 12,
                      padding: '13px 18px', paddingLeft: 18, cursor: 'pointer',
                      borderLeft: `3px solid ${c.edge}`,
                      borderBottom: idx < trenList.length - 1 ? '1px solid #EFF1F5' : 'none',
                      transition: 'background 0.12s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F7F8FF')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <AvatarCircle name={p.full_name} size={38} bg={c.sqBg} />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 13.5, color: '#2B2D42', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.full_name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: '#8A93A1' }}>{p.age} tahun</p>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#4A5260', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.main_factor || 'Kondisi Stabil'}
                    </div>
                    <div>
                      {(() => {
                        let compliance = '100%'
                        let color = '#10B981'
                        if (p.status === 'bahaya') {
                          compliance = '40%'
                          color = '#EF4444'
                        } else if (p.status === 'waswas') {
                          compliance = '71%'
                          color = '#F59E0B'
                        }
                        return (
                          <span style={{ fontSize: 12.5, fontWeight: 700, color, fontFamily: 'IBM Plex Mono, monospace' }}>
                            {compliance}
                          </span>
                        )
                      })()}
                    </div>
                    <div><DiseasePill type={p.disease_type} /></div>
                    <div><StatusPill label={p.status === 'bahaya' ? 'Bahaya' : p.status === 'waswas' ? 'Waswas' : 'Aman'} risk={p.risk_label} /></div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <HealthScoreBadge score={100 - p.risk_score} />
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C2C8D4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                )
              })
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Back button */}
          <button onClick={() => setTrenPatientId(null)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, alignSelf: 'flex-start',
            background: '#fff', border: '1px solid #DCDFE8', borderRadius: 9, padding: '7px 14px',
            fontSize: 12.5, fontWeight: 600, color: '#4A5260', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Kembali ke daftar pasien
          </button>
          {/* Mini header */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <AvatarCircle name={trenPatient.full_name} size={44} bg={RISK_COLOR[trenPatient.risk_label].sqBg} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: 16, color: '#2B2D42' }}>{trenPatient.full_name}</p>
                <DiseasePill type={trenPatient.disease_type} />
                <StatusPill
                  label={trenPatient.status === 'bahaya' ? 'Bahaya' : trenPatient.status === 'waswas' ? 'Waswas' : 'Aman'}
                  risk={trenPatient.risk_label}
                />
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#636B78' }}>
                {trenPatient.age} tahun &middot; Riwayat 6 bulan
                <span style={{ marginLeft: 10, fontWeight: 700, color: safeTrenMetrics.deltaColor }}>
                  {safeTrenMetrics.delta} {safeTrenMetrics.deltaLabel}
                </span>
              </p>
            </div>
          </div>

          {/* Health score bar chart */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: 15, color: '#2B2D42' }}>Tren Health Score</p>
            <p style={{ margin: '0 0 16px', fontSize: 11, color: '#8A93A1' }}>skor kesehatan bulanan (0&ndash;100) &middot; semakin tinggi semakin baik</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
              {(MOCK_RISK_TREND[Math.min(safeTrenIdx, MOCK_RISK_TREND.length - 1)]).map((entry, i) => {
                const healthScore = 100 - entry.score
                const barColor = healthScore >= 70 ? '#1EC8A5' : healthScore >= 40 ? '#F59E0B' : '#EF4444'
                const barH = Math.round((healthScore / 100) * 120)
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: barColor, fontFamily: 'IBM Plex Mono, monospace' }}>{healthScore}</span>
                    <div style={{ width: '100%', height: barH, background: barColor, borderRadius: '6px 6px 0 0' }} />
                    <span style={{ fontSize: 11, color: '#636B78' }}>{entry.month}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Clinical metrics */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ margin: '0 0 14px', fontWeight: 700, fontSize: 15, color: '#2B2D42' }}>Parameter Klinis Terkini</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {safeTrenMetrics.metrics.map((m, i) => (
                <div key={i} style={{ background: '#F7F8FA', borderRadius: 12, padding: '12px 14px' }}>
                  <p style={{ margin: '0 0 4px', fontSize: 11, color: '#636B78' }}>{m.label}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: '#2B2D42', fontFamily: 'IBM Plex Mono, monospace', fontVariantNumeric: 'tabular-nums' }}>{m.value}</span>
                    {m.unit && <span style={{ fontSize: 10, color: '#8A93A1' }}>{m.unit}</span>}
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: m.trendBg, borderRadius: 6, padding: '2px 7px', fontSize: 11, fontWeight: 700, color: m.trendColor, marginTop: 4 }}>
                    {m.arrow} {m.deltaTxt}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ margin: '0 0 16px', fontWeight: 700, fontSize: 15, color: '#2B2D42' }}>Riwayat Klinis</p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {safeTrenMetrics.timeline.map((tl, i) => {
                const last = i === safeTrenMetrics.timeline.length - 1
                return (
                  <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: last ? 0 : 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: tl.color, flexShrink: 0 }} />
                      {!last && <div style={{ width: 2, flex: 1, background: '#DCDFE8', marginTop: 4, minHeight: 24 }} />}
                    </div>
                    <div style={{ paddingBottom: last ? 0 : 4 }}>
                      <p style={{ margin: '0 0 2px', fontSize: 11, color: '#8A93A1' }}>{tl.date}</p>
                      <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 13, color: '#2B2D42' }}>{tl.title}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#636B78' }}>{tl.note}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
