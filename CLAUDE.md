# CLAUDE.md — Panduan Proyek Sehatiku Web Dashboard

## 📁 Baca Dulu Sebelum Mulai

Setiap sesi baru, baca file-file ini **sebelum** menyentuh kode apapun:

### Dokumentasi di `/docs/`
Baca **semua file `.md`** di folder `docs/`, terutama:
- `docs/progress.md` — kondisi dan progres proyek terkini
- `docs/DESIGN.md` — design system lengkap (warna, tipografi, komponen, layout)
- `docs/fe_implementation.md` — arsitektur FE, routing, types, API, halaman

### Aset Visual
- `docs/Color_palette.png` — referensi visual palet warna. **Wajib lihat** sebelum menyentuh UI/styling.
- `docs/logo sehatiku.png` — logo resmi. **Wajib selalu gunakan file logo ini (atau import LogoImg dari components/ui/Icons.tsx) untuk semua tampilan dashboard, navbar, login, dsb. Jangan pernah membuat SVG/desain logo tersendiri.**

---

## 🔌 Aturan Integrasi API — WAJIB Diikuti

> Kontrak lengkap ada di `docs/API_Contract.md`. Ini aturan kapan dan bagaimana melakukan integrasi.

1. **Selalu integrasikan ketika kedua sisi sudah siap.** Jika endpoint sudah ada di `API_Contract.md` DAN fitur FE yang memanggilnya sudah diimplementasikan, wiring HARUS dilakukan — jangan tinggalkan FE pakai mock data padahal BE sudah ada.
2. **Endpoint yang sudah diimplementasikan** (per 2026-06-27): Auth faskes/nakes/refresh/logout, GET/POST nakes (faskes), OCR KTP (faskes & nakes), POST patient register (nakes), GET dashboard/summary (nakes), GET dashboard/patient-queue (nakes).
3. **Setiap endpoint baru di `API_Contract.md`** harus langsung disambungkan ke fungsi di `src/lib/api.ts` — jangan tunggu sampai sesi berikutnya.
4. **Field name harus persis sama dengan kontrak.** Jangan rename field di FE (mis. `full_name` tetap `full_name`, bukan `name`). Konversi dilakukan hanya di layer presentasi jika perlu.
5. **Mock mode** (`VITE_MOCK=true` di `.env.local`) dipakai saat BE belum jalan. Ketika BE siap, set `VITE_MOCK=false` — shape sudah identik, tidak perlu ubah komponen.
6. **Path API** selalu `/api/v1/...` sesuai kontrak. `VITE_API_URL` diset ke base URL server (default `http://localhost:8080`).

---

## 🚫 Aturan Wajib — Jangan Dilanggar

- ❌ **JANGAN `git commit`**
- ❌ **JANGAN `git push`**
- ❌ **JANGAN operasi git apapun yang mengubah history** (merge, rebase, reset, dll.)
- Git hanya boleh dipakai untuk membaca: `git status`, `git diff`, `git log`.

---

## 🎨 Design System — Ringkasan Cepat

> Detail lengkap ada di `docs/DESIGN.md`. Ini adalah pengingat cepat agar tidak meleset.

### Stack
React 18 + TypeScript + Vite + Tailwind CSS v3. **Desktop-first, min 1024px.** Tidak ada mobile optimization.

### Font
- UI & judul: **Plus Jakarta Sans** (400–700)
- Angka klinis, skor, kode: **IBM Plex Mono** — selalu pakai `font-variant-numeric: tabular-nums`

### Warna Utama
| Token | Hex | Pemakaian |
|---|---|---|
| `primary-500` | `#5B6BF0` | CTA utama, ikon aktif |
| `primary-800` | `#262F8A` | sidebar atas |
| `primary-900` | `#1A2066` | sidebar bawah, heading gelap |
| `teal` | `#1EC8A5` | ikon sehat, skor aman, CTA sekunder |
| `n-700` | `#2B2D42` | teks utama (`--ink`) |
| `n-50` | `#F7F8FA` | background halaman |

CSS variables wajib di `:root`:
```css
--ink: #2B2D42; --muted: #636B78; --faint: #8A93A1;
--bg: #F4F5F7; --card: #FFFFFF; --line: #DCDFE8;
```

### Skor Kesehatan (Health Score) → Warna (Hijau, Kuning, Merah)
- **70–100** → hijau `#10B981` (sehat)
- **40–69** → kuning `#F59E0B` (waswas)
- **0–39** → merah `#EF4444` (parah)
- *Catatan*: Nilai yang lebih tinggi menunjukkan kondisi pasien yang lebih sehat. Pasien kritis memiliki skor lebih rendah dan diprioritaskan paling atas.

### Aturan Desain Penting
1. Warna **tidak pernah berdiri sendiri** — selalu disertai label teks (StatusPill = titik + teks).
2. Disclaimer **"Bukan diagnosis medis"** wajib muncul di setiap `ScoreGauge`. Tidak bisa disembunyikan.
3. Aksen hemat — maksimal satu sorotan per layar.
4. Kolom angka klinis selalu rata kanan + mono font.
5. Tidak pernah pakai `<form>` HTML — gunakan event handler React (`onClick`, `onChange`).

---

## 🏗️ Arsitektur — Ringkasan Cepat

> Detail lengkap ada di `docs/fe_implementation.md`.

