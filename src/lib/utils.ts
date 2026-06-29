import type { RiskLabel, PatientStatus, DiseaseType } from './types'

/** risk_score → risk_label (mirrors backend logic) */
export function riskScoreToLabel(score: number): RiskLabel {
  if (score >= 80) return 'kritis'
  if (score >= 50) return 'sedang'
  return 'rendah'
}

/** risk_label / status → hex fill color (Hijau/Kuning/Merah palette) */
export function statusToColor(status: PatientStatus | RiskLabel): string {
  if (status === 'aman' || status === 'rendah') return '#10B981'
  if (status === 'waswas' || status === 'sedang') return '#F59E0B'
  return '#EF4444'
}

/** risk_score → background color for score badges */
export function scoreToColor(score: number): string {
  if (score >= 80) return '#EF4444'
  if (score >= 50) return '#F59E0B'
  return '#10B981'
}

/** disease_type → label Bahasa Indonesia */
export function diseaseLabel(type: DiseaseType): string {
  if (type === 'diabetes_t2') return 'Diabetes'
  if (type === 'hypertension') return 'Hipertensi'
  return 'Diabetes + Hipertensi'
}

/** ISO 8601 → "12 Jan 2025" */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso))
}

/** ISO 8601 → "12 Jan 2025, 08:30" */
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

/** "2025-01-12" → "12 Januari 2025" */
export function formatDateLong(yyyymmdd: string): string {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(yyyymmdd))
}

/** First two words, uppercased initials */
export function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

/** Validate Indonesian phone number (starts with 08 or 628) */
export function isValidPhone(phone: string): boolean {
  return /^(08|628)\d{8,12}$/.test(phone.replace(/[\s\-]/g, ''))
}

/** Validate 16-digit NIK */
export function isValidNik(nik: string): boolean {
  return /^\d{16}$/.test(nik)
}
