import { useState, useEffect, useCallback } from 'react'
import { LogoImg } from '../../components/ui/Icons'
import { useAuth } from '../../auth/AuthContext'
import { nakesApi } from '../../lib/api'
import type { DashboardSummary, PatientQueueItem, RiskLabel, DiseaseType } from '../../lib/types'
import { initials, formatDate } from '../../lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveTab = 'dashboard' | 'pasien' | 'eskalasi' | 'riwayat'

// ─── Design tokens ────────────────────────────────────────────────────────────

const RISK_COLOR: Record<RiskLabel, { text: string; bg: string; border: string }> = {
  kritis: { text: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  sedang: { text: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  rendah: { text: '#059669', bg: '#F0FDF4', border: '#A7F3D0' },
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', border: '1px solid #EEF2F7', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F1F5F9', animation: 'pulse 1.4s ease-in-out infinite' }} />
      <div style={{ width: 56, height: 28, borderRadius: 6, background: '#F1F5F9', animation: 'pulse 1.4s ease-in-out infinite' }} />
      <div style={{ width: 80, height: 12, borderRadius: 4, background: '#F1F5F9', animation: 'pulse 1.4s ease-in-out infinite' }} />
    </div>
  )
}

function RowSkeleton() {
  return (
    <tr>
      {[120, 60, 80, 70, 90, 100].map((w, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div style={{ width: w, height: 13, borderRadius: 4, background: '#F1F5F9', animation: 'pulse 1.4s ease-in-out infinite' }} />
        </td>
      ))}
    </tr>
  )
}

interface KpiCardProps {
  label: string
  value: number | string
  sub?: string
  icon: React.ReactNode
  accent: string
  accentBg: string
}

function KpiCard({ label, value, sub, icon, accent, accentBg }: KpiCardProps) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: '20px 22px',
      border: '1px solid #EEF2F7', boxShadow: '0 1px 4px rgba(15,36,68,0.05)',
      display: 'flex', flexDirection: 'column', gap: 4,
      borderTop: `3px solid ${accent}`,
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        {icon}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#0F2444', fontFamily: 'IBM Plex Mono, monospace', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#94A3B8' }}>{sub}</div>}
    </div>
  )
}

