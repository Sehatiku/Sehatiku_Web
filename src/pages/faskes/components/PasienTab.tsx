import { useState, useEffect } from 'react'
import { faskesApi } from '../../../lib/api'
import type { FaskesPatientItem, FaskesPatientDetail, Paging } from '../../../lib/types'
import { initials, formatDate } from '../../../lib/utils'
import PatientDetailDrawer from './PatientDetailDrawer'

interface PasienTabProps {
  showToastMsg: (msg: string) => void
}

export default function PasienTab({ showToastMsg }: PasienTabProps) {
  // Patient list state
  const [patientItems, setPatientItems] = useState<FaskesPatientItem[]>([])
  const [patientLoading, setPatientLoading] = useState(false)
  const [patientError, setPatientError] = useState<string | null>(null)
  const [patientPage, setPatientPage] = useState(1)
  const [patientPaging, setPatientPaging] = useState<Paging | null>(null)
  const [patientRefreshKey, setPatientRefreshKey] = useState(0)

  // Detail Drawer state
  const [selectedPatient, setSelectedPatient] = useState<FaskesPatientDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const handleSelectPatient = async (id: string) => {
    setSelectedPatient(null)
    setDetailLoading(true)
    try {
      const detail = await faskesApi.getPatientDetail(id)
      setSelectedPatient(detail)
    } catch {
      showToastMsg('⚠️ Gagal memuat detail pasien. Coba lagi.')
    } finally {
      setDetailLoading(false)
    }
  }

  useEffect(() => {
    setPatientLoading(true)
    setPatientError(null)
    faskesApi.getPatients(patientPage)
      .then(res => {
        setPatientItems(res.data)
        setPatientPaging(res.paging)
        setPatientLoading(false)
      })
      .catch(() => {
        setPatientError('Gagal memuat daftar pasien.')
        setPatientLoading(false)
        showToastMsg('⚠️ Gagal memuat daftar pasien. Silakan coba lagi.')
      })
  }, [patientPage, patientRefreshKey])

  return (
    <div>
      <div className="anim-fadein">
        {/* Header banner */}
        <div style={{ background: 'linear-gradient(130deg,#1A2066 0%,#262F8A 100%)', borderRadius: 14, padding: '20px 24px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 20px rgba(26,32,102,0.18)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ width: 46, height: 46, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, marginBottom: 3 }}>Daftar Pasien Terdaftar</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Semua pasien Prolanis yang terdaftar di faskes ini — aktif maupun nonaktif.</div>
        </div>
        <div style={{ background: 'rgba(30,200,165,0.2)', border: '1px solid rgba(30,200,165,0.35)', borderRadius: 10, padding: '10px 18px', textAlign: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}>
          <div style={{ color: '#1EC8A5', fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{patientPaging?.total_item ?? patientItems.length}</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: 600, marginTop: 2 }}>Total Pasien</div>
        </div>
      </div>

      {/* Patient Table */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #DCDFE8', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#2B2D42' }}>Semua Pasien</div>
            <div style={{ fontSize: 11, color: '#8A93A1', marginTop: 2 }}>
              {patientLoading ? 'Memuat...' : `${patientItems.filter(p => p.status === 'active').length} aktif · ${patientItems.filter(p => p.status === 'inactive').length} nonaktif`}
            </div>
          </div>
          <button
            onClick={() => setPatientRefreshKey(k => k + 1)}
            disabled={patientLoading}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F4F5F7', border: '1px solid #DCDFE8', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: '#636B78', cursor: patientLoading ? 'not-allowed' : 'pointer' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
            Refresh
          </button>
        </div>

        {/* Loading */}
        {patientLoading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#8A93A1', fontSize: 13 }}>Memuat daftar pasien...</div>
        )}
        {!patientLoading && patientError && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 12 }}>{patientError}</div>
            <button onClick={() => setPatientRefreshKey(k => k + 1)} style={{ background: '#EEEFFE', color: '#5B6BF0', border: '1px solid rgba(91,107,240,0.18)', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Coba Lagi</button>
          </div>
        )}
        {!patientLoading && !patientError && patientItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#8A93A1', fontSize: 13 }}>Belum ada pasien terdaftar.</div>
        )}

        {/* Table */}
        {!patientLoading && patientItems.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F7F8FA', borderBottom: '1px solid #DCDFE8' }}>
                  {['Nama Pasien', 'NIK', 'Usia / JK', 'Status Pasien', 'Penyakit', 'Skor Kesehatan', 'Status Risiko', 'Pendamping', 'Terdaftar'].map(h => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#636B78', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patientItems.map((p, idx) => {
                  const isActive = p.status === 'active'
                  const diseaseLabel: Record<string, string> = {
                    diabetes_t2: 'Diabetes',
                    hypertension: 'Hipertensi',
                    both: 'DM + HT',
                  }
                  const diseaseColor: Record<string, { bg: string; color: string }> = {
                    diabetes_t2: { bg: '#EEEFFE', color: '#5B6BF0' },
                    hypertension: { bg: 'rgba(79,195,247,0.12)', color: '#0277BD' },
                    both: { bg: 'rgba(245,158,11,0.1)', color: '#D97706' },
                  }
                  const dc = diseaseColor[p.disease_type] ?? diseaseColor.diabetes_t2

                  // Health Score color helper
                  const getScoreStyle = (score: number) => {
                    if (score >= 70) return { bg: '#E6F4EA', color: '#137333' }
                    if (score >= 40) return { bg: '#FEF7E0', color: '#B06000' }
                    return { bg: '#FCE8E6', color: '#C5221F' }
                  }

                  // Risk Status color helper
                  const getRiskStyle = (status: string) => {
                    const s = status.toLowerCase()
                    if (s === 'bahaya' || s === 'kritis' || s === 'high') {
                      return { bg: '#FCE8E6', color: '#C5221F', text: 'Bahaya', dot: '#C5221F' }
                    }
                    if (s === 'waswas' || s === 'sedang' || s === 'medium') {
                      return { bg: '#FEF7E0', color: '#B06000', text: 'Waswas', dot: '#B06000' }
                    }
                    return { bg: '#E6F4EA', color: '#137333', text: 'Aman', dot: '#137333' }
                  }

                  const scoreStyle = p.health_score !== null && p.health_score !== undefined ? getScoreStyle(p.health_score) : null
                  const riskStyle = p.risk_status ? getRiskStyle(p.risk_status) : null

                  return (
                    <tr key={p.patient_id} onClick={() => handleSelectPatient(p.patient_id)} style={{ borderBottom: '1px solid #F4F5F7', background: idx % 2 === 0 ? '#fff' : '#FAFBFC', opacity: isActive ? 1 : 0.55, cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget.style.background = '#F0F1FE')} onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#FAFBFC')}>
                      <td style={{ padding: '13px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: dc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: dc.color, flexShrink: 0 }}>{initials(p.full_name)}</div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#2B2D42' }}>{p.full_name}</div>
                            <div style={{ fontSize: 11, color: '#8A93A1' }}>{p.phone_number}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '13px 14px', color: '#636B78', fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.5px' }}>{p.nik}</td>
                      <td style={{ padding: '13px 14px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, color: '#2B2D42' }}>{p.age} th</div>
                        <div style={{ fontSize: 11, color: '#8A93A1' }}>{p.sex === 'male' ? '♂ Laki-laki' : '♀ Perempuan'}</div>
                      </td>
                      <td style={{ padding: '13px 14px' }}>
                        <span style={{
                          background: isActive ? 'rgba(16,185,129,0.1)' : '#F7F8FA',
                          color: isActive ? '#10B981' : '#8A93A1',
                          border: `1px solid ${isActive ? 'rgba(16,185,129,0.2)' : '#DCDFE8'}`,
                          fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                        }}>{isActive ? 'Aktif' : 'Nonaktif'}</span>
                      </td>
                      <td style={{ padding: '13px 14px' }}>
                        <span style={{ ...dc, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{diseaseLabel[p.disease_type]}</span>
                      </td>
                      <td style={{ padding: '13px 14px' }}>
                        {scoreStyle ? (
                          <span style={{
                            background: scoreStyle.bg,
                            color: scoreStyle.color,
                            fontSize: 12,
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontFamily: 'monospace'
                          }}>
                            {p.health_score}
                          </span>
                        ) : (
                          <span style={{ color: '#8A93A1' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '13px 14px' }}>
                        {riskStyle ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            background: riskStyle.bg,
                            color: riskStyle.color,
                            borderRadius: 20,
                            padding: '3px 10px',
                            fontSize: 10.5,
                            fontWeight: 700,
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: riskStyle.dot }} />
                            {riskStyle.text}
                          </span>
                        ) : (
                          <span style={{ color: '#8A93A1' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '13px 14px' }}>
                        <div style={{ fontWeight: 600, color: '#2B2D42', fontSize: 12 }}>{p.companion_name}</div>
                        <div style={{ fontSize: 11, color: '#8A93A1' }}>{p.companion_phone}</div>
                      </td>
                      <td style={{ padding: '13px 14px', color: '#8A93A1', fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(p.enrolled_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!patientLoading && patientPaging && patientPaging.total_page > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid #F4F5F7' }}>
            <div style={{ fontSize: 12, color: '#8A93A1' }}>Halaman {patientPaging.page} dari {patientPaging.total_page} · {patientPaging.total_item} total pasien</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setPatientPage(p => Math.max(1, p - 1))}
                disabled={patientPage <= 1}
                style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #DCDFE8', background: patientPage <= 1 ? '#F4F5F7' : '#fff', color: patientPage <= 1 ? '#CBD5E1' : '#2B2D42', fontSize: 12, fontWeight: 600, cursor: patientPage <= 1 ? 'not-allowed' : 'pointer' }}
              >← Prev</button>
              <button
                onClick={() => setPatientPage(p => Math.min(patientPaging.total_page, p + 1))}
                disabled={patientPage >= patientPaging.total_page}
                style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #DCDFE8', background: patientPage >= patientPaging.total_page ? '#F4F5F7' : '#fff', color: patientPage >= patientPaging.total_page ? '#CBD5E1' : '#2B2D42', fontSize: 12, fontWeight: 600, cursor: patientPage >= patientPaging.total_page ? 'not-allowed' : 'pointer' }}
              >Next →</button>
            </div>
          </div>
        )}
      </div>

      </div>

      {(detailLoading || selectedPatient !== null) && (
        <PatientDetailDrawer
          detail={selectedPatient}
          loading={detailLoading}
          onClose={() => { setSelectedPatient(null); setDetailLoading(false) }}
        />
      )}
    </div>
  )
}
