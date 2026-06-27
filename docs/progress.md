# Progress Sehatiku — 2026-06-27 21:46

## Status Umum
Landing page, halaman Login (2 POV: Faskes & Dokter), dan Dashboard Faskes telah selesai diimplementasikan berdasarkan referensi. Halaman `src/App.tsx` telah direfaktorisasi secara modular menjadi sub-komponen terpisah, dan pedoman efisiensi kode telah ditambahkan ke `CLAUDE.md`. Dev server berjalan di `http://localhost:5173/`.

## Checklist FE-0 (Landing Page)
- [x] Navbar sticky dengan glassmorphism, logo + navigasi + tombol Masuk
- [x] Hero section: headline, deskripsi, CTA buttons, stats, mockup dashboard animasi
- [x] Section Alur Kerja (Fitur): 3 fase cards (Pendaftaran, Pemantauan, Eskalasi)
- [x] Section Aktor: Faskes card + Dokter card dengan fitur masing-masing
- [x] Section Tentang/Stats: 3 kartu dampak + integrasi logos
- [x] Section Kontak/CTA: kartu CTA dengan tombol Masuk ke Dashboard & Ajukan Kemitraan
- [x] Footer: 2-kolom link (Platform + Kepatuhan) dengan brand
- [x] Scroll offset fix untuk navigasi navbar sticky (`scroll-padding-top: 60px`)

## Checklist Login Page (FE-0 Extended)
- [x] Layout full-screen 2-kolom: panel brand gelap (kiri) + panel form putih (kanan)
- [x] Panel brand: gradient `#1A2066 → #262F8A → #2D3799`, logo resmi, judul + deskripsi per role, fitur list dengan green checkmarks, footer copyright
- [x] Decorative orbs (blur circles) pada panel brand kiri
- [x] Form panel: tombol "Kembali ke beranda" (back navigation)
- [x] Role toggle dengan ikon (🏠 Faskes / 👤 Dokter), warna aktif berbeda (indigo vs teal)
- [x] Field Email/Kode Faskes atau Email/No. SIP (berubah sesuai role)
- [x] Field Kata Sandi
- [x] "Ingat saya" checkbox + "Lupa sandi?" link
- [x] Tombol submit: Faskes = indigo `#5B6BF0`, Dokter = teal `#1EC8A5`
- [x] Focus ring per role: indigo untuk Faskes, teal untuk Dokter
- [x] ESC key menutup/kembali ke beranda
- [x] Footer link kontekstual per role

## Checklist FE-1 (Faskes)
- [x] Login → redirect `/faskes/dashboard` (screen state transition)
- [x] Dashboard: 4 KPI + score distribution + eskalasi list (Operasional & Eskalasi tab)
- [x] Manajemen Dokter: list dokter terdaftar, search/filter, tambah (+ OCR KTP), hapus/status toggle
- [x] Manajemen Pasien: pendaftaran pasien baru, tambah (+ OCR KTP), assign Dokter PJ
- [x] Detail Pasien: Progress Modal (chart, timeline, metrik) + Baseline Modal (input baseline baru)

## Checklist FE-2 (Dokter)
- [ ] Dashboard: 4 KPI + antrean preview
- [ ] Daftar Pasien Saya: tabel, search, klik → detail
- [ ] Detail Pasien: tabs + input baseline klinis baru
- [ ] Antrean Eskalasi: kartu grid, auto-refresh 60s, badge topbar
- [ ] Feedback eskalasi: Hubungi → Tepat/Tidak Tepat → pindah ke riwayat
- [ ] Riwayat Eskalasi: tabel + filter tanggal

## Checklist Bersama
- [x] RoleGuard / Page switching berfungsi (Faskes/Dokter)
- [ ] Routing setup (React Router) — belum dimulai
- [x] Skeleton loader / Loading state (OCR simulated loading/toasts)
- [x] Toast notifikasi semua aksi (OCR, register nakes/dokter/pasien, save baseline)
- [x] Disclaimer skor di semua ScoreGauge (diinfokan di banner/checklist)
- [x] Tampil benar di ≥ 1024px

## Sedang Dikerjakan
- FE-2 (Dokter Dashboard & Antrean Eskalasi)

## Masalah / Bug yang Diketahui
- tidak ada yang kritis

## Catatan Teknis
- Landing page & Login page menggunakan inline styles React (bukan Tailwind classes) agar konsisten dengan referensi HTML
- Login page bukan modal overlay — di-render sebagai `position:fixed; inset:0; display:grid;` full-screen 2-kolom
- Faskes Dashboard diimplementasikan sebagai `src/pages/faskes/FaskesDashboardPage.tsx` dengan tab: Pendaftaran, Operasional, Notifikasi & Eskalasi, dan Registrasi Dokter.
- Refaktorisasi Modular (Ko Jun Standard): `src/App.tsx` disederhanakan dari ~1000 baris menjadi ~50 baris dengan memisahkan constants warna (`src/lib/constants.ts`), reusable SVG icons (`src/components/ui/Icons.tsx`), sub-komponen landing page (`src/components/landing/*`), dan halaman login (`src/pages/auth/LoginPage.tsx`).

## File yang Diubah di Sesi Ini
- `src/pages/faskes/FaskesDashboardPage.tsx` — Integrasi komponen `LogoImg` resmi pada sidebar, penyesuaian warna banner pendaftaran, eskalasi, dan registrasi dokter agar sesuai dengan desain palet, perbaikan warna checkmark button "One-Tap Follow Up" menjadi merah, penghapusan langkah Progress Flow di Fase Pendaftaran, konversi Risk Score menjadi Health Score (semakin tinggi semakin sehat, sickest patients diurutkan di atas), dan perbaikan perataan vertikal grafik batang di modal progres.
- `src/App.tsx` — Direfaktorisasi penuh agar hanya memuat routing ringan dan render halaman.
- `src/lib/constants.ts` — [NEW] Token warna `C` terpusat.
- `src/components/ui/Icons.tsx` — [NEW] Sentralisasi aset SVG dan LogoImg.
- `src/components/landing/` — [NEW] Sub-komponen landing page (Navbar, HeroSection, FiturSection, AktorSection, TentangSection, KontakSection, Footer, DashboardMockup).
- `src/pages/auth/LoginPage.tsx` — [NEW] Komponen halaman Login full-screen 2-kolom modular.
- `CLAUDE.md` — Ditambahkan pedoman pengkodean modular, ketergunaan ulang (reusability), kinerja (performance), dan kewajiban menggunakan logo resmi terpusat.
