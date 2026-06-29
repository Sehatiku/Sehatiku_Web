import { useState, useRef } from 'react'
import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { faskesApi } from '../../../lib/api'
import type { NakesItem, DiseaseType, PatientBaselineBody, RegisterPatientResult } from '../../../lib/types'
import { initials } from '../../../lib/utils'
import DatePicker from '../../../components/ui/DatePicker'

interface PendaftaranTabProps {
  nakesItems: NakesItem[]
  nakesLoading: boolean
  nakesError: string | null
  showToastMsg: (msg: string) => void
}

type BaselineFormState = {
  bmi: string
  bmi_category: PatientBaselineBody['bmi_category'] | ''
  waist_circumference_cm: string
  central_obesity: boolean
  smoking_status: PatientBaselineBody['smoking_status'] | ''
  alcohol_use: boolean
  physical_activity: PatientBaselineBody['physical_activity'] | ''
  family_history_diabetes: boolean
  family_history_cvd: boolean
  systolic_bp_mmhg: string
  diastolic_bp_mmhg: string
  hypertension_status: PatientBaselineBody['hypertension_status'] | ''
  fasting_glucose_mgdl: string
  hba1c_pct: string
  diabetes_status: PatientBaselineBody['diabetes_status'] | ''
  total_cholesterol_mgdl: string
  hdl_mgdl: string
  ldl_mgdl: string
  triglycerides_mgdl: string
  cvd_risk_10yr_pct: string
  cvd_risk_category: PatientBaselineBody['cvd_risk_category'] | ''
  on_antihypertensive: boolean
  on_antidiabetic: boolean
  on_statin: boolean
  target_risk: string
  egfr: string
  uacr: string
  cluster_id: string
  diagnosis_cluster: string
  clinical_group: string
}

const emptyBaseline: BaselineFormState = {
  bmi: '',
  bmi_category: '',
  waist_circumference_cm: '',
  central_obesity: false,
  smoking_status: '',
  alcohol_use: false,
  physical_activity: '',
  family_history_diabetes: false,
  family_history_cvd: false,
  systolic_bp_mmhg: '',
  diastolic_bp_mmhg: '',
  hypertension_status: '',
  fasting_glucose_mgdl: '',
  hba1c_pct: '',
  diabetes_status: '',
  total_cholesterol_mgdl: '',
  hdl_mgdl: '',
  ldl_mgdl: '',
  triglycerides_mgdl: '',
  cvd_risk_10yr_pct: '',
  cvd_risk_category: '',
  on_antihypertensive: false,
  on_antidiabetic: false,
  on_statin: false,
  target_risk: '',
  egfr: '',
  uacr: '',
  cluster_id: '',
  diagnosis_cluster: '',
  clinical_group: '',
}

const selectStyle: CSSProperties = {
  width: '100%',
  padding: '10px 13px',
  borderRadius: 9,
  fontSize: 13,
  color: '#2B2D42',
  background: '#F7F8FA',
  outline: 'none',
  boxSizing: 'border-box',
}

