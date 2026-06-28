# fe_implementation.md — Sehatiku Web (React + Vite + TypeScript + Tailwind)

> Plan implementasi **Sehatiku Web Dashboard** — aplikasi web untuk dua role:
> **Faskes** (admin klinik/puskesmas) dan **Dokter/Nakes** (PIC Prolanis).
> Platform pasien (mobile app) ada di repo terpisah. TIDAK ada halaman pasien di sini.
> Semua tipe data mengacu kontrak API — JANGAN buat field di luar kontrak.

---

## 0. Stack

| Concern | Pilihan | Catatan |
|---|---|---|
| Bundler | **Vite** | `npm create vite@latest -- --template react-ts` |
| UI framework | **React 18 + TypeScript** | strict mode on |
| Styling | **Tailwind CSS v3** | + CSS variables untuk token warna |
| Routing | **react-router-dom v6** | createBrowserRouter |
| Server state | **TanStack Query v5** | cache, loading, refetch |
| Form | **react-hook-form** + inline validasi | |
| HTTP | `fetch` wrapper tipis di `lib/api.ts` | |
| Chart | **recharts** | TrendLine, BarChart faktor |
| Icons | **lucide-react** | |
| Fonts | Plus Jakarta Sans + IBM Plex Mono | via Google Fonts di `index.html` |

---

## 1. Struktur Proyek

```
sehatiku-web/
├── index.html
├── vite.config.ts
├── tailwind.config.ts          ← token warna dari DESIGN.md §3
├── tsconfig.json
├── .env.local                  ← VITE_API_URL, VITE_MOCK
│
└── src/
    ├── main.tsx
    ├── App.tsx                 ← router root
    ├── styles/
    │   └── globals.css         ← @tailwind directives + :root CSS vars
    │
    ├── lib/
    │   ├── api.ts              ← fetch wrapper, envelope unwrap, JWT header
    │   ├── types.ts            ← SATU sumber tipe domain
    │   └── utils.ts            ← formatSkor, formatDate, skorToStatus, dll
    │
    ├── auth/
    │   ├── AuthContext.tsx     ← token, user, login(), logout()
    │   ├── ProtectedRoute.tsx  ← redirect ke /login jika no token
    │   └── RoleGuard.tsx       ← redirect jika role tidak sesuai
    │
    ├── components/
    │   ├── ui/                 ← komponen primitif, tidak ada logika bisnis
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── Select.tsx
    │   │   ├── Textarea.tsx
    │   │   ├── Modal.tsx
    │   │   ├── Toast.tsx       ← + ToastContext
    │   │   ├── Badge.tsx
    │   │   ├── StatusPill.tsx
    │   │   ├── Avatar.tsx
    │   │   ├── Skeleton.tsx
    │   │   ├── EmptyState.tsx
    │   │   └── NumericInput.tsx ← input angka klinis (GD, tensi, BB, dll)
    │   │
    │   ├── charts/
    │   │   ├── ScoreGauge.tsx  ← arc SVG 180°, skor 0–100
    │   │   ├── TrendLine.tsx   ← recharts LineChart (skor + GD + tensi)
    │   │   └── FactorBar.tsx   ← SHAP attribution bar horizontal
    │   │
    │   ├── layout/
    │   │   ├── AppShell.tsx    ← Sidebar + Topbar + <Outlet />
    │   │   ├── Sidebar.tsx     ← nav dinamis per role
    │   │   ├── Topbar.tsx      ← judul, badge eskalasi, notif, profil
    │   │   └── PageHead.tsx    ← judul halaman + slot aksi kanan
    │   │
    │   └── domain/             ← komponen dengan logika bisnis
    │       ├── EscalationCard.tsx
    │       ├── PatientRow.tsx
    │       ├── KpiCard.tsx
    │       └── OcrKtpUploader.tsx
    │
    └── pages/
        ├── auth/
        │   └── LoginPage.tsx
        │
        ├── faskes/             ← hanya role: faskes
        │   ├── FaskesDashboardPage.tsx
        │   ├── DoctorListPage.tsx
        │   ├── DoctorDetailPage.tsx
        │   ├── PatientListPage.tsx     ← semua pasien lintas dokter
        │   ├── PatientDetailPage.tsx
        │   └── FaskesSettingsPage.tsx
        │
        └── dokter/             ← hanya role: dokter | nakes
            ├── DokterDashboardPage.tsx
            ├── MyPatientListPage.tsx   ← pasien milik dokter ini saja
            ├── PatientDetailPage.tsx   ← reuse komponen, data scope beda
            ├── EscalationQueuePage.tsx
            └── EscalationHistoryPage.tsx
```

