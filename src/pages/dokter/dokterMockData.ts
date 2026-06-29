import type { PatientComplaint } from '../../lib/types'

export interface ShapFactor {
  label: string
  valText: string
  color: string
  barWidth: string
  barBg: string
  note: string
}

export interface LogEntry {
  time: string
  dot: string
  text: string
  detail: string
}

export interface RiskTrendEntry {
  score: number
  month: string
}

export interface MetricItem {
  label: string
  value: string
  unit: string
  arrow: string
  deltaTxt: string
  trendBg: string
  trendColor: string
}

export interface TimelineEntry {
  color: string
  date: string
  title: string
  note: string
}

export interface MockMetricSet {
  metrics: MetricItem[]
  timeline: TimelineEntry[]
  deltaColor: string
  delta: string
  deltaLabel: string
}

export const MOCK_SHAP: ShapFactor[][] = [
  [
    { label: 'HbA1c', valText: '10.2%', color: '#EF4444', barWidth: '88%', barBg: '#EF4444', note: '> 7% — zona kritis, +2.4 poin risiko' },
    { label: 'Kepatuhan Obat', valText: '40%', color: '#EF4444', barWidth: '72%', barBg: '#EF4444', note: 'Hanya 2–3 dari 7 hari — dampak besar' },
    { label: 'Gula Darah Puasa', valText: '215 mg/dL', color: '#EF4444', barWidth: '65%', barBg: '#EF4444', note: 'Normal < 100 mg/dL' },
    { label: 'Aktivitas Fisik', valText: '1 hari/minggu', color: '#0D9488', barWidth: '45%', barBg: '#0D9488', note: 'Menurunkan risiko +0.8 poin' },
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
    { label: 'Aktivitas Fisik', valText: '3 hari/minggu', color: '#0D9488', barWidth: '55%', barBg: '#0D9488', note: 'Cukup baik, pertahankan' },
    { label: 'BMI', valText: '26.1', color: '#F59E0B', barWidth: '28%', barBg: '#F59E0B', note: 'Overweight ringan' },
  ],
  [
    { label: 'Tensi Sistolik', valText: '148 mmHg', color: '#F59E0B', barWidth: '62%', barBg: '#F59E0B', note: 'Stage 2 hipertensi (130-139)' },
    { label: 'Kepatuhan Obat', valText: '57%', color: '#EF4444', barWidth: '55%', barBg: '#EF4444', note: 'Hanya 4 dari 7 hari — risiko rebound' },
    { label: 'Gula Darah', valText: '138 mg/dL', color: '#F59E0B', barWidth: '45%', barBg: '#F59E0B', note: 'Mendekati batas atas (< 140)' },
    { label: 'Makan Sehat', valText: '43%', color: '#0D9488', barWidth: '38%', barBg: '#0D9488', note: 'Ada peningkatan dari minggu lalu' },
    { label: 'Olahraga', valText: '2 hari/minggu', color: '#0D9488', barWidth: '32%', barBg: '#0D9488', note: 'Setara 60 menit — efek positif' },
  ],
  [
    { label: 'Tensi Sistolik', valText: '124 mmHg', color: '#0D9488', barWidth: '82%', barBg: '#0D9488', note: 'Dalam target — sangat baik' },
    { label: 'Kepatuhan Obat', valText: '100%', color: '#0D9488', barWidth: '95%', barBg: '#0D9488', note: 'Sempurna 7/7 hari' },
    { label: 'Aktivitas Fisik', valText: '5 hari/minggu', color: '#0D9488', barWidth: '78%', barBg: '#0D9488', note: 'Excellent — menurunkan risiko -2.1 poin' },
    { label: 'BMI', valText: '22.8', color: '#0D9488', barWidth: '60%', barBg: '#0D9488', note: 'Normal — berdampak positif' },
    { label: 'Gula Darah', valText: '92 mg/dL', color: '#0D9488', barWidth: '45%', barBg: '#0D9488', note: 'Di bawah 100 — sangat baik' },
  ],
]

