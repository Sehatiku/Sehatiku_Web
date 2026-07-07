import { useState } from 'react'
import type { PatientQueueItem, NakesPatientBrief, BriefTrajectoryDay, BriefRiskInfo, BriefMedAdherence, BriefEscalationSummary } from '../../../lib/types'
import { formatDate, formatDateTime } from '../../../lib/utils'
import { nakesApi } from '../../../lib/api'
import { AvatarCircle, StatusPill, getSafeRiskColor } from './Common'

export interface BriefModalProps {
  patient: PatientQueueItem
  brief: NakesPatientBrief | null
  loading: boolean
  onClose: () => void
}

const WEEKDAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu', 'Minggu']
const WEEKDAY_SHORT: Record<string, string> = { Senin: 'Sen', Selasa: 'Sel', Rabu: 'Rab', Kamis: 'Kam', "Jum'at": 'Jum', Sabtu: 'Sab', Minggu: 'Min' }

const TIER_LABEL: Record<string, string> = { acute_today: 'Akut Hari Ini', trend_this_week: 'Tren Pekan Ini' }
const STATUS_LABEL: Record<string, string> = { sent: 'Terkirim', viewed: 'Dilihat', acted: 'Ditindaklanjuti', dismissed: 'Diabaikan' }
const FEEDBACK_LABEL: Record<string, string> = { accurate: 'Akurat', inaccurate: 'Tidak Akurat' }

/** Health score / rate 0-100, tinggi = sehat (beda dari risk_score lama di utils.ts) */
function healthColor(score: number): string {
  return score >= 70 ? '#10B981' : score >= 40 ? '#D97706' : '#DC2626'
}

function statusToRiskLabel(status: string): 'kritis' | 'sedang' | 'rendah' {
  return status === 'bahaya' ? 'kritis' : status === 'waswas' ? 'sedang' : 'rendah'
}

function shortDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

const CHART_PAD_TOP = 20
const CHART_PLOT_H = 130
const CHART_PAD_BOTTOM = 40
const CHART_W = 860

function buildDetailChart(values: number[]) {
  const clean = values.filter(v => Number.isFinite(v))
  if (clean.length < 2) return null
  const min = Math.min(...clean)
  const max = Math.max(...clean)
  const span = max - min || 1
  const toX = (i: number) => (i / (clean.length - 1)) * CHART_W
  const toY = (v: number) => CHART_PAD_TOP + CHART_PLOT_H - ((v - min) / span) * CHART_PLOT_H
  const points = clean.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')
  const floorY = CHART_PAD_TOP + CHART_PLOT_H
  const areaPoints = `0,${floorY} ${points} ${CHART_W},${floorY}`
  const dots = clean.map((v, i) => ({ cx: toX(i), cy: toY(v) }))
  const yLabels = [
    { label: Math.round(min), y: floorY },
    { label: Math.round((min + max) / 2), y: CHART_PAD_TOP + CHART_PLOT_H / 2 },
    { label: Math.round(max), y: CHART_PAD_TOP },
  ]
  return { points, areaPoints, dots, yLabels, xLabelY: floorY + 24 }
}

const CardShell = ({ children, span2 }: { children: React.ReactNode; span2?: boolean }) => (
  <div style={{ background: '#fff', borderRadius: 16, padding: '16px 18px', boxShadow: '0 1px 3px rgba(15,36,68,0.04)', border: '1px solid #ECEEF3', gridColumn: span2 ? 'span 2' : undefined }}>
    {children}
  </div>
)

function TrendArrow({ slopePerWeek, higherIsBad }: { slopePerWeek: number | null; higherIsBad: boolean }) {
  if (slopePerWeek == null) return null
  const worsening = higherIsBad ? slopePerWeek > 0 : slopePerWeek < 0
  const color = worsening ? '#DC2626' : '#059669'
  const bg = worsening ? '#FEF2F2' : '#F0FDF4'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: bg, borderRadius: 6, padding: '1px 6px', fontSize: 10, fontWeight: 700, color }}>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: slopePerWeek > 0 ? 'none' : 'rotate(180deg)' }}>
        <polyline points="18 15 12 9 6 15" />
      </svg>
      {Math.abs(slopePerWeek).toFixed(1)}/mgg
    </span>
  )
}

