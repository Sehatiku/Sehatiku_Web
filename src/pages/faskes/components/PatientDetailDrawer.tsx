import { useState, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { faskesApi } from '../../../lib/api'
import type { FaskesPatientDetail, PatientBaselineDetail, BaselineHistoryItem, NakesItem, PatientBaselineBody } from '../../../lib/types'
import { initials, formatDate } from '../../../lib/utils'

interface Props {
  detail: FaskesPatientDetail | null
  loading: boolean
  onClose: () => void
}

const DISEASE_LABEL: Record<string, string> = {
  diabetes_t2: 'Diabetes',
  hypertension: 'Hipertensi',
  both: 'DM + Hipertensi',
}

const DISEASE_COLOR: Record<string, { bg: string; color: string }> = {
  diabetes_t2: { bg: '#EEEFFE', color: '#5B6BF0' },
  hypertension: { bg: 'rgba(79,195,247,0.12)', color: '#0277BD' },
  both: { bg: 'rgba(245,158,11,0.1)', color: '#D97706' },
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '9px 0', borderBottom: '1px solid #F4F5F7', gap: 12 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#8A93A1', textTransform: 'uppercase', letterSpacing: '0.4px', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#2B2D42', fontWeight: 500, textAlign: 'right', wordBreak: 'break-word' }}>{value || '—'}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: '#636B78', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>{title}</div>
      {children}
    </div>
  )
}