export const MOCK_LOGS: LogEntry[][] = [
  [
    { time: '07:12', dot: '#0D9488', text: 'Obat pagi diminum ✓', detail: 'Metformin 500mg + Glibenklamid — kepatuhan tercatat' },
    { time: '08:30', dot: '#EF4444', text: 'Gula Darah Puasa: 215 mg/dL', detail: 'Di atas target (<100 mg/dL) — sudah dinotif via WA' },
    { time: '12:45', dot: '#F59E0B', text: 'Makan siang — kurang sehat', detail: 'Nasi putih + goreng-gorengan, tidak ada sayur' },
    { time: '16:00', dot: '#8A93A1', text: 'Tidak ada aktivitas fisik hari ini', detail: 'Target: minimal 30 menit jalan kaki' },
    { time: '21:30', dot: '#0D9488', text: 'Obat malam diminum ✓', detail: 'Metformin 500mg — tercatat' },
  ],
  [
    { time: '06:45', dot: '#EF4444', text: 'Tensi Pagi: 178/105 mmHg', detail: 'Sangat tinggi — eskalasi otomatis terkirim' },
    { time: '07:00', dot: '#8A93A1', text: 'Obat pagi — terlewat', detail: 'Amlodipine 5mg tidak diminum hari ini' },
    { time: '13:00', dot: '#F59E0B', text: 'Makan siang dengan garam tinggi', detail: 'Ikan asin + mie instan — asupan natrium berlebih' },
    { time: '19:00', dot: '#EF4444', text: 'Tensi Malam: 182/112 mmHg', detail: 'Meningkat — perlu tindak lanjut dokter' },
    { time: '22:00', dot: '#8A93A1', text: 'Tidur 04.30 jam', detail: 'Kurang tidur kronis — memperparah hipertensi' },
  ],
  [
    { time: '07:20', dot: '#0D9488', text: 'Obat pagi diminum ✓', detail: 'Metformin 500mg — kepatuhan baik' },
    { time: '09:00', dot: '#F59E0B', text: 'Gula 2 jam pp: 185 mg/dL', detail: 'Sedikit di atas target (< 140 mg/dL)' },
    { time: '12:00', dot: '#0D9488', text: 'Makan siang — cukup sehat', detail: 'Nasi merah + sayur + ikan — pilihan yang baik' },
    { time: '16:00', dot: '#0D9488', text: 'Jalan kaki 30 menit ✓', detail: 'Aktivitas konsisten hari ke-3' },
    { time: '22:00', dot: '#F59E0B', text: 'Tidur 05:00 jam', detail: 'Masih kurang — target 7 jam/hari' },
  ],
  [
    { time: '07:30', dot: '#F59E0B', text: 'Obat pagi — terlewat sekali', detail: 'Amlodipine + Metformin — hanya 1 yang diminum' },
    { time: '10:00', dot: '#F59E0B', text: 'Tensi: 148/92 mmHg', detail: 'Di atas normal — monitoring lanjut' },
    { time: '12:30', dot: '#0D9488', text: 'Makan siang — sehat', detail: 'Sayur bening + tempe bakar + buah' },
    { time: '15:00', dot: '#0D9488', text: 'Olahraga ringan 20 menit', detail: 'Senam lansia — rutin 2x seminggu' },
    { time: '21:00', dot: '#0D9488', text: 'Obat malam diminum ✓', detail: 'Metformin 500mg tercatat' },
  ],
  [
    { time: '06:30', dot: '#0D9488', text: 'Obat pagi diminum ✓', detail: 'Amlodipine 5mg — konsisten 7 hari' },
    { time: '07:00', dot: '#0D9488', text: 'Tensi Pagi: 124/78 mmHg', detail: 'Dalam rentang target — excellent' },
    { time: '08:00', dot: '#0D9488', text: 'Jogging 40 menit ✓', detail: 'Konsisten 5 hari/minggu — dampak sangat positif' },
    { time: '12:30', dot: '#0D9488', text: 'Makan siang — sangat sehat', detail: 'Nasi merah + sayur hijau + ikan kukus' },
    { time: '21:30', dot: '#0D9488', text: 'Semua parameter hari ini ✓', detail: 'Skor diperkirakan membaik besok' },
  ],
]

export const MOCK_GLUCOSE: number[][] = [
  [230, 215, 245, 210, 220, 235, 215, 225, 240, 205, 215, 230, 220, 215],
  [115, 120, 118, 122, 119, 125, 121, 120, 118, 122, 120, 119, 121, 120],
  [175, 180, 168, 185, 172, 190, 178, 182, 175, 168, 180, 185, 175, 185],
  [145, 140, 148, 138, 142, 150, 140, 145, 138, 142, 148, 140, 138, 138],
  [95, 92, 88, 94, 90, 92, 88, 92, 90, 94, 88, 92, 90, 92],
]

