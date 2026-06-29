import type { NakesDetail } from '../../../lib/types'
import { SkeletonCard } from './Common'
import { initials } from '../../../lib/utils'

interface ProfilNakesViewProps {
  profile: NakesDetail | null
  loading: boolean
  error: string | null
  queueLength: number
  bahayaCount: number
  waswasCount: number
  amanCount: number
}

export default function ProfilNakesView({
  profile,
  loading,
  error,
  queueLength,
  bahayaCount,
  waswasCount,
  amanCount,
}: ProfilNakesViewProps) {
  if (loading) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <SkeletonCard h={100} />
        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 14 }}>
          <SkeletonCard h={360} />
          <SkeletonCard h={360} />
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: 40, gap: 12 }}>
        <span style={{ fontSize: 40 }}>&#x26A0;&#xFE0F;</span>
        <p style={{ margin: 0, fontSize: 15, color: '#636B78', fontWeight: 600 }}>{error || 'Gagal memuat profil dokter.'}</p>
      </div>
    )
  }

  const joinDate = new Date(profile.enrolled_at).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const distribution = [
    { label: 'Kondisi Bahaya', count: bahayaCount, color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' },
    { label: 'Perlu Pantauan', count: waswasCount, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
    { label: 'Kondisi Aman', count: amanCount, color: '#059669', bg: '#F0FDF4', border: '#A7F3D0' },
  ]

  const fields = [
    { label: 'Nomor NIK', value: profile.nik, mono: true },
    { label: 'Nama Lengkap', value: profile.full_name },
    { label: 'Username Portal', value: `@${profile.username}`, mono: true },
    { label: 'Nomor WhatsApp', value: `+${profile.phone_number}`, link: `https://wa.me/${profile.phone_number}` },
    { label: 'Alamat Tinggal', value: profile.alamat },
    { label: 'Tingkat Otoritas', value: profile.role === 'dokter' ? 'Dokter Pengawas Klinis' : profile.role === 'kader' ? 'Kader Kesehatan Lapangan' : 'Administrator' },
    { label: 'Fasilitas Kesehatan', value: 'Faskes Utama Sehatiku (Bandung)' },
  ]

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', background: '#F4F5F7', display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Hero banner ── */}
      <div style={{
        background: '#1E2775',
        borderRadius: 14, padding: '16px 22px',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        {/* Avatar */}
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: '#2D3DBF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 800, color: '#fff',
        }}>
          {initials(profile.full_name)}
        </div>

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{profile.full_name}</span>
            <span style={{
              background: '#0D9488', color: '#fff',
              fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 20,
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              {profile.status === 'active' ? 'Aktif' : 'Non-Aktif'}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>
            {profile.specialization || 'Dokter Umum'} · Terdaftar {joinDate}
          </p>
        </div>

        {/* ID */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ margin: '0 0 3px', fontSize: 9, color: 'rgba(255,255,255,0.32)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            ID Tenaga Medis
          </p>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace', color: '#0D9488' }}>
            {profile.nakes_id}
          </p>
        </div>
      </div>

      {/* ── Detail grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 14, alignItems: 'start' }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Detail Data Diri */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid #F0F1F4', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B6BF0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: 14.5, color: '#1E293B' }}>Detail Data Diri</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {fields.map((item, idx) => (
                <div key={idx} style={{
                  display: 'grid', gridTemplateColumns: '148px 1fr', gap: 12, alignItems: 'start',
                  padding: '11px 0',
                  borderBottom: idx < fields.length - 1 ? '1px solid #F8FAFC' : 'none',
                }}>
                  <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', paddingTop: 2 }}>
                    {item.label}
                  </span>
                  {item.link ? (
                    <a href={item.link} target="_blank" rel="noreferrer" style={{ fontSize: 13.5, color: '#5B6BF0', fontWeight: 700, textDecoration: 'none' }}>
                      {item.value}
                    </a>
                  ) : (
                    <span style={{ fontSize: 13.5, color: '#1E293B', fontWeight: 600, fontFamily: item.mono ? 'IBM Plex Mono, monospace' : 'inherit' }}>
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Jadwal Praktek */}
          {profile.role === 'dokter' && profile.schedule && profile.schedule.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid #F0F1F4', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <span style={{ fontWeight: 800, fontSize: 14.5, color: '#1E293B' }}>Jadwal Praktek</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {profile.schedule.map((s, idx) => (
                  <div key={idx} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', borderRadius: 9,
                    background: '#F8FAFC', border: '1px solid #F0F1F4',
                  }}>
                    <span style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>{s.days}</span>
                    <span style={{ fontSize: 13, color: '#1E293B', fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace' }}>{s.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Tanggung Jawab Klinis */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid #F0F1F4', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 14.5, color: '#1E293B' }}>Tanggung Jawab Klinis</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Pasien diawasi callout */}
            <div style={{
              background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
              border: '1px solid #C7D2FE', borderRadius: 12, padding: '14px 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ margin: '0 0 3px', fontSize: 10.5, fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Pasien Diawasi
                </p>
                <p style={{ margin: 0, fontSize: 11, color: '#6B7280' }}>Terdaftar di dashboard prioritas</p>
              </div>
              <span style={{ fontSize: 30, fontWeight: 800, color: '#3B49DF', fontFamily: 'IBM Plex Mono, monospace' }}>
                {queueLength}
              </span>
            </div>

            {/* Distribution */}
            <div>
              <p style={{ margin: '0 0 10px', fontSize: 10.5, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Distribusi Status Kesehatan
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {distribution.map((stat, i) => {
                  const pct = queueLength > 0 ? Math.round((stat.count / queueLength) * 100) : 0
                  return (
                    <div key={i} style={{ background: stat.bg, border: `1px solid ${stat.border}`, borderRadius: 10, padding: '10px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: stat.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: stat.color }}>{stat.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 10.5, color: stat.color, fontWeight: 600 }}>{pct}%</span>
                          <span style={{ fontSize: 13, fontWeight: 800, color: stat.color, fontFamily: 'IBM Plex Mono, monospace' }}>
                            {stat.count}
                          </span>
                        </div>
                      </div>
                      <div style={{ height: 5, background: 'rgba(0,0,0,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: stat.color, borderRadius: 99 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Note */}
            <div style={{
              background: '#FAFAFA', borderRadius: 9, padding: '10px 12px',
              border: '1px solid #F0F1F4',
              display: 'flex', alignItems: 'flex-start', gap: 8,
            }}>
              <svg width="13" height="13" style={{ marginTop: 1, flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF', lineHeight: 1.5 }}>
                Data distribusi pasien diperbarui otomatis setiap 60 detik.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
