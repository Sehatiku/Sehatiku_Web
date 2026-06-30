import type {
  FaskesLoginData,
  NakesLoginData,
  PatientLoginData,
  TokenBundle,
  NakesItem,
  NakesStatus,
  RegisterFaskesBody,
  RegisterNakesBody,
  RegisterNakesResult,
  RegisterPatientBody,
  RegisterFaskesPatientBody,
  RegisterPatientResult,
  OcrKtpResult,
  DashboardSummary,
  PatientQueueResponse,
  PatientQueueItem,
  FaskesPatientItem,
  FaskesPatientResponse,
  UpdateNakesStatusResult,
  NakesDetail,
  FaskesPatientDetail,
  FaskesProfile,
  PatientDashboard,
  AssignedNakesInfo,
  HealthLogBody,
  HealthLogResult,
  DailyRecordBody,
  DailyRecordResult,
  HistoryRecord,
  ConsultationBody,
  ConsultationResult,
  PatientNotification,
  BaselineRecord,
  CreateBaselineBody,
  BaselineHistoryResponse,
  BaselineHistoryItem,
  HealthScorePoint,
  PatientBaselineHistoryResponse,
  NakesPatientDetailData,
  HealthSummary,
  SummaryWindow,
  EscalationItem,
  EscalationResponse,
  EscalationQuery,
  EscalationFeedbackValue,
  TodayStatus,
  UnreadCount,
  ReadAllResult,
} from './types'

const BASE = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:8080'
const MOCK = import.meta.env.VITE_MOCK === 'true'

// ─── Token helpers ────────────────────────────────────────────────────────────

const STORAGE_KEY = 'sk_auth'

interface StoredAuth {
  access_token: string
  refresh_token: string
}

export function getStoredTokens(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredAuth) : null
  } catch {
    return null
  }
}

export function setStoredTokens(tokens: StoredAuth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
}

export function clearStoredTokens() {
  localStorage.removeItem(STORAGE_KEY)
}

function accessToken(): string | null {
  return getStoredTokens()?.access_token ?? null
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

interface ApiEnvelope<T> {
  message: string
  data: T
}

// For paginated responses — paging sits at envelope root
interface PaginatedEnvelope<T> {
  message: string
  data: T[]
  paging: { page: number; size: number; total_item: number; total_page: number }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  extraHeaders: Record<string, string> = {},
): Promise<T> {
  const token = accessToken()

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(init.headers as Record<string, string>),
    ...extraHeaders,
  }

  const res = await fetch(`${BASE}${path}`, { ...init, headers })
  const json = await res.json()

  if (!res.ok) {
    throw Object.assign(new Error(json?.message ?? 'Request failed'), {
      status: res.status,
      body: json,
    })
  }

  return json as T
}

// ─── Mock fixtures ────────────────────────────────────────────────────────────

function mockFaskesLogin(): FaskesLoginData {
  return {
    token: { access_token: 'mock.access.faskes', refresh_token: 'mock.refresh.faskes', expires_in: 43200 },
    faskes_id: 'faskes-mock-001',
    name: 'RS Umum Sejahtera',
  }
}

function mockNakesLogin(): NakesLoginData {
  return {
    token: { access_token: 'mock.access.nakes', refresh_token: 'mock.refresh.nakes', expires_in: 43200 },
    nakes_id: 'nakes-mock-001',
    faskes_id: 'faskes-mock-001',
    full_name: 'Dr. Andi Wijaya',
    role: 'dokter',
  }
}

function mockPatientLogin(): PatientLoginData {
  return {
    token: { access_token: 'mock.access.patient', refresh_token: 'mock.refresh.patient', expires_in: 43200 },
    patient_id: 'patient-mock-001',
    faskes_id: 'faskes-mock-001',
    full_name: 'Ahmad Suharto',
  }
}

let currentMockConsultations: ConsultationResult[] = [
  {
    id: 'consult-1',
    patient_id: 'p1',
    patient_name: 'Ahmad Suharto',
    complaint_since: '5 hari yang lalu',
    complaint_type: 'Konsultasi Dokter',
    complaint_detail: 'Kaki kiri terasa kesemutan hebat dan baal (mati rasa) terus-menerus, terutama saat malam hari sebelum tidur, disertai rasa nyeri seperti tertusuk jarum.',
    status: 'open',
    nakes_note: null,
    replied_at: null,
    created_at: '2025-06-25T08:00:00Z',
  },
  {
    id: 'consult-2',
    patient_id: 'p2',
    patient_name: 'Siti Rahayu',
    complaint_since: '3 hari terakhir',
    complaint_type: 'Laporkan Keluhan',
    complaint_detail: 'Saya merasakan pusing berputar dan tengkuk terasa sangat tegang. Tensi saya ukur mandiri di rumah menunjukkan angka 170/105 mmHg, padahal saya teratur minum Amlodipine 5mg setiap pagi.',
    status: 'open',
    nakes_note: null,
    replied_at: null,
    created_at: '2025-06-27T09:00:00Z',
  },
  {
    id: 'consult-3',
    patient_id: 'p3',
    patient_name: 'Budi Santoso',
    complaint_since: 'Sejak 2 hari yang lalu (setelah diresepkan obat baru)',
    complaint_type: 'Minta Review Hasil',
    complaint_detail: 'Perut saya terasa sangat kembung, begah, dan kadang disertai mual sesaat setelah mengonsumsi tablet Metformin 500mg pasca makan.',
    status: 'open',
    nakes_note: null,
    replied_at: null,
    created_at: '2025-06-28T10:00:00Z',
  }
]

let currentMockNotifications: PatientNotification[] = []

let currentMockNakes: NakesItem[] = [
  { nakes_id: 'n1', full_name: 'Dr. Andi Wijaya, Sp.PD', role: 'dokter', username: 'dr.andi', phone_number: '628123456789', status: 'active', enrolled_at: '2025-01-10T08:00:00Z', specialization: 'Penyakit Dalam', schedule: [{ days: 'Senin - Jumat', time: '08:00 - 14:00' }] },
  { nakes_id: 'n2', full_name: 'Dr. Budi Santoso, Sp.JP', role: 'dokter', username: 'dr.budi', phone_number: '628134567890', status: 'active', enrolled_at: '2025-02-05T08:00:00Z', specialization: 'Jantung', schedule: [{ days: 'Senin, Rabu, Jumat', time: '09:00 - 12:00' }] },
  { nakes_id: 'n3', full_name: 'Siti Kader', role: 'kader', username: 'kader.siti', phone_number: '628145678901', status: 'active', enrolled_at: '2025-03-01T08:00:00Z' },
  { nakes_id: 'n4', full_name: 'Admin Nakes', role: 'admin', username: 'admin.faskes', phone_number: '628156789012', status: 'inactive', enrolled_at: '2024-12-01T08:00:00Z' },
]

function mockNakesList(): NakesItem[] {
  return currentMockNakes
}

function mockOcrResult(): OcrKtpResult {
  return {
    nik: '3201010101850001',
    full_name: 'BUDI SANTOSO',
    date_of_birth: '1985-01-01',
    sex: 'male',
    alamat: 'JL. MERDEKA NO. 10 RT 001 RW 002 KEL. SUKAJADI KEC. BANDUNG WETAN KOTA BANDUNG',
  }
}

function mockDashboardSummary(): DashboardSummary {
  return { total_pasien: 8, risiko_bahaya: 2, status_aman: 3 }
}

