import { useState } from 'react'
import type { PatientQueueItem, NakesPatientDetailData } from '../../../lib/types'
import { formatDate } from '../../../lib/utils'
import { AvatarCircle, StatusPill, getSafeRiskColor, DISEASE_LABEL } from './Common'

export interface PatientDataModalProps {
  patient: PatientQueueItem
  patientDetail: NakesPatientDetailData | null
  loading: boolean
  onClose: () => void
}

type TabType = 'profile' | 'baseline'

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '9px 0', borderBottom: '1px solid #F3F4F6', gap: 12 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#334155', fontWeight: 600, textAlign: 'right', wordBreak: 'break-word' }}>{value || '—'}</span>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #E5E7EB', borderRadius: 14, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.01)', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, borderBottom: '1px solid #F3F4F6', paddingBottom: 6 }}>
        <span style={{ width: 3, height: 12, borderRadius: 1.5, background: '#64748B' }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{title}</div>
      </div>
      {children}
    </div>
  )
}

export default function PatientDataModal({ patient, patientDetail, loading, onClose }: PatientDataModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('profile')

  const rc = getSafeRiskColor(patient.status === 'bahaya' ? 'kritis' : patient.status === 'waswas' ? 'sedang' : 'rendah')
  
  const detail = patientDetail?.patient_detail
  const baseline = patientDetail?.baseline

  // Mapper helpers for baseline codes
  const mapBmiCategory = (cat?: string) => {
    if (!cat) return '—'
    const map: Record<string, string> = {
      underweight: 'Sangat Kurus (Underweight)',
      normal: 'Normal',
      overweight: 'Kelebihan Berat Badan (Overweight)',
      obese: 'Obesitas (Obese)',
    }
    return map[cat] || cat
  }

  const mapSmokingStatus = (status?: string) => {
    if (!status) return '—'
    const map: Record<string, string> = {
      never: 'Tidak Pernah Merokok',
      former: 'Mantan Perokok',
      current: 'Perokok Aktif',
    }
    return map[status] || status
  }

  const mapPhysicalActivity = (activity?: string) => {
    if (!activity) return '—'
    const map: Record<string, string> = {
      sedentary: 'Sangat Jarang Beraktivitas (Sedentary)',
      light: 'Aktivitas Ringan',
      moderate: 'Aktivitas Sedang',
      active: 'Sangat Aktif',
    }
    return map[activity] || activity
  }

  const mapHypertensionStatus = (status?: string) => {
    if (!status) return '—'
    const map: Record<string, string> = {
      normal: 'Normal',
      elevated: 'Pre-hipertensi',
      stage1: 'Hipertensi Derajat 1',
      stage2: 'Hipertensi Derajat 2',
    }
    return map[status] || status
  }

  const mapDiabetesStatus = (status?: string) => {
    if (!status) return '—'
    const map: Record<string, string> = {
      none: 'Bukan Diabetes',
      prediabetes: 'Pre-diabetes',
      type2: 'Diabetes Melitus Tipe 2',
      controlled: 'Terkontrol',
      uncontrolled: 'Tidak Terkontrol',
    }
    return map[status] || status
  }

  const mapCvdRiskCategory = (cat?: string) => {
    if (!cat) return '—'
    const map: Record<string, string> = {
      low: 'Risiko Rendah',
      moderate: 'Risiko Sedang',
      high: 'Risiko Tinggi',
      very_high: 'Risiko Sangat Tinggi',
    }
    return map[cat] || cat
  }

  const getBmiBadgeColor = (cat?: string) => {
    if (cat === 'normal') return { bg: '#F1F5F9', color: '#334155', border: '1px solid #E2E8F0' }
    if (cat === 'overweight') return { bg: '#FFFBEB', color: '#D97706', border: '1px solid #FEF3C7' }
    return { bg: '#FEF2F2', color: '#EF4444', border: '1px solid #FEE2E2' }
  }

  const getCvdBadgeColor = (cat?: string) => {
    if (cat === 'low') return { bg: '#F1F5F9', color: '#334155', border: '1px solid #E2E8F0' }
    if (cat === 'moderate') return { bg: '#FFFBEB', color: '#D97706', border: '1px solid #FEF3C7' }
    return { bg: '#FEF2F2', color: '#EF4444', border: '1px solid #FEE2E2' }
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(23,28,58,0.62)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'backdropIn 0.18s ease',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 820,
          maxHeight: '90vh',
          background: '#F9FAFB',
          borderRadius: 20,
          boxShadow: '0 32px 80px rgba(15,23,42,0.28)',
          border: '1px solid rgba(255,255,255,0.7)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalIn 0.2s cubic-bezier(0.34,1.2,0.64,1)',
        }}
      >
        {/* Modal Header */}
        <div style={{ background: '#ffffff', borderBottom: '1px solid #E5E7EB', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 14.5, color: '#111827' }}>Data Pasien</span>
            {/* Tabs Selector */}
            <div style={{ display: 'flex', gap: 16, marginLeft: 16 }}>
              <button
                onClick={() => setActiveTab('profile')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: activeTab === 'profile' ? '#3B82F6' : '#64748B',
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '6px 4px',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'profile' ? '2px solid #3B82F6' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                Identitas & Kontak
              </button>
              <button
                onClick={() => setActiveTab('baseline')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: activeTab === 'baseline' ? '#3B82F6' : '#64748B',
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '6px 4px',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'baseline' ? '2px solid #3B82F6' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                Kondisi Baseline
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              border: '1px solid #E5E7EB',
              background: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9CA3AF',
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        {loading ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 60, color: '#9CA3AF' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', border: '3px solid #E5E7EB', borderTopColor: '#5B6BF0', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ margin: 0, fontSize: 13 }}>Memuat data pasien…</p>
          </div>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1, padding: '16px 18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            
            {/* Header Mini Dossier */}
            <div style={{ background: '#ffffff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(15,36,68,0.02)' }}>
              <AvatarCircle name={patient.full_name} size={48} bg={rc.sqBg} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 4px', fontWeight: 750, fontSize: 17, color: '#1E293B', lineHeight: 1.2 }}>{patient.full_name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{patient.age} tahun · Pasien Prolanis</span>
                  <span style={{ display: 'inline-flex', background: '#F1F5F9', color: '#475569', padding: '1px 6px', borderRadius: 4, fontSize: 10.5, fontWeight: 600 }}>
                    {DISEASE_LABEL[patient.disease_type]}
                  </span>
                  <StatusPill label={patient.status === 'bahaya' ? 'Bahaya' : patient.status === 'waswas' ? 'Waswas' : 'Aman'} risk={patient.status === 'bahaya' ? 'kritis' : patient.status === 'waswas' ? 'sedang' : 'rendah'} />
                </div>
              </div>
            </div>

            {activeTab === 'profile' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                
                <SectionCard title="Identitas Pribadi">
                  <Row label="Nama Lengkap" value={detail?.full_name || patient.full_name} />
                  <Row label="NIK" value={detail?.nik || '—'} />
                  <Row label="Tanggal Lahir" value={detail?.date_of_birth ? formatDate(detail.date_of_birth) : '—'} />
                  <Row label="Jenis Kelamin" value={detail?.sex === 'male' ? 'Laki-laki (L)' : detail?.sex === 'female' ? 'Perempuan (P)' : '—'} />
                  <Row label="Usia" value={detail?.age ? `${detail.age} tahun` : `${patient.age} tahun`} />
                  <Row label="Alamat Tinggal" value={detail?.alamat} />
                </SectionCard>

                <SectionCard title="Kontak & Penanggung Jawab">
                  <Row label="No. WA Pasien" value={detail?.phone_number ? (
                    <a
                      href={`https://wa.me/${detail.phone_number}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}
                    >
                      +{detail.phone_number} ↗
                    </a>
                  ) : '—'} />
                  <Row label="Nama Pendamping" value={detail?.companion_name} />
                  <Row label="No. WA Pendamping" value={detail?.companion_phone ? (
                    <a
                      href={`https://wa.me/${detail.companion_phone}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}
                    >
                      +{detail.companion_phone} ↗
                    </a>
                  ) : '—'} />
                  <Row label="Faskes Terdaftar" value="Puskesmas Mitra Sehat" />
                  <Row label="Nakes PJ Mandiri" value={detail?.assigned_nakes_name || '—'} />
                  <Row label="Username Portal" value={detail?.username} />
                </SectionCard>

              </div>
            ) : (
              <div>
                {!baseline ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', background: '#ffffff', borderRadius: 16, border: '1px dashed #D1D5DB', color: '#9CA3AF' }}>
                    <span style={{ fontSize: 28, display: 'block', marginBottom: 8 }}>📋</span>
                    <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600 }}>Data Baseline Klinis Belum Tersedia</p>
                    <p style={{ margin: '4px 0 0', fontSize: 12 }}>Kader atau admin Faskes belum menginput parameter klinis baseline untuk pasien ini.</p>
                  </div>
                ) : (
                  <div>
                    {/* Baseline top metadata */}
                    <div style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 12, padding: '10px 14px', marginBottom: 12, fontSize: 11.5, color: '#4B5563', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Dicatat oleh: <strong>{baseline.recorded_by_nakes_name || 'Sistem'}</strong></span>
                      <span>Tanggal Catat: <strong>{formatDate(baseline.recorded_at)}</strong></span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                      
                      <SectionCard title="Pengukuran Tubuh & Kebiasaan">
                        <Row label="Tinggi / Berat Badan" value={`${baseline.bmi ? Math.round(22 * 10) / 10 /* dummy calculate back weight if needed */ : '—'} cm / — kg`} />
                        <Row label="Indeks Massa Tubuh (IMT)" value={`${baseline.bmi} kg/m²`} />
                        <Row label="Kategori IMT" value={
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            ...getBmiBadgeColor(baseline.bmi_category)
                          }}>
                            {mapBmiCategory(baseline.bmi_category)}
                          </span>
                        } />
                        <Row label="Lingkar Perut" value={`${baseline.waist_circumference_cm} cm`} />
                        <Row label="Obesitas Sentral" value={baseline.central_obesity ? 'Ya (Beresiko)' : 'Tidak'} />
                        <Row label="Status Merokok" value={mapSmokingStatus(baseline.smoking_status)} />
                        <Row label="Konsumsi Alkohol" value={baseline.alcohol_use ? 'Ya' : 'Tidak'} />
                        <Row label="Aktivitas Fisik" value={mapPhysicalActivity(baseline.physical_activity)} />
                      </SectionCard>

                      <SectionCard title="Laboratorium & Kardiometabolik">
                        <Row label="Tekanan Darah" value={`${baseline.systolic_bp_mmhg}/${baseline.diastolic_bp_mmhg} mmHg`} />
                        <Row label="Kategori Hipertensi" value={mapHypertensionStatus(baseline.hypertension_status)} />
                        <Row label="Gula Darah Puasa" value={`${baseline.fasting_glucose_mgdl} mg/dL`} />
                        <Row label="Kadar HbA1c" value={`${baseline.hba1c_pct}%`} />
                        <Row label="Status Diabetes" value={mapDiabetesStatus(baseline.diabetes_status)} />
                        <Row label="eGFR (Fungsi Ginjal)" value={`${baseline.egfr} mL/min/1.73m²`} />
                        <Row label="UACR (Rasio Albumin)" value={`${baseline.uacr} mg/g`} />
                      </SectionCard>

                      <SectionCard title="Profil Lipid (Kolesterol)">
                        <Row label="Kolesterol Total" value={`${baseline.total_cholesterol_mgdl} mg/dL`} />
                        <Row label="HDL (Kolesterol Baik)" value={`${baseline.hdl_mgdl} mg/dL`} />
                        <Row label="LDL (Kolesterol Jahat)" value={`${baseline.ldl_mgdl} mg/dL`} />
                        <Row label="Trigliserida" value={`${baseline.triglycerides_mgdl} mg/dL`} />
                      </SectionCard>

                      <SectionCard title="Risiko CVD & Pengobatan">
                        <Row label="Skor Risiko CVD 10 Tahun" value={`${baseline.cvd_risk_10yr_pct}%`} />
                        <Row label="Kategori Risiko CVD" value={
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            ...getCvdBadgeColor(baseline.cvd_risk_category)
                          }}>
                            {mapCvdRiskCategory(baseline.cvd_risk_category)}
                          </span>
                        } />
                        <Row label="Riwayat Keluarga Diabetes" value={baseline.family_history_diabetes ? 'Ada' : 'Tidak Ada'} />
                        <Row label="Riwayat Keluarga Jantung" value={baseline.family_history_cvd ? 'Ada' : 'Tidak Ada'} />
                        <Row label="Konsumsi Antihipertensi" value={baseline.on_antihypertensive ? 'Ya' : 'Tidak'} />
                        <Row label="Konsumsi Antidiabetik" value={baseline.on_antidiabetic ? 'Ya' : 'Tidak'} />
                        <Row label="Konsumsi Statin (Kolesterol)" value={baseline.on_statin ? 'Ya' : 'Tidak'} />
                      </SectionCard>

                      <div style={{ gridColumn: 'span 2' }}>
                        <SectionCard title="Kluster Diagnosis & Target">
                          <Row label="ID Kluster Klinis" value={baseline.cluster_id ? `Kluster #${baseline.cluster_id}` : '—'} />
                          <Row label="Kluster Deskripsi" value={baseline.diagnosis_cluster} />
                          <Row label="Grup Klinis Utama" value={baseline.clinical_group} />
                          <Row label="Target Penurunan Risiko" value={
                            <div style={{ background: '#F9FAFB', border: '1px solid #ECEEF3', padding: '8px 12px', borderRadius: 8, marginTop: 4, fontWeight: 500, fontStyle: 'italic', fontSize: 12.5, color: '#374151', lineHeight: 1.4 }}>
                              "{baseline.target_risk || 'Belum ada target yang ditentukan.'}"
                            </div>
                          } />
                          {baseline.notes && (
                            <Row label="Catatan Tambahan Nakes" value={
                              <div style={{ fontSize: 12.5, color: '#4B5563', padding: '6px 0 0 0', lineHeight: 1.4 }}>
                                {baseline.notes}
                              </div>
                            } />
                          )}
                        </SectionCard>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
