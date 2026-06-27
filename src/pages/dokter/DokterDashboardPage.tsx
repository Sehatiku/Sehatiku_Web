import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { LogoImg } from '../../components/ui/Icons'
import { useAuth } from '../../auth/AuthContext'
import { nakesApi } from '../../lib/api'
import type { DashboardSummary, PatientQueueItem, RiskLabel, DiseaseType } from '../../lib/types'
import { initials, formatDate } from '../../lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveView = 'antrean' | 'tren' | 'umpan'
type QueueFilter = 'all' | 'bahaya' | 'waswas' | 'aman'

// ─── Color helpers ────────────────────────────────────────────────────────────

const RISK_COLOR: Record<RiskLabel, { text: string; bg: string; border: string; edge: string; sqBg: string }> = {
  kritis: { text: '#DC2626', bg: '#FEF2F2', border: '#FECACA', edge: '#EF4444', sqBg: '#EF4444' },
  sedang: { text: '#D97706', bg: '#FFFBEB', border: '#FDE68A', edge: '#F59E0B', sqBg: '#F59E0B' },
  rendah: { text: '#059669', bg: '#F0FDF4', border: '#A7F3D0', edge: '#00B894', sqBg: '#00B894' },
}

const DISEASE_LABEL: Record<DiseaseType, string> = {
  diabetes_t2: 'Diabetes T2',
  hypertension: 'Hipertensi',
  both: 'DM + HT',
}

const DISEASE_COLOR: Record<DiseaseType, { text: string; bg: string }> = {
  diabetes_t2: { text: '#7C3AED', bg: '#F5F3FF' },
  hypertension: { text: '#0369A1', bg: '#F0F9FF' },
  both: { text: '#9A3412', bg: '#FFF7ED' },
}

// ─── SVG Chart builder ────────────────────────────────────────────────────────

function buildChart(data: number[], dangerThreshold: number, range: number) {
  const pts = data.slice(-range)
  const minV = Math.min(...pts, dangerThreshold) * 0.85
  const maxV = Math.max(...pts, dangerThreshold) * 1.1
  const X0 = 48, X1 = 624, Y0 = 24, Y1 = 180
  const toX = (i: number) => X0 + (i / (pts.length - 1)) * (X1 - X0)
  const toY = (v: number) => Y1 - ((v - minV) / (maxV - minV)) * (Y1 - Y0)
  const dangerY = toY(dangerThreshold)
  const linePoints = pts.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')
  const areaPoints = `${toX(0)},${Y1} ` + pts.map((v, i) => `${toX(i)},${toY(v)}`).join(' ') + ` ${toX(pts.length - 1)},${Y1}`
  const dots = pts.map((v, i) => ({ cx: toX(i), cy: toY(v), inDanger: v >= dangerThreshold }))
  const yLabels = [
    { label: Math.round(minV).toString(), y: Y1 },
    { label: Math.round((minV + maxV) / 2).toString(), y: (Y0 + Y1) / 2 },
    { label: Math.round(maxV).toString(), y: Y0 },
  ]
  const today = new Date()
  const xLabels = pts.map((_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (pts.length - 1 - i))
    return { x: toX(i), label: `${d.getDate()}/${d.getMonth() + 1}` }
  }).filter((_, i) => i % Math.ceil(pts.length / 7) === 0 || i === pts.length - 1)
  const dangerH = Math.max(0, Y1 - dangerY)
  return { linePoints, areaPoints, dots, yLabels, xLabels, dangerY, dangerH }
}

// ─── Mock data ────────────────────────────────────────────────────────────────

interface ShapFactor {
  label: string
  valText: string
  color: string
  barWidth: string
  barBg: string
  note: string
}

interface LogEntry {
  time: string
  dot: string
  text: string
  detail: string
}

interface RiskTrendEntry {
  score: number
  month: string
}

interface MetricItem {
  label: string
  value: string
  unit: string
  arrow: string
  deltaTxt: string
  trendBg: string
  trendColor: string
}

interface TimelineEntry {
  color: string
  date: string
  title: string
  note: string
}

interface MockMetricSet {
  metrics: MetricItem[]
  timeline: TimelineEntry[]
  deltaColor: string
  delta: string
  deltaLabel: string
}

const MOCK_SHAP: ShapFactor[][] = [
  [
    { label: 'HbA1c', valText: '10.2%', color: '#EF4444', barWidth: '88%', barBg: '#EF4444', note: '> 7% — zona kritis, +2.4 poin risiko' },
    { label: 'Kepatuhan Obat', valText: '40%', color: '#EF4444', barWidth: '72%', barBg: '#EF4444', note: 'Hanya 2–3 dari 7 hari — dampak besar' },
    { label: 'Gula Darah Puasa', valText: '215 mg/dL', color: '#EF4444', barWidth: '65%', barBg: '#EF4444', note: 'Normal < 100 mg/dL' },
    { label: 'Aktivitas Fisik', valText: '1 hari/minggu', color: '#00B894', barWidth: '45%', barBg: '#00B894', note: 'Menurunkan risiko +0.8 poin' },
    { label: 'BMI', valText: '29.4', color: '#F59E0B', barWidth: '35%', barBg: '#F59E0B', note: 'Overweight — kontribusi sedang' },
  ],
  [
    { label: 'Tensi Sistolik', valText: '178 mmHg', color: '#EF4444', barWidth: '92%', barBg: '#EF4444', note: 'Krisis hipertensi — > 180 darurat' },
    { label: 'Asupan Natrium', valText: 'Tinggi', color: '#EF4444', barWidth: '75%', barBg: '#EF4444', note: 'Konsumsi garam berlebih setiap hari' },
    { label: 'Stres', valText: 'Level 3', color: '#EF4444', barWidth: '60%', barBg: '#EF4444', note: 'Stres kronis meningkatkan tensi' },
    { label: 'Tidur', valText: '4.5 jam', color: '#F59E0B', barWidth: '40%', barBg: '#F59E0B', note: 'Kurang tidur memperparah kondisi' },
    { label: 'Aktivitas Fisik', valText: '0 hari', color: '#EF4444', barWidth: '30%', barBg: '#EF4444', note: 'Tidak ada aktivitas minggu ini' },
  ],
  [
    { label: 'Gula Darah 2j pp', valText: '185 mg/dL', color: '#F59E0B', barWidth: '68%', barBg: '#F59E0B', note: 'Di atas target (< 140 mg/dL)' },
    { label: 'Tidur', valText: '5 jam', color: '#F59E0B', barWidth: '52%', barBg: '#F59E0B', note: 'Kurang tidur — pengaruhi gula darah' },
    { label: 'Kepatuhan Obat', valText: '71%', color: '#F59E0B', barWidth: '42%', barBg: '#F59E0B', note: '5 dari 7 hari — perlu ditingkatkan' },
    { label: 'Aktivitas Fisik', valText: '3 hari/minggu', color: '#00B894', barWidth: '55%', barBg: '#00B894', note: 'Cukup baik, pertahankan' },
    { label: 'BMI', valText: '26.1', color: '#F59E0B', barWidth: '28%', barBg: '#F59E0B', note: 'Overweight ringan' },
  ],
  [
    { label: 'Tensi Sistolik', valText: '148 mmHg', color: '#F59E0B', barWidth: '62%', barBg: '#F59E0B', note: 'Stage 2 hipertensi (130-139)' },
    { label: 'Kepatuhan Obat', valText: '57%', color: '#EF4444', barWidth: '55%', barBg: '#EF4444', note: 'Hanya 4 dari 7 hari — risiko rebound' },
    { label: 'Gula Darah', valText: '138 mg/dL', color: '#F59E0B', barWidth: '45%', barBg: '#F59E0B', note: 'Mendekati batas atas (< 140)' },
    { label: 'Makan Sehat', valText: '43%', color: '#00B894', barWidth: '38%', barBg: '#00B894', note: 'Ada peningkatan dari minggu lalu' },
    { label: 'Olahraga', valText: '2 hari/minggu', color: '#00B894', barWidth: '32%', barBg: '#00B894', note: 'Setara 60 menit — efek positif' },
  ],
  [
    { label: 'Tensi Sistolik', valText: '124 mmHg', color: '#00B894', barWidth: '82%', barBg: '#00B894', note: 'Dalam target — sangat baik' },
    { label: 'Kepatuhan Obat', valText: '100%', color: '#00B894', barWidth: '95%', barBg: '#00B894', note: 'Sempurna 7/7 hari' },
    { label: 'Aktivitas Fisik', valText: '5 hari/minggu', color: '#00B894', barWidth: '78%', barBg: '#00B894', note: 'Excellent — menurunkan risiko -2.1 poin' },
    { label: 'BMI', valText: '22.8', color: '#00B894', barWidth: '60%', barBg: '#00B894', note: 'Normal — berdampak positif' },
    { label: 'Gula Darah', valText: '92 mg/dL', color: '#00B894', barWidth: '45%', barBg: '#00B894', note: 'Di bawah 100 — sangat baik' },
  ],
]