function mockFaskesPatients(page = 1, size = 10): FaskesPatientResponse {
  const allPatients: FaskesPatientItem[] = [
    {
      patient_id: '12efe4b4-27b0-4190-acdc-3c2d384a94cb',
      full_name: 'Pasien Sedang Test',
      nik: '3201234567890777',
      sex: 'male',
      age: 51,
      disease_type: 'both',
      phone_number: '628100000555',
      companion_name: 'Wali Sedang',
      companion_phone: '628100000444',
      status: 'active',
      enrolled_at: '2026-06-30T00:25:17.364378Z',
      health_score: 74,
      risk_status: 'aman',
      top_factors: [
        'Fungsi ginjal Anda (eGFR 82.0) butuh perhatian.',
        'Kadar HbA1c lab Anda tinggi (7.2%).',
        'Konsumsi garam (natrium) Anda cukup tinggi (1500 mg/hari).'
      ]
    },
    {
      patient_id: 'c42b7b3e-49dd-4df3-96ff-7f2fc9b3b0f9',
      full_name: 'Pasien Sehat Test',
      nik: '3201234567890888',
      sex: 'female',
      age: 33,
      disease_type: 'diabetes_t2',
      phone_number: '628100000777',
      companion_name: 'Wali Sehat',
      companion_phone: '628100000666',
      status: 'active',
      enrolled_at: '2026-06-29T18:38:40.340005Z',
      health_score: 100,
      risk_status: 'aman',
      top_factors: [
        'Kondisi Anda sudah baik, pertahankan pola hidup sehat Anda!'
      ]
    },
    {
      patient_id: 'a4eeab8d-47dd-43ba-94c6-c0276174f83e',
      full_name: 'Pasien ML Test',
      nik: '3201234567890999',
      sex: 'male',
      age: 58,
      disease_type: 'both',
      phone_number: '628100000999',
      companion_name: 'Wali Test',
      companion_phone: '628100000888',
      status: 'active',
      enrolled_at: '2026-06-29T18:27:33.610488Z',
      health_score: 37,
      risk_status: 'bahaya',
      top_factors: [
        'Fungsi ginjal Anda (eGFR 56.0) butuh perhatian.',
        'Kadar HbA1c lab Anda tinggi (9.2%).',
        'Tensi dasar (bawaan) Anda terdeteksi tinggi (158 mmHg).'
      ]
    },
    {
      patient_id: '222a0069-5f78-4b53-8827-8ea58c3a780f',
      full_name: 'beni',
      nik: '9876543234567890',
      sex: 'male',
      age: 49,
      disease_type: 'diabetes_t2',
      phone_number: '6287787773918',
      companion_name: 'lavi',
      companion_phone: '6287787773918',
      status: 'active',
      enrolled_at: '2026-06-29T07:54:35.003779Z',
      health_score: null,
      risk_status: null,
      top_factors: null
    },
    {
      patient_id: '31b7174a-16c9-483f-9df7-22bd3229a55e',
      full_name: 'hai aku fred',
      nik: '1234567890987654',
      sex: 'male',
      age: 4,
      disease_type: 'both',
      phone_number: '62822559456',
      companion_name: 'hai aku predick',
      companion_phone: '6281904373725',
      status: 'active',
      enrolled_at: '2026-06-29T05:02:05.476167Z',
      health_score: null,
      risk_status: null,
      top_factors: null
    },
    {
      patient_id: '1eeca0e4-0021-4af6-ad5f-0b558853641e',
      full_name: 'Nai',
      nik: '1231231231231231',
      sex: 'male',
      age: 0,
      disease_type: 'diabetes_t2',
      phone_number: '62822559456',
      companion_name: 'Willi',
      companion_phone: '6287791131380',
      status: 'active',
      enrolled_at: '2026-06-29T04:43:45.753549Z',
      health_score: null,
      risk_status: null,
      top_factors: null
    },
    {
      patient_id: '7ce5736c-9470-488e-8eb4-3c770a8c8a6d',
      full_name: 'melvyn',
      nik: '1234567142424422',
      sex: 'male',
      age: 50,
      disease_type: 'both',
      phone_number: '6281397833239',
      companion_name: 'lavi',
      companion_phone: '6287787773918',
      status: 'active',
      enrolled_at: '2026-06-28T14:34:11.315865Z',
      health_score: null,
      risk_status: null,
      top_factors: null
    },
    {
      patient_id: '0d4e7aee-4600-4d48-81bb-e04d1d57282e',
      full_name: 'harry potter',
      nik: '1234567171661111',
      sex: 'male',
      age: 37,
      disease_type: 'diabetes_t2',
      phone_number: '628212559456',
      companion_name: 'voldemort',
      companion_phone: '6287787773918',
      status: 'active',
      enrolled_at: '2026-06-28T13:56:55.450781Z',
      health_score: null,
      risk_status: null,
      top_factors: null
    },
    {
      patient_id: 'c297d171-0386-44bf-bb50-cda56c040fd5',
      full_name: 'Budi Santoso',
      nik: '3175091208900057',
      sex: 'male',
      age: 35,
      disease_type: 'both',
      phone_number: '62822559456',
      companion_name: 'Siti Santoso',
      companion_phone: '6287787773918',
      status: 'active',
      enrolled_at: '2026-06-28T09:56:16.917587Z',
      health_score: null,
      risk_status: null,
      top_factors: null
    },
    {
      patient_id: '776b3eb9-5b02-4946-b051-fffa101ef73e',
      full_name: 'Budi Santoso',
      nik: '3175091208900047',
      sex: 'male',
      age: 35,
      disease_type: 'both',
      phone_number: '62822559456',
      companion_name: 'Siti Santoso',
      companion_phone: '6287787773918',
      status: 'active',
      enrolled_at: '2026-06-28T09:24:23.243992Z',
      health_score: null,
      risk_status: null,
      top_factors: null
    },
    {
      patient_id: '7b3e2054-e973-4286-ae61-3b55ffbf1dc5',
      full_name: 'Budi Santoso',
      nik: '3175091208900045',
      sex: 'male',
      age: 35,
      disease_type: 'both',
      phone_number: '62822559456',
      companion_name: 'Siti Santoso',
      companion_phone: '6287787773918',
      status: 'active',
      enrolled_at: '2026-06-28T08:03:50.801825Z',
      health_score: null,
      risk_status: null,
      top_factors: null
    },
    {
      patient_id: 'e429d3ee-42d3-4e38-a7d4-9644e6cea0fc',
      full_name: 'Budi Santoso',
      nik: '3175091208900044',
      sex: 'male',
      age: 35,
      disease_type: 'both',
      phone_number: '62822559456',
      companion_name: 'Siti Santoso',
      companion_phone: '6287787773918',
      status: 'active',
      enrolled_at: '2026-06-28T07:29:23.53309Z',
      health_score: null,
      risk_status: null,
      top_factors: null
    },
    {
      patient_id: '13eb061c-2714-46b7-8f85-228808b76f3f',
      full_name: 'Budi Santoso',
      nik: '3175091208900043',
      sex: 'male',
      age: 35,
      disease_type: 'both',
      phone_number: '62822559456',
      companion_name: 'Siti Santoso',
      companion_phone: '087787773918',
      status: 'active',
      enrolled_at: '2026-06-28T07:26:34.306272Z',
      health_score: null,
      risk_status: null,
      top_factors: null
    },
    {
      patient_id: '25d2a829-c2b6-4942-a8b2-40dc3c22eaae',
      full_name: 'Budi Santoso',
      nik: '3175091208900003',
      sex: 'male',
      age: 35,
      disease_type: 'both',
      phone_number: '081397833239',
      companion_name: 'Siti Santoso',
      companion_phone: '087787773918',
      status: 'active',
      enrolled_at: '2026-06-28T07:23:37.939235Z',
      health_score: null,
      risk_status: null,
      top_factors: null
    },
    {
      patient_id: '90455310-37cb-43c7-ba35-cbb1915f9a4e',
      full_name: 'Budi Santoso',
      nik: '3175091208900002',
      sex: 'male',
      age: 35,
      disease_type: 'both',
      phone_number: '6281397833239',
      companion_name: 'Siti Santoso',
      companion_phone: '6287787773918',
      status: 'active',
      enrolled_at: '2026-06-28T07:22:24.206345Z',
      health_score: null,
      risk_status: null,
      top_factors: null
    },
    {
      patient_id: '23ba08a7-9dd3-44f1-bee2-60ef45efab7c',
      full_name: 'Budi Santoso',
      nik: '3175091208900001',
      sex: 'male',
      age: 35,
      disease_type: 'both',
      phone_number: '6281234567890',
      companion_name: 'Siti Santoso',
      companion_phone: '6289876543210',
      status: 'active',
      enrolled_at: '2026-06-28T07:18:27.291054Z',
      health_score: null,
      risk_status: null,
      top_factors: null
    },
    {
      patient_id: '5b73d446-6015-4fde-aa8b-b25fa7afba60',
      full_name: 'naruto sasuke',
      nik: '1234567112388595',
      sex: 'female',
      age: 33,
      disease_type: 'diabetes_t2',
      phone_number: '6281397833239',
      companion_name: 'kakashi',
      companion_phone: '6287787773918',
      status: 'active',
      enrolled_at: '2026-06-28T06:49:36.319696Z',
      health_score: null,
      risk_status: null,
      top_factors: null
    },
    {
      patient_id: '0d69b8e2-524b-4dd7-b1ce-26422b1aa03a',
      full_name: 'messi goat',
      nik: '1234567890012345',
      sex: 'male',
      age: 36,
      disease_type: 'both',
      phone_number: '6281397833239',
      companion_name: 'bang dodo',
      companion_phone: '6287787773918',
      status: 'active',
      enrolled_at: '2026-06-28T06:02:50.933178Z',
      health_score: null,
      risk_status: null,
      top_factors: null
    },
    {
      patient_id: '3bb94dae-1dd0-40f8-8dfc-3f7d4c5ae23b',
      full_name: 'thor odinson',
      nik: '1234567890123457',
      sex: 'male',
      age: 55,
      disease_type: 'diabetes_t2',
      phone_number: '6281397833239',
      companion_name: 'lavi',
      companion_phone: '6287787773918',
      status: 'active',
      enrolled_at: '2026-06-28T04:55:00.373084Z',
      health_score: null,
      risk_status: null,
      top_factors: null
    },
    {
      patient_id: '0f4ff5d2-1919-42a9-9cd4-82db939664a1',
      full_name: 'toni stark',
      nik: '1234567890123456',
      sex: 'male',
      age: 38,
      disease_type: 'both',
      phone_number: '6281397833239',
      companion_name: 'lavi',
      companion_phone: '6287787773918',
      status: 'active',
      enrolled_at: '2026-06-28T04:47:32.42979Z',
      health_score: null,
      risk_status: null,
      top_factors: null
    },
    {
      patient_id: 'cfc13990-5d72-4721-9c64-0e50eb33ab50',
      full_name: 'BOBBY ANGGRAINI',
      nik: '3174096112900002',
      sex: 'male',
      age: 35,
      disease_type: 'hypertension',
      phone_number: '6287787773918',
      companion_name: 'byan',
      companion_phone: '6281397833239',
      status: 'active',
      enrolled_at: '2026-06-28T04:15:16.839261Z',
      health_score: null,
      risk_status: null,
      top_factors: null
    },
    {
      patient_id: 'ad569276-f44c-40ae-9cb7-b527f58042b7',
      full_name: 'DEBBY ANGGRAINI',
      nik: '3174096112900001',
      sex: 'female',
      age: 35,
      disease_type: 'diabetes_t2',
      phone_number: '6287787773918',
      companion_name: 'bryan',
      companion_phone: '6281397833239',
      status: 'active',
      enrolled_at: '2026-06-28T04:11:52.766211Z',
      health_score: null,
      risk_status: null,
      top_factors: null
    }
  ]
  const totalItem = allPatients.length
  const totalPage = Math.ceil(totalItem / size)
  const start = (page - 1) * size
  const end = start + size
  return {
    data: allPatients.slice(start, end),
    paging: { page, size, total_item: totalItem, total_page: totalPage },
  }
}

