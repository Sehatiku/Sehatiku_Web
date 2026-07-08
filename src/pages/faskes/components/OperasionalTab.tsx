import { useState, useEffect } from 'react'
import { faskesApi } from '../../../lib/api'
import type { FaskesPatientItem, FaskesPatientDetail, BaselineHistoryItem, NakesItem } from '../../../lib/types'
import { initials } from '../../../lib/utils'
import PatientDetailDrawer from './PatientDetailDrawer'

interface Patient {
  id: string
  name: string
  disease: string
  healthScore: number | null
  status: string
  patientStatus: string
  cause: string
  age: number
}

interface OperasionalTabProps {
  setActiveTab: (tab: 'pendaftaran' | 'operasional' | 'eskalasi' | 'dokter' | 'pasien') => void
  showToastMsg: (msg: string, type?: 'success' | 'error' | 'info') => void
  faskesName: string
  nakesItems?: NakesItem[]
  nakesLoading?: boolean
}

export default function OperasionalTab({
  setActiveTab,
  showToastMsg,
  faskesName,
}: OperasionalTabProps) {
  // Phase Operasional States
  const [patients, setPatients] = useState<Patient[]>([])

  // Patient summary (for Ringkasan Pasien card)
  const [ptSummary, setPtSummary] = useState<FaskesPatientItem[]>([])
  const [ptSummaryLoading, setPtSummaryLoading] = useState(true)

  useEffect(() => {
    faskesApi.getPatients(1, 100)
      .then(res => {
        setPtSummary(res.data)
        setPtSummaryLoading(false)

        // Map real patient items to operasional table state
        const mapped = res.data.map((p) => {
          const score = p.health_score !== null && p.health_score !== undefined
            ? p.health_score
            : null

          let status = '—'
          if (p.risk_status) {
            const lowerRisk = p.risk_status.toLowerCase()
            if (lowerRisk === 'bahaya' || lowerRisk === 'kritis') status = 'Bahaya'
            else if (lowerRisk === 'waswas' || lowerRisk === 'sedang') status = 'Waswas'
            else if (lowerRisk === 'aman' || lowerRisk === 'sehat') status = 'Aman'
          }

          let cause = 'Kondisi Terkontrol'
          if (p.top_factors && p.top_factors.length > 0) {
            cause = p.top_factors[0]
          }

          let disease = 'Diabetes'
          if (p.disease_type === 'hypertension') {
            disease = 'Hipertensi'
          } else if (p.disease_type === 'both') {
            disease = 'DM + HT'
          }

          return {
            id: p.patient_id,
            name: p.full_name,
            disease,
            healthScore: score,
            status,
            patientStatus: p.status,
            cause,
            age: p.age
          }
        })

        // Sort patients by health score: lowest to highest, putting nulls at the end
        const sortedMapped = mapped.sort((a, b) => {
          if (a.healthScore === null && b.healthScore === null) return 0
          if (a.healthScore === null) return 1
          if (b.healthScore === null) return -1
          return a.healthScore - b.healthScore
        })

        setPatients(sortedMapped)
      })
      .catch(() => setPtSummaryLoading(false))
  }, [])

  // Modals States
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [progressPatientId, setProgressPatientId] = useState<string | null>(null)

  // Detail drawer (Baseline & Kontrol) — pakai editor baseline asli yang sama dgn tab Pasien
  const [detailPatient, setDetailPatient] = useState<FaskesPatientDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const handleOpenBaseline = async (id: string) => {
    setDetailPatient(null)
    setDetailLoading(true)
    try {
      const d = await faskesApi.getPatientDetail(id)
      setDetailPatient(d)
    } catch {
      showToastMsg('⚠️ Gagal memuat detail pasien. Coba lagi.')
    } finally {
      setDetailLoading(false)
    }
  }

  const [loadingProgress, setLoadingProgress] = useState(false)
  const [progressHistory, setProgressHistory] = useState<BaselineHistoryItem[]>([])

  useEffect(() => {
    if (!progressPatientId || !showProgressModal) return

    const loadHistory = async () => {
      setLoadingProgress(true)
      try {
        const res = await faskesApi.getPatientBaselineHistory(progressPatientId)
        setProgressHistory(res.data.baseline_history || [])
      } catch (err) {
        console.error('Error fetching progress history:', err)
        setProgressHistory([])
      } finally {
        setLoadingProgress(false)
      }
    }
    loadHistory()
  }, [progressPatientId, showProgressModal])

  // Helper functions
  const getHealthColor = (score: number | null) => {
    if (score === null || score === undefined) return '#94A3B8'
    if (score >= 70) return '#10B981'
    if (score >= 40) return '#F59E0B'
    return '#EF4444'
  }

  const getHealthShadow = (score: number | null) => {
    if (score === null || score === undefined) return 'rgba(148,163,184,0.15)'
    if (score >= 70) return 'rgba(16,185,129,0.2)'
    if (score >= 40) return 'rgba(245,158,11,0.2)'
    return 'rgba(239,68,68,0.2)'
  }

  const getStatusStyle = (st: string | null) => {
    if (!st || st === '—') return { color: '#64748B', bg: '#F1F5F9', border: '#E2E8F0', edge: '#94A3B8' }
    if (st === 'Bahaya' || st === 'Parah') return { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', edge: '#EF4444' }
    if (st === 'Waswas') return { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', edge: '#F59E0B' }
    return { color: '#059669', bg: '#F0FDF4', border: '#A7F3D0', edge: '#0D9488' }
  }

  const progressPatient = patients.find(p => p.id === progressPatientId)

  const dateStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date())

  return (
    <div className="anim-fadein">

      {/* Welcome Greeting Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.4px' }}>
            Selamat datang, {faskesName}
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#64748B', fontWeight: 500 }}>
            Ringkasan operasional faskes • {dateStr}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setActiveTab('pendaftaran')}
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #5B6BF0 55%, #4558E8 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 14,
              padding: '12px 22px',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 8px 22px rgba(91, 107, 240, 0.35)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(91, 107, 240, 0.45)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(91, 107, 240, 0.35)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Pendaftaran Baru
          </button>
        </div>
      </div>

      {/* 4 Cards Grid (Unified with Doctor's KpiCards style) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 16 }}>

        {/* Card 1: Total Pasien (Teal Highlighted Card) */}
        <div style={{
          background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
          borderRadius: 16,
          padding: '16px 18px',
          boxShadow: '0 8px 20px rgba(13, 148, 136, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          color: '#ffffff'
        }}>
          <div style={{ position: 'absolute', top: -24, right: -24, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 12.5, color: 'rgba(255,255,255,0.85)', fontWeight: 600, lineHeight: 1.4, flex: 1, paddingRight: 8, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Total Pasien</p>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
          </div>
          <p style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: '#ffffff', fontFamily: 'IBM Plex Mono, monospace', lineHeight: 1 }}>{ptSummaryLoading ? '…' : patients.length}</p>
          <p style={{ margin: 0, fontSize: 11.5, color: 'rgba(255,255,255,0.7)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>pasien terdaftar</p>
        </div>

        {/* Card 2: Risiko Bahaya */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px 18px', border: '1px solid #ECEEF3', boxShadow: '0 1px 3px rgba(15,36,68,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 12.5, color: '#64748B', fontWeight: 500, lineHeight: 1.4, flex: 1, paddingRight: 8, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Risiko Bahaya</p>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEF2F2', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            </div>
          </div>
          <p style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: '#EF4444', fontFamily: 'IBM Plex Mono, monospace', lineHeight: 1 }}>{ptSummaryLoading ? '…' : patients.filter(p => p.status === 'Bahaya').length}</p>
          <p style={{ margin: 0, fontSize: 11.5, color: '#9CA3AF', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>perlu perhatian segera</p>
        </div>

        {/* Card 3: Perlu Pantau */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px 18px', border: '1px solid #ECEEF3', boxShadow: '0 1px 3px rgba(15,36,68,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 12.5, color: '#64748B', fontWeight: 500, lineHeight: 1.4, flex: 1, paddingRight: 8, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Perlu Pantau</p>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFFBEB', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            </div>
          </div>
          <p style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: '#D97706', fontFamily: 'IBM Plex Mono, monospace', lineHeight: 1 }}>{ptSummaryLoading ? '…' : patients.filter(p => p.status === 'Waswas').length}</p>
          <p style={{ margin: 0, fontSize: 11.5, color: '#9CA3AF', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>dalam pengawasan</p>
        </div>

        {/* Card 4: Status Aman */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px 18px', border: '1px solid #ECEEF3', boxShadow: '0 1px 3px rgba(15,36,68,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 12.5, color: '#64748B', fontWeight: 500, lineHeight: 1.4, flex: 1, paddingRight: 8, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Status Aman</p>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ECFDF5', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>
          </div>
          <p style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: '#059669', fontFamily: 'IBM Plex Mono, monospace', lineHeight: 1 }}>{ptSummaryLoading ? '…' : patients.filter(p => p.status === 'Aman').length}</p>
          <p style={{ margin: 0, fontSize: 11.5, color: '#9CA3AF', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>kondisi terkontrol</p>
        </div>

      </div>

      {/* Clinical Dashboard — full width */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, alignItems: 'start' }}>

        {/* ── LEFT COLUMN (66%) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Antrian Prioritas Pasien Table */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(18px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(18px) saturate(1.6)',
            borderRadius: 18,
            boxShadow: '0 10px 30px rgba(24, 39, 105, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
            border: '1px solid rgba(255, 255, 255, 0.7)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #ECEEF3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Antrian Prioritas Pasien</div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>Diurutkan otomatis berdasarkan Health Score terendah — tertinggi</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#EEF0FF', border: '1px solid rgba(91,107,240,0.15)', borderRadius: 10, padding: '6px 12px' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#5B6BF0' }}></div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#5B6BF0' }}>AI Auto-Sorted</span>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ background: 'rgba(248,250,252,0.6)', borderBottom: '1px solid #EDF0F5' }}>
                    <th style={{ padding: '12px 12px 12px 24px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Pasien</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Penyakit</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Status Risiko</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: '0.7px', width: 140 }}>Health Score</th>
                    <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#B0B7C3', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {ptSummaryLoading && Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`sk-${i}`} style={{ borderTop: '1px solid #ECEEF3' }}>
                      <td style={{ padding: '14px 12px 14px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="sk-shimmer" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div className="sk-shimmer" style={{ width: '55%', height: 11, borderRadius: 5, marginBottom: 6 }} />
                            <div className="sk-shimmer" style={{ width: '35%', height: 9, borderRadius: 5 }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}><div className="sk-shimmer" style={{ width: 56, height: 18, borderRadius: 6 }} /></td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}><div className="sk-shimmer" style={{ width: 64, height: 20, borderRadius: 20, margin: '0 auto' }} /></td>
                      <td style={{ padding: '14px 16px' }}><div className="sk-shimmer" style={{ width: '100%', height: 18, borderRadius: 6 }} /></td>
                      <td style={{ padding: '14px 24px' }}><div className="sk-shimmer" style={{ width: '100%', height: 26, borderRadius: 8 }} /></td>
                    </tr>
                  ))}
                  {!ptSummaryLoading && patients.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '40px 24px', textAlign: 'center', color: '#64748B', fontSize: 13.5 }}>
                        Belum ada data pasien Prolanis terdaftar.
                      </td>
                    </tr>
                  )}
                  {patients.map((p) => {
                    const style = getStatusStyle(p.status)
                    const color = getHealthColor(p.healthScore)
                    const shadow = getHealthShadow(p.healthScore)

                    let avatarBg = '#0D9488'
                    if (p.status === 'Bahaya') {
                      avatarBg = '#EF4444'
                    } else if (p.status === 'Waswas') {
                      avatarBg = '#F59E0B'
                    } else if (p.status === '—') {
                      avatarBg = '#64748B'
                    }

                    return (
                      <tr
                        key={p.id}
                        style={{ borderTop: '1px solid #EDF0F5', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F8F9FC')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '14px 12px 14px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: '50%',
                              background: avatarBg, display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontSize: 12.5, fontWeight: 700,
                              color: '#ffffff', flexShrink: 0
                            }}>
                              {initials(p.name)}
                            </div>
                            <div>
                              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap' }}>{p.name}</div>
                              <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 1 }}>{p.age} tahun</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: 12.5, fontWeight: 500, color: '#4B5563', whiteSpace: 'nowrap' }}>
                            {p.disease}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            background: style.bg, border: `1px solid ${style.border || 'transparent'}`,
                            color: style.color,
                            fontSize: 11, fontWeight: 700, padding: '3px 9px',
                            borderRadius: 20, whiteSpace: 'nowrap'
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: style.edge || '#64748B', flexShrink: 0 }} />
                            {p.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                            <div style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: 32, height: 32, borderRadius: 8, background: color,
                              boxShadow: `0 2px 6px ${shadow}`, flexShrink: 0
                            }}>
                              <span style={{ color: '#fff', fontSize: 12.5, fontWeight: 800 }}>
                                {p.healthScore !== null ? p.healthScore : '—'}
                              </span>
                            </div>
                            <div style={{ flex: 1, minWidth: 40 }}>
                              <div style={{ height: 5, borderRadius: 3, background: '#F1F5F9', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${p.healthScore !== null ? p.healthScore : 0}%`, borderRadius: 3, background: color }}></div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                            <button
                              onClick={() => { setProgressPatientId(p.id); setShowProgressModal(true) }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 4, background: '#EEF0FF',
                                border: 'none', borderRadius: 8, padding: '6px 10px',
                                fontSize: 11.5, fontWeight: 700, color: '#5B6BF0',
                                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,107,240,0.18)'}
                              onMouseLeave={e => e.currentTarget.style.background = '#EEF0FF'}
                            >
                              Progress
                            </button>
                            <button
                              onClick={() => handleOpenBaseline(p.id)}
                              style={{
                                background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 8,
                                padding: '5px 10px', fontSize: 11.5, fontWeight: 600, color: '#64748B',
                                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                            >
                              Baseline
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Indicator Notice Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderTop: '1px solid #ECEEF3', background: '#FAFBFC' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span style={{ fontSize: 11.5, color: '#64748B', lineHeight: 1.4, fontWeight: 500 }}>
                Health Score merupakan indikator otomatis. Pengambilan keputusan rujukan tetap didasarkan pada penegakan diagnosis klinis dokter.
              </span>
            </div>
          </div>

          {/* Clinical Reference & Disease Distribution (Side by Side) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Disease distribution bar chart */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(18px) saturate(1.6)',
              WebkitBackdropFilter: 'blur(18px) saturate(1.6)',
              borderRadius: 18,
              padding: 18,
              boxShadow: '0 10px 30px rgba(24, 39, 105, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
              border: '1px solid rgba(255, 255, 255, 0.7)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Distribusi Penyakit Pasien</div>
                  <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 2 }}>Breakdown kategori pasien Prolanis</div>
                </div>
                <button
                  onClick={() => setActiveTab('pasien')}
                  style={{
                    background: '#EEF0FF', border: 'none', borderRadius: 8, color: '#5B6BF0',
                    fontSize: 11.5, padding: '6px 12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,107,240,0.18)'}
                  onMouseLeave={e => e.currentTarget.style.background = '#EEF0FF'}
                >
                  Lihat Semua
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {([
                  { key: 'diabetes_t2', label: 'Diabetes Melitus', color: '#5B6BF0', bg: '#EEF0FF' },
                  { key: 'hypertension', label: 'Hipertensi', color: '#0D9488', bg: 'rgba(13,148,136,0.08)' },
                  { key: 'both', label: 'DM & Hipertensi', color: '#8B5CF6', bg: '#F5F3FF' },
                ] as const).map(d => {
                  const count = ptSummary.filter(p => p.disease_type === d.key).length
                  const total = ptSummary.length || 1
                  const pct = ptSummaryLoading ? 0 : Math.round((count / total) * 100)
                  return (
                    <div key={d.key}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ background: d.bg, color: d.color, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>{d.label}</span>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A' }}>
                          {ptSummaryLoading ? '—' : count}
                          <span style={{ fontSize: 10.5, fontWeight: 500, color: '#94A3B8', marginLeft: 4 }}>({pct}%)</span>
                        </span>
                      </div>
                      <div style={{ height: 6, borderRadius: 4, background: '#F1F5F9', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 4, background: d.color, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Reference Ranges baseline card */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(18px) saturate(1.6)',
              WebkitBackdropFilter: 'blur(18px) saturate(1.6)',
              borderRadius: 18,
              padding: 18,
              boxShadow: '0 10px 30px rgba(24, 39, 105, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
              border: '1px solid rgba(255, 255, 255, 0.7)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Ambang Batas Klinis Acuan</div>
                <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 2, marginBottom: 14 }}>Parameter monitoring rujukan Kemenkes</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, flex: 1 }}>
                {[
                  { label: 'HbA1c', target: 'Target < 7.0%', color: '#5B6BF0', bg: '#EEF0FF' },
                  { label: 'LDL Kol.', target: '< 100 mg/dL', color: '#8B5CF6', bg: '#F5F3FF' },
                  { label: 'eGFR', target: '≥ 60 mL/min', color: '#0D9488', bg: 'rgba(13,148,136,0.05)' },
                  { label: 'Tensi', target: '< 130/80 mmHg', color: '#5B6BF0', bg: '#EEF0FF' },
                ].map(m => (
                  <div key={m.label} style={{ background: m.bg, borderRadius: 10, padding: '8px 10px', border: '1px solid rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: 9, color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>{m.label}</div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: m.color, marginTop: 2 }}>{m.target}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>



        </div>

      </div>


      {/* ── PROGRESS MODAL ── */}
      {showProgressModal && progressPatient && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowProgressModal(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(43,45,66,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeInOpacity 0.2s ease-out', backdropFilter: 'blur(2px)', padding: 20 }}
        >
          <div style={{ background: '#fff', borderRadius: 20, width: 640, maxWidth: '95vw', boxShadow: '0 24px 70px rgba(15,36,68,0.28)', border: '1px solid #ECEEF3', maxHeight: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Modal Header */}
            <div style={{ flexShrink: 0, background: '#fff', borderRadius: '20px 20px 0 0', padding: '20px 24px', borderBottom: '1px solid #EEF1F6', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, flexShrink: 0,
                background: progressPatient.disease === 'Diabetes' ? 'rgba(91,107,240,0.08)' : 'rgba(79,195,247,0.12)',
                color: progressPatient.disease === 'Diabetes' ? '#5B6BF0' : '#0277BD',
              }}>
                {initials(progressPatient.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#2B2D42', letterSpacing: '-0.3px' }}>{progressPatient.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: '#8A93A1' }}>{progressPatient.age} tahun</span>
                  <span style={{
                    background: progressPatient.disease === 'Diabetes' ? 'rgba(91,107,240,0.08)' : 'rgba(79,195,247,0.12)',
                    color: progressPatient.disease === 'Diabetes' ? '#5B6BF0' : '#0277BD',
                    fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20
                  }}>
                    {progressPatient.disease}
                  </span>
                  {(() => {
                    const hs = progressHistory.length > 0 ? Math.max(0, 100 - (progressHistory[0].cvd_risk_10yr_pct ?? 0)) : (progressPatient.healthScore ?? 0)
                    const statusVal = hs >= 70 ? 'Aman' : hs >= 40 ? 'Waswas' : 'Bahaya'
                    const styleVal = getStatusStyle(statusVal)
                    return (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: styleVal.bg, border: `1px solid ${styleVal.border || 'transparent'}`,
                        color: styleVal.color,
                        fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: styleVal.edge || '#64748B', flexShrink: 0 }} />
                        {statusVal}
                      </span>
                    )
                  })()}
                </div>
              </div>

              {/* Score badge — top-right of modal header */}
              <div style={{
                display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                width: 58, height: 58, borderRadius: 15,
                background: getHealthColor(progressHistory.length > 0 ? Math.max(0, 100 - (progressHistory[0].cvd_risk_10yr_pct ?? 0)) : (progressPatient.healthScore ?? 0)),
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)', flexShrink: 0,
              }}>
                <span style={{ color: '#fff', fontSize: 19, fontWeight: 800, lineHeight: 1 }}>
                  {progressHistory.length > 0 ? Math.max(0, 100 - (progressHistory[0].cvd_risk_10yr_pct ?? 0)) : (progressPatient.healthScore ?? 0)}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 }}>
                  {(() => {
                    const hs = progressHistory.length > 0 ? Math.max(0, 100 - (progressHistory[0].cvd_risk_10yr_pct ?? 0)) : (progressPatient.healthScore ?? 0)
                    return hs >= 70 ? 'Aman' : hs >= 40 ? 'Waswas' : 'Bahaya'
                  })()}
                </span>
              </div>

              <button
                onClick={() => setShowProgressModal(false)}
                style={{ background: '#F1F5F9', border: 'none', borderRadius: 10, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', flexShrink: 0, marginLeft: 8, transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#334155' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#64748B' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '22px 24px 26px', overflowY: 'auto', flex: 1 }}>
              {loadingProgress ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#8a93a1', fontSize: 14 }}>
                  <div style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #E2E8F0', borderTopColor: '#5B6BF0', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 12 }}></div>
                  <div>Memuat data perkembangan...</div>
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
              ) : progressHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px', background: '#F7F8FA', borderRadius: 12, border: '1px dashed #DCDFE8', color: '#8A93A1', fontSize: 13 }}>
                  Belum ada rekam medis baseline klinis untuk pasien ini.
                </div>
              ) : (
                <>
                  {progressHistory.length === 1 && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '11px 13px', fontSize: 11.5, lineHeight: 1.5, color: '#1E40AF', marginBottom: 18 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                      <span>Diperlukan minimal 2 rekaman kontrol baseline untuk menampilkan perbandingan tren perkembangan secara lengkap.</span>
                    </div>
                  )}

                  {(() => {
                    const latest = progressHistory[0]
                    const oldest = progressHistory[progressHistory.length - 1]
                    const isSingleRecord = progressHistory.length < 2

                    const latestScore = Math.max(0, 100 - (latest.cvd_risk_10yr_pct ?? 0))
                    const oldestScore = Math.max(0, 100 - (oldest.cvd_risk_10yr_pct ?? 0))
                    const diff = latestScore - oldestScore

                    const trendVal = diff >= 0 ? `+${diff}` : `${diff}`
                    const trendLabel = diff > 0 ? 'Membaik' : diff === 0 ? 'Stabil' : 'Memburuk'
                    const trendColor = diff > 0 ? '#10B981' : diff === 0 ? '#F59E0B' : '#EF4444'
                    const trendBg = diff > 0 ? 'rgba(16,185,129,0.08)' : diff === 0 ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)'
                    const trendBorder = diff > 0 ? 'rgba(16,185,129,0.2)' : diff === 0 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'
                    const arrow = diff > 0 ? '↑' : diff === 0 ? '→' : '↓'

                    const chartData = [...progressHistory].reverse().map(h => {
                      const date = new Date(h.recorded_at)
                      const monthName = date.toLocaleDateString('id-ID', { month: 'short' })
                      const score = Math.max(0, 100 - (h.cvd_risk_10yr_pct ?? 0))
                      return { month: monthName, score }
                    }).slice(-6)

                    const hba1cDelta = (latest.hba1c_pct ?? 0) - (oldest.hba1c_pct ?? 0)
                    const bpDelta = (latest.systolic_bp_mmhg ?? 0) - (oldest.systolic_bp_mmhg ?? 0)
                    const bmiDelta = (latest.bmi ?? 0) - (oldest.bmi ?? 0)
                    const egfrDelta = (latest.egfr ?? 0) - (oldest.egfr ?? 0)

                    const indicators = [
                      {
                        label: 'HbA1c',
                        value: `${latest.hba1c_pct ?? 0}`,
                        unit: '%',
                        delta: hba1cDelta > 0 ? `+${hba1cDelta.toFixed(1)}` : `${hba1cDelta.toFixed(1)}`,
                        isImproving: hba1cDelta <= 0
                      },
                      {
                        label: 'Tekanan Darah',
                        value: `${latest.systolic_bp_mmhg ?? 0}/${latest.diastolic_bp_mmhg ?? 0}`,
                        unit: 'mmHg',
                        delta: bpDelta > 0 ? `+${bpDelta}` : `${bpDelta}`,
                        isImproving: bpDelta <= 0
                      },
                      {
                        label: 'BMI',
                        value: `${(latest.bmi ?? 0).toFixed(1)}`,
                        unit: 'kg/m²',
                        delta: bmiDelta > 0 ? `+${bmiDelta.toFixed(1)}` : `${bmiDelta.toFixed(1)}`,
                        isImproving: bmiDelta <= 0
                      },
                      {
                        label: 'Fungsi Ginjal (eGFR)',
                        value: `${latest.egfr ?? 0}`,
                        unit: 'mL/min',
                        delta: egfrDelta > 0 ? `+${egfrDelta.toFixed(1)}` : `${egfrDelta.toFixed(1)}`,
                        isImproving: egfrDelta >= 0
                      }
                    ]

                    return (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#2B2D42' }}>Tren Health Score</div>
                            <div style={{ fontSize: 11, color: '#8A93A1', marginTop: 1 }}>{chartData.length} catatan terakhir</div>
                          </div>
                          {isSingleRecord ? (
                            <div style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center',
                              background: '#F1F5F9', border: '1.5px solid #E2E8F0',
                              borderRadius: 10, padding: '7px 14px', minWidth: 64,
                            }}>
                              <span style={{ fontSize: 11, fontWeight: 800, color: '#64748B', lineHeight: 1.3 }}>Data pertama</span>
                            </div>
                          ) : (
                            <div style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center',
                              background: trendBg, border: `1.5px solid ${trendBorder}`,
                              borderRadius: 10, padding: '7px 14px', minWidth: 64,
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ fontSize: 16, fontWeight: 900, color: trendColor, lineHeight: 1 }}>{arrow}</span>
                                <span style={{ fontSize: 18, fontWeight: 900, color: trendColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{trendVal}</span>
                              </div>
                              <span style={{ fontSize: 9.5, fontWeight: 700, color: trendColor, marginTop: 3, letterSpacing: '0.3px', textTransform: 'uppercase' }}>{trendLabel}</span>
                            </div>
                          )}
                        </div>

                        {/* Monthly progress bars */}
                        <div style={{ background: '#FAFBFE', border: '1px solid #EEF2F7', borderRadius: 13, padding: '18px 20px 14px', marginBottom: 22 }}>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: chartData.length <= 3 ? 'center' : 'space-between', gap: chartData.length <= 3 ? 32 : 12, height: 130 }}>
                            {/* baseline */}
                            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 26, height: 1, background: '#E8EDF4' }} />
                            {chartData.map((bar, idx) => {
                              const barColor = getHealthColor(bar.score)
                              return (
                                <div key={idx} style={{ position: 'relative', width: 52, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', flex: 1, width: '100%' }}>
                                    <div style={{ fontSize: 11, fontWeight: 800, color: '#636B78', marginBottom: 6 }}>{bar.score}</div>
                                    <div style={{ width: '100%', maxWidth: 36, height: `${Math.max(bar.score, 4)}%`, background: barColor, borderRadius: '8px 8px 3px 3px', boxShadow: `0 4px 12px ${barColor}33` }}></div>
                                  </div>
                                  <div style={{ fontSize: 10, color: '#8A93A1', fontWeight: 600, marginTop: 8 }}>{bar.month}</div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Metrics changes list */}
                        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 18, fontSize: 13, fontWeight: 700, color: '#2B2D42', marginBottom: 12 }}>Perubahan Indikator Klinis <span style={{ fontWeight: 500, color: '#94A3B8', fontSize: 11.5 }}>(pertama → terbaru)</span></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
                          {indicators.map((m, idx) => {
                            const goodColor = '#10B981'
                            const badColor = '#EF4444'
                            const goodBg = 'rgba(16,185,129,0.10)'
                            const badBg = 'rgba(239,68,68,0.10)'
                            const neutralColor = '#94A3B8'
                            const neutralBg = 'rgba(148,163,184,0.10)'
                            const arrowColor = isSingleRecord ? neutralColor : m.isImproving ? goodColor : badColor
                            const arrowBg = isSingleRecord ? neutralBg : m.isImproving ? goodBg : badBg
                            const borderCol = isSingleRecord ? '#E2E8F0' : m.isImproving ? 'rgba(16,185,129,0.22)' : 'rgba(239,68,68,0.22)'
                            const shadowCol = isSingleRecord ? 'rgba(148,163,184,0.06)' : m.isImproving ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)'
                            const arrowIcon = m.isImproving ? '↑' : '↓'
                            const trendLabel = m.isImproving ? 'Membaik' : 'Memburuk'
                            return (
                              <div key={idx} style={{
                                background: '#fff',
                                border: `1.5px solid ${borderCol}`,
                                borderRadius: 12,
                                padding: '14px 14px 12px',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: `0 2px 10px ${shadowCol}`,
                              }}>
                                {/* Score badge — kanan atas */}
                                {!isSingleRecord && (
                                  <div style={{
                                    position: 'absolute', top: 10, right: 10,
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    background: arrowBg, borderRadius: 8, padding: '4px 8px', minWidth: 42,
                                  }}>
                                    <span style={{ fontSize: 13, fontWeight: 900, color: arrowColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{m.delta}</span>
                                    <span style={{ fontSize: 8, fontWeight: 700, color: arrowColor, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{trendLabel}</span>
                                  </div>
                                )}

                                {/* Label + nilai */}
                                <div style={{ paddingRight: isSingleRecord ? 0 : 58 }}>
                                  <div style={{ fontSize: 10, color: '#8A93A1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>{m.label}</div>
                                  <div style={{ fontSize: 18, fontWeight: 800, color: '#2B2D42', lineHeight: 1.1 }}>
                                    {m.value}{' '}
                                    <span style={{ fontSize: 11, fontWeight: 600, color: '#8A93A1' }}>{m.unit}</span>
                                  </div>
                                </div>

                                {/* Panah klinis */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10 }}>
                                  {isSingleRecord ? (
                                    <span style={{ fontSize: 11, fontWeight: 600, color: neutralColor }}>Belum ada perbandingan</span>
                                  ) : (
                                    <>
                                      <div style={{
                                        width: 22, height: 22, borderRadius: 6,
                                        background: arrowBg,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 14, fontWeight: 900, color: arrowColor, lineHeight: 1,
                                      }}>
                                        {arrowIcon}
                                      </div>
                                      <span style={{ fontSize: 11, fontWeight: 600, color: arrowColor }}>
                                        {m.isImproving ? 'Kondisi membaik' : 'Kondisi memburuk'}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Riwayat Kontrol Baseline */}
                        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 18, fontSize: 13, fontWeight: 700, color: '#2B2D42', marginBottom: 14 }}>Riwayat Kontrol Baseline</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                          {progressHistory.map((h, idx) => {
                            const date = new Date(h.recorded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                            const nakesName = h.recorded_by_nakes_name || 'Kader/Sistem'
                            const hs = Math.max(0, 100 - (h.cvd_risk_10yr_pct ?? 0))
                            const color = getHealthColor(hs)

                            return (
                              <div key={h.id || idx} style={{ display: 'flex', gap: 13 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                  <div style={{ width: 11, height: 11, borderRadius: '50%', background: color, border: '2.5px solid #fff', boxShadow: `0 0 0 1.5px ${color}` }}></div>
                                  {idx < progressHistory.length - 1 && <div style={{ width: 2, flex: 1, background: '#EEF2F7', margin: '3px 0' }}></div>}
                                </div>
                                <div style={{ flex: 1, paddingBottom: 16, borderBottom: idx < progressHistory.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <span style={{ fontSize: 11, color: '#8A93A1', fontWeight: 600 }}>{date}</span>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: color, padding: '2px 8px', borderRadius: 6 }}>Skor: {hs}</span>
                                  </div>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: '#2B2D42', marginBottom: 6 }}>Dicatat oleh: {nakesName}</div>

                                  {/* Compact parameters grid */}
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 12px', background: '#F8FAFC', padding: 10, borderRadius: 8, border: '1px solid #ECEEF3', marginBottom: 8 }}>
                                    <div>
                                      <span style={{ display: 'block', fontSize: 9, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Tensi</span>
                                      <strong style={{ fontSize: 11.5, color: '#334155' }}>{h.systolic_bp_mmhg}/{h.diastolic_bp_mmhg} <span style={{ fontSize: 9, fontWeight: 500, color: '#64748B' }}>({h.hypertension_status})</span></strong>
                                    </div>
                                    <div>
                                      <span style={{ display: 'block', fontSize: 9, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Gula Puasa / HbA1c</span>
                                      <strong style={{ fontSize: 11.5, color: '#334155' }}>{h.fasting_glucose_mgdl} mg/dL <span style={{ fontSize: 9, fontWeight: 500, color: '#64748B' }}>({h.hba1c_pct}%)</span></strong>
                                    </div>
                                    <div>
                                      <span style={{ display: 'block', fontSize: 9, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>BMI / LP</span>
                                      <strong style={{ fontSize: 11.5, color: '#334155' }}>{h.bmi} <span style={{ fontSize: 9, fontWeight: 500, color: '#64748B' }}>({h.bmi_category})</span></strong>
                                    </div>
                                    <div>
                                      <span style={{ display: 'block', fontSize: 9, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>eGFR / UACR</span>
                                      <strong style={{ fontSize: 11.5, color: '#334155' }}>{h.egfr} <span style={{ fontSize: 9, fontWeight: 500, color: '#64748B' }}>/ {h.uacr} mg/g</span></strong>
                                    </div>
                                    <div>
                                      <span style={{ display: 'block', fontSize: 9, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Kolesterol Total</span>
                                      <strong style={{ fontSize: 11.5, color: '#334155' }}>{h.total_cholesterol_mgdl} mg/dL</strong>
                                    </div>
                                    <div>
                                      <span style={{ display: 'block', fontSize: 9, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>HDL / LDL</span>
                                      <strong style={{ fontSize: 11.5, color: '#334155' }}>{h.hdl_mgdl} / {h.ldl_mgdl}</strong>
                                    </div>
                                  </div>

                                  {h.notes && (
                                    <div style={{ fontSize: 11.5, color: '#636B78', fontStyle: 'italic', background: '#FFFBEB', padding: '6px 10px', borderRadius: 6, border: '1px solid #FDE68A' }}>
                                      Catatan: {h.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    )
                  })()}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── DETAIL PASIEN (Baseline & Kontrol) — editor baseline asli ── */}
      {(detailLoading || detailPatient !== null) && (
        <PatientDetailDrawer
          detail={detailPatient}
          loading={detailLoading}
          initialTab="baseline"
          onClose={() => { setDetailPatient(null); setDetailLoading(false) }}
        />
      )}
    </div>
  )
}