const MOCK_LOGS: LogEntry[][] = [
  [
    { time: '07:12', dot: '#00B894', text: 'Obat pagi diminum ✓', detail: 'Metformin 500mg + Glibenklamid — kepatuhan tercatat' },
    { time: '08:30', dot: '#EF4444', text: 'Gula Darah Puasa: 215 mg/dL', detail: 'Di atas target (<100 mg/dL) — sudah dinotif via WA' },
    { time: '12:45', dot: '#F59E0B', text: 'Makan siang — kurang sehat', detail: 'Nasi putih + goreng-gorengan, tidak ada sayur' },
    { time: '16:00', dot: '#94A3B8', text: 'Tidak ada aktivitas fisik hari ini', detail: 'Target: minimal 30 menit jalan kaki' },
    { time: '21:30', dot: '#00B894', text: 'Obat malam diminum ✓', detail: 'Metformin 500mg — tercatat' },
  ],
  [
    { time: '06:45', dot: '#EF4444', text: 'Tensi Pagi: 178/105 mmHg', detail: 'Sangat tinggi — eskalasi otomatis terkirim' },
    { time: '07:00', dot: '#94A3B8', text: 'Obat pagi — terlewat', detail: 'Amlodipine 5mg tidak diminum hari ini' },
    { time: '13:00', dot: '#F59E0B', text: 'Makan siang dengan garam tinggi', detail: 'Ikan asin + mie instan — asupan natrium berlebih' },
    { time: '19:00', dot: '#EF4444', text: 'Tensi Malam: 182/112 mmHg', detail: 'Meningkat — perlu tindak lanjut dokter' },
    { time: '22:00', dot: '#94A3B8', text: 'Tidur 04.30 jam', detail: 'Kurang tidur kronis — memperparah hipertensi' },
  ],
  [
    { time: '07:20', dot: '#00B894', text: 'Obat pagi diminum ✓', detail: 'Metformin 500mg — kepatuhan baik' },
    { time: '09:00', dot: '#F59E0B', text: 'Gula 2 jam pp: 185 mg/dL', detail: 'Sedikit di atas target (< 140 mg/dL)' },
    { time: '12:00', dot: '#00B894', text: 'Makan siang — cukup sehat', detail: 'Nasi merah + sayur + ikan — pilihan yang baik' },
    { time: '16:00', dot: '#00B894', text: 'Jalan kaki 30 menit ✓', detail: 'Aktivitas konsisten hari ke-3' },
    { time: '22:00', dot: '#F59E0B', text: 'Tidur 05:00 jam', detail: 'Masih kurang — target 7 jam/hari' },
  ],
  [
    { time: '07:30', dot: '#F59E0B', text: 'Obat pagi — terlewat sekali', detail: 'Amlodipine + Metformin — hanya 1 yang diminum' },
    { time: '10:00', dot: '#F59E0B', text: 'Tensi: 148/92 mmHg', detail: 'Di atas normal — monitoring lanjut' },
    { time: '12:30', dot: '#00B894', text: 'Makan siang — sehat', detail: 'Sayur bening + tempe bakar + buah' },
    { time: '15:00', dot: '#00B894', text: 'Olahraga ringan 20 menit', detail: 'Senam lansia — rutin 2x seminggu' },
    { time: '21:00', dot: '#00B894', text: 'Obat malam diminum ✓', detail: 'Metformin 500mg tercatat' },
  ],
  [
    { time: '06:30', dot: '#00B894', text: 'Obat pagi diminum ✓', detail: 'Amlodipine 5mg — konsisten 7 hari' },
    { time: '07:00', dot: '#00B894', text: 'Tensi Pagi: 124/78 mmHg', detail: 'Dalam rentang target — excellent' },
    { time: '08:00', dot: '#00B894', text: 'Jogging 40 menit ✓', detail: 'Konsisten 5 hari/minggu — dampak sangat positif' },
    { time: '12:30', dot: '#00B894', text: 'Makan siang — sangat sehat', detail: 'Nasi merah + sayur hijau + ikan kukus' },
    { time: '21:30', dot: '#00B894', text: 'Semua parameter hari ini ✓', detail: 'Skor diperkirakan membaik besok' },
  ],
]

const MOCK_GLUCOSE: number[][] = [
  [230, 215, 245, 210, 220, 235, 215, 225, 240, 205, 215, 230, 220, 215],
  [115, 120, 118, 122, 119, 125, 121, 120, 118, 122, 120, 119, 121, 120],
  [175, 180, 168, 185, 172, 190, 178, 182, 175, 168, 180, 185, 175, 185],
  [145, 140, 148, 138, 142, 150, 140, 145, 138, 142, 148, 140, 138, 138],
  [95, 92, 88, 94, 90, 92, 88, 92, 90, 94, 88, 92, 90, 92],
]

const MOCK_BP: number[][] = [
  [155, 160, 158, 162, 155, 158, 160, 158, 162, 155, 160, 158, 162, 160],
  [182, 178, 185, 180, 178, 182, 178, 180, 178, 182, 178, 178, 180, 178],
  [145, 148, 142, 145, 148, 145, 142, 148, 145, 148, 145, 142, 145, 148],
  [152, 148, 150, 148, 150, 148, 152, 148, 150, 148, 150, 148, 148, 148],
  [128, 125, 126, 124, 125, 126, 124, 125, 126, 124, 126, 124, 124, 124],
]