function mockPatientQueue(): PatientQueueResponse {
  return {
    data: [
      { patient_id: 'p1', full_name: 'Ahmad Suharto', age: 58, disease_type: 'diabetes_t2', risk_score: 92, risk_label: 'kritis', status: 'bahaya', main_factor: 'HbA1c Tinggi' },
      { patient_id: 'p2', full_name: 'Siti Rahayu', age: 62, disease_type: 'hypertension', risk_score: 87, risk_label: 'kritis', status: 'bahaya', main_factor: 'Asupan Natrium Tinggi' },
      { patient_id: 'p3', full_name: 'Budi Santoso', age: 45, disease_type: 'diabetes_t2', risk_score: 55, risk_label: 'sedang', status: 'waswas', main_factor: 'Kurang Tidur' },
      { patient_id: 'p4', full_name: 'Maya Kusuma', age: 52, disease_type: 'both', risk_score: 48, risk_label: 'sedang', status: 'waswas', main_factor: 'Kepatuhan Obat Rendah' },
      { patient_id: 'p5', full_name: 'Rini Wulandari', age: 39, disease_type: 'hypertension', risk_score: 25, risk_label: 'rendah', status: 'aman', main_factor: '' },
    ],
    paging: { page: 1, size: 20, total_item: 5, total_page: 1 },
  }
}

function mockPatientDashboard(): PatientDashboard {
  return {
    profile: {
      full_name: 'Ahmad Suharto',
      age: 58,
      disease_type: 'diabetes_t2',
      companion_name: 'Siti Suharto',
      companion_phone: '628123456780',
      assigned_nakes_name: 'Dr. Andi Wijaya',
    },
    risk: {
      score: 72,
      risk_label: 'sedang',
      status: 'waswas',
      main_factor: 'HbA1c Tinggi',
      scored_at: new Date().toISOString(),
    },
    latest_measurements: {
      glucose: { value: 180, measured_at: new Date().toISOString() },
      blood_pressure: { systolic: 140, diastolic: 90, measured_at: new Date().toISOString() },
    },
    logging: { logged_today: true, streak_days: 5 },
    recommendations: [
      'Kurangi konsumsi makanan berindeks glikemik tinggi.',
      'Tingkatkan aktivitas fisik minimal 30 menit per hari.',
      'Pastikan kepatuhan konsumsi obat sesuai jadwal dokter.',
    ],
  }
}

function mockBaselineRecord(patientId: string): BaselineRecord {
  return {
    id: `baseline-${patientId}-latest`,
    patient_id: patientId,
    recorded_at: '2026-06-28T09:00:00Z',
    recorded_by_nakes_id: 'nakes-mock-001',
    recorded_by_nakes_name: 'Dr. Andi Wijaya, Sp.PD',
    notes: 'Kontrol bulanan Prolanis',
    age_years: 58, sex: 'male',
    bmi: 29.4, bmi_category: 'overweight',
    waist_circumference_cm: 102, central_obesity: true,
    smoking_status: 'former', alcohol_use: false,
    physical_activity: 'light',
    family_history_diabetes: true, family_history_cvd: true,
    systolic_bp_mmhg: 148, diastolic_bp_mmhg: 92, hypertension_status: 'stage1',
    fasting_glucose_mgdl: 162, hba1c_pct: 9.2, diabetes_status: 'uncontrolled',
    total_cholesterol_mgdl: 232, hdl_mgdl: 38, ldl_mgdl: 154, triglycerides_mgdl: 210,
    cvd_risk_10yr_pct: 22.5, cvd_risk_category: 'high',
    on_antihypertensive: true, on_antidiabetic: true, on_statin: false,
    target_risk: 'moderate', egfr: 56, uacr: 35,
    cluster_id: 2, diagnosis_cluster: 'metabolic', clinical_group: 'high_risk',
  }
}

