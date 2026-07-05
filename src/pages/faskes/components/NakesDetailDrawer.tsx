import { createPortal } from 'react-dom'
import type { NakesDetail, NakesStatus } from '../../../lib/types'
import { initials, formatDate } from '../../../lib/utils'

interface Props {
  detail: NakesDetail | null
  loading: boolean
  onClose: () => void
  onToggleStatus: (nakes: { nakes_id: string; full_name: string; status: NakesStatus }) => void
}

const ROLE_COLOR: Record<string, { bg: string; color: string }> = {
  dokter: { bg: '#EEEFFE', color: '#5B6BF0' },
  kader: { bg: '#F0FDF8', color: '#059669' },
  admin: { bg: '#FFF7ED', color: '#D97706' },
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

export default function NakesDetailDrawer({ detail, loading, onClose, onToggleStatus }: Props) {
  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(23,28,58,0.62)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', animation: 'fadeIn 0.2s ease-out' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ width: 520, maxWidth: '92vw', maxHeight: '88vh', background: '#ffffff', borderRadius: 20, boxShadow: '0 20px 60px rgba(15,36,68,0.25)', border: '1px solid rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <div style={{ padding: '18px 22px', borderBottom: '1px solid #ECEEF3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#2B2D42' }}>Detail Nakes</div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#636B78', fontSize: 16 }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#8A93A1', fontSize: 13 }}>Memuat detail...</div>
          )}

          {!loading && detail && (() => {
            const rc = ROLE_COLOR[detail.role] ?? ROLE_COLOR.dokter
            const isActive = detail.status === 'active'
            return (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, padding: '16px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #ECEEF3' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: rc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: rc.color, flexShrink: 0 }}>
                    {initials(detail.full_name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#2B2D42' }}>{detail.full_name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 5, flexWrap: 'wrap' }}>
                      <span style={{ ...rc, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, textTransform: 'capitalize' }}>{detail.role}</span>
                      <span style={{ background: isActive ? 'rgba(16,185,129,0.1)' : '#F4F5F7', color: isActive ? '#10B981' : '#8A93A1', border: `1px solid ${isActive ? 'rgba(16,185,129,0.2)' : '#DCDFE8'}`, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                        {isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                  </div>
                </div>

                <Section title="Data Identitas">
                  <Row label="NIK" value={detail.nik} />
                  <Row label="Alamat" value={detail.alamat} />
                  {detail.role === 'dokter' && (
                    <Row label="Spesialisasi" value={detail.specialization || 'Dokter Umum'} />
                  )}
                </Section>

                {detail.role === 'dokter' && detail.schedule && detail.schedule.length > 0 && (
                  <Section title="Jadwal Praktek">
                    {detail.schedule.map((s, idx) => (
                      <Row key={idx} label={s.days} value={s.time} />
                    ))}
                  </Section>
                )}

                <Section title="Kontak">
                  <Row label="No. WhatsApp" value={detail.phone_number} />
                </Section>

                <Section title="Akun & Status">
                  <Row label="Username" value={detail.username} />
                  <Row label="Role" value={detail.role} />
                  <Row label="Status" value={isActive ? 'Aktif' : 'Nonaktif'} />
                  <Row label="Terdaftar" value={formatDate(detail.enrolled_at)} />
                  <Row label="Diperbarui" value={formatDate(detail.updated_at)} />
                </Section>

                <button
                  onClick={() => onToggleStatus({ nakes_id: detail.nakes_id, full_name: detail.full_name, status: detail.status })}
                  style={{
                    width: '100%', padding: '11px 0', borderRadius: 10, border: '1px solid', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 8,
                    ...(isActive
                      ? { background: '#FEF2F2', color: '#DC2626', borderColor: 'rgba(220,38,38,0.25)' }
                      : { background: '#F0FDF8', color: '#059669', borderColor: 'rgba(5,150,105,0.25)' }),
                  }}
                >
                  {isActive ? 'Nonaktifkan Nakes Ini' : 'Aktifkan Kembali Nakes Ini'}
                </button>
              </>
            )
          })()}
        </div>
      </div>
    </div>,
    document.body
  )
}