const MOCK_RISK_TREND: RiskTrendEntry[][] = [
  [{ score: 55, month: 'Jan' }, { score: 62, month: 'Feb' }, { score: 70, month: 'Mar' }, { score: 78, month: 'Apr' }, { score: 85, month: 'Mei' }, { score: 92, month: 'Jun' }],
  [{ score: 52, month: 'Jan' }, { score: 58, month: 'Feb' }, { score: 65, month: 'Mar' }, { score: 74, month: 'Apr' }, { score: 80, month: 'Mei' }, { score: 87, month: 'Jun' }],
  [{ score: 48, month: 'Jan' }, { score: 52, month: 'Feb' }, { score: 45, month: 'Mar' }, { score: 55, month: 'Apr' }, { score: 50, month: 'Mei' }, { score: 55, month: 'Jun' }],
  [{ score: 60, month: 'Jan' }, { score: 58, month: 'Feb' }, { score: 55, month: 'Mar' }, { score: 52, month: 'Apr' }, { score: 50, month: 'Mei' }, { score: 48, month: 'Jun' }],
  [{ score: 32, month: 'Jan' }, { score: 28, month: 'Feb' }, { score: 30, month: 'Mar' }, { score: 25, month: 'Apr' }, { score: 22, month: 'Mei' }, { score: 25, month: 'Jun' }],
]

const MOCK_METRICS: MockMetricSet[] = [
  {
    metrics: [
      { label: 'HbA1c', value: '10.2', unit: '%', arrow: '↑', deltaTxt: '+1.8%', trendBg: '#FEF2F2', trendColor: '#EF4444' },
      { label: 'Gula Puasa', value: '215', unit: 'mg/dL', arrow: '↑', deltaTxt: '+45', trendBg: '#FEF2F2', trendColor: '#EF4444' },
      { label: 'BMI', value: '29.4', unit: 'kg/m²', arrow: '→', deltaTxt: 'Stabil', trendBg: '#F8FAFC', trendColor: '#64748B' },
      { label: 'Tekanan Darah', value: '155/98', unit: 'mmHg', arrow: '↑', deltaTxt: '+10', trendBg: '#FEF2F2', trendColor: '#EF4444' },
    ],
    timeline: [
      { color: '#EF4444', date: '10 Jun 2026', title: 'Eskalasi — HbA1c Kritis', note: 'HbA1c 10.2%, gula puasa 215 mg/dL. Pasien dihubungi oleh dr. Ahmad.' },
      { color: '#F59E0B', date: '15 Mei 2026', title: 'Evaluasi Bulanan', note: 'Skor meningkat dari 78 → 85. Kepatuhan obat turun ke 40%.' },
      { color: '#94A3B8', date: '01 Apr 2026', title: 'Konsultasi Rutin', note: 'Tensi dalam batas normal, namun gula darah masih perlu dipantau.' },
    ],
    deltaColor: '#EF4444', delta: '+37', deltaLabel: '↑ memburuk',
  },
  {
    metrics: [
      { label: 'Tensi Sistolik', value: '178', unit: 'mmHg', arrow: '↑', deltaTxt: '+28', trendBg: '#FEF2F2', trendColor: '#EF4444' },
      { label: 'Tensi Diastolik', value: '112', unit: 'mmHg', arrow: '↑', deltaTxt: '+18', trendBg: '#FEF2F2', trendColor: '#EF4444' },
      { label: 'Natrium Urin', value: 'Tinggi', unit: '', arrow: '↑', deltaTxt: 'Naik', trendBg: '#FEF2F2', trendColor: '#EF4444' },
      { label: 'BMI', value: '28.1', unit: 'kg/m²', arrow: '→', deltaTxt: 'Stabil', trendBg: '#F8FAFC', trendColor: '#64748B' },
    ],
    timeline: [
      { color: '#EF4444', date: '11 Jun 2026', title: 'Eskalasi Krisis Hipertensi', note: 'Tensi 182/112 mmHg — sudah dihubungi. Disarankan ke IGD jika tidak turun.' },
      { color: '#EF4444', date: '20 Mei 2026', title: 'Eskalasi ke-2', note: 'Tensi 175/108. Obat tidak diminum 3 hari.' },
      { color: '#F59E0B', date: '10 Apr 2026', title: 'Peringatan Kepatuhan', note: 'Kepatuhan obat turun ke 43%. Edukasi ulang diberikan.' },
    ],
    deltaColor: '#EF4444', delta: '+35', deltaLabel: '↑ memburuk',
  },
  {
    metrics: [
      { label: 'Gula 2j pp', value: '185', unit: 'mg/dL', arrow: '↑', deltaTxt: '+25', trendBg: '#FFF9F0', trendColor: '#D97706' },
      { label: 'HbA1c', value: '7.8', unit: '%', arrow: '↑', deltaTxt: '+0.6%', trendBg: '#FFF9F0', trendColor: '#D97706' },
      { label: 'Tidur', value: '5', unit: 'jam/hr', arrow: '↓', deltaTxt: '-1.5j', trendBg: '#FFF9F0', trendColor: '#D97706' },
      { label: 'BMI', value: '26.1', unit: 'kg/m²', arrow: '→', deltaTxt: 'Stabil', trendBg: '#F8FAFC', trendColor: '#64748B' },
    ],
    timeline: [
      { color: '#F59E0B', date: '09 Jun 2026', title: 'Monitoring Rutin', note: 'Gula 2j pp 185 mg/dL, masih di atas target. Tidur hanya 5 jam.' },
      { color: '#94A3B8', date: '12 Mei 2026', title: 'Evaluasi Bulanan', note: 'Skor 50 → 55, sedikit memburuk. Disarankan perbaiki pola tidur.' },
      { color: '#00B894', date: '01 Apr 2026', title: 'Perbaikan Aktivitas', note: 'Pasien mulai rutin olahraga 3x/minggu. Apresiasi diberikan.' },
    ],
    deltaColor: '#D97706', delta: '+7', deltaLabel: '↑ sedikit memburuk',
  },
  {
    metrics: [
      { label: 'Tensi Sistolik', value: '148', unit: 'mmHg', arrow: '↓', deltaTxt: '-8', trendBg: '#F0FDF4', trendColor: '#059669' },
      { label: 'Gula Darah', value: '138', unit: 'mg/dL', arrow: '↓', deltaTxt: '-12', trendBg: '#F0FDF4', trendColor: '#059669' },
      { label: 'Kepatuhan Obat', value: '57', unit: '%', arrow: '↑', deltaTxt: '+14%', trendBg: '#F0FDF4', trendColor: '#059669' },
      { label: 'BMI', value: '27.3', unit: 'kg/m²', arrow: '↓', deltaTxt: '-0.4', trendBg: '#F0FDF4', trendColor: '#059669' },
    ],
    timeline: [
      { color: '#00B894', date: '08 Jun 2026', title: 'Tren Membaik', note: 'Skor turun 50 → 48. Kepatuhan obat naik ke 57%, terus membaik.' },
      { color: '#F59E0B', date: '15 Mei 2026', title: 'Monitoring DM+HT', note: 'Kedua kondisi perlu dikontrol. Kombinasi terapi sedang dievaluasi.' },
      { color: '#94A3B8', date: '01 Apr 2026', title: 'Konsultasi Nutrisi', note: 'Diet rendah garam dan rendah GI dimulai. Dampak positif terlihat.' },
    ],
    deltaColor: '#059669', delta: '-12', deltaLabel: '↓ membaik',
  },
  {
    metrics: [
      { label: 'Tensi Sistolik', value: '124', unit: 'mmHg', arrow: '↓', deltaTxt: '-18', trendBg: '#F0FDF4', trendColor: '#059669' },
      { label: 'Gula Darah', value: '92', unit: 'mg/dL', arrow: '↓', deltaTxt: '-28', trendBg: '#F0FDF4', trendColor: '#059669' },
      { label: 'Kepatuhan Obat', value: '100', unit: '%', arrow: '↑', deltaTxt: 'Sempurna', trendBg: '#F0FDF4', trendColor: '#059669' },
      { label: 'Aktivitas Fisik', value: '5', unit: 'hari/minggu', arrow: '↑', deltaTxt: '+2 hari', trendBg: '#F0FDF4', trendColor: '#059669' },
    ],
    timeline: [
      { color: '#00B894', date: '10 Jun 2026', title: 'Status Terkontrol', note: 'Semua parameter dalam target. Tensi 124/78, gula 92. Pasien sangat kooperatif.' },
      { color: '#00B894', date: '01 Mei 2026', title: 'Capaian Terapi', note: 'Skor turun 32 → 25. Salah satu pasien dengan progres terbaik bulan ini.' },
      { color: '#00B894', date: '01 Mar 2026', title: 'Mulai Program Intensif', note: 'Pasien bergabung program olahraga dan diet khusus. Dampak langsung terlihat.' },
    ],
    deltaColor: '#059669', delta: '-7', deltaLabel: '↓ membaik',
  },
]