function mockBaselineHistory(): BaselineHistoryItem[] {
  return [
    {
      id: 'bh-1', recorded_at: '2026-06-28T09:00:00Z', recorded_by_nakes_name: 'Dr. Andi Wijaya, Sp.PD', notes: 'Kontrol bulanan',
      bmi: 29.4, bmi_category: 'overweight', systolic_bp_mmhg: 148, diastolic_bp_mmhg: 92, hypertension_status: 'stage1',
      fasting_glucose_mgdl: 162, hba1c_pct: 9.2, diabetes_status: 'uncontrolled',
      total_cholesterol_mgdl: 232, hdl_mgdl: 38, ldl_mgdl: 154, triglycerides_mgdl: 210,
      cvd_risk_10yr_pct: 22.5, cvd_risk_category: 'high', egfr: 56, uacr: 35,
    },
    {
      id: 'bh-2', recorded_at: '2026-05-28T09:00:00Z', recorded_by_nakes_name: 'Dr. Andi Wijaya, Sp.PD', notes: null,
      bmi: 29.9, bmi_category: 'overweight', systolic_bp_mmhg: 152, diastolic_bp_mmhg: 95, hypertension_status: 'stage1',
      fasting_glucose_mgdl: 175, hba1c_pct: 9.8, diabetes_status: 'uncontrolled',
      total_cholesterol_mgdl: 240, hdl_mgdl: 36, ldl_mgdl: 160, triglycerides_mgdl: 225,
      cvd_risk_10yr_pct: 24.1, cvd_risk_category: 'high', egfr: 54, uacr: 42,
    },
  ]
}

function mockHealthScoreHistory(): HealthScorePoint[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const score = Math.round(40 + Math.random() * 40)
    return {
      score,
      status: score > 70 ? 'aman' : score >= 40 ? 'waswas' : 'bahaya',
      scored_at: d.toISOString(),
    }
  })
}

function mockNakesPatientDetail(patientId: string): NakesPatientDetailData {
  const listRes = mockFaskesPatients(1, 100)
  const found = listRes.data.find(p => p.patient_id === patientId)
  return {
    patient_detail: {
      patient_id: patientId, faskes_id: 'faskes-mock-001',
      assigned_nakes_id: 'nakes-mock-001', assigned_nakes_name: 'Dr. Andi Wijaya, Sp.PD',
      full_name: found?.full_name ?? 'Pasien Mock', nik: found?.nik ?? '3201234567890002',
      date_of_birth: '1968-03-12', sex: found?.sex ?? 'male', age: found?.age ?? 58,
      alamat: 'Jl. Pasien No. 2', phone_number: found?.phone_number ?? '6281234567891',
      companion_name: found?.companion_name ?? 'Pendamping Mock', companion_phone: found?.companion_phone ?? '6281234567892',
      disease_type: found?.disease_type ?? 'both', username: 'pasien.mock', status: found?.status ?? 'active',
      enrolled_at: found?.enrolled_at ?? '2026-06-28T09:00:00Z', created_at: '2026-06-28T09:00:00Z', updated_at: '2026-06-28T09:00:00Z',
      health_score: found?.health_score ?? 72, risk_status: found?.risk_status ?? 'waswas', top_factors: found?.top_factors ?? null,
    },
    baseline: mockBaselineRecord(patientId),
    daily_logs: Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      return {
        date: d.toISOString().slice(0, 10),
        blood_sugar: Math.round(140 + Math.random() * 80),
        weight: 70,
        systolic: Math.round(135 + Math.random() * 20),
        diastolic: Math.round(85 + Math.random() * 12),
        health_score: Math.round(50 + Math.random() * 30),
      }
    }),
    risk: {
      score: found?.health_score ?? 72,
      status: (found?.risk_status as 'aman' | 'waswas' | 'bahaya') ?? 'waswas',
      scoring_mode: 'cohort',
      top_factors: [
        { feature: 'hba1c', shap_value: 2.4, direction: 'positive' },
        { feature: 'egfr', shap_value: 1.8, direction: 'negative' },
        { feature: 'systolic_bp', shap_value: 1.2, direction: 'positive' },
      ],
    },
    health_score_history: mockHealthScoreHistory(),
  }
}

function mockHealthSummary(window: SummaryWindow): HealthSummary {
  return {
    window,
    available: true,
    available_windows: [7, 14, 30].filter(w => w <= 30),
    history_days: 42,
    period: { start: '2026-06-24', end: '2026-06-30' },
    coverage: { logged_days: 5, window_days: window, streak_days: 3 },
    aggregates: {
      glucose: { avg_mgdl: 142.5, min_mgdl: 98, max_mgdl: 210, count: 6 },
      blood_pressure: { avg_systolic: 134.2, avg_diastolic: 85.1, count: 5 },
      med_adherence: { adherence_rate_pct: 80, count: 5 },
      nutrition: { avg_kcal_per_day: 1850.4, avg_carbs_g_per_day: 210.3, avg_sodium_mg_per_day: 1200, meal_count: 8 },
      activity: { avg_minutes_per_day: 25, total_minutes: 75, count: 3 },
      sleep: { avg_hours: 6.5, count: 4 },
      stress: { avg_level: 4.2, count: 4 },
      weight: { start_kg: 70.5, latest_kg: 70.1, delta_kg: -0.4, count: 2 },
    },
    risk: { score: 72, status: 'waswas', scored_at: '2026-06-30T01:00:00Z' },
    narrative: 'Kondisi Anda dalam sepekan terakhir cukup stabil meski gula darah rata-rata masih di atas target. Tekanan darah membaik tipis. Tetap rutin catat dan minum obat sesuai jadwal.',
    generated_at: new Date().toISOString(),
  }
}

let currentMockEscalations: EscalationItem[] = [
  {
    id: 'esc-1', patient_id: 'a4eeab8d-47dd-43ba-94c6-c0276174f83e', patient_name: 'Pasien ML Test',
    tier: 'acute_today', status: 'sent', risk_score: 37, risk_status: 'bahaya',
    sent_at: '2026-06-30T01:10:00Z', viewed_at: null, acted_at: null, created_at: '2026-06-30T01:10:00Z',
  },
  {
    id: 'esc-2', patient_id: '12efe4b4-27b0-4190-acdc-3c2d384a94cb', patient_name: 'Pasien Sedang Test',
    tier: 'trend_this_week', status: 'viewed', risk_score: 58, risk_status: 'waswas',
    sent_at: '2026-06-29T01:10:00Z', viewed_at: '2026-06-29T03:00:00Z', acted_at: null, created_at: '2026-06-29T01:10:00Z',
  },
]