---

## 2. Routing (`App.tsx`)

```tsx
createBrowserRouter([
  { path: '/login', element: <LoginPage /> },

  // Faskes shell
  {
    path: '/faskes',
    element: (
      <ProtectedRoute>
        <RoleGuard allow={['faskes']}>
          <AppShell role="faskes" />
        </RoleGuard>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',   element: <FaskesDashboardPage /> },
      { path: 'doctors',     element: <DoctorListPage /> },
      { path: 'doctors/:id', element: <DoctorDetailPage /> },
      { path: 'patients',    element: <PatientListPage /> },
      { path: 'patients/:id',element: <PatientDetailPage /> },
      { path: 'settings',    element: <FaskesSettingsPage /> },
    ],
  },

  // Dokter shell
  {
    path: '/dokter',
    element: (
      <ProtectedRoute>
        <RoleGuard allow={['dokter', 'nakes']}>
          <AppShell role="dokter" />
        </RoleGuard>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',          element: <DokterDashboardPage /> },
      { path: 'patients',           element: <MyPatientListPage /> },
      { path: 'patients/:id',       element: <PatientDetailPage /> },
      { path: 'escalations',        element: <EscalationQueuePage /> },
      { path: 'escalations/history',element: <EscalationHistoryPage /> },
    ],
  },

  // Root redirect berdasarkan role
  { path: '/', element: <RootRedirect /> },
  { path: '*', element: <Navigate to="/" replace /> },
])
```

---

## 3. Types (`lib/types.ts`)

```ts
// === Auth ===
export type Role = 'faskes' | 'dokter' | 'nakes';

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
  faskes_id: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// === Domain ===
export type RiskStatus = 'aman' | 'waswas' | 'bahaya';
export type DiseaseType = 'diabetes' | 'hipertensi' | 'keduanya';
export type EscalationResult = 'tepat' | 'tidak_tepat' | null;

export interface Patient {
  id: string;
  name: string;
  nik: string;
  birth_date: string;
  address: string;
  phone: string;
  disease_type: DiseaseType;
  faskes_id: string;
  doctor_id: string;
  doctor_name?: string;
  enrolled_at: string;
  is_family_mode: boolean;
}

export interface Nakes {
  id: string;
  name: string;
  nik: string;
  role: 'dokter' | 'nakes';
  faskes_id: string;
  phone: string;
  patient_count: number;
}

export interface ClinicalBaseline {
  id: string;
  patient_id: string;
  hba1c?: number;
  cholesterol_total?: number;
  egfr?: number;
  uacr?: number;
  bmi?: number;
  waist_cm?: number;
  bp_systolic_baseline?: number;
  bp_diastolic_baseline?: number;
  recorded_at: string;
  recorded_by: string;
}

export interface DailyLog {
  id: string;
  patient_id: string;
  log_date: string;
  blood_glucose?: number;
  glucose_tag?: 'puasa' | 'sebelum_makan' | '2jam_setelah_makan' | 'sewaktu';
  bp_systolic?: number;
  bp_diastolic?: number;
  weight_kg?: number;
  medication_adherence: boolean;
  meal_category: 'sangat_sehat' | 'sehat' | 'cukup' | 'kurang_sehat';
  physical_activity_30min: boolean;
  sleep_hours: number;
  stress_level: 1 | 2 | 3;
  smoking: boolean;
  alcohol: boolean;
  submitted_at: string;
}

export interface RiskFactor {
  feature: string;
  contribution: number; // 0–1
  direction: 'naik' | 'turun';
}

export interface RiskScore {
  id: string;
  patient_id: string;
  score_date: string;
  score: number; // 0–100
  status: RiskStatus;
  model_type: 'rule_based' | 'cohort_ml';
  top_factors: RiskFactor[];
  recommendation: string[];
  escalated: boolean;
  escalation_id?: string;
}

export interface Escalation {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_disease: DiseaseType;
  risk_score: number;
  risk_status: RiskStatus;
  top_factors: RiskFactor[];
  escalated_at: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
  result: EscalationResult;
  notes?: string;
}

export interface TrendPoint {
  date: string;
  score?: number;
  blood_glucose?: number;
  bp_systolic?: number;
}

// === Dashboard Faskes ===
export interface FaskesDashboard {
  total_patients: number;
  total_doctors: number;
  active_escalations: number;
  avg_risk_score: number;
  logging_adherence_pct: number;
  score_distribution: { aman: number; waswas: number; bahaya: number };
  recent_escalations: Escalation[];
}

// === Dashboard Dokter ===
export interface DokterDashboard {
  my_patient_count: number;
  active_escalations: number;
  avg_risk_score: number;
  logging_adherence_pct: number;
  escalation_queue: Escalation[];
}
```