// ─── Suppressed unused import warning ─────────────────────────────────────────
void (formatDate as unknown)

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToastNotif({ msg, type, onClose }: { msg: string; type: 'ok' | 'err'; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: type === 'ok' ? '#00B894' : '#EF4444',
      color: '#fff', padding: '10px 18px', borderRadius: 10,
      fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, fontWeight: 600,
      boxShadow: '0 4px 16px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span>{msg}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0 }}>
        &times;
      </button>
    </div>
  )
}

function SkeletonCard({ w = '100%', h = 80 }: { w?: string; h?: number }) {
  return (
    <div style={{
      width: w, height: h,
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%', borderRadius: 12,
      animation: 'shimmer 1.4s infinite',
    }} />
  )
}

function AvatarCircle({ name, size = 36, bg }: { name: string; size?: number; bg: string }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: Math.round(size * 0.35),
      fontFamily: 'Plus Jakarta Sans, sans-serif', flexShrink: 0,
    }}>
      {initials(name)}
    </div>
  )
}

function RiskScoreBadge({ label, score }: { label: RiskLabel; score: number }) {
  const c = RISK_COLOR[label]
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 8, background: c.sqBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: 13,
      fontFamily: 'IBM Plex Mono, monospace', flexShrink: 0,
    }}>
      {score}
    </div>
  )
}

function StatusPill({ label, risk }: { label: string; risk: RiskLabel }) {
  const c = RISK_COLOR[risk]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 600, color: c.text,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.edge, flexShrink: 0 }} />
      {label}
    </span>
  )
}

function DiseasePill({ type }: { type: DiseaseType }) {
  const c = DISEASE_COLOR[type]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: c.bg, borderRadius: 20, padding: '2px 8px',
      fontSize: 11, fontWeight: 600, color: c.text,
    }}>
      {DISEASE_LABEL[type]}
    </span>
  )
}

// ─── TrendChart ───────────────────────────────────────────────────────────────

function TrendChart({
  patientIdx,
  chartParam,
  chartRange,
  onParamChange,
  onRangeChange,
}: {
  patientIdx: number
  chartParam: 'glucose' | 'bp'
  chartRange: 7 | 14
  onParamChange: (p: 'glucose' | 'bp') => void
  onRangeChange: (r: 7 | 14) => void
}) {
  const safeIdx = Math.min(patientIdx, MOCK_GLUCOSE.length - 1)
  const glucoseData = MOCK_GLUCOSE[safeIdx]
  const bpData = MOCK_BP[safeIdx]
  const data = chartParam === 'glucose' ? glucoseData : bpData
  const threshold = chartParam === 'glucose' ? 130 : 140
  const unit = chartParam === 'glucose' ? 'mg/dL' : 'mmHg'
  const paramLabel = chartParam === 'glucose' ? 'Gula Darah' : 'Tensi Sistolik'
  const pts = data.slice(-chartRange)
  const currentVal = pts[pts.length - 1]
  const isHigh = currentVal >= threshold
  const chart = buildChart(data, threshold, chartRange)

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#1E293B' }}>Tren Parameter Harian</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['glucose', 'bp'] as const).map(p => (
            <button key={p} onClick={() => onParamChange(p)} style={{
              padding: '4px 11px', borderRadius: 8, border: `1.5px solid ${chartParam === p ? '#1565D8' : '#E2E8F0'}`,
              background: chartParam === p ? '#EFF6FF' : '#fff', color: chartParam === p ? '#1565D8' : '#64748B',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              {p === 'glucose' ? 'Gula Darah' : 'Tensi'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: isHigh ? '#EF4444' : '#059669', fontFamily: 'IBM Plex Mono, monospace', fontVariantNumeric: 'tabular-nums' }}>
            {currentVal}
          </span>
          <span style={{ fontSize: 13, color: '#64748B' }}>{unit}</span>
          <StatusPill label={isHigh ? 'Di atas Normal' : 'Normal'} risk={isHigh ? 'kritis' : 'rendah'} />
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {([7, 14] as const).map(r => (
            <button key={r} onClick={() => onRangeChange(r)} style={{
              padding: '3px 10px', borderRadius: 7, border: `1.5px solid ${chartRange === r ? '#1565D8' : '#E2E8F0'}`,
              background: chartRange === r ? '#EFF6FF' : '#fff', color: chartRange === r ? '#1565D8' : '#64748B',
              fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}>
              {r}d
            </button>
          ))}
        </div>
      </div>

      <svg viewBox="0 0 672 210" style={{ width: '100%', display: 'block' }}>
        <rect x="48" y={chart.dangerY} width="576" height={chart.dangerH} fill="rgba(239,68,68,0.06)" />
        <line x1="48" y1={chart.dangerY} x2="624" y2={chart.dangerY} stroke="#EF4444" strokeWidth="1.5" strokeDasharray="5 4" />
        <polygon points={chart.areaPoints} fill="rgba(21,101,216,0.07)" />
        <polyline points={chart.linePoints} fill="none" stroke="#1565D8" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
        {chart.dots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r="3" fill="#fff" stroke={d.inDanger ? '#EF4444' : '#1565D8'} strokeWidth="2" />
        ))}
        {chart.yLabels.map((yl, i) => (
          <text key={i} x="42" y={yl.y + 4} textAnchor="end" fontSize="10" fill="#94A3B8">{yl.label}</text>
        ))}
        {chart.xLabels.map((xl, i) => (
          <text key={i} x={xl.x} y="198" textAnchor="middle" fontSize="10" fill="#94A3B8">{xl.label}</text>
        ))}
      </svg>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#475569' }}>
          <span style={{ width: 14, height: 3, background: '#1565D8', borderRadius: 2, display: 'inline-block' }} />
          {paramLabel}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#EF4444' }}>
          <span style={{ width: 14, height: 3, background: '#EF4444', borderRadius: 2, display: 'inline-block' }} />
          Batas Bahaya ({threshold} {unit})
        </span>
      </div>
    </div>
  )
}

// ─── SHAP factors card ────────────────────────────────────────────────────────

