import { C } from '../../lib/constants'
import { Arr, IcoPhone } from '../ui/Icons'
import DashboardMockup from './DashboardMockup'
import Reveal from './Reveal'

const TRUST = ['BPJS Kesehatan', 'Prolanis PTM', 'OCR KTP', 'Health Score', 'WhatsApp & SMS', 'Eskalasi Real-Time']

export default function HeroSection({ onLoginClick }: { onLoginClick: () => void }) {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section id="sec-hero" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* ── Aurora mesh background ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div className="aurora-a" style={{ position: 'absolute', top: -160, right: -110, width: 520, height: 520, background: 'radial-gradient(circle, rgba(99,102,241,0.20), transparent 62%)', borderRadius: '50%' }} />
        <div className="aurora-b" style={{ position: 'absolute', bottom: -220, left: -150, width: 560, height: 560, background: 'radial-gradient(circle, rgba(20,185,160,0.18), transparent 62%)', borderRadius: '50%' }} />
        <div className="aurora-a" style={{ position: 'absolute', top: '34%', left: '42%', width: 360, height: 360, background: 'radial-gradient(circle, rgba(137,92,246,0.13), transparent 65%)', borderRadius: '50%', animationDelay: '-9s' }} />
      </div>

      {/* ── Dot-grid overlay (fades out) ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.14) 1px, transparent 1.4px)',
        backgroundSize: '24px 24px',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 64% 32%, #000 0%, transparent 72%)',
        maskImage: 'radial-gradient(ellipse 70% 60% at 64% 32%, #000 0%, transparent 72%)',
      }} />

      <div style={{
        position: 'relative', maxWidth: 1180, margin: '0 auto',
        padding: '82px 44px 40px',
        display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 52, alignItems: 'center',
      }}>
        {/* ── LEFT ── */}
        <div>
          <Reveal>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 9,
              background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)',
              border: '1px solid rgb(236,234,248)',
              borderRadius: 24, padding: '7px 15px 7px 11px', marginBottom: 26,
              boxShadow: '0 1px 3px rgba(30,36,51,0.05)',
            }}>
              <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
                <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: C.teal }} />
              </span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: C.tealLabel, letterSpacing: '0.2px' }}>
                Platform Mitra Prolanis BPJS Kesehatan
              </span>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <h1 style={{
              fontSize: 56, lineHeight: 1.04, fontWeight: 800,
              color: 'rgb(30,36,51)', letterSpacing: '-2px', margin: '0 0 22px',
            }}>
              Pantau Risiko Pasien<br />Prolanis Secara{' '}
              <span style={{ position: 'relative', display: 'inline-block' }}>
                <span className="text-gradient-anim">Real-Time</span>
                {/* hand-drawn underline */}
                <svg width="100%" height="14" viewBox="0 0 220 14" fill="none" preserveAspectRatio="none"
                  style={{ position: 'absolute', left: 0, bottom: -8, width: '100%' }}>
                  <path d="M3 8C40 3 110 2 217 7" stroke="url(#hg)" strokeWidth="4" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="hg" x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#6366F1" /><stop offset="0.5" stopColor="#895CF6" /><stop offset="1" stopColor="#14B9A0" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>
          </Reveal>

          <Reveal delay={170}>
            <p style={{ fontSize: 16.5, lineHeight: 1.7, color: 'rgb(90,102,120)', margin: '0 0 34px', maxWidth: 504 }}>
              Sehatiku melengkapi Prolanis dengan lapisan pemantauan harian — dari registrasi &amp; OCR KTP, baseline klinis, antrean prioritas berbasis Health Score, hingga eskalasi otomatis via WhatsApp &amp; SMS.
            </p>
          </Reveal>

          <Reveal delay={250}>
            <div style={{ display: 'flex', gap: 13, alignItems: 'center' }}>
              <button
                id="btn-masuk-hero"
                onClick={onLoginClick}
                className="btn-sheen"
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  background: 'linear-gradient(120deg, #6366F1, #7C5CF6)', color: '#fff', border: 'none',
                  borderRadius: 13, padding: '15px 30px', fontSize: 15, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit', transition: '0.18s',
                  boxShadow: '0 10px 28px rgba(99,102,241,0.34)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 38px rgba(99,102,241,0.42)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(99,102,241,0.34)' }}
              >
                Masuk ke Dashboard <Arr sz={16} col="white" />
              </button>
              <button
                id="btn-lihat-alur"
                onClick={() => scrollTo('sec-fitur')}
                style={{
                  background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', color: 'rgb(51,65,85)',
                  border: '1.5px solid rgb(228,226,242)',
                  borderRadius: 13, padding: '15px 26px', fontSize: 15, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', transition: '0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgb(238,240,254)'; e.currentTarget.style.borderColor = '#ABAEF9' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgb(228,226,242)' }}
              >
                Ajukan Kemitraan
              </button>
            </div>
          </Reveal>

          <Reveal delay={330}>
            <div style={{ display: 'flex', gap: 32, marginTop: 46, alignItems: 'center' }}>
              {[
                { val: '1.200+', lbl: 'Faskes Mitra' },
                { val: '48rb', lbl: 'Pasien Terpantau' },
                { val: '< 2 mnt', lbl: 'Waktu Eskalasi' },
              ].map((stat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                  {i > 0 && <div style={{ width: 1, height: 38, background: 'rgb(228,226,242)' }} />}
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'rgb(30,36,51)', letterSpacing: '-0.6px' }}>{stat.val}</div>
                    <div style={{ fontSize: 12, color: C.muted, fontWeight: 500, marginTop: 2 }}>{stat.lbl}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* ── RIGHT — Floating mockup ── */}
        <Reveal delay={220}>
          <div style={{ position: 'relative' }}>
            {/* conic glow ring */}
            <div className="anim-spin-slow" style={{
              position: 'absolute', inset: '-14% -12%', borderRadius: '50%', zIndex: 0,
              background: 'conic-gradient(from 0deg, rgba(99,102,241,0), rgba(99,102,241,0.22), rgba(20,185,160,0.18), rgba(137,92,246,0.22), rgba(99,102,241,0))',
              filter: 'blur(40px)',
            }} />

            <div className="anim-float" style={{ position: 'relative', zIndex: 1 }}>
              <DashboardMockup />
            </div>

            {/* AI accent chip */}
            <div className="anim-float-tilt" style={{
              position: 'absolute', top: -20, right: -16, zIndex: 2,
              background: 'linear-gradient(120deg, #6366F1, #895CF6)', borderRadius: 12,
              padding: '8px 13px', display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 14px 34px rgba(99,102,241,0.32)',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Prediksi AI aktif</span>
            </div>

            {/* Floating escalation pill */}
            <div className="anim-float-delayed" style={{
              position: 'absolute', bottom: -22, left: -30, zIndex: 2,
              background: '#fff', borderRadius: 14, border: `1px solid ${C.cardBorder}`,
              padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12,
              boxShadow: '0 16px 36px rgba(30,36,51,0.16)',
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
        </Reveal>
      </div>

      {/* ── Trust marquee ── */}
      <div className="marquee-mask" style={{
        position: 'relative', overflow: 'hidden', padding: '6px 0 30px',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
        maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
      }}>
        <div className="marquee-track">
          {[...TRUST, ...TRUST, ...TRUST, ...TRUST].map((t, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 28, padding: '0 28px' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '1.6px' }}>{t}</span>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgb(203,209,225)' }} />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
