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

let currentMockNakes: NakesItem[] = [
  { nakes_id: 'n1', full_name: 'Dr. Andi Wijaya, Sp.PD', role: 'dokter', username: 'dr.andi', phone_number: '628123456789', status: 'active', enrolled_at: '2025-01-10T08:00:00Z' },
  { nakes_id: 'n2', full_name: 'Dr. Budi Santoso, Sp.JP', role: 'dokter', username: 'dr.budi', phone_number: '628134567890', status: 'active', enrolled_at: '2025-02-05T08:00:00Z' },
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
    { patient_id: 'fp1', full_name: 'Ahmad Suharto', nik: '3201010101670001', sex: 'male', age: 58, disease_type: 'diabetes_t2', phone_number: '628123456789', companion_name: 'Siti Suharto', companion_phone: '628123456780', status: 'active', enrolled_at: '2025-01-15T08:00:00Z' },
    { patient_id: 'fp2', full_name: 'Siti Rahayu', nik: '3201010101620002', sex: 'female', age: 62, disease_type: 'hypertension', phone_number: '628134567890', companion_name: 'Budi Rahayu', companion_phone: '628134567891', status: 'active', enrolled_at: '2025-02-01T08:00:00Z' },
    { patient_id: 'fp3', full_name: 'Budi Santoso', nik: '3201010101790003', sex: 'male', age: 45, disease_type: 'both', phone_number: '628145678901', companion_name: 'Maya Santoso', companion_phone: '628145678902', status: 'active', enrolled_at: '2025-02-20T08:00:00Z' },
    { patient_id: 'fp4', full_name: 'Maya Kusuma', nik: '3201010101720004', sex: 'female', age: 52, disease_type: 'diabetes_t2', phone_number: '628156789012', companion_name: 'Rudi Kusuma', companion_phone: '628156789013', status: 'inactive', enrolled_at: '2025-03-05T08:00:00Z' },
    { patient_id: 'fp5', full_name: 'Rini Wulandari', nik: '3201010101870005', sex: 'female', age: 39, disease_type: 'hypertension', phone_number: '628167890123', companion_name: 'Dodi Wulandari', companion_phone: '628167890124', status: 'active', enrolled_at: '2025-04-10T08:00:00Z' },
    { patient_id: 'fp6', full_name: 'Hendra Wijaya', nik: '3201010101880006', sex: 'male', age: 41, disease_type: 'diabetes_t2', phone_number: '628178901234', companion_name: 'Dewi Wijaya', companion_phone: '628178901235', status: 'active', enrolled_at: '2025-04-12T08:00:00Z' },
    { patient_id: 'fp7', full_name: 'Dewi Lestari', nik: '3201010101890007', sex: 'female', age: 35, disease_type: 'hypertension', phone_number: '628189012345', companion_name: 'Adi Lestari', companion_phone: '628189012346', status: 'active', enrolled_at: '2025-04-15T08:00:00Z' },
    { patient_id: 'fp8', full_name: 'Joko Widodo', nik: '3201010101900008', sex: 'male', age: 64, disease_type: 'both', phone_number: '628190123456', companion_name: 'Iriana Widodo', companion_phone: '628190123457', status: 'active', enrolled_at: '2025-04-20T08:00:00Z' },
    { patient_id: 'fp9', full_name: 'Susilo Bambang', nik: '3201010101910009', sex: 'male', age: 72, disease_type: 'diabetes_t2', phone_number: '628191234567', companion_name: 'Ani Bambang', companion_phone: '628191234568', status: 'active', enrolled_at: '2025-04-22T08:00:00Z' },
    { patient_id: 'fp10', full_name: 'Megawati Soekarno', nik: '3201010101920010', sex: 'female', age: 75, disease_type: 'hypertension', phone_number: '628192345678', companion_name: 'Taufiq Kiemas', companion_phone: '628192345679', status: 'active', enrolled_at: '2025-04-25T08:00:00Z' },
    { patient_id: 'fp11', full_name: 'Abdurrahman Wahid', nik: '3201010101930011', sex: 'male', age: 60, disease_type: 'both', phone_number: '628193456789', companion_name: 'Sinta Wahid', companion_phone: '628193456790', status: 'active', enrolled_at: '2025-04-28T08:00:00Z' },
    { patient_id: 'fp12', full_name: 'Habibie Bacharuddin', nik: '3201010101940012', sex: 'male', age: 80, disease_type: 'diabetes_t2', phone_number: '628194567890', companion_name: 'Ainun Habibie', companion_phone: '628194567891', status: 'inactive', enrolled_at: '2025-05-01T08:00:00Z' },
    { patient_id: 'fp13', full_name: 'Soeharto Tjokro', nik: '3201010101950013', sex: 'male', age: 82, disease_type: 'hypertension', phone_number: '628195678901', companion_name: 'Ibu Tien', companion_phone: '628195678902', status: 'active', enrolled_at: '2025-05-03T08:00:00Z' },
    { patient_id: 'fp14', full_name: 'Soekarno Hatta', nik: '3201010101960014', sex: 'male', age: 70, disease_type: 'both', phone_number: '628196789012', companion_name: 'Fatmawati Soekarno', companion_phone: '628196789013', status: 'active', enrolled_at: '2025-05-05T08:00:00Z' },
    { patient_id: 'fp15', full_name: 'Prabowo Subianto', nik: '3201010101970015', sex: 'male', age: 74, disease_type: 'diabetes_t2', phone_number: '628197890123', companion_name: 'Titiek Subianto', companion_phone: '628197890124', status: 'active', enrolled_at: '2025-05-10T08:00:00Z' },
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
      }
      currentMockNakes.push(newNakes)
      return {
        nakes_id: newNakesId, faskes_id: 'faskes-mock-001',
        full_name: body.full_name, role: body.role, nik: body.nik,
        enrolled_at: newNakes.enrolled_at,
        credentials: { username: body.username, password: body.password },
        wa_warmup: { bot_phone: '', nakes_link: '', status: 'unavailable' },
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
      return {
        patient_id: id, faskes_id: 'faskes-mock-001',
        assigned_nakes_id: 'nakes-mock-001', assigned_nakes_name: 'Dr. Mock Nakes',
        full_name: 'Pasien Mock', nik: '3201234567890002',
        date_of_birth: '1970-05-15', sex: 'male', age: 55,
        alamat: 'Jl. Pasien No. 2', phone_number: '6281234567891',
        companion_name: 'Pendamping Mock', companion_phone: '6281234567892',
        disease_type: 'diabetes_t2', username: 'pasien.mock', status: 'active',
        enrolled_at: '2025-02-01T00:00:00Z', created_at: '2025-02-01T00:00:00Z', updated_at: '2025-02-01T00:00:00Z',
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
      return {
        id: `consult-${Date.now()}`, patient_id: 'patient-mock-001',
        complaint: body.complaint, status: 'open',
        created_at: new Date().toISOString(),
      }
    }
    const res = await request<ApiEnvelope<ConsultationResult>>(
      '/api/v1/patients/consultations',
      { method: 'POST', body: JSON.stringify(body) },
    )
    return res.data
  },
}

// Re-export for convenience
export type { PatientQueueItem }
