import { C } from '../../lib/constants'
import { Arr, IcoPhone } from '../ui/Icons'
import DashboardMockup from './DashboardMockup'

export default function HeroSection({ onLoginClick }: { onLoginClick: () => void }) {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  return (
    <section id="sec-hero" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* decorative bg blobs */}
      <div style={{ position: 'absolute', top: -130, right: -90, width: 440, height: 440, background: 'radial-gradient(circle, rgba(137,92,246,0.16), transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -180, left: -120, width: 460, height: 460, background: 'radial-gradient(circle, rgba(20,185,160,0.13), transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{
        position: 'relative', maxWidth: 1180, margin: '0 auto',
        padding: '74px 44px 60px',
        display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 52, alignItems: 'center',
      }}>
        {/* LEFT */}
        <div>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: C.white, border: `1px solid rgb(236,234,248)`,
            borderRadius: 24, padding: '7px 15px', marginBottom: 24,
            filter: 'drop-shadow(rgba(30,36,51,0.05) 0px 1px 3px)',
          }}>
            <div className="anim-blink" style={{ width: 7, height: 7, borderRadius: '50%', background: C.teal }} />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: C.tealLabel, letterSpacing: '0.2px' }}>
              Platform Mitra Prolanis BPJS Kesehatan
            </span>
          </div>

          <h1 style={{
            fontSize: 50, lineHeight: 1.08, fontWeight: 800,
            color: 'rgb(30,36,51)', letterSpacing: '-1.6px', margin: '0 0 20px',
          }}>
            Pantau Risiko Pasien Prolanis Secara{' '}
            <span style={{ color: C.primary }}>Real-Time</span>
          </h1>

          <p style={{
            fontSize: 16.5, lineHeight: 1.68, color: 'rgb(90,102,120)',
            margin: '0 0 32px', maxWidth: 500,
          }}>
            Sehatiku melengkapi Prolanis dengan lapisan pemantauan harian — dari registrasi &amp; OCR KTP, baseline klinis, antrean prioritas berbasis Health Score, hingga eskalasi otomatis via WhatsApp &amp; SMS.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 13, alignItems: 'center' }}>
            <button
              id="btn-masuk-hero"
              onClick={onLoginClick}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                background: C.primary, color: '#fff', border: 'none',
                borderRadius: 12, padding: '15px 30px', fontSize: 15, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', transition: '0.15s',
                filter: 'drop-shadow(rgba(99,102,241,0.32) 0px 8px 24px)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#4f52d8'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = 'none' }}
            >
              Masuk ke Dashboard <Arr sz={16} col="white" />
            </button>
            <button
              id="btn-lihat-alur"
              onClick={() => scrollTo('sec-fitur')}
              style={{
                background: C.white, color: 'rgb(51,65,85)',
                border: '1.5px solid rgb(228,226,242)',
                borderRadius: 12, padding: '15px 26px', fontSize: 15, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: '0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgb(238,240,254)'; e.currentTarget.style.borderColor = '#ABAEF9' }}
              onMouseLeave={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.borderColor = 'rgb(228,226,242)' }}
            >
              Lihat Alur Kerja
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 32, marginTop: 44, alignItems: 'center' }}>
            {[
              { val: '1.200+', lbl: 'Faskes Mitra' },
              { val: '48rb',   lbl: 'Pasien Terpantau' },
              { val: '< 2 mnt', lbl: 'Waktu Eskalasi' },
            ].map((stat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                {i > 0 && <div style={{ width: 1, height: 36, background: 'rgb(228,226,242)' }} />}
                <div>
                  <div style={{ fontSize: 27, fontWeight: 800, color: 'rgb(30,36,51)', letterSpacing: '-0.5px' }}>{stat.val}</div>
                  <div style={{ fontSize: 12, color: C.muted, fontWeight: 500, marginTop: 2 }}>{stat.lbl}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Floating mockup */}
        <div style={{ position: 'relative' }}>
          <div className="anim-float">
            <DashboardMockup />
          </div>
          {/* Floating escalation pill */}
          <div className="anim-float-delayed" style={{
            position: 'absolute', bottom: -20, left: -28,
            background: C.white, borderRadius: 14, border: `1px solid ${C.cardBorder}`,
            padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12,
            filter: 'drop-shadow(rgba(30,36,51,0.16) 0px 16px 36px)',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgb(230,250,245)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IcoPhone />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: C.dark }}>Eskalasi terkirim</div>
              <div style={{ fontSize: 10, color: C.muted }}>WhatsApp &amp; SMS · 08:42</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
