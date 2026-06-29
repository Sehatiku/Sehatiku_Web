import type { PatientQueueItem } from '../../../lib/types'
import {
  SkeletonCard,
  AvatarCircle,
  StatusPill,
  DiseasePill,
  RISK_COLOR,
} from './Common'

interface UmpanBalikViewProps {
  loading: boolean
  queue: PatientQueueItem[]
  feedbacks: Record<string, 'tepat' | 'tidak'>
  handleFeedback: (id: string, val: 'tepat' | 'tidak') => void
  tepat: number
  tidak: number
  akurasi: number
}

export default function UmpanBalikView({
  loading,
  queue,
  feedbacks,
  handleFeedback,
  tepat,
  tidak,
  akurasi,
}: UmpanBalikViewProps) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '22px 26px' }}>
      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} h={90} />)
        ) : (
          <>
            <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTop: '3px solid #5B6BF0' }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#636B78' }}>Total Eskalasi</p>
              <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#5B6BF0', fontFamily: 'IBM Plex Mono, monospace' }}>
                {queue.filter(p => p.status === 'bahaya').length}
              </p>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTop: '3px solid #1EC8A5' }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#636B78' }}>Ditandai Tepat</p>
              <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#1EC8A5', fontFamily: 'IBM Plex Mono, monospace' }}>{tepat}</p>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTop: '3px solid #EF4444' }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#636B78' }}>Tidak Tepat</p>
              <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#EF4444', fontFamily: 'IBM Plex Mono, monospace' }}>{tidak}</p>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTop: '3px solid #895CF6' }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#636B78' }}>Akurasi Eskalasi</p>
              <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#895CF6', fontFamily: 'IBM Plex Mono, monospace' }}>{akurasi}%</p>
            </div>
          </>
        )}
      </div>

      {/* Info banner */}
      <div style={{ background: '#F3F0FE', border: '1px solid #DDD6FE', borderRadius: 12, padding: '14px 18px', marginBottom: 18 }}>
        <p style={{ margin: 0, fontSize: 13, color: '#4C1D95', lineHeight: 1.6 }}>
          <strong>&#x1F916; Tentang Umpan Balik:</strong> Penilaian Anda membantu model AI belajar dari pengalaman klinis nyata.
          Setiap umpan balik digunakan dalam siklus RLHF (Reinforcement Learning from Human Feedback) untuk meningkatkan akurasi eskalasi berikutnya.
        </p>
      </div>

      {/* Escalation table */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <p style={{ margin: '0 0 16px', fontWeight: 700, fontSize: 15, color: '#2B2D42' }}>Eskalasi untuk Dinilai</p>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} h={60} />)}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
            <thead>
              <tr>
                {['Pasien', 'Penyebab & Penyakit', 'Health Score', 'Status Umpan Balik', 'Aksi'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0 12px 8px', fontSize: 11, fontWeight: 700, color: '#8A93A1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queue.map(p => {
                const given = feedbacks[p.patient_id]
                return (
                  <tr key={p.patient_id}>
                    <td style={{ padding: '10px 12px', background: '#F7F8FA', borderRadius: '10px 0 0 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <AvatarCircle name={p.full_name} size={32} bg={RISK_COLOR[p.risk_label].sqBg} />
                        <div>
                          <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 13, color: '#2B2D42' }}>{p.full_name}</p>
                          <StatusPill label={p.status === 'bahaya' ? 'Bahaya' : p.status === 'waswas' ? 'Waswas' : 'Aman'} risk={p.risk_label} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', background: '#F7F8FA' }}>
                      <p style={{ margin: '0 0 4px', fontSize: 12, color: '#2B2D42' }}>{p.main_factor || '—'}</p>
                      <DiseasePill type={p.disease_type} />
                    </td>
                    <td style={{ padding: '10px 12px', background: '#F7F8FA', textAlign: 'center' }}>
                      {(() => {
                        const hs = 100 - p.risk_score
                        const bg = hs >= 70 ? '#1EC8A5' : hs >= 40 ? '#F59E0B' : '#EF4444'
                        return (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 38, height: 38, borderRadius: 10, background: bg,
                            color: '#fff', fontWeight: 800, fontSize: 14, fontFamily: 'IBM Plex Mono, monospace',
                          }}>
                            {hs}
                          </div>
                        )
                      })()}
                    </td>
                    <td style={{ padding: '10px 12px', background: '#F7F8FA' }}>
                      {given ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          background: given === 'tepat' ? '#F0FDF8' : '#FEF2F2',
                          border: `1px solid ${given === 'tepat' ? '#A7ECD9' : '#FECACA'}`,
                          borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                          color: given === 'tepat' ? '#159E84' : '#DC2626',
                        }}>
                          {given === 'tepat' ? '✓ Tepat' : '✗ Tidak Tepat'}
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: '#8A93A1' }}>Belum dinilai</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', background: '#F7F8FA', borderRadius: '0 10px 10px 0' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleFeedback(p.patient_id, 'tepat')} title="Tepat" style={{
                          width: 38, height: 38, borderRadius: 8,
                          border: `2px solid #1EC8A5`,
                          background: given === 'tepat' ? '#1EC8A5' : '#fff',
                          color: given === 'tepat' ? '#fff' : '#1EC8A5',
                          cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          ✓
                        </button>
                        <button onClick={() => handleFeedback(p.patient_id, 'tidak')} title="Tidak Tepat" style={{
                          width: 38, height: 38, borderRadius: 8,
                          border: `2px solid #EF4444`,
                          background: given === 'tidak' ? '#EF4444' : '#fff',
                          color: given === 'tidak' ? '#fff' : '#EF4444',
                          cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          ✗
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