---

## 4. lib/api.ts

```ts
const BASE = import.meta.env.VITE_API_URL as string;
const MOCK = import.meta.env.VITE_MOCK === 'true';

function getToken() {
  return localStorage.getItem('token');
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  if (MOCK) return mockResponse<T>(path, init); // stub sampai BE siap

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...init?.headers,
    },
  });

  const json = await res.json();
  if (!res.ok) throw json; // biarkan React Query tangkap
  return json.data as T;  // unwrap envelope {success, data}
}

// Helpers per resource
export const authApi = {
  login: (body: { email: string; password: string }) =>
    api<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
};

export const faskesApi = {
  dashboard: () => api<FaskesDashboard>('/faskes/dashboard'),
  doctors: (q?: string) => api<Nakes[]>(`/faskes/doctors?search=${q ?? ''}`),
  addDoctor: (body: Partial<Nakes>) =>
    api<Nakes>('/faskes/doctors', { method: 'POST', body: JSON.stringify(body) }),
  patients: (q?: string, disease?: string) =>
    api<Patient[]>(`/faskes/patients?search=${q ?? ''}&disease_type=${disease ?? ''}`),
  addPatient: (body: Partial<Patient>) =>
    api<Patient>('/faskes/patients', { method: 'POST', body: JSON.stringify(body) }),
};

export const dokterApi = {
  dashboard: () => api<DokterDashboard>('/dokter/dashboard'),
  myPatients: (q?: string) => api<Patient[]>(`/dokter/patients?search=${q ?? ''}`),
  escalationQueue: () => api<Escalation[]>('/dokter/escalations?status=active'),
  escalationHistory: () => api<Escalation[]>('/dokter/escalations?status=done'),
  feedbackEscalation: (id: string, result: EscalationResult, notes?: string) =>
    api<Escalation>(`/escalations/${id}/feedback`, {
      method: 'PATCH',
      body: JSON.stringify({ result, notes }),
    }),
};

export const patientApi = {
  detail: (id: string) => api<Patient>(`/patients/${id}`),
  logs: (id: string, from?: string, to?: string) =>
    api<DailyLog[]>(`/patients/${id}/logs?from=${from ?? ''}&to=${to ?? ''}`),
  scores: (id: string) => api<RiskScore[]>(`/patients/${id}/scores`),
  trend: (id: string) => api<TrendPoint[]>(`/patients/${id}/trend`),
  baselines: (id: string) => api<ClinicalBaseline[]>(`/patients/${id}/baselines`),
  addBaseline: (id: string, body: Partial<ClinicalBaseline>) =>
    api<ClinicalBaseline>(`/patients/${id}/baselines`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

export const ocrApi = {
  scanKtp: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return fetch(`${BASE}/integrations/ocr/ktp`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: form,
    }).then(r => r.json()).then(r => r.data as OcrKtpResult);
  },
};

export interface OcrKtpResult {
  nik: string;
  name: string;
  birth_date: string;
  address: string;
  confidence: number;
}
```

---

## 5. lib/utils.ts

```ts
export function skorToStatus(score: number): HealthStatus {
  if (score >= 70) return 'sehat';
  if (score >= 40) return 'waswas';
  return 'parah';
}

export function formatSkor(score: number) {
  return score.toFixed(1);
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));
}

export function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
```

---

