import { useState, useEffect, useCallback } from 'react'
import { LogoImg } from '../../components/ui/Icons'
import { nakesApi } from '../../lib/api'
import type { PatientQueueItem, PatientStatus, DashboardSummary } from '../../lib/types'
import { initials, statusToColor, scoreToColor } from '../../lib/utils'
import { useAuth } from '../../auth/AuthContext'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function diseaseShort(type: string): string {
  if (type === 'diabetes_t2') return 'Diabetes T2'
  if (type === 'hypertension') return 'Hipertensi'
  return 'DM + HT'
}

function statusLabel(s: PatientStatus): string {
  if (s === 'bahaya') return 'Bahaya'
  if (s === 'waswas') return 'Waswas'
  return 'Aman'
}

function statusBadgeStyle(s: PatientStatus) {
  if (s === 'bahaya') return { bg: 'rgba(239,68,68,0.1)', color: '#DC2626', border: 'rgba(239,68,68,0.2)' }
  if (s === 'waswas') return { bg: 'rgba(245,158,11,0.1)', color: '#D97706', border: 'rgba(245,158,11,0.2)' }
  return { bg: 'rgba(16,185,129,0.1)', color: '#059669', border: 'rgba(16,185,129,0.2)' }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const bg = scoreToColor(score)
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 12, background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, boxShadow: `0 3px 10px ${bg}44`,
    }}>
      <span style={{ color: '#fff', fontSize: 15, fontWeight: 800, letterSpacing: '-0.5px' }}>{score}</span>
    </div>
  )
}

function PatientAvatar({ name, status }: { name: string; status: PatientStatus }) {
  const color = statusToColor(status)
  const bg = status === 'bahaya'
    ? 'rgba(239,68,68,0.1)'
    : status === 'waswas'
      ? 'rgba(245,158,11,0.1)'
      : 'rgba(16,185,129,0.1)'
  return (
    <div style={{
      width: 40, height: 40, borderRadius: '50%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 800, color, flexShrink: 0,
    }}>
      {initials(name)}
    </div>
  )
}

// ─── Patient Card ─────────────────────────────────────────────────────────────

function PatientCard({ item, selected, onClick }: { item: PatientQueueItem; selected: boolean; onClick: () => void }) {
  const badge = statusBadgeStyle(item.status)
  const needsReview = item.status === 'bahaya'
  const borderColor = selected
    ? statusToColor(item.status)
    : item.status === 'bahaya' ? 'rgba(239,68,68,0.3)' : '#EAEEF4'

  return (
    <div
      onClick={onClick}
      style={{
        padding: '13px 14px',
        borderRadius: 12,
        cursor: 'pointer',
        border: `1.5px solid ${borderColor}`,
        background: selected ? (item.status === 'bahaya' ? 'rgba(239,68,68,0.04)' : item.status === 'waswas' ? 'rgba(245,158,11,0.04)' : 'rgba(16,185,129,0.04)') : '#fff',
        transition: 'all 0.15s ease',
        boxShadow: selected ? `0 2px 12px ${statusToColor(item.status)}20` : '0 1px 3px rgba(15,36,68,0.05)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left accent stripe */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: statusToColor(item.status), borderRadius: '12px 0 0 12px',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 6 }}>
        <PatientAvatar name={item.full_name} status={item.status} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F2444', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.1px' }}>
            {item.full_name}
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
            {item.age} thn · {diseaseShort(item.disease_type)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
              background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
            }}>
              {statusLabel(item.status)}
            </span>
            {needsReview && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                background: 'rgba(245,158,11,0.1)', color: '#D97706', border: '1px solid rgba(245,158,11,0.2)',
              }}>
                Butuh Review
              </span>
            )}
          </div>
        </div>

        <ScoreBadge score={item.risk_score} />
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyDetail() {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 12, padding: 40, userSelect: 'none',
    }}>
      <div style={{ fontSize: 56, lineHeight: 1, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.08))' }}>👨‍⚕️</div>
      <div style={{ marginTop: 8, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
          Pilih pasien untuk melihat detail
        </div>
        <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5 }}>
          Klik kartu pasien di panel kiri
        </div>
      </div>
    </div>
  )
}

// ─── Detail Metric Card ────────────────────────────────────────────────────────

