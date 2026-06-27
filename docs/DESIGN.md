# DESIGN.md — Sehatiku Web Dashboard

> Dokumentasi desain & design system untuk **Sehatiku Web** — dashboard berbasis
> browser untuk dua role: **Faskes** (admin klinik/puskesmas) dan **Dokter/Nakes**.
> Platform pasien (mobile app) ada di repo terpisah dan TIDAK dicakup di sini.
> Stack: React + Vite + TypeScript + Tailwind CSS.
> Palet: **Medis-Segar**. Logomark: **Palang-Kasih**.

---

## 1. Brand

### 1.1 Nama & Makna
**Sehatiku** = "sehat" + "-ku" (posesif orang pertama) →
"kesehatan saya, milik saya". Karakter brand: **terpercaya, hangat, memberdayakan**.

Tagline: **Terhubung, Terpantau, Terlindungi**

### 1.2 Prinsip Desain
1. **Kepercayaan dulu.** Sehatiku menangani data fisiologis pasien dan keputusan
   klinis nakes. Setiap layar harus terasa aman, bersih, dan profesional.
   Biru-ungu + teal sebagai fondasi, bukan dekorasi.
2. **Angka mudah dibaca.** Skor risiko, gula darah, tekanan darah, dan tren harus
   terbaca sekilas — font monospace + tabular numerals, kontras tinggi.
3. **Hemat aksen.** Warna aksen (teal, amber, merah) hanya untuk elemen bernilai:
   status eskalasi, skor kritis, CTA utama. Maksimal satu sorotan per layar.
4. **Tidak alarmis.** Status bahaya tampil jelas tapi tidak panik — kata calming,
   disclaimer selalu ada, merah hanya muncul dengan konteks teks.
5. **Desktop-first.** Seluruh web ini diakses lewat browser desktop oleh nakes dan
   admin faskes. Minimal 1024px. Tidak ada mobile-first di sini.
6. **Bahasa Indonesia, konteks lokal.** Istilah "gula darah", "tensi", "nakes",
   "Prolanis" dipakai apa adanya — tidak diganti jargon startup.

---

## 2. Logo — "Palang-Kasih"

Logo Sehatiku: dua palang medis bertumpuk (teal + biru-ungu), masing-masing
berisi ikon orang (pasien) dan hati (empati). Merepresentasikan hubungan antara
pasien dan sistem kesehatan yang peduli.

### Wordmark
`sehatiku` — **Plus Jakarta Sans Bold (700)**, all lowercase, tracking −0.01em.
Dwiwarna: `"sehat"` → dark-ink (`#2B2D42`) + `"iku"` → teal (`#1EC8A5`).
Tagline: `"Terhubung, Terpantau, Terlindungi"` — 12px / 400 / `#8A93A1`.

### Aturan Pakai
| Hal | Ketentuan |
|---|---|
| Sidebar header | Logo penuh (mark + wordmark) di atas latar primary-900 |
| Favicon / tab icon | Mark saja (palang dua warna), 32×32 px |
| Ukuran minimum | Mark 24px · lockup 120px lebar |
| Hindari | Meregangkan proporsi, ganti warna di luar palet, tambah bayangan |

---

## 3. Warna — Palet "Medis-Segar"

Light mode only. Primer biru-ungu (trust), sekunder teal-hijau (health),
aksen ungu muda. Semua nilai siap dipetakan ke Tailwind `colors` config.

### 3.1 Primer — Biru-Ungu
| Token | Hex | Tailwind key | Pemakaian |
|---|---|---|---|
| `primary-50` | `#EEEFFE` | `primary.50` | hover row tabel, bg ringan |
| `primary-100` | `#D6D9FD` | `primary.100` | chip, avatar bg |
| `primary-200` | `#ABAEF9` | `primary.200` | border halus |
| `primary-500` | `#5B6BF0` | `primary.500` | **CTA utama**, ikon aktif |
| `primary-600` | `#4857D8` | `primary.600` | hover tombol primary |
| `primary-700` | `#3645B4` | `primary.700` | link, aksen teks |
| `primary-800` | `#262F8A` | `primary.800` | sidebar atas |
| `primary-900` | `#1A2066` | `primary.900` | sidebar bawah, teks heading gelap |

### 3.2 Sekunder — Teal
| Token | Hex | Tailwind key | Pemakaian |
|---|---|---|---|
| `teal-50` | `#E5FBF6` | `teal.50` | badge aman, bg kartu sehat |
| `teal-100` | `#BDFAEA` | `teal.100` | latar grafik aman |
| `teal` | `#1EC8A5` | `teal.DEFAULT` | ikon sehat, skor aman, CTA sekunder |
| `teal-600` | `#16A98C` | `teal.600` | hover teal |