function mockEscalations(query: EscalationQuery): EscalationResponse {
  let items = currentMockEscalations
  if (query.status) items = items.filter(e => e.status === query.status)
  if (query.tier) items = items.filter(e => e.tier === query.tier)
  const page = query.page ?? 1
  const size = query.size ?? 20
  const totalItem = items.length
  const start = (page - 1) * size
  return {
    data: items.slice(start, start + size),
    paging: { page, size, total_item: totalItem, total_page: Math.max(1, Math.ceil(totalItem / size)) },
  }
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authFaskesApi = {
  /** POST /api/v1/faskes/auth/login */
  login: async (username: string, password: string): Promise<FaskesLoginData> => {
    if (MOCK) return mockFaskesLogin()
    const res = await request<ApiEnvelope<FaskesLoginData>>(
      '/api/v1/faskes/auth/login',
      { method: 'POST', body: JSON.stringify({ username, password }) },
    )
    return res.data
  },

  /** POST /api/v1/faskes/auth/register */
  register: async (body: RegisterFaskesBody): Promise<void> => {
    if (MOCK) return
    await request<ApiEnvelope<null>>(
      '/api/v1/faskes/auth/register',
      { method: 'POST', body: JSON.stringify(body) },
    )
  },
}

export const authNakesApi = {
  /** POST /api/v1/nakes/auth/login */
  login: async (username: string, password: string): Promise<NakesLoginData> => {
    if (MOCK) return mockNakesLogin()
    const res = await request<ApiEnvelope<NakesLoginData>>(
      '/api/v1/nakes/auth/login',
      { method: 'POST', body: JSON.stringify({ username, password }) },
    )
    return res.data
  },
}

export const authPatientApi = {
  /** POST /api/v1/patients/auth/login */
  login: async (username: string, password: string): Promise<PatientLoginData> => {
    if (MOCK) return mockPatientLogin()
    const res = await request<ApiEnvelope<PatientLoginData>>(
      '/api/v1/patients/auth/login',
      { method: 'POST', body: JSON.stringify({ username, password }) },
    )
    return res.data
  },
}

export const authApi = {
  /** POST /api/v1/auth/refresh — works for all actor types */
  refresh: async (refresh_token: string): Promise<TokenBundle> => {
    if (MOCK) return { access_token: 'mock.new.access', refresh_token: 'mock.new.refresh', expires_in: 43200 }
    const res = await request<ApiEnvelope<TokenBundle>>(
      '/api/v1/auth/refresh',
      { method: 'POST', body: JSON.stringify({ refresh_token }) },
    )
    return res.data
  },

  /** POST /api/v1/auth/logout — works for all actor types */
  logout: async (refresh_token: string): Promise<void> => {
    if (MOCK) return
    await request<ApiEnvelope<null>>(
      '/api/v1/auth/logout',
      { method: 'POST', body: JSON.stringify({ refresh_token }) },
    )
  },
}

// ─── Faskes API ───────────────────────────────────────────────────────────────

export const faskesApi = {
  /** GET /api/v1/faskes/profile */
  getProfile: async (): Promise<FaskesProfile> => {
    if (MOCK) {
      return {
        faskes_id: 'faskes-mock-001', name: 'RS Umum Sejahtera', type: 'klinik',
        address: 'Jl. Sejahtera No. 1, Bandung', region: 'Kota Bandung',
        username: 'faskes.mock', phone_number: '6211234567',
        status: 'active', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
      }
    }
    const res = await request<ApiEnvelope<FaskesProfile>>('/api/v1/faskes/profile')
    return res.data
  },

  /** GET /api/v1/faskes/nakes */
  getNakes: async (): Promise<NakesItem[]> => {
    if (MOCK) return mockNakesList()
    const res = await request<ApiEnvelope<NakesItem[]>>('/api/v1/faskes/nakes')
    return res.data
  },

  /** GET /api/v1/faskes/nakes/{id} */
  getNakesDetail: async (id: string): Promise<NakesDetail> => {
    if (MOCK) {
      const found = currentMockNakes.find(n => n.nakes_id === id)
      return {
        nakes_id: id, faskes_id: 'faskes-mock-001', full_name: found?.full_name ?? 'Dr. Mock Nakes',
        role: found?.role ?? 'dokter', nik: '3201234567890001', alamat: 'Jl. Mock No. 1',
        phone_number: found?.phone_number ?? '6281234567890', username: found?.username ?? 'mock.nakes', status: found?.status ?? 'active',
        enrolled_at: found?.enrolled_at ?? '2025-01-01T00:00:00Z', created_at: '2025-01-01T00:00:00Z', updated_at: '2025-01-01T00:00:00Z',
        specialization: found?.specialization,
        schedule: found?.schedule,
      }
    }
    const res = await request<ApiEnvelope<NakesDetail>>(`/api/v1/faskes/nakes/${id}`)
    return res.data
  },

  /** POST /api/v1/faskes/nakes/register/ktp-ocr */
  ocrKtp: async (file: File): Promise<OcrKtpResult> => {
    if (MOCK) return mockOcrResult()
    const form = new FormData()
    form.append('file', file)
    const res = await request<ApiEnvelope<OcrKtpResult>>(
      '/api/v1/faskes/nakes/register/ktp-ocr',
      { method: 'POST', body: form },
    )
    return res.data
  },

  /** POST /api/v1/faskes/nakes/register */
  registerNakes: async (body: RegisterNakesBody): Promise<RegisterNakesResult> => {
    if (MOCK) {
      const newNakesId = `nakes-${Date.now()}`
      const newNakes: NakesItem = {
        nakes_id: newNakesId,
        full_name: body.full_name,
        role: body.role,
        username: body.username,
        phone_number: body.phone_number,
        status: 'active',
        enrolled_at: new Date().toISOString(),
        specialization: body.specialization,
        hospital: body.hospital,
        schedule: body.schedule,
      }
      currentMockNakes.push(newNakes)
      return {
        nakes_id: newNakesId, faskes_id: 'faskes-mock-001',
        full_name: body.full_name, role: body.role, nik: body.nik,
        enrolled_at: newNakes.enrolled_at,
        credentials: { username: body.username, password: body.password },
        wa_warmup: {
          bot_phone: '628975228858',
          nakes_link: 'https://wa.me/628975228858?text=HALO+SEHATIKU%2C+saya+ingin+menerima+detail+akun+saya.',
          nakes_direct_link: `https://wa.me/${body.phone_number}?text=Halo+Bapak%2FIbu+${encodeURIComponent(body.full_name)}+%F0%9F%99%8F%0A%0AAkun+Sehatiku+Anda+sudah+dibuat.%0AUsername%3A+${body.username}%0A%0AUntuk+mengaktifkan+dan+menerima+password%2C+buka+tautan+ini+lalu+tekan+tombol+kirim%3A%0Ahttps%3A%2F%2Fwa.me%2F628975228858%3Ftext%3DHALO%2BSEHATIKU%252C%2Bsaya%2Bingin%2Bmenerima%2Bdetail%2Bakun%2Bsaya.`,
          status: 'pending',
        },
      }
    }
    const res = await request<ApiEnvelope<RegisterNakesResult>>(
      '/api/v1/faskes/nakes/register',
      { method: 'POST', body: JSON.stringify(body) },
    )
    return res.data
  },

  /** PATCH /api/v1/faskes/nakes/{id}/status */
  updateNakesStatus: async (nakesId: string, status: NakesStatus): Promise<UpdateNakesStatusResult> => {
    if (MOCK) {
      const found = currentMockNakes.find(n => n.nakes_id === nakesId)
      if (found) {
        found.status = status
      }
      return { nakes_id: nakesId, full_name: found?.full_name ?? '', status }
    }
    const res = await request<ApiEnvelope<UpdateNakesStatusResult>>(
      `/api/v1/faskes/nakes/${nakesId}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
    )
    return res.data
  },

  /** GET /api/v1/faskes/patients */
  getPatients: async (page = 1, size = 10): Promise<FaskesPatientResponse> => {
    if (MOCK) return mockFaskesPatients(page, size)
    const envelope = await request<PaginatedEnvelope<FaskesPatientItem>>(
      `/api/v1/faskes/patients?page=${page}&size=${size}`,
    )
    return { data: envelope.data, paging: envelope.paging }
  },

  /** GET /api/v1/faskes/patients/{id} */
  getPatientDetail: async (id: string): Promise<FaskesPatientDetail> => {
    if (MOCK) {
      const listRes = mockFaskesPatients(1, 100)
      const found = listRes.data.find(p => p.patient_id === id)
      return {
        patient_id: id, faskes_id: 'faskes-mock-001',
        assigned_nakes_id: 'nakes-mock-001', assigned_nakes_name: 'Dr. Mock Nakes',
        full_name: found?.full_name ?? 'Pasien Mock', nik: found?.nik ?? '3201234567890002',
        date_of_birth: '1970-05-15', sex: found?.sex ?? 'male', age: found?.age ?? 55,
        alamat: 'Jl. Pasien No. 2', phone_number: found?.phone_number ?? '6281234567891',
        companion_name: found?.companion_name ?? 'Pendamping Mock', companion_phone: found?.companion_phone ?? '6281234567892',
        disease_type: found?.disease_type ?? 'diabetes_t2', username: 'pasien.mock', status: found?.status ?? 'active',
        enrolled_at: found?.enrolled_at ?? '2025-02-01T00:00:00Z', created_at: '2025-02-01T00:00:00Z', updated_at: '2025-02-01T00:00:00Z',
        health_score: found?.health_score ?? null,
        risk_status: found?.risk_status ?? null,
        top_factors: found?.top_factors ?? null,
      }
    }
    const res = await request<ApiEnvelope<FaskesPatientDetail>>(`/api/v1/faskes/patients/${id}`)
    return res.data
  },

  /** POST /api/v1/faskes/patients/register/ktp-ocr */
  ocrKtpPatient: async (file: File): Promise<OcrKtpResult> => {
    if (MOCK) return mockOcrResult()
    const form = new FormData()
    form.append('file', file)
    const res = await request<ApiEnvelope<OcrKtpResult>>(
      '/api/v1/faskes/patients/register/ktp-ocr',
      { method: 'POST', body: form },
    )
    return res.data
  },

  /** POST /api/v1/faskes/patients/register */
  registerPatient: async (body: RegisterFaskesPatientBody): Promise<RegisterPatientResult> => {
    if (MOCK) {
      return {
        patient_id: `patient-${Date.now()}`, faskes_id: 'faskes-mock-001',
        full_name: body.full_name, nik: body.nik, disease_type: body.disease_type,
        enrolled_at: new Date().toISOString(),
        credentials: { username: body.username, password: body.password },
        wa_warmup: {
          bot_phone: '628975228858',
          patient_link: `https://wa.me/628975228858?text=HALO+SEHATIKU%2C+saya+ingin+menerima+detail+akun+saya.`,
          companion_link: `https://wa.me/628975228858?text=HALO+SEHATIKU%2C+saya+ingin+menerima+detail+akun+saya.`,
          patient_direct_link: `https://wa.me/${body.phone_number}?text=Halo+Bapak%2FIbu+${encodeURIComponent(body.full_name)}+%F0%9F%99%8F%0A%0AAkun+Sehatiku+Anda+sudah+dibuat.%0AUsername%3A+${body.username}%0A%0AUntuk+mengaktifkan+dan+menerima+password%2C+buka+tautan+ini+lalu+tekan+tombol+kirim%3A%0Ahttps%3A%2F%2Fwa.me%2F628975228858%3Ftext%3DHALO%2BSEHATIKU%252C%2Bsaya%2Bingin%2Bmenerima%2Bdetail%2Bakun%2Bsaya.%0A%0ASetelah+Anda+mengirim+pesan%2C+password+akan+otomatis+dikirim+oleh+Sehatiku+lewat+WhatsApp+ini.`,
          companion_direct_link: body.companion_phone ? `https://wa.me/${body.companion_phone}?text=Halo+Bapak%2FIbu+${encodeURIComponent(body.companion_name)}+%F0%9F%99%8F%0A%0AAnda+terdaftar+sebagai+pendamping+${encodeURIComponent(body.full_name)}+di+Sehatiku.%0A%0AUntuk+mengaktifkan%2C+buka+tautan+ini+lalu+tekan+tombol+kirim%3A%0Ahttps%3A%2F%2Fwa.me%2F628975228858%3Ftext%3DHALO%2BSEHATIKU%252C%2Bsaya%2Bingin%2Bmenerima%2Bdetail%2Bakun%2Bsaya.%0A%0ASetelah+Anda+mengirim+pesan%2C+detail+akun+akan+otomatis+dikirim+oleh+Sehatiku+lewat+WhatsApp+ini.` : undefined,
          status: 'pending',
        },
      }
    }
    const res = await request<ApiEnvelope<RegisterPatientResult>>(
      '/api/v1/faskes/patients/register',
      { method: 'POST', body: JSON.stringify(body) },
    )
    return res.data
  },

  /** GET /api/v1/faskes/patients/{id}/baseline — latest full baseline (pre-fill) */
  getPatientBaseline: async (id: string): Promise<BaselineRecord> => {
    if (MOCK) return mockBaselineRecord(id)
    const res = await request<ApiEnvelope<BaselineRecord>>(`/api/v1/faskes/patients/${id}/baseline`)
    return res.data
  },

  /** POST /api/v1/faskes/patients/{id}/baseline — record a new baseline version (insert-only) */
  createPatientBaseline: async (id: string, body: CreateBaselineBody): Promise<BaselineRecord> => {
    if (MOCK) {
      const rec = mockBaselineRecord(id)
      return {
        ...rec,
        ...body.baseline,
        id: `baseline-${Date.now()}`,
        recorded_at: body.recorded_at ?? new Date().toISOString(),
        recorded_by_nakes_id: body.recorded_by_nakes_id,
        notes: body.notes ?? null,
      }
    }
    const res = await request<ApiEnvelope<BaselineRecord>>(
      `/api/v1/faskes/patients/${id}/baseline`,
      { method: 'POST', body: JSON.stringify(body) },
    )
    return res.data
  },

  /** GET /api/v1/faskes/patients/{id}/baseline/history — paginated baseline + health-score trend */
  getPatientBaselineHistory: async (
    id: string,
    page = 1,
    size = 20,
    scoreLimit = 90,
  ): Promise<BaselineHistoryResponse> => {
    if (MOCK) {
      return {
        data: { baseline_history: mockBaselineHistory(), health_score_history: mockHealthScoreHistory() },
        paging: { page, size, total_item: 2, total_page: 1 },
      }
    }
    const res = await request<BaselineHistoryResponse & { message: string }>(
      `/api/v1/faskes/patients/${id}/baseline/history?page=${page}&size=${size}&score_limit=${scoreLimit}`,
    )
    return { data: res.data, paging: res.paging }
  },
}

