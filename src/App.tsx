import { useState, useEffect } from 'react'
import './index.css'
import FaskesDashboardPage from './pages/faskes/FaskesDashboardPage'

/* ─────────────── COLOR TOKENS (exact from Sehatiku.html) ─────────────── */
// Background page:  rgb(245, 243, 255)   = #F5F3FF
// Hero h1 color:   rgb(30, 36, 51)       = #1E2433
// Body text:       rgb(90, 102, 120)     = #5A6678
// Muted text:      rgb(148, 163, 184)    = #94A3B8
// Primary btn bg:  rgb(99, 102, 241)     = #6366F1
// Purple accent:   rgb(137, 92, 246)     = #895CF6
// Teal:            rgb(20, 185, 160)     = #14B9A0
// Teal label:      rgb(14, 147, 132)     = #0E9384
// Nav text:        rgb(71, 85, 105)      = #475569
// Wordmark:        rgb(51, 65, 85)       = #334155
// Card border:     rgb(236, 234, 248)    = #ECEAF8
// Light purple bg: rgb(250, 250, 254)    = #FAFAFE
// Chip border:     rgb(240, 238, 250)    = #F0EEF8

const C = {
  bg:          '#F5F3FF',
  ink:         '#1E2433',
  body:        '#5A6678',
  muted:       '#94A3B8',
  cardDesc:    '#64748B',
  primary:     '#6366F1',
  purple:      '#895CF6',
  teal:        '#14B9A0',
  tealLabel:   '#0E9384',
  navText:     '#475569',
  wordmark:    '#334155',
  cardBorder:  '#ECEAF8',
  chipBorder:  '#F0EEF8',
  lightPurple: '#FAFAFE',
  white:       '#FFFFFF',
  dark:        '#1E2433',
  footerBg:    '#1E2433',
}

/* ─────────────── SVG ICONS ─────────────── */
const Arr = ({ sz = 15, col = 'currentColor' }: { sz?: number; col?: string }) => (
  <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)
const IcoCheck = ({ col = C.primary }: { col?: string }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IcoPhone = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#14B9A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l1.64-1.64a2 2 0 0 1 2.11-.45c.91.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92z" />
  </svg>
)
const IcoUserPlus = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
  </svg>
)
const IcoBarChart = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14B9A0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)
const IcoBell = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#895CF6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)
const IcoHome = () => (
  <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" />
  </svg>
)
const IcoUser = () => (
  <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#14B9A0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)

/* ─────────────── SEHATIKU LOGO MARK (using actual logo) ─────────────── */
function LogoImg({ size = 34 }: { size?: number }) {
  return (
    <img
      src="/logo sehatiku.png"
      alt="Sehatiku"
      style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
    />
  )
}

/* ─────────────── NAVBAR ─────────────── */
function Navbar({ onLoginClick }: { onLoginClick: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      background: 'rgba(245,243,255,0.82)',
      borderBottom: `1px solid rgb(236,234,248)`,
      padding: '12px 44px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      transition: 'box-shadow 0.2s',
      boxShadow: scrolled ? '0 2px 16px rgba(99,102,241,0.08)' : 'none',
    }}>
      {/* Brand */}
      <button
        onClick={() => scrollTo('sec-hero')}
        style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <LogoImg size={34} />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px', color: C.wordmark }}>
            sehat<span style={{ color: '#895CF6' }}>iku</span>
          </div>
          <span style={{
            fontSize: 9, fontWeight: 700, color: C.primary,
            background: 'rgb(238,240,254)',
            border: `1px solid rgba(99,102,241,0.16)`,
            padding: '3px 8px', borderRadius: 20,
            textTransform: 'uppercase', letterSpacing: '0.6px',
          }}>Prolanis PTM</span>
        </div>
      </button>

      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {[
          { label: 'Beranda', id: 'sec-hero' },
          { label: 'Alur Kerja', id: 'sec-fitur' },
          { label: 'Faskes & Dokter', id: 'sec-aktor' },
          { label: 'Tentang', id: 'sec-tentang' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            style={{
              background: 'none', border: 'none', fontFamily: 'inherit',
              fontSize: 13.5, fontWeight: 600, color: C.navText,
              cursor: 'pointer', padding: '8px 13px', borderRadius: 8, transition: '0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.07)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
          >
            {item.label}
          </button>
        ))}
        <button
          id="btn-masuk-navbar"
          onClick={onLoginClick}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12,
            background: C.primary, color: '#fff', border: 'none',
            borderRadius: 10, padding: '10px 20px', fontSize: 13.5, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', transition: '0.15s',
            filter: 'drop-shadow(rgba(99,102,241,0.28) 0px 4px 14px)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#4f52d8'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = 'none' }}
        >
          Masuk <Arr sz={15} col="white" />
        </button>
      </div>
    </nav>
  )
}