function MetricCard({ label, value, unit, status }: { label: string; value: string; unit: string; status: 'ok' | 'warn' | 'crit' }) {
  const colors = {
    ok: { bg: '#F0FDF4', border: 'rgba(16,185,129,0.15)', text: '#059669' },
    warn: { bg: '#FFFBEB', border: 'rgba(245,158,11,0.15)', text: '#D97706' },
    crit: { bg: '#FEF2F2', border: 'rgba(239,68,68,0.15)', text: '#DC2626' },
  }[status]

  return (
    <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '11px 13px' }}>
      <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color: colors.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 3 }}>{unit}</div>
    </div>
  )
}

// ─── Patient Detail Panel ─────────────────────────────────────────────────────

function PatientDetail({ item, onClose }: { item: PatientQueueItem; onClose: () => void }) {
  const badgeStyle = statusBadgeStyle(item.status)
  const accentColor = statusToColor(item.status)
  const isDiabetes = item.disease_type === 'diabetes_t2' || item.disease_type === 'both'
  const isHypertension = item.disease_type === 'hypertension' || item.disease_type === 'both'

  return (
    <div className="anim-fadein" style={{ flex: 1, overflowY: 'auto', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Patient Header */}
      <div style={{
        background: '#fff', borderRadius: 16, padding: '20px 22px',
        border: '1px solid #E8EEF4', boxShadow: '0 1px 4px rgba(15,36,68,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, flexShrink: 0,
            background: `${accentColor}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, fontWeight: 800, color: accentColor,
          }}>
            {initials(item.full_name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0F2444', letterSpacing: '-0.3px' }}>{item.full_name}</div>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 3 }}>{item.age} tahun · {diseaseShort(item.disease_type)}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 20,
                background: badgeStyle.bg, color: badgeStyle.color, border: `1.5px solid ${badgeStyle.border}`,
              }}>
                {statusLabel(item.status)}
              </span>
              {item.disease_type !== 'hypertension' && (
                <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 11px', borderRadius: 20, background: 'rgba(21,101,216,0.08)', color: '#1565D8', border: '1px solid rgba(21,101,216,0.15)' }}>
                  Diabetes T2
                </span>
              )}
              {item.disease_type !== 'diabetes_t2' && (
                <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 11px', borderRadius: 20, background: 'rgba(79,195,247,0.1)', color: '#0277BD', border: '1px solid rgba(79,195,247,0.2)' }}>
                  Hipertensi
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 16, background: scoreToColor(item.risk_score),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 14px ${scoreToColor(item.risk_score)}44`,
            }}>
              <span style={{ color: '#fff', fontSize: 20, fontWeight: 800 }}>{item.risk_score}</span>
            </div>
            <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 5 }}>Risk Score</div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 8, background: '#F0F5FA', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', flexShrink: 0, fontSize: 15 }}
          >
            ✕
          </button>
        </div>

        {/* Risk Factor */}
        {item.main_factor && (
          <div style={{
            marginTop: 16, background: `${accentColor}0A`, border: `1px solid ${accentColor}25`,
            borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: accentColor, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Faktor Risiko Utama</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginTop: 2 }}>{item.main_factor}</div>
            </div>
          </div>
        )}
      </div>

      {/* Clinical Indicators */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', border: '1px solid #E8EEF4', boxShadow: '0 1px 4px rgba(15,36,68,0.06)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F2444', marginBottom: 12 }}>Indikator Klinis Baseline</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          {isDiabetes && (
            <>
              <MetricCard label="HbA1c" value={item.status === 'bahaya' ? '10.2%' : item.status === 'waswas' ? '8.1%' : '6.8%'} unit={item.status === 'bahaya' ? 'Kritis > 9%' : item.status === 'waswas' ? 'Di atas target' : 'Terkontrol'} status={item.status === 'bahaya' ? 'crit' : item.status === 'waswas' ? 'warn' : 'ok'} />
              <MetricCard label="Gula Darah Puasa" value={item.status === 'bahaya' ? '285' : item.status === 'waswas' ? '172' : '108'} unit="mg/dL" status={item.status === 'bahaya' ? 'crit' : item.status === 'waswas' ? 'warn' : 'ok'} />
            </>
          )}
          {isHypertension && (
            <>
              <MetricCard label="Tekanan Darah" value={item.status === 'bahaya' ? '175/110' : item.status === 'waswas' ? '148/92' : '128/82'} unit="mmHg" status={item.status === 'bahaya' ? 'crit' : item.status === 'waswas' ? 'warn' : 'ok'} />
              <MetricCard label="Nadi" value="78" unit="bpm · Reguler" status="ok" />
            </>
          )}
          <MetricCard label="BMI" value={item.status === 'bahaya' ? '31.2' : item.status === 'waswas' ? '28.4' : '24.1'} unit="kg/m²" status={item.status === 'bahaya' ? 'crit' : item.status === 'waswas' ? 'warn' : 'ok'} />
          <MetricCard label="eGFR" value={item.status === 'bahaya' ? '58' : '74'} unit="mL/min" status={item.status === 'bahaya' ? 'warn' : 'ok'} />
        </div>
      </div>

      {/* Visit History */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', border: '1px solid #E8EEF4', boxShadow: '0 1px 4px rgba(15,36,68,0.06)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F2444', marginBottom: 14 }}>Riwayat Kunjungan</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { date: '18 Jun 2026', title: 'Kontrol rutin', note: 'Evaluasi terapi dan pemantauan parameter klinis.', color: '#1565D8' },
            { date: '15 Mei 2026', title: 'Update baseline klinis', note: 'Hasil lab menunjukkan perubahan nilai indikator.', color: '#10B981' },
            { date: '10 Apr 2026', title: 'Edukasi & konseling', note: 'Konsultasi gizi dan kepatuhan minum obat.', color: '#895CF6' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.color, border: '2px solid #fff', boxShadow: `0 0 0 1.5px ${t.color}` }} />
                {i < 2 && <div style={{ width: 1.5, flex: 1, background: '#EEF2F7', margin: '3px 0' }} />}
              </div>
              <div style={{ paddingBottom: i < 2 ? 14 : 0 }}>
                <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, marginBottom: 2 }}>{t.date}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F2444', marginBottom: 2 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>{t.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: '#1565D8', color: '#fff', border: 'none', borderRadius: 11,
          padding: '12px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 3px 12px rgba(21,101,216,0.28)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Lihat Progress
        </button>
        <button style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: '#F0F5FA', color: '#475569', border: '1px solid #E2EAF2', borderRadius: 11,
          padding: '12px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l1.64-1.64a2 2 0 0 1 2.11-.45c.91.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92z" />
          </svg>
          Hubungi Pasien
        </button>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

