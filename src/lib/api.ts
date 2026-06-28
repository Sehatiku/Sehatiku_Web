import type {
  FaskesLoginData,
  NakesLoginData,
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
  FaskesPatientItem,
  FaskesPatientResponse,
  UpdateNakesStatusResult,
  NakesDetail,
  FaskesPatientDetail,
  FaskesProfile,
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

// For paginated responses like patient-queue, paging sits at envelope root
interface PaginatedEnvelope<T> {
  message: string
  data: T[]
  paging: { page: number; size: number; total_item: number; total_page: number }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  skipContentType = false,
): Promise<T> {
  const token = accessToken()

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string>),
  }

  if (!skipContentType && !(init.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${BASE}${path}`, { ...init, headers })
  const json = await res.json()

  if (!res.ok) {
    // Throw the envelope so callers can read json.message
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
    token: { access_token: 'mock.access.faskes', refresh_token: 'mock.refresh.faskes', expires_in: 900 },
    faskes_id: 'faskes-mock-001',
    name: 'Puskesmas Coba',
  }
}

function mockNakesLogin(): NakesLoginData {
  return {
    token: { access_token: 'mock.access.nakes', refresh_token: 'mock.refresh.nakes', expires_in: 900 },
    nakes_id: 'nakes-mock-001',
    faskes_id: 'faskes-mock-001',
    full_name: 'Dr. Andi Wijaya',
    role: 'dokter',
  }
}

function mockNakesList(): NakesItem[] {
  return [
    { nakes_id: 'n1', full_name: 'Dr. Andi Wijaya, Sp.PD', role: 'dokter', username: 'dr.andi', phone_number: '628123456789', status: 'active', enrolled_at: '2025-01-10T08:00:00Z' },
    { nakes_id: 'n2', full_name: 'Dr. Budi Santoso, Sp.JP', role: 'dokter', username: 'dr.budi', phone_number: '628134567890', status: 'active', enrolled_at: '2025-02-05T08:00:00Z' },
    { nakes_id: 'n3', full_name: 'Siti Kader', role: 'kader', username: 'kader.siti', phone_number: '628145678901', status: 'active', enrolled_at: '2025-03-01T08:00:00Z' },
    { nakes_id: 'n4', full_name: 'Admin Faskes', role: 'admin', username: 'admin.faskes', phone_number: '628156789012', status: 'inactive', enrolled_at: '2024-12-01T08:00:00Z' },
  ]
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

function mockFaskesPatients(): FaskesPatientResponse {
  return {
    data: [
      { patient_id: 'fp1', full_name: 'Ahmad Suharto', nik: '3201010101670001', sex: 'male', age: 58, disease_type: 'diabetes_t2', phone_number: '628123456789', companion_name: 'Siti Suharto', companion_phone: '628123456780', status: 'active', enrolled_at: '2025-01-15T08:00:00Z' },
      { patient_id: 'fp2', full_name: 'Siti Rahayu', nik: '3201010101620002', sex: 'female', age: 62, disease_type: 'hypertension', phone_number: '628134567890', companion_name: 'Budi Rahayu', companion_phone: '628134567891', status: 'active', enrolled_at: '2025-02-01T08:00:00Z' },
      { patient_id: 'fp3', full_name: 'Budi Santoso', nik: '3201010101790003', sex: 'male', age: 45, disease_type: 'both', phone_number: '628145678901', companion_name: 'Maya Santoso', companion_phone: '628145678902', status: 'active', enrolled_at: '2025-02-20T08:00:00Z' },
      { patient_id: 'fp4', full_name: 'Maya Kusuma', nik: '3201010101720004', sex: 'female', age: 52, disease_type: 'diabetes_t2', phone_number: '628156789012', companion_name: 'Rudi Kusuma', companion_phone: '628156789013', status: 'inactive', enrolled_at: '2025-03-05T08:00:00Z' },
      { patient_id: 'fp5', full_name: 'Rini Wulandari', nik: '3201010101870005', sex: 'female', age: 39, disease_type: 'hypertension', phone_number: '628167890123', companion_name: 'Dodi Wulandari', companion_phone: '628167890124', status: 'active', enrolled_at: '2025-04-10T08:00:00Z' },
    ],
    paging: { page: 1, size: 20, total_item: 5, total_page: 1 },
  }
}

function mockNakesDetail(id: string): NakesDetail {
  return {
    nakes_id: id,
    faskes_id: 'faskes-mock-001',
    full_name: 'Dr. Andi Wijaya, Sp.PD',
    role: 'dokter',
    nik: '3201010101800001',
    alamat: 'JL. SUDIRMAN NO. 5 RT 001 RW 003, KEL. CITARUM, KEC. BANDUNG WETAN, KOTA BANDUNG',
    phone_number: '628123456789',
    username: 'dr.andi',
    status: 'active',
    enrolled_at: '2025-01-10T08:00:00Z',
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2025-05-20T09:00:00Z',
  }
}

function mockFaskesPatientDetail(id: string): FaskesPatientDetail {
  return {
    patient_id: id,
    faskes_id: 'faskes-mock-001',
    assigned_nakes_id: 'n1',
    assigned_nakes_name: 'Dr. Andi Wijaya, Sp.PD',
    full_name: 'Ahmad Suharto',
    nik: '3201010101670001',
    date_of_birth: '1967-01-01',
    sex: 'male',
    age: 58,
    alamat: 'JL. MERDEKA NO. 10 RT 001 RW 002, KEL. SUKAJADI, KEC. BANDUNG WETAN, KOTA BANDUNG',
    phone_number: '628123456789',
    companion_name: 'Siti Suharto',
    companion_phone: '628123456780',
    disease_type: 'diabetes_t2',
    username: 'ahmad.suharto',
    status: 'active',
    enrolled_at: '2025-01-15T08:00:00Z',
    created_at: '2025-01-15T08:00:00Z',
    updated_at: '2025-06-01T10:00:00Z',
  }
}

function mockFaskesProfile(): FaskesProfile {
  return {
    faskes_id: 'faskes-mock-001',
    name: 'Puskesmas Coba',
    type: 'puskesmas',
    address: 'JL. MERDEKA NO. 1, BANDUNG',
    region: 'Bandung',
    username: 'puskesmas.coba',
    phone_number: '62222555666',
    status: 'active',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-06-01T00:00:00Z',
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


// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authFaskesApi = {
  login: async (username: string, password: string): Promise<FaskesLoginData> => {
    if (MOCK) return mockFaskesLogin()
    const res = await request<ApiEnvelope<FaskesLoginData>>(
      '/api/v1/faskes/auth/login',
      { method: 'POST', body: JSON.stringify({ username, password }) },
    )
    return res.data
  },

  register: async (body: RegisterFaskesBody): Promise<void> => {
    if (MOCK) return
    await request<ApiEnvelope<null>>(
      '/api/v1/faskes/auth/register',
      { method: 'POST', body: JSON.stringify(body) },
    )
  },
}

export const authNakesApi = {
  login: async (username: string, password: string): Promise<NakesLoginData> => {
    if (MOCK) return mockNakesLogin()
    const res = await request<ApiEnvelope<NakesLoginData>>(
      '/api/v1/nakes/auth/login',
      { method: 'POST', body: JSON.stringify({ username, password }) },
    )
    return res.data
  },
}

export const authApi = {
  refresh: async (refresh_token: string): Promise<TokenBundle> => {
    if (MOCK) return { access_token: 'mock.new.access', refresh_token: 'mock.new.refresh', expires_in: 900 }
    const res = await request<ApiEnvelope<TokenBundle>>(
      '/api/v1/auth/refresh',
      { method: 'POST', body: JSON.stringify({ refresh_token }) },
    )
    return res.data
  },

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
  /** GET /api/v1/faskes/nakes — requires faskes JWT */
  getNakes: async (): Promise<NakesItem[]> => {
    if (MOCK) return mockNakesList()
    const res = await request<ApiEnvelope<NakesItem[]>>('/api/v1/faskes/nakes')
    return res.data
  },

  /** POST /api/v1/faskes/nakes/register — requires faskes JWT */
  registerNakes: async (body: RegisterNakesBody): Promise<RegisterNakesResult> => {
    if (MOCK) {
      return {
        nakes_id: `nakes-${Date.now()}`,
        faskes_id: 'faskes-mock-001',
        full_name: body.full_name,
        role: body.role,
        nik: body.nik,
        enrolled_at: new Date().toISOString(),
      }
    }
    const res = await request<ApiEnvelope<RegisterNakesResult>>(
      '/api/v1/faskes/nakes/register',
      { method: 'POST', body: JSON.stringify(body) },
    )
    return res.data
  },

  /** POST /api/v1/faskes/nakes/register/ktp-ocr — requires faskes JWT, multipart */
  ocrKtp: async (file: File): Promise<OcrKtpResult> => {
    if (MOCK) return mockOcrResult()
    const form = new FormData()
    form.append('file', file)
    const res = await request<ApiEnvelope<OcrKtpResult>>(
      '/api/v1/faskes/nakes/register/ktp-ocr',
      { method: 'POST', body: form },
      true, // skip Content-Type so browser sets multipart boundary
    )
    return res.data
  },

  /** GET /api/v1/faskes/patients — requires faskes JWT */
  getPatients: async (page = 1, size = 20): Promise<FaskesPatientResponse> => {
    if (MOCK) return mockFaskesPatients()
    const envelope = await request<PaginatedEnvelope<FaskesPatientItem>>(
      `/api/v1/faskes/patients?page=${page}&size=${size}`,
    )
    return { data: envelope.data, paging: envelope.paging }
  },

  /** POST /api/v1/faskes/patients/register — requires faskes JWT */
  registerPatient: async (body: RegisterFaskesPatientBody): Promise<RegisterPatientResult> => {
    if (MOCK) {
      return {
        patient_id: `patient-${Date.now()}`,
        faskes_id: 'faskes-mock-001',
        full_name: body.full_name,
        nik: body.nik,
        disease_type: body.disease_type,
        enrolled_at: new Date().toISOString(),
      }
    }
    const res = await request<ApiEnvelope<RegisterPatientResult>>(
      '/api/v1/faskes/patients/register',
      { method: 'POST', body: JSON.stringify(body) },
    )
    return res.data
  },

  /** POST /api/v1/faskes/patients/register/ktp-ocr — requires faskes JWT, multipart */
  ocrKtpPatient: async (file: File): Promise<OcrKtpResult> => {
    if (MOCK) return mockOcrResult()
    const form = new FormData()
    form.append('file', file)
    const res = await request<ApiEnvelope<OcrKtpResult>>(
      '/api/v1/faskes/patients/register/ktp-ocr',
      { method: 'POST', body: form },
      true,
    )
    return res.data
  },

  /** GET /api/v1/faskes/nakes/{id} — requires faskes JWT */
  getNakesDetail: async (id: string): Promise<NakesDetail> => {
    if (MOCK) return mockNakesDetail(id)
    const res = await request<ApiEnvelope<NakesDetail>>(`/api/v1/faskes/nakes/${id}`)
    return res.data
  },

  /** GET /api/v1/faskes/patients/{id} — requires faskes JWT */
  getPatientDetail: async (id: string): Promise<FaskesPatientDetail> => {
    if (MOCK) return mockFaskesPatientDetail(id)
    const res = await request<ApiEnvelope<FaskesPatientDetail>>(`/api/v1/faskes/patients/${id}`)
    return res.data
  },

  /** GET /api/v1/faskes/profile — requires faskes JWT */
  getProfile: async (): Promise<FaskesProfile> => {
    if (MOCK) return mockFaskesProfile()
    const res = await request<ApiEnvelope<FaskesProfile>>('/api/v1/faskes/profile')
    return res.data
  },

  /** PATCH /api/v1/faskes/nakes/{id}/status — requires faskes JWT */
  updateNakesStatus: async (nakesId: string, status: NakesStatus): Promise<UpdateNakesStatusResult> => {
    if (MOCK) return { nakes_id: nakesId, full_name: '', status }
    const res = await request<ApiEnvelope<UpdateNakesStatusResult>>(
      `/api/v1/faskes/nakes/${nakesId}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
    )
    return res.data
  },
}