// ─── Nakes API ────────────────────────────────────────────────────────────────

export const nakesApi = {
  /** GET /api/v1/nakes/dashboard/summary */
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    if (MOCK) return mockDashboardSummary()
    const res = await request<ApiEnvelope<DashboardSummary>>('/api/v1/nakes/dashboard/summary')
    return res.data
  },

  /** GET /api/v1/nakes/dashboard/patient-queue */
  getPatientQueue: async (page = 1, size = 20): Promise<PatientQueueResponse> => {
    if (MOCK) return mockPatientQueue()
    const envelope = await request<PaginatedEnvelope<PatientQueueItem>>(
      `/api/v1/nakes/dashboard/patient-queue?page=${page}&size=${size}`,
    )
    return { data: envelope.data, paging: envelope.paging }
  },

  /** POST /api/v1/nakes/patients/register/ktp-ocr */
  ocrKtp: async (file: File): Promise<OcrKtpResult> => {
    if (MOCK) return mockOcrResult()
    const form = new FormData()
    form.append('file', file)
    const res = await request<ApiEnvelope<OcrKtpResult>>(
      '/api/v1/nakes/patients/register/ktp-ocr',
      { method: 'POST', body: form },
    )
    return res.data
  },

  /** POST /api/v1/nakes/patients/register */
  registerPatient: async (body: RegisterPatientBody): Promise<RegisterPatientResult> => {
    if (MOCK) {
      return {
        patient_id: `patient-${Date.now()}`, faskes_id: 'faskes-mock-001',
        full_name: body.full_name, nik: body.nik, disease_type: body.disease_type,
        enrolled_at: new Date().toISOString(),
        credentials: { username: body.username, password: body.password },
        wa_warmup: {
          bot_phone: '628975228858',
          patient_link: `https://wa.me/628975228858?text=HALO+SEHATIKU%2C+saya+ingin+menerima+detail+akun+saya.`,
          companion_link: `https://wa.me/628975228858?text=HALO+SEHATIKU%2C+saya+ingin+menerima+detail+akun+saya.`,
          patient_direct_link: `https://wa.me/${body.phone_number}?text=Halo+Bapak%2FIbu+${encodeURIComponent(body.full_name)}+%F0%9F%99%8F%0A%0AAkun+Sehatiku+Anda+sudah+dibuat.%0AUsername%3A+${body.username}%0A%0AUntuk+mengaktifkan+dan+menerima+password%2C+buka+tautan+ini+lalu+tekan+tombol+kirim%3A%0Ahttps%3A%2F%2Fwa.me%2F628975228858%3Ftext%3DHALO%2BSEHATIKU%252C%2Bsaya%2Bingin%2Bmenerima%2Bdetail%2Bakun%2Bsaya.%0A%0ASetelah+Anda+mengirim+pesan%2C+password+akan+otomatis+dikirim+oleh+Sehatiku+lewat+WhatsApp+ini.`,
          companion_direct_link: body.companion_phone ? `https://wa.me/${body.companion_phone}?text=Halo+Bapak%2FIbu+${encodeURIComponent(body.companion_name)}+%F0%9F%99%8F%0A%0AAnda+terdaftar+sebagai+pendamping+${encodeURIComponent(body.full_name)}+di+Sehatiku.%0A%0AUntuk+mengaktifkan%2C+buka+tautan+ini+lalu+tekan+tombol+kirim%3A%0Ahttps%3A%2F%2Fwa.me%2F628975228858%3Ftext%3DHALO%2BSEHATIKU%252C%2Bsaya%2Bingin%2Bmenerima%2Bdetail%2Bakun%2Bsaya.%0A%0ASetelah+Anda+mengirim+pesan%2C+detail+akun+akan+otomatis+dikirim+oleh+Sehatiku+lewat+WhatsApp+ini.` : undefined,
          status: 'pending',
        },
      }
    }
    const res = await request<ApiEnvelope<RegisterPatientResult>>(
      '/api/v1/nakes/patients/register',
      { method: 'POST', body: JSON.stringify(body) },
    )
    return res.data
  },

  /** GET /api/v1/nakes/profile */
  getProfile: async (): Promise<NakesDetail> => {
    if (MOCK) {
      return {
        nakes_id: 'nakes-mock-001',
        faskes_id: 'faskes-mock-001',
        full_name: 'Dr. Andi Wijaya, Sp.PD',
        role: 'dokter',
        nik: '3201234567890001',
        alamat: 'Jl. Sehat Sentosa No. 8, Bandung',
        phone_number: '628123456789',
        username: 'dr.andi',
        status: 'active',
        enrolled_at: '2025-01-10T08:00:00Z',
        created_at: '2025-01-10T08:00:00Z',
        updated_at: '2025-01-10T08:00:00Z',
        specialization: 'Penyakit Dalam',
        schedule: [{ days: 'Senin - Jumat', time: '08:00 - 14:00' }],
      }
    }
    const res = await request<ApiEnvelope<NakesDetail>>('/api/v1/nakes/profile')
    return res.data
  },

  /** GET /api/v1/nakes/consultations */
  getConsultations: async (): Promise<ConsultationResult[]> => {
    if (MOCK) {
      return currentMockConsultations
    }
    const res = await request<ApiEnvelope<ConsultationResult[]>>('/api/v1/nakes/consultations')
    return res.data
  },

  /** POST /api/v1/nakes/consultations/{id}/reply */
  replyConsultation: async (id: string, note: string): Promise<void> => {
    if (MOCK) {
      const found = currentMockConsultations.find(c => c.id === id)
      if (found) {
        found.status = 'replied'
        found.nakes_note = note
        found.replied_at = new Date().toISOString()

        // Create a notification for the patient
        currentMockNotifications.unshift({
          id: `notif-${Date.now()}`,
          message_type: 'consultation_reply',
          payload: JSON.stringify({
            consultation_id: id,
            nakes_id: 'nakes-mock-001',
            nakes_note: note,
          }),
          created_at: new Date().toISOString(),
        })
      }
      return
    }
    await request<ApiEnvelope<null>>(
      `/api/v1/nakes/consultations/${id}/reply`,
      { method: 'POST', body: JSON.stringify({ nakes_note: note }) }
    )
  },

  /** GET /api/v1/nakes/patients/:id — full patient detail (profile, baseline, logs, risk) */
  getPatientDetail: async (id: string): Promise<NakesPatientDetailData> => {
    if (MOCK) return mockNakesPatientDetail(id)
    const res = await request<ApiEnvelope<NakesPatientDetailData>>(`/api/v1/nakes/patients/${id}`)
    return res.data
  },

  /** GET /api/v1/nakes/patients/:id/summary?window=7|14|30 — aggregates + AI narrative */
  getPatientSummary: async (id: string, window: SummaryWindow = 7): Promise<HealthSummary> => {
    if (MOCK) return mockHealthSummary(window)
    const res = await request<ApiEnvelope<HealthSummary>>(`/api/v1/nakes/patients/${id}/summary?window=${window}`)
    return res.data
  },

  /** GET /api/v1/nakes/escalations — escalation queue (acute_today first), with filters */
  getEscalations: async (query: EscalationQuery = {}): Promise<EscalationResponse> => {
    if (MOCK) return mockEscalations(query)
    const params = new URLSearchParams()
    if (query.status) params.set('status', query.status)
    if (query.tier) params.set('tier', query.tier)
    params.set('page', String(query.page ?? 1))
    params.set('size', String(query.size ?? 20))
    const envelope = await request<PaginatedEnvelope<EscalationItem>>(
      `/api/v1/nakes/escalations?${params.toString()}`,
    )
    return { data: envelope.data, paging: envelope.paging }
  },

  /** PATCH /api/v1/nakes/escalations/{id}/view — mark viewed (idempotent) */
  viewEscalation: async (id: string): Promise<void> => {
    if (MOCK) {
      const found = currentMockEscalations.find(e => e.id === id)
      if (found && found.status === 'sent') {
        found.status = 'viewed'
        found.viewed_at = new Date().toISOString()
      }
      return
    }
    await request<ApiEnvelope<null>>(`/api/v1/nakes/escalations/${id}/view`, { method: 'PATCH' })
  },

  /** PATCH /api/v1/nakes/escalations/{id}/act — mark acted */
  actEscalation: async (id: string): Promise<void> => {
    if (MOCK) {
      const found = currentMockEscalations.find(e => e.id === id)
      if (found) {
        found.status = 'acted'
        found.acted_at = new Date().toISOString()
      }
      return
    }
    await request<ApiEnvelope<null>>(`/api/v1/nakes/escalations/${id}/act`, { method: 'PATCH' })
  },

  /** PATCH /api/v1/nakes/escalations/{id}/dismiss — mark dismissed */
  dismissEscalation: async (id: string): Promise<void> => {
    if (MOCK) {
      const found = currentMockEscalations.find(e => e.id === id)
      if (found) found.status = 'dismissed'
      return
    }
    await request<ApiEnvelope<null>>(`/api/v1/nakes/escalations/${id}/dismiss`, { method: 'PATCH' })
  },

  /** PATCH /api/v1/nakes/escalations/{id}/feedback — rate escalation accuracy (gold label) */
  submitEscalationFeedback: async (id: string, feedback: EscalationFeedbackValue): Promise<void> => {
    if (MOCK) return
    await request<ApiEnvelope<null>>(
      `/api/v1/nakes/escalations/${id}/feedback`,
      { method: 'PATCH', body: JSON.stringify({ feedback }) },
    )
  },
}