/* ─────────────── DASHBOARD MOCKUP ─────────────── */
function DashboardMockup() {
  const chips = [
    { label: 'Bahaya', count: 2, col: '#895CF6' },
    { label: 'Waswas', count: 3, col: C.primary },
    { label: 'Aman',   count: 3, col: C.teal },
  ]
  const rows = [
    { init: 'AS', name: 'Ahmad Suharto', score: 92, w: '92%', col: '#895CF6', avatarBg: 'rgba(137,92,246,0.1)' },
    { init: 'SR', name: 'Siti Rahayu',   score: 87, w: '87%', col: C.primary,  avatarBg: 'rgba(99,102,241,0.1)'  },
    { init: 'HB', name: 'Hasan Basri',   score: 34, w: '34%', col: C.teal,     avatarBg: 'rgba(20,185,160,0.1)'  },
  ]
  return (
    <div style={{
      background: C.white, borderRadius: 20, border: `1px solid ${C.cardBorder}`,
      padding: 20, filter: 'drop-shadow(rgba(30,36,51,0.16) 0px 30px 70px)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: C.dark }}>Antrean Prioritas Pasien</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgb(238,240,254)', borderRadius: 7, padding: '5px 10px' }}>
          <div className="anim-blink" style={{ width: 6, height: 6, borderRadius: '50%', background: C.primary }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: C.primary }}>AI Auto-Sorted</span>
        </div>
      </div>
      {/* Risk chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 15 }}>
        {chips.map(c => (
          <div key={c.label} style={{
            flex: 1, background: 'rgb(250,250,254)',
            borderWidth: '2px 1px 1px', borderStyle: 'solid',
            borderColor: `${c.col} rgb(240,238,250) rgb(240,238,250)`,
            borderRadius: 9, padding: '9px 11px',
          }}>
            <div style={{ fontSize: 8, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{c.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: c.col }}>{c.count}</div>
          </div>
        ))}
      </div>
      {/* Patient rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map(r => (
          <div key={r.name} style={{
            display: 'flex', alignItems: 'center', gap: 11,
            background: 'rgb(250,250,254)', border: `1px solid rgb(240,238,250)`,
            borderRadius: 11, padding: '10px 12px',
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: r.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: r.col }}>
              {r.init}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: C.dark }}>{r.name}</div>
              <div style={{ height: 4, background: 'rgb(240,238,250)', borderRadius: 3, marginTop: 5, overflow: 'hidden' }}>
                <div style={{ width: r.w, height: '100%', background: r.col, borderRadius: 3 }} />
              </div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: r.col, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 800 }}>
              {r.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────── HERO SECTION ─────────────── */
function HeroSection({ onLoginClick }: { onLoginClick: () => void }) {
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
            Sehatiku melengkapi Prolanis dengan lapisan pemantauan harian — dari registrasi &amp; OCR KTP, baseline klinis, antrean prioritas berbasis Risk Score, hingga eskalasi otomatis via WhatsApp &amp; SMS.
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
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                {i > 0 && <div style={{ width: 1, height: 36, background: 'rgb(228,226,242)' }} />}
                <div>
                  <div style={{ fontSize: 27, fontWeight: 800, color: 'rgb(30,36,51)', letterSpacing: '-0.5px' }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: C.muted, fontWeight: 500, marginTop: 2 }}>{s.lbl}</div>
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

/* ─────────────── FITUR SECTION ─────────────── */
function FiturSection() {
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
      desc: 'Data fisiologis & gaya hidup harian diolah jadi Risk Score cohort. Pasien terurut otomatis dari risiko tertinggi.',
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

/* ─────────────── AKTOR SECTION ─────────────── */
function AktorSection({ onLoginClick }: { onLoginClick: (r: 'faskes' | 'dokter') => void }) {
  const faskesItems = [
    'Registrasi pasien & dokter + OCR KTP',
    'Manajemen akun dokter & nakes',
    'Input baseline klinis & overview faskes',
  ]
  const dokterItems = [
    'Antrean prioritas pasien berbasis Risk Score',
    'Tren harian gula darah & tensi + atribusi AI',
    'Tindak lanjut & umpan balik model satu ketuk',
  ]
  return (
    <section id="sec-aktor" style={{ background: 'rgb(245,243,255)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '78px 44px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 46 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#895CF6', textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 10 }}>
            Dua Sudut Pandang
          </div>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: 'rgb(30,36,51)', letterSpacing: '-1px', margin: 0 }}>
            Satu platform untuk Faskes &amp; Dokter
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
          {/* Faskes */}
          <div style={{
            background: C.white, borderRadius: 20, padding: 34,
            border: `1px solid ${C.cardBorder}`,
            filter: 'drop-shadow(rgba(30,36,51,0.05) 0px 1px 4px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: 15, background: 'rgb(238,240,254)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IcoHome />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Akses Admin</div>
                <div style={{ fontSize: 21, fontWeight: 800, color: 'rgb(30,36,51)' }}>Faskes</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 24 }}>
              {faskesItems.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 7, background: 'rgb(238,240,254)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IcoCheck col="#6366F1" />
                  </div>
                  <span style={{ fontSize: 14, color: C.navText, fontWeight: 500 }}>{f}</span>
                </div>
              ))}
            </div>
            <button
              id="btn-masuk-faskes"
              onClick={() => onLoginClick('faskes')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: C.primary, color: '#fff', border: 'none',
                borderRadius: 11, padding: '13px 22px', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', transition: '0.15s',
                filter: 'drop-shadow(rgba(99,102,241,0.26) 0px 5px 16px)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#4f52d8'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = 'none' }}
            >
              Masuk sebagai Faskes <Arr sz={15} col="white" />
            </button>
          </div>

          {/* Dokter */}
          <div style={{
            background: C.white, borderRadius: 20, padding: 34,
            border: `1px solid ${C.cardBorder}`,
            filter: 'drop-shadow(rgba(30,36,51,0.05) 0px 1px 4px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: 15, background: 'rgb(230,250,245)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IcoUser />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgb(14,147,132)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Akses Klinis</div>
                <div style={{ fontSize: 21, fontWeight: 800, color: 'rgb(30,36,51)' }}>Dokter</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 24 }}>
              {dokterItems.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 7, background: 'rgb(230,250,245)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IcoCheck col="#14B9A0" />
                  </div>
                  <span style={{ fontSize: 14, color: C.navText, fontWeight: 500 }}>{f}</span>
                </div>
              ))}
            </div>
            <button
              id="btn-masuk-dokter"
              onClick={() => onLoginClick('dokter')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgb(20,185,160)', color: '#fff', border: 'none',
                borderRadius: 11, padding: '13px 22px', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', transition: '0.15s',
                filter: 'drop-shadow(rgba(20,185,160,0.26) 0px 5px 16px)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#12a08c'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgb(20,185,160)'; e.currentTarget.style.transform = 'none' }}
            >
              Masuk sebagai Dokter <Arr sz={15} col="white" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────── TENTANG SECTION (purple gradient + stats) ─────────────── */
function TentangSection() {
  const stats = [
    { val: '75%',     desc: 'kematian di Indonesia akibat Penyakit Tidak Menular' },
    { val: 'Rp30,5 T', desc: 'beban pembiayaan diabetes & hipertensi (2024)' },
    { val: '4,8 jt',   desc: 'peserta Prolanis aktif di 10.268+ Puskesmas' },
  ]
  return (
    <section id="sec-tentang" style={{
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, rgb(79,70,229) 0%, rgb(99,102,241) 52%, rgb(137,92,246) 100%)',
    }}>
      <div style={{ position: 'absolute', top: -80, right: -40, width: 300, height: 300, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: -120, left: -60, width: 320, height: 320, background: 'rgba(20,185,160,0.16)', borderRadius: '50%' }} />
      <div style={{ position: 'relative', maxWidth: 1000, margin: '0 auto', padding: '74px 44px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 16 }}>
          Posisi Sehatiku
        </div>
        <h2 style={{ fontSize: 36, lineHeight: 1.25, fontWeight: 800, color: '#fff', letterSpacing: '-1px', margin: '0 0 18px' }}>
          Mengubah <span style={{ color: 'rgb(167,243,228)' }}>29 hari kosong</span> antar kontrol Prolanis menjadi satu sinyal.
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.82)', maxWidth: 640, margin: '0 auto 44px' }}>
          Bukan pengganti Prolanis — melainkan lapisan pemantauan harian yang mengisi jendela waktu yang selama ini paling sedikit tersentuh sistem.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 16, padding: 24,
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>{s.val}</div>
              <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.78)', marginTop: 5, lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────── KONTAK SECTION ─────────────── */
function KontakSection({ onLoginClick }: { onLoginClick: () => void }) {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  return (
    <section id="sec-kontak" style={{ background: C.white }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '78px 44px' }}>
        <div style={{
          background: 'rgb(245,243,255)', border: `1px solid ${C.cardBorder}`,
          borderRadius: 24, padding: 54, textAlign: 'center',
        }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: 'rgb(30,36,51)', letterSpacing: '-0.8px', margin: '0 0 14px' }}>
            Siap melengkapi Prolanis di faskes Anda?
          </h2>
          <p style={{ fontSize: 16, color: 'rgb(90,102,120)', margin: '0 auto 30px', maxWidth: 520, lineHeight: 1.65 }}>
            Masuk ke dashboard untuk mulai memantau, atau ajukan kemitraan untuk faskes penyelenggara Prolanis Anda.
          </p>
          <div style={{ display: 'flex', gap: 13, alignItems: 'center', justifyContent: 'center' }}>
            <button
              id="btn-cta-masuk"
              onClick={onLoginClick}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                background: C.primary, color: '#fff', border: 'none',
                borderRadius: 12, padding: '15px 32px', fontSize: 15, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', transition: '0.15s',
                filter: 'drop-shadow(rgba(99,102,241,0.3) 0px 8px 24px)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#4f52d8'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = C.primary; e.currentTarget.style.transform = 'none' }}
            >
              Masuk ke Dashboard <Arr sz={16} col="white" />
            </button>
            <button
              id="btn-ajukan-kemitraan"
              onClick={() => scrollTo('sec-fitur')}
              style={{
                background: C.white, color: 'rgb(51,65,85)',
                border: '1.5px solid rgb(228,226,242)', borderRadius: 12,
                padding: '15px 28px', fontSize: 15, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: '0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgb(238,240,254)' }}
              onMouseLeave={e => { e.currentTarget.style.background = C.white }}
            >
              Ajukan Kemitraan
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────── FOOTER ─────────────── */
function Footer() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  return (
    <footer style={{ background: 'rgb(30,36,51)', padding: '48px 44px 30px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 30, paddingBottom: 30,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          {/* Brand */}
          <div style={{ maxWidth: 300 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13 }}>
              <LogoImg size={32} />
              <div style={{ fontSize: 19, fontWeight: 800, color: '#fff', letterSpacing: '-0.4px' }}>
                sehat<span style={{ color: 'rgb(167,139,250)' }}>iku</span>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
              Terhubung, Terpantau, Terlindungi. Platform predictive monitoring penyakit kronis, mitra Prolanis BPJS Kesehatan.
            </div>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 64 }}>
            {/* Platform */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>
                Platform
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {[
                  { label: 'Alur Kerja', id: 'sec-fitur' },
                  { label: 'Faskes & Dokter', id: 'sec-aktor' },
                  { label: 'Tentang', id: 'sec-tentang' },
                ].map(link => (
                  <span
                    key={link.id}
                    onClick={() => scrollTo(link.id)}
                    style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: '0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.95)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                  >{link.label}</span>
                ))}
              </div>
            </div>
            {/* Kepatuhan */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>
                Kepatuhan
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {['Terdaftar PSE Kominfo', 'UU PDP No. 27/2022', 'Bukan Rekam Medis Elektronik'].map(t => (
                  <span key={t} style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingTop: 22 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>© 2026 Sehatiku — Mitra Prolanis BPJS Kesehatan</span>
          <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)' }}>Bukan alat diagnosis medis — pelengkap pemantauan Prolanis.</span>
        </div>
      </div>
    </footer>
  )
}

/* ─────────────── LOGIN PAGE (full-screen, 2-col layout from reference) ─────────────── */
function LoginModal({ isOpen, onClose, defaultRole = 'faskes', onLoginSuccess }: { isOpen: boolean; onClose: () => void; defaultRole?: 'faskes' | 'dokter'; onLoginSuccess: (role: 'faskes' | 'dokter') => void }) {
  const [role, setRole] = useState<'faskes' | 'dokter'>(defaultRole)
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [remember, setRemember] = useState(false)

  useEffect(() => { if (isOpen) { setRole(defaultRole); setEmail(''); setPass('') } }, [isOpen, defaultRole])
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isDr = role === 'dokter'

  // Per-role content
  const panelTitle   = isDr ? 'Dashboard Klinis Dokter' : 'Dashboard Admin Faskes'
  const panelDesc    = isDr
    ? 'Pantau antrean prioritas pasien Anda, telaah tren harian & faktor risiko, lalu tindak lanjuti — dalam satu layar klinis.'
    : 'Kelola registrasi pasien & dokter, pantau antrian prioritas berbasis Risk Score, dan tanggapi eskalasi klinis — semua dalam satu tempat.'
  const features = isDr
    ? ['Antrean prioritas pasien berbasis Risk Score', 'Tren harian gula darah & tensi + atribusi AI', 'Tindak lanjut & umpan balik model satu ketuk']
    : ['Registrasi pasien & dokter dengan OCR KTP', 'Antrian prioritas otomatis berbasis Risk Score', 'Eskalasi otomatis via WhatsApp & SMS real-time']
  const formTitle    = isDr ? 'Masuk sebagai Dokter' : 'Masuk ke Akun Faskes'
  const formSub      = isDr
    ? 'Gunakan kredensial yang dikirim faskes Anda via WhatsApp'
    : 'Gunakan kredensial admin faskes Anda'
  const inputLabel   = isDr ? 'Email / No. SIP' : 'Email / Kode Faskes'
  const inputPh      = isDr ? 'dr.andi@rsu-sejahtera.id' : 'admin@rsu-sejahtera.id'
  const footerText   = isDr ? 'Akun dokter didaftarkan oleh faskes. ' : 'Faskes belum terdaftar? '
  const footerLink   = isDr ? 'Belum terima kredensial?' : 'Ajukan kemitraan Prolanis'

  // Accent for submit button — faskes = indigo, dokter = teal (matching reference)
  const accentBg     = isDr ? '#5B6BF0' : '#1EC8A5'
  const accentShadow = isDr ? 'rgba(91,107,240,0.28)' : 'rgba(30,200,165,0.28)'
  const accentHover  = isDr ? '#4f52d8' : '#17b093'
  const focusColor   = isDr ? '#5B6BF0' : '#1EC8A5'
  const focusShadow  = isDr ? 'rgba(91,107,240,0.15)' : 'rgba(30,200,165,0.15)'

  return (
    <div
      role="dialog" aria-modal="true" aria-label="Halaman Login Sehatiku"
      className="anim-fadein"
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        fontFamily: 'Inter, sans-serif', background: '#fff',
      }}
    >
      {/* ── LEFT: Brand panel ── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(150deg, #1A2066 0%, #262F8A 55%, #2D3799 100%)',
        padding: '56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        {/* decorative orbs */}
        <div style={{ position: 'absolute', top: -80, right: -60, width: 280, height: 280, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -40, width: 240, height: 240, background: 'rgba(30,200,165,0.14)', borderRadius: '50%' }} />

        {/* Logo + wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
          <LogoImg size={38} />
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            sehat<span style={{ color: '#1EC8A5' }}>iku</span>
          </div>
        </div>

        {/* Panel body */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 34, lineHeight: 1.2, fontWeight: 800, color: '#fff', letterSpacing: '-0.8px', margin: '0 0 16px' }}>
            {panelTitle}
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: 'rgba(255,255,255,0.78)', margin: '0 0 28px', maxWidth: 380 }}>
            {panelDesc}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{ width: 24, height: 24, borderRadius: 7, background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7AC943" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'relative', zIndex: 1, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
          © 2026 Sehatiku — Mitra Prolanis BPJS Kesehatan
        </div>
      </div>

      {/* ── RIGHT: Form panel ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, background: '#fff' }}>
        <div style={{ width: '100%', maxWidth: 390 }}>
          {/* Back button */}
          <button
            id="btn-kembali-beranda"
            onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#94A3B8', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginBottom: 26, padding: 0, fontFamily: 'inherit' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#475569' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Kembali ke beranda
          </button>

          {/* Role toggle */}
          <div style={{ display: 'flex', gap: 4, background: '#F0F5FA', border: '1px solid #E2EAF2', borderRadius: 11, padding: 4, marginBottom: 22 }}>
            {([
              { r: 'faskes' as const, label: 'Faskes', icon: (col: string) => (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" />
                </svg>
              )},
              { r: 'dokter' as const, label: 'Dokter', icon: (col: string) => (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              )},
            ]).map(({ r, label, icon }) => {
              const active = role === r
              const colActive = r === 'faskes' ? '#5B6BF0' : '#1EC8A5'
              const col = active ? colActive : '#94A3B8'
              return (
                <button
                  key={r}
                  id={`btn-role-${r}`}
                  onClick={() => setRole(r)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    padding: '10px', border: 'none', borderRadius: 8,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.15s',
                    background: active ? '#fff' : 'transparent',
                    color: col,
                    boxShadow: active ? '0 1px 4px rgba(15,36,68,0.12)' : 'none',
                  }}
                >
                  {icon(col)}
                  {label}
                </button>
              )
            })}
          </div>

          {/* Title */}
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0F2444', letterSpacing: '-0.5px', marginBottom: 6 }}>{formTitle}</div>
          <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 28 }}>{formSub}</div>

          {/* Email field */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {inputLabel}
            </label>
            <input
              id="input-email"
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={inputPh}
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2EAF2', borderRadius: 10, fontSize: 14, color: '#0F2444', background: '#FAFCFF', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = focusColor; e.target.style.boxShadow = `0 0 0 3px ${focusShadow}` }}
              onBlur={e => { e.target.style.borderColor = '#E2EAF2'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Password field */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Kata Sandi
            </label>
            <input
              id="input-pass"
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2EAF2', borderRadius: 10, fontSize: 14, color: '#0F2444', background: '#FAFCFF', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = focusColor; e.target.style.boxShadow = `0 0 0 3px ${focusShadow}` }}
              onBlur={e => { e.target.style.borderColor = '#E2EAF2'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Remember me + forgot */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                style={{ width: 15, height: 15, accentColor: accentBg, margin: 0 }}
              />
              <span style={{ fontSize: 12, color: '#64748B' }}>Ingat saya</span>
            </label>
            <span
              style={{ fontSize: 12, fontWeight: 600, color: accentBg, cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.75' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            >
              Lupa sandi?
            </span>
          </div>

          {/* Submit */}
          <button
            id="btn-submit-login"
            onClick={() => onLoginSuccess(role)}
            style={{
              width: '100%', background: accentBg, color: '#fff', border: 'none',
              borderRadius: 11, padding: '14px', fontSize: 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', transition: '0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
              boxShadow: `0 6px 20px ${accentShadow}`,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = accentHover; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = accentBg; e.currentTarget.style.transform = 'none' }}
          >
            Masuk ke Dashboard
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>

          {/* Footer link */}
          <div style={{ textAlign: 'center', marginTop: 22, fontSize: 12, color: '#94A3B8' }}>
            {footerText}
            <span
              style={{ fontWeight: 700, color: accentBg, cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.75' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            >
              {footerLink}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}


/* ─────────────── APP ROOT ─────────────── */
export default function App() {
  const [screen, setScreen] = useState<'landing' | 'login' | 'dashboard' | 'dokter'>('landing')
  const [loginRole, setLoginRole] = useState<'faskes' | 'dokter'>('faskes')

  const openLogin = (role: 'faskes' | 'dokter' = 'faskes') => {
    setLoginRole(role); setScreen('login')
  }

  if (screen === 'dashboard') {
    return <FaskesDashboardPage onLogout={() => setScreen('landing')} />
  }

  if (screen === 'dokter') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#F0F5FA', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ background: '#fff', padding: 40, borderRadius: 20, boxShadow: '0 4px 20px rgba(15,36,68,0.08)', textAlign: 'center', maxWidth: 400 }}>
          <h2 style={{ color: '#0F2444', fontWeight: 800, fontSize: 22, marginBottom: 12 }}>Dashboard Dokter</h2>
          <p style={{ color: '#64748B', fontSize: 14, marginBottom: 24 }}>Selamat datang di Akses Klinis Dokter. Modul ini sedang dikembangkan (Fase FE-2).</p>
          <button
            onClick={() => setScreen('landing')}
            style={{ background: '#14B9A0', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(20,185,160,0.25)' }}
          >
            Keluar ke Beranda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: 'rgb(245,243,255)', minHeight: '100vh', margin: 0 }}>
      <Navbar onLoginClick={() => openLogin('faskes')} />
      <main>
        <HeroSection onLoginClick={() => openLogin('faskes')} />
        <FiturSection />
        <AktorSection onLoginClick={openLogin} />
        <TentangSection />
        <KontakSection onLoginClick={() => openLogin('faskes')} />
      </main>
      <Footer />
      <LoginModal
        isOpen={screen === 'login'}
        onClose={() => setScreen('landing')}
        defaultRole={loginRole}
        onLoginSuccess={(role) => setScreen(role === 'faskes' ? 'dashboard' : 'dokter')}
      />
    </div>
  )
}
