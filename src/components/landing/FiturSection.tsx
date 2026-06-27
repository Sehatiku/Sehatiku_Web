import { C } from '../../lib/constants'
import { IcoUserPlus, IcoBarChart, IcoBell } from '../ui/Icons'

export default function FiturSection() {
  const cards = [
    {
      icon: <IcoUserPlus />, iconBg: 'rgb(238,240,254)',
      num: '01', phase: 'Pendaftaran', accentCol: C.primary,
      title: 'Onboarding & OCR KTP',
      desc: 'Faskes mendaftarkan pasien & dokter penanggung jawab dengan OCR KTP. Credential login otomatis terkirim via WhatsApp.',
    },
    {
      icon: <IcoBarChart />, iconBg: 'rgb(230,250,245)',
      num: '02', phase: 'Pemantauan', accentCol: 'rgb(20,185,160)',
      title: 'Antrean Prioritas',
      desc: 'Data fisiologis & gaya hidup harian diolah jadi Health Score cohort. Pasien terurut otomatis berdasarkan tingkat keparahan.',
    },
    {
      icon: <IcoBell />, iconBg: 'rgb(241,236,254)',
      num: '03', phase: 'Tindak Lanjut', accentCol: '#895CF6',
      title: 'Eskalasi Otomatis',
      desc: 'Saat skor melewati ambang bahaya, notifikasi WhatsApp & SMS langsung dikirim ke nakes penanggung jawab.',
    },
  ]
  return (
    <section id="sec-fitur" style={{ background: C.white, borderTop: '1px solid rgb(240,238,250)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '78px 44px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 46 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 10 }}>
            Alur Kerja Faskes
          </div>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: 'rgb(30,36,51)', letterSpacing: '-1px', margin: 0 }}>
            Tiga fase, satu platform terpadu
          </h2>
          <p style={{ fontSize: 15, color: C.muted, margin: '12px auto 0', maxWidth: 520, lineHeight: 1.6 }}>
            Mengisi celah 29 hari antar kontrol Prolanis bulanan — terhubung langsung ke workflow klinis faskes.
          </p>
        </div>
        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
          {cards.map((c, i) => (
            <div
              key={i}
              style={{
                background: C.white, borderRadius: 18, padding: 30,
                border: '1px solid rgb(240,238,250)',
                filter: 'drop-shadow(rgba(30,36,51,0.05) 0px 1px 4px)',
                transition: '0.2s ease', cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.filter = 'drop-shadow(rgba(30,36,51,0.12) 0px 12px 32px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.filter = 'drop-shadow(rgba(30,36,51,0.05) 0px 1px 4px)' }}
            >
              <div style={{ width: 50, height: 50, borderRadius: 14, background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                {c.icon}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: c.accentCol, marginBottom: 6 }}>{c.num} · {c.phase}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'rgb(30,36,51)', marginBottom: 9 }}>{c.title}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.65, color: 'rgb(100,116,139)' }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
