import { useState, useMemo } from 'react'
import type { PatientQueueItem, ConsultationResult } from '../../../lib/types'
import {
  AvatarCircle,
  DISEASE_LABEL,
  RISK_COLOR,
} from './Common'
import ReviewKeluhanCard from './ReviewKeluhanCard'
import LogCard from './LogCard'

interface KeluhanViewProps {
  queue: PatientQueueItem[]
  consultations: ConsultationResult[]
  onReviewConsultation: (id: string, notes: string) => void
}

type KeluhanFilter = 'all' | 'pending' | 'resolved'

export default function KeluhanView({
  queue,
  consultations,
  onReviewConsultation,
}: KeluhanViewProps) {
  const [filter, setFilter] = useState<KeluhanFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Filter based on selected tab
  const filteredConsultations = useMemo(() => {
    return consultations.filter(c => {
      if (filter === 'pending') return c.status === 'open'
      if (filter === 'resolved') return c.status === 'replied'
      return true
    })
  }, [consultations, filter])

  // Automatically select the first consultation if none selected
  const activeSelectedId = selectedId || filteredConsultations[0]?.id || null
  const selectedConsultation = consultations.find(c => c.id === activeSelectedId) || null

  // Lookup the patient profile for the selected consultation
  const selectedPatient = useMemo(() => {
    if (!selectedConsultation) return null
    return queue.find(p => p.patient_id === selectedConsultation.patient_id) || null
  }, [selectedConsultation, queue])

  const selectedIdx = useMemo(() => {
    if (!selectedPatient) return -1
    return queue.findIndex(p => p.patient_id === selectedPatient.patient_id)
  }, [selectedPatient, queue])

  // Visual helper for category color
  const getCategoryColor = (category: string) => {
    if (category === 'Konsultasi Dokter') return '#0284c7'
    if (category === 'Laporkan Keluhan') return '#e11d48'
    return '#7c3aed' // Minta Review Hasil
  }

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Left panel: Complaints queue */}
      <div style={{
        width: 350, minWidth: 350, borderRight: '1px solid #E2E8F0',
        background: '#F8FAFC', display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* Header and filters */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #E2E8F0', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontWeight: 800, fontSize: 16, color: '#1A2066', letterSpacing: '-0.3px' }}>Daftar Keluhan Pasien</span>
            <span style={{
              background: 'linear-gradient(135deg, #262F8A 0%, #1A2066 100%)',
              borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#fff',
              boxShadow: '0 2px 6px rgba(26,32,102,0.15)'
            }}>
              {consultations.length} Total
            </span>
          </div>

          {/* Filters (Segmented Control) */}
          <div style={{
            display: 'flex',
            background: '#EFF1F5',
            borderRadius: 12,
            padding: 3,
            gap: 4,
            border: '1px solid #E2E8F0',
          }}>
            {['all', 'pending', 'resolved'].map(f => {
              const active = filter === f
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f as KeluhanFilter)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: 9,
                    border: '0',
                    borderStyle: 'none',
                    outline: 'none',
                    background: active ? '#fff' : 'transparent',
                    color: active ? '#262F8A' : '#64748B',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    boxShadow: active ? '0 2px 6px rgba(26,32,102,0.08), 0 1px 2px rgba(26,32,102,0.04)' : 'none',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onMouseEnter={e => {
                    if (!active) e.currentTarget.style.color = '#262F8A'
                  }}
                  onMouseLeave={e => {
                    if (!active) e.currentTarget.style.color = '#64748B'
                  }}
                >
                  {f === 'all' ? 'Semua' : f === 'pending' ? 'Belum Review' : 'Selesai'}
                </button>
              )
            })}
          </div>
        </div>

        {/* Complaints list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredConsultations.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 12, opacity: 0.7, padding: '40px 20px' }}>
              <span style={{ fontSize: 44 }}>🎉</span>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#64748B', textAlign: 'center' }}>
                Tidak ada keluhan di kategori ini.
              </p>
            </div>
          ) : (
            filteredConsultations.map(consult => {
              const isSelected = consult.id === activeSelectedId
              const patientForCard = queue.find(p => p.patient_id === consult.patient_id)
              const riskLabel = patientForCard?.risk_label || 'rendah'
              const cColors = RISK_COLOR[riskLabel]
              const isPending = consult.status === 'open'
              const fullName = consult.patient_name || patientForCard?.full_name || 'Pasien Sehatiku'
              const ageText = patientForCard ? `${patientForCard.age} thn` : '55 thn'
              const diseaseText = patientForCard ? DISEASE_LABEL[patientForCard.disease_type] : 'Diabetes T2'

              return (
                <div
                  key={consult.id}
                  onClick={() => setSelectedId(consult.id)}
                  style={{
                    background: '#fff',
                    borderRadius: 14,
                    padding: '14px 16px',
                    cursor: 'pointer',
                    borderLeft: `4px solid ${isPending ? '#F59E0B' : '#1EC8A5'}`,
                    borderRight: isSelected ? '1px solid rgba(38,47,138,0.12)' : '1px solid transparent',
                    borderTop: isSelected ? '1px solid rgba(38,47,138,0.12)' : '1px solid transparent',
                    borderBottom: isSelected ? '1px solid rgba(38,47,138,0.12)' : '1px solid transparent',
                    boxShadow: isSelected 
                      ? '0 10px 20px -8px rgba(38, 47, 138, 0.12), 0 4px 12px -4px rgba(38, 47, 138, 0.08)' 
                      : '0 2px 5px rgba(0, 0, 0, 0.02)',
                    transform: isSelected ? 'scale(1.01)' : 'none',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 16px -6px rgba(0,0,0,0.08), 0 4px 8px -4px rgba(0,0,0,0.04)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = 'none'
                      e.currentTarget.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.02)'
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1 }}>
                      <AvatarCircle name={fullName} size={36} bg={cColors.sqBg} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: '0 0 2px', fontWeight: 800, fontSize: 13.5, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {fullName}
                        </p>
                        <p style={{ margin: '0 0 8px', fontSize: 11, color: '#64748B', fontWeight: 500 }}>
                          {ageText} &middot; {diseaseText}
                        </p>
                        {/* Category Badge & Status */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            color: getCategoryColor(consult.complaint_type),
                          }}>
                            {consult.complaint_type}
                          </span>
                          {isPending ? (
                            <span style={{
                              background: '#FFFBEB', borderRadius: 6, padding: '2px 6px', fontSize: 9.5, fontWeight: 700, color: '#D97706',
                              display: 'inline-flex', alignItems: 'center', gap: 4, border: '1px solid #FDE68A'
                            }}>
                              <span className="anim-blink" style={{ width: 5, height: 5, borderRadius: '50%', background: '#F59E0B' }} />
                              Butuh Review
                            </span>
                          ) : (
                            <span style={{
                              background: '#F0FDF4', borderRadius: 6, padding: '2px 6px', fontSize: 9.5, fontWeight: 700, color: '#159E84',
                              display: 'inline-flex', alignItems: 'center', gap: 4, border: '1px solid #A7F3D0'
                            }}>
                              Selesai
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Right panel: Detail & Review Editor */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {selectedConsultation ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header info */}
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #F8FAFC 100%)',
              borderRadius: 20,
              padding: '20px 24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 20px -2px rgba(43,45,66,0.04), 0 2px 6px -1px rgba(43,45,66,0.02)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <AvatarCircle 
                  name={selectedConsultation.patient_name || selectedPatient?.full_name || 'Pasien Sehatiku'} 
                  size={46} 
                  bg={RISK_COLOR[selectedPatient?.risk_label || 'rendah'].sqBg} 
                />
                <div>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18, color: '#1A2066', letterSpacing: '-0.3px' }}>
                    {selectedConsultation.patient_name || selectedPatient?.full_name || 'Pasien Sehatiku'}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                      {selectedPatient ? `${selectedPatient.age} tahun` : '55 tahun'}
                    </span>
                    <span style={{ color: '#DCDFE8' }}>&middot;</span>
                    <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                      {selectedPatient ? DISEASE_LABEL[selectedPatient.disease_type] : 'DM + HT'}
                    </span>
                    {selectedPatient && (
                      <>
                        <span style={{ color: '#DCDFE8' }}>&middot;</span>
                        <span style={{
                          background: selectedPatient.risk_label === 'kritis' ? '#FEF2F2' : selectedPatient.risk_label === 'sedang' ? '#FFFBEB' : '#F0FDF4',
                          color: selectedPatient.risk_label === 'kritis' ? '#DC2626' : selectedPatient.risk_label === 'sedang' ? '#D97706' : '#059669',
                          padding: '2px 8px',
                          borderRadius: 20,
                          fontSize: 10,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}>
                          {selectedPatient.risk_label}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div style={{
                background: getCategoryColor(selectedConsultation.complaint_type),
                color: '#fff',
                fontSize: 11.5,
                fontWeight: 800,
                borderRadius: 30,
                padding: '6px 16px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                letterSpacing: '0.3px',
              }}>
                {selectedConsultation.complaint_type}
              </div>
            </div>

            {/* Review form */}
            <ReviewKeluhanCard
              consultation={selectedConsultation}
              onReview={onReviewConsultation}
            />

            {/* Contextual medical log */}
            {selectedIdx >= 0 && (
              <div style={{ opacity: 0.95 }}>
                <LogCard patientIdx={selectedIdx} />
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }}>
            <span style={{ fontSize: 54 }}>🩺</span>
            <p style={{ margin: 0, fontSize: 15, color: '#64748B', fontWeight: 600, textAlign: 'center' }}>
              Pilih keluhan pasien dari daftar di samping kiri untuk ditindaklanjuti.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