## 6. tailwind.config.ts

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EEEFFE',
          100: '#D6D9FD',
          200: '#ABAEF9',
          500: '#5B6BF0',
          600: '#4857D8',
          700: '#3645B4',
          800: '#262F8A',
          900: '#1A2066',
        },
        teal: {
          50:       '#E5FBF6',
          100:      '#BDFAEA',
          DEFAULT:  '#1EC8A5',
          600:      '#16A98C',
        },
        neutral: {
          0:   '#FFFFFF',
          50:  '#F7F8FA',
          100: '#EEF0F5',
          200: '#DCDFE8',
          400: '#8A93A1',
          500: '#636B78',
          700: '#2B2D42',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      fontSize: {
        'kpi': ['26px', { fontWeight: '700' }],
        'score': ['48px', { fontWeight: '700', fontFamily: 'IBM Plex Mono' }],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

---

## 7. Pembagian Kerja

| | FE-1 | FE-2 |
|---|---|---|
| Owner | Shell, auth, AppShell, Sidebar, Topbar, **Faskes** (dashboard, manajemen dokter, manajemen pasien, settings) | **Dokter** (dashboard, daftar pasien saya, detail pasien, antrean eskalasi, riwayat eskalasi) |
| Shared | `lib/`, `components/ui/`, `components/charts/`, `components/layout/`, `components/domain/` — setup bersama jam 0–2 |

> **Jam 0–2 (setup bersama):** init Vite, Tailwind config, `lib/types.ts`,
> komponen UI (`Button`, `Input`, `Modal`, `StatusPill`, `ScoreGauge`, `TrendLine`,
> `FactorBar`, `EscalationCard`, `KpiCard`), `AuthContext`, `AppShell`.

---

## 8. Halaman Detail — Faskes

### 8.1 Login (`/login`)
Form: `email` + `password` → `authApi.login()` → simpan token + user ke
`AuthContext` + `localStorage` → redirect ke `/faskes` atau `/dokter`
sesuai `user.role`.
- Tidak ada pilihan role di form. Role ditentukan dari response backend.

### 8.2 Dashboard Faskes (`/faskes/dashboard`)
`useQuery(['faskes-dashboard'], faskesApi.dashboard)`

**4 KpiCard:**
| Label | Field | Warna ikon |
|---|---|---|
| Total Pasien | `total_patients` | primary |
| Total Dokter | `total_doctors` | teal |
| Eskalasi Aktif | `active_escalations` | danger |
| Rata Skor Kesehatan | `avg_health_score` | primary |

**Score Distribution:** 3 angka sehat/waswas/parah sebagai badge pill + angka.

**Eskalasi Terbaru:** list 5 `EscalationCard` teratas (preview, link ke `/faskes/patients/:id`).

### 8.3 Manajemen Dokter (`/faskes/doctors`)
`useQuery(['doctors'], () => faskesApi.doctors(search))`

**Tabel:**
| Kolom | Field |
|---|---|
| Nama | `name` + avatar inisial |
| NIK | `nik` (mono) |
| Role | badge `dokter` / `nakes` |
| Pasien Ditangani | `patient_count` |
| Aksi | Detail · Edit |

- Tombol **"+ Tambah Dokter"** → modal form.
- Search box.

**Modal Tambah Dokter** (`POST /faskes/doctors`):

| Field | Input | Validasi |
|---|---|---|
| `nik` | text | 16 digit, wajib |
| `name` | text | wajib |
| `role` | select | dokter / nakes |
| `phone` | text | format Indonesia |

**Tombol "Scan KTP"** di atas form → `ocrApi.scanKtp()` → auto-fill `nik`, `name`.
Badge "Diisi via OCR" + confidence. Tetap bisa edit manual.

### 8.4 Detail Dokter (`/faskes/doctors/:id`)
- Info nakes (nama, NIK, role, telepon).
- Daftar pasien yang ditangani dokter ini → tabel mini (nama, penyakit, skor hari ini).
- Tombol Edit profil.

### 8.5 Manajemen Pasien Faskes (`/faskes/patients`)
`useQuery(['faskes-patients'], () => faskesApi.patients(search, disease))`

**Tabel:**
| Kolom | Field |
|---|---|
| Nama | `name` + avatar |
| NIK | `nik` (mono) |
| Penyakit | `disease_type` badge |
| Dokter | `doctor_name` |
| Skor Hari Ini | angka mono + StatusPill |
| Aksi | Detail |

- Search, filter `disease_type`.
- Tombol **"+ Tambah Pasien"** → modal form (sama persis dengan §FE-2 Faskes, lihat §8.6).

### 8.6 Modal Tambah Pasien
`POST /faskes/patients`

| Field | Input | Validasi |
|---|---|---|
| `nik` | text | 16 digit, wajib |
| `name` | text | wajib |
| `birth_date` | date | wajib |
| `address` | textarea | — |
| `phone` | text | format Indonesia |
| `disease_type` | select | diabetes / hipertensi / keduanya |
| `doctor_id` | select (dari `GET /faskes/doctors`) | wajib |
| `is_family_mode` | toggle | Ya / Tidak |

**Tombol "Scan KTP"** → auto-fill `nik`, `name`, `birth_date`, `address`.
Tangani 409 (NIK duplikat) → error inline.
Setelah sukses → backend trigger WhatsApp ke pasien.

### 8.7 Detail Pasien (`/faskes/patients/:id`)
Komponen `PatientDetailPage` — shared antara faskes dan dokter, data scope dibedakan dari API.

**Tabs:**

**Ringkasan:**
- Info pasien + dokter penanggung jawab.
- `ScoreGauge` besar (skor hari ini) + disclaimer.
- `TrendLine` 30 hari (skor + GD + tensi).
- Panel `FactorBar` 3 faktor teratas.

**Log Harian:**
`GET /patients/:id/logs?from=&to=` → tabel:
Tanggal · GD · Tag · Tensi · BB · Obat · Makan · Aktivitas · Tidur · Stres · Rokok/Alkohol.
Filter range tanggal (date picker `from`–`to`).

**Baseline Klinis:**
`GET /patients/:id/baselines` → tabel: Tanggal · HbA1c · Kolesterol · eGFR · UACR · BMI · BB Lingkar · Tensi Baseline · Diinput oleh.
Tombol **"+ Input Baseline Baru"** → modal form (field dari `ClinicalBaseline`, kecuali `id` dan `patient_id`).

**Eskalasi:**
`GET /patients/:id/escalations` → list riwayat: Tanggal · Skor · Status · Faktor · Ditangani oleh · Hasil feedback.

### 8.8 Pengaturan Faskes (`/faskes/settings`)
- Info faskes (nama, tipe, alamat) — form edit.
- Tidak ada fitur user management dokter di sini (sudah di halaman Manajemen Dokter).

---

## 9. Halaman Detail — Dokter

### 9.1 Dashboard Dokter (`/dokter/dashboard`)
`useQuery(['dokter-dashboard'], dokterApi.dashboard)`

**4 KpiCard:**
| Label | Field | Warna ikon |
|---|---|---|
| Pasien Saya | `my_patient_count` | primary |
| Eskalasi Aktif | `active_escalations` | danger |
| Rata Skor | `avg_health_score` | primary |
| Kepatuhan Logging | `logging_adherence_pct` % | teal |

**Antrean Eskalasi (preview 5):** list `EscalationCard` + tombol "Lihat Semua" → `/dokter/escalations`.

### 9.2 Daftar Pasien Saya (`/dokter/patients`)
`useQuery(['my-patients'], () => dokterApi.myPatients(search))`

Tabel identik dengan §8.5 tapi hanya pasien milik dokter yang login.
Tidak ada tombol tambah pasien (penambahan pasien hanya via faskes).

### 9.3 Detail Pasien Dokter (`/dokter/patients/:id`)
Komponen `PatientDetailPage` yang sama (§8.7). Akses data via `/patients/:id/*` —
backend sudah scope ke pasien milik dokter ini saja (atau return 403).

Tambahan khusus dokter: tombol **"Input Baseline Klinis"** tampil (faskes juga bisa).

### 9.4 Antrean Eskalasi (`/dokter/escalations`)
`useQuery(['escalation-queue'], dokterApi.escalationQueue, { refetchInterval: 60_000 })`

Auto-refresh tiap 60 detik (polling ringan). Badge di topbar juga ikut update.

**Layout:** grid kartu `EscalationCard` terurut `risk_score` DESC.

Per kartu:
- Avatar + nama pasien + badge penyakit.
- `ScoreGauge` kecil (80px) + StatusPill.
- `FactorBar` 2–3 faktor teratas.
- Timestamp eskalasi.
- Tombol **"Hubungi"** (primary) → tandai `acknowledged_at` → muncul tombol feedback.
- Tombol **"✓ Tepat"** (teal ghost) + **"✗ Tidak Tepat"** (red ghost).
  - Submit `dokterApi.feedbackEscalation(id, result)`.
  - Kartu pindah ke riwayat.

Filter: `health_status` (semua / waswas / parah).

### 9.5 Riwayat Eskalasi (`/dokter/escalations/history`)
`useQuery(['escalation-history'], dokterApi.escalationHistory)`

Tabel:
| Kolom | Field |
|---|---|
| Tanggal | `escalated_at` |
| Pasien | `patient_name` |
| Skor | `health_score` + StatusPill |
| Faktor Utama | `top_factors[0].feature` |
| Ditangani | `acknowledged_at` |
| Hasil | `result` badge (tepat hijau / tidak tepat merah / — abu) |

Filter range tanggal. Klik baris → detail pasien.

---

## 10. Komponen Detail

### ScoreGauge (`components/charts/ScoreGauge.tsx`)
```tsx
interface Props {
  score: number;   // 0–100
  size?: 'sm' | 'md' | 'lg'; // 80px / 120px / 180px
  showDisclaimer?: boolean;   // default true
}
// SVG arc 180°, stroke-dasharray berdasarkan score
// Warna: ≤35 teal, ≤65 amber, >65 red
// Angka: font-mono, center of arc
// StatusPill di bawah
// Disclaimer italic 12px jika showDisclaimer
```

### TrendLine (`components/charts/TrendLine.tsx`)
```tsx
interface Props {
  data: TrendPoint[];
  metrics: ('score' | 'blood_glucose' | 'bp_systolic')[];
  height?: number; // default 200
}
// recharts ComposedChart
// Line score → primary-500
// Line blood_glucose → teal
// Line bp_systolic → purple (bisa extend later)
// ReferenceLine untuk ambang klinis (opsional)
// Tooltip custom: tanggal + nilai tiap metrik
```

### EscalationCard (`components/domain/EscalationCard.tsx`)
```tsx
interface Props {
  escalation: Escalation;
  onHubungi: (id: string) => void;
  onFeedback: (id: string, result: EscalationResult) => void;
  acknowledged: boolean;
}
```

### KpiCard (`components/domain/KpiCard.tsx`)
```tsx
interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: 'primary' | 'teal' | 'danger' | 'amber';
  sub?: string; // teks kecil bawah value
}
```

---

## 11. Auth Flow

```
/login
  → authApi.login()
  → simpan { token, user } ke localStorage + AuthContext
  → redirect berdasarkan user.role:
      faskes  → /faskes/dashboard
      dokter  → /dokter/dashboard
      nakes   → /dokter/dashboard  (same shell)

ProtectedRoute:
  → cek token di localStorage
  → jika tidak ada → redirect /login

RoleGuard (allow: Role[]):
  → cek user.role dari AuthContext
  → jika tidak cocok → redirect ke dashboard role-nya (bukan /login)

Logout:
  → hapus localStorage
  → clear AuthContext
  → redirect /login
```

---

## 12. Mode Mock

`.env.local`:
```
VITE_API_URL=http://localhost:8080
VITE_MOCK=true
```

`lib/api.ts` punya `mockResponse<T>()` yang mengembalikan fixture JSON persis
sesuai tipe di `lib/types.ts`. Saat BE siap, set `VITE_MOCK=false` — shape
sudah identik, tidak ada perubahan komponen.

---

## 13. Definition of Done

**FE-1 (Faskes):**
- [ ] Login → token → redirect `/faskes/dashboard`.
- [ ] Dashboard: 4 KPI + score distribution + 5 eskalasi terbaru.
- [ ] Manajemen Dokter: tabel, search, tambah (+ OCR KTP), detail.
- [ ] Manajemen Pasien: tabel, search, filter, tambah (+ OCR KTP), detail.
- [ ] Detail Pasien: 4 tabs berfungsi (Ringkasan, Log, Baseline, Eskalasi).
- [ ] Pengaturan Faskes: form edit info faskes.

**FE-2 (Dokter):**
- [ ] Dashboard: 4 KPI + antrean preview.
- [ ] Daftar Pasien Saya: tabel, search, klik → detail.
- [ ] Detail Pasien: tabs + input baseline klinis baru.
- [ ] Antrean Eskalasi: kartu grid, auto-refresh 60s, badge topbar.
- [ ] Feedback eskalasi: Hubungi → Tepat/Tidak Tepat → kartu pindah ke riwayat.
- [ ] Riwayat Eskalasi: tabel + filter tanggal.

**Bersama:**
- [ ] `RoleGuard` berfungsi — faskes tidak bisa akses `/dokter/*` dan sebaliknya.
- [ ] Skeleton loader di semua data async.
- [ ] Error state dengan pesan + tombol "Coba Lagi".
- [ ] Toast notifikasi untuk semua aksi (sukses / error).
- [ ] Disclaimer skor tampil di semua ScoreGauge.
- [ ] Tampil benar di ≥ 1024px (desktop). Tidak ada optimasi mobile.