function ShapCard({ patientIdx }: { patientIdx: number }) {
  const safeIdx = Math.min(patientIdx, MOCK_SHAP.length - 1)
  const factors = MOCK_SHAP[safeIdx]
  return (
    <div style={{ background: 'linear-gradient(160deg, #FCFAFF 0%, #F5F0FF 100%)', borderRadius: 16, padding: '18px 20px', border: '1.5px solid #E9D5FF', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 18 }}>&#x1F916;</span>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#4C1D95' }}>Atribusi Faktor (AI)</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {factors.map((f, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{f.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: f.color, fontFamily: 'IBM Plex Mono, monospace' }}>{f.valText}</span>
            </div>
            <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: f.barWidth, background: f.barBg, borderRadius: 4 }} />
            </div>
            <p style={{ fontSize: 11, color: '#64748B', margin: '3px 0 0' }}>{f.note}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 14, paddingTop: 12, borderTop: '1px solid #E9D5FF' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748B' }}>
          <span style={{ width: 10, height: 10, background: '#EF4444', borderRadius: 2, display: 'inline-block' }} />
          Menaikkan risiko
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748B' }}>
          <span style={{ width: 10, height: 10, background: '#00B894', borderRadius: 2, display: 'inline-block' }} />
          Menurunkan risiko
        </span>
      </div>
    </div>
  )
}

// ─── Log harian card ──────────────────────────────────────────────────────────