// ─── Patient API ──────────────────────────────────────────────────────────────

export const patientApi = {
  /** GET /api/v1/patients/dashboard */
  getDashboard: async (): Promise<PatientDashboard> => {
    if (MOCK) return mockPatientDashboard()
    const res = await request<ApiEnvelope<PatientDashboard>>('/api/v1/patients/dashboard')
    return res.data
  },

  /** GET /api/v1/patients/assigned-nakes */
  getAssignedNakes: async (): Promise<AssignedNakesInfo> => {
    if (MOCK) {
      return {
        full_name: 'Dr. Andi Wijaya, Sp.PD',
        specialization: 'Penyakit Dalam',
        hospital: 'RS Umum Sejahtera',
        whatsapp_phone: '628123456789',
        schedule: [{ days: 'Senin - Jumat', time: '08.00 - 14.00' }],
      }
    }
    const res = await request<ApiEnvelope<AssignedNakesInfo>>('/api/v1/patients/assigned-nakes')
    return res.data
  },

  /**
   * POST /api/v1/patients/health-logs
   * One metric per request. Requires `Idempotency-Key` header (UUID generated by caller).
   */
  postHealthLog: async (body: HealthLogBody, idempotencyKey: string): Promise<HealthLogResult> => {
    if (MOCK) {
      return {
        id: `log-${Date.now()}`, patient_id: 'patient-mock-001',
        metric_type: body.metric_type,
        ...(body.value_numeric !== undefined ? { value_numeric: body.value_numeric } : {}),
        ...(body.value_text ? { value_text: body.value_text } : {}),
        ...(body.systolic ? { blood_pressure: { systolic: body.systolic!, diastolic: body.diastolic! } } : {}),
        measured_at: body.measured_at,
        logged_by: 'patient', source: 'web',
        created_at: new Date().toISOString(),
      }
    }
    const res = await request<ApiEnvelope<HealthLogResult>>(
      '/api/v1/patients/health-logs',
      { method: 'POST', body: JSON.stringify(body) },
      { 'Idempotency-Key': idempotencyKey },
    )
    return res.data
  },

  /**
   * POST /api/v1/patients/records
   * All metrics in one request (batch form submit). Minimal one metric required.
   */
  postDailyRecord: async (body: DailyRecordBody): Promise<DailyRecordResult> => {
    if (MOCK) {
      const created: string[] = []
      if (body.blood_sugar != null) created.push('glucose')
      if (body.systolic != null) created.push('bp')
      if (body.weight != null) created.push('weight')
      if (body.medicine_taken != null) created.push('med_adherence')
      if (body.meals) created.push('food')
      return { recorded_at: body.recorded_at, created }
    }
    const res = await request<ApiEnvelope<DailyRecordResult>>(
      '/api/v1/patients/records',
      { method: 'POST', body: JSON.stringify(body) },
    )
    return res.data
  },

  /** GET /api/v1/patients/records/history?limit=7 */
  getRecordHistory: async (limit = 7): Promise<HistoryRecord[]> => {
    if (MOCK) {
      return Array.from({ length: limit }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - i)
        return {
          date: d.toISOString().slice(0, 10),
          blood_sugar: Math.round(120 + Math.random() * 80),
          systolic: Math.round(120 + Math.random() * 30),
          diastolic: Math.round(70 + Math.random() * 20),
          weight: null,
        }
      })
    }
    const res = await request<ApiEnvelope<HistoryRecord[]>>(
      `/api/v1/patients/records/history?limit=${limit}`,
    )
    return res.data
  },

  /** POST /api/v1/patients/consultations */
  postConsultation: async (body: ConsultationBody): Promise<ConsultationResult> => {
    if (MOCK) {
      const newConsult: ConsultationResult = {
        id: `consult-${Date.now()}`,
        patient_id: 'patient-mock-001',
        patient_name: 'Ahmad Suharto',
        complaint_since: body.complaint_since,
        complaint_type: body.complaint_type,
        complaint_detail: body.complaint_detail,
        status: 'open',
        nakes_note: null,
        replied_at: null,
        created_at: new Date().toISOString(),
      }
      currentMockConsultations.unshift(newConsult)
      return newConsult
    }
    const res = await request<ApiEnvelope<ConsultationResult>>(
      '/api/v1/patients/consultations',
      { method: 'POST', body: JSON.stringify(body) },
    )
    return res.data
  },

  /** GET /api/v1/patients/consultations */
  getConsultations: async (): Promise<ConsultationResult[]> => {
    if (MOCK) {
      return currentMockConsultations.filter(c => c.patient_id === 'patient-mock-001' || c.patient_id === 'p1')
    }
    const res = await request<ApiEnvelope<ConsultationResult[]>>('/api/v1/patients/consultations')
    return res.data
  },

  /** GET /api/v1/patients/notifications */
  getNotifications: async (): Promise<PatientNotification[]> => {
    if (MOCK) {
      return currentMockNotifications
    }
    const res = await request<ApiEnvelope<PatientNotification[]>>('/api/v1/patients/notifications')
    return res.data
  },

  /** GET /api/v1/patients/summary?window=7|14|30 — aggregates + AI narrative (patient tone) */
  getSummary: async (window: SummaryWindow = 7): Promise<HealthSummary> => {
    if (MOCK) return mockHealthSummary(window)
    const res = await request<ApiEnvelope<HealthSummary>>(`/api/v1/patients/summary?window=${window}`)
    return res.data
  },

  /** GET /api/v1/patients/records/today-status — has today's data been logged (WIB) */
  getTodayStatus: async (): Promise<TodayStatus> => {
    if (MOCK) {
      return { logged_today: true, days_since_last_log: 0, last_logged_at: new Date().toISOString(), date: new Date().toISOString().slice(0, 10) }
    }
    const res = await request<ApiEnvelope<TodayStatus>>('/api/v1/patients/records/today-status')
    return res.data
  },

  /** GET /api/v1/patients/records/logged-today — raw boolean shortcut */
  getLoggedToday: async (): Promise<boolean> => {
    if (MOCK) return true
    const res = await request<ApiEnvelope<boolean>>('/api/v1/patients/records/logged-today')
    return res.data
  },

  /** GET /api/v1/patients/baseline/history — own baseline progress (paginated) */
  getBaselineHistory: async (page = 1, size = 20): Promise<PatientBaselineHistoryResponse> => {
    if (MOCK) {
      return { data: mockBaselineHistory(), paging: { page, size, total_item: 2, total_page: 1 } }
    }
    const envelope = await request<PaginatedEnvelope<BaselineHistoryItem>>(
      `/api/v1/patients/baseline/history?page=${page}&size=${size}`,
    )
    return { data: envelope.data, paging: envelope.paging }
  },

  /** GET /api/v1/patients/notifications/unread-count — badge count */
  getUnreadNotificationCount: async (): Promise<number> => {
    if (MOCK) return currentMockNotifications.length
    const res = await request<ApiEnvelope<UnreadCount>>('/api/v1/patients/notifications/unread-count')
    return res.data.unread_count
  },

  /** PATCH /api/v1/patients/notifications/{id}/read — mark one as read (idempotent) */
  markNotificationRead: async (id: string): Promise<void> => {
    if (MOCK) return
    await request<ApiEnvelope<null>>(`/api/v1/patients/notifications/${id}/read`, { method: 'PATCH' })
  },

  /** POST /api/v1/patients/notifications/read-all — mark all as read */
  markAllNotificationsRead: async (): Promise<number> => {
    if (MOCK) {
      const count = currentMockNotifications.length
      currentMockNotifications = []
      return count
    }
    const res = await request<ApiEnvelope<ReadAllResult>>(
      '/api/v1/patients/notifications/read-all',
      { method: 'POST' },
    )
    return res.data.updated_count
  },
}

// Re-export for convenience
export type { PatientQueueItem }
