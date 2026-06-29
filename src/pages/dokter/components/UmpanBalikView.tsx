import type { PatientQueueItem } from '../../../lib/types'
import { SkeletonCard, AvatarCircle, RISK_COLOR, DISEASE_LABEL } from './Common'

interface UmpanBalikViewProps {
  loading: boolean
  queue: PatientQueueItem[]
  feedbacks: Record<string, 'tepat' | 'tidak'>
  handleFeedback: (id: string, val: 'tepat' | 'tidak') => void
  tepat: number
  tidak: number
  akurasi: number
}

const ICONS = {
  eskalasi: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  tepat: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  tidak: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  akurasi: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
}

export default function UmpanBalikView({ loading, queue, feedbacks, handleFeedback, tepat, tidak, akurasi }: UmpanBalikViewProps) {
  const totalEskalasi = queue.filter(p => p.status === 'bahaya').length
  const totalDinilai = tepat + tidak

  const statCards = [
    {
      label: 'Total Eskalasi',
      value: String(totalEskalasi),
      sub: 'pasien bahaya',
      color: '#4F46E5',
      iconBg: '#EEF2FF',
      icon: ICONS.eskalasi,
    },
    {
      label: 'Ditandai Tepat',
      value: String(tepat),
      sub: `dari ${totalDinilai} dinilai`,
      color: '#059669',
      iconBg: '#ECFDF5',
      icon: ICONS.tepat,
    },
    {
      label: 'Tidak Tepat',
      value: String(tidak),
      sub: `dari ${totalDinilai} dinilai`,
      color: '#DC2626',
      iconBg: '#FEF2F2',
      icon: ICONS.tidak,
    },
    {
      label: 'Akurasi',
      value: `${akurasi}%`,
      sub: 'dari semua penilaian',
      color: '#7C3AED',
      iconBg: '#F5F3FF',
      icon: ICONS.akurasi,
    },
  ]

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', background: '#F4F5F7' }}>

      {/* ── Stat cards (individual, like reference) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #F0F1F4', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <SkeletonCard h={72} />
              </div>
            ))
          : statCards.map(stat => (
              <div
                key={stat.label}
                style={{
                  background: '#fff', borderRadius: 14, padding: '18px 20px',
                  border: '1px solid #F0F1F4',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                {/* Top row: label + icon */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <p style={{ margin: 0, fontSize: 12.5, color: '#6B7280', fontWeight: 500, lineHeight: 1.4, flex: 1, paddingRight: 8 }}>
                    {stat.label}
                  </p>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: stat.iconBg, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {stat.icon}
                  </div>
                </div>
                {/* Value */}
                <p style={{
                  margin: '0 0 4px', fontSize: 28, fontWeight: 800,
                  color: stat.color, fontFamily: 'IBM Plex Mono, monospace', lineHeight: 1,
                }}>
                  {stat.value}
                </p>
                <p style={{ margin: 0, fontSize: 11.5, color: '#9CA3AF' }}>{stat.sub}</p>
              </div>
            ))
        }
      </div>

      {/* ── Table card ── */}
      <div style={{
        background: '#fff', borderRadius: 14,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden',
        border: '1px solid #F0F1F4',
      }}>
        {/* Table header */}
        <div style={{
          padding: '14px 22px', borderBottom: '1px solid #F3F4F6',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
        }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#111827' }}>Eskalasi untuk Dinilai</p>
          <span style={{ fontSize: 11.5, color: '#9CA3AF', flexShrink: 0 }}>
            Penilaian Anda membantu model AI meningkatkan akurasi eskalasi
          </span>
        </div>

        {/* Progress bar row */}
        {!loading && totalDinilai > 0 && (
          <div style={{
            padding: '9px 22px', borderBottom: '1px solid #F0F0F0',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 11, color: '#9CA3AF', flexShrink: 0 }}>Rasio penilaian</span>
            <div style={{ flex: 1, height: 5, background: '#F3F4F6', borderRadius: 99, display: 'flex', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(tepat / queue.length) * 100}%`, background: '#10B981', borderRadius: '99px 0 0 99px' }} />
              <div style={{ height: '100%', width: `${(tidak / queue.length) * 100}%`, background: '#EF4444' }} />
            </div>
            <span style={{ fontSize: 11, color: '#9CA3AF', flexShrink: 0 }}>{totalDinilai} / {queue.length} dinilai</span>
          </div>
        )}

        {/* Column header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 72px 130px 100px',
          padding: '9px 22px', gap: 16,
          background: '#FAFAFA', borderBottom: '1px solid #F0F0F0',
        }}>
          {['PASIEN', 'PENYAKIT', 'SKOR', 'STATUS', 'AKSI'].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#B0B7C3', letterSpacing: '0.6px', textTransform: 'uppercase' }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '12px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} h={56} />)}
          </div>
        ) : (
          queue.map((p, idx) => {
            const given = feedbacks[p.patient_id]
            const hs = 100 - p.risk_score
            const hsColor = hs >= 70 ? '#10B981' : hs >= 40 ? '#F59E0B' : '#EF4444'

            return (
              <div
                key={p.patient_id}
                style={{
                  display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 72px 130px 100px',
                  alignItems: 'center', padding: '13px 22px', gap: 16,
                  borderBottom: idx < queue.length - 1 ? '1px solid #F5F5F7' : 'none',
                  background: '#fff',
                }}
              >
                {/* Patient */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <AvatarCircle name={p.full_name} size={34} bg={RISK_COLOR[p.risk_label].sqBg} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      margin: '0 0 2px', fontWeight: 600, fontSize: 13, color: '#111827',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{p.full_name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF' }}>{p.age} thn</p>
                  </div>
                </div>

                {/* Disease */}
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: 12.5, fontWeight: 500, color: '#4B5563' }}>
                    {DISEASE_LABEL[p.disease_type]}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: '#B0B7C3' }}>{p.main_factor || '—'}</p>
                </div>

                {/* Score */}
                <span style={{ fontSize: 15, fontWeight: 800, color: hsColor, fontFamily: 'IBM Plex Mono, monospace' }}>
                  {hs}
                </span>

                {/* Status badge */}
                {given ? (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: given === 'tepat' ? '#F0FDF9' : '#FFF5F5',
                    border: `1px solid ${given === 'tepat' ? '#D1FAE5' : '#FECACA'}`,
                    borderRadius: 7, padding: '4px 11px',
                    fontSize: 11.5, fontWeight: 700,
                    color: given === 'tepat' ? '#059669' : '#DC2626',
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: given === 'tepat' ? '#10B981' : '#EF4444',
                      flexShrink: 0,
                    }} />
                    {given === 'tepat' ? 'Tepat' : 'Tidak Tepat'}
                  </span>
                ) : (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 11.5, color: '#9CA3AF',
                    background: '#F9FAFB', border: '1px solid #E5E7EB',
                    borderRadius: 7, padding: '4px 11px',
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D1D5DB', flexShrink: 0 }} />
                    Belum dinilai
                  </span>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => handleFeedback(p.patient_id, 'tepat')}
                    title="Tepat"
                    style={{
                      width: 34, height: 34, borderRadius: 8,
                      border: `1.5px solid ${given === 'tepat' ? '#10B981' : '#D1FAE5'}`,
                      background: given === 'tepat' ? '#10B981' : '#F0FDF9',
                      color: given === 'tepat' ? '#fff' : '#10B981',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (given !== 'tepat') { e.currentTarget.style.background = '#D1FAE5' } }}
                    onMouseLeave={e => { if (given !== 'tepat') { e.currentTarget.style.background = '#F0FDF9' } }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleFeedback(p.patient_id, 'tidak')}
                    title="Tidak Tepat"
                    style={{
                      width: 34, height: 34, borderRadius: 8,
                      border: `1.5px solid ${given === 'tidak' ? '#EF4444' : '#FECACA'}`,
                      background: given === 'tidak' ? '#EF4444' : '#FFF5F5',
                      color: given === 'tidak' ? '#fff' : '#EF4444',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (given !== 'tidak') { e.currentTarget.style.background = '#FEE2E2' } }}
                    onMouseLeave={e => { if (given !== 'tidak') { e.currentTarget.style.background = '#FFF5F5' } }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