export const MOCK_BP: number[][] = [
  [155, 160, 158, 162, 155, 158, 160, 158, 162, 155, 160, 158, 162, 160],
  [182, 178, 185, 180, 178, 182, 178, 180, 178, 182, 178, 178, 180, 178],
  [145, 148, 142, 145, 148, 145, 142, 148, 145, 148, 145, 142, 145, 148],
  [152, 148, 150, 148, 150, 148, 152, 148, 150, 148, 150, 148, 148, 148],
  [128, 125, 126, 124, 125, 126, 124, 125, 126, 124, 126, 124, 124, 124],
]

export const MOCK_RISK_TREND: RiskTrendEntry[][] = [
  [{ score: 55, month: 'Jan' }, { score: 62, month: 'Feb' }, { score: 70, month: 'Mar' }, { score: 78, month: 'Apr' }, { score: 85, month: 'Mei' }, { score: 92, month: 'Jun' }],
  [{ score: 52, month: 'Jan' }, { score: 58, month: 'Feb' }, { score: 65, month: 'Mar' }, { score: 74, month: 'Apr' }, { score: 80, month: 'Mei' }, { score: 87, month: 'Jun' }],
  [{ score: 48, month: 'Jan' }, { score: 52, month: 'Feb' }, { score: 45, month: 'Mar' }, { score: 55, month: 'Apr' }, { score: 50, month: 'Mei' }, { score: 55, month: 'Jun' }],
  [{ score: 60, month: 'Jan' }, { score: 58, month: 'Feb' }, { score: 55, month: 'Mar' }, { score: 52, month: 'Apr' }, { score: 50, month: 'Mei' }, { score: 48, month: 'Jun' }],
  [{ score: 32, month: 'Jan' }, { score: 28, month: 'Feb' }, { score: 30, month: 'Mar' }, { score: 25, month: 'Apr' }, { score: 22, month: 'Mei' }, { score: 25, month: 'Jun' }],
]

