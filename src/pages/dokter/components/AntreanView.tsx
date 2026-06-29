import type { PatientQueueItem, ConsultationResult } from '../../../lib/types'
import {
  SkeletonCard,
  AvatarCircle,
  StatusPill,
  DiseasePill,
  HealthScoreBadge,
  RISK_COLOR,
  DISEASE_LABEL,
} from './Common'
import TrendChart from './TrendChart'
import ShapCard from './ShapCard'
import LogCard from './LogCard'
import FeedbackCard from './FeedbackCard'
import ReviewKeluhanCard from './ReviewKeluhanCard'

type QueueFilter = 'all' | 'bahaya' | 'waswas' | 'aman'

interface AntreanViewProps {
  loading: boolean
  filteredQueue: PatientQueueItem[]
  queueFilter: QueueFilter
  setQueueFilter: (f: QueueFilter) => void
  queueLength: number
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  selectedPatient: PatientQueueItem | null
  safeSelectedIdx: number
  contacted: Set<string>
  handleContact: (id: string) => void
  feedbacks: Record<string, 'tepat' | 'tidak'>
  handleFeedback: (id: string, val: 'tepat' | 'tidak') => void
  chartParam: 'glucose' | 'bp'
  setChartParam: (p: 'glucose' | 'bp') => void
  chartRange: 7 | 14
  setChartRange: (r: 7 | 14) => void
  consultations: ConsultationResult[]
  onReviewConsultation: (id: string, notes: string) => void
}