function LogCard({ patientIdx }: { patientIdx: number }) {
  const safeIdx = Math.min(patientIdx, MOCK_LOGS.length - 1)
  const logs = MOCK_LOGS[safeIdx]
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#1E293B' }}>Log Harian Pasien</span>
        <span style={{ background: '#E5FBF6', border: '1px solid #B2F0E4', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: '#00A382' }}>
          via WhatsApp &middot; hari ini
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {logs.map((log, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: i < logs.length - 1 ? 14 : 0 }}>
            <span style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'IBM Plex Mono, monospace', minWidth: 36, textAlign: 'right', paddingTop: 2 }}>{log.time}</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: log.dot, flexShrink: 0 }} />
              {i < logs.length - 1 && <div style={{ width: 2, flex: 1, background: '#E2E8F0', marginTop: 4, minHeight: 20 }} />}
            </div>
            <div style={{ flex: 1, paddingBottom: i < logs.length - 1 ? 4 : 0 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{log.text}</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#64748B' }}>{log.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Feedback card ────────────────────────────────────────────────────────────

function FeedbackCard({
  patient,
  feedbacks,
  onFeedback,
}: {
  patient: PatientQueueItem
  feedbacks: Record<string, 'tepat' | 'tidak'>
  onFeedback: (id: string, val: 'tepat' | 'tidak') => void
}) {
  const given = feedbacks[patient.patient_id]
  return (
    <div style={{ background: '#0F2444', borderRadius: 16, padding: '18px 20px' }}>
      <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 15, color: '#fff' }}>Umpan Balik Eskalasi</p>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>
        Apakah eskalasi untuk <span style={{ color: '#E2E8F0', fontWeight: 600 }}>{patient.full_name}</span> karena{' '}
        <em>{patient.main_factor || 'faktor klinis'}</em> sudah tepat?
      </p>
      {given ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>{given === 'tepat' ? '✅' : '❌'}</span>
            <span style={{ color: given === 'tepat' ? '#00B894' : '#EF4444', fontWeight: 700, fontSize: 14 }}>
              Ditandai: {given === 'tepat' ? 'Tepat' : 'Tidak Tepat'}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>Terima kasih — umpan balik Anda membantu meningkatkan model AI.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => onFeedback(patient.patient_id, 'tepat')} style={{
            flex: 1, padding: '10px 0', borderRadius: 10, border: '2px solid #00B894',
            background: 'transparent', color: '#00B894', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            ✓ Tepat
          </button>
          <button onClick={() => onFeedback(patient.patient_id, 'tidak')} style={{
            flex: 1, padding: '10px 0', borderRadius: 10, border: '2px solid #EF4444',
            background: 'transparent', color: '#EF4444', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            ✗ Tidak Tepat
          </button>
        </div>
      )}
      <p style={{ margin: '14px 0 0', fontSize: 11, color: '#475569', fontStyle: 'italic' }}>
        Umpan balik bersifat anonim dan digunakan untuk pelatihan ulang model secara berkala.
      </p>
    </div>
  )
}

// ─── Main page component ──────────────────────────────────────────────────────

export default function DokterDashboardPage() {
  const { user, logout } = useAuth()

  const [activeView, setActiveView] = useState<ActiveView>('antrean')
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [queue, setQueue] = useState<PatientQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [contacted, setContacted] = useState<Set<string>>(new Set())
  const [feedbacks, setFeedbacks] = useState<Record<string, 'tepat' | 'tidak'>>({})
  const [chartParam, setChartParam] = useState<'glucose' | 'bp'>('glucose')
  const [chartRange, setChartRange] = useState<7 | 14>(7)
  const [trenPatientId, setTrenPatientId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type })
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 3800)
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const [sum, queueRes] = await Promise.all([
        nakesApi.getDashboardSummary(),
        nakesApi.getPatientQueue(),
      ])
      setSummary(sum)
      setQueue(queueRes.data)
      setFetchError(null)
    } catch {
      setFetchError('Gagal memuat data. Periksa koneksi Anda.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    intervalRef.current = setInterval(fetchData, 60_000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [fetchData])

  const filteredQueue = useMemo(() => {
    if (queueFilter === 'all') return queue
    return queue.filter(p => p.status === queueFilter)
  }, [queue, queueFilter])

  const selectedPatient = useMemo(() => queue.find(p => p.patient_id === selectedId) ?? null, [queue, selectedId])
  const selectedIdx = useMemo(() => queue.findIndex(p => p.patient_id === selectedId), [queue, selectedId])

  const trenPatient = useMemo(() => queue.find(p => p.patient_id === trenPatientId) ?? null, [queue, trenPatientId])
  const trenIdx = useMemo(() => queue.findIndex(p => p.patient_id === trenPatientId), [queue, trenPatientId])

  const handleContact = useCallback((id: string) => {
    setContacted(prev => new Set([...prev, id]))
    showToast('Pasien berhasil dihubungi', 'ok')
  }, [showToast])

  const handleFeedback = useCallback((id: string, val: 'tepat' | 'tidak') => {
    setFeedbacks(prev => ({ ...prev, [id]: val }))
    showToast(`Umpan balik "${val === 'tepat' ? 'Tepat' : 'Tidak Tepat'}" tersimpan`, 'ok')
  }, [showToast])

  const handleLogout = useCallback(async () => {
    try { await logout() } catch { /* ignore */ }
  }, [logout])

  // KPI values
  const bahayaCount = summary?.risiko_bahaya ?? 0
  const waswasCount = queue.filter(p => p.status === 'waswas').length
  const amanCount = summary?.status_aman ?? 0
  const totalCount = summary?.total_pasien ?? queue.length

  // Umpan balik stats
  const tepat = Object.values(feedbacks).filter(v => v === 'tepat').length
  const tidak = Object.values(feedbacks).filter(v => v === 'tidak').length
  const totalFb = tepat + tidak
  const akurasi = totalFb > 0 ? Math.round((tepat / totalFb) * 100) : 0

  const safeSelectedIdx = selectedIdx >= 0 ? selectedIdx : 0
  const safeTrenIdx = trenIdx >= 0 ? trenIdx : 0
  const safeTrenMetrics = MOCK_METRICS[Math.min(safeTrenIdx, MOCK_METRICS.length - 1)]

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Plus Jakarta Sans, sans-serif', background: '#F4F5F7' }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #c1c9d8; border-radius: 3px; }
      `}</style>

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside style={{
        width: 256, minWidth: 256, background: '#fff', borderRight: '1px solid #E2E8F0',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LogoImg size={32} />
            <div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: '#1E293B', letterSpacing: '-0.3px' }}>sehatiku</p>
              <p style={{ margin: 0, fontSize: 10, color: '#94A3B8', fontWeight: 500 }}>Portal Dokter</p>
            </div>
          </div>
        </div>

        {/* Doctor badge */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'linear-gradient(135deg, #00B894 0%, #00A382 100%)',
            borderRadius: 12, padding: '10px 12px',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 13,
            }}>
              {initials(user?.name ?? 'DR')}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#fff' }}>{user?.name ?? 'Dokter'}</p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
                {user?.role === 'dokter' ? 'Dokter Umum' : user?.role === 'kader' ? 'Kader Kesehatan' : 'Admin'}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ padding: '14px 12px 8px', flex: 1, overflowY: 'auto' }}>
          <p style={{ margin: '0 0 8px 6px', fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Menu Klinis</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {(
              [
                { id: 'antrean' as const, label: 'Antrean Prioritas', icon: '☰' },
                { id: 'tren' as const, label: 'Tren & Riwayat', icon: '∼' },
                { id: 'umpan' as const, label: 'Umpan Balik Model', icon: '👍' },
              ]
            ).map(nav => {
              const active = activeView === nav.id
              return (
                <button key={nav.id} onClick={() => setActiveView(nav.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10,
                  border: 'none', background: active ? '#E5FBF6' : 'transparent',
                  borderLeft: `3px solid ${active ? '#00B894' : 'transparent'}`,
                  color: active ? '#00A382' : '#475569', cursor: 'pointer', width: '100%', textAlign: 'left',
                  fontWeight: active ? 700 : 500, fontSize: 13, fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}>
                  <span style={{ fontSize: 15, color: active ? '#00B894' : '#64748B', width: 20, textAlign: 'center' }}>{nav.icon}</span>
                  {nav.label}
                  {nav.id === 'antrean' && totalCount > 0 && (
                    <span style={{ marginLeft: 'auto', background: '#00B894', color: '#fff', borderRadius: 12, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                      {totalCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div style={{ margin: '14px 0 8px', borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
            <p style={{ margin: '0 0 8px 6px', fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Ringkasan Pasien Saya</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ background: '#FDF5FF', border: '1px solid rgba(123,97,255,0.1)', borderRadius: 10, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#6B21A8', fontWeight: 500 }}>Risiko Bahaya</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#7B61FF', fontFamily: 'IBM Plex Mono, monospace' }}>{bahayaCount}</span>
              </div>
              <div style={{ background: '#F0FAFF', border: '1px solid rgba(79,195,247,0.14)', borderRadius: 10, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#0369A1', fontWeight: 500 }}>Perlu Pantau</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#0288A0', fontFamily: 'IBM Plex Mono, monospace' }}>{waswasCount}</span>
              </div>
              <div style={{ background: '#F0FDF8', border: '1px solid rgba(0,184,148,0.12)', borderRadius: 10, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#065F46', fontWeight: 500 }}>Status Aman</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#00B894', fontFamily: 'IBM Plex Mono, monospace' }}>{amanCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom user card + logout */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <AvatarCircle name={user?.name ?? 'D'} size={32} bg="#00B894" />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{user?.name ?? 'Dokter'}</p>
              <p style={{ margin: 0, fontSize: 10, color: '#64748B' }}>
                {user?.role === 'dokter' ? 'Dokter Umum' : user?.role === 'kader' ? 'Kader Kesehatan' : 'Dokter'}
              </p>
            </div>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00B894', animation: 'blink 2s infinite', display: 'inline-block' }} />
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8,
            padding: '7px 12px', fontSize: 12, fontWeight: 600, color: '#DC2626', cursor: 'pointer',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Keluar
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          height: 58, background: '#fff', borderBottom: '1px solid #E2E8F0', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px',
        }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#1E293B' }}>
              {activeView === 'antrean' ? 'Antrean Prioritas' : activeView === 'tren' ? 'Tren & Riwayat Klinis' : 'Umpan Balik Model'}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>
              {activeView === 'antrean'
                ? `${totalCount} pasien terdaftar`
                : activeView === 'tren'
                ? 'Riwayat 6 bulan terakhir'
                : 'Evaluasi eskalasi AI'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#E5FBF6', border: '1px solid #B2F0E4', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#00A382' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00B894', animation: 'blink 1.5s infinite', display: 'inline-block' }} />
              Mode: Dokter
            </span>
            <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {bahayaCount > 0 && (
                <span style={{
                  position: 'absolute', top: 0, right: 0, width: 14, height: 14,
                  background: '#7B61FF', borderRadius: '50%', fontSize: 9, fontWeight: 700,
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {bahayaCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* View area */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {/* Error state */}
          {fetchError && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 12 }}>
              <span style={{ fontSize: 36 }}>&#x26A0;&#xFE0F;</span>
              <p style={{ margin: 0, fontSize: 15, color: '#64748B' }}>{fetchError}</p>
              <button onClick={fetchData} style={{
                background: '#1565D8', color: '#fff', border: 'none', borderRadius: 8,
                padding: '8px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}>
                Coba Lagi
              </button>
            </div>
          )}

          {/* ── VIEW 1: Antrean Prioritas ─────────────────────────────────────── */}
          {!fetchError && activeView === 'antrean' && (
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

              {/* Left queue panel */}
              <div style={{ width: 340, minWidth: 340, borderRight: '1px solid #E2E8F0', background: '#FAFCFF', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '16px 16px 10px', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#1E293B' }}>Pasien Saya</span>
                    <span style={{ background: '#EFF6FF', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700, color: '#1565D8' }}>
                      {queue.length} pasien
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {(['all', 'bahaya', 'waswas', 'aman'] as const).map(f => (
                      <button key={f} onClick={() => setQueueFilter(f)} style={{
                        padding: '4px 10px', borderRadius: 20, border: `1.5px solid ${queueFilter === f ? '#1565D8' : '#E2E8F0'}`,
                        background: queueFilter === f ? '#EFF6FF' : '#fff', color: queueFilter === f ? '#1565D8' : '#64748B',
                        fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                      }}>
                        {f === 'all' ? 'Semua' : f === 'bahaya' ? 'Bahaya' : f === 'waswas' ? 'Waswas' : 'Aman'}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} h={88} />)
                  ) : filteredQueue.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8, paddingTop: 60 }}>
                      <span style={{ fontSize: 36 }}>&#x1F389;</span>
                      <p style={{ margin: 0, fontSize: 14, color: '#64748B', textAlign: 'center' }}>Tidak ada pasien di kategori ini.</p>
                    </div>
                  ) : (
                    filteredQueue.map(p => {
                      const c = RISK_COLOR[p.risk_label]
                      const sel = p.patient_id === selectedId
                      const needsContact = !contacted.has(p.patient_id) && (p.status === 'bahaya' || p.status === 'waswas')
                      return (
                        <div
                          key={p.patient_id}
                          onClick={() => setSelectedId(p.patient_id)}
                          style={{
                            background: '#fff', borderRadius: 12, padding: '12px 13px', cursor: 'pointer',
                            borderLeft: `4px solid ${c.edge}`,
                            outline: sel ? `2px solid ${c.edge}` : '2px solid transparent',
                            boxShadow: sel ? `0 4px 14px ${c.edge}33` : '0 1px 3px rgba(0,0,0,0.06)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1 }}>
                              <AvatarCircle name={p.full_name} size={36} bg={c.sqBg} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 13, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.full_name}</p>
                                <p style={{ margin: 0, fontSize: 11, color: '#64748B' }}>{p.age} thn &middot; {DISEASE_LABEL[p.disease_type]}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
                                  <StatusPill label={p.status === 'bahaya' ? 'Bahaya' : p.status === 'waswas' ? 'Waswas' : 'Aman'} risk={p.risk_label} />
                                  {p.main_factor && <span style={{ fontSize: 10, color: '#94A3B8' }}>{p.main_factor}</span>}
                                </div>
                              </div>
                            </div>
                            <RiskScoreBadge label={p.risk_label} score={p.risk_score} />
                          </div>
                          {needsContact && (
                            <div style={{ marginTop: 8, background: '#F5F3FF', borderRadius: 6, padding: '4px 8px' }}>
                              <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: '#7C3AED' }}>&#x26A1; Perlu dihubungi hari ini</p>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Right detail panel */}
              <div style={{ flex: 1, minWidth: 560, overflowY: 'auto', padding: '20px 24px' }}>
                {!selectedPatient ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
                    <span style={{ fontSize: 48 }}>&#x1F468;&#x200D;&#x2695;&#xFE0F;</span>
                    <p style={{ margin: 0, fontSize: 15, color: '#94A3B8', fontWeight: 500 }}>Pilih pasien untuk melihat detail</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#CBD5E1' }}>Klik kartu pasien di panel kiri</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Patient header */}
                    <div style={{ background: '#fff', borderRadius: 16, padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                          <AvatarCircle name={selectedPatient.full_name} size={58} bg={RISK_COLOR[selectedPatient.risk_label].sqBg} />
                          <div>
                            <p style={{ margin: '0 0 6px', fontWeight: 800, fontSize: 20, color: '#1E293B' }}>{selectedPatient.full_name}</p>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                              <DiseasePill type={selectedPatient.disease_type} />
                              <StatusPill
                                label={selectedPatient.status === 'bahaya' ? 'Bahaya' : selectedPatient.status === 'waswas' ? 'Waswas' : 'Aman'}
                                risk={selectedPatient.risk_label}
                              />
                            </div>
                            <p style={{ margin: '5px 0 0', fontSize: 12, color: '#64748B' }}>
                              {selectedPatient.age} tahun &middot; Pasien Prolanis
                              {selectedPatient.main_factor && <> &middot; <em>{selectedPatient.main_factor}</em></>}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 62, height: 62, borderRadius: 16,
                            background: RISK_COLOR[selectedPatient.risk_label].sqBg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 800, fontSize: 24,
                            fontFamily: 'IBM Plex Mono, monospace', fontVariantNumeric: 'tabular-nums',
                          }}>
                            {selectedPatient.risk_score}
                          </div>
                          {contacted.has(selectedPatient.patient_id) ? (
                            <span style={{
                              background: '#E5FBF6', border: '1px solid #B2F0E4', borderRadius: 8,
                              padding: '7px 14px', fontSize: 12, fontWeight: 700, color: '#00A382',
                            }}>
                              ✓ Sudah Dihubungi
                            </span>
                          ) : (
                            <button onClick={() => handleContact(selectedPatient.patient_id)} style={{
                              background: '#00B894', border: 'none', borderRadius: 8,
                              padding: '7px 14px', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer',
                              fontFamily: 'Plus Jakarta Sans, sans-serif',
                            }}>
                              &#x1F4DE; Hubungi
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
                        <p style={{ margin: 0, fontSize: 11, color: '#94A3B8', fontStyle: 'italic' }}>
                          &#x26A0;&#xFE0F; Risk Score &amp; atribusi bersifat indikatif &mdash; bukan diagnosis medis.
                        </p>
                      </div>
                    </div>

                    {/* Chart + SHAP */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 14 }}>
                      <TrendChart
                        patientIdx={safeSelectedIdx}
                        chartParam={chartParam}
                        chartRange={chartRange}
                        onParamChange={setChartParam}
                        onRangeChange={setChartRange}
                      />
                      <ShapCard patientIdx={safeSelectedIdx} />
                    </div>

                    {/* Log + Feedback */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 14 }}>
                      <LogCard patientIdx={safeSelectedIdx} />
                      <FeedbackCard patient={selectedPatient} feedbacks={feedbacks} onFeedback={handleFeedback} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── VIEW 2: Tren & Riwayat ────────────────────────────────────────── */}
          {!fetchError && activeView === 'tren' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '22px 26px' }}>
              {/* Patient chips */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} w="100px" h={36} />)
                  : queue.map(p => {
                    const sel = p.patient_id === trenPatientId
                    return (
                      <button key={p.patient_id} onClick={() => setTrenPatientId(p.patient_id)} style={{
                        display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 20,
                        border: `1.5px solid ${sel ? '#1565D8' : '#E2E8F0'}`,
                        background: sel ? '#1565D8' : '#fff', color: sel ? '#fff' : '#475569',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                      }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%',
                          background: sel ? 'rgba(255,255,255,0.25)' : RISK_COLOR[p.risk_label].sqBg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: 9, fontWeight: 700, flexShrink: 0,
                        }}>
                          {initials(p.full_name)}
                        </div>
                        {p.full_name.split(' ')[0]}
                      </button>
                    )
                  })
                }
              </div>

              {!trenPatient ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 280, gap: 10 }}>
                  <span style={{ fontSize: 36 }}>&#x1F4CA;</span>
                  <p style={{ margin: 0, color: '#94A3B8', fontSize: 14 }}>Pilih pasien untuk melihat tren</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Mini header */}
                  <div style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <AvatarCircle name={trenPatient.full_name} size={44} bg={RISK_COLOR[trenPatient.risk_label].sqBg} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: 16, color: '#1E293B' }}>{trenPatient.full_name}</p>
                        <DiseasePill type={trenPatient.disease_type} />
                        <StatusPill
                          label={trenPatient.status === 'bahaya' ? 'Bahaya' : trenPatient.status === 'waswas' ? 'Waswas' : 'Aman'}
                          risk={trenPatient.risk_label}
                        />
                      </div>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>
                        {trenPatient.age} tahun &middot; Riwayat 6 bulan
                        <span style={{ marginLeft: 10, fontWeight: 700, color: safeTrenMetrics.deltaColor }}>
                          {safeTrenMetrics.delta} {safeTrenMetrics.deltaLabel}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Risk score bar chart */}
                  <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: 15, color: '#1E293B' }}>Tren Risk Score</p>
                    <p style={{ margin: '0 0 16px', fontSize: 11, color: '#94A3B8' }}>skor risiko bulanan (0&ndash;100) &middot; semakin tinggi semakin buruk</p>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
                      {(MOCK_RISK_TREND[Math.min(safeTrenIdx, MOCK_RISK_TREND.length - 1)]).map((entry, i) => {
                        const barColor = entry.score >= 80 ? '#EF4444' : entry.score >= 50 ? '#F59E0B' : '#00B894'
                        const barH = Math.round((entry.score / 100) * 120)
                        return (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: barColor, fontFamily: 'IBM Plex Mono, monospace' }}>{entry.score}</span>
                            <div style={{ width: '100%', height: barH, background: barColor, borderRadius: '6px 6px 0 0' }} />
                            <span style={{ fontSize: 11, color: '#64748B' }}>{entry.month}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Clinical metrics */}
                  <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <p style={{ margin: '0 0 14px', fontWeight: 700, fontSize: 15, color: '#1E293B' }}>Parameter Klinis Terkini</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                      {safeTrenMetrics.metrics.map((m, i) => (
                        <div key={i} style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px 14px' }}>
                          <p style={{ margin: '0 0 4px', fontSize: 11, color: '#64748B' }}>{m.label}</p>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                            <span style={{ fontSize: 20, fontWeight: 800, color: '#1E293B', fontFamily: 'IBM Plex Mono, monospace', fontVariantNumeric: 'tabular-nums' }}>{m.value}</span>
                            {m.unit && <span style={{ fontSize: 10, color: '#94A3B8' }}>{m.unit}</span>}
                          </div>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: m.trendBg, borderRadius: 6, padding: '2px 7px', fontSize: 11, fontWeight: 700, color: m.trendColor, marginTop: 4 }}>
                            {m.arrow} {m.deltaTxt}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, fontSize: 15, color: '#1E293B' }}>Riwayat Klinis</p>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {safeTrenMetrics.timeline.map((tl, i) => {
                        const last = i === safeTrenMetrics.timeline.length - 1
                        return (
                          <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: last ? 0 : 16 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <span style={{ width: 12, height: 12, borderRadius: '50%', background: tl.color, flexShrink: 0 }} />
                              {!last && <div style={{ width: 2, flex: 1, background: '#E2E8F0', marginTop: 4, minHeight: 24 }} />}
                            </div>
                            <div style={{ paddingBottom: last ? 0 : 4 }}>
                              <p style={{ margin: '0 0 2px', fontSize: 11, color: '#94A3B8' }}>{tl.date}</p>
                              <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 13, color: '#1E293B' }}>{tl.title}</p>
                              <p style={{ margin: 0, fontSize: 12, color: '#64748B' }}>{tl.note}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── VIEW 3: Umpan Balik Model ─────────────────────────────────────── */}
          {!fetchError && activeView === 'umpan' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '22px 26px' }}>
              {/* KPI cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} h={90} />)
                ) : (
                  <>
                    <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTop: '3px solid #1565D8' }}>
                      <p style={{ margin: '0 0 4px', fontSize: 12, color: '#64748B' }}>Total Eskalasi</p>
                      <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#1565D8', fontFamily: 'IBM Plex Mono, monospace' }}>
                        {queue.filter(p => p.status === 'bahaya').length}
                      </p>
                    </div>
                    <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTop: '3px solid #00B894' }}>
                      <p style={{ margin: '0 0 4px', fontSize: 12, color: '#64748B' }}>Ditandai Tepat</p>
                      <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#00B894', fontFamily: 'IBM Plex Mono, monospace' }}>{tepat}</p>
                    </div>
                    <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTop: '3px solid #EF4444' }}>
                      <p style={{ margin: '0 0 4px', fontSize: 12, color: '#64748B' }}>Tidak Tepat</p>
                      <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#EF4444', fontFamily: 'IBM Plex Mono, monospace' }}>{tidak}</p>
                    </div>
                    <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTop: '3px solid #7B61FF' }}>
                      <p style={{ margin: '0 0 4px', fontSize: 12, color: '#64748B' }}>Akurasi Eskalasi</p>
                      <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#7B61FF', fontFamily: 'IBM Plex Mono, monospace' }}>{akurasi}%</p>
                    </div>
                  </>
                )}
              </div>

              {/* Info banner */}
              <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 12, padding: '14px 18px', marginBottom: 18 }}>
                <p style={{ margin: 0, fontSize: 13, color: '#4C1D95', lineHeight: 1.6 }}>
                  <strong>&#x1F916; Tentang Umpan Balik:</strong> Penilaian Anda membantu model AI belajar dari pengalaman klinis nyata.
                  Setiap umpan balik digunakan dalam siklus RLHF (Reinforcement Learning from Human Feedback) untuk meningkatkan akurasi eskalasi berikutnya.
                </p>
              </div>

              {/* Escalation table */}
              <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <p style={{ margin: '0 0 16px', fontWeight: 700, fontSize: 15, color: '#1E293B' }}>Eskalasi untuk Dinilai</p>
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} h={60} />)}
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
                    <thead>
                      <tr>
                        {['Pasien', 'Penyebab & Penyakit', 'Risk Score', 'Status Umpan Balik', 'Aksi'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '0 12px 8px', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queue.map(p => {
                        const given = feedbacks[p.patient_id]
                        return (
                          <tr key={p.patient_id}>
                            <td style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: '10px 0 0 10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <AvatarCircle name={p.full_name} size={32} bg={RISK_COLOR[p.risk_label].sqBg} />
                                <div>
                                  <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 13, color: '#1E293B' }}>{p.full_name}</p>
                                  <StatusPill label={p.status === 'bahaya' ? 'Bahaya' : p.status === 'waswas' ? 'Waswas' : 'Aman'} risk={p.risk_label} />
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '10px 12px', background: '#F8FAFC' }}>
                              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#1E293B' }}>{p.main_factor || '—'}</p>
                              <DiseasePill type={p.disease_type} />
                            </td>
                            <td style={{ padding: '10px 12px', background: '#F8FAFC', textAlign: 'center' }}>
                              <div style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: 38, height: 38, borderRadius: 10, background: RISK_COLOR[p.risk_label].sqBg,
                                color: '#fff', fontWeight: 800, fontSize: 14, fontFamily: 'IBM Plex Mono, monospace',
                              }}>
                                {p.risk_score}
                              </div>
                            </td>
                            <td style={{ padding: '10px 12px', background: '#F8FAFC' }}>
                              {given ? (
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 5,
                                  background: given === 'tepat' ? '#E5FBF6' : '#FEF2F2',
                                  border: `1px solid ${given === 'tepat' ? '#B2F0E4' : '#FECACA'}`,
                                  borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                                  color: given === 'tepat' ? '#00A382' : '#DC2626',
                                }}>
                                  {given === 'tepat' ? '✓ Tepat' : '✗ Tidak Tepat'}
                                </span>
                              ) : (
                                <span style={{ fontSize: 11, color: '#94A3B8' }}>Belum dinilai</span>
                              )}
                            </td>
                            <td style={{ padding: '10px 12px', background: '#F8FAFC', borderRadius: '0 10px 10px 0' }}>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => handleFeedback(p.patient_id, 'tepat')} title="Tepat" style={{
                                  width: 38, height: 38, borderRadius: 8,
                                  border: `2px solid #00B894`,
                                  background: given === 'tepat' ? '#00B894' : '#fff',
                                  color: given === 'tepat' ? '#fff' : '#00B894',
                                  cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  ✓
                                </button>
                                <button onClick={() => handleFeedback(p.patient_id, 'tidak')} title="Tidak Tepat" style={{
                                  width: 38, height: 38, borderRadius: 8,
                                  border: `2px solid #EF4444`,
                                  background: given === 'tidak' ? '#EF4444' : '#fff',
                                  color: given === 'tidak' ? '#fff' : '#EF4444',
                                  cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  ✗
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && <ToastNotif msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