function TrajectoryGrid({ brief }: { brief: NakesPatientBrief }) {
  const { daily, glucose_slope_per_week, systolic_slope_per_week } = brief.trajectory

  const metrics: Array<{ key: keyof BriefTrajectoryDay; label: string; unit: string; slope?: number | null; higherIsBad?: boolean }> = [
    { key: 'blood_sugar', label: 'Gula Darah', unit: 'mg/dL', slope: glucose_slope_per_week, higherIsBad: true },
    { key: 'systolic', label: 'Tensi Sistolik', unit: 'mmHg', slope: systolic_slope_per_week, higherIsBad: true },
    { key: 'diastolic', label: 'Tensi Diastolik', unit: 'mmHg' },
    { key: 'weight', label: 'Berat Badan', unit: 'kg' },
    { key: 'health_score', label: 'Health Score', unit: '' },
  ]
  const [activeKey, setActiveKey] = useState<keyof BriefTrajectoryDay>('blood_sugar')
  const active = metrics.find(m => m.key === activeKey) ?? metrics[0]

  const values = daily.map(d => Number(d[active.key]))
  const last = values[values.length - 1]
  const chart = buildDetailChart(values)
  const lineColor = active.key === 'health_score' ? healthColor(last) : '#5B6BF0'
  const xLabelIdx = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(f * (daily.length - 1)))

  return (
    <CardShell span2>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 13.5, color: '#111827' }}>Trajektori 30 Hari</p>
        <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 8, padding: 3, gap: 2, flexWrap: 'wrap' }}>
          {metrics.map(m => (
            <button
              key={String(m.key)}
              onClick={() => setActiveKey(m.key)}
              style={{
                padding: '4px 11px', borderRadius: 6, border: 'none',
                background: activeKey === m.key ? '#fff' : 'transparent',
                color: activeKey === m.key ? '#111827' : '#9CA3AF',
                fontSize: 11.5, fontWeight: activeKey === m.key ? 700 : 500,
                cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                boxShadow: activeKey === m.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {daily.length === 0 ? (
        <div style={{ padding: '24px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 12.5 }}>Belum ada data 30 hari terakhir.</div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: lineColor, fontFamily: 'IBM Plex Mono, monospace' }}>{Number.isFinite(last) ? last : '—'}</span>
            {active.unit && <span style={{ fontSize: 12, color: '#9CA3AF' }}>{active.unit}</span>}
            {active.slope !== undefined && <TrendArrow slopePerWeek={active.slope} higherIsBad={!!active.higherIsBad} />}
          </div>

          {chart ? (
            <svg viewBox={`0 0 908 ${CHART_PAD_TOP + CHART_PLOT_H + CHART_PAD_BOTTOM}`} style={{ width: '100%', display: 'block' }}>
              <g transform="translate(38, 0)">
                <polygon points={chart.areaPoints} fill={lineColor} opacity="0.06" />
                <polyline points={chart.points} fill="none" stroke={lineColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                {chart.dots.map((d, i) => (
                  <circle key={i} cx={d.cx} cy={d.cy} r="2.6" fill="#fff" stroke={lineColor} strokeWidth="1.8" />
                ))}
                {chart.yLabels.map((yl, i) => (
                  <text key={i} x="-10" y={yl.y + 3.5} textAnchor="end" fontSize="10" fill="#9CA3AF" fontFamily="IBM Plex Mono, monospace">{yl.label}</text>
                ))}
                {xLabelIdx.map((idx, i) => (
                  <text key={i} x={(idx / (daily.length - 1)) * CHART_W} y={chart.xLabelY} textAnchor="middle" fontSize="10" fill="#C4CBD4">{shortDate(daily[idx].date)}</text>
                ))}
              </g>
            </svg>
          ) : (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 12.5 }}>Belum cukup data untuk metrik ini.</div>
          )}
        </>
      )}
    </CardShell>
  )
}

function RiskFactorsCard({ risk }: { risk: BriefRiskInfo | null }) {
  return (
    <CardShell>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 13.5, color: '#111827' }}>Faktor Risiko Utama</p>
        {risk && <StatusPill label={risk.status === 'bahaya' ? 'Bahaya' : risk.status === 'waswas' ? 'Waswas' : 'Aman'} risk={statusToRiskLabel(risk.status)} />}
      </div>
      {!risk || risk.top_factors.length === 0 ? (
        <p style={{ margin: 0, fontSize: 12.5, color: '#9CA3AF' }}>Belum ada skor risiko untuk pasien ini.</p>
      ) : (
        <>
          <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {risk.top_factors.map((f, i) => (
              <li key={i} style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.5 }}>{f}</li>
            ))}
          </ul>
          <p style={{ margin: '10px 0 0', fontSize: 10.5, color: '#B0B7C3' }}>Diskor {formatDateTime(risk.scored_at)}</p>
        </>
      )}
    </CardShell>
  )
}

