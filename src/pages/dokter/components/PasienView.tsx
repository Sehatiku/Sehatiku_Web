import { type ReactNode, useMemo } from 'react'
import type { PatientQueueItem, ConsultationResult, NakesPatientDetailData, NakesPatientBrief } from '../../../lib/types'
import {
  SkeletonCard,
  AvatarCircle,
  StatusPill,
  DiseasePill,
  DISEASE_LABEL,
  getSafeRiskColor,
} from './Common'
import TrendChart from './TrendChart'
import ShapCard from './ShapCard'
import LogCard from './LogCard'
import TrenView from './TrenView'
import BriefModal from './BriefModal'

type QueueFilter = 'all' | 'bahaya' | 'waswas' | 'aman'

export interface PasienViewProps {
  loading: boolean
  queue: PatientQueueItem[]
  queueFilter: QueueFilter
  setQueueFilter: (f: QueueFilter) => void
  setSelectedId: (id: string | null) => void
  selectedPatient: PatientQueueItem | null
  contacted: Set<string>
  handleContact: (id: string) => void
  chartParam: 'glucose' | 'bp'
  setChartParam: (p: 'glucose' | 'bp') => void
  chartRange: 7 | 14
  setChartRange: (r: 7 | 14) => void
  consultations: ConsultationResult[]
  totalCount: number
  bahayaCount: number
  waswasCount: number
  amanCount: number
  // Tren props
  setTrenPatientId: (id: string | null) => void
  trenPatient: PatientQueueItem | null
  trenSearch: string
  setTrenSearch: (s: string) => void
  // Detail klinis pasien (real BE) — dipakai modal antrean & panel tren
  patientDetail: NakesPatientDetailData | null
  detailLoading: boolean
  // Pre-Visit Brief
  briefPatient: PatientQueueItem | null
  setBriefPatientId: (id: string | null) => void
  brief: NakesPatientBrief | null
  briefLoading: boolean
}

const FILTERS: { id: QueueFilter; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'bahaya', label: 'Bahaya' },
  { id: 'waswas', label: 'Waswas' },
  { id: 'aman', label: 'Aman' },
]

// ── Shared sub-components ──────────────────────────────────────────────────────

