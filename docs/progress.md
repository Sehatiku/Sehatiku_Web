# Progress Sehatiku — 2026-06-28 (Sesi 9)

## Status Umum
FaskesDashboardPage sekarang modular (subcomponents per tab). Detail modal nakes dan pasien menggunakan `createPortal` ke `document.body` untuk full-screen blur (identik dengan logout modal). Toggle aktif/nonaktif nakes hanya ada di dalam NakesDetailDrawer — tidak ada lagi tombol di baris list.

## Checklist FE-0 (Landing Page)
- [x] Navbar sticky dengan glassmorphism, logo + navigasi + tombol Masuk
- [x] Hero section: headline, deskripsi, CTA buttons, stats, mockup dashboard animasi
- [x] Section Alur Kerja (Fitur): 3 fase cards
- [x] Section Aktor: Faskes card + Dokter card
- [x] Section Tentang/Stats: 3 kartu dampak + integrasi logos
- [x] Section Kontak/CTA
- [x] Footer

## Checklist Login (FE-0 Extended)
- [x] Layout full-screen 2-kolom: panel brand gelap + panel form
- [x] Role toggle (Faskes / Dokter)
- [x] Field username (bukan email — sesuai API contract)
- [x] Field Kata Sandi
- [x] Submit button dengan loading state + error banner
- [x] Enter key submit, ESC key tutup
- [x] POST /api/v1/faskes/auth/login atau POST /api/v1/nakes/auth/login
- [x] Error handling: 401, 429, 500
- [x] Faskes sub-toggle "Masuk" / "Daftar Faskes Baru"
- [x] Register form lengkap + POST /api/v1/faskes/auth/register
- [x] Dokter: hanya login + catatan "akun didaftarkan oleh faskes"

## Checklist API Layer
- [x] src/lib/types.ts — tipe domain strict dari API contract
- [x] src/lib/api.ts — fetch wrapper + semua endpoint yang sudah BE-ready
  - [x] authFaskesApi.login(), authFaskesApi.register()
  - [x] authNakesApi.login()
  - [x] authApi.refresh(), authApi.logout()
  - [x] faskesApi.getNakes(), faskesApi.registerNakes(), faskesApi.ocrKtp()
  - [x] faskesApi.getPatients() — GET /api/v1/faskes/patients
  - [x] faskesApi.getPatientDetail() — GET /api/v1/faskes/patients/{id}
  - [x] faskesApi.registerPatient() — POST /api/v1/faskes/patients/register (faskes JWT, includes assigned_nakes_id)
  - [x] faskesApi.ocrKtpPatient() — POST /api/v1/faskes/patients/register/ktp-ocr (faskes JWT)
  - [x] faskesApi.getNakesDetail() — GET /api/v1/faskes/nakes/{id}
  - [x] faskesApi.getProfile() — GET /api/v1/faskes/profile
  - [x] faskesApi.updateNakesStatus() — PATCH /api/v1/faskes/nakes/{id}/status
  - [x] nakesApi.getDashboardSummary(), nakesApi.getPatientQueue()
  - [x] nakesApi.registerPatient(), nakesApi.ocrKtp()
- [x] Mock mode: VITE_MOCK=true → fixture data identik shape
- [x] src/lib/utils.ts — formatting & validation utilities
- [x] src/auth/AuthContext.tsx — AuthProvider, useAuth()

## Checklist FE-1 (Faskes)
- [x] Login → screen Faskes Dashboard (via AuthContext)
- [x] Sidebar dark gradient (primary-800→900) — layout AppShell-like
- [x] Sidebar: konfirmasi logout (modal sebelum keluar)
- [x] Tab "Fase Pendaftaran": form pasien 11 field + OCR KTP + validasi inline
- [x] Tab "Fase Operasional": 4 KPI cards + antrian prioritas pasien
- [x] Tab "Notifikasi & Eskalasi": placeholder (endpoint belum tersedia)
- [x] Tab "Manajemen" (sub-tab "Tim Nakes"):
  - [x] Daftar nakes dari GET /api/v1/faskes/nakes
  - [x] Form registrasi nakes (NIK, nama, alamat, role, phone, username, password)
  - [x] Scan KTP OCR → POST /api/v1/faskes/nakes/register/ktp-ocr
  - [x] Submit → POST /api/v1/faskes/nakes/register (loading, error 409)
    - [x] Toggle aktif/nonaktif nakes → PATCH /api/v1/faskes/nakes/{id}/status + konfirmasi modal (hanya dari dalam NakesDetailDrawer)