### 3.3 Netral (Blue-Gray)
| Token | Hex | Tailwind key | Peran |
|---|---|---|---|
| `n-0` | `#FFFFFF` | `neutral.0` | card surface |
| `n-50` | `#F7F8FA` | `neutral.50` | page background |
| `n-100` | `#EEF0F5` | `neutral.100` | table header bg |
| `n-200` | `#DCDFE8` | `neutral.200` | border, divider |
| `n-400` | `#8A93A1` | `neutral.400` | `--faint`, placeholder |
| `n-500` | `#636B78` | `neutral.500` | `--muted`, label sekunder |
| `n-700` | `#2B2D42` | `neutral.700` | `--ink`, teks utama |

CSS variables yang dipakai di komponen:
```css
:root {
  --ink:    #2B2D42;
  --muted:  #636B78;
  --faint:  #8A93A1;
  --bg:     #F4F5F7;
  --card:   #FFFFFF;
  --line:   #DCDFE8;
}
```

### 3.4 Semantik & Skor Risiko
| Status | Hex teks | Hex bg | Pemakaian |
|---|---|---|---|
| Aman / Sukses | `#059669` | `#ECFDF5` | skor 0–35, status aman, konfirmasi |
| Waswas / Warning | `#D97706` | `#FFFBEB` | skor 36–65, tren memburuk |
| Bahaya / Danger | `#DC2626` | `#FEF2F2` | skor 66–100, eskalasi aktif |
| Info | `#2563EB` | `#EFF6FF` | notifikasi umum, panduan |

**Skor Risiko → Warna:**
- 0–35 → teal (aman)
- 36–65 → amber (waswas)
- 66–100 → merah (bahaya)

Skor selalu tampil sebagai angka besar mono + arc gauge + status pill teks.
Disclaimer "Bukan diagnosis medis" wajib menyertai setiap tampilan skor.

---

## 4. Tipografi

| Peran | Font | Weight | Catatan |
|---|---|---|---|
| Antarmuka & judul | **Plus Jakarta Sans** | 400–700 | sans utama |
| Angka klinis, skor, kode | **IBM Plex Mono** | 400–600 | `font-variant-numeric: tabular-nums` |

Load via Google Fonts di `index.html`.

### Skala (px / rem)
| Kelas | Size / Weight | Pemakaian |
|---|---|---|
| Page title | 22px / 700 | judul halaman (`<h1>`) |
| Section title | 16px / 700 | judul kartu, modal header |
| Card title | 14px / 600 | label widget |
| Skor besar | 48px / 700 mono | angka skor risiko di ScoreGauge |
| KPI value | 26px / 700 | statistik ringkasan |
| Body | 14px / 400–500 | isi tabel, paragraf |
| Label / eyebrow | 11px / 600 uppercase | label form, section sidebar |
| Mono angka | 13px / 600 | GD, tensi, BB di tabel |
| Disclaimer | 12px / 400 italic | "Bukan diagnosis medis" |

---

## 5. Token Bentuk & Elevasi

| Token | Nilai | Tailwind class |
|---|---|---|
| Radius sm | 8px | `rounded-lg` |
| Radius base | 12px | `rounded-xl` |
| Radius lg | 16px | `rounded-2xl` |
| Radius full | 9999px | `rounded-full` |
| Shadow sm | `0 1px 3px rgba(17,24,39,.06)` | `shadow-sm` |
| Shadow | `0 4px 12px -2px rgba(17,24,39,.10)` | `shadow` |
| Shadow lg | `0 16px 40px -8px rgba(26,32,102,.18)` | `shadow-lg` |
| Spacing grid | 4px base | `gap-4` = 16px |

---

## 6. Komponen UI

### Button
Variant: `primary` (biru-ungu) · `teal` (konfirmasi sehat) · `ghost` (outline) ·
`soft` (bg primary-50) · `danger` (merah). Ukuran `sm / md / lg`.
Radius 10px, weight 600, selalu ada label teks, ikon opsional kiri.

### StatusPill
Pil `rounded-full` + titik warna + label teks. **Warna tidak pernah berdiri sendiri.**
Mapping: `aman`→hijau · `waswas`→amber · `bahaya`→merah · `aktif`→biru · `pending`→abu.

### ScoreGauge
SVG arc 180°. Gradient fill teal→amber→merah. Angka 48px mono di tengah arc.
StatusPill di bawah angka. Disclaimer italic 12px di bawah pill.
Dipakai di: detail pasien (besar) + kartu eskalasi (kecil, 80px).

### FactorBar
List maks 3 faktor. Per baris: label faktor + bar horizontal (0–100%) + panah
naik (merah) / turun (teal). Menampilkan SHAP attribution secara visual.

### EscalationCard
Kartu pasien dalam antrean prioritas:
- Avatar inisial + nama pasien + penyakit.
- `ScoreGauge` kecil (80px) + StatusPill.
- `FactorBar` 2–3 faktor teratas.
- Timestamp eskalasi.
- Tombol **"Hubungi"** (primary sm) + **"Tepat / Tidak Tepat"** (ghost sm, muncul setelah hubungi).