function StatusPill({ label }: { label: RiskLabel }) {
  const c = RISK_COLOR[label]
  const text = label === 'kritis' ? 'Kritis' : label === 'sedang' ? 'Waswas' : 'Aman'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 20,
      background: c.bg, border: `1px solid ${c.border}`,
      fontSize: 11, fontWeight: 700, color: c.text,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.text, flexShrink: 0 }} />
      {text}
    </span>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DokterDashboardPage({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard')

  // ── Summary ─────────────────────────────────────────────────────────────────
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  // ── Queue ────────────────────────────────────────────────────────────────────
  const [queue, setQueue] = useState<PatientQueueItem[]>([])
  const [queueLoading, setQueueLoading] = useState(true)
  const [queueError, setQueueError] = useState<string | null>(null)

  // ── Toast ────────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3800)
  }

  // ── Data fetching ─────────────────────────────────────────────────────────────
  const fetchSummary = useCallback(() => {
    setSummaryLoading(true)
    setSummaryError(null)
    nakesApi.getDashboardSummary()
      .then(d => { setSummary(d); setSummaryLoading(false) })
      .catch(() => { setSummaryError('Gagal memuat ringkasan. Coba lagi.'); setSummaryLoading(false) })
  }, [])

  const fetchQueue = useCallback(() => {
    setQueueLoading(true)
    setQueueError(null)
    nakesApi.getPatientQueue(1, 20)
      .then(r => { setQueue(r.data); setQueueLoading(false) })
      .catch(() => { setQueueError('Gagal memuat antrian pasien. Coba lagi.'); setQueueLoading(false) })
  }, [])

  useEffect(() => { fetchSummary(); fetchQueue() }, [fetchSummary, fetchQueue])

  // Auto-refresh queue tiap 60 detik
  useEffect(() => {
    const id = setInterval(fetchQueue, 60_000)
    return () => clearInterval(id)
  }, [fetchQueue])

  // ── Computed ──────────────────────────────────────────────────────────────────
  const waswasCount = summary ? summary.total_pasien - summary.risiko_bahaya - summary.status_aman : 0

  const tabTitle: Record<ActiveTab, string> = {
    dashboard: 'Dashboard Klinis',
    pasien: 'Daftar Pasien Saya',
    eskalasi: 'Antrean Eskalasi',
    riwayat: 'Riwayat Eskalasi',
  }

  // ── Sidebar ─────────────────────────────────────────────────────────────────

  const NAV_ITEMS: { id: ActiveTab; label: string; badge?: number; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      id: 'pasien',
      label: 'Daftar Pasien Saya',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: 'eskalasi',
      label: 'Antrean Eskalasi',
      badge: summary?.risiko_bahaya ?? 0,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
    {
      id: 'riwayat',
      label: 'Riwayat Eskalasi',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
    },
  ]

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif', background: '#F0F5FA' }}>

      {/* ── SIDEBAR ── */}
      <div style={{ width: 256, minWidth: 256, background: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0, borderRight: '1px solid #E2EAF2', boxShadow: '1px 0 8px rgba(15,36,68,0.05)' }}>

        {/* Logo */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid #F0F5FA' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <LogoImg size={34} />
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#0F2444', letterSpacing: '-0.4px', lineHeight: 1 }}>
                sehat<span style={{ color: '#1EC8A5' }}>iku</span>
              </div>
              <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: 1 }}>Portal Dokter</div>
            </div>
          </div>
        </div>

        {/* Doctor profile badge */}
        <div style={{ margin: '12px 14px 0', background: 'linear-gradient(135deg, #EEF9F6, #E5FBF6)', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(30,200,165,0.18)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #1EC8A5, #16A98C)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{initials(user?.name ?? 'D')}</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0F2444', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name ?? 'Dokter'}
              </div>
              <div style={{ fontSize: 10, color: '#1EC8A5', fontWeight: 600, textTransform: 'capitalize', marginTop: 1 }}>
                {user?.role ?? 'dokter'}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ padding: '16px 18px 6px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '1px' }}>Menu Utama</div>
        </div>
        <div style={{ padding: '0 10px', flex: 1, overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => {
            const active = activeTab === item.id
            return (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 8,
                  cursor: 'pointer', marginBottom: 3, transition: 'all 0.15s',
                  background: active ? '#E5FBF6' : 'transparent',
                  borderLeft: `3px solid ${active ? '#1EC8A5' : 'transparent'}`,
                  color: active ? '#0F9E83' : '#64748B',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#F8FAFB' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ color: active ? '#1EC8A5' : '#94A3B8', display: 'flex', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{item.label}</span>
                {!!item.badge && (
                  <span style={{ background: '#EF4444', color: '#fff', fontSize: 9, fontWeight: 800, minWidth: 18, height: 18, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                    {item.badge}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Logout */}
        <div style={{ padding: '12px 14px 18px', borderTop: '1px solid #F0F5FA' }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px',
              borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              background: 'transparent', color: '#94A3B8', fontSize: 13, fontWeight: 600, transition: '0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#EF4444' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Keluar
          </button>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <div style={{ height: 60, background: '#fff', borderBottom: '1px solid #E2EAF2', display: 'flex', alignItems: 'center', paddingInline: 28, gap: 14, flexShrink: 0, boxShadow: '0 1px 4px rgba(15,36,68,0.04)' }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#0F2444' }}>{tabTitle[activeTab]}</span>
          </div>

          {/* Eskalasi badge */}
          {(summary?.risiko_bahaya ?? 0) > 0 && (
            <button
              onClick={() => setActiveTab('eskalasi')}
              style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF4444', flexShrink: 0, animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>{summary?.risiko_bahaya} Eskalasi Aktif</span>
            </button>
          )}

          {/* User avatar */}
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#1EC8A5,#16A98C)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{initials(user?.name ?? 'D')}</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

          {/* ── DASHBOARD TAB ── */}
          {activeTab === 'dashboard' && (
            <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Greeting */}
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0F2444', margin: 0, letterSpacing: '-0.3px' }}>
                  Selamat datang, {user?.name?.split(' ')[0] ?? 'Dokter'} 👋
                </h1>
                <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>
                  {formatDate(new Date().toISOString())} — berikut kondisi terkini pasien Anda.
                </p>
              </div>

              {/* KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {summaryLoading ? (
                  <><KpiSkeleton /><KpiSkeleton /><KpiSkeleton /><KpiSkeleton /></>
                ) : summaryError ? (
                  <div style={{ gridColumn: '1/-1', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '18px 20px', color: '#DC2626', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{summaryError}</span>
                    <button onClick={fetchSummary} style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Coba Lagi</button>
                  </div>
                ) : (
                  <>
                    <KpiCard
                      label="Total Pasien" value={summary!.total_pasien} sub="terdaftar di sistem"
                      accent="#5B6BF0" accentBg="#EEF2FF"
                      icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B6BF0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                    />
                    <KpiCard
                      label="Risiko Bahaya" value={summary!.risiko_bahaya} sub="perlu tindak lanjut segera"
                      accent="#EF4444" accentBg="#FEF2F2"
                      icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
                    />
                    <KpiCard
                      label="Perlu Perhatian" value={Math.max(0, waswasCount)} sub="skor risiko sedang"
                      accent="#F59E0B" accentBg="#FFFBEB"
                      icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
                    />
                    <KpiCard
                      label="Status Aman" value={summary!.status_aman} sub="kondisi terkontrol"
                      accent="#10B981" accentBg="#ECFDF5"
                      icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
                    />
                  </>
                )}
              </div>

              {/* Patient Queue */}
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #EEF2F7', boxShadow: '0 1px 4px rgba(15,36,68,0.05)', overflow: 'hidden' }}>

                {/* Card header */}
                <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid #F4F6FB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F2444' }}>Antrian Prioritas Pasien</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Diurutkan berdasarkan tingkat risiko — auto-refresh setiap 60 detik</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {!queueLoading && !queueError && (
                      <span style={{ fontSize: 11, color: '#64748B', background: '#F4F6FB', padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>
                        {queue.length} pasien
                      </span>
                    )}
                    <button
                      onClick={fetchQueue}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F4F6FB', border: '1px solid #E2EAF2', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: '#64748B' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#E2EAF2'}
                      onMouseLeave={e => e.currentTarget.style.background = '#F4F6FB'}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                      </svg>
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        {['Pasien', 'Usia', 'Penyakit', 'Skor Risiko', 'Status', 'Faktor Utama', 'Aksi'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #EEF2F7', whiteSpace: 'nowrap' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queueLoading ? (
                        <><RowSkeleton /><RowSkeleton /><RowSkeleton /><RowSkeleton /><RowSkeleton /></>
                      ) : queueError ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '36px 20px', textAlign: 'center' }}>
                            <div style={{ fontSize: 13, color: '#EF4444', marginBottom: 12, fontWeight: 500 }}>{queueError}</div>
                            <button onClick={fetchQueue} style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Coba Lagi</button>
                          </td>
                        </tr>
                      ) : queue.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center' }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F2444', marginBottom: 4 }}>Tidak ada pasien dalam antrean</div>
                            <div style={{ fontSize: 12, color: '#94A3B8' }}>Semua pasien dalam kondisi aman saat ini.</div>
                          </td>
                        </tr>
                      ) : queue.map((p, idx) => (
                        <PatientRow key={p.patient_id} patient={p} idx={idx} onContactClick={() => showToast(`Menghubungi ${p.full_name} via WhatsApp...`)} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── PLACEHOLDER TABS ── */}
          {activeTab !== 'dashboard' && (
            <PlaceholderSection
              tab={activeTab}
              title={tabTitle[activeTab]}
              onBack={() => setActiveTab('dashboard')}
            />
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: toast.type === 'ok' ? '#0F2444' : '#7F1D1D',
          color: '#fff', borderRadius: 12, padding: '13px 18px',
          fontSize: 13, fontWeight: 500, maxWidth: 380,
          boxShadow: '0 8px 30px rgba(15,36,68,0.22)',
          display: 'flex', alignItems: 'center', gap: 10,
          borderLeft: `4px solid ${toast.type === 'ok' ? '#1EC8A5' : '#EF4444'}`,
          animation: 'slideIn 0.25s ease-out',
        }}>
          {toast.type === 'ok'
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1EC8A5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          }
          {toast.msg}
        </div>
      )}
    </div>
  )
}

// ─── Patient Row ──────────────────────────────────────────────────────────────

function PatientRow({ patient: p, idx, onContactClick }: { patient: PatientQueueItem; idx: number; onContactClick: () => void }) {
  const risk = RISK_COLOR[p.risk_label]
  const disease = DISEASE_COLOR[p.disease_type]
  const [hovered, setHovered] = useState(false)

  return (
    <tr
      style={{ borderBottom: '1px solid #F4F6FB', background: hovered ? '#F8FAFF' : idx % 2 === 0 ? '#fff' : '#FAFCFF', transition: 'background 0.1s' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Pasien */}
      <td style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${risk.text}22, ${risk.text}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: risk.text }}>{initials(p.full_name)}</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0F2444', whiteSpace: 'nowrap' }}>{p.full_name}</span>
        </div>
      </td>

      {/* Usia */}
      <td style={{ padding: '14px 16px', fontSize: 13, color: '#64748B', fontFamily: 'IBM Plex Mono, monospace', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {p.age} th
      </td>

      {/* Penyakit */}
      <td style={{ padding: '14px 16px' }}>
        <span style={{ display: 'inline-flex', padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: disease.text, background: disease.bg }}>
          {DISEASE_LABEL[p.disease_type]}
        </span>
      </td>

      {/* Skor Risiko */}
      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
        <span style={{ fontSize: 16, fontWeight: 800, fontFamily: 'IBM Plex Mono, monospace', fontVariantNumeric: 'tabular-nums', color: risk.text }}>
          {p.risk_score}
        </span>
      </td>

      {/* Status */}
      <td style={{ padding: '14px 16px' }}>
        <StatusPill label={p.risk_label} />
      </td>

      {/* Faktor Utama */}
      <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748B', maxWidth: 160 }}>
        {p.main_factor
          ? <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.main_factor}</span>
          : <span style={{ color: '#CBD5E1' }}>—</span>
        }
      </td>

      {/* Aksi */}
      <td style={{ padding: '14px 16px' }}>
        <button
          onClick={onContactClick}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
            background: p.risk_label === 'kritis' ? '#EF4444' : p.risk_label === 'sedang' ? '#F59E0B' : '#10B981',
            color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12 19.79 19.79 0 0 1 1.93 3.32C1.89 2.18 2.8 1 4 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          Hubungi
        </button>
      </td>
    </tr>
  )
}

// ─── Placeholder for other tabs ───────────────────────────────────────────────

function PlaceholderSection({ tab, title, onBack }: { tab: ActiveTab; title: string; onBack: () => void }) {
  const icons: Record<ActiveTab, React.ReactNode> = {
    dashboard: null,
    pasien: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5B6BF0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    eskalasi: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    riwayat: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  }

  const desc: Record<ActiveTab, string> = {
    dashboard: '',
    pasien: 'Tabel daftar pasien dengan search, filter penyakit, dan klik untuk detail.',
    eskalasi: 'Kartu grid eskalasi aktif dengan auto-refresh 60 detik, alur Hubungi → Tepat/Tidak Tepat.',
    riwayat: 'Tabel riwayat eskalasi yang sudah ditangani, dengan filter rentang tanggal.',
  }

  return (
    <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#F4F6FB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        {icons[tab]}
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F2444', marginBottom: 10 }}>{title}</h2>
      <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6, marginBottom: 28 }}>{desc[tab]}<br /><br />Modul ini sedang dalam pengembangan (FE-2).</p>
      <button
        onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#5B6BF0', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Kembali ke Dashboard
      </button>
    </div>
  )
}