### Struktur Folder Penting
```
src/
├── lib/
│   ├── api.ts        ← fetch wrapper, mock mode via VITE_MOCK
│   ├── types.ts      ← SATU sumber tipe domain — jangan duplikasi tipe di tempat lain
│   └── utils.ts      ← formatSkor, formatDate, skorToStatus, dll
├── auth/             ← AuthContext, ProtectedRoute, RoleGuard
├── components/
│   ├── ui/           ← primitif tanpa logika bisnis (Button, Modal, Toast, StatusPill, dll)
│   ├── charts/       ← ScoreGauge, TrendLine, FactorBar
│   ├── layout/       ← AppShell, Sidebar, Topbar, PageHead
│   └── domain/       ← komponen dengan logika bisnis (EscalationCard, KpiCard, dll)
└── pages/
    ├── faskes/       ← hanya role: faskes (FaskesDashboardPage.tsx + components/)
    └── dokter/       ← hanya role: dokter | nakes
```

### Aturan Kode Penting (Kinerja & Ketergunaan Ulang - Ko Jun Standard)
- **Modularitas Pertama**: Hindari file monolitik. Pecah kode menjadi file-file kecil yang terfokus (maksimal ~250 baris per file jika memungkinkan).
- **Ketergunaan Ulang**: Letakkan komponen UI primitif di `src/components/ui/`, ikon di `src/components/ui/Icons.tsx`, dan token desain terpusat di `src/lib/constants.ts`.
- **`lib/types.ts` adalah satu-satunya sumber tipe domain.** Jangan buat tipe duplikat di komponen.
- **Jangan buat field di luar kontrak API.** Semua field mengacu tipe di `lib/types.ts`.
- Server state pakai **TanStack Query v5**. Form pakai **react-hook-form**.
- HTTP request selalu lewat `lib/api.ts` — jangan `fetch` langsung dari komponen.
- Mock mode: `VITE_MOCK=true` di `.env.local` → `mockResponse<T>()` di `api.ts`. Shape harus identik dengan tipe asli.
- Icon: **lucide-react** atau custom SVG reusable di `Icons.tsx`. Chart: **recharts**. Jangan install library baru tanpa konfirmasi.
- **Kinerja**: Selalu bersihkan *event listener* di `useEffect` return block, hindari kalkulasi ulang yang berat tanpa `useMemo`/`useCallback` jika terpicu render berulang.

### Role & Routing
- **faskes** → `/faskes/*` (Dashboard, Manajemen Dokter, Manajemen Pasien, Pengaturan)
- **dokter / nakes** → `/dokter/*` (Dashboard, Pasien Saya, Antrean Eskalasi, Riwayat Eskalasi)
- `RoleGuard` wajib — faskes tidak bisa akses `/dokter/*` dan sebaliknya.

### Komponen Kritis
- **`ScoreGauge`** — SVG arc 180°, prop `size: 'sm'|'md'|'lg'` (80/120/180px), `showDisclaimer` default `true`.
- **`EscalationCard`** — alur: Hubungi → acknowledged → muncul tombol Tepat/Tidak Tepat → kartu pindah ke riwayat.
- **`AppShell`** — Sidebar (248px fixed, gradient primary-800→900) + Topbar (60px) + `<Outlet />`.
- Antrean eskalasi auto-refresh tiap **60 detik** (`refetchInterval: 60_000`).

### UX Wajib di Semua Halaman
- Skeleton loader saat data loading (semua kartu KPI, tabel, ScoreGauge)
- Error state dengan pesan + tombol "Coba Lagi"
- Toast notifikasi untuk semua aksi (sukses / error)
- Focus ring visible untuk keyboard nav (`ring-2 ring-primary-300`)

---

## ✅ Kewajiban Setelah Setiap Sesi

Setelah setiap prompt selesai dikerjakan, **wajib tulis ulang** `docs/progress.md` dengan kondisi terkini. Ini bukan log kumulatif — isinya adalah **snapshot kondisi website saat ini**.

Format yang harus diikuti:

```markdown
# Progress Sehatiku — [Tanggal & Waktu Update]

## Status Umum
[Deskripsi singkat kondisi proyek saat ini]

## Checklist FE-1 (Faskes)
- [x] Login → token → redirect `/faskes/dashboard`
- [ ] Dashboard: 4 KPI + score distribution + 5 eskalasi terbaru
- [ ] Manajemen Dokter: tabel, search, tambah (+ OCR KTP), detail
- [ ] Manajemen Pasien: tabel, search, filter, tambah (+ OCR KTP), detail
- [ ] Detail Pasien: 4 tabs (Ringkasan, Log, Baseline, Eskalasi)
- [ ] Pengaturan Faskes: form edit info faskes

## Checklist FE-2 (Dokter)
- [ ] Dashboard: 4 KPI + antrean preview
- [ ] Daftar Pasien Saya: tabel, search, klik → detail
- [ ] Detail Pasien: tabs + input baseline klinis baru
- [ ] Antrean Eskalasi: kartu grid, auto-refresh 60s, badge topbar
- [ ] Feedback eskalasi: Hubungi → Tepat/Tidak Tepat → pindah ke riwayat
- [ ] Riwayat Eskalasi: tabel + filter tanggal

## Checklist Bersama
- [ ] RoleGuard berfungsi
- [ ] Skeleton loader semua data async
- [ ] Error state + tombol "Coba Lagi"
- [ ] Toast notifikasi semua aksi
- [ ] Disclaimer skor di semua ScoreGauge
- [ ] Tampil benar di ≥ 1024px

## Sedang Dikerjakan
- [ ] [nama fitur/halaman] — [status saat ini]

## Masalah / Bug yang Diketahui
- [deskripsi atau "tidak ada"]

## Catatan Teknis
[Keputusan arsitektur, hal penting untuk sesi berikutnya]

## File yang Diubah di Sesi Ini
- `path/ke/file.tsx` — [apa yang diubah]
```