export const MOCK_METRICS: MockMetricSet[] = [
  {
    metrics: [
      { label: 'HbA1c', value: '10.2', unit: '%', arrow: '↑', deltaTxt: '+1.8%', trendBg: '#FEF2F2', trendColor: '#EF4444' },
      { label: 'Gula Puasa', value: '215', unit: 'mg/dL', arrow: '↑', deltaTxt: '+45', trendBg: '#FEF2F2', trendColor: '#EF4444' },
      { label: 'BMI', value: '29.4', unit: 'kg/m²', arrow: '→', deltaTxt: 'Stabil', trendBg: '#F7F8FA', trendColor: '#636B78' },
      { label: 'Tekanan Darah', value: '155/98', unit: 'mmHg', arrow: '↑', deltaTxt: '+10', trendBg: '#FEF2F2', trendColor: '#EF4444' },
    ],
    timeline: [
      { color: '#EF4444', date: '10 Jun 2026', title: 'Eskalasi — HbA1c Kritis', note: 'HbA1c 10.2%, gula puasa 215 mg/dL. Pasien dihubungi oleh dr. Ahmad.' },
      { color: '#F59E0B', date: '15 Mei 2026', title: 'Evaluasi Bulanan', note: 'Skor meningkat dari 78 → 85. Kepatuhan obat turun ke 40%.' },
      { color: '#8A93A1', date: '01 Apr 2026', title: 'Konsultasi Rutin', note: 'Tensi dalam batas normal, namun gula darah masih perlu dipantau.' },
    ],
    deltaColor: '#EF4444', delta: '+37', deltaLabel: '↑ memburuk',
  },
  {
    metrics: [
      { label: 'Tensi Sistolik', value: '178', unit: 'mmHg', arrow: '↑', deltaTxt: '+28', trendBg: '#FEF2F2', trendColor: '#EF4444' },
      { label: 'Tensi Diastolik', value: '112', unit: 'mmHg', arrow: '↑', deltaTxt: '+18', trendBg: '#FEF2F2', trendColor: '#EF4444' },
      { label: 'Natrium Urin', value: 'Tinggi', unit: '', arrow: '↑', deltaTxt: 'Naik', trendBg: '#FEF2F2', trendColor: '#EF4444' },
      { label: 'BMI', value: '28.1', unit: 'kg/m²', arrow: '→', deltaTxt: 'Stabil', trendBg: '#F7F8FA', trendColor: '#636B78' },
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
      { label: 'BMI', value: '26.1', unit: 'kg/m²', arrow: '→', deltaTxt: 'Stabil', trendBg: '#F7F8FA', trendColor: '#636B78' },
    ],
    timeline: [
      { color: '#F59E0B', date: '09 Jun 2026', title: 'Monitoring Rutin', note: 'Gula 2j pp 185 mg/dL, masih di atas target. Tidur hanya 5 jam.' },
      { color: '#8A93A1', date: '12 Mei 2026', title: 'Evaluasi Bulanan', note: 'Skor 50 → 55, sedikit memburuk. Disarankan perbaiki pola tidur.' },
      { color: '#0D9488', date: '01 Apr 2026', title: 'Perbaikan Aktivitas', note: 'Pasien mulai rutin olahraga 3x/minggu. Apresiasi diberikan.' },
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
      { color: '#0D9488', date: '08 Jun 2026', title: 'Tren Membaik', note: 'Skor turun 50 → 48. Kepatuhan obat naik ke 57%, terus membaik.' },
      { color: '#F59E0B', date: '15 Mei 2026', title: 'Monitoring DM+HT', note: 'Kedua kondisi perlu dikontrol. Kombinasi terapi sedang dievaluasi.' },
      { color: '#8A93A1', date: '01 Apr 2026', title: 'Konsultasi Nutrisi', note: 'Diet rendah garam dan rendah GI dimulai. Dampak positif terlihat.' },
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
      { color: '#0D9488', date: '10 Jun 2026', title: 'Status Terkontrol', note: 'Semua parameter dalam target. Tensi 124/78, gula 92. Pasien sangat kooperatif.' },
      { color: '#0D9488', date: '01 Mei 2026', title: 'Capaian Terapi', note: 'Skor turun 32 → 25. Salah satu pasien dengan progres terbaik bulan ini.' },
      { color: '#0D9488', date: '01 Mar 2026', title: 'Mulai Program Intensif', note: 'Pasien bergabung program olahraga dan diet khusus. Dampak langsung terlihat.' },
    ],
    deltaColor: '#059669', delta: '-7', deltaLabel: '↓ membaik',
  },
]

export const INITIAL_COMPLAINTS: Record<string, PatientComplaint> = {
  p1: {
    patient_id: 'p1',
    category: 'Konsultasi Dokter',
    complaint: 'Kaki kiri terasa kesemutan hebat dan baal (mati rasa) terus-menerus, terutama saat malam hari sebelum tidur, disertai rasa nyeri seperti tertusuk jarum.',
    since_when: '5 hari yang lalu',
    question: 'Apakah kesemutan ini merupakan tanda komplikasi saraf akibat penyakit diabetes saya? Bagaimana cara meredakannya dok?',
    status: 'Waiting for Doctor Review',
  },
  p2: {
    patient_id: 'p2',
    category: 'Laporkan Keluhan',
    complaint: 'Saya merasakan pusing berputar dan tengkuk terasa sangat tegang. Tensi saya ukur mandiri di rumah menunjukkan angka 170/105 mmHg, padahal saya teratur minum Amlodipine 5mg setiap pagi.',
    since_when: '3 hari terakhir',
    question: 'Apakah tensi setinggi ini berbahaya dok? Apakah saya perlu minum obat tambahan atau segera periksa langsung?',
    status: 'Waiting for Doctor Review',
  },
  p3: {
    patient_id: 'p3',
    category: 'Minta Review Hasil',
    complaint: 'Perut saya terasa sangat kembung, begah, dan kadang disertai mual sesaat setelah mengonsumsi tablet Metformin 500mg pasca makan.',
    since_when: 'Sejak 2 hari yang lalu (setelah diresepkan obat baru)',
    question: 'Bagaimana cara meminimalkan rasa mual ini dok? Apakah obatnya boleh dijeda atau diminum di tengah-tengah makan?',
    status: 'Waiting for Doctor Review',
  }
}
