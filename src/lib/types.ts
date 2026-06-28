// ─── Auth ────────────────────────────────────────────────────────────────────

export type ActorType = 'faskes' | 'nakes' | 'patient'
export type NakesRole = 'dokter' | 'kader' | 'admin'

export interface TokenBundle {
  access_token: string
  refresh_token: string
  expires_in: number
}

/** Stored in AuthContext/localStorage after any successful login */
export interface AuthUser {
  actor_type: ActorType
  /** faskes_id (faskes login) | nakes_id (nakes login) | patient_id (patient login) */
  id: string
  faskes_id: string
  /** name (faskes) | full_name (nakes/patient) */
  name: string
  /** only present for nakes login */
  role?: NakesRole
}

// Raw shapes from API — used only inside api.ts, not exported to components

export interface FaskesLoginData {
  token: TokenBundle
  faskes_id: string
  name: string
}

export interface NakesLoginData {
  token: TokenBundle
  nakes_id: string
  faskes_id: string
  full_name: string
  role: NakesRole
}

export interface PatientLoginData {
  token: TokenBundle
  patient_id: string
  faskes_id: string
  full_name: string
}

// ─── Faskes Registration ──────────────────────────────────────────────────────

/** API contract: puskesmas | klinik (plus rumah_sakit supported by UI) */
export type FaskesType = 'puskesmas' | 'klinik' | 'rumah_sakit'

export interface RegisterFaskesBody {
  name: string
  type: FaskesType
  address: string
  region: string
  username: string
  password: string
  phone_number: string
}

// ─── Nakes (managed by Faskes) ───────────────────────────────────────────────

export type NakesStatus = 'active' | 'inactive'

export interface NakesItem {
  nakes_id: string
  full_name: string
  role: NakesRole
  username: string
  phone_number: string
  status: NakesStatus
  enrolled_at: string
}

export interface RegisterNakesBody {
  nik: string
  full_name: string
  alamat: string
  phone_number: string
  role: NakesRole
  username: string
  password: string
}

/** WhatsApp warm-up links returned after registering a nakes or patient */
export interface WaWarmupNakes {
  bot_phone: string
  nakes_link: string
  nakes_direct_link?: string
  status: 'pending' | 'unavailable'
}

export interface RegisterNakesResult {
  nakes_id: string
  faskes_id: string
  full_name: string
  role: NakesRole
  nik: string
  enrolled_at: string
  credentials: {
    username: string
    password: string
  }
  wa_warmup: WaWarmupNakes
}

// ─── Patients ─────────────────────────────────────────────────────────────────

export type DiseaseType = 'diabetes_t2' | 'hypertension' | 'both'

export interface RegisterPatientBody {
  nik: string
  full_name: string
  date_of_birth: string     // YYYY-MM-DD
  sex: 'male' | 'female'
  alamat: string
  phone_number: string
  companion_name: string
  companion_phone: string
  disease_type: DiseaseType
  username: string
  password: string
}

/** Body for POST /api/v1/faskes/patients/register — requires assigned_nakes_id */
export interface RegisterFaskesPatientBody extends RegisterPatientBody {
  assigned_nakes_id: string
}

/** WhatsApp warm-up links returned after registering a patient */
export interface WaWarmupPatient {
  bot_phone: string
  patient_link: string
  companion_link?: string
  patient_direct_link?: string
  companion_direct_link?: string
  status: 'pending' | 'unavailable'
}

export interface RegisterPatientResult {
  patient_id: string
  faskes_id: string
  full_name: string
  nik: string
  disease_type: DiseaseType
  enrolled_at: string
  credentials: {
    username: string
    password: string
  }
  wa_warmup: WaWarmupPatient
}

// ─── OCR KTP ─────────────────────────────────────────────────────────────────

export interface OcrKtpResult {
  nik: string
  full_name: string
  date_of_birth: string     // YYYY-MM-DD
  sex: 'male' | 'female'
  alamat: string
}

// ─── Dashboard Nakes ─────────────────────────────────────────────────────────

export interface DashboardSummary {
  total_pasien: number
  risiko_bahaya: number
  status_aman: number
}

export type RiskLabel = 'kritis' | 'sedang' | 'rendah'
export type PatientStatus = 'bahaya' | 'waswas' | 'aman'

export interface PatientQueueItem {
  patient_id: string
  full_name: string
  age: number
  disease_type: DiseaseType
  risk_score: number
  risk_label: RiskLabel
  status: PatientStatus
  main_factor: string
}

export interface Paging {
  page: number
  size: number
  total_item: number
  total_page: number
}

export interface PatientQueueResponse {
  data: PatientQueueItem[]
  paging: Paging
}

// ─── Faskes Patients ──────────────────────────────────────────────────────────

export interface FaskesPatientItem {
  patient_id: string
  full_name: string
  nik: string
  sex: 'male' | 'female'
  age: number
  disease_type: DiseaseType
  phone_number: string
  companion_name: string
  companion_phone: string
  status: 'active' | 'inactive'
  enrolled_at: string
}

export interface FaskesPatientResponse {
  data: FaskesPatientItem[]
  paging: Paging
}

// ─── Nakes Status Update ──────────────────────────────────────────────────────

export interface UpdateNakesStatusResult {
  nakes_id: string
  full_name: string
  status: NakesStatus
}

// ─── Detail Responses ─────────────────────────────────────────────────────────

export interface NakesDetail {
  nakes_id: string
  faskes_id: string
  full_name: string
  role: NakesRole
  nik: string
  alamat: string
  phone_number: string
  username: string
  status: NakesStatus
  enrolled_at: string
  created_at: string
  updated_at: string
}

export interface FaskesPatientDetail {
  patient_id: string
  faskes_id: string
  assigned_nakes_id: string
  assigned_nakes_name: string
  full_name: string
  nik: string
  date_of_birth: string
  sex: 'male' | 'female'
  age: number
  alamat: string
  phone_number: string
  companion_name: string
  companion_phone: string
  disease_type: DiseaseType
  username: string
  status: 'active' | 'inactive'
  enrolled_at: string
  created_at: string
  updated_at: string
}

export interface FaskesProfile {
  faskes_id: string
  name: string
  type: FaskesType
  address: string
  region: string
  username: string
  phone_number: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

// ─── Patient Dashboard ────────────────────────────────────────────────────────

export interface PatientDashboard {
  profile: {
    full_name: string
    age: number
    disease_type: DiseaseType
    companion_name: string
    companion_phone: string
    assigned_nakes_name: string
  }
  risk: {
    score: number
    risk_label: RiskLabel
    status: PatientStatus
    main_factor: string
    scored_at: string | null
  }
  latest_measurements: {
    glucose: { value: number; measured_at: string } | null
    blood_pressure: { systolic: number; diastolic: number; measured_at: string } | null
  }
  logging: {
    logged_today: boolean
    streak_days: number
  }
  recommendations: string[]
}

/** GET /api/v1/patients/assigned-nakes */
export interface AssignedNakesInfo {
  full_name: string
  specialization: string
  hospital: string
  whatsapp_phone: string
  schedule: Array<{ days: string; time: string }>
}

// ─── Health Logs ──────────────────────────────────────────────────────────────

export type HealthMetricType =
  | 'glucose'
  | 'bp'
  | 'med_adherence'
  | 'food'
  | 'activity'
  | 'sleep'
  | 'stress'
  | 'smoking'
  | 'alcohol'
  | 'weight'

/** POST /api/v1/patients/health-logs — one metric per request */
export interface HealthLogBody {
  metric_type: HealthMetricType
  /** required for numeric metrics (not bp, not food) */
  value_numeric?: number
  /** required for metric_type=bp */
  systolic?: number
  /** required for metric_type=bp */
  diastolic?: number
  /** required for metric_type=food */
  value_text?: string
  /** RFC3339 / ISO 8601, must not be in the future */
  measured_at: string
}

export interface HealthLogResult {
  id: string
  patient_id: string
  metric_type: HealthMetricType
  value_numeric?: number
  value_text?: string
  blood_pressure?: { systolic: number; diastolic: number }
  measured_at: string
  logged_by: string
  source: string
  created_at: string
}

// ─── Daily Records ────────────────────────────────────────────────────────────

/** POST /api/v1/patients/records — all metrics in one request */
export interface DailyRecordBody {
  blood_sugar?: number | null
  systolic?: number | null
  diastolic?: number | null
  weight?: number | null
  medicine_taken?: boolean | null
  meals?: string
  recorded_at: string   // RFC3339
}

export interface DailyRecordResult {
  recorded_at: string
  created: string[]   // e.g. ["glucose", "bp", "weight"]
}

/** One day of history from GET /api/v1/patients/records/history */
export interface HistoryRecord {
  date: string          // YYYY-MM-DD
  blood_sugar: number | null
  systolic: number | null
  diastolic: number | null
  weight: number | null
}

// ─── Consultations ────────────────────────────────────────────────────────────

export interface ConsultationBody {
  complaint: string   // 1–2000 chars
}

export interface ConsultationResult {
  id: string
  patient_id: string
  complaint: string
  status: string      // 'open' when freshly created
  created_at: string
}