export default function AntreanView({
  loading,
  filteredQueue,
  queueFilter,
  setQueueFilter,
  queueLength,
  selectedId,
  setSelectedId,
  selectedPatient,
  safeSelectedIdx,
  contacted,
  handleContact,
  feedbacks,
  handleFeedback,
  chartParam,
  setChartParam,
  chartRange,
  setChartRange,
  consultations,
  onReviewConsultation,
}: AntreanViewProps) {
  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Left queue panel */}
      <div style={{ width: 340, minWidth: 340, borderRight: '1px solid #DCDFE8', background: '#F7F8FA', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 16px 10px', borderBottom: '1px solid #EFF1F5' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#2B2D42' }}>Pasien Saya</span>
            <span style={{ background: '#EEEFFE', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700, color: '#5B6BF0' }}>
              {queueLength} pasien
            </span>
          </div>
          {/* Sehatiku signature: live triage indicator */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12, background: '#F0FDF8', border: '1px solid #A7ECD9', borderRadius: 20, padding: '3px 10px' }}>
            <span className="anim-blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#1EC8A5', flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#159E84', letterSpacing: '0.2px' }}>Triase langsung · diperbarui tiap 60 dtk</span>
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {(['all', 'bahaya', 'waswas', 'aman'] as const).map(f => (
              <button key={f} onClick={() => setQueueFilter(f)} style={{
                padding: '4px 10px', borderRadius: 20, border: `1.5px solid ${queueFilter === f ? '#5B6BF0' : '#DCDFE8'}`,
                background: queueFilter === f ? '#EEEFFE' : '#fff', color: queueFilter === f ? '#5B6BF0' : '#636B78',
                fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}>
                {f === 'all' ? 'Semua' : f === 'bahaya' ? 'Bahaya' : f === 'waswas' ? 'Waswas' : 'Aman'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} h={88} />)
          ) : filteredQueue.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8, paddingTop: 60 }}>
              <span style={{ fontSize: 36 }}>&#x1F389;</span>
              <p style={{ margin: 0, fontSize: 14, color: '#636B78', textAlign: 'center' }}>Tidak ada pasien di kategori ini.</p>
            </div>
          ) : (
            filteredQueue.map(p => {
              const c = RISK_COLOR[p.risk_label]
              const sel = p.patient_id === selectedId
              const needsContact = !contacted.has(p.patient_id) && (p.status === 'bahaya' || p.status === 'waswas')
              return (
                <div
                  key={p.patient_id}
                  onClick={() => setSelectedId(p.patient_id)}
                  style={{
                    background: '#fff', borderRadius: 12, padding: '12px 13px', cursor: 'pointer',
                    borderLeft: `4px solid ${c.edge}`,
                    outline: sel ? `2px solid ${c.edge}` : '2px solid transparent',
                    boxShadow: sel ? `0 4px 14px ${c.edge}33` : '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1 }}>
                      <AvatarCircle name={p.full_name} size={36} bg={c.sqBg} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 13, color: '#2B2D42', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.full_name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: '#636B78' }}>{p.age} thn &middot; {DISEASE_LABEL[p.disease_type]}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
                          <StatusPill label={p.status === 'bahaya' ? 'Bahaya' : p.status === 'waswas' ? 'Waswas' : 'Aman'} risk={p.risk_label} />
                          {p.main_factor && <span style={{ fontSize: 10, color: '#8A93A1' }}>{p.main_factor}</span>}
                          {consultations.some(c => c.patient_id === p.patient_id && c.status === 'open') && (
                            <span style={{
                              background: '#FFF9F0', border: '1px solid #FFE2B7', borderRadius: 4,
                              padding: '1px 6px', fontSize: 9, fontWeight: 700, color: '#D97706',
                              display: 'inline-flex', alignItems: 'center', gap: 3
                            }}>
                              <span className="anim-blink" style={{ width: 5, height: 5, borderRadius: '50%', background: '#F59E0B' }} />
                              Butuh Review
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <HealthScoreBadge score={100 - p.risk_score} />
                  </div>
                  {needsContact && (
                    <div style={{ marginTop: 8, background: '#F3F0FE', borderRadius: 6, padding: '4px 8px' }}>
                      <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: '#7C5CFC' }}>&#x26A1; Perlu dihubungi hari ini</p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Right detail panel */}
      <div style={{ flex: 1, minWidth: 560, overflowY: 'auto', padding: '20px 24px' }}>
        {!selectedPatient ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
            <span style={{ fontSize: 48 }}>&#x1F468;&#x200D;&#x2695;&#xFE0F;</span>
            <p style={{ margin: 0, fontSize: 15, color: '#8A93A1', fontWeight: 500 }}>Pilih pasien untuk melihat detail</p>
            <p style={{ margin: 0, fontSize: 12, color: '#C2C8D4' }}>Klik kartu pasien di panel kiri</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Patient header */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <AvatarCircle name={selectedPatient.full_name} size={58} bg={RISK_COLOR[selectedPatient.risk_label].sqBg} />
                  <div>
                    <p style={{ margin: '0 0 6px', fontWeight: 800, fontSize: 20, color: '#2B2D42' }}>{selectedPatient.full_name}</p>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                      <DiseasePill type={selectedPatient.disease_type} />
                      <StatusPill
                        label={selectedPatient.status === 'bahaya' ? 'Bahaya' : selectedPatient.status === 'waswas' ? 'Waswas' : 'Aman'}
                        risk={selectedPatient.risk_label}
                      />
                    </div>
                    <p style={{ margin: '5px 0 0', fontSize: 12, color: '#636B78' }}>
                      {selectedPatient.age} tahun &middot; Pasien Prolanis
                      {selectedPatient.main_factor && <> &middot; <em>{selectedPatient.main_factor}</em></>}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  {(() => {
                    const hs = 100 - selectedPatient.risk_score
                    const bg = hs >= 70 ? '#1EC8A5' : hs >= 40 ? '#F59E0B' : '#EF4444'
                    return (
                      <div style={{
                        width: 62, height: 62, borderRadius: 16,
                        background: bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 800, fontSize: 24,
                        fontFamily: 'IBM Plex Mono, monospace', fontVariantNumeric: 'tabular-nums',
                      }}>
                        {hs}
                      </div>
                    )
                  })()}
                  {contacted.has(selectedPatient.patient_id) ? (
                    <span style={{
                      background: '#F0FDF8', border: '1px solid #A7ECD9', borderRadius: 8,
                      padding: '7px 14px', fontSize: 12, fontWeight: 700, color: '#159E84',
                    }}>
                      ✓ Sudah Dihubungi
                    </span>
                  ) : (
                    <button onClick={() => handleContact(selectedPatient.patient_id)} style={{
                      background: '#1EC8A5', border: 'none', borderRadius: 8,
                      padding: '7px 14px', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer',
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                    }}>
                      &#x1F4DE; Hubungi
                    </button>
                  )}
                </div>
              </div>
              <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #EFF1F5' }}>
                <p style={{ margin: 0, fontSize: 11, color: '#8A93A1', fontStyle: 'italic' }}>
                  &#x26A0;&#xFE0F; Health Score &amp; atribusi bersifat indikatif &mdash; bukan diagnosis medis.
                </p>
              </div>
            </div>

            {/* Review Keluhan Card */}
            {(() => {
              const activeConsultation = consultations.find(c => c.patient_id === selectedPatient.patient_id && c.status === 'open') ?? consultations.find(c => c.patient_id === selectedPatient.patient_id)
              return (
                <ReviewKeluhanCard
                  consultation={activeConsultation}
                  onReview={onReviewConsultation}
                />
              )
            })()}

            {/* Chart + SHAP */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 14 }}>
              <TrendChart
                patientIdx={safeSelectedIdx}
                chartParam={chartParam}
                chartRange={chartRange}
                onParamChange={setChartParam}
                onRangeChange={setChartRange}
              />
              <ShapCard patientIdx={safeSelectedIdx} />
            </div>

            {/* Log + Feedback */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 14 }}>
              <LogCard patientIdx={safeSelectedIdx} />
              <FeedbackCard patient={selectedPatient} feedbacks={feedbacks} onFeedback={handleFeedback} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