// ─── Nakes API ────────────────────────────────────────────────────────────────

export const nakesApi = {
  /** GET /api/v1/nakes/dashboard/summary — requires nakes JWT */
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    if (MOCK) return mockDashboardSummary()
    const res = await request<ApiEnvelope<DashboardSummary>>('/api/v1/nakes/dashboard/summary')
    return res.data
  },

  /** GET /api/v1/nakes/dashboard/patient-queue — requires nakes JWT */
  getPatientQueue: async (page = 1, size = 20): Promise<PatientQueueResponse> => {
    if (MOCK) return mockPatientQueue()
    const envelope = await request<PaginatedEnvelope<PatientQueueItem>>(
      `/api/v1/nakes/dashboard/patient-queue?page=${page}&size=${size}`,
    )
    return { data: envelope.data, paging: envelope.paging }
  },

  /** POST /api/v1/nakes/patients/register — requires nakes JWT */
  registerPatient: async (body: RegisterPatientBody): Promise<RegisterPatientResult> => {
    if (MOCK) {
      return {
        patient_id: `patient-${Date.now()}`,
        faskes_id: 'faskes-mock-001',
        full_name: body.full_name,
        nik: body.nik,
        disease_type: body.disease_type,
        enrolled_at: new Date().toISOString(),
      }
    }
    const res = await request<ApiEnvelope<RegisterPatientResult>>(
      '/api/v1/nakes/patients/register',
      { method: 'POST', body: JSON.stringify(body) },
    )
    return res.data
  },

  /** POST /api/v1/nakes/patients/register/ktp-ocr — requires nakes JWT, multipart */
  ocrKtp: async (file: File): Promise<OcrKtpResult> => {
    if (MOCK) return mockOcrResult()
    const form = new FormData()
    form.append('file', file)
    const res = await request<ApiEnvelope<OcrKtpResult>>(
      '/api/v1/nakes/patients/register/ktp-ocr',
      { method: 'POST', body: form },
      true,
    )
    return res.data
  },
}

// Re-export the PatientQueueItem type for narrowed import
import type { PatientQueueItem } from './types'
export type { PatientQueueItem }
