import { C } from '../../lib/constants'
import { IcoUserPlus, IcoBarChart, IcoBell } from '../ui/Icons'
import Reveal from './Reveal'

export default function FiturSection() {
  const cards = [
    {
      icon: <IcoUserPlus />, iconBg: 'rgb(238,240,254)',
      num: '01', phase: 'Pendaftaran', accentCol: C.primary, glow: 'rgba(99,102,241,0.16)',
      title: 'Onboarding & OCR KTP',
      desc: 'Faskes mendaftarkan pasien & dokter penanggung jawab dengan OCR KTP. Credential login otomatis terkirim via WhatsApp.',
    },
    {
      icon: <IcoBarChart />, iconBg: 'rgb(230,250,245)',
      num: '02', phase: 'Pemantauan', accentCol: 'rgb(20,185,160)', glow: 'rgba(20,185,160,0.16)',
      title: 'Antrean Prioritas',
      desc: 'Data fisiologis & gaya hidup harian diolah jadi Health Score cohort. Pasien terurut otomatis berdasarkan tingkat keparahan.',
    },
    {
      icon: <IcoBell />, iconBg: 'rgb(241,236,254)',
      num: '03', phase: 'Tindak Lanjut', accentCol: '#895CF6', glow: 'rgba(137,92,246,0.16)',
      title: 'Eskalasi Otomatis',
      desc: 'Saat skor melewati ambang bahaya, notifikasi WhatsApp & SMS langsung dikirim ke nakes penanggung jawab.',
    },
  ]
  return (
    <section id="sec-fitur" style={{ background: C.white, borderTop: '1px solid rgb(240,238,250)', position: 'relative', overflow: 'hidden' }}>
      {/* faint accent wash */}
      <div style={{ position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)', width: 700, height: 240, background: 'radial-gradient(ellipse, rgba(99,102,241,0.06), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: '82px 44px' }}>
        {/* Header */}
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.primary, textTransform: 'uppercase', letterSpacing: '1.6px', marginBottom: 12 }}>
              — Alur Kerja Faskes —
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: 'rgb(30,36,51)', letterSpacing: '-1.2px', margin: 0 }}>
              Tiga fase, <span className="text-gradient-anim">satu platform</span> terpadu
            </h2>
            <p style={{ fontSize: 15, color: C.muted, margin: '13px auto 0', maxWidth: 520, lineHeight: 1.6 }}>
              Mengisi celah 29 hari antar kontrol Prolanis bulanan — terhubung langsung ke workflow klinis faskes.
            </p>
          </div>
        </Reveal>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
          {cards.map((c, i) => (
            <Reveal key={i} delay={i * 120}>
              <div
                style={{
                  position: 'relative', background: C.white, borderRadius: 20, padding: 30,
                  border: '1px solid rgb(240,238,250)', overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(30,36,51,0.05)',
                  transition: 'transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s, border-color 0.25s',
                  cursor: 'default', height: '100%',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)'
                  e.currentTarget.style.boxShadow = `0 18px 44px ${c.glow}`
                  e.currentTarget.style.borderColor = c.accentCol
                  const bar = e.currentTarget.querySelector('[data-bar]') as HTMLElement | null
                  if (bar) bar.style.transform = 'scaleX(1)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(30,36,51,0.05)'
                  e.currentTarget.style.borderColor = 'rgb(240,238,250)'
                  const bar = e.currentTarget.querySelector('[data-bar]') as HTMLElement | null
                  if (bar) bar.style.transform = 'scaleX(0)'
                }}
              >
                {/* top accent bar */}
                <div data-bar style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${c.accentCol}, transparent)`, transform: 'scaleX(0)', transformOrigin: 'left', transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)' }} />

                {/* watermark number */}
                <div style={{ position: 'absolute', top: 10, right: 18, fontSize: 64, fontWeight: 800, color: c.glow, lineHeight: 1, fontFamily: 'IBM Plex Mono, monospace', pointerEvents: 'none' }}>{c.num}</div>

                <div style={{ width: 52, height: 52, borderRadius: 15, background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, boxShadow: `0 6px 18px ${c.glow}` }}>
                  {c.icon}
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: c.accentCol, marginBottom: 7, letterSpacing: '0.3px' }}>{c.num} · {c.phase}</div>
                <div style={{ fontSize: 18.5, fontWeight: 800, color: 'rgb(30,36,51)', marginBottom: 9, letterSpacing: '-0.3px' }}>{c.title}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.65, color: 'rgb(100,116,139)' }}>{c.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
