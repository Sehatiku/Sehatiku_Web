import { useState, useEffect } from 'react'
import { faskesApi } from '../../../lib/api'
import type { FaskesPatientItem } from '../../../lib/types'
import { initials } from '../../../lib/utils'

interface Patient {
  id: number
  name: string
  disease: string
  healthScore: number
  status: string
  cause: string
  age: number
}

interface OperasionalTabProps {
  setActiveTab: (tab: 'pendaftaran' | 'operasional' | 'eskalasi' | 'dokter' | 'pasien') => void
  showToastMsg: (msg: string) => void
}

export default function OperasionalTab({
  setActiveTab,
  showToastMsg,
}: OperasionalTabProps) {
  // Phase Operasional States
  const [patients] = useState<Patient[]>([])

  // Patient summary (for Ringkasan Pasien card)
  const [ptSummary, setPtSummary] = useState<FaskesPatientItem[]>([])
  const [ptSummaryLoading, setPtSummaryLoading] = useState(true)

  useEffect(() => {
    faskesApi.getPatients(1, 100)
      .then(res => { setPtSummary(res.data); setPtSummaryLoading(false) })
      .catch(() => setPtSummaryLoading(false))
  }, [])

  // Modals States
  const [showBaselineModal, setShowBaselineModal] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [progressPatientId, setProgressPatientId] = useState<number | null>(null)

  // Helper functions
  const getHealthColor = (score: number) => {
    if (score >= 70) return '#10B981' // Sehat (Green)
    if (score >= 40) return '#F59E0B' // Waswas (Yellow)
    return '#EF4444' // Parah (Red)
  }

  const getHealthShadow = (score: number) => {
    if (score >= 70) return 'rgba(16,185,129,0.2)'
    if (score >= 40) return 'rgba(245,158,11,0.2)'
    return 'rgba(239,68,68,0.2)'
  }

  const getHealthTier = (score: number) => {
    if (score >= 70) return 'Tinggi (Sehat)'
    if (score >= 40) return 'Sedang (Waswas)'
    return 'Rendah (Parah)'
  }

  const getStatusStyle = (st: string) => {
    if (st === 'Parah') return { color: '#EF4444', bg: 'rgba(239,68,68,0.08)' }
    if (st === 'Waswas') return { color: '#D97706', bg: 'rgba(245,158,11,0.1)' }
    return { color: '#10B981', bg: 'rgba(16,185,129,0.08)' } // Sehat
  }

  const selectedPatient = patients.find(p => p.id === selectedPatientId)
  const selectedPatientName = selectedPatient ? selectedPatient.name : ''
  const progressPatient = patients.find(p => p.id === progressPatientId)

  return (
    <div className="anim-fadein">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #DCDFE8', borderTop: '3px solid #5B6BF0' }}>
          <div style={{ fontSize: 10, color: '#8A93A1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Total Pasien</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#5B6BF0', lineHeight: 1, marginBottom: 3 }}>{patients.length}</div>
          <div style={{ fontSize: 11, color: '#8A93A1' }}>Terdaftar Prolanis</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #DCDFE8', borderTop: '3px solid #EF4444' }}>
          <div style={{ fontSize: 10, color: '#8A93A1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Risiko Bahaya</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#8A93A1', lineHeight: 1, marginBottom: 3 }}>—</div>
          <div style={{ fontSize: 11, color: '#8A93A1' }}>Endpoint belum tersedia</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #DCDFE8', borderTop: '3px solid #F59E0B' }}>
          <div style={{ fontSize: 10, color: '#8A93A1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Status Waswas</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#8A93A1', lineHeight: 1, marginBottom: 3 }}>—</div>
          <div style={{ fontSize: 11, color: '#8A93A1' }}>Endpoint belum tersedia</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #DCDFE8', borderTop: '3px solid #10B981' }}>
          <div style={{ fontSize: 10, color: '#8A93A1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Status Aman</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#8A93A1', lineHeight: 1, marginBottom: 3 }}>—</div>
          <div style={{ fontSize: 11, color: '#8A93A1' }}>Endpoint belum tersedia</div>
        </div>
      </div>

      {/* Priority Queue Table */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #DCDFE8', marginBottom: 18, overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#2B2D42' }}>Antrian Prioritas Pasien</div>
            <div style={{ fontSize: 11, color: '#8A93A1', marginTop: 2 }}>Diurutkan otomatis berdasarkan Health Score terendah — tertinggi</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#F4F5F7', border: '1px solid #DCDFE8', borderRadius: 8, padding: '7px 13px' }}>
            <div className="anim-blink" style={{ width: 7, height: 7, borderRadius: '50%', background: '#5B6BF0' }}></div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#5B6BF0' }}>AI Auto-Sorted</span>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
            <thead>
              <tr style={{ background: '#F7F8FA' }}>
                <th style={{ padding: '10px 8px 10px 22px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#8A93A1', textTransform: 'uppercase', letterSpacing: '0.5px', width: 54 }}>Rank</th>
                <th style={{ padding: '10px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#8A93A1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pasien</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#8A93A1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Penyakit</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#8A93A1', textTransform: 'uppercase', letterSpacing: '0.5px', width: 150 }}>Health Score</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#8A93A1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#8A93A1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Faktor Penyebab Utama</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#8A93A1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '40px 22px', textAlign: 'center', color: '#8A93A1', fontSize: 13 }}>
                    Belum ada data pasien. Endpoint daftar pasien faskes belum tersedia di backend.
                  </td>
                </tr>
              )}
              {patients.map((p, i) => {
                const style = getStatusStyle(p.status)
                const color = getHealthColor(p.healthScore)
                const shadow = getHealthShadow(p.healthScore)
                const tier = getHealthTier(p.healthScore)
                return (
                  <tr key={p.id} className="qrow" style={{ borderTop: '1px solid #F4F5F7', transition: 'background 0.12s' }}>
                    <td style={{ padding: '13px 8px 13px 22px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 8, background: i < 2 ? 'rgba(239,68,68,0.12)' : '#F4F5F7', color: i < 2 ? '#EF4444' : '#8A93A1', fontSize: 12, fontWeight: 800 }}>{i + 1}</div>
                    </td>
                    <td style={{ padding: '13px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: p.healthScore < 40 ? 'rgba(123,97,255,0.1)' : (p.healthScore < 70 ? 'rgba(79,195,247,0.12)' : 'rgba(30,200,165,0.1)'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: color, flexShrink: 0 }}>
                          {initials(p.name)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#2B2D42', whiteSpace: 'nowrap' }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: '#8A93A1' }}>{p.age} tahun</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{
                        background: p.disease === 'Diabetes' ? 'rgba(91,107,240,0.08)' : 'rgba(79,195,247,0.12)',
                        color: p.disease === 'Diabetes' ? '#5B6BF0' : '#0277BD',
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap'
                      }}>
                        {p.disease}
                      </span>
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 12, background: color, boxShadow: `0 3px 10px ${shadow}`, flexShrink: 0 }}>
                          <span style={{ color: '#fff', fontSize: 15, fontWeight: 800 }}>{p.healthScore}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 48 }}>
                          <div style={{ height: 6, borderRadius: 4, background: '#EEF2F7', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${p.healthScore}%`, borderRadius: 4, background: color }}></div>
                          </div>
                          <div style={{ fontSize: 9, color: '#8A93A1', fontWeight: 600, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{tier}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '13px 14px', textAlign: 'center' }}>
                      <span style={{ background: style.bg, color: style.color, fontSize: 11, fontWeight: 700, padding: '4px 13px', borderRadius: 20, whiteSpace: 'nowrap' }}>{p.status}</span>
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }}></div>
                        <span style={{ fontSize: 12, color: '#334155' }}>{p.cause}</span>
                      </div>
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                        <button
                          onClick={() => { setProgressPatientId(p.id); setShowProgressModal(true) }}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#EEEFFE', border: '1px solid rgba(91,107,240,0.18)', borderRadius: 8, padding: '6px 11px', fontSize: 11, fontWeight: 700, color: '#5B6BF0', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s', borderStyle: 'solid' }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5B6BF0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                          Progress
                        </button>
                        <button
                          onClick={() => { setSelectedPatientId(p.id); setShowBaselineModal(true) }}
                          style={{ background: '#F4F5F7', border: '1px solid #DCDFE8', borderRadius: 8, padding: '6px 11px', fontSize: 11, fontWeight: 600, color: '#636B78', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s', borderStyle: 'solid' }}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 22px', borderTop: '1px solid #F4F5F7', background: '#FCFDFE' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8A93A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
          <span style={{ fontSize: 11, color: '#8A93A1', lineHeight: 1.4 }}>Health Score bersifat <strong style={{ color: '#636B78', fontWeight: 700 }}>indikatif — bukan diagnosis medis</strong>. Keputusan klinis tetap pada penilaian tenaga kesehatan.</span>
        </div>
      </div>

      {/* BPJS Integration & Baseline Periodik */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Ringkasan Pasien */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #DCDFE8', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2B2D42' }}>Ringkasan Pasien</div>
              <div style={{ fontSize: 11, color: '#8A93A1', marginTop: 2 }}>Distribusi kondisi pasien Prolanis</div>
            </div>
            <button
              onClick={() => setActiveTab('pasien')}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#EEEFFE', color: '#5B6BF0', border: '1px solid rgba(91,107,240,0.18)', borderRadius: 9, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              Lihat Semua →
            </button>
          </div>

          {/* Stat badges */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
            <div style={{ flex: 1, background: '#EEEFFE', borderRadius: 10, padding: '11px 14px', border: '1px solid rgba(91,107,240,0.12)', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#5B6BF0', lineHeight: 1 }}>{ptSummaryLoading ? '…' : ptSummary.length}</div>
              <div style={{ fontSize: 10, color: '#636B78', fontWeight: 600, marginTop: 3 }}>Total Pasien</div>
            </div>
            <div style={{ flex: 1, background: '#F0FDF8', borderRadius: 10, padding: '11px 14px', border: '1px solid rgba(16,185,129,0.12)', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#10B981', lineHeight: 1 }}>{ptSummaryLoading ? '…' : ptSummary.filter(p => p.status === 'active').length}</div>
              <div style={{ fontSize: 10, color: '#636B78', fontWeight: 600, marginTop: 3 }}>Aktif</div>
            </div>
            <div style={{ flex: 1, background: '#F7F8FA', borderRadius: 10, padding: '11px 14px', border: '1px solid #EEF2F7', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#8A93A1', lineHeight: 1 }}>{ptSummaryLoading ? '…' : ptSummary.filter(p => p.status !== 'active').length}</div>
              <div style={{ fontSize: 10, color: '#636B78', fontWeight: 600, marginTop: 3 }}>Nonaktif</div>
            </div>
          </div>

          {/* Disease distribution */}
          <div style={{ fontSize: 10, fontWeight: 700, color: '#8A93A1', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>Distribusi Penyakit</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {([
              { key: 'diabetes_t2', label: 'Diabetes T2', color: '#5B6BF0', bg: '#EEEFFE' },
              { key: 'hypertension', label: 'Hipertensi', color: '#0277BD', bg: 'rgba(79,195,247,0.12)' },
              { key: 'both', label: 'DM + Hipertensi', color: '#7C3AED', bg: '#F5F3FF' },
            ] as const).map(d => {
              const count = ptSummary.filter(p => p.disease_type === d.key).length
              const total = ptSummary.length || 1
              const pct = ptSummaryLoading ? 0 : Math.round((count / total) * 100)
              return (
                <div key={d.key}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ background: d.bg, color: d.color, fontSize: 10, fontWeight: 700, padding: '2px 9px', borderRadius: 8 }}>{d.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#2B2D42' }}>
                      {ptSummaryLoading ? '—' : count}
                      <span style={{ fontSize: 10, fontWeight: 500, color: '#8A93A1', marginLeft: 4 }}>({pct}%)</span>
                    </span>
                  </div>
                  <div style={{ height: 5, borderRadius: 4, background: '#F4F5F7', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: 4, background: d.color, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Baseline Klinis Periodik */}
        <div style={{
          background: '#fff', borderRadius: 14, padding: 22,
          boxShadow: '0 1px 4px rgba(15,36,68,0.06)',
          border: '1px solid #DCDFE8',
        }}>
          {/* Card Header — same style as Ringkasan Pasien */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2B2D42' }}>Baseline Klinis Periodik</div>
              <div style={{ fontSize: 11, color: '#8A93A1', marginTop: 2 }}>Klik "Update Baseline" pada tabel pasien di atas</div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#EEEFFE', border: '1px solid rgba(91,107,240,0.18)',
              borderRadius: 9, padding: '8px 14px',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5B6BF0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#5B6BF0' }}>7 Parameter</span>
            </div>
          </div>

          {/* Metric grid — palette colors: indigo / purple / teal */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>

            {/* HbA1c — INDIGO */}
            <div style={{ background: '#EEF0FF', borderRadius: 10, padding: '11px 13px', border: '1px solid rgba(91,107,240,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 9.5, color: '#9AA0B9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>HbA1c</span>
                <span style={{ fontSize: 8.5, fontWeight: 800, color: '#5B6BF0', background: 'rgba(91,107,240,0.12)', borderRadius: 5, padding: '1px 6px' }}>Kritis</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#5B6BF0', lineHeight: 1 }}>10.2%</div>
              <div style={{ fontSize: 9, color: '#5B6BF0', marginTop: 3, fontWeight: 600, opacity: 0.7 }}>&gt;9% = bahaya</div>
            </div>

            {/* LDL Kolesterol — PURPLE */}
            <div style={{ background: '#F5F3FF', borderRadius: 10, padding: '11px 13px', border: '1px solid rgba(139,92,246,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 9.5, color: '#9AA0B9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>LDL Kolesterol</span>
                <span style={{ fontSize: 8.5, fontWeight: 800, color: '#8B5CF6', background: 'rgba(139,92,246,0.12)', borderRadius: 5, padding: '1px 6px' }}>Tinggi</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#8B5CF6', lineHeight: 1 }}>145 mg/dL</div>
              <div style={{ fontSize: 9, color: '#8B5CF6', marginTop: 3, fontWeight: 600, opacity: 0.7 }}>&gt;100 = waspada</div>
            </div>

            {/* eGFR — TEAL */}
            <div style={{ background: 'rgba(30,200,165,0.07)', borderRadius: 10, padding: '11px 13px', border: '1px solid rgba(30,200,165,0.22)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 9.5, color: '#9AA0B9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>eGFR</span>
                <span style={{ fontSize: 8.5, fontWeight: 800, color: '#1EC8A5', background: 'rgba(30,200,165,0.12)', borderRadius: 5, padding: '1px 6px' }}>Normal</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1EC8A5', lineHeight: 1 }}>72 mL/min</div>
              <div style={{ fontSize: 9, color: '#1EC8A5', marginTop: 3, fontWeight: 600, opacity: 0.7 }}>Target ≥60</div>
            </div>

            {/* UACR — INDIGO */}
            <div style={{ background: '#EEF0FF', borderRadius: 10, padding: '11px 13px', border: '1px solid rgba(91,107,240,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 9.5, color: '#9AA0B9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>UACR</span>
                <span style={{ fontSize: 8.5, fontWeight: 800, color: '#5B6BF0', background: 'rgba(91,107,240,0.12)', borderRadius: 5, padding: '1px 6px' }}>Mikro</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#5B6BF0', lineHeight: 1 }}>42 mg/g</div>
              <div style={{ fontSize: 9, color: '#5B6BF0', marginTop: 3, fontWeight: 600, opacity: 0.7 }}>30–300 pantau</div>
            </div>

            {/* BMI — PURPLE */}
            <div style={{ background: '#F5F3FF', borderRadius: 10, padding: '11px 13px', border: '1px solid rgba(139,92,246,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 9.5, color: '#9AA0B9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>BMI</span>
                <span style={{ fontSize: 8.5, fontWeight: 800, color: '#8B5CF6', background: 'rgba(139,92,246,0.12)', borderRadius: 5, padding: '1px 6px' }}>Overweight</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#8B5CF6', lineHeight: 1 }}>29.3 kg/m²</div>
              <div style={{ fontSize: 9, color: '#8B5CF6', marginTop: 3, fontWeight: 600, opacity: 0.7 }}>Target 18.5–24.9</div>
            </div>

            {/* Tensi Baseline — TEAL */}
            <div style={{ background: 'rgba(30,200,165,0.07)', borderRadius: 10, padding: '11px 13px', border: '1px solid rgba(30,200,165,0.22)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 9.5, color: '#9AA0B9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Tensi Baseline</span>
                <span style={{ fontSize: 8.5, fontWeight: 800, color: '#1EC8A5', background: 'rgba(30,200,165,0.12)', borderRadius: 5, padding: '1px 6px' }}>HTN I</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1EC8A5', lineHeight: 1 }}>148/92</div>
              <div style={{ fontSize: 9, color: '#1EC8A5', marginTop: 3, fontWeight: 600, opacity: 0.7 }}>Grade 1 hipertensi</div>
            </div>
          </div>

          {/* Lingkar Pinggang — full width, PURPLE */}
          <div style={{ marginTop: 8, background: 'linear-gradient(135deg, #F5F3FF 0%, #EEF0FF 100%)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 9.5, color: '#9AA0B9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 3 }}>Lingkar Pinggang</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#8B5CF6', lineHeight: 1 }}>94 cm</div>
            </div>
            <span style={{ fontSize: 8.5, fontWeight: 800, color: '#8B5CF6', background: 'rgba(139,92,246,0.1)', borderRadius: 7, padding: '3px 9px', border: '1px solid rgba(139,92,246,0.2)' }}>
              Risiko ≥90cm (L) / ≥80cm (P)
            </span>
          </div>
        </div>
      </div>

      {/* ── BASELINE MODAL ── */}
      {showBaselineModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(43,45,66,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease-out', backdropFilter: 'blur(3px)',
          padding: 20,
        }}>
          <div style={{
            width: 560, maxWidth: '95vw', maxHeight: '92vh',
            background: '#fff', borderRadius: 18,
            boxShadow: '0 24px 64px rgba(15,36,68,0.28)',
            border: '1px solid #E2E5F1',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            animation: 'scaleIn 0.15s ease-out',
          }}>

            {/* Modal Header — gradient matching the card */}
            <div style={{
              background: 'linear-gradient(135deg, #5B6BF0 0%, #8B5CF6 100%)',
              padding: '20px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 11,
                  background: 'rgba(255,255,255,0.18)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.2px' }}>Update Baseline Klinis</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                    Masukkan nilai terbaru untuk 7 parameter klinis
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowBaselineModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 9, width: 32, height: 32, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#ffffff', fontSize: 16, flexShrink: 0,
                }}
              >✕</button>
            </div>

            {/* Form Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px 0' }}>

              {/* Field grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                {[
                  { label: 'HbA1c', unit: '%', placeholder: 'mis. 7.5', dot: '#5B6BF0', hint: 'Normal <7%' },
                  { label: 'LDL Kolesterol', unit: 'mg/dL', placeholder: 'mis. 130', dot: '#8B5CF6', hint: 'Target <100' },
                  { label: 'eGFR', unit: 'mL/min', placeholder: 'mis. 75', dot: '#1EC8A5', hint: 'Normal ≥60' },
                  { label: 'UACR', unit: 'mg/g', placeholder: 'mis. 30', dot: '#5B6BF0', hint: 'Normal <30' },
                  { label: 'BMI', unit: 'kg/m²', placeholder: 'mis. 25.0', dot: '#8B5CF6', hint: 'Normal 18.5–24.9' },
                  { label: 'Lingkar Pinggang', unit: 'cm', placeholder: 'mis. 90', dot: '#8B5CF6', hint: 'Risiko ≥90 (L) / ≥80 (P)' },
                ].map(f => (
                  <div key={f.label}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: f.dot, flexShrink: 0 }} />
                      <label style={{ fontSize: 10, fontWeight: 700, color: '#636B78', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {f.label} <span style={{ fontWeight: 500, color: '#B0B8C8', textTransform: 'none', letterSpacing: 0 }}>({f.unit})</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder={f.placeholder}
                      style={{
                        width: '100%', padding: '10px 13px',
                        border: '1.5px solid #E2E5F1', borderRadius: 9,
                        fontSize: 13, color: '#2B2D42', background: '#F7F8FF',
                        outline: 'none', boxSizing: 'border-box',
                        transition: 'border-color 0.15s',
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = '#5B6BF0'}
                      onBlur={e => e.currentTarget.style.borderColor = '#E2E5F1'}
                    />
                    <div style={{ fontSize: 9.5, color: '#B0B8C8', marginTop: 4, fontWeight: 500 }}>{f.hint}</div>
                  </div>
                ))}

                {/* Tensi Baseline — full width */}
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
                    <label style={{ fontSize: 10, fontWeight: 700, color: '#636B78', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Tensi Baseline <span style={{ fontWeight: 500, color: '#B0B8C8', textTransform: 'none', letterSpacing: 0 }}>(mmHg)</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    placeholder="mis. 130/85"
                    style={{
                      width: '100%', padding: '10px 13px',
                      border: '1.5px solid #E2E5F1', borderRadius: 9,
                      fontSize: 13, color: '#2B2D42', background: '#F7F8FF',
                      outline: 'none', boxSizing: 'border-box',
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = '#5B6BF0'}
                    onBlur={e => e.currentTarget.style.borderColor = '#E2E5F1'}
                  />
                  <div style={{ fontSize: 9.5, color: '#B0B8C8', marginTop: 4, fontWeight: 500 }}>Normal &lt;120/80 · HTN Grade 1: 130–139/80–89</div>
                </div>
              </div>

              {/* Info note */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 9,
                background: '#EEF0FF', borderRadius: 10, padding: '11px 14px',
                marginBottom: 20, border: '1px solid rgba(91,107,240,0.18)',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B6BF0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span style={{ fontSize: 11.5, color: '#5B6BF0', fontWeight: 600, lineHeight: 1.5 }}>
                  Data baseline digunakan sebagai acuan pemantauan klinis periodik. Nilai kosong tidak akan disimpan.
                </span>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #F0F1FE',
              display: 'flex', gap: 10, justifyContent: 'flex-end',
              background: '#FAFAFF', flexShrink: 0,
            }}>
              <button
                onClick={() => setShowBaselineModal(false)}
                style={{
                  padding: '10px 22px', border: '1.5px solid #DCDFE8',
                  borderRadius: 10, background: '#fff', color: '#636B78',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}
              >Batal</button>
              <button
                onClick={() => {
                  setShowBaselineModal(false)
                  showToastMsg('✅ Data baseline klinis berhasil diperbarui!')
                }}
                style={{
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, #5B6BF0 0%, #8B5CF6 100%)',
                  color: '#fff', border: 'none', borderRadius: 10,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(91,107,240,0.35)',
                  display: 'flex', alignItems: 'center', gap: 7,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Simpan Baseline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PROGRESS MODAL ── */}
      {showProgressModal && progressPatient && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(43,45,66,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out', backdropFilter: 'blur(2px)', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 18, width: 620, maxWidth: '95vw', boxShadow: '0 20px 60px rgba(15,36,68,0.25)', border: '1px solid #DCDFE8', maxHeight: '92vh', overflowY: 'auto' }}>

            {/* Modal Header */}
            <div style={{ padding: '22px 26px', borderBottom: '1px solid #F4F5F7', display: 'flex', alignItems: 'center', gap: 14 }}>
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
                  <span style={{
                    background: getStatusStyle(progressPatient.status).bg,
                    color: getStatusStyle(progressPatient.status).color,
                    fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20
                  }}>
                    {progressPatient.status}
                  </span>
                </div>
              </div>

              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 58, height: 58, borderRadius: 15, background: getHealthColor(progressPatient.healthScore), boxShadow: '0 4px 14px rgba(0,0,0,0.12)', flexShrink: 0 }}>
                <span style={{ color: '#fff', fontSize: 19, fontWeight: 800, lineHeight: 1 }}>{progressPatient.healthScore}</span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 }}>Sehat</span>
              </div>

              <button onClick={() => setShowProgressModal(false)} style={{ background: '#F4F5F7', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#636B78', fontSize: 16, flexShrink: 0, marginLeft: 8 }}>✕</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '22px 26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#2B2D42' }}>Tren Health Score</div>
                  <div style={{ fontSize: 11, color: '#8A93A1', marginTop: 1 }}>6 bulan terakhir</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#F7F8FA', border: '1px solid #EEF2F7', borderRadius: 9, padding: '6px 12px' }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: progressPatient.status === 'Sehat' ? '#1EC8A5' : '#EF4444' }}>
                    {progressPatient.status === 'Sehat' ? '+24' : '-18'}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: progressPatient.status === 'Sehat' ? '#1EC8A5' : '#EF4444' }}>
                    {progressPatient.status === 'Sehat' ? 'Membaik' : 'Memburuk'}
                  </span>
                </div>
              </div>

              {/* Monthly progress bars */}
              <div style={{ background: '#FAFBFE', border: '1px solid #EEF2F7', borderRadius: 13, padding: '18px 16px 12px', marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, height: 130 }}>
                  {(progressPatient.status === 'Sehat'
                    ? [
                      { month: 'Jan', score: 42 },
                      { month: 'Feb', score: 50 },
                      { month: 'Mar', score: 56 },
                      { month: 'Apr', score: 62 },
                      { month: 'Mei', score: 65 },
                      { month: 'Jun', score: progressPatient.healthScore },
                    ]
                    : [
                      { month: 'Jan', score: 42 },
                      { month: 'Feb', score: 38 },
                      { month: 'Mar', score: 30 },
                      { month: 'Apr', score: 22 },
                      { month: 'Mei', score: 15 },
                      { month: 'Jun', score: progressPatient.healthScore },
                    ]
                  ).map((bar, idx) => {
                    const barColor = getHealthColor(bar.score)
                    return (
                      <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', flex: 1, width: '100%' }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: '#636B78', marginBottom: 6 }}>{bar.score}</div>
                          <div style={{ width: '100%', maxWidth: 34, height: `${bar.score}%`, background: barColor, borderRadius: '7px 7px 3px 3px' }}></div>
                        </div>
                        <div style={{ fontSize: 10, color: '#8A93A1', fontWeight: 600, marginTop: 8 }}>{bar.month}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Metrics changes list */}
              <div style={{ fontSize: 13, fontWeight: 700, color: '#2B2D42', marginBottom: 12 }}>Perubahan Indikator Klinis</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
                {[
                  { label: 'HbA1c', value: progressPatient.disease === 'Diabetes' ? '7.4' : '5.8', unit: '%', arrow: '↓', delta: '-1.2', isGood: true },
                  { label: 'Gula Darah / Tensi', value: progressPatient.disease === 'Diabetes' ? '128' : '132/84', unit: progressPatient.disease === 'Diabetes' ? 'mg/dL' : 'mmHg', arrow: '↓', delta: progressPatient.disease === 'Diabetes' ? '-34' : '-18', isGood: true },
                  { label: 'BMI', value: '26.1', unit: 'kg/m²', arrow: '↓', delta: '-1.4', isGood: true },
                  { label: 'eGFR / Natrium', value: progressPatient.disease === 'Diabetes' ? '78' : 'Normal', unit: progressPatient.disease === 'Diabetes' ? 'mL/min' : '', arrow: '↑', delta: progressPatient.disease === 'Diabetes' ? '+4' : '-15%', isGood: true },
                ].map((m, idx) => (
                  <div key={idx} style={{ background: '#fff', border: '1px solid #EEF2F7', borderRadius: 11, padding: '13px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 10, color: '#8A93A1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>{m.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#2B2D42' }}>{m.value} <span style={{ fontSize: 11, fontWeight: 600, color: '#8A93A1' }}>{m.unit}</span></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: m.isGood ? 'rgba(30,200,165,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: 8, padding: '5px 9px' }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: m.isGood ? '#1EC8A5' : '#EF4444' }}>{m.arrow}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: m.isGood ? '#1EC8A5' : '#EF4444' }}>{m.delta}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Riwayat Kunjungan */}
              <div style={{ fontSize: 13, fontWeight: 700, color: '#2B2D42', marginBottom: 14 }}>Riwayat Kunjungan</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { date: '18 Jun 2026', title: 'Kontrol rutin — membaik', note: `Health Score meningkat signifikan sejak pendaftaran. Terapi dilanjutkan.`, color: '#1EC8A5' },
                  { date: '20 Mei 2026', title: 'Update baseline klinis', note: 'Hasil laboratorium menunjukkan perbaikan parameter klinis.', color: '#5B6BF0' },
                  { date: '15 Apr 2026', title: 'Edukasi gizi & aktivitas', note: 'Konsultasi dengan ahli gizi faskes untuk pola makan rendah garam/karbo.', color: '#4FC3F7' },
                ].map((t, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 13 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: 11, height: 11, borderRadius: '50%', background: t.color, border: '2.5px solid #fff', boxShadow: `0 0 0 1.5px ${t.color}` }}></div>
                      <div style={{ width: 2, flex: 1, background: '#EEF2F7', margin: '3px 0' }}></div>
                    </div>
                    <div style={{ paddingBottom: 16 }}>
                      <div style={{ fontSize: 10, color: '#8A93A1', fontWeight: 600, marginBottom: 2 }}>{t.date}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#2B2D42', marginBottom: 2 }}>{t.title}</div>
                      <div style={{ fontSize: 12, color: '#636B78', lineHeight: 1.5 }}>{t.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