### Tabel
Header uppercase 11px `--faint` di atas `n-100`. Baris hover `primary-50`.
Kolom angka klinis: rata kanan + mono font. Kolom status: StatusPill.
Nama pasien: bold + avatar inisial 32px.

### Form
Label 12px/600 + input radius 10px, border `n-200`, focus `ring-2 ring-primary-300`.
Error: border merah + pesan inline merah bawah field. `NumericInput` untuk GD/tensi/BB.

### Modal
Max-width 520px (form kecil) / 720px (detail). Overlay `rgba(0,0,0,.4)`.
Animasi scale-in 150ms. Tutup via tombol ✕ atau Esc.

### Toast
Bottom-center, z-50. Auto-hilang 3s. Variant: sukses (hijau) / error (merah) /
warning (amber) / info (biru). Selalu ada ikon + teks singkat.

### Avatar
Inisial 1–2 huruf. Bg `primary-100`, teks `primary-700`. Ukuran 32/40/48px.

### Skeleton Loader
Gray animated pulse sebagai placeholder saat data loading.
Dipakai di semua kartu KPI, tabel, dan ScoreGauge.

---

## 7. Layout Aplikasi Web

```
┌──────────────────────────────────────────────────────────────┐
│ SIDEBAR  248px                    MAIN AREA                  │
│ ┌────────────────────┐  ┌─────────────────────────────────┐  │
│ │ [logo sehatiku]    │  │ TOPBAR 60px                     │  │
│ │ ─────────────────  │  │ [judul halaman] [notif] [profil]│  │
│ │ [nama faskes]      │  ├─────────────────────────────────┤  │
│ │ [role badge]       │  │                                 │  │
│ │ ─────────────────  │  │  CONTENT (max-w 1200, scroll)   │  │
│ │ nav section label  │  │  page-head (judul + aksi)       │  │
│ │   • item aktif     │  │  kartu KPI / tabel / detail     │  │
│ │   • item lain      │  │                                 │  │
│ │ ─────────────────  │  │                                 │  │
│ │ [kartu user]       │  │                                 │  │
│ └────────────────────┘  └─────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

- **Sidebar** gradient `primary-800 → primary-900`, lebar 248px, fixed.
  Sections: logo + nama faskes + role badge | nav items | kartu user (nama, role, logout).
- **Topbar** 60px: breadcrumb/judul, badge eskalasi aktif (merah), ikon notif, avatar profil.
- **Content** padding 24px, background `--bg (#F4F5F7)`. Max-width 1200px di dalam.
- Navigasi balik: tombol ghost "← Kembali" di page-head halaman detail.

### Nav Faskes (role: faskes)
- Dashboard
- Manajemen Dokter
- Manajemen Pasien
- Pengaturan Faskes

### Nav Dokter (role: dokter / nakes)
- Dashboard
- Daftar Pasien Saya
- Antrean Eskalasi
- Riwayat Eskalasi

---

## 8. Alur Kunci (UX)

1. **Login** → pilih role atau backend detect dari credential → redirect ke
   dashboard sesuai role (faskes / dokter).

2. **Faskes onboarding pasien** → input data pasien + OCR KTP → assign dokter →
   sistem kirim WhatsApp ke pasien → pasien aktif di dashboard.

3. **Eskalasi (Dokter)** → notif masuk (badge merah topbar) → buka antrean →
   lihat EscalationCard + FactorBar → klik "Hubungi" → klik "Tepat/Tidak Tepat"
   1 ketuk → kartu pindah ke riwayat.

4. **Review pasien (Dokter)** → Daftar Pasien → klik pasien → detail:
   ScoreGauge + TrendLine 30h + log harian → input baseline klinis baru.

---

## 9. Aksesibilitas

- Kontras teks utama ≥ AA (WCAG 2.1) pada semua permukaan.
- Target klik tombol ≥ 36px tinggi (desktop, bukan mobile — tapi tetap nyaman).
- Status tidak hanya warna — selalu ada label teks.
- Disclaimer skor selalu tampil, tidak bisa disembunyikan.
- Focus ring visible (ring-2 ring-primary-300) untuk keyboard nav.

---

## 10. File Terkait

| File | Isi |
|---|---|
| `DESIGN.md` | File ini |
| `fe_implementation.md` | Plan implementasi (React + Vite + TS + Tailwind) |
| `logo_sehatiku.png` | Logo final |
| `Color_palette.png` | Referensi palet visual |
| `tailwind.config.ts` | Token warna dari §3 dipetakan ke Tailwind |
| `src/styles/globals.css` | CSS variables (`:root`) |
| `src/components/ui/` | UI kit implementasi |
