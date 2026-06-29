import { useState, useMemo } from 'react'
import type { PatientQueueItem, ConsultationResult } from '../../../lib/types'
import { AvatarCircle, DISEASE_LABEL, RISK_COLOR } from './Common'
import ReviewKeluhanCard from './ReviewKeluhanCard'
import LogCard from './LogCard'

interface KeluhanViewProps {
  queue: PatientQueueItem[]
  consultations: ConsultationResult[]
  onReviewConsultation: (id: string, notes: string) => void
}

type KeluhanFilter = 'all' | 'pending' | 'resolved'

const CAT_COLOR: Record<string, string> = {
  'Konsultasi Dokter': '#0284c7',
  'Laporkan Keluhan': '#e11d48',
  'Minta Review Hasil': '#7c3aed',
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
  const selectedIdx = useMemo(() =>
    selectedPatient ? queue.findIndex(p => p.patient_id === selectedPatient.patient_id) : -1,
    [selectedPatient, queue])

  const pendingCount = consultations.filter(c => c.status === 'open').length

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: '#F4F5F7' }}>
      <style>{`
        .keluhan-item:hover { background: #F8F9FB !important; }
      `}</style>

      {/* ── Left inbox panel ── */}
      <div style={{
        width: 320, minWidth: 320, flexShrink: 0,
        background: '#fff',
        borderRight: '1px solid #EFEFEF',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Panel header */}
        <div style={{ padding: '18px 16px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#111827' }}>Keluhan Pasien</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {pendingCount > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: '#FFFBEB', border: '1px solid #FDE68A',
                  borderRadius: 20, padding: '2px 9px',
                  fontSize: 10.5, fontWeight: 700, color: '#D97706',
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#F59E0B' }} />
                  {pendingCount} pending
                </span>
              )}
              <span style={{
                background: '#F3F4F6', borderRadius: 20, padding: '2px 9px',
                fontSize: 10.5, fontWeight: 600, color: '#6B7280',
              }}>
                {consultations.length}
              </span>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 9, padding: 3, gap: 2 }}>
            {([['all', 'Semua'], ['pending', 'Pending'], ['resolved', 'Selesai']] as const).map(([id, label]) => (
              <button key={id} onClick={() => setFilter(id)} style={{
                flex: 1, padding: '5px 0', borderRadius: 7, border: 'none',
                background: filter === id ? '#fff' : 'transparent',
                color: filter === id ? '#111827' : '#9CA3AF',
                fontSize: 12, fontWeight: filter === id ? 700 : 500,
                cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                boxShadow: filter === id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 12px' }}>
          {filtered.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px', gap: 8 }}>
              <span style={{ fontSize: 28 }}>🎉</span>
              <p style={{ margin: 0, fontSize: 13, color: '#9CA3AF', textAlign: 'center' }}>Tidak ada keluhan di kategori ini.</p>
            </div>
          ) : (
            filtered.map(c => {
              const isSelected = c.id === activeId
              const patient = queue.find(p => p.patient_id === c.patient_id)
              const name = c.patient_name || patient?.full_name || 'Pasien'
              const isPending = c.status === 'open'
              const catColor = CAT_COLOR[c.complaint_type] || '#6B7280'

              return (
                <div
                  key={c.id}
                  className={!isSelected ? 'keluhan-item' : ''}
                  onClick={() => setSelectedId(c.id)}
                  style={{
                    borderRadius: 10, padding: '11px 12px', cursor: 'pointer',
                    marginBottom: 2,
                    background: isSelected ? '#F0F4FF' : '#fff',
                    border: `1px solid ${isSelected ? '#C7D2FE' : 'transparent'}`,
                    boxShadow: isSelected ? 'inset 3px 0 0 #5B6BF0' : 'none',
                    transition: 'all 0.12s',
                  }}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <AvatarCircle
                      name={name}
                      size={34}
                      bg={RISK_COLOR[patient?.risk_label || 'rendah'].sqBg}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Complaint title row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                        <p style={{
                          margin: 0, fontWeight: 700, fontSize: 12.5,
                          color: isSelected ? '#3B4CC0' : '#111827',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{c.complaint_type}</p>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          background: isPending ? '#FFFBEB' : '#F0FDF9',
                          border: `1px solid ${isPending ? '#FDE68A' : '#D1FAE5'}`,
                          borderRadius: 5, padding: '1px 7px',
                          fontSize: 9.5, fontWeight: 700,
                          color: isPending ? '#D97706' : '#059669',
                          flexShrink: 0, marginLeft: 6,
                        }}>
                          {isPending && <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#F59E0B' }} />}
                          {isPending ? 'Pending' : 'Selesai'}
                        </span>
                      </div>
                      {/* Patient info row */}
                      <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 600, color: '#6B7280' }}>{name}</span>
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
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {selectedConsultation ? (
          <>
            {/* Patient header */}
            <div style={{
              background: '#fff',
              borderRadius: 16,
              padding: '16px 24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', minWidth: 0 }}>
                <AvatarCircle
                  name={selectedConsultation.patient_name || selectedPatient?.full_name || 'Pasien'}
                  size={46}
                  bg={RISK_COLOR[selectedPatient?.risk_label || 'rendah'].sqBg}
                />
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: 16, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.3px' }}>
                    {selectedConsultation.patient_name || selectedPatient?.full_name || 'Pasien'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px 8px', fontSize: 12, color: '#64748B', fontWeight: 500 }}>
                    <span>{selectedPatient ? `${selectedPatient.age} tahun` : '—'}</span>
                    {selectedPatient && <span>·</span>}
                    {selectedPatient && <span style={{ fontWeight: 600, color: '#475569' }}>{DISEASE_LABEL[selectedPatient.disease_type]}</span>}
                    {selectedPatient && <span>·</span>}
                    {selectedPatient && (
                      <span style={{
                        fontWeight: 800,
                        fontSize: 10,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: selectedPatient.risk_label === 'kritis' ? '#FEF2F2'
                          : selectedPatient.risk_label === 'sedang' ? '#FFFBEB' : '#F0FDF4',
                        color: selectedPatient.risk_label === 'kritis' ? '#EF4444'
                          : selectedPatient.risk_label === 'sedang' ? '#D97706' : '#10B981',
                        border: `1px solid ${selectedPatient.risk_label === 'kritis' ? '#FCA5A5'
                          : selectedPatient.risk_label === 'sedang' ? '#FCD34D' : '#86EFAC'}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                        <span style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: selectedPatient.risk_label === 'kritis' ? '#EF4444'
                            : selectedPatient.risk_label === 'sedang' ? '#D97706' : '#10B981'
                        }} />
                        {selectedPatient.risk_label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div style={{
                background: CAT_COLOR[selectedConsultation.complaint_type] ? (CAT_COLOR[selectedConsultation.complaint_type] + '12') : '#F3F4F6',
                border: `1px solid ${CAT_COLOR[selectedConsultation.complaint_type] ? (CAT_COLOR[selectedConsultation.complaint_type] + '30') : '#E2E8F0'}`,
                color: CAT_COLOR[selectedConsultation.complaint_type] || '#475569',
                borderRadius: 8, padding: '6px 14px',
                fontSize: 11.5, fontWeight: 700, flexShrink: 0,
                letterSpacing: '0.1px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.01)',
              }}>
                {selectedConsultation.complaint_type}
              </div>
            </div>

            <ReviewKeluhanCard
              consultation={selectedConsultation}
              onReview={onReviewConsultation}
            />

            {selectedIdx >= 0 && <LogCard patientIdx={selectedIdx} />}
          </>
        ) : (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '80px 20px',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: '#F3F4F6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#6B7280' }}>Pilih keluhan dari daftar</p>
            <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>Klik salah satu item di panel kiri</p>
          </div>
        )}
      </div>
    </div>
  )
}