export default function PatientDetailDrawer({ detail, loading, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'profile' | 'baseline' | 'form'>('profile')

  // Baseline states
  const [latestBaseline, setLatestBaseline] = useState<PatientBaselineDetail | null>(null)
  const [history, setHistory] = useState<BaselineHistoryItem[]>([])
  const [loadingBaseline, setLoadingBaseline] = useState(false)
  const [nakesList, setNakesList] = useState<NakesItem[]>([])
  
  // Form states
  const [recordedNakesId, setRecordedNakesId] = useState('')
  const [notes, setNotes] = useState('')
  const [formData, setFormData] = useState<PatientBaselineBody | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Load baseline details when tab switches to 'baseline'
  useEffect(() => {
    if (!detail || activeTab === 'profile') return

    const loadBaselineData = async () => {
      setLoadingBaseline(true)
      try {
        const [latestRes, historyRes, nakesRes] = await Promise.all([
          faskesApi.getPatientBaseline(detail.patient_id).catch(() => null),
          faskesApi.getPatientBaselineHistory(detail.patient_id).catch(() => ({ data: [] })),
          faskesApi.getNakes().catch(() => [])
        ])
        
        setLatestBaseline(latestRes)
        setHistory(historyRes.data)
        setNakesList(nakesRes.filter(n => n.status === 'active' && n.role === 'dokter'))
        
        const defaultBaseline: PatientBaselineBody = {
          age_years: detail.age,
          sex: detail.sex,
          bmi: 22.0,
          bmi_category: 'normal',
          waist_circumference_cm: 80,
          central_obesity: false,
          smoking_status: 'never',
          alcohol_use: false,
          physical_activity: 'moderate',
          family_history_diabetes: false,
          family_history_cvd: false,
          systolic_bp_mmhg: 120,
          diastolic_bp_mmhg: 80,
          hypertension_status: 'normal',
          fasting_glucose_mgdl: 90,
          hba1c_pct: 5.5,
          diabetes_status: 'none',
          total_cholesterol_mgdl: 180,
          hdl_mgdl: 50,
          ldl_mgdl: 110,
          triglycerides_mgdl: 140,
          cvd_risk_10yr_pct: 3.5,
          cvd_risk_category: 'low',
          on_antihypertensive: false,
          on_antidiabetic: false,
          on_statin: false,
          target_risk: 'Menjaga pola hidup sehat',
          egfr: 90,
          uacr: 10,
          cluster_id: null,
          diagnosis_cluster: null,
          clinical_group: null
        }

        if (latestRes) {
          // Pre-fill form fields
          const { id, patient_id, recorded_at, recorded_by_nakes_id, recorded_by_nakes_name: _unused, notes, ...rest } = latestRes
          setFormData({ ...defaultBaseline, ...rest })
        } else {
          // Set clean default form
          setFormData(defaultBaseline)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingBaseline(false)
      }
    }

    loadBaselineData()
  }, [detail, activeTab])

  const handleInputChange = (key: keyof PatientBaselineBody, val: any) => {
    if (!formData) return
    setFormData(prev => prev ? ({ ...prev, [key]: val }) : null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!detail || !formData) return
    if (!recordedNakesId) {
      setFormError('Pilih nakes pencatat terlebih dahulu')
      return
    }

    setSubmitting(true)
    setFormError(null)
    try {
      await faskesApi.createPatientBaseline(detail.patient_id, {
        recorded_by_nakes_id: recordedNakesId,
        notes: notes.trim() || undefined,
        baseline: formData
      })
      // Reset form
      setNotes('')
      // Switch back
      setActiveTab('baseline')
    } catch {
      setFormError('Gagal mencatat baseline baru. Periksa kembali input Anda.')
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(43,45,66,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)', animation: 'fadeIn 0.2s ease-out' }}
      onClick={e => { if (e.target === e.currentTarget && !submitting) onClose() }}
    >
      <div style={{ width: activeTab === 'profile' ? 560 : 880, maxWidth: '92vw', maxHeight: '90vh', background: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(15,36,68,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'width 0.2s ease-in-out' }}>

        {/* Header */}
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #DCDFE8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#2B2D42' }}>Detail Pasien</div>
            <div style={{ display: 'flex', background: '#F4F5F7', borderRadius: 8, padding: 3, gap: 2 }}>
              <button
                onClick={() => setActiveTab('profile')}
                disabled={submitting}
                style={{ border: 'none', background: activeTab === 'profile' ? '#fff' : 'transparent', color: activeTab === 'profile' ? '#1E2330' : '#8A93A1', fontSize: 11.5, fontWeight: 700, padding: '5px 12px', borderRadius: 6, cursor: 'pointer', boxShadow: activeTab === 'profile' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.15s' }}
              >
                Profil Umum
              </button>
              <button
                onClick={() => setActiveTab('baseline')}
                disabled={submitting}
                style={{ border: 'none', background: activeTab !== 'profile' ? '#fff' : 'transparent', color: activeTab !== 'profile' ? '#1E2330' : '#8A93A1', fontSize: 11.5, fontWeight: 700, padding: '5px 12px', borderRadius: 6, cursor: 'pointer', boxShadow: activeTab !== 'profile' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.15s' }}
              >
                Baseline & Kontrol
              </button>
            </div>
          </div>
          <button onClick={onClose} disabled={submitting} style={{ width: 30, height: 30, borderRadius: 8, background: '#F4F5F7', border: '1px solid #DCDFE8', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#636B78', fontSize: 16 }}>×</button>
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px', background: activeTab === 'profile' ? '#fff' : '#F7F8FA' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#8A93A1', fontSize: 13 }}>Memuat detail...</div>
          )}

          {!loading && detail && (() => {
            const dc = DISEASE_COLOR[detail.disease_type] ?? DISEASE_COLOR.diabetes_t2
            const isActive = detail.status === 'active'

            if (activeTab === 'profile') {
              return (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, padding: '16px', background: '#F7F8FA', borderRadius: 12, border: '1px solid #DCDFE8' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: dc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: dc.color, flexShrink: 0 }}>
                      {initials(detail.full_name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#2B2D42' }}>{detail.full_name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 5, flexWrap: 'wrap' }}>
                        <span style={{ ...dc, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{DISEASE_LABEL[detail.disease_type]}</span>
                        <span style={{ background: isActive ? 'rgba(16,185,129,0.1)' : '#F4F5F7', color: isActive ? '#10B981' : '#8A93A1', border: `1px solid ${isActive ? 'rgba(16,185,129,0.2)' : '#DCDFE8'}`, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                          {isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Section title="Data Identitas">
                    <Row label="NIK" value={detail.nik} />
                    <Row label="Tanggal Lahir" value={detail.date_of_birth || '—'} />
                    <Row label="Usia" value={`${detail.age} tahun`} />
                    <Row label="Jenis Kelamin" value={detail.sex === 'male' ? '♂ Laki-laki' : '♀ Perempuan'} />
                    <Row label="Alamat" value={detail.alamat} />
                  </Section>

                  <Section title="Kontak">
                    <Row label="No. WA Pasien" value={detail.phone_number} />
                    <Row label="Nama Pendamping" value={detail.companion_name} />
                    <Row label="No. WA Pendamping" value={detail.companion_phone} />
                  </Section>

                  <Section title="Klinis">
                    <Row label="Jenis Penyakit" value={DISEASE_LABEL[detail.disease_type]} />
                    <Row label="Nakes PJ" value={detail.assigned_nakes_name || '—'} />
                  </Section>

                  <Section title="Akun & Status">
                    <Row label="Username" value={detail.username} />
                    <Row label="Status" value={isActive ? 'Aktif' : 'Nonaktif'} />
                    <Row label="Terdaftar" value={formatDate(detail.enrolled_at)} />
                    <Row label="Diperbarui" value={formatDate(detail.updated_at)} />
                  </Section>
                </>
              )
            }

            if (activeTab === 'baseline') {
              if (loadingBaseline) {
                return <div style={{ textAlign: 'center', padding: '60px 0', color: '#8A93A1' }}>Memuat data baseline...</div>
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {/* Latest Baseline Card */}
                  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #DCDFE8', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#2B2D42' }}>Baseline Klinis Terbaru</div>
                        {latestBaseline && (
                          <div style={{ fontSize: 11, color: '#8A93A1', marginTop: 2 }}>
                            Dicatat pada {formatDate(latestBaseline.recorded_at)} oleh {latestBaseline.recorded_by_nakes_name || 'Sistem'}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setActiveTab('form')}
                        style={{ background: '#5B6BF0', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                      >
                        + Catat Kontrol Baru
                      </button>
                    </div>

                    {!latestBaseline ? (
                      <div style={{ textAlign: 'center', padding: '30px 10px', background: '#F7F8FA', borderRadius: 10, border: '1px dashed #DCDFE8', color: '#8A93A1', fontSize: 12.5 }}>
                        Belum ada baseline klinis tercatat untuk pasien ini.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                        <div style={{ background: '#F7F8FA', padding: 12, borderRadius: 10, border: '1px solid #EAECEF' }}>
                          <span style={{ display: 'block', fontSize: 9.5, fontWeight: 700, color: '#8A93A1', textTransform: 'uppercase', marginBottom: 3 }}>Tekanan Darah</span>
                          <span style={{ fontSize: 16, fontWeight: 800, color: '#2B2D42', fontFamily: 'IBM Plex Mono, monospace' }}>{latestBaseline.systolic_bp_mmhg}/{latestBaseline.diastolic_bp_mmhg}</span>
                          <span style={{ display: 'block', fontSize: 10.5, color: '#636B78', marginTop: 3 }}>Tensi: {latestBaseline.hypertension_status}</span>
                        </div>
                        <div style={{ background: '#F7F8FA', padding: 12, borderRadius: 10, border: '1px solid #EAECEF' }}>
                          <span style={{ display: 'block', fontSize: 9.5, fontWeight: 700, color: '#8A93A1', textTransform: 'uppercase', marginBottom: 3 }}>Gula &amp; HbA1c</span>
                          <span style={{ fontSize: 16, fontWeight: 800, color: '#2B2D42', fontFamily: 'IBM Plex Mono, monospace' }}>{latestBaseline.fasting_glucose_mgdl} mg/dL</span>
                          <span style={{ display: 'block', fontSize: 10.5, color: '#636B78', marginTop: 3 }}>HbA1c: {latestBaseline.hba1c_pct}% ({latestBaseline.diabetes_status})</span>
                        </div>
                        <div style={{ background: '#F7F8FA', padding: 12, borderRadius: 10, border: '1px solid #EAECEF' }}>
                          <span style={{ display: 'block', fontSize: 9.5, fontWeight: 700, color: '#8A93A1', textTransform: 'uppercase', marginBottom: 3 }}>Kolesterol Total</span>
                          <span style={{ fontSize: 16, fontWeight: 800, color: '#2B2D42', fontFamily: 'IBM Plex Mono, monospace' }}>{latestBaseline.total_cholesterol_mgdl} mg/dL</span>
                          <span style={{ display: 'block', fontSize: 10.5, color: '#636B78', marginTop: 3 }}>HDL: {latestBaseline.hdl_mgdl} | LDL: {latestBaseline.ldl_mgdl}</span>
                        </div>
                        <div style={{ background: '#F7F8FA', padding: 12, borderRadius: 10, border: '1px solid #EAECEF' }}>
                          <span style={{ display: 'block', fontSize: 9.5, fontWeight: 700, color: '#8A93A1', textTransform: 'uppercase', marginBottom: 3 }}>Risiko CVD 10 Thn</span>
                          <span style={{ fontSize: 16, fontWeight: 800, color: latestBaseline.cvd_risk_category === 'high' || latestBaseline.cvd_risk_category === 'very_high' ? '#EF4444' : '#10B981', fontFamily: 'IBM Plex Mono, monospace' }}>{latestBaseline.cvd_risk_10yr_pct}%</span>
                          <span style={{ display: 'block', fontSize: 10.5, color: '#636B78', marginTop: 3 }}>Kategori: {(latestBaseline.cvd_risk_category || '').toUpperCase()}</span>
                        </div>

                        <div style={{ gridColumn: 'span 4', height: 1, background: '#EAECEF', margin: '4px 0' }} />

                        <div style={{ gridColumn: 'span 2' }}>
                          <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#8A93A1', textTransform: 'uppercase', marginBottom: 4 }}>Informasi Fisik &amp; Lab Ginjal</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#2B2D42' }}>
                            <div>BMI: <strong>{latestBaseline.bmi}</strong> ({latestBaseline.bmi_category})</div>
                            <div>Lingkar Pinggang: <strong>{latestBaseline.waist_circumference_cm} cm</strong> {latestBaseline.central_obesity && ' (Obesitas Sentral)'}</div>
                            <div>eGFR: <strong>{latestBaseline.egfr} mL/min</strong> | UACR: <strong>{latestBaseline.uacr} mg/g</strong></div>
                          </div>
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                          <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#8A93A1', textTransform: 'uppercase', marginBottom: 4 }}>Gaya Hidup &amp; Terapi Aktif</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#2B2D42' }}>
                            <div>Merokok: <strong>{latestBaseline.smoking_status}</strong> | Alkohol: <strong>{latestBaseline.alcohol_use ? 'Ya' : 'Tidak'}</strong> | Aktivitas: <strong>{latestBaseline.physical_activity}</strong></div>
                            <div>Terapi: {latestBaseline.on_antihypertensive && 'Anti-HT · '}{latestBaseline.on_antidiabetic && 'Anti-DM · '}{latestBaseline.on_statin && 'Statin'}{!latestBaseline.on_antihypertensive && !latestBaseline.on_antidiabetic && !latestBaseline.on_statin && 'Tidak ada obat'}</div>
                            <div>Target Risk: <strong>{latestBaseline.target_risk}</strong></div>
                          </div>
                        </div>

                        {latestBaseline.cluster_id != null && (
                          <div style={{ gridColumn: 'span 4', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#14532D', display: 'flex', justifyContent: 'space-between' }}>
                            <div>Klasifikasi ML: <strong>{latestBaseline.diagnosis_cluster} ({latestBaseline.clinical_group})</strong></div>
                            <div>Cluster ID: <strong>{latestBaseline.cluster_id}</strong></div>
                          </div>
                        )}
                        
                        {latestBaseline.notes && (
                          <div style={{ gridColumn: 'span 4', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#78350F' }}>
                            Catatan: <em>{latestBaseline.notes}</em>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* History Logs */}
                  <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #DCDFE8', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#2B2D42', marginBottom: 14 }}>Riwayat Kontrol (Kemajuan)</div>
                    {history.length === 0 ? (
                      <div style={{ color: '#8A93A1', fontSize: 12.5, textAlign: 'center', padding: '16px 0' }}>Tidak ada riwayat baseline sebelumnya.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {history.map((h, i) => (
                          <div key={h.id || i} style={{ borderLeft: '3px solid #5B6BF0', paddingLeft: 14, paddingTop: 4, paddingBottom: 4 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#2B2D42' }}>Kontrol {formatDate(h.recorded_at)}</span>
                              <span style={{ fontSize: 11, color: '#8A93A1' }}>Oleh: {h.recorded_by_nakes_name || '—'}</span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 11.5, color: '#636B78', marginTop: 4, fontFamily: 'IBM Plex Mono, monospace' }}>
                              <span>TD: {h.systolic_bp_mmhg}/{h.diastolic_bp_mmhg}</span>
                              <span>GDP: {h.fasting_glucose_mgdl} mg/dL</span>
                              <span>HbA1c: {h.hba1c_pct}%</span>
                              <span>Kolesterol: {h.total_cholesterol_mgdl} mg/dL</span>
                              <span>eGFR: {h.egfr}</span>
                              <span>CVD: {h.cvd_risk_10yr_pct}%</span>
                            </div>
                            {h.notes && <div style={{ fontSize: 11, color: '#8A93A1', fontStyle: 'italic', marginTop: 4 }}>Catatan: {h.notes}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            }

            if (activeTab === 'form' && formData) {
              return (
                <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 14, border: '1px solid #DCDFE8', padding: 22, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#2B2D42', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Catat Kontrol Baseline Baru</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('baseline')}
                      disabled={submitting}
                      style={{ background: '#F4F5F7', border: '1px solid #DCDFE8', borderRadius: 8, padding: '5px 12px', fontSize: 11.5, fontWeight: 600, color: '#636B78', cursor: submitting ? 'not-allowed' : 'pointer' }}
                    >
                      Batal
                    </button>
                  </div>

                  {formError && (
                    <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12.5, color: '#DC2626', fontWeight: 600 }}>
                      ⚠️ {formError}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
                    {/* Nakes & Notes */}
                    <div style={{ gridColumn: 'span 3', borderBottom: '1px solid #EAECEF', paddingBottom: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#2B2D42', marginBottom: 8 }}>Informasi Pencatatan</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>Dokter Pemeriksa *</label>
                          <select
                            value={recordedNakesId}
                            onChange={e => setRecordedNakesId(e.target.value)}
                            required
                            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #DCDFE8', borderRadius: 8, fontSize: 13, background: '#F7F8FA', outline: 'none' }}
                          >
                            <option value="">Pilih Dokter</option>
                            {nakesList.map(n => (
                              <option key={n.nakes_id} value={n.nakes_id}>{n.full_name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>Catatan / Diagnosis Tambahan</label>
                          <input
                            type="text"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Tuliskan catatan kontrol klinis (mis. Dosis metformin dinaikkan)"
                            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #DCDFE8', borderRadius: 8, fontSize: 13, background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 1: Antropometri */}
                    <div style={{ gridColumn: 'span 3', fontWeight: 700, fontSize: 12.5, color: '#5B6BF0', marginTop: 6, borderBottom: '1px dashed #EAECEF', paddingBottom: 4 }}>
                      1. Antropometri &amp; Kebiasaan
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>BMI (kg/m²)</label>
                      <input
                        type="number" step="0.1" required
                        value={formData.bmi}
                        onChange={e => handleInputChange('bmi', parseFloat(e.target.value) || 0)}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #DCDFE8', borderRadius: 8, fontSize: 13, background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>Kategori BMI</label>
                      <select
                        value={formData.bmi_category}
                        onChange={e => handleInputChange('bmi_category', e.target.value)}
                        required
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #DCDFE8', borderRadius: 8, fontSize: 13, background: '#F7F8FA', outline: 'none' }}
                      >
                        <option value="underweight">Berat Kurang (Underweight)</option>
                        <option value="normal">Normal</option>
                        <option value="overweight">Berat Lebih (Overweight)</option>
                        <option value="obese">Obesitas (Obese)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>Lingkar Pinggang (cm)</label>
                      <input
                        type="number" required
                        value={formData.waist_circumference_cm}
                        onChange={e => handleInputChange('waist_circumference_cm', parseInt(e.target.value) || 0)}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #DCDFE8', borderRadius: 8, fontSize: 13, background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>Status Merokok</label>
                      <select
                        value={formData.smoking_status}
                        onChange={e => handleInputChange('smoking_status', e.target.value)}
                        required
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #DCDFE8', borderRadius: 8, fontSize: 13, background: '#F7F8FA', outline: 'none' }}
                      >
                        <option value="never">Tidak pernah</option>
                        <option value="former">Mantan perokok</option>
                        <option value="current">Perokok aktif</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>Aktivitas Fisik</label>
                      <select
                        value={formData.physical_activity}
                        onChange={e => handleInputChange('physical_activity', e.target.value)}
                        required
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #DCDFE8', borderRadius: 8, fontSize: 13, background: '#F7F8FA', outline: 'none' }}
                      >
                        <option value="sedentary">Kurang gerak (Sedentary)</option>
                        <option value="light">Ringan (Light)</option>
                        <option value="moderate">Sedang (Moderate)</option>
                        <option value="active">Aktif / Berat (Active)</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#2B2D42', fontWeight: 600, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.central_obesity}
                          onChange={e => handleInputChange('central_obesity', e.target.checked)}
                        />
                        Obesitas Sentral
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#2B2D42', fontWeight: 600, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.alcohol_use}
                          onChange={e => handleInputChange('alcohol_use', e.target.checked)}
                        />
                        Konsumsi Alkohol
                      </label>
                    </div>

                    {/* Section 2: Kardiovaskular */}
                    <div style={{ gridColumn: 'span 3', fontWeight: 700, fontSize: 12.5, color: '#0277BD', marginTop: 10, borderBottom: '1px dashed #EAECEF', paddingBottom: 4 }}>
                      2. Tekanan Darah &amp; Ginjal
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>Sistolik (mmHg)</label>
                      <input
                        type="number" required
                        value={formData.systolic_bp_mmhg}
                        onChange={e => handleInputChange('systolic_bp_mmhg', parseInt(e.target.value) || 0)}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #DCDFE8', borderRadius: 8, fontSize: 13, background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>Diastolik (mmHg)</label>
                      <input
                        type="number" required
                        value={formData.diastolic_bp_mmhg}
                        onChange={e => handleInputChange('diastolic_bp_mmhg', parseInt(e.target.value) || 0)}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #DCDFE8', borderRadius: 8, fontSize: 13, background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>Status Hipertensi</label>
                      <select
                        value={formData.hypertension_status}
                        onChange={e => handleInputChange('hypertension_status', e.target.value)}
                        required
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #DCDFE8', borderRadius: 8, fontSize: 13, background: '#F7F8FA', outline: 'none' }}
                      >
                        <option value="normal">Normal</option>
                        <option value="elevated">Pre-hipertensi</option>
                        <option value="stage1">Hipertensi Derajat 1</option>
                        <option value="stage2">Hipertensi Derajat 2</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>eGFR (mL/min/1.73m²)</label>
                      <input
                        type="number" step="0.1" required
                        value={formData.egfr}
                        onChange={e => handleInputChange('egfr', parseFloat(e.target.value) || 0)}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #DCDFE8', borderRadius: 8, fontSize: 13, background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>UACR (mg/g)</label>
                      <input
                        type="number" step="0.1" required
                        value={formData.uacr}
                        onChange={e => handleInputChange('uacr', parseFloat(e.target.value) || 0)}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #DCDFE8', borderRadius: 8, fontSize: 13, background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#2B2D42', fontWeight: 600, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.on_antihypertensive}
                          onChange={e => handleInputChange('on_antihypertensive', e.target.checked)}
                        />
                        Terapi Anti-Hipertensi
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#2B2D42', fontWeight: 600, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.family_history_cvd}
                          onChange={e => handleInputChange('family_history_cvd', e.target.checked)}
                        />
                        Riwayat CVD Keluarga
                      </label>
                    </div>

                    {/* Section 3: Gula & Kolesterol */}
                    <div style={{ gridColumn: 'span 3', fontWeight: 700, fontSize: 12.5, color: '#D97706', marginTop: 10, borderBottom: '1px dashed #EAECEF', paddingBottom: 4 }}>
                      3. Diabetes &amp; Metabolik
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>Gula Puasa (mg/dL)</label>
                      <input
                        type="number" required
                        value={formData.fasting_glucose_mgdl}
                        onChange={e => handleInputChange('fasting_glucose_mgdl', parseInt(e.target.value) || 0)}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #DCDFE8', borderRadius: 8, fontSize: 13, background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>HbA1c (%)</label>
                      <input
                        type="number" step="0.1" required
                        value={formData.hba1c_pct}
                        onChange={e => handleInputChange('hba1c_pct', parseFloat(e.target.value) || 0)}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #DCDFE8', borderRadius: 8, fontSize: 13, background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>Status Diabetes</label>
                      <select
                        value={formData.diabetes_status}
                        onChange={e => handleInputChange('diabetes_status', e.target.value)}
                        required
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #DCDFE8', borderRadius: 8, fontSize: 13, background: '#F7F8FA', outline: 'none' }}
                      >
                        <option value="none">Tidak ada</option>
                        <option value="prediabetes">Pre-diabetes</option>
                        <option value="type2">Diabetes Tipe 2</option>
                        <option value="controlled">Diabetes Terkontrol</option>
                        <option value="uncontrolled">Diabetes Tidak Terkontrol</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>Kolesterol Total (mg/dL)</label>
                      <input
                        type="number" required
                        value={formData.total_cholesterol_mgdl}
                        onChange={e => handleInputChange('total_cholesterol_mgdl', parseInt(e.target.value) || 0)}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #DCDFE8', borderRadius: 8, fontSize: 13, background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>Kolesterol HDL (mg/dL)</label>
                      <input
                        type="number" required
                        value={formData.hdl_mgdl}
                        onChange={e => handleInputChange('hdl_mgdl', parseInt(e.target.value) || 0)}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #DCDFE8', borderRadius: 8, fontSize: 13, background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>Kolesterol LDL (mg/dL)</label>
                      <input
                        type="number" required
                        value={formData.ldl_mgdl}
                        onChange={e => handleInputChange('ldl_mgdl', parseInt(e.target.value) || 0)}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #DCDFE8', borderRadius: 8, fontSize: 13, background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>Trigliserida (mg/dL)</label>
                      <input
                        type="number" required
                        value={formData.triglycerides_mgdl}
                        onChange={e => handleInputChange('triglycerides_mgdl', parseInt(e.target.value) || 0)}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #DCDFE8', borderRadius: 8, fontSize: 13, background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#2B2D42', fontWeight: 600, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.on_antidiabetic}
                          onChange={e => handleInputChange('on_antidiabetic', e.target.checked)}
                        />
                        Terapi OAD / Insulin
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#2B2D42', fontWeight: 600, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.on_statin}
                          onChange={e => handleInputChange('on_statin', e.target.checked)}
                        />
                        Terapi Obat Statin
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#2B2D42', fontWeight: 600, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.family_history_diabetes}
                          onChange={e => handleInputChange('family_history_diabetes', e.target.checked)}
                        />
                        Riwayat DM Keluarga
                      </label>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>Risiko Kardiovaskular (%)</label>
                      <input
                        type="number" step="0.1" required
                        value={formData.cvd_risk_10yr_pct}
                        onChange={e => handleInputChange('cvd_risk_10yr_pct', parseFloat(e.target.value) || 0)}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #DCDFE8', borderRadius: 8, fontSize: 13, background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>

                    {/* Section 4: Target & Klasifikasi */}
                    <div style={{ gridColumn: 'span 3', fontWeight: 700, fontSize: 12.5, color: '#10B981', marginTop: 10, borderBottom: '1px dashed #EAECEF', paddingBottom: 4 }}>
                      4. Kategori Risiko &amp; Target Kontrol
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>Kategori Risiko CVD</label>
                      <select
                        value={formData.cvd_risk_category}
                        onChange={e => handleInputChange('cvd_risk_category', e.target.value)}
                        required
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #DCDFE8', borderRadius: 8, fontSize: 13, background: '#F7F8FA', outline: 'none' }}
                      >
                        <option value="low">Rendah (Low)</option>
                        <option value="moderate">Sedang (Moderate)</option>
                        <option value="high">Tinggi (High)</option>
                        <option value="very_high">Sangat Tinggi (Very High)</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>Target Kontrol / Sasaran Klinis *</label>
                      <input
                        type="text" required
                        value={formData.target_risk}
                        onChange={e => handleInputChange('target_risk', e.target.value)}
                        placeholder="Mis. Turunkan tensi < 130/80, HbA1c < 6.5%"
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #DCDFE8', borderRadius: 8, fontSize: 13, background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #EAECEF', paddingTop: 14 }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('baseline')}
                      disabled={submitting}
                      style={{ background: '#F4F5F7', border: '1px solid #DCDFE8', borderRadius: 8, padding: '8px 16px', fontSize: 12.5, fontWeight: 600, color: '#636B78', cursor: submitting ? 'not-allowed' : 'pointer' }}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{ background: '#5B6BF0', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 12.5, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      {submitting ? 'Menyimpan...' : 'Simpan Kontrol Baru'}
                    </button>
                  </div>
                </form>
              )
            }

            return null
          })()}
        </div>
      </div>
    </div>,
    document.body
  )
}