function SearchBar({ value, onChange, placeholder = 'Cari nama pasien...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(226,232,240,0.9)', borderRadius: 10, padding: '7px 12px', width: 240 }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12.5, color: '#111827', fontFamily: 'Plus Jakarta Sans, sans-serif', width: '100%' }}
      />
      {value && (
        <button onClick={() => onChange('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#9CA3AF' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}

function FilterSegment({ selected, onChange }: { selected: QueueFilter; onChange: (f: QueueFilter) => void }) {
  return (
    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(226,232,240,0.9)', borderRadius: 10, padding: 3, gap: 2 }}>
      {FILTERS.map(f => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          style={{
            padding: '5px 14px', borderRadius: 8, border: 'none',
            background: selected === f.id ? '#fff' : 'transparent',
            color: selected === f.id ? '#1E2330' : '#9CA3AF',
            fontSize: 12.5, fontWeight: selected === f.id ? 700 : 500,
            cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
            boxShadow: selected === f.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.15s',
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

function KpiCards({
  loading, totalCount, bahayaCount, waswasCount, amanCount,
}: { loading: boolean; totalCount: number; bahayaCount: number; waswasCount: number; amanCount: number }) {
  const stats: Array<{ label: string; value: number; sub: string; color: string; iconBg: string; icon: ReactNode }> = [
    {
      label: 'Total Pasien', value: totalCount, sub: 'pasien terdaftar', color: '#2B2D42', iconBg: '#EEF2FF',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B6BF0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    },
    {
      label: 'Risiko Bahaya', value: bahayaCount, sub: 'perlu perhatian segera', color: '#EF4444', iconBg: '#FEF2F2',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    },
    {
      label: 'Perlu Pantau', value: waswasCount, sub: 'dalam pengawasan', color: '#D97706', iconBg: '#FFFBEB',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    },
    {
      label: 'Status Aman', value: amanCount, sub: 'kondisi terkontrol', color: '#059669', iconBg: '#ECFDF5',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>
      {loading
        ? Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.75)', boxShadow: '0 8px 24px rgba(15,36,68,0.06)' }}>
            <SkeletonCard h={72} />
          </div>
        ))
        : stats.map((stat, i) => i === 0 ? (
          // Kartu pertama filled (Donezo style)
          <div key={stat.label} style={{ background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)', borderRadius: 16, padding: '16px 18px', boxShadow: '0 8px 20px rgba(13, 148, 136, 0.25)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -24, right: -24, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 12.5, color: 'rgba(255,255,255,0.85)', fontWeight: 600, lineHeight: 1.4, flex: 1, paddingRight: 8 }}>{stat.label}</p>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
            </div>
            <p style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: '#ffffff', fontFamily: 'IBM Plex Mono, monospace', lineHeight: 1 }}>{stat.value}</p>
            <p style={{ margin: 0, fontSize: 11.5, color: 'rgba(255,255,255,0.7)' }}>{stat.sub}</p>
          </div>
        ) : (
          <div key={stat.label} style={{ background: '#fff', borderRadius: 16, padding: '16px 18px', border: '1px solid #ECEEF3', boxShadow: '0 1px 3px rgba(15,36,68,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 12.5, color: '#64748B', fontWeight: 500, lineHeight: 1.4, flex: 1, paddingRight: 8 }}>{stat.label}</p>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: stat.iconBg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stat.icon}
              </div>
            </div>
            <p style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: stat.color, fontFamily: 'IBM Plex Mono, monospace', lineHeight: 1 }}>{stat.value}</p>
            <p style={{ margin: 0, fontSize: 11.5, color: '#9CA3AF' }}>{stat.sub}</p>
          </div>
        ))
      }
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function PasienView({
  loading,
  queue,
  queueFilter, setQueueFilter,
  setSelectedId,
  selectedPatient,
  contacted, handleContact,
  chartParam, setChartParam,
  chartRange, setChartRange,
  consultations,
  totalCount, bahayaCount, waswasCount, amanCount,
  setTrenPatientId, trenPatient,
  trenSearch, setTrenSearch,
  patientDetail, detailLoading,
  briefPatient, setBriefPatientId, brief, briefLoading,
}: PasienViewProps) {
  // Ekstraksi defensif: BE bisa kirim null / bentuk tak terduga → selalu jadikan array aman.
  const dailyLogs = Array.isArray(patientDetail?.daily_logs) ? patientDetail!.daily_logs : []
  const topFactors = Array.isArray(patientDetail?.risk?.top_factors) ? patientDetail!.risk!.top_factors : []

  // Unified filtered list — same patients in both modes, just different columns
  const sharedList = useMemo(() => {
    const q = trenSearch.trim().toLowerCase()
    return queue.filter(p => {
      // risk_score = health_score (TINGGI = sehat); status enum sudah dari BE.
      if (queueFilter !== 'all' && p.status !== queueFilter) return false
      if (q && !p.full_name.toLowerCase().includes(q)) return false
      return true
    })
  }, [queue, queueFilter, trenSearch])

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: 'transparent' }}>
      <style>{`
        @keyframes modalIn   { from { opacity:0; transform:scale(0.97) translateY(10px) } to { opacity:1; transform:scale(1) translateY(0) } }
        @keyframes backdropIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideInRight { from { opacity:0; transform:translateX(36px) } to { opacity:1; transform:translateX(0) } }
        .queue-row:hover  { background: #F8F9FC !important; }
        .contact-btn:hover { background: #17B393 !important; }
        .close-btn:hover  { background: #F3F4F6 !important; border-color: #D1D5DB !important; }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <KpiCards
        loading={loading}
        totalCount={totalCount}
        bahayaCount={bahayaCount}
        waswasCount={waswasCount}
        amanCount={amanCount}
      />

      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(14px) saturate(1.5)', WebkitBackdropFilter: 'blur(14px) saturate(1.5)',
        borderRadius: 16, padding: '12px 18px',
        boxShadow: '0 8px 24px rgba(15,36,68,0.06)', border: '1px solid rgba(255,255,255,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, marginBottom: 14, flexWrap: 'wrap',
      }}>
        <SearchBar value={trenSearch} onChange={setTrenSearch} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FilterSegment selected={queueFilter} onChange={setQueueFilter} />
          <span style={{ background: 'rgba(91,107,240,0.08)', borderRadius: 20, padding: '4px 11px', fontSize: 12, fontWeight: 700, color: '#5B6BF0' }}>
            {sharedList.length} pasien
          </span>
        </div>
      </div>

      {/* ── Unified Patient List Table ─────────────────────────────────────── */}
      <div style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(14px) saturate(1.5)', WebkitBackdropFilter: 'blur(14px) saturate(1.5)', borderRadius: 16, boxShadow: '0 8px 24px rgba(15,36,68,0.06)', border: '1px solid rgba(255,255,255,0.75)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 80px 270px', padding: '10px 22px', gap: 16, background: 'rgba(248,250,252,0.6)', borderBottom: '1px solid #EDF0F5' }}>
          {['NAMA PASIEN', 'PENYAKIT', 'STATUS', 'SKOR', 'AKSI'].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#B0B7C3', letterSpacing: '0.7px', textTransform: 'uppercase' }}>{h}</span>
          ))}
        </div>
        {loading ? (
          <div style={{ padding: '12px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} h={56} />)}
          </div>
        ) : sharedList.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 20px', gap: 8 }}>
            <span style={{ fontSize: 30 }}>🔍</span>
            <p style={{ margin: 0, fontSize: 13.5, color: '#9CA3AF' }}>
              {trenSearch || queueFilter !== 'all' ? 'Pasien tidak ditemukan.' : 'Belum ada pasien terdaftar.'}
            </p>
          </div>
        ) : (
          sharedList.map((p, idx) => {
            const hs = p.risk_score // health score (TINGGI = sehat)
            const status = p.status
            const risk_label = p.risk_label
            const c = getSafeRiskColor(risk_label)
            const hsColor = hs >= 70 ? '#10B981' : hs >= 40 ? '#F59E0B' : '#EF4444'
            const hasOpenConsult = consultations.some(cx => cx.patient_id === p.patient_id && cx.status === 'open')
            return (
              <div
                key={p.patient_id}
                className="queue-row"
                style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 80px 270px', alignItems: 'center', padding: '10px 22px', gap: 16, borderBottom: idx < sharedList.length - 1 ? '1px solid #F5F5F7' : 'none', transition: 'background 0.1s', background: '#fff' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <AvatarCircle name={p.full_name} size={36} bg={c.sqBg} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: '0 0 3px', fontWeight: 600, fontSize: 13.5, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.full_name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11.5, color: '#9CA3AF' }}>{p.age} tahun</span>
                      {hasOpenConsult && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 4, padding: '1px 6px', fontSize: 9.5, fontWeight: 700, color: '#D97706' }}>
                          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#F59E0B' }} />Review
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 500, color: '#4B5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{DISEASE_LABEL[p.disease_type]}</span>
                <div><StatusPill label={status === 'bahaya' ? 'Bahaya' : status === 'waswas' ? 'Waswas' : 'Aman'} risk={risk_label} /></div>
                <span style={{ fontSize: 15, fontWeight: 800, color: hsColor, fontFamily: 'IBM Plex Mono, monospace' }}>{hs}</span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => setSelectedId(p.patient_id)}
                    style={{
                      background: '#EEF0FF',
                      color: '#5B6BF0',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 12px',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,107,240,0.18)'}
                    onMouseLeave={e => e.currentTarget.style.background = '#EEF0FF'}
                  >
                    Tindakan
                  </button>
                  <button
                    onClick={() => setTrenPatientId(p.patient_id)}
                    style={{
                      background: '#ECFDF5',
                      color: '#0D9488',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 12px',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(13,148,136,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ECFDF5'}
                  >
                    Tren
                  </button>
                  <button
                    onClick={() => setBriefPatientId(p.patient_id)}
                    style={{
                      background: '#EFF6FF',
                      color: '#2563EB',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 12px',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = '#EFF6FF'}
                  >
                    Brief Kontrol
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Antrean Detail: Modal Popup (center) ───────────────────────────── */}
      {selectedPatient && (() => {
        // risk_score = health_score (TINGGI = sehat); status/risk_label langsung dari BE.
        const hs = patientDetail?.risk?.score ?? selectedPatient.risk_score
        const calculatedStatus = patientDetail?.risk?.status ?? selectedPatient.status
        const calculatedRiskLabel = calculatedStatus === 'bahaya' ? 'kritis' : calculatedStatus === 'waswas' ? 'sedang' : 'rendah'
        const rc = getSafeRiskColor(calculatedRiskLabel)
        const hsColor = hs >= 70 ? '#10B981' : hs >= 40 ? '#D97706' : '#DC2626'
        const hsBgTint = hs >= 70 ? 'rgba(16,185,129,0.06)' : hs >= 40 ? 'rgba(245,158,11,0.06)' : 'rgba(239,68,68,0.06)'
        const hsBorder = hs >= 70 ? 'rgba(16,185,129,0.25)' : hs >= 40 ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)'
        return (
          <div
            onClick={e => { if (e.target === e.currentTarget) setSelectedId(null) }}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(23,28,58,0.62)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'backdropIn 0.18s ease' }}
          >
            <div style={{ width: '100%', maxWidth: 880, maxHeight: '92vh', background: '#F6F8FC', borderRadius: 20, boxShadow: '0 32px 80px rgba(15,23,42,0.28)', border: '1px solid rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'modalIn 0.2s cubic-bezier(0.34,1.2,0.64,1)' }}>
              {/* Modal topbar */}
              <div style={{ background: '#fff', borderBottom: '1px solid #F0F0F0', padding: '13px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: rc.edge }} />
                  <span style={{ fontWeight: 700, fontSize: 13.5, color: '#111827' }}>Detail Pasien</span>
                  <span style={{ marginLeft: 4, fontSize: 12.5, color: '#9CA3AF', fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>— {selectedPatient.full_name}</span>
                </div>
                <button className="close-btn" onClick={() => setSelectedId(null)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', transition: 'all 0.15s', flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
              {/* Modal body */}
              <div style={{ overflowY: 'auto', flex: 1, padding: '18px 18px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Hero card */}
                <div style={{
                  flexShrink: 0,
                  background: '#fff',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.02), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
                  border: '1px solid #E2E8F0',
                  position: 'relative'
                }}>
                  <div style={{ padding: '20px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <AvatarCircle name={selectedPatient.full_name} size={56} bg={rc.sqBg} />
                        <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: '2.5px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                      </div>
                      {/* Middle: Name and details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: '0 0 5px', fontWeight: 750, fontSize: 19, color: '#1E293B', lineHeight: 1.2, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{selectedPatient.full_name}</p>
                        <p style={{ margin: '0 0 10px', fontSize: 13, color: '#6B7280', fontWeight: 500 }}>
                          {selectedPatient.age} tahun · Pasien Prolanis
                          {selectedPatient.main_factor && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', background: '#F1F5F9', color: '#475569', padding: '1px 6px', borderRadius: 4, marginLeft: 8, fontSize: 10.5, fontWeight: 600 }}>
                              🎯 {selectedPatient.main_factor}
                            </span>
                          )}
                        </p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          <DiseasePill type={selectedPatient.disease_type} />
                          <StatusPill label={calculatedStatus === 'bahaya' ? 'Bahaya' : calculatedStatus === 'waswas' ? 'Waswas' : 'Aman'} risk={calculatedRiskLabel} />
                        </div>
                      </div>
                      
                      {/* Right: Score + Action in premium layout */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexShrink: 0 }}>
                        {/* Health Score Mini Widget */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: hsBgTint, border: `1.5px solid ${hsBorder}`, padding: '6px 12px', borderRadius: 12 }}>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ display: 'block', fontSize: 8.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1 }}>Health</span>
                            <span style={{ display: 'block', fontSize: 8.5, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.5 }}>Score</span>
                          </div>
                          <div style={{ fontSize: 24, fontWeight: 900, color: hsColor, fontFamily: 'IBM Plex Mono, monospace', lineHeight: 1 }}>{hs}</div>
                        </div>

                        {/* Divider */}
                        <div style={{ width: 1, height: 40, background: '#E2E8F0' }} />
                        
                        {contacted.has(selectedPatient.patient_id) ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 10, padding: '9px 16px', fontSize: 12, fontWeight: 700, color: '#059669', boxShadow: '0 2px 6px rgba(16,185,129,0.06)' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            Dihubungi
                          </div>
                        ) : (
                          <button className="contact-btn" onClick={() => handleContact(selectedPatient.patient_id)} style={{ background: '#0D9488', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(13,148,136,0.25)', transition: 'all 0.15s' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.85a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.72 16.92z" /></svg>
                            Hubungi
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Bottom Alert Callout */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', border: '1px solid #ECEEF3', borderRadius: 10, padding: '10px 14px', marginTop: 16 }}>
                      <span style={{ fontSize: 13 }}>⚠️</span>
                      <p style={{ margin: 0, fontSize: 11, color: '#475569', fontWeight: 500, lineHeight: 1.4 }}>
                        <strong>Disclaimer Klinis:</strong> Health Score &amp; Atribusi Faktor di atas bersifat indikatif dari model AI untuk mempermudah monitoring, bukan merupakan pengganti diagnosis medis resmi.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Chart + SHAP */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 12 }}>
                  <TrendChart dailyLogs={dailyLogs} loading={detailLoading} chartParam={chartParam} chartRange={chartRange} onParamChange={setChartParam} onRangeChange={setChartRange} />
                  <ShapCard factors={topFactors} loading={detailLoading} />
                </div>
                {/* Log Harian */}
                <LogCard dailyLogs={dailyLogs} loading={detailLoading} />
              </div>
            </div>
          </div>
        )
      })()}
      {/* ── Tren Detail: Slide Panel (from right) — real BE data ───────────── */}
      {trenPatient && (
        <TrenView
          patient={trenPatient}
          patientDetail={patientDetail}
          loading={detailLoading}
          onClose={() => setTrenPatientId(null)}
        />
      )}
      {/* ── Pre-Visit Brief: Modal lebar (dossier pra-kontrol) ──────────────── */}
      {briefPatient && (
        <BriefModal
          patient={briefPatient}
          brief={brief}
          loading={briefLoading}
          onClose={() => setBriefPatientId(null)}
        />
      )}
    </div>
  )
}

