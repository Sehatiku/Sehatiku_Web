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
      <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SkeletonCard h={140} />
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
          <SkeletonCard h={280} />
          <SkeletonCard h={280} />
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
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header Profile Card with smooth indigo gradient */}
      <div style={{
        background: 'linear-gradient(135deg, #3B49DF 0%, #1A237E 100%)',
        borderRadius: 16,
        padding: '24px 28px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 8px 24px rgba(26, 35, 126, 0.18)',
        gap: 20,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: '#fff',
            color: '#1A237E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            fontWeight: 800,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}>
            {initials(profile.full_name)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>{profile.full_name}</h2>
              <span style={{
                background: '#1EC8A5',
                color: '#fff',
                fontSize: 10,
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 20,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {profile.status === 'active' ? 'Aktif' : 'Non-Aktif'}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600 }}>
              {profile.specialization || 'Dokter Umum'}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(255, 255, 255, 0.6)' }}>
              Terdaftar sejak {joinDate}
            </p>
          </div>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 12,
          padding: '12px 18px',
          textAlign: 'right',
        }}>
          <p style={{ margin: 0, fontSize: 11, color: 'rgba(255, 255, 255, 0.65)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            ID Tenaga Medis
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 800, fontFamily: 'IBM Plex Mono, monospace', color: '#1EC8A5' }}>
            {profile.nakes_id}
          </p>
        </div>
      </div>

      {/* Detail grid info & stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 18, alignItems: 'start' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Profile details card */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 800, color: '#2B2D42', borderBottom: '2px solid #F0F2F6', paddingBottom: 10 }}>
              Detail Data Diri
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Nomor NIK', value: profile.nik, mono: true },
                { label: 'Nama Lengkap', value: profile.full_name },
                { label: 'Username Portal', value: `@${profile.username}`, mono: true },
                { label: 'Nomor WhatsApp', value: `+${profile.phone_number}`, link: `https://wa.me/${profile.phone_number}` },
                { label: 'Alamat Tinggal', value: profile.alamat },
                { label: 'Tingkat Otoritas', value: profile.role === 'dokter' ? 'Dokter Pengawas Klinis' : profile.role === 'kader' ? 'Kader Kesehatan Lapangan' : 'Administrator' },
                { label: 'Fasilitas Kesehatan', value: 'Faskes Utama Sehatiku (Bandung)' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, fontSize: 13, borderBottom: idx < 6 ? '1px solid #F9FAFC' : 'none', paddingBottom: idx < 6 ? 10 : 0 }}>
                  <span style={{ color: '#636B78', fontWeight: 600 }}>{item.label}</span>
                  {item.link ? (
                    <a href={item.link} target="_blank" rel="noreferrer" style={{ color: '#5B6BF0', fontWeight: 700, textDecoration: 'none' }}>
                      {item.value}
                    </a>
                  ) : (
                    <span style={{
                      color: '#2B2D42',
                      fontWeight: 700,
                      fontFamily: item.mono ? 'IBM Plex Mono, monospace' : 'inherit',
                    }}>
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {profile.role === 'dokter' && profile.schedule && profile.schedule.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 800, color: '#2B2D42', borderBottom: '2px solid #F0F2F6', paddingBottom: 10 }}>
                Jadwal Praktek Dokter
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {profile.schedule.map((s, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, fontSize: 13, borderBottom: idx < profile.schedule!.length - 1 ? '1px solid #F9FAFC' : 'none', paddingBottom: idx < profile.schedule!.length - 1 ? 10 : 0 }}>
                    <span style={{ color: '#636B78', fontWeight: 600 }}>{s.days}</span>
                    <span style={{ color: '#2B2D42', fontWeight: 700 }}>{s.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Clinical metrics stats summary */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 800, color: '#2B2D42', borderBottom: '2px solid #F0F2F6', paddingBottom: 10 }}>
            Tanggung Jawab Klinis
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Total Patient Monitored Callout */}
            <div style={{
              background: '#EEEFFE',
              border: '1.5px solid #D1D5FC',
              borderRadius: 12,
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#5B6BF0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Pasien Diawasi
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#636B78' }}>
                  Total terdaftar di dashboard prioritas Anda
                </p>
              </div>
              <span style={{
                fontSize: 32,
                fontWeight: 800,
                color: '#3B49DF',
                fontFamily: 'IBM Plex Mono, monospace',
              }}>
                {queueLength}
              </span>
            </div>

            {/* Breakdown distribution */}
            <div>
              <p style={{ margin: '0 0 12px 0', fontSize: 12, fontWeight: 700, color: '#636B78', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Distribusi Status Kesehatan Pasien
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Kondisi Bahaya (Kritis)', count: bahayaCount, color: '#EF4444', bg: '#FEF2F2' },
                  { label: 'Perlu Pantauan (Waswas)', count: waswasCount, color: '#F59E0B', bg: '#FFFBEB' },
                  { label: 'Kondisi Aman (Rendah)', count: amanCount, color: '#059669', bg: '#F0FDF4' },
                ].map((stat, i) => {
                  const percentage = queueLength > 0 ? (stat.count / queueLength) * 100 : 0
                  return (
                    <div key={i} style={{ background: stat.bg, padding: '10px 14px', borderRadius: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: stat.color }}>{stat.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: stat.color, fontFamily: 'IBM Plex Mono, monospace' }}>
                          {stat.count} pasien
                        </span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${percentage}%`, background: stat.color, borderRadius: 3 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
