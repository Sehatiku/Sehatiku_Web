import { useState, useEffect } from 'react'
import { LogoImg } from '../../components/ui/Icons'

interface LoginPageProps {
  isOpen: boolean
  onClose: () => void
  defaultRole?: 'faskes' | 'dokter'
  onLoginSuccess: (role: 'faskes' | 'dokter') => void
}

export default function LoginPage({ isOpen, onClose, defaultRole = 'faskes', onLoginSuccess }: LoginPageProps) {
  const [role, setRole] = useState<'faskes' | 'dokter'>(defaultRole)
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [remember, setRemember] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setRole(defaultRole)
      setEmail('')
      setPass('')
    }
  }, [isOpen, defaultRole])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
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