type FilterTab = 'semua' | PatientStatus

export default function NakesDashboardPage({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth()
  const [queue, setQueue] = useState<PatientQueueItem[]>([])
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterTab>('semua')
  const [selected, setSelected] = useState<PatientQueueItem | null>(null)
  const [refreshIn, setRefreshIn] = useState(60)

  const fetchData = useCallback(async () => {
    try {
      const [q, s] = await Promise.all([nakesApi.getPatientQueue(), nakesApi.getDashboardSummary()])
      setQueue(q.data)
      setSummary(s)
    } catch {
      // silently keep stale data
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshIn(prev => {
        if (prev <= 1) {
          fetchData()
          return 60
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [fetchData])

  const filtered = filter === 'semua' ? queue : queue.filter(p => p.status === filter)
  const counts = {
    semua: queue.length,
    bahaya: queue.filter(p => p.status === 'bahaya').length,
    waswas: queue.filter(p => p.status === 'waswas').length,
    aman: queue.filter(p => p.status === 'aman').length,
  }

  const tabs: { key: FilterTab; label: string; color?: string }[] = [
    { key: 'semua', label: 'Semua' },
    { key: 'bahaya', label: 'Bahaya', color: '#DC2626' },
    { key: 'waswas', label: 'Waswas', color: '#D97706' },
    { key: 'aman', label: 'Aman', color: '#059669' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif', background: '#F4F7FB' }}>

      {/* ── TOPBAR ── */}
      <div style={{
        height: 56, background: '#fff', borderBottom: '1px solid #E8EEF4',
        display: 'flex', alignItems: 'center', padding: '0 20px',
        gap: 14, flexShrink: 0, boxShadow: '0 1px 4px rgba(15,36,68,0.05)',
      }}>
        {/* Logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 8 }}>
          <LogoImg size={28} />
          <div style={{ fontSize: 15, fontWeight: 800, color: '#0F2444', letterSpacing: '-0.4px', lineHeight: 1 }}>
            sehat<span style={{ color: '#895CF6' }}>iku</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 22, background: '#E8EEF4' }} />

        {/* Page title */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F2444', lineHeight: 1 }}>Antrean Prioritas</div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
            {summary ? `${summary.total_pasien} pasien terdaftar` : 'Memuat...'}
          </div>
        </div>

        {/* Doctor name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#F8FAFD', borderRadius: 9, border: '1px solid #EAF0F8' }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg,#895CF6,#6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff' }}>
            {user ? initials(user.name) : 'DR'}
          </div>
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0F2444' }}>{user?.name ?? 'Dokter'}</div>
            <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 1, textTransform: 'capitalize' }}>{user?.role ?? 'nakes'}</div>
          </div>
        </div>

        {/* Mode badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EDFAF5', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '6px 12px' }}>
          <div className="anim-blink" style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>Mode: Dokter</span>
        </div>

        {/* Bell */}
        <div style={{ position: 'relative', width: 36, height: 36, background: '#F4F7FB', border: '1px solid #E8EEF4', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {(summary?.risiko_bahaya ?? 0) > 0 && (
            <span style={{ position: 'absolute', top: -4, right: -4, background: '#EF4444', color: '#fff', fontSize: 9, fontWeight: 800, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {summary?.risiko_bahaya}
            </span>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          title="Keluar"
          style={{ width: 36, height: 36, background: '#F4F7FB', border: '1px solid #E8EEF4', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── LEFT PANEL — patient list ── */}
        <div style={{
          width: 340, minWidth: 340, display: 'flex', flexDirection: 'column',
          background: '#fff', borderRight: '1px solid #E8EEF4',
          boxShadow: '2px 0 8px rgba(15,36,68,0.04)',
        }}>

          {/* Panel header */}
          <div style={{ padding: '16px 16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#0F2444', letterSpacing: '-0.3px' }}>Pasien Saya</div>
              <span style={{
                background: '#EEF5FF', color: '#1565D8', fontSize: 11, fontWeight: 800,
                padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(21,101,216,0.15)',
              }}>
                {counts.semua} pasien
              </span>
            </div>

            {/* Refresh indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F8FAFD', borderRadius: 8, padding: '7px 10px', border: '1px solid #EAF0F8', marginBottom: 12 }}>
              <div className="anim-blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>
                Triase langsung · diperbarui dalam <strong style={{ color: '#0F2444' }}>{refreshIn} dtk</strong>
              </span>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {tabs.map(tab => {
                const active = filter === tab.key
                const count = counts[tab.key]
                const activeColor = tab.color ?? '#1565D8'
                return (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    style={{
                      flex: 1, padding: '7px 4px', borderRadius: 9, cursor: 'pointer',
                      fontSize: 11, fontWeight: 700, border: 'none', transition: 'all 0.15s',
                      background: active ? activeColor : '#F4F7FB',
                      color: active ? '#fff' : '#64748B',
                      boxShadow: active ? `0 2px 8px ${activeColor}33` : 'none',
                    }}
                  >
                    {tab.label}
                    {count > 0 && tab.key !== 'semua' && (
                      <span style={{
                        marginLeft: 4, fontSize: 10, fontWeight: 800,
                        background: active ? 'rgba(255,255,255,0.25)' : `${activeColor}18`,
                        color: active ? '#fff' : activeColor,
                        padding: '1px 5px', borderRadius: 20,
                      }}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Patient list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {loading && (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8', fontSize: 13 }}>
                Memuat antrian...
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8', fontSize: 13 }}>
                Tidak ada pasien dalam kategori ini.
              </div>
            )}
            {!loading && filtered.map(item => (
              <PatientCard
                key={item.patient_id}
                item={item}
                selected={selected?.patient_id === item.patient_id}
                onClick={() => setSelected(prev => prev?.patient_id === item.patient_id ? null : item)}
              />
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL — detail ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F4F7FB' }}>
          {selected
            ? <PatientDetail item={selected} onClose={() => setSelected(null)} />
            : <EmptyDetail />
          }
        </div>
      </div>
    </div>
  )
}
