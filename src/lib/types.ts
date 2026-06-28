// ─── Auth ────────────────────────────────────────────────────────────────────

export type ActorType = 'faskes' | 'nakes'
export type NakesRole = 'dokter' | 'kader' | 'admin'

export interface TokenBundle {
  access_token: string
  refresh_token: string
  expires_in: number
}

/** Stored in AuthContext/localStorage after any successful login */
export interface AuthUser {
  actor_type: ActorType
  /** faskes_id (faskes login) or nakes_id (nakes login) */
  id: string
  faskes_id: string
  /** name (faskes) or full_name (nakes) */
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

// ─── Faskes Registration ──────────────────────────────────────────────────────

export type FaskesType = 'puskesmas' | 'klinik'

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

export interface RegisterNakesResult {
  nakes_id: string
  faskes_id: string
  full_name: string
  role: NakesRole
  nik: string
  enrolled_at: string
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

export interface RegisterPatientResult {
  patient_id: string
  faskes_id: string
  full_name: string
  nik: string
  disease_type: DiseaseType
  enrolled_at: string
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
  type: 'puskesmas' | 'klinik'
  address: string
  region: string
  username: string
  phone_number: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}