function MedAdherenceCard({ med }: { med: BriefMedAdherence }) {
  const noData = med.taken_days === 0 && med.missed_days === 0
  const maxMissed = Math.max(...WEEKDAYS.map(d => med.missed_weekdays[d] ?? 0), 1)

  return (
    <CardShell>
      <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 13.5, color: '#111827' }}>Kepatuhan Minum Obat</p>
      {noData ? (
        <p style={{ margin: 0, fontSize: 12.5, color: '#9CA3AF' }}>Belum ada catatan kepatuhan obat bulan ini.</p>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 14 }}>
            <div>
              <span style={{ fontSize: 24, fontWeight: 800, color: healthColor(med.adherence_rate_pct), fontFamily: 'IBM Plex Mono, monospace' }}>{med.adherence_rate_pct}%</span>
              <p style={{ margin: '2px 0 0', fontSize: 10.5, color: '#9CA3AF' }}>tingkat kepatuhan</p>
            </div>
            <div style={{ fontSize: 11.5, color: '#6B7280' }}>
              <span style={{ color: '#059669', fontWeight: 700 }}>{med.taken_days} hari diminum</span> · <span style={{ color: '#DC2626', fontWeight: 700 }}>{med.missed_days} hari lupa</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 40, marginBottom: 8 }}>
            {WEEKDAYS.map(d => {
              const count = med.missed_weekdays[d] ?? 0
              return (
                <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div style={{ width: '100%', height: Math.max(3, (count / maxMissed) * 28), background: count > 0 ? '#F59E0B' : '#EEF0F4', borderRadius: 3 }} />
                  <span style={{ fontSize: 9, color: '#B0B7C3' }}>{WEEKDAY_SHORT[d]}</span>
                </div>
              )
            })}
          </div>
          {med.missed_dates.length > 0 && (
            <p style={{ margin: 0, fontSize: 10.5, color: '#9CA3AF' }}>
              Tanggal lupa: {med.missed_dates.slice(0, 5).map(formatDate).join(', ')}{med.missed_dates.length > 5 ? ` +${med.missed_dates.length - 5} lainnya` : ''}
            </p>
          )}
        </>
      )}
    </CardShell>
  )
}

function EscalationsThisMonthCard({ items }: { items: BriefEscalationSummary[] }) {
  return (
    <CardShell span2>
      <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 13.5, color: '#111827' }}>Eskalasi Bulan Ini</p>
      {items.length === 0 ? (
        <p style={{ margin: 0, fontSize: 12.5, color: '#9CA3AF' }}>Tidak ada eskalasi bulan ini.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((e, i) => {
            const tierRisk = e.tier === 'acute_today' ? 'kritis' : 'sedang'
            const tierColor = getSafeRiskColor(tierRisk)
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, paddingBottom: i < items.length - 1 ? 10 : 0, borderBottom: i < items.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: tierColor.bg, border: `1px solid ${tierColor.border}`, borderRadius: 20, padding: '3px 9px', fontSize: 10.5, fontWeight: 700, color: tierColor.text }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: tierColor.edge }} />
                  {TIER_LABEL[e.tier] ?? e.tier}
                </span>
                <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>{STATUS_LABEL[e.status] ?? e.status}</span>
                {e.feedback && (
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: e.feedback === 'accurate' ? '#059669' : '#9CA3AF' }}>{FEEDBACK_LABEL[e.feedback]}</span>
                )}
                <span style={{ marginLeft: 'auto', fontSize: 10.5, color: '#B0B7C3' }}>{formatDateTime(e.sent_at)}</span>
              </div>
            )
          })}
        </div>
      )}
    </CardShell>
  )
}

function NarrativeSection({ narrative, questions }: { narrative: string; questions: string[] }) {
  return (
    <CardShell span2>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 13.5, color: '#111827' }}>Ringkasan Klinis</p>
        <span style={{ background: '#F5F3FF', borderRadius: 6, padding: '3px 9px', fontSize: 10, fontWeight: 700, color: '#7C3AED', letterSpacing: '0.3px' }}>AI</span>
      </div>
      {narrative ? (
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{narrative}</p>
      ) : (
        <p style={{ margin: '0 0 12px', fontSize: 12.5, color: '#9CA3AF' }}>Belum ada ringkasan AI untuk sesi ini.</p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', border: '1px solid #ECEEF3', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
        <span style={{ fontSize: 13 }}>⚠️</span>
        <p style={{ margin: 0, fontSize: 11, color: '#475569', fontWeight: 500, lineHeight: 1.4 }}>
          <strong>Disclaimer Klinis:</strong> Ringkasan &amp; draf pertanyaan di atas dihasilkan AI untuk membantu persiapan kontrol, bukan pengganti diagnosis medis resmi.
        </p>
      </div>

      <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 12.5, color: '#111827' }}>Draf Pertanyaan Anamnesis</p>
      {questions.length === 0 ? (
        <p style={{ margin: 0, fontSize: 12.5, color: '#9CA3AF' }}>Belum ada rekomendasi pertanyaan untuk sesi ini.</p>
      ) : (
        <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {questions.map((q, i) => (
            <li key={i} style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.5 }}>{q}</li>
          ))}
        </ul>
      )}
    </CardShell>
  )
}

