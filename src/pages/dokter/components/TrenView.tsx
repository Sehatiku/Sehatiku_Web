import type { PatientQueueItem, NakesPatientDetailData } from '../../../lib/types'
import { AvatarCircle, StatusPill, DISEASE_LABEL, getSafeRiskColor } from './Common'

interface TrenViewProps {
  patient: PatientQueueItem
  patientDetail: NakesPatientDetailData | null
  loading: boolean
  onClose: () => void
}

/**
 * Panel geser "Tren & Riwayat Klinis" untuk satu pasien.
 * Semua data dari BE (health_score_history + baseline) — tanpa mock.
 */
export default function TrenView({ patient, patientDetail, loading, onClose }: TrenViewProps) {
  // Ekstraksi defensif: BE bisa mengirim null / bentuk tak terduga.
  const scoreHistory = Array.isArray(patientDetail?.health_score_history) ? patientDetail!.health_score_history : []
  const baseline = patientDetail?.baseline ?? null

  const fmtShort = (iso: string | null) => {
    if (!iso) return '—'
    try { return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) } catch { return iso }
  }

  // Tren health score kronologis (lama → baru)
  const chrono = [...scoreHistory].sort((a, b) => (a.scored_at ?? '').localeCompare(b.scored_at ?? ''))
  const recent = chrono.slice(-8)

  const currHs = recent.length ? recent[recent.length - 1].score : patient.risk_score
  const firstHs = recent.length ? recent[0].score : currHs
  const delta = currHs - firstHs
  const calculatedStatus = currHs >= 70 ? 'aman' : currHs >= 40 ? 'waswas' : 'bahaya'
  const calculatedRiskLabel = currHs >= 70 ? 'rendah' : currHs >= 40 ? 'sedang' : 'kritis'
  const hsColor = currHs >= 70 ? '#10B981' : currHs >= 40 ? '#D97706' : '#DC2626'
  const hsBg = currHs >= 70 ? 'rgba(16,185,129,0.06)' : currHs >= 40 ? 'rgba(245,158,11,0.06)' : 'rgba(239,68,68,0.06)'
  const hsBorder = currHs >= 70 ? 'rgba(16,185,129,0.25)' : currHs >= 40 ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)'
  const deltaColor = delta > 0 ? '#059669' : delta < 0 ? '#EF4444' : '#D97706'
  const deltaBg = delta > 0 ? '#ECFDF5' : delta < 0 ? '#FEF2F2' : '#FFFBEB'
  const deltaLabel = delta > 0 ? '↑ membaik' : delta < 0 ? '↓ memburuk' : '→ stabil'
  const deltaTxt = delta > 0 ? `+${delta}` : `${delta}`

  // Parameter klinis dari baseline terbaru
  const metrics = baseline ? [
    { label: 'HbA1c', value: `${baseline.hba1c_pct}`, unit: '%' },
    { label: 'Gula Puasa', value: `${baseline.fasting_glucose_mgdl}`, unit: 'mg/dL' },
    { label: 'Tekanan Darah', value: `${baseline.systolic_bp_mmhg}/${baseline.diastolic_bp_mmhg}`, unit: 'mmHg' },
    { label: 'BMI', value: `${baseline.bmi}`, unit: 'kg/m²' },
    { label: 'eGFR', value: `${baseline.egfr}`, unit: 'mL/min' },
    { label: 'LDL', value: `${baseline.ldl_mgdl}`, unit: 'mg/dL' },
  ] : []

  // Riwayat = titik health score (terbaru dulu)
  const timeline = [...chrono].reverse().slice(0, 6)

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(23,28,58,0.62)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        animation: 'backdropIn 0.18s ease'
      }}
    >
      <div style={{
        width: '100%', maxWidth: 580, maxHeight: '92vh',
        background: '#F6F8FC', borderRadius: 20,
        boxShadow: '0 32px 80px rgba(15,23,42,0.28)',
        border: '1px solid rgba(255,255,255,0.7)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        animation: 'modalIn 0.2s cubic-bezier(0.34,1.2,0.64,1)'
      }}>
        {/* Panel header */}
        <div style={{ background: '#fff', borderBottom: '1px solid #F0F0F0', padding: '13px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: getSafeRiskColor(calculatedRiskLabel).edge }} />
            <span style={{ fontWeight: 700, fontSize: 13.5, color: '#111827' }}>Tren &amp; Riwayat Klinis</span>
            <span style={{ marginLeft: 4, fontSize: 12.5, color: '#9CA3AF', fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>— {patient.full_name}</span>
          </div>
          <button className="close-btn" onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', transition: 'all 0.15s', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Panel body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '18px 18px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Patient mini-header */}
          <div style={{
            flexShrink: 0,
            background: '#fff',
            borderRadius: 16,
            padding: '14px 16px',
            boxShadow: '0 8px 20px -6px rgba(0, 0, 0, 0.02)',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <AvatarCircle name={patient.full_name} size={44} bg={getSafeRiskColor(calculatedRiskLabel).sqBg} />
              <div style={{ position: 'absolute', inset: -2, borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <p style={{ margin: 0, fontWeight: 750, fontSize: 16, color: '#1E293B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{patient.full_name}</p>
                <StatusPill label={calculatedStatus === 'bahaya' ? 'Bahaya' : calculatedStatus === 'waswas' ? 'Waswas' : 'Aman'} risk={calculatedRiskLabel} />
              </div>
              <p style={{ margin: '0 0 8px', fontSize: 12.5, color: '#6B7280', fontWeight: 500 }}>
                {patient.age} tahun · {DISEASE_LABEL[patient.disease_type]}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: hsBg, borderRadius: 8, padding: '3px 9px', border: `1px solid ${hsBorder}` }}>
                  <span style={{ fontSize: 13, fontWeight: 900, color: hsColor, fontFamily: 'IBM Plex Mono, monospace' }}>{currHs}</span>
                  <span style={{ fontSize: 10, color: '#6B7280', fontWeight: 600 }}>Health Score</span>
                </div>
                {recent.length > 1 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: deltaBg, color: deltaColor, borderRadius: 8, padding: '3px 9px', fontSize: 11.5, fontWeight: 700, border: `1px solid ${deltaColor}33` }}>
                    {deltaTxt} {deltaLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ background: '#fff', borderRadius: 16, padding: '40px 16px', textAlign: 'center', color: '#9CA3AF', fontSize: 13, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>Memuat tren &amp; riwayat klinis…</div>
          ) : (
            <>
              {/* Health Score Bar Chart */}
              <div style={{ flexShrink: 0, background: '#fff', borderRadius: 16, padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 13, color: '#111827' }}>Tren Health Score</p>
                <p style={{ margin: '0 0 14px', fontSize: 11, color: '#9CA3AF' }}>Skor kesehatan dari waktu ke waktu (0–100)</p>
                {recent.length === 0 ? (
                  <div style={{ padding: '24px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 12.5 }}>Belum ada riwayat health score.</div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 130, padding: '0 4px' }}>
                    {recent.map((entry, i) => {
                      const hs = entry.score
                      const barColor = hs >= 70 ? '#10B981' : hs >= 40 ? '#F59E0B' : '#EF4444'
                      const barH = Math.max(10, Math.round((hs / 100) * 96))
                      return (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: barColor, fontFamily: 'IBM Plex Mono, monospace' }}>{hs}</span>
                          <div style={{ width: '100%', height: barH, background: `linear-gradient(180deg, ${barColor}BB 0%, ${barColor} 100%)`, borderRadius: '5px 5px 0 0', boxShadow: `0 2px 5px ${barColor}33` }} />
                          <span style={{ fontSize: 9, color: '#9CA3AF' }}>{fmtShort(entry.scored_at)}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Clinical metrics dari baseline */}
              <div style={{ flexShrink: 0, background: '#fff', borderRadius: 16, padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: 13, color: '#111827' }}>Parameter Klinis (Baseline Terbaru)</p>
                {metrics.length === 0 ? (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 12.5 }}>Belum ada baseline klinis tercatat.</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {metrics.map((m, i) => (
                      <div key={i} style={{ background: '#F9FAFB', borderRadius: 10, padding: '11px 13px', border: '1px solid #ECEEF3' }}>
                        <p style={{ margin: '0 0 5px', fontSize: 10, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{m.label}</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                           <span style={{ fontSize: 20, fontWeight: 800, color: '#111827', fontFamily: 'IBM Plex Mono, monospace' }}>{m.value}</span>
                          {m.unit && <span style={{ fontSize: 10, color: '#9CA3AF' }}>{m.unit}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Timeline health score */}
              <div style={{ flexShrink: 0, background: '#fff', borderRadius: 16, padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <p style={{ margin: '0 0 14px', fontWeight: 700, fontSize: 13, color: '#111827' }}>Riwayat Health Score</p>
                {timeline.length === 0 ? (
                  <div style={{ padding: '12px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 12.5 }}>Belum ada riwayat.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {timeline.map((tl, i) => {
                      const last = i === timeline.length - 1
                      const c = tl.score >= 70 ? '#10B981' : tl.score >= 40 ? '#F59E0B' : '#EF4444'
                      return (
                        <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: last ? 0 : 14 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ width: 9, height: 9, borderRadius: '50%', background: c, flexShrink: 0 }} />
                            {!last && <div style={{ width: 1.5, flex: 1, background: '#F0F0F0', marginTop: 4, minHeight: 18 }} />}
                          </div>
                          <div style={{ paddingBottom: last ? 0 : 4 }}>
                            <p style={{ margin: '0 0 2px', fontSize: 10.5, color: '#9CA3AF' }}>{fmtShort(tl.scored_at)}</p>
                            <p style={{ margin: '0 0 1px', fontWeight: 600, fontSize: 12.5, color: '#111827' }}>Health Score: {tl.score}</p>
                            <p style={{ margin: 0, fontSize: 11.5, color: '#6B7280', textTransform: 'capitalize' }}>Status: {tl.status}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
