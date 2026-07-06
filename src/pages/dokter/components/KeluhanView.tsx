import { useState, useMemo, useEffect } from 'react'
import { nakesApi } from '../../../lib/api'
import type { PatientQueueItem, ConsultationResult, NakesDailyLog } from '../../../lib/types'
import { AvatarCircle, DISEASE_LABEL, getSafeRiskColor } from './Common'
import ReviewKeluhanCard from './ReviewKeluhanCard'
import LogCard from './LogCard'

interface KeluhanViewProps {
  queue: PatientQueueItem[]
  consultations: ConsultationResult[]
  onReviewConsultation: (id: string, notes: string) => void
}

type KeluhanFilter = 'all' | 'pending' | 'resolved'

function formatDisplayName(name?: string | null) {
  if (!name) return 'Pasien'
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}


export default function KeluhanView({ queue, consultations, onReviewConsultation }: KeluhanViewProps) {
  const [filter, setFilter] = useState<KeluhanFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => consultations.filter(c => {
    if (filter === 'pending') return c.status === 'open'
    if (filter === 'resolved') return c.status === 'replied'
    return true
  }), [consultations, filter])

  const activeId = selectedId || filtered[0]?.id || null
  const selectedConsultation = consultations.find(c => c.id === activeId) || null
  const selectedPatient = useMemo(() =>
    selectedConsultation ? queue.find(p => p.patient_id === selectedConsultation.patient_id) || null : null,
    [selectedConsultation, queue])
  // Log harian real dari BE untuk pasien keluhan terpilih
  const [dailyLogs, setDailyLogs] = useState<NakesDailyLog[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const selectedPatientId = selectedConsultation?.patient_id ?? null

  useEffect(() => {
    if (!selectedPatientId) { setDailyLogs([]); return }
    let cancelled = false
    setLogsLoading(true)
    setDailyLogs([])
    nakesApi.getPatientDetail(selectedPatientId)
      .then(d => { if (!cancelled) setDailyLogs(d.daily_logs ?? []) })
      .catch(() => { if (!cancelled) setDailyLogs([]) })
      .finally(() => { if (!cancelled) setLogsLoading(false) })
    return () => { cancelled = true }
  }, [selectedPatientId])

  const pendingCount = consultations.filter(c => c.status === 'open').length

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      overflow: 'hidden',
      background: '#F8FAFC',
      position: 'relative'
    }}>
      {/* ── Left inbox panel ── */}
      <div style={{
        width: 330, minWidth: 330, flexShrink: 0,
        background: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        zIndex: 2,
      }}>
        {/* Panel header */}
        <div style={{ padding: '20px 18px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.3px' }}>Keluhan Pasien</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {pendingCount > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: '#FFF7ED', border: '1px solid #FED7AA',
                  borderRadius: 20, padding: '3px 10px',
                  fontSize: 10, fontWeight: 700, color: '#C2410C',
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#F97316' }} />
                  {pendingCount} pending
                </span>
              )}
              <span style={{
                background: '#EEF2FF', borderRadius: 20, padding: '3px 10px',
                fontSize: 10.5, fontWeight: 700, color: '#4F46E5',
              }}>
                {consultations.length}
              </span>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: 10, padding: 3, gap: 2, border: '1px solid #E2E8F0' }}>
            {([['all', 'Semua'], ['pending', 'Pending'], ['resolved', 'Selesai']] as const).map(([id, label]) => (
              <button key={id} onClick={() => setFilter(id)} style={{
                flex: 1, padding: '6px 0', borderRadius: 8, border: 'none',
                background: filter === id ? '#fff' : 'transparent',
                color: filter === id ? '#1E293B' : '#64748B',
                fontSize: 12, fontWeight: filter === id ? 750 : 500,
                cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                boxShadow: filter === id ? '0 2px 6px rgba(15,23,42,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 16px' }}>
          {filtered.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 20px', gap: 10 }}>
              <span style={{ fontSize: 32 }}>🗒️</span>
              <p style={{ margin: 0, fontSize: 13, color: '#64748B', fontWeight: 500, textAlign: 'center' }}>Tidak ada keluhan di kategori ini.</p>
            </div>
          ) : (
            filtered.map(c => {
              const isSelected = c.id === activeId
              const patient = queue.find(p => p.patient_id === c.patient_id)
              const name = c.patient_name || patient?.full_name || 'Pasien'
              const isPending = c.status === 'open'
              const rc = getSafeRiskColor(patient?.risk_label)

              return (
                <div
                  key={c.id}
                  className={!isSelected ? 'keluhan-item' : ''}
                  onClick={() => setSelectedId(c.id)}
                  style={{
                    borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
                    marginBottom: 8,
                    background: isSelected ? '#EEF2FF' : '#FFFFFF',
                    border: `1px solid ${isSelected ? '#C7D2FE' : '#E5E7EB'}`,
                    boxShadow: isSelected ? '0 6px 16px rgba(79, 70, 229, 0.08)' : '0 1px 2px rgba(15,23,42,0.04)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <AvatarCircle name={name} size={36} bg={rc.sqBg} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Complaint title row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <p style={{
                          margin: 0, fontWeight: 750, fontSize: 13,
                          color: isSelected ? '#3B4CC0' : '#1E293B',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          fontFamily: 'Plus Jakarta Sans, sans-serif'
                        }}>{c.complaint_type}</p>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          background: isPending ? '#FFF7ED' : '#ECFDF5',
                          border: `1px solid ${isPending ? '#FED7AA' : '#A7F3D0'}`,
                          borderRadius: 999, padding: '2px 8px',
                          fontSize: 9.5, fontWeight: 700,
                          color: isPending ? '#C2410C' : '#059669',
                          flexShrink: 0,
                        }}>
                          {isPending ? 'Pending' : 'Selesai'}
                        </span>
                      </div>
                      {/* Patient info row */}
                      <p style={{ margin: 0, fontSize: 11.5, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                        <span style={{ fontWeight: 700, color: isSelected ? '#3B4CC0' : '#475569' }}>{name}</span>
                        {patient && ` · ${patient.age} thn · ${DISEASE_LABEL[patient.disease_type]}`}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
      {/* ── Right detail panel ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12, zIndex: 2 }}>
        {selectedConsultation ? (
          <>
            {/* Patient Header Card */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: '20px 22px',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              position: 'relative',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', minWidth: 0, zIndex: 2, flex: 1 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <AvatarCircle
                    name={formatDisplayName(selectedConsultation.patient_name || selectedPatient?.full_name)}
                    size={54}
                    bg="#10B981"
                  />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ margin: '0 0 6px', fontWeight: 800, fontSize: 22, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.4px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {formatDisplayName(selectedConsultation.patient_name || selectedPatient?.full_name)}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: 13, color: '#64748B', fontWeight: 550 }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#F8FAFC',
                      border: '1px solid #E5E7EB',
                      borderRadius: 20,
                      padding: '5px 10px',
                      fontSize: 12,
                      color: '#475569',
                      fontWeight: 600,
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {formatDisplayName(selectedPatient?.full_name || selectedConsultation.patient_name)}
                    </span>
                    {selectedPatient && (
                      <>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          background: '#F8FAFC',
                          border: '1px solid #E5E7EB',
                          borderRadius: 20,
                          padding: '5px 10px',
                          fontSize: 12,
                          color: '#475569',
                          fontWeight: 600,
                        }}>{`${selectedPatient.age} tahun`}</span>
                      </>
                    )}
                    {selectedPatient && (
                      <>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          background: '#F8FAFC',
                          border: '1px solid #E5E7EB',
                          borderRadius: 20,
                          padding: '5px 10px',
                          fontSize: 12,
                          color: '#475569',
                          fontWeight: 600,
                        }}>
                          {DISEASE_LABEL[selectedPatient.disease_type]}
                        </span>
                      </>
                    )}
                    {selectedPatient && (
                      <>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          background: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          borderRadius: 20,
                          padding: '5px 10px',
                          fontSize: 12,
                          color: '#047857',
                          fontWeight: 700,
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                          Aktif
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div style={{
                minWidth: 190,
                background: '#F8FAFC',
                border: '1px solid #E5E7EB',
                borderRadius: 14,
                padding: '12px 16px',
                textAlign: 'left',
                boxShadow: 'none',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 5 }}>ID Pasien</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '-0.2px' }}>{selectedConsultation.patient_id.substring(0, 12)}</div>
              </div>
            </div>

            <ReviewKeluhanCard
              consultation={selectedConsultation}
              onReview={onReviewConsultation}
            />

            <LogCard dailyLogs={dailyLogs} loading={logsLoading} />
          </>
        ) : (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12,
            padding: '80px 20px',
            fontFamily: 'Plus Jakarta Sans, sans-serif'
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: '#EEF2FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(91,107,240,0.08)',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5B6BF0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p style={{ margin: 0, fontSize: 14.5, fontWeight: 750, color: '#1E293B' }}>Pilih keluhan dari daftar</p>
            <p style={{ margin: 0, fontSize: 12.5, color: '#64748B', textAlign: 'center' }}>Silakan pilih salah satu keluhan pasien di kolom kiri untuk meninjau secara detail</p>
          </div>
        )}
      </div>
    </div>
  )
}
