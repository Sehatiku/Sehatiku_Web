import { createPortal } from 'react-dom'
import type { FaskesPatientDetail } from '../../../lib/types'
import { initials, formatDate } from '../../../lib/utils'

interface Props {
  detail: FaskesPatientDetail | null
  loading: boolean
  onClose: () => void
}

const DISEASE_LABEL: Record<string, string> = {
  diabetes_t2: 'Diabetes T2',
  hypertension: 'Hipertensi',
  both: 'DM + Hipertensi',
}

const DISEASE_COLOR: Record<string, { bg: string; color: string }> = {
  diabetes_t2: { bg: '#EEEFFE', color: '#5B6BF0' },
  hypertension: { bg: 'rgba(79,195,247,0.12)', color: '#0277BD' },
  both: { bg: 'rgba(245,158,11,0.1)', color: '#D97706' },
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '9px 0', borderBottom: '1px solid #F4F5F7', gap: 12 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: '#8A93A1', textTransform: 'uppercase', letterSpacing: '0.4px', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#2B2D42', fontWeight: 500, textAlign: 'right', wordBreak: 'break-word' }}>{value || '—'}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: '#636B78', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 2 }}>{title}</div>
      {children}
    </div>
  )
}

export default function PatientDetailDrawer({ detail, loading, onClose }: Props) {
  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(43,45,66,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)', animation: 'fadeIn 0.2s ease-out' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* modal box */}
      <div style={{ width: 560, maxWidth: '92vw', maxHeight: '88vh', background: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(15,36,68,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* header bar */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #DCDFE8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#2B2D42' }}>Detail Pasien</div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: '#F4F5F7', border: '1px solid #DCDFE8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#636B78', fontSize: 16 }}>×</button>
        </div>

        {/* scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#8A93A1', fontSize: 13 }}>Memuat detail...</div>
          )}

          {!loading && detail && (() => {
            const dc = DISEASE_COLOR[detail.disease_type] ?? DISEASE_COLOR.diabetes_t2
            const isActive = detail.status === 'active'
            return (
              <>
                {/* patient hero */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, padding: '16px', background: '#F7F8FA', borderRadius: 12, border: '1px solid #DCDFE8' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: dc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: dc.color, flexShrink: 0 }}>
                    {initials(detail.full_name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#2B2D42' }}>{detail.full_name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 5, flexWrap: 'wrap' }}>
                      <span style={{ ...dc, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{DISEASE_LABEL[detail.disease_type]}</span>
                      <span style={{ background: isActive ? 'rgba(16,185,129,0.1)' : '#F4F5F7', color: isActive ? '#10B981' : '#8A93A1', border: `1px solid ${isActive ? 'rgba(16,185,129,0.2)' : '#DCDFE8'}`, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                        {isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                  </div>
                </div>

                <Section title="Data Identitas">
                  <Row label="NIK" value={detail.nik} />
                  <Row label="Tanggal Lahir" value={detail.date_of_birth || '—'} />
                  <Row label="Usia" value={`${detail.age} tahun`} />
                  <Row label="Jenis Kelamin" value={detail.sex === 'male' ? '♂ Laki-laki' : '♀ Perempuan'} />
                  <Row label="Alamat" value={detail.alamat} />
                </Section>

                <Section title="Kontak">
                  <Row label="No. WA Pasien" value={detail.phone_number} />
                  <Row label="Nama Pendamping" value={detail.companion_name} />
                  <Row label="No. WA Pendamping" value={detail.companion_phone} />
                </Section>

                <Section title="Klinis">
                  <Row label="Jenis Penyakit" value={DISEASE_LABEL[detail.disease_type]} />
                  <Row label="Nakes PJ" value={detail.assigned_nakes_name || '—'} />
                </Section>

                <Section title="Akun & Status">
                  <Row label="Username" value={detail.username} />
                  <Row label="Status" value={isActive ? 'Aktif' : 'Nonaktif'} />
                  <Row label="Terdaftar" value={formatDate(detail.enrolled_at)} />
                  <Row label="Diperbarui" value={formatDate(detail.updated_at)} />
                </Section>
              </>
            )
          })()}
        </div>
      </div>
    </div>,
    document.body
  )
}
