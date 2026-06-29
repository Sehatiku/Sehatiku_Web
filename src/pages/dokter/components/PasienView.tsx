import { useState, type ReactNode } from 'react'
import type { PatientQueueItem, ConsultationResult } from '../../../lib/types'
import type { MockMetricSet } from '../dokterMockData'
import { MOCK_RISK_TREND } from '../dokterMockData'
import {
  SkeletonCard,
  AvatarCircle,
  StatusPill,
  DiseasePill,
  RISK_COLOR,
  DISEASE_LABEL,
} from './Common'
import TrendChart from './TrendChart'
import ShapCard from './ShapCard'
import LogCard from './LogCard'
import FeedbackCard from './FeedbackCard'

type QueueFilter = 'all' | 'bahaya' | 'waswas' | 'aman'
type ViewMode = 'antrean' | 'tren'

export interface PasienViewProps {
  loading: boolean
  queue: PatientQueueItem[]
  filteredQueue: PatientQueueItem[]
  queueFilter: QueueFilter
  setQueueFilter: (f: QueueFilter) => void
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  selectedPatient: PatientQueueItem | null
  safeSelectedIdx: number
  contacted: Set<string>
  handleContact: (id: string) => void
  feedbacks: Record<string, 'tepat' | 'tidak'>
  handleFeedback: (id: string, val: 'tepat' | 'tidak') => void
  chartParam: 'glucose' | 'bp'
  setChartParam: (p: 'glucose' | 'bp') => void
  chartRange: 7 | 14
  setChartRange: (r: 7 | 14) => void
  consultations: ConsultationResult[]
  onReviewConsultation: (id: string, notes: string) => void
  totalCount: number
  bahayaCount: number
  waswasCount: number
  amanCount: number
  // Tren props
  setTrenPatientId: (id: string | null) => void
  trenPatient: PatientQueueItem | null
  trenSearch: string
  setTrenSearch: (s: string) => void
  trenFilter: QueueFilter
  setTrenFilter: (f: QueueFilter) => void
  trenList: PatientQueueItem[]
  safeTrenIdx: number
  safeTrenMetrics: MockMetricSet
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F3F4F6', borderRadius: 9, padding: '7px 12px', width: 240 }}>
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
    <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 10, padding: 3, gap: 2 }}>
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
      {loading
        ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #F0F1F4', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <SkeletonCard h={72} />
            </div>
          ))
        : stats.map(stat => (
            <div key={stat.label} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #F0F1F4', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: 12.5, color: '#6B7280', fontWeight: 500, lineHeight: 1.4, flex: 1, paddingRight: 8 }}>{stat.label}</p>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: stat.iconBg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {stat.icon}
                </div>
              </div>
              <p style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800, color: stat.color, fontFamily: 'IBM Plex Mono, monospace', lineHeight: 1 }}>{stat.value}</p>
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
  filteredQueue,
  queueFilter, setQueueFilter,
  selectedId, setSelectedId,
  selectedPatient, safeSelectedIdx,
  contacted, handleContact,
  feedbacks, handleFeedback,
  chartParam, setChartParam,
  chartRange, setChartRange,
  consultations, onReviewConsultation,
  totalCount, bahayaCount, waswasCount, amanCount,
  setTrenPatientId, trenPatient,
  trenSearch, setTrenSearch,
  trenFilter, setTrenFilter,
  trenList, safeTrenIdx, safeTrenMetrics,
}: PasienViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('antrean')
  const [antreanSearch, setAntreanSearch] = useState('')

  const displayQueue = antreanSearch.trim()
    ? filteredQueue.filter(p => p.full_name.toLowerCase().includes(antreanSearch.trim().toLowerCase()))
    : filteredQueue

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', background: '#F4F5F7' }}>
      <style>{`
        @keyframes modalIn   { from { opacity:0; transform:scale(0.97) translateY(10px) } to { opacity:1; transform:scale(1) translateY(0) } }
        @keyframes backdropIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideInRight { from { opacity:0; transform:translateX(36px) } to { opacity:1; transform:translateX(0) } }
        .queue-row:hover  { background: #F8F9FC !important; }
        .tren-row:hover   { background: #F8F9FC !important; }
        .contact-btn:hover { background: #17B393 !important; }
        .close-btn:hover  { background: #F3F4F6 !important; border-color: #D1D5DB !important; }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── View Mode Toggle ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
        <div style={{ display: 'inline-flex', background: '#E2E5EF', borderRadius: 13, padding: 4, gap: 3 }}>
          {([
            {
              id: 'antrean' as ViewMode, label: 'Antrean & Tindakan',
              icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
            },
            {
              id: 'tren' as ViewMode, label: 'Tren & Riwayat',
              icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
            },
          ] as const).map(m => {
            const active = viewMode === m.id
            return (
              <button
                key={m.id}
                onClick={() => setViewMode(m.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '8px 18px', borderRadius: 10, border: 'none',
                  background: active ? '#fff' : 'transparent',
                  color: active ? '#1A2066' : '#8A93A1',
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                  boxShadow: active ? '0 2px 6px rgba(26,32,102,0.10)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ color: active ? '#5B6BF0' : '#B0B7C3', display: 'flex', alignItems: 'center' }}>{m.icon}</span>
                {m.label}
              </button>
            )
          })}
        </div>
        <span style={{ fontSize: 12, color: '#B0B7C3', fontStyle: 'italic' }}>
          {viewMode === 'antrean' ? 'Pantau & lakukan tindakan klinis pada pasien prioritas' : 'Analisis tren kesehatan & lihat riwayat klinis pasien'}
        </span>
      </div>

      {/* ── KPI Cards (shared) ─────────────────────────────────────────────── */}
      <KpiCards
        loading={loading}
        totalCount={totalCount}
        bahayaCount={bahayaCount}
        waswasCount={waswasCount}
        amanCount={amanCount}
      />

      {/* ── Toolbar (per mode state, shared UI) ───────────────────────────── */}
      <div style={{
        background: '#fff', borderRadius: 14, padding: '12px 18px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)', border: '1px solid #F0F1F4',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, marginBottom: 14, flexWrap: 'wrap',
      }}>
        {viewMode === 'antrean' ? (
          <SearchBar value={antreanSearch} onChange={setAntreanSearch} />
        ) : (
          <SearchBar value={trenSearch} onChange={setTrenSearch} />
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {viewMode === 'antrean' ? (
            <FilterSegment selected={queueFilter} onChange={setQueueFilter} />
          ) : (
            <FilterSegment selected={trenFilter} onChange={setTrenFilter} />
          )}
          <span style={{ background: '#F0F0F5', borderRadius: 20, padding: '4px 11px', fontSize: 12, fontWeight: 700, color: '#6B7280' }}>
            {viewMode === 'antrean' ? displayQueue.length : trenList.length} pasien
          </span>
        </div>
      </div>

      {/* ── Table: Antrean Mode ────────────────────────────────────────────── */}
      {viewMode === 'antrean' && (
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 2px rgba(0,0,0,0.06)', border: '1px solid #F0F1F4', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 72px 28px', padding: '10px 22px', gap: 16, background: '#FAFAFA', borderBottom: '1px solid #F0F0F0' }}>
            {['NAMA PASIEN', 'PENYAKIT', 'STATUS', 'SKOR', ''].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#B0B7C3', letterSpacing: '0.7px', textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>
          {loading ? (
            <div style={{ padding: '12px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} h={56} />)}
            </div>
          ) : displayQueue.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 20px', gap: 8 }}>
              <span style={{ fontSize: 30 }}>🔍</span>
              <p style={{ margin: 0, fontSize: 13.5, color: '#9CA3AF' }}>
                {antreanSearch ? 'Pasien tidak ditemukan.' : 'Tidak ada pasien di kategori ini.'}
              </p>
            </div>
          ) : (
            displayQueue.map((p, idx) => {
              const c = RISK_COLOR[p.risk_label]
              const hs = 100 - p.risk_score
              const hsColor = hs >= 70 ? '#10B981' : hs >= 40 ? '#F59E0B' : '#EF4444'
              const hasOpenConsult = consultations.some(cx => cx.patient_id === p.patient_id && cx.status === 'open')
              const needsContact = !contacted.has(p.patient_id) && (p.status === 'bahaya' || p.status === 'waswas')
              return (
                <div
                  key={p.patient_id}
                  className="queue-row"
                  onClick={() => setSelectedId(p.patient_id)}
                  style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 72px 28px', alignItems: 'center', padding: '13px 22px', gap: 16, borderBottom: idx < displayQueue.length - 1 ? '1px solid #F5F5F7' : 'none', cursor: 'pointer', transition: 'background 0.1s', background: '#fff' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <AvatarCircle name={p.full_name} size={36} bg={c.sqBg} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: '0 0 3px', fontWeight: 600, fontSize: 13.5, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.full_name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11.5, color: '#9CA3AF' }}>{p.age} thn</span>
                        {hasOpenConsult && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 4, padding: '1px 6px', fontSize: 9.5, fontWeight: 700, color: '#D97706' }}>
                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#F59E0B' }} />Review
                          </span>
                        )}
                        {needsContact && (
                          <span style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 4, padding: '1px 6px', fontSize: 9.5, fontWeight: 700, color: '#7C3AED' }}>⚡ Hubungi</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 500, color: '#4B5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{DISEASE_LABEL[p.disease_type]}</span>
                  <div><StatusPill label={p.status === 'bahaya' ? 'Bahaya' : p.status === 'waswas' ? 'Waswas' : 'Aman'} risk={p.risk_label} /></div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: hsColor, fontFamily: 'IBM Plex Mono, monospace' }}>{hs}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ── Table: Tren Mode ───────────────────────────────────────────────── */}
      {viewMode === 'tren' && (
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 2px rgba(0,0,0,0.06)', border: '1px solid #F0F1F4', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1.2fr 80px 90px 80px 72px 28px', padding: '10px 22px', gap: 14, background: '#FAFAFA', borderBottom: '1px solid #F0F0F0' }}>
            {['NAMA PASIEN', 'PENYEBAB UTAMA', 'KEPATUHAN', 'PENYAKIT', 'STATUS', 'SKOR', ''].map(h => (
              <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#B0B7C3', letterSpacing: '0.6px', textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>
          {loading ? (
            <div style={{ padding: '12px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} h={56} />)}
            </div>
          ) : trenList.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', gap: 8 }}>
              <span style={{ fontSize: 28 }}>📊</span>
              <p style={{ margin: 0, fontSize: 13.5, color: '#9CA3AF' }}>
                {queue.length === 0 ? 'Belum ada pasien terdaftar.' : 'Tidak ada pasien yang cocok.'}
              </p>
            </div>
          ) : (
            trenList.map((p, idx) => {
              const c = RISK_COLOR[p.risk_label]
              const hs = 100 - p.risk_score
              const hsColor = hs >= 70 ? '#10B981' : hs >= 40 ? '#F59E0B' : '#EF4444'
              const compliance = p.status === 'bahaya' ? { val: '40%', color: '#EF4444' } : p.status === 'waswas' ? { val: '71%', color: '#F59E0B' } : { val: '100%', color: '#10B981' }
              return (
                <div
                  key={p.patient_id}
                  className="tren-row"
                  onClick={() => setTrenPatientId(p.patient_id)}
                  style={{ display: 'grid', gridTemplateColumns: '2.2fr 1.2fr 80px 90px 80px 72px 28px', alignItems: 'center', padding: '13px 22px', gap: 14, borderBottom: idx < trenList.length - 1 ? '1px solid #F5F5F7' : 'none', cursor: 'pointer', transition: 'background 0.1s', background: '#fff' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                    <AvatarCircle name={p.full_name} size={36} bg={c.sqBg} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: 13.5, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.full_name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF' }}>{p.age} tahun</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 12.5, color: '#4B5563', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.main_factor || 'Kondisi Stabil'}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: compliance.color, fontFamily: 'IBM Plex Mono, monospace' }}>{compliance.val}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 500, color: '#4B5563' }}>{DISEASE_LABEL[p.disease_type]}</span>
                  <StatusPill label={p.status === 'bahaya' ? 'Bahaya' : p.status === 'waswas' ? 'Waswas' : 'Aman'} risk={p.risk_label} />
                  <span style={{ fontSize: 15, fontWeight: 800, color: hsColor, fontFamily: 'IBM Plex Mono, monospace' }}>{hs}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ── Antrean Detail: Modal Popup (center) ───────────────────────────── */}
      {viewMode === 'antrean' && selectedPatient && (() => {
        const rc = RISK_COLOR[selectedPatient.risk_label]
        const hs = 100 - selectedPatient.risk_score
        const hsBg = hs >= 70 ? '#10B981' : hs >= 40 ? '#F59E0B' : '#EF4444'
        return (
          <div
            onClick={e => { if (e.target === e.currentTarget) setSelectedId(null) }}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'backdropIn 0.18s ease' }}
          >
            <div style={{ width: '100%', maxWidth: 880, maxHeight: '92vh', background: '#F4F5F7', borderRadius: 20, boxShadow: '0 32px 80px rgba(15,23,42,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'modalIn 0.2s cubic-bezier(0.34,1.2,0.64,1)' }}>
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
                <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <div style={{ height: 3, background: `linear-gradient(90deg, ${rc.edge}, ${rc.edge}40)` }} />
                  <div style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <AvatarCircle name={selectedPatient.full_name} size={52} bg={rc.sqBg} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 18, color: '#111827', lineHeight: 1.2 }}>{selectedPatient.full_name}</p>
                        <p style={{ margin: '0 0 10px', fontSize: 12.5, color: '#9CA3AF' }}>
                          {selectedPatient.age} tahun · Pasien Prolanis
                          {selectedPatient.main_factor && <em style={{ color: '#B0B7C3' }}> · {selectedPatient.main_factor}</em>}
                        </p>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                          <DiseasePill type={selectedPatient.disease_type} />
                          <StatusPill label={selectedPatient.status === 'bahaya' ? 'Bahaya' : selectedPatient.status === 'waswas' ? 'Waswas' : 'Aman'} risk={selectedPatient.risk_label} />
                        </div>
                      </div>
                      {/* Score + action */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ width: 56, height: 56, borderRadius: 13, background: hsBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 20, fontFamily: 'IBM Plex Mono, monospace', boxShadow: `0 4px 12px ${hsBg}44` }}>{hs}</div>
                          <span style={{ display: 'block', marginTop: 4, fontSize: 9, fontWeight: 600, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Health Score</span>
                        </div>
                        {contacted.has(selectedPatient.patient_id) ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#F0FDF9', border: '1px solid #A7F3D0', borderRadius: 8, padding: '6px 12px', fontSize: 11.5, fontWeight: 700, color: '#059669' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            Dihubungi
                          </div>
                        ) : (
                          <button className="contact-btn" onClick={() => handleContact(selectedPatient.patient_id)} style={{ background: '#0D9488', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 3px 10px rgba(13,148,136,0.3)', transition: 'background 0.15s' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.85a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.72 16.92z" /></svg>
                            Hubungi
                          </button>
                        )}
                      </div>
                    </div>
                    <p style={{ margin: '12px 0 0', fontSize: 10.5, color: '#C4CBD4', paddingTop: 12, borderTop: '1px solid #F5F5F7' }}>⚠️ Health Score & atribusi bersifat indikatif — bukan diagnosis medis.</p>
                  </div>
                </div>
                {/* Chart + SHAP */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 12 }}>
                  <TrendChart patientIdx={safeSelectedIdx} chartParam={chartParam} chartRange={chartRange} onParamChange={setChartParam} onRangeChange={setChartRange} />
                  <ShapCard patientIdx={safeSelectedIdx} />
                </div>
                {/* Log + Feedback */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 12 }}>
                  <LogCard patientIdx={safeSelectedIdx} />
                  <FeedbackCard patient={selectedPatient} feedbacks={feedbacks} onFeedback={handleFeedback} />
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Tren Detail: Slide Panel (from right) ─────────────────────────── */}
      {viewMode === 'tren' && trenPatient && (() => {
        const trendData = MOCK_RISK_TREND[Math.min(safeTrenIdx, MOCK_RISK_TREND.length - 1)]
        return (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setTrenPatientId(null)}
              style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(15,23,42,0.35)', backdropFilter: 'blur(3px)', animation: 'backdropIn 0.2s ease' }}
            />
            {/* Slide panel */}
            <div style={{
              position: 'fixed', top: 0, right: 0, height: '100vh', width: 520,
              background: '#F4F5F7', zIndex: 901, overflowY: 'auto',
              boxShadow: '-6px 0 32px rgba(15,23,42,0.18)',
              animation: 'slideInRight 0.25s cubic-bezier(0.34,1.1,0.64,1)',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Panel header */}
              <div style={{ background: '#fff', borderBottom: '1px solid #F0F0F0', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'sticky', top: 0, zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: RISK_COLOR[trenPatient.risk_label].edge }} />
                  <span style={{ fontWeight: 700, fontSize: 13.5, color: '#111827' }}>Tren & Riwayat Klinis</span>
                </div>
                <button className="close-btn" onClick={() => setTrenPatientId(null)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', transition: 'all 0.15s' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>

              {/* Panel body */}
              <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Patient mini-header */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <AvatarCircle name={trenPatient.full_name} size={44} bg={RISK_COLOR[trenPatient.risk_label].sqBg} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#111827' }}>{trenPatient.full_name}</p>
                      <StatusPill label={trenPatient.status === 'bahaya' ? 'Bahaya' : trenPatient.status === 'waswas' ? 'Waswas' : 'Aman'} risk={trenPatient.risk_label} />
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>
                      {trenPatient.age} tahun · {DISEASE_LABEL[trenPatient.disease_type]} · Riwayat 6 bulan
                      <span style={{ marginLeft: 10, fontWeight: 700, color: safeTrenMetrics.deltaColor }}>{safeTrenMetrics.delta} {safeTrenMetrics.deltaLabel}</span>
                    </p>
                  </div>
                </div>

                {/* Health Score Bar Chart */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 13, color: '#111827' }}>Tren Health Score</p>
                  <p style={{ margin: '0 0 14px', fontSize: 11, color: '#9CA3AF' }}>Skor kesehatan bulanan (0–100)</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 130, padding: '0 4px' }}>
                    {trendData.map((entry, i) => {
                      const hs = 100 - entry.score
                      const barColor = hs >= 70 ? '#10B981' : hs >= 40 ? '#F59E0B' : '#EF4444'
                      const barH = Math.max(10, Math.round((hs / 100) * 96))
                      return (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: barColor, fontFamily: 'IBM Plex Mono, monospace' }}>{hs}</span>
                          <div style={{ width: '100%', height: barH, background: `linear-gradient(180deg, ${barColor}BB 0%, ${barColor} 100%)`, borderRadius: '5px 5px 0 0', boxShadow: `0 2px 5px ${barColor}33` }} />
                          <span style={{ fontSize: 9.5, color: '#9CA3AF' }}>{entry.month}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Clinical metrics */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 13, color: '#111827' }}>Parameter Klinis Terkini</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {safeTrenMetrics.metrics.map((m, i) => (
                      <div key={i} style={{ background: '#F9FAFB', borderRadius: 10, padding: '11px 13px', border: '1px solid #F0F1F4' }}>
                        <p style={{ margin: '0 0 5px', fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{m.label}</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                          <span style={{ fontSize: 20, fontWeight: 800, color: '#111827', fontFamily: 'IBM Plex Mono, monospace' }}>{m.value}</span>
                          {m.unit && <span style={{ fontSize: 10, color: '#9CA3AF' }}>{m.unit}</span>}
                        </div>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: m.trendBg, borderRadius: 5, padding: '2px 7px', fontSize: 11, fontWeight: 700, color: m.trendColor, marginTop: 6 }}>
                          {m.arrow} {m.deltaTxt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div style={{ background: '#fff', borderRadius: 14, padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <p style={{ margin: '0 0 14px', fontWeight: 700, fontSize: 13, color: '#111827' }}>Riwayat Klinis</p>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {safeTrenMetrics.timeline.map((tl, i) => {
                      const last = i === safeTrenMetrics.timeline.length - 1
                      return (
                        <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: last ? 0 : 14 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ width: 9, height: 9, borderRadius: '50%', background: tl.color, flexShrink: 0 }} />
                            {!last && <div style={{ width: 1.5, flex: 1, background: '#F0F0F0', marginTop: 4, minHeight: 18 }} />}
                          </div>
                          <div style={{ paddingBottom: last ? 0 : 4 }}>
                            <p style={{ margin: '0 0 2px', fontSize: 10.5, color: '#9CA3AF' }}>{tl.date}</p>
                            <p style={{ margin: '0 0 1px', fontWeight: 600, fontSize: 12.5, color: '#111827' }}>{tl.title}</p>
                            <p style={{ margin: 0, fontSize: 11.5, color: '#6B7280' }}>{tl.note}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      })()}
    </div>
  )
}