export default function BriefModal({ patient, brief, loading, onClose }: BriefModalProps) {
  const riskLabel = statusToRiskLabel(patient.status)
  const rc = getSafeRiskColor(riskLabel)
  const [reportAction, setReportAction] = useState<'open' | 'download' | null>(null)
  const [reportError, setReportError] = useState<string | null>(null)

  const fetchReportHtml = async (): Promise<string | null> => {
    try {
      return await nakesApi.getPatientBriefReport(patient.patient_id)
    } catch {
      setReportError('Gagal memuat laporan. Coba lagi.')
      return null
    }
  }

  const handleOpenReport = async () => {
    setReportAction('open')
    setReportError(null)
    const html = await fetchReportHtml()
    if (html) {
      const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
      const reportWindow = window.open(url, '_blank')
      // Auto-buka dialog print begitu tab termuat — dokter tinggal pilih "Save as PDF".
      reportWindow?.addEventListener('load', () => reportWindow.print())
    }
    setReportAction(null)
  }

  const handleDownloadReport = async () => {
    setReportAction('download')
    setReportError(null)
    const html = await fetchReportHtml()
    if (html) {
      const slug = patient.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `brief-${slug}-${new Date().toISOString().slice(0, 10)}.html`
      a.click()
      URL.revokeObjectURL(url)
    }
    setReportAction(null)
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(23,28,58,0.62)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'backdropIn 0.18s ease' }}
    >
      <div style={{ width: '100%', maxWidth: 1040, maxHeight: '92vh', background: '#F6F8FC', borderRadius: 20, boxShadow: '0 32px 80px rgba(15,23,42,0.28)', border: '1px solid rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'modalIn 0.2s cubic-bezier(0.34,1.2,0.64,1)' }}>
        {/* Topbar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #F0F0F0', padding: '13px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: rc.edge }} />
            <span style={{ fontWeight: 700, fontSize: 13.5, color: '#111827' }}>Brief Kontrol</span>
            <span style={{ marginLeft: 4, fontSize: 12.5, color: '#9CA3AF', fontWeight: 400 }}>— {patient.full_name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {reportError && <span style={{ fontSize: 11, color: '#DC2626' }}>{reportError}</span>}
            <button
              onClick={handleOpenReport}
              disabled={reportAction !== null || loading || !brief}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#EEF0FF', color: '#5B6BF0', border: 'none', borderRadius: 8,
                padding: '6px 12px', fontSize: 12, fontWeight: 700,
                cursor: reportAction !== null || loading || !brief ? 'default' : 'pointer',
                opacity: reportAction !== null || loading || !brief ? 0.6 : 1,
                fontFamily: 'Plus Jakarta Sans, sans-serif', flexShrink: 0,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
              </svg>
              {reportAction === 'open' ? 'Menyiapkan…' : 'Cetak / Simpan PDF'}
            </button>
            <button
              onClick={handleDownloadReport}
              disabled={reportAction !== null || loading || !brief}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#F0FDF9', color: '#0D9488', border: 'none', borderRadius: 8,
                padding: '6px 12px', fontSize: 12, fontWeight: 700,
                cursor: reportAction !== null || loading || !brief ? 'default' : 'pointer',
                opacity: reportAction !== null || loading || !brief ? 0.6 : 1,
                fontFamily: 'Plus Jakarta Sans, sans-serif', flexShrink: 0,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {reportAction === 'download' ? 'Mengunduh…' : 'Unduh'}
            </button>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        </div>

        {/* Body */}
        {loading || !brief ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#9CA3AF' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', border: '3px solid #E5E7EB', borderTopColor: '#5B6BF0', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ margin: 0, fontSize: 13 }}>Menyiapkan ringkasan pra-kontrol…</p>
          </div>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1, padding: '18px 18px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Header strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <AvatarCircle name={patient.full_name} size={40} bg={rc.sqBg} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: 15, color: '#1E293B' }}>{patient.full_name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11.5, color: '#6B7280' }}>{patient.age} tahun</span>
                  <StatusPill label={patient.status === 'bahaya' ? 'Bahaya' : patient.status === 'waswas' ? 'Waswas' : 'Aman'} risk={riskLabel} />
                </div>
              </div>
              <span style={{ fontSize: 10.5, color: '#B0B7C3' }}>Dibuat {formatDateTime(brief.generated_at)}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <NarrativeSection narrative={brief.narrative} questions={brief.anamnesis_questions} />
              <TrajectoryGrid brief={brief} />
              <RiskFactorsCard risk={brief.risk} />
              <MedAdherenceCard med={brief.med_adherence} />
              <EscalationsThisMonthCard items={brief.escalations_this_month} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