export default function PendaftaranTab({
  nakesItems,
  nakesLoading,
  nakesError,
  showToastMsg,
}: PendaftaranTabProps) {
  // Phase Pendaftaran States
  const [ptNik, setPtNik] = useState('')
  const [ptName, setPtName] = useState('')
  const [ptDob, setPtDob] = useState('')
  const [ptSex, setPtSex] = useState<'male' | 'female' | ''>('')
  const [ptAlamat, setPtAlamat] = useState('')
  const [ptPhone, setPtPhone] = useState('')
  const [ptCompanionName, setPtCompanionName] = useState('')
  const [ptCompanionPhone, setPtCompanionPhone] = useState('')
  const [ptDiseaseType, setPtDiseaseType] = useState<DiseaseType | ''>('')
  const [ptUsername, setPtUsername] = useState('')
  const [ptPassword, setPtPassword] = useState('')
  const [ptRegisterLoading, setPtRegisterLoading] = useState(false)
  const [ptRegisterError, setPtRegisterError] = useState<string | null>(null)
  const [ptOcrLoading, setPtOcrLoading] = useState(false)
  const ptOcrRef = useRef<HTMLInputElement>(null)
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null)
  const [ptSubmitted, setPtSubmitted] = useState(false)
  const [baseline, setBaseline] = useState<BaselineFormState>(emptyBaseline)
  const [registerResult, setRegisterResult] = useState<RegisterPatientResult | null>(null)
  const [lastRegisteredPtPhone, setLastRegisteredPtPhone] = useState('')
  const [lastRegisteredCompPhone, setLastRegisteredCompPhone] = useState('')
  const [lastRegisteredCompName, setLastRegisteredCompName] = useState('')

  const normalizePhone = (val: string): string => {
    const d = val.replace(/\D/g, '')
    if (!d) return ''
    if (d.startsWith('0')) return '62' + d.slice(1)
    if (!d.startsWith('62')) return '62' + d
    return d
  }

  const setBaselineField = <K extends keyof BaselineFormState>(key: K, value: BaselineFormState[K]) => {
    setBaseline(prev => ({ ...prev, [key]: value }))
  }

  const toNumber = (value: string) => Number(value.replace(',', '.'))
  const optionalText = (value: string) => value.trim() ? value.trim() : null

  const calculateAgeYears = (dob: string) => {
    if (!dob) return null
    const birth = new Date(`${dob}T00:00:00`)
    if (Number.isNaN(birth.getTime())) return null
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDelta = today.getMonth() - birth.getMonth()
    if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
      age -= 1
    }
    return age
  }

  const validateNumber = (value: string, label: string, min: number, max?: number) => {
    if (!value.trim()) return `${label} wajib diisi`
    const parsed = toNumber(value)
    if (!Number.isFinite(parsed)) return `${label} harus angka valid`
    if (parsed < min || (max !== undefined && parsed > max)) {
      return max === undefined ? `${label} minimal ${min}` : `${label} harus ${min}-${max}`
    }
    return ''
  }

  const validateInteger = (value: string, label: string, min: number, max?: number) => {
    const baseError = validateNumber(value, label, min, max)
    if (baseError) return baseError
    if (!Number.isInteger(toNumber(value))) return `${label} harus bilangan bulat`
    return ''
  }

  // Computed validation
  const ptPhoneDigits = normalizePhone(ptPhone)
  const ptCompPhoneDigits = normalizePhone(ptCompanionPhone)
  const ageYears = calculateAgeYears(ptDob)
  const ptValidation = {
    nik: !/^\d{16}$/.test(ptNik) ? 'NIK harus 16 digit angka' : '',
    name: !ptName.trim() ? 'Nama lengkap wajib diisi' : '',
    dob: !ptDob ? 'Tanggal lahir wajib diisi' : '',
    sex: !ptSex ? 'Jenis kelamin wajib dipilih' : '',
    alamat: !ptAlamat.trim() ? 'Alamat wajib diisi' : '',
    phone: !/^62\d{8,12}$/.test(ptPhoneDigits) ? 'Harus diawali 62 (contoh: 628123456789)' : '',
    companionName: !ptCompanionName.trim() ? 'Nama pendamping wajib diisi' : '',
    companionPhone: !/^62\d{8,12}$/.test(ptCompPhoneDigits) ? 'Harus diawali 62 (contoh: 628123456789)' : '',
    diseaseType: !ptDiseaseType ? 'Jenis penyakit wajib dipilih' : '',
    username: ptUsername.trim().length < 4 ? 'Username minimal 4 karakter' : '',
    password: ptPassword.length < 8 ? 'Password minimal 8 karakter' : '',
    assignedNakes: !selectedDoctorId ? 'Nakes penanggung jawab wajib dipilih' : '',
    baselineAge: ageYears === null || ageYears < 0 || ageYears > 150 ? 'Usia baseline harus 0-150 tahun' : '',
    baselineBmi: validateNumber(baseline.bmi, 'BMI', 5, 100),
    baselineBmiCategory: !baseline.bmi_category ? 'Kategori BMI wajib dipilih' : '',
    baselineWaist: validateNumber(baseline.waist_circumference_cm, 'Lingkar pinggang', 20, 250),
    baselineSmoking: !baseline.smoking_status ? 'Status merokok wajib dipilih' : '',
    baselineActivity: !baseline.physical_activity ? 'Aktivitas fisik wajib dipilih' : '',
    baselineSystolic: validateInteger(baseline.systolic_bp_mmhg, 'Tensi sistolik', 40, 300),
    baselineDiastolic: validateInteger(baseline.diastolic_bp_mmhg, 'Tensi diastolik', 20, 200),
    baselineHypertension: !baseline.hypertension_status ? 'Status hipertensi wajib dipilih' : '',
    baselineGlucose: validateNumber(baseline.fasting_glucose_mgdl, 'Gula darah puasa', 20, 1000),
    baselineHba1c: validateNumber(baseline.hba1c_pct, 'HbA1c', 1, 20),
    baselineDiabetes: !baseline.diabetes_status ? 'Status diabetes wajib dipilih' : '',
    baselineCholesterol: validateNumber(baseline.total_cholesterol_mgdl, 'Kolesterol total', 50, 1000),
    baselineHdl: validateNumber(baseline.hdl_mgdl, 'HDL', 5, 200),
    baselineLdl: validateNumber(baseline.ldl_mgdl, 'LDL', 5, 600),
    baselineTriglycerides: validateNumber(baseline.triglycerides_mgdl, 'Trigliserida', 10, 5000),
    baselineCvdRisk: validateNumber(baseline.cvd_risk_10yr_pct, 'Risiko CVD 10 tahun', 0, 100),
    baselineCvdCategory: !baseline.cvd_risk_category ? 'Kategori risiko CVD wajib dipilih' : '',
    baselineTargetRisk: !baseline.target_risk.trim() ? 'Target risk wajib diisi' : '',
    baselineEgfr: validateNumber(baseline.egfr, 'eGFR', 0, 200),
    baselineUacr: validateNumber(baseline.uacr, 'UACR', 0),
    baselineCluster: baseline.cluster_id.trim() && !Number.isInteger(toNumber(baseline.cluster_id)) ? 'Cluster ID harus bilangan bulat atau kosong' : '',
  }
  const ptHasError = Object.values(ptValidation).some(Boolean)
  const ptErr = (k: keyof typeof ptValidation) => ptSubmitted ? ptValidation[k] : ''

  const handlePtOcrFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setPtOcrLoading(true)
    try {
      const result = await faskesApi.ocrKtpPatient(file)
      setPtNik(result.nik)
      setPtName(result.full_name)
      setPtDob(result.date_of_birth)
      setPtSex(result.sex)
      setPtAlamat(result.alamat)
      showToastMsg('✓ OCR Berhasil! Data identitas pasien terisi otomatis dari KTP.')
    } catch {
      showToastMsg('⚠️ OCR gagal. Pastikan foto KTP jelas (JPG/PNG, maks 5 MB) dan coba lagi.')
    } finally {
      setPtOcrLoading(false)
    }
  }

  const resetPtForm = () => {
    setPtNik(''); setPtName(''); setPtDob(''); setPtSex(''); setPtAlamat('')
    setPtPhone(''); setPtCompanionName(''); setPtCompanionPhone('')
    setPtDiseaseType(''); setPtUsername(''); setPtPassword('')
    setBaseline(emptyBaseline)
    setPtRegisterError(null); setSelectedDoctorId(null); setPtSubmitted(false)
  }

  const handleSubmitPatient = async () => {
    setPtSubmitted(true)
    setPtRegisterError(null)
    if (ptHasError) return

    setPtRegisterLoading(true)
    try {
      const baselineBody: PatientBaselineBody = {
        age_years: ageYears!,
        sex: ptSex as 'male' | 'female',
        bmi: toNumber(baseline.bmi),
        bmi_category: baseline.bmi_category as PatientBaselineBody['bmi_category'],
        waist_circumference_cm: toNumber(baseline.waist_circumference_cm),
        central_obesity: baseline.central_obesity,
        smoking_status: baseline.smoking_status as PatientBaselineBody['smoking_status'],
        alcohol_use: baseline.alcohol_use,
        physical_activity: baseline.physical_activity as PatientBaselineBody['physical_activity'],
        family_history_diabetes: baseline.family_history_diabetes,
        family_history_cvd: baseline.family_history_cvd,
        systolic_bp_mmhg: toNumber(baseline.systolic_bp_mmhg),
        diastolic_bp_mmhg: toNumber(baseline.diastolic_bp_mmhg),
        hypertension_status: baseline.hypertension_status as PatientBaselineBody['hypertension_status'],
        fasting_glucose_mgdl: toNumber(baseline.fasting_glucose_mgdl),
        hba1c_pct: toNumber(baseline.hba1c_pct),
        diabetes_status: baseline.diabetes_status as PatientBaselineBody['diabetes_status'],
        total_cholesterol_mgdl: toNumber(baseline.total_cholesterol_mgdl),
        hdl_mgdl: toNumber(baseline.hdl_mgdl),
        ldl_mgdl: toNumber(baseline.ldl_mgdl),
        triglycerides_mgdl: toNumber(baseline.triglycerides_mgdl),
        cvd_risk_10yr_pct: toNumber(baseline.cvd_risk_10yr_pct),
        cvd_risk_category: baseline.cvd_risk_category as PatientBaselineBody['cvd_risk_category'],
        on_antihypertensive: baseline.on_antihypertensive,
        on_antidiabetic: baseline.on_antidiabetic,
        on_statin: baseline.on_statin,
        target_risk: baseline.target_risk.trim(),
        egfr: toNumber(baseline.egfr),
        uacr: toNumber(baseline.uacr),
        cluster_id: baseline.cluster_id.trim() ? toNumber(baseline.cluster_id) : null,
        diagnosis_cluster: optionalText(baseline.diagnosis_cluster),
        clinical_group: optionalText(baseline.clinical_group),
      }

      const res = await faskesApi.registerPatient({
        assigned_nakes_id: selectedDoctorId!,
        nik: ptNik,
        full_name: ptName.trim(),
        date_of_birth: ptDob,
        sex: ptSex as 'male' | 'female',
        alamat: ptAlamat.trim(),
        phone_number: ptPhoneDigits,
        companion_name: ptCompanionName.trim(),
        companion_phone: ptCompPhoneDigits,
        disease_type: ptDiseaseType as DiseaseType,
        username: ptUsername.trim(),
        password: ptPassword,
        baseline: baselineBody,
      })
      setRegisterResult(res)
      setLastRegisteredPtPhone(ptPhoneDigits)
      setLastRegisteredCompPhone(ptCompPhoneDigits)
      setLastRegisteredCompName(ptCompanionName.trim())
      showToastMsg(`✓ ${ptName} berhasil didaftarkan ke Sehatiku!`)
      resetPtForm()

    } catch (err: unknown) {
      const apiErr = err as { status?: number; body?: { message?: string } }
      if (apiErr.status === 409) {
        setPtRegisterError('NIK atau username pasien sudah terdaftar di sistem.')
      } else {
        setPtRegisterError(apiErr.body?.message ?? 'Terjadi kesalahan server. Coba lagi.')
      }
    } finally {
      setPtRegisterLoading(false)
    }
  }

  const fieldBorder = (error: string) => `1.5px solid ${error ? '#EF4444' : '#DCDFE8'}`
  const baselineErr = (key: keyof typeof ptValidation) => ptErr(key)
  const baselineNumber = (
    key: keyof BaselineFormState,
    label: string,
    placeholder: string,
    errKey: keyof typeof ptValidation,
  ) => (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>{label}</label>
      <input
        type="number"
        value={baseline[key] as string}
        onChange={e => setBaselineField(key, e.target.value as BaselineFormState[typeof key])}
        placeholder={placeholder}
        style={{ width: '100%', padding: '10px 13px', border: fieldBorder(baselineErr(errKey)), borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box', fontFamily: 'IBM Plex Mono, monospace' }}
      />
      {baselineErr(errKey) && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{baselineErr(errKey)}</div>}
    </div>
  )

  const baselineSelect = (
    key: keyof BaselineFormState,
    label: string,
    placeholder: string,
    options: Array<{ value: string; label: string }>,
    errKey: keyof typeof ptValidation,
  ) => (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>{label}</label>
      <select
        value={baseline[key] as string}
        onChange={e => setBaselineField(key, e.target.value as BaselineFormState[typeof key])}
        style={{ ...selectStyle, border: fieldBorder(baselineErr(errKey)) }}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {baselineErr(errKey) && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{baselineErr(errKey)}</div>}
    </div>
  )

  const baselineToggle = (key: keyof BaselineFormState, label: string) => {
    const checked = Boolean(baseline[key])
    return (
      <button
        onClick={() => setBaselineField(key, !checked as BaselineFormState[typeof key])}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 12px', borderRadius: 9, border: `1.5px solid ${checked ? '#5B6BF0' : '#DCDFE8'}`, background: checked ? '#EEEFFE' : '#F7F8FA', color: checked ? '#5B6BF0' : '#636B78', cursor: 'pointer', fontSize: 12, fontWeight: 600, textAlign: 'left' }}
      >
        <span>{label}</span>
        <span style={{ width: 34, height: 20, borderRadius: 999, background: checked ? '#5B6BF0' : '#DCDFE8', padding: 2, boxSizing: 'border-box', display: 'flex', justifyContent: checked ? 'flex-end' : 'flex-start' }}>
          <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', display: 'block' }} />
        </span>
      </button>
    )
  }

  const baselineGroupTitle = (title: string, subtitle?: string) => (
    <div style={{ gridColumn: 'span 3', paddingTop: 4, marginTop: 2, borderTop: '1px dashed #DCDFE8' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#2B2D42' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 10, color: '#8A93A1', marginTop: 2 }}>{subtitle}</div>}
    </div>
  )

  return (
    <div className="anim-fadein">
      <div style={{ background: 'linear-gradient(130deg, #1A2066 0%, #262F8A 100%)', borderRadius: 14, padding: '20px 24px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 20px rgba(26,32,102,0.18)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ width: 46, height: 46, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22,4 12,14.01 9,11.01" />
          </svg>
        </div>
        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>RS Umum Sejahtera — Akun Faskes Aktif di Sehatiku ✓</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 1.6 }}>Terdaftar sebagai Mitra Prolanis resmi BPJS Kesehatan. Status: <strong style={{ color: '#1EC8A5' }}>AKTIF</strong> · {nakesItems.length} nakes terdaftar</div>
        </div>
        <div style={{ display: 'flex', gap: 12, position: 'relative', zIndex: 1, flexShrink: 0 }}>
          <div style={{ background: 'rgba(30,200,165,0.2)', border: '1px solid rgba(30,200,165,0.35)', borderRadius: 10, padding: '10px 18px', textAlign: 'center' }}>
            <div style={{ color: '#1EC8A5', fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{nakesItems.filter(n => n.status === 'active').length}</div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: 600, marginTop: 2 }}>Nakes Aktif</div>
          </div>
        </div>
      </div>

      {/* Hidden OCR input for patient */}
      <input ref={ptOcrRef} type="file" accept="image/jpeg,image/png" style={{ display: 'none' }} onChange={handlePtOcrFileChange} />

      {/* Error banner */}
      {ptRegisterError && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 14, fontSize: 13, color: '#DC2626', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 9 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          {ptRegisterError}
        </div>
      )}

      {/* Main 2-col: form left, doctor right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, marginBottom: 14 }}>

        {/* LEFT: Full patient form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Card 1: Data Identitas */}
          <div style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #DCDFE8' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EEEFFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5B6BF0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 7H5v3M16 7h3v3M8 17H5v-3M16 17h3v-3" /></svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#2B2D42' }}>Data Identitas KTP</div>
                  <div style={{ fontSize: 10, color: '#8A93A1' }}>Terisi otomatis via Scan KTP atau input manual</div>
                </div>
              </div>
              <button
                onClick={() => ptOcrRef.current?.click()}
                disabled={ptOcrLoading}
                style={{ display: 'flex', alignItems: 'center', gap: 7, background: ptOcrLoading ? '#F4F5F7' : '#EEEFFE', border: '1.5px dashed #5B6BF0', borderRadius: 9, padding: '7px 13px', cursor: ptOcrLoading ? 'not-allowed' : 'pointer', color: '#5B6BF0', fontSize: 12, fontWeight: 600 }}
              >
                {ptOcrLoading
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5B6BF0" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>
                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5B6BF0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 7H5v3M16 7h3v3M8 17H5v-3M16 17h3v-3" /></svg>}
                {ptOcrLoading ? 'Memproses...' : 'Scan KTP'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>NIK *</label>
                <input
                  type="text" value={ptNik} onChange={e => setPtNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="16 digit NIK sesuai KTP"
                  maxLength={16}
                  style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${ptErr('nik') ? '#EF4444' : '#DCDFE8'}`, borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '2px', boxSizing: 'border-box' }}
                />
                {ptErr('nik') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{ptErr('nik')}</div>}
                {!ptErr('nik') && ptNik && ptNik.length < 16 && <div style={{ fontSize: 10, color: '#8A93A1', marginTop: 3 }}>{ptNik.length}/16 digit</div>}
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nama Lengkap *</label>
                <input
                  type="text" value={ptName} onChange={e => setPtName(e.target.value)}
                  placeholder="Nama sesuai KTP"
                  style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${ptErr('name') ? '#EF4444' : '#DCDFE8'}`, borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                />
                {ptErr('name') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{ptErr('name')}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tanggal Lahir *</label>
                <DatePicker
                  value={ptDob}
                  onChange={setPtDob}
                  error={!!ptErr('dob')}
                  placeholder="Pilih tanggal lahir"
                />
                {ptErr('dob') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{ptErr('dob')}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Jenis Kelamin *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['male', 'female'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setPtSex(s)}
                      style={{ flex: 1, padding: '9px 0', borderRadius: 9, border: `1.5px solid ${ptErr('sex') ? '#EF4444' : (ptSex === s ? '#5B6BF0' : '#DCDFE8')}`, background: ptSex === s ? '#EEEFFE' : '#F7F8FA', color: ptSex === s ? '#5B6BF0' : '#636B78', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                    >
                      {s === 'male' ? '♂ Laki-laki' : '♀ Perempuan'}
                    </button>
                  ))}
                </div>
                {ptErr('sex') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{ptErr('sex')}</div>}
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Alamat Lengkap *</label>
                <input
                  type="text" value={ptAlamat} onChange={e => setPtAlamat(e.target.value)}
                  placeholder="Alamat sesuai KTP (terisi otomatis via OCR)"
                  style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${ptErr('alamat') ? '#EF4444' : '#DCDFE8'}`, borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                />
                {ptErr('alamat') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{ptErr('alamat')}</div>}
              </div>
            </div>
          </div>

          {/* Card 2: Kontak Pasien & Pendamping */}
          <div style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #DCDFE8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EDFAF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1EC8A5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l1.64-1.64a2 2 0 0 1 2.11-.45c.91.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92z" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#2B2D42' }}>Kontak Pasien &amp; Pendamping</div>
                <div style={{ fontSize: 10, color: '#8A93A1' }}>Kredensial login dikirim ke nomor ini via WhatsApp</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>No. WhatsApp Pasien *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel" value={ptPhone}
                    onChange={e => setPtPhone(e.target.value)}
                    onBlur={() => setPtPhone(normalizePhone(ptPhone))}
                    placeholder="628xxxxxxxxxx"
                    style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${ptErr('phone') ? '#EF4444' : '#DCDFE8'}`, borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                {ptErr('phone') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{ptErr('phone')}</div>}
              </div>

              <div style={{ gridColumn: 'span 2', borderTop: '1px dashed #DCDFE8', paddingTop: 12, marginTop: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8A93A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#8A93A1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pendamping / Wali</span>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nama Pendamping *</label>
                <input
                  type="text" value={ptCompanionName} onChange={e => setPtCompanionName(e.target.value)}
                  placeholder="Nama lengkap wali/keluarga"
                  style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${ptErr('companionName') ? '#EF4444' : '#DCDFE8'}`, borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                />
                {ptErr('companionName') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{ptErr('companionName')}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>No. WhatsApp Pendamping *</label>
                <input
                  type="tel" value={ptCompanionPhone}
                  onChange={e => setPtCompanionPhone(e.target.value)}
                  onBlur={() => setPtCompanionPhone(normalizePhone(ptCompanionPhone))}
                  placeholder="628xxxxxxxxxx (awali dengan 62)"
                  style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${ptErr('companionPhone') ? '#EF4444' : '#DCDFE8'}`, borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                />
                {ptErr('companionPhone') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{ptErr('companionPhone')}</div>}
              </div>
            </div>
          </div>

          {/* Card 4: Penyakit & Akun Login */}
          <div style={{ order: 4, background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #DCDFE8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#636B78" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#2B2D42' }}>Penyakit &amp; Akun Login</div>
                <div style={{ fontSize: 10, color: '#8A93A1' }}>Dipakai pasien untuk masuk ke aplikasi Sehatiku</div>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Jenis Penyakit *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {([
                  { val: 'diabetes_t2', label: 'Diabetes', color: '#5B6BF0', bg: '#EEEFFE', border: 'rgba(91,107,240,0.25)' },
                  { val: 'hypertension', label: 'Hipertensi', color: '#0277BD', bg: 'rgba(79,195,247,0.1)', border: 'rgba(2,119,189,0.25)' },
                  { val: 'both', label: 'Keduanya', color: '#7C3AED', bg: '#F5F3FF', border: 'rgba(124,58,237,0.25)' },
                ] as const).map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => setPtDiseaseType(opt.val)}
                    style={{
                      padding: '11px 8px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
                      border: `1.5px solid ${ptErr('diseaseType') && !ptDiseaseType ? '#EF4444' : (ptDiseaseType === opt.val ? opt.border : '#DCDFE8')}`,
                      background: ptDiseaseType === opt.val ? opt.bg : '#F7F8FA',
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: ptDiseaseType === opt.val ? opt.color : '#636B78' }}>{opt.label}</div>
                  </button>
                ))}
              </div>
              {ptErr('diseaseType') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 5 }}>{ptErr('diseaseType')}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username *</label>
                <input
                  type="text" value={ptUsername} onChange={e => setPtUsername(e.target.value)}
                  placeholder="Min 4 karakter"
                  style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${ptErr('username') ? '#EF4444' : '#DCDFE8'}`, borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                />
                {ptErr('username') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{ptErr('username')}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password *</label>
                <input
                  type="password" value={ptPassword} onChange={e => setPtPassword(e.target.value)}
                  placeholder="Min 8 karakter"
                  style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${ptErr('password') ? '#EF4444' : '#DCDFE8'}`, borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                />
                {ptErr('password') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{ptErr('password')}</div>}
              </div>
            </div>
          </div>

          {/* Card 3: Baseline Klinis ML */}
          <div style={{ order: 3, background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #DCDFE8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F0FDF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#2B2D42' }}>Baseline Klinis ML</div>
                <div style={{ fontSize: 10, color: '#8A93A1' }}>Data awal untuk pemetaan risiko pasien</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
              {baselineGroupTitle('Identitas klinis & antropometri', 'Usia dan jenis kelamin mengikuti data KTP.')}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>Usia baseline</label>
                <input
                  type="text"
                  value={ageYears ?? ''}
                  readOnly
                  placeholder="Dari tanggal lahir"
                  style={{ width: '100%', padding: '10px 13px', border: fieldBorder(ptErr('baselineAge')), borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#EEF0F5', outline: 'none', boxSizing: 'border-box', fontFamily: 'IBM Plex Mono, monospace' }}
                />
                {ptErr('baselineAge') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{ptErr('baselineAge')}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>Jenis kelamin baseline</label>
                <input
                  type="text"
                  value={ptSex ? (ptSex === 'male' ? 'Laki-laki' : 'Perempuan') : ''}
                  readOnly
                  placeholder="Dari jenis kelamin"
                  style={{ width: '100%', padding: '10px 13px', border: fieldBorder(ptErr('sex')), borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#EEF0F5', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              {baselineNumber('bmi', 'BMI', 'kg/m2', 'baselineBmi')}
              {baselineSelect('bmi_category', 'Kategori BMI', 'Pilih kategori', [
                { value: 'underweight', label: 'Berat badan kurang' },
                { value: 'normal', label: 'Normal' },
                { value: 'overweight', label: 'Berat badan berlebih' },
                { value: 'obese', label: 'Obesitas' },
              ], 'baselineBmiCategory')}
              {baselineNumber('waist_circumference_cm', 'Lingkar Pinggang', 'cm', 'baselineWaist')}
              {baselineGroupTitle('Gaya hidup & riwayat keluarga')}
              {baselineSelect('smoking_status', 'Status Merokok', 'Pilih status', [
                { value: 'never', label: 'Tidak pernah' },
                { value: 'former', label: 'Pernah, sudah berhenti' },
                { value: 'current', label: 'Masih merokok' },
              ], 'baselineSmoking')}
              {baselineSelect('physical_activity', 'Aktivitas Fisik', 'Pilih aktivitas', [
                { value: 'sedentary', label: 'Sangat kurang' },
                { value: 'light', label: 'Ringan' },
                { value: 'moderate', label: 'Sedang' },
                { value: 'active', label: 'Aktif' },
              ], 'baselineActivity')}
              <div />
              {baselineGroupTitle('Tekanan darah & gula darah')}
              {baselineNumber('systolic_bp_mmhg', 'Sistolik', 'mmHg', 'baselineSystolic')}
              {baselineNumber('diastolic_bp_mmhg', 'Diastolik', 'mmHg', 'baselineDiastolic')}
              {baselineSelect('hypertension_status', 'Status Hipertensi', 'Pilih status', [
                { value: 'normal', label: 'Normal' },
                { value: 'elevated', label: 'Meningkat' },
                { value: 'stage1', label: 'Hipertensi tahap 1' },
                { value: 'stage2', label: 'Hipertensi tahap 2' },
              ], 'baselineHypertension')}
              {baselineNumber('fasting_glucose_mgdl', 'Gula darah puasa', 'mg/dL', 'baselineGlucose')}
              {baselineNumber('hba1c_pct', 'HbA1c', '%', 'baselineHba1c')}
              {baselineSelect('diabetes_status', 'Status Diabetes', 'Pilih status', [
                { value: 'none', label: 'Tidak ada' },
                { value: 'prediabetes', label: 'Prediabetes' },
                { value: 'type2', label: 'Diabetes tipe 2' },
                { value: 'controlled', label: 'Terkontrol' },
                { value: 'uncontrolled', label: 'Belum terkontrol' },
              ], 'baselineDiabetes')}
              {baselineGroupTitle('Profil lipid & risiko kardiovaskular')}
              {baselineNumber('total_cholesterol_mgdl', 'Kolesterol Total', 'mg/dL', 'baselineCholesterol')}
              {baselineNumber('hdl_mgdl', 'HDL', 'mg/dL', 'baselineHdl')}
              {baselineNumber('ldl_mgdl', 'LDL', 'mg/dL', 'baselineLdl')}
              {baselineNumber('triglycerides_mgdl', 'Trigliserida', 'mg/dL', 'baselineTriglycerides')}
              {baselineNumber('cvd_risk_10yr_pct', 'Risiko CVD 10 tahun', '%', 'baselineCvdRisk')}
              {baselineSelect('cvd_risk_category', 'Kategori risiko CVD', 'Pilih kategori', [
                { value: 'low', label: 'Rendah' },
                { value: 'moderate', label: 'Sedang' },
                { value: 'high', label: 'Tinggi' },
                { value: 'very_high', label: 'Sangat tinggi' },
              ], 'baselineCvdCategory')}
              {baselineGroupTitle('Ginjal & target risiko')}
              {baselineNumber('egfr', 'eGFR', 'mL/min/1.73m2', 'baselineEgfr')}
              {baselineNumber('uacr', 'UACR', 'mg/g', 'baselineUacr')}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>Target risiko</label>
                <input
                  type="text"
                  value={baseline.target_risk}
                  onChange={e => setBaselineField('target_risk', e.target.value)}
                  placeholder="Contoh: moderate"
                  style={{ width: '100%', padding: '10px 13px', border: fieldBorder(ptErr('baselineTargetRisk')), borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                />
                {ptErr('baselineTargetRisk') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{ptErr('baselineTargetRisk')}</div>}
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #DCDFE8', paddingTop: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#2B2D42', marginBottom: 10 }}>Riwayat, kebiasaan, dan terapi berjalan</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {baselineToggle('central_obesity', 'Obesitas sentral')}
              {baselineToggle('alcohol_use', 'Konsumsi alkohol')}
              {baselineToggle('family_history_diabetes', 'Riwayat keluarga diabetes')}
              {baselineToggle('family_history_cvd', 'Riwayat keluarga CVD')}
              {baselineToggle('on_antihypertensive', 'Pakai antihipertensi')}
              {baselineToggle('on_antidiabetic', 'Pakai antidiabetik')}
              {baselineToggle('on_statin', 'Pakai statin')}
              </div>
            </div>

            <div style={{ borderTop: '1px dashed #DCDFE8', paddingTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#2B2D42', marginBottom: 10 }}>Data cluster ML opsional</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>Cluster ID</label>
                  <input
                    type="number"
                    value={baseline.cluster_id}
                    onChange={e => setBaselineField('cluster_id', e.target.value)}
                    placeholder="Kosongkan jika belum ada"
                    style={{ width: '100%', padding: '10px 13px', border: fieldBorder(ptErr('baselineCluster')), borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box', fontFamily: 'IBM Plex Mono, monospace' }}
                  />
                  {ptErr('baselineCluster') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{ptErr('baselineCluster')}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>Diagnosis cluster</label>
                  <input
                    type="text"
                    value={baseline.diagnosis_cluster}
                    onChange={e => setBaselineField('diagnosis_cluster', e.target.value)}
                    placeholder="Opsional"
                    style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #DCDFE8', borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#636B78', marginBottom: 5 }}>Kelompok klinis</label>
                  <input
                    type="text"
                    value={baseline.clinical_group}
                    onChange={e => setBaselineField('clinical_group', e.target.value)}
                    placeholder="Opsional"
                    style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #DCDFE8', borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Pilih Nakes PJ */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: `1px solid ${ptErr('assignedNakes') ? '#EF4444' : '#DCDFE8'}`, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, alignSelf: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#2B2D42' }}>Nakes Penanggung Jawab <span style={{ color: '#EF4444' }}>*</span></div>
              <div style={{ fontSize: 10, color: '#8A93A1', marginTop: 2 }}>Wajib dipilih — dikirim ke API sebagai <code>assigned_nakes_id</code></div>
            </div>
            {selectedDoctorId && (
              <span style={{ background: '#F0FDF8', color: '#1EC8A5', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, border: '1px solid rgba(30,200,165,0.2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1EC8A5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12" /></svg>
                Terpilih
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 420 }}>
            {nakesLoading && <div style={{ textAlign: 'center', padding: '20px 0', color: '#8A93A1', fontSize: 12 }}>Memuat daftar nakes...</div>}
            {!nakesLoading && nakesError && <div style={{ textAlign: 'center', padding: '16px 0', color: '#EF4444', fontSize: 12 }}>{nakesError}</div>}
            {!nakesLoading && !nakesError && nakesItems.filter(d => d.status === 'active').length === 0 && (
              <div style={{ textAlign: 'center', padding: '16px 0', color: '#8A93A1', fontSize: 12 }}>Belum ada nakes aktif terdaftar.</div>
            )}
            {!nakesLoading && nakesItems.filter(d => d.status === 'active').map(d => {
              const isSelected = selectedDoctorId === d.nakes_id
              return (
                <div
                  key={d.nakes_id}
                  onClick={() => setSelectedDoctorId(isSelected ? null : d.nakes_id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                    border: `1.5px solid ${isSelected ? '#5B6BF0' : '#DCDFE8'}`,
                    background: isSelected ? '#EEEFFE' : '#F7F8FA',
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: isSelected ? '#5B6BF0' : '#EEEFFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: isSelected ? '#fff' : '#5B6BF0', flexShrink: 0 }}>{initials(d.full_name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#2B2D42', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.full_name}</div>
                    <div style={{ fontSize: 10, color: '#636B78', marginTop: 1, textTransform: 'capitalize' }}>{d.role} · <span style={{ color: '#1EC8A5', fontWeight: 600 }}>Aktif</span></div>
                  </div>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: isSelected ? '#5B6BF0' : 'transparent', border: `1.5px solid ${isSelected ? '#5B6BF0' : '#DCDFE8'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: isSelected ? '0 2px 6px rgba(91,107,240,0.3)' : 'none' }}>
                    {isSelected && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12" /></svg>}
                  </div>
                </div>
              )
            })}
          </div>

          {ptErr('assignedNakes') && (
            <div style={{ marginTop: 10, fontSize: 11, color: '#EF4444', fontWeight: 600 }}>{ptErr('assignedNakes')}</div>
          )}
        </div>
      </div>

      {/* Submit bar */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '16px 22px', boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #DCDFE8', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: '#EDFAF6', border: '1px solid rgba(30,200,165,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1EC8A5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l1.64-1.64a2 2 0 0 1 2.11-.45c.91.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92z" /></svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#2B2D42' }}>Notifikasi WhatsApp Otomatis</div>
            <div style={{ fontSize: 11, color: '#8A93A1' }}>Kredensial login dikirim ke nomor pasien &amp; pendamping setelah pendaftaran berhasil</div>
          </div>
        </div>
        <button
          onClick={resetPtForm}
          disabled={ptRegisterLoading}
          style={{ padding: '10px 18px', border: '1.5px solid #DCDFE8', borderRadius: 9, background: '#fff', color: '#636B78', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          Reset Form
        </button>
        <button
          onClick={handleSubmitPatient}
          disabled={ptRegisterLoading}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: ptRegisterLoading ? '#A0A9C5' : '#5B6BF0', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 24px', fontSize: 14, fontWeight: 700, cursor: ptRegisterLoading ? 'not-allowed' : 'pointer', flexShrink: 0, boxShadow: ptRegisterLoading ? 'none' : '0 3px 14px rgba(91,107,240,0.3)' }}
        >
          {ptRegisterLoading
            ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>Mendaftarkan...</>
            : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>Daftarkan Pasien</>}
        </button>
      </div>

      {/* ── SUCCESS REGISTRATION WHATSAPP MODAL ── */}
      {registerResult && createPortal(
        <div
          onClick={e => { if (e.target === e.currentTarget) setRegisterResult(null) }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(43,45,66,0.55)', zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(5px)', animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{
            background: '#fff', borderRadius: 20, padding: 32, width: 480, maxWidth: '90vw',
            boxShadow: '0 20px 60px rgba(15,36,68,0.25)', border: '1px solid #DCDFE8',
            maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box'
          }}>
            {/* Header / Whatsapp Icon */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%', background: '#25D366',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(37,211,102,0.3)', marginBottom: 16
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#2B2D42' }}>Pasien Berhasil Didaftarkan</h3>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#636B78', lineHeight: 1.5 }}>
                Undangan aktivasi &amp; kredensial siap dikirimkan kepada pasien <strong>{registerResult.full_name}</strong>.
              </p>
            </div>

            {/* Credentials Card */}
            <div style={{ background: '#F5F3FF', border: '1.5px solid #DDD6FE', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#2B2D42', fontFamily: 'IBM Plex Mono, monospace' }}>{registerResult.credentials.username}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kata Sandi</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#2B2D42', fontFamily: 'IBM Plex Mono, monospace' }}>{registerResult.credentials.password}</span>
              </div>
            </div>

            {/* WA Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {registerResult.wa_warmup.status === 'unavailable' ? (
                <>
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 14px', fontSize: 12, color: '#B45309', lineHeight: 1.5, textAlign: 'center' }}>
                    <strong>⚠️ WhatsApp Bot Offline:</strong> Kredensial tidak dapat dikirim otomatis via bot. Sampaikan detail akun di atas secara manual kepada pasien.
                  </div>
                  {lastRegisteredPtPhone && (
                    <div>
                      <button
                        onClick={() => {
                          const txt = `Halo Bapak/Ibu ${registerResult.full_name} 🙏\n\nAkun Sehatiku Anda sudah dibuat.\nUsername: ${registerResult.credentials.username}\nPassword: ${registerResult.credentials.password}\n\nSilakan gunakan kredensial ini untuk login ke aplikasi Sehatiku.`
                          window.open(`https://wa.me/${lastRegisteredPtPhone}?text=${encodeURIComponent(txt)}`, '_blank')
                        }}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          background: '#25D366', color: '#fff', border: 'none', borderRadius: 10,
                          padding: '11px 18px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(37,211,102,0.2)', transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#20ba59'}
                        onMouseLeave={e => e.currentTarget.style.background = '#25D366'}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                        Kirim Kredensial ke Pasien (WA Manual)
                      </button>
                    </div>
                  )}
                  {lastRegisteredCompPhone && (
                    <div style={{ borderTop: '1px dashed #DCDFE8', paddingTop: 14 }}>
                      <button
                        onClick={() => {
                          const txt = `Halo Bapak/Ibu ${lastRegisteredCompName} 🙏\n\nAnda terdaftar sebagai pendamping ${registerResult.full_name} di Sehatiku.\nBerikut kredensial login pasien:\nUsername: ${registerResult.credentials.username}\nPassword: ${registerResult.credentials.password}\n\nSilakan gunakan kredensial ini untuk login ke aplikasi Sehatiku.`
                          window.open(`https://wa.me/${lastRegisteredCompPhone}?text=${encodeURIComponent(txt)}`, '_blank')
                        }}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          background: '#128C7E', color: '#fff', border: 'none', borderRadius: 10,
                          padding: '11px 18px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(18,140,126,0.2)', transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#0e7569'}
                        onMouseLeave={e => e.currentTarget.style.background = '#128C7E'}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        </svg>
                        Kirim Kredensial ke Pendamping (WA Manual)
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {registerResult.wa_warmup.patient_direct_link && (
                    <div>
                      <button
                        onClick={() => window.open(registerResult.wa_warmup.patient_direct_link, '_blank')}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          background: '#25D366', color: '#fff', border: 'none', borderRadius: 10,
                          padding: '11px 18px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(37,211,102,0.2)', transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#20ba59'}
                        onMouseLeave={e => e.currentTarget.style.background = '#25D366'}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                        Hubungkan WhatsApp Pasien
                      </button>
                      <p style={{ margin: '6px 0 0 4px', fontSize: 11, color: '#8A93A1', lineHeight: 1.45 }}>
                        Membuka chat WhatsApp faskes langsung ke nomor pasien dengan teks undangan aktivasi. Pasien tinggal klik kirim pesan.
                      </p>
                    </div>
                  )}

                  {registerResult.wa_warmup.companion_direct_link && (
                    <div style={{ borderTop: '1px dashed #DCDFE8', paddingTop: 14 }}>
                      <button
                        onClick={() => window.open(registerResult.wa_warmup.companion_direct_link, '_blank')}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          background: '#128C7E', color: '#fff', border: 'none', borderRadius: 10,
                          padding: '11px 18px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(18,140,126,0.2)', transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#0e7569'}
                        onMouseLeave={e => e.currentTarget.style.background = '#128C7E'}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        </svg>
                        Hubungkan WhatsApp Pendamping
                      </button>
                      <p style={{ margin: '6px 0 0 4px', fontSize: 11, color: '#8A93A1', lineHeight: 1.45 }}>
                        Membuka chat WhatsApp faskes langsung ke nomor pendamping pasien.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28, borderTop: '1px solid #EFF1F5', paddingTop: 18 }}>
              <button
                onClick={() => setRegisterResult(null)}
                style={{
                  width: '100%', padding: '10px 0', borderRadius: 10, border: 'none', background: '#F4F5F7',
                  color: '#636B78', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', transition: 'all 0.12s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#E4E5E7'}
                onMouseLeave={e => e.currentTarget.style.background = '#F4F5F7'}
              >
                Tutup &amp; Selesai
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
