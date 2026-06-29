import type { ReactNode } from 'react'
import type { PatientQueueItem } from '../../../lib/types'
import type { MockMetricSet } from '../dokterMockData'
import { MOCK_RISK_TREND } from '../dokterMockData'
import {
  SkeletonCard,
  AvatarCircle,
  StatusPill,
  RISK_COLOR,
  DISEASE_LABEL,
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
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', background: '#F4F5F7' }}>
      <style>{`
        .tren-row:hover { background: #F8F9FC !important; }
      `}</style>

      {!trenPatient ? (
        <>
          {/* ── Summary Stats ── */}
          {(() => {
            const stats: Array<{ label: string; value: number; sub: string; color: string; iconBg: string; icon: ReactNode }> = [
              {
                label: 'Total Terpantau', value: queue.length, sub: 'total pasien', color: '#2B2D42', iconBg: '#EEF2FF',
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B6BF0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
              },
              {
                label: 'Risiko Bahaya', value: queue.filter(p => p.status === 'bahaya').length, sub: 'perlu perhatian segera', color: '#EF4444', iconBg: '#FEF2F2',
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
              },
              {
                label: 'Perlu Pantau', value: queue.filter(p => p.status === 'waswas').length, sub: 'dalam pengawasan', color: '#D97706', iconBg: '#FFFBEB',
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
              },
              {
                label: 'Status Aman', value: queue.filter(p => p.status === 'aman').length, sub: 'kondisi terkontrol', color: '#059669', iconBg: '#ECFDF5',
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
              },
            ]
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #F0F1F4', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <SkeletonCard h={72} />
                      </div>
                    ))
                  : stats.map(stat => (
                      <div key={stat.label} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #F0F1F4', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                          <p style={{ margin: 0, fontSize: 12.5, color: '#6B7280', fontWeight: 500, lineHeight: 1.4, flex: 1, paddingRight: 8 }}>{stat.label}</p>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: stat.iconBg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {stat.icon}
                          </div>
                        </div>
                        <p style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800, color: stat.color, fontFamily: 'IBM Plex Mono, monospace', lineHeight: 1 }}>{stat.value}</p>
                        <p style={{ margin: 0, fontSize: 11.5, color: '#9CA3AF' }}>{stat.sub}</p>
                      </div>
                    ))
                }
              </div>
            )
          })()}

          {/* ── Toolbar ── */}
          <div style={{
            background: '#fff', borderRadius: 14, padding: '12px 16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
            border: '1px solid #F0F1F4',
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap',
          }}>
            {/* Search */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#F3F4F6', borderRadius: 9, padding: '7px 12px', flex: 1, maxWidth: 280,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                value={trenSearch}
                onChange={e => setTrenSearch(e.target.value)}
                placeholder="Cari nama pasien..."
                style={{
                  border: 'none', background: 'transparent', outline: 'none',
                  fontSize: 12.5, color: '#111827', fontFamily: 'Plus Jakarta Sans, sans-serif', width: '100%',
                }}
              />
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 9, padding: 3, gap: 2 }}>
              {(['all', 'bahaya', 'waswas', 'aman'] as const).map(f => (
                <button key={f} onClick={() => setTrenFilter(f)} style={{
                  padding: '5px 13px', borderRadius: 7, border: 'none',
                  background: trenFilter === f ? '#fff' : 'transparent',
                  color: trenFilter === f ? '#111827' : '#9CA3AF',
                  fontSize: 12, fontWeight: trenFilter === f ? 700 : 500,
                  cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                  boxShadow: trenFilter === f ? '0 1px 3px rgba(0,0,0,0.09)' : 'none',
                  transition: 'all 0.15s',
                }}>
                  {f === 'all' ? 'Semua' : f === 'bahaya' ? 'Bahaya' : f === 'waswas' ? 'Waswas' : 'Aman'}
                </button>
              ))}
            </div>

            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>
              {loading ? '—' : `${trenList.length} pasien`}
            </span>
          </div>

          {/* ── Table ── */}
          <div style={{
            background: '#fff', borderRadius: 14,
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
            border: '1px solid #F0F1F4',
            overflow: 'hidden',
          }}>
            {/* Column header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2.2fr 1.2fr 80px 90px 80px 72px 28px',
              padding: '10px 22px', gap: 14,
              background: '#FAFAFA', borderBottom: '1px solid #F0F0F0',
            }}>
              {['NAMA PASIEN', 'PENYEBAB UTAMA', 'KEPATUHAN', 'PENYAKIT', 'STATUS', 'SKOR', ''].map(h => (
                <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#B0B7C3', letterSpacing: '0.6px', textTransform: 'uppercase' }}>{h}</span>
              ))}
            </div>

            {loading ? (
              <div style={{ padding: '12px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} h={56} />)}
              </div>
            ) : trenList.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', gap: 8 }}>
                <span style={{ fontSize: 28 }}>📊</span>
                <p style={{ margin: 0, fontSize: 13.5, color: '#9CA3AF' }}>
                  {queue.length === 0 ? 'Belum ada pasien terdaftar.' : 'Tidak ada pasien yang cocok.'}
                </p>
              </div>
            ) : (
              trenList.map((p, idx) => {
                const c = RISK_COLOR[p.risk_label]
                const hs = 100 - p.risk_score
                const hsColor = hs >= 70 ? '#10B981' : hs >= 40 ? '#F59E0B' : '#EF4444'
                const compliance = p.status === 'bahaya' ? { val: '40%', color: '#EF4444' }
                  : p.status === 'waswas' ? { val: '71%', color: '#F59E0B' }
                  : { val: '100%', color: '#10B981' }

                return (
                  <div
                    key={p.patient_id}
                    className="tren-row"
                    onClick={() => setTrenPatientId(p.patient_id)}
                    style={{
                      display: 'grid', gridTemplateColumns: '2.2fr 1.2fr 80px 90px 80px 72px 28px',
                      alignItems: 'center', padding: '13px 22px', gap: 14,
                      borderBottom: idx < trenList.length - 1 ? '1px solid #F5F5F7' : 'none',
                      cursor: 'pointer', transition: 'background 0.1s',
                      background: '#fff',
                    }}
                  >
                    {/* Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                      <AvatarCircle name={p.full_name} size={36} bg={c.sqBg} />
                      <div style={{ minWidth: 0 }}>
                        <p style={{
                          margin: '0 0 2px', fontWeight: 600, fontSize: 13.5, color: '#111827',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{p.full_name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF' }}>{p.age} tahun</p>
                      </div>
                    </div>

                    {/* Main factor */}
                    <span style={{ fontSize: 12.5, color: '#4B5563', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.main_factor || 'Kondisi Stabil'}
                    </span>

                    {/* Compliance */}
                    <span style={{ fontSize: 13, fontWeight: 700, color: compliance.color, fontFamily: 'IBM Plex Mono, monospace' }}>
                      {compliance.val}
                    </span>

                    {/* Disease — plain text */}
                    <span style={{ fontSize: 12.5, fontWeight: 500, color: '#4B5563' }}>
                      {DISEASE_LABEL[p.disease_type]}
                    </span>

                    {/* Status */}
                    <StatusPill
                      label={p.status === 'bahaya' ? 'Bahaya' : p.status === 'waswas' ? 'Waswas' : 'Aman'}
                      risk={p.risk_label}
                    />

                    {/* Score — plain number */}
                    <span style={{ fontSize: 15, fontWeight: 800, color: hsColor, fontFamily: 'IBM Plex Mono, monospace' }}>
                      {hs}
                    </span>

                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                )
              })
            )}
          </div>
        </>
      ) : (
        /* ── Patient detail view ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Back */}
          <button
            onClick={() => setTrenPatientId(null)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
              background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
              padding: '6px 13px', fontSize: 12.5, fontWeight: 600, color: '#4B5563',
              cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Kembali
          </button>

          {/* Patient mini-header */}
          <div style={{
            background: '#fff', borderRadius: 14, padding: '16px 20px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <AvatarCircle name={trenPatient.full_name} size={44} bg={RISK_COLOR[trenPatient.risk_label].sqBg} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#111827' }}>{trenPatient.full_name}</p>
                <StatusPill
                  label={trenPatient.status === 'bahaya' ? 'Bahaya' : trenPatient.status === 'waswas' ? 'Waswas' : 'Aman'}
                  risk={trenPatient.risk_label}
                />
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>
                {trenPatient.age} tahun · {DISEASE_LABEL[trenPatient.disease_type]} · Riwayat 6 bulan
                <span style={{ marginLeft: 10, fontWeight: 700, color: safeTrenMetrics.deltaColor }}>
                  {safeTrenMetrics.delta} {safeTrenMetrics.deltaLabel}
                </span>
              </p>
            </div>
          </div>

          {/* Health Score Bar Chart */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 13.5, color: '#111827' }}>Tren Health Score</p>
            <p style={{ margin: '0 0 18px', fontSize: 11, color: '#9CA3AF' }}>Skor kesehatan bulanan (0–100) · semakin tinggi semakin baik</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 148, padding: '0 4px' }}>
              {MOCK_RISK_TREND[Math.min(safeTrenIdx, MOCK_RISK_TREND.length - 1)].map((entry, i) => {
                const hs = 100 - entry.score
                const barColor = hs >= 70 ? '#10B981' : hs >= 40 ? '#F59E0B' : '#EF4444'
                const barH = Math.max(10, Math.round((hs / 100) * 112))
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: barColor, fontFamily: 'IBM Plex Mono, monospace' }}>{hs}</span>
                    <div style={{
                      width: '100%', height: barH,
                      background: `linear-gradient(180deg, ${barColor}BB 0%, ${barColor} 100%)`,
                      borderRadius: '6px 6px 0 0',
                      boxShadow: `0 2px 6px ${barColor}33`,
                    }} />
                    <span style={{ fontSize: 10.5, color: '#9CA3AF' }}>{entry.month}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Clinical metrics */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <p style={{ margin: '0 0 14px', fontWeight: 700, fontSize: 13.5, color: '#111827' }}>Parameter Klinis Terkini</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {safeTrenMetrics.metrics.map((m, i) => (
                <div key={i} style={{
                  background: '#F9FAFB', borderRadius: 10, padding: '12px 14px',
                  border: '1px solid #F0F1F4',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}>
                  <p style={{ margin: '0 0 6px', fontSize: 10.5, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{m.label}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: '#111827', fontFamily: 'IBM Plex Mono, monospace' }}>{m.value}</span>
                    {m.unit && <span style={{ fontSize: 10, color: '#9CA3AF' }}>{m.unit}</span>}
                  </div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    background: m.trendBg, borderRadius: 5, padding: '2px 7px',
                    fontSize: 11, fontWeight: 700, color: m.trendColor, marginTop: 7,
                  }}>
                    {m.arrow} {m.deltaTxt}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <p style={{ margin: '0 0 16px', fontWeight: 700, fontSize: 13.5, color: '#111827' }}>Riwayat Klinis</p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {safeTrenMetrics.timeline.map((tl, i) => {
                const last = i === safeTrenMetrics.timeline.length - 1
                return (
                  <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: last ? 0 : 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: tl.color, flexShrink: 0 }} />
                      {!last && <div style={{ width: 1.5, flex: 1, background: '#F0F0F0', marginTop: 5, minHeight: 20 }} />}
                    </div>
                    <div style={{ paddingBottom: last ? 0 : 4 }}>
                      <p style={{ margin: '0 0 2px', fontSize: 11, color: '#9CA3AF' }}>{tl.date}</p>
                      <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: 13, color: '#111827' }}>{tl.title}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>{tl.note}</p>
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