- [x] Tab "Manajemen" (sub-tab "Daftar Pasien"):
  - [x] Tabel pasien dari GET /api/v1/faskes/patients
  - [x] Kolom: Nama, NIK, Usia/JK, Penyakit, Pendamping, Terdaftar, Status
  - [x] Pagination, loading state, error state, refresh button
- [x] Validasi form inline merah — semua field
- [x] Phone number wajib awalan 62 — auto-normalisasi "08..." → "62..." on blur
- [x] Color palette sesuai design system
- [ ] Detail Pasien: 4 tabs — belum dibuat
- [ ] Pengaturan Faskes — belum dibuat

## Checklist FE-2 (Dokter/Nakes)
- [x] Login Nakes → DokterDashboardPage (full dashboard)
- [x] VIEW 1 — Antrean Prioritas: master-detail split layout
- [x] VIEW 2 — Tren & Riwayat
- [x] VIEW 3 — Umpan Balik Model
- [ ] Daftar Pasien Saya, Detail Pasien — belum dibuat

## Checklist Bersama
- [x] RoleGuard / Page switching (faskes/nakes via AuthContext)
- [x] Logout konfirmasi modal sebelum memanggil onLogout()
- [x] Skeleton loader / error state / toast notifikasi semua aksi
- [ ] Routing setup (React Router) — belum dimulai
- [ ] Disclaimer skor di semua ScoreGauge

## Sedang Dikerjakan
- Tidak ada — semua permintaan sesi ini selesai

## Masalah / Bug yang Diketahui
- Phone field: jika submit tanpa blur (tanpa auto-normalisasi), nomor "08..." akan ditolak validasi

## Catatan Teknis
- **Modular architecture**: FaskesDashboardPage.tsx hanya berisi shell + sidebar + routing ke subcomponents di `src/pages/faskes/components/`
- **activeTab type**: `'pendaftaran' | 'operasional' | 'eskalasi' | 'dokter' | 'pasien'`
- **Sidebar**: dark gradient (primary-800→900), 5 item nav: Pendaftaran, Operasional, Eskalasi, Manajemen Nakes, Daftar Pasien
- **OperasionalTab prop**: setActiveTab bertipe `(tab: 'pendaftaran' | 'operasional' | 'eskalasi' | 'dokter' | 'pasien') => void`
- **RegisterFaskesPatientBody**: extends RegisterPatientBody + `assigned_nakes_id` (wajib, validated di form)
- **PendaftaranTab**: OCR → `faskesApi.ocrKtpPatient()`, submit → `faskesApi.registerPatient()` dengan `assigned_nakes_id`; nakes PJ kini field wajib dengan validasi
- **PatientDetailDrawer**: modal centered full-screen (`createPortal`), fetch `GET /faskes/patients/{id}` saat baris tabel diklik, tampil 4 seksi (Identitas/Kontak/Klinis/Akun)
- **NakesDetailDrawer**: modal centered full-screen (`createPortal`), fetch `GET /faskes/nakes/{id}` saat baris list diklik, tombol toggle status di dalam drawer (satu-satunya akses ke konfirmasi toggle)
- **Types baru**: `NakesDetail`, `FaskesPatientDetail`, `FaskesProfile`, `RegisterFaskesPatientBody`

## File yang Diubah di Sesi Ini
- `src/lib/types.ts` — tambah NakesDetail, FaskesPatientDetail, FaskesProfile, RegisterFaskesPatientBody
- `src/lib/api.ts` — tambah faskesApi.registerPatient(), ocrKtpPatient(), getNakesDetail(), getPatientDetail(), getProfile()
- `src/pages/faskes/components/PendaftaranTab.tsx` — ganti ke faskesApi, normalizePhone untuk validasi, assigned_nakes_id wajib
- `src/pages/faskes/components/NakesTab.tsx` — tambah NakesDetailDrawer, hapus tombol toggle dari baris list
- `src/pages/faskes/components/PasienTab.tsx` — tambah PatientDetailDrawer, klik baris → detail modal
- `src/pages/faskes/components/NakesDetailDrawer.tsx` — modal baru via createPortal, tombol toggle di dalamnya
- `src/pages/faskes/components/PatientDetailDrawer.tsx` — modal baru via createPortal
- `src/pages/faskes/components/OperasionalTab.tsx` — hapus props yang tidak terpakai (fix TS6133)
- `src/pages/faskes/FaskesDashboardPage.tsx` — hapus props OperasionalTab yang tidak valid
- `docs/progress.md` — update snapshot
