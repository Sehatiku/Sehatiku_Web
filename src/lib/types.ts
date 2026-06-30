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
  specialization?: string
  hospital?: string | null
  schedule?: Array<{ days: string; time: string }>
}

export interface RegisterNakesBody {
  nik: string
  full_name: string
  alamat: string
  phone_number: string
  role: NakesRole
  username: string
  password: string
  specialization?: string
  hospital?: string | null
  schedule?: Array<{ days: string; time: string }>
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

export interface PatientBaselineBody {
  age_years: number
  sex: 'male' | 'female'
  bmi: number
  bmi_category: 'underweight' | 'normal' | 'overweight' | 'obese'
  waist_circumference_cm: number
  central_obesity: boolean
  smoking_status: 'never' | 'former' | 'current'
  alcohol_use: boolean
  physical_activity: 'sedentary' | 'light' | 'moderate' | 'active'
  family_history_diabetes: boolean
  family_history_cvd: boolean
  systolic_bp_mmhg: number
  diastolic_bp_mmhg: number
  hypertension_status: 'normal' | 'elevated' | 'stage1' | 'stage2'
  fasting_glucose_mgdl: number
  hba1c_pct: number
  diabetes_status: 'none' | 'prediabetes' | 'type2' | 'controlled' | 'uncontrolled'
  total_cholesterol_mgdl: number
  hdl_mgdl: number
  ldl_mgdl: number
  triglycerides_mgdl: number
  cvd_risk_10yr_pct: number
  cvd_risk_category: 'low' | 'moderate' | 'high' | 'very_high'
  on_antihypertensive: boolean
  on_antidiabetic: boolean
  on_statin: boolean
  target_risk: string
  egfr: number
  uacr: number
  cluster_id: number | null
  diagnosis_cluster: string | null
  clinical_group: string | null
}

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
  baseline: PatientBaselineBody
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
  health_score?: number | null
  risk_status?: string | null
  top_factors?: string[] | null
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
  specialization?: string
  hospital?: string | null
  schedule?: Array<{ days: string; time: string }>
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
  health_score?: number | null
  risk_status?: string | null
  top_factors?: string[] | null
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

// ─── Consultations & Notifications ────────────────────────────────────────────
 
export interface ConsultationBody {
  complaint_since: string
  complaint_type: string
  complaint_detail: string
}
 
export interface ConsultationResult {
  id: string
  patient_id: string
  patient_name?: string
  complaint_since: string
  complaint_type: string
  complaint_detail: string
  status: 'open' | 'replied'
  nakes_note: string | null
  replied_at: string | null
  created_at: string
}
 
export interface PatientComplaint {
  id?: string
  patient_id: string
  category: 'Konsultasi Dokter' | 'Laporkan Keluhan' | 'Minta Review Hasil'
  complaint: string
  since_when: string
  question: string
  status: 'Waiting for Doctor Review' | 'Reviewed'
  doctor_notes?: string
  reviewed_at?: string
  
  // Synthesized fields for UI listings
  patient_name?: string
  age?: number
  disease_type?: 'diabetes_t2' | 'hypertension' | 'both'
  risk_label?: 'kritis' | 'sedang' | 'rendah'
  status_kesehatan?: 'bahaya' | 'waswas' | 'aman'
  risk_score?: number
}

export interface PatientNotification {
  id: string
  message_type: string
  payload: string
  created_at: string
}

export interface NakesReplyBody {
  nakes_note: string
}

// ─── Baseline Klinis (Faskes) ─────────────────────────────────────────────────

/**
 * GET/POST /api/v1/faskes/patients/{id}/baseline — full 33-feature baseline row
 * with recording metadata. Field names match the contract exactly.
 */
export interface BaselineRecord extends PatientBaselineBody {
  id: string
  patient_id: string
  recorded_at: string
  recorded_by_nakes_id: string | null
  recorded_by_nakes_name: string
  notes: string | null
}

/** Body for POST /api/v1/faskes/patients/{id}/baseline (insert-only new version) */
export interface CreateBaselineBody {
  recorded_by_nakes_id: string
  recorded_at?: string   // YYYY-MM-DD, default now
  notes?: string
  baseline: PatientBaselineBody
}

/** One row in the paginated baseline progress (key metrics subset) */
export interface BaselineHistoryItem {
  id: string
  recorded_at: string
  recorded_by_nakes_name: string
  notes: string | null
  bmi: number
  bmi_category: string
  systolic_bp_mmhg: number
  diastolic_bp_mmhg: number
  hypertension_status: string
  fasting_glucose_mgdl: number
  hba1c_pct: number
  diabetes_status: string
  total_cholesterol_mgdl: number
  hdl_mgdl: number
  ldl_mgdl: number
  triglycerides_mgdl: number
  cvd_risk_10yr_pct: number
  cvd_risk_category: string
  egfr: number
  uacr: number
}

/** A single health-score datapoint (trend series) */
export interface HealthScorePoint {
  score: number
  status: PatientStatus
  scored_at: string
}

/** GET /api/v1/faskes/patients/{id}/baseline/history — two separate series + paging */
export interface BaselineHistoryResponse {
  data: {
    baseline_history: BaselineHistoryItem[]
    health_score_history: HealthScorePoint[]
  }
  paging: Paging
}

/** GET /api/v1/patients/baseline/history — paginated baseline rows for the logged-in patient */
export interface PatientBaselineHistoryResponse {
  data: BaselineHistoryItem[]
  paging: Paging
}

// ─── Detail Pasien (Nakes) ────────────────────────────────────────────────────

/** SHAP-style risk factor object (nakes patient detail / risk block) */
export interface RiskFactor {
  feature: string
  shap_value: number
  direction: string
}

export interface RiskInfo {
  score: number
  status: PatientStatus
  scoring_mode?: string
  top_factors: RiskFactor[]
}

/** One day of clinical log rows in the nakes patient-detail view */
export interface NakesDailyLog {
  date: string
  blood_sugar: number | null
  weight: number | null
  systolic: number | null
  diastolic: number | null
  health_score: number | null
}

/** GET /api/v1/nakes/patients/:id */
export interface NakesPatientDetailData {
  patient_detail: FaskesPatientDetail
  baseline: BaselineRecord | null
  daily_logs: NakesDailyLog[]
  risk: RiskInfo | null
  health_score_history: HealthScorePoint[]
}

// ─── Ringkasan Kesehatan (window 7/14/30) ─────────────────────────────────────

export interface HealthSummaryAggregates {
  glucose: { avg_mgdl: number; min_mgdl: number; max_mgdl: number; count: number } | null
  blood_pressure: { avg_systolic: number; avg_diastolic: number; count: number } | null
  med_adherence: { adherence_rate_pct: number; count: number } | null
  nutrition: { avg_kcal_per_day: number; avg_carbs_g_per_day: number; avg_sodium_mg_per_day: number; meal_count: number } | null
  activity: { avg_minutes_per_day: number; total_minutes: number; count: number } | null
  sleep: { avg_hours: number; count: number } | null
  stress: { avg_level: number; count: number } | null
  weight: { start_kg: number; latest_kg: number; delta_kg: number; count: number } | null
}

/**
 * GET /api/v1/nakes/patients/:id/summary and GET /api/v1/patients/summary.
 * `available:false` omits period/coverage/aggregates and adds history_days + message.
 */
export interface HealthSummary {
  window: number
  available: boolean
  available_windows: number[]
  period?: { start: string; end: string }
  coverage?: { logged_days: number; window_days: number; streak_days: number }
  aggregates?: HealthSummaryAggregates
  risk?: { score: number; status: PatientStatus; scored_at: string }
  narrative: string
  generated_at: string
  history_days?: number
  message?: string
}

export type SummaryWindow = 7 | 14 | 30

// ─── Eskalasi (Nakes) ─────────────────────────────────────────────────────────

export type EscalationTier = 'acute_today' | 'trend_this_week'
export type EscalationStatus = 'sent' | 'viewed' | 'acted' | 'dismissed'
export type EscalationFeedbackValue = 'accurate' | 'inaccurate'

export interface EscalationItem {
  id: string
  patient_id: string
  patient_name: string
  tier: EscalationTier
  status: EscalationStatus
  risk_score: number
  risk_status: string
  sent_at: string
  viewed_at: string | null
  acted_at: string | null
  created_at: string
}

export interface EscalationResponse {
  data: EscalationItem[]
  paging: Paging
}

export interface EscalationQuery {
  status?: EscalationStatus
  tier?: EscalationTier
  page?: number
  size?: number
}

// ─── Patient Records status & notifications ───────────────────────────────────

/** GET /api/v1/patients/records/today-status */
export interface TodayStatus {
  logged_today: boolean
  days_since_last_log: number | null
  last_logged_at: string | null
  date: string
}

export interface UnreadCount {
  unread_count: number
}

export interface ReadAllResult {
  updated_count: number
}
