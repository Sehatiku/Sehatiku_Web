import { useState, useEffect } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { authFaskesApi } from '../../lib/api'
import type { FaskesType } from '../../lib/types'

interface LoginPageProps {
  isOpen: boolean
  onClose: () => void
  defaultRole?: 'faskes' | 'dokter'
  onLoginSuccess: (role: 'faskes' | 'dokter') => void
}

// ─── Regex helpers ─────────────────────────────────────────────────────────────
const PHONE_RE = /^(08|628)\d{8,12}$/

// ─── Styles helpers ───────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '14px 16px', border: '1.5px solid #E4E9F0',
  borderRadius: 12, fontSize: 14.5, color: '#0F2444', background: '#FFFFFF',
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700, color: '#334155',
  marginBottom: 8, letterSpacing: '0.2px',
}

// Tipe faskes — visual picker options
const FASKES_TYPES: { v: FaskesType; label: string; icon: (c: string) => React.ReactNode }[] = [
  {
    v: 'puskesmas', label: 'Puskesmas',
    icon: c => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" />
      </svg>
    ),
  },
  {
    v: 'klinik', label: 'Klinik',
    icon: c => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="3" width="14" height="18" rx="1.5" /><line x1="9" y1="8" x2="9.01" y2="8" /><line x1="15" y1="8" x2="15.01" y2="8" /><line x1="9" y1="12" x2="9.01" y2="12" /><line x1="15" y1="12" x2="15.01" y2="12" /><line x1="10" y1="21" x2="14" y2="21" />
      </svg>
    ),
  },
  {
    v: 'rumah_sakit', label: 'Rumah Sakit',
    icon: c => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginPage({ isOpen, onClose, defaultRole = 'faskes', onLoginSuccess }: LoginPageProps) {
  const { loginFaskes, loginNakes } = useAuth()

  const [role, setRole] = useState<'faskes' | 'dokter'>(defaultRole)
  // 'login' | 'register' — register hanya tersedia untuk faskes
  const [mode, setMode] = useState<'login' | 'register'>('login')

  // Login fields
  const [username, setUsername] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showRegPass, setShowRegPass] = useState(false)
  const [showRegPass2, setShowRegPass2] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  // Register fields (faskes only)
  const [regStep, setRegStep] = useState<1 | 2>(1)
  const [regName, setRegName] = useState('')
  const [regType, setRegType] = useState<FaskesType>('puskesmas')
  const [regAddress, setRegAddress] = useState('')
  const [regRegion, setRegRegion] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState<string | null>(null)
  const [regSuccess, setRegSuccess] = useState(false)

  // Reset on open/role change
  useEffect(() => {
    if (isOpen) {
      setRole(defaultRole)
      setMode('login')
      resetLogin()
      resetRegister()
    }
  }, [isOpen, defaultRole])

  useEffect(() => {
    // Switch to login when changing to dokter
    if (role === 'dokter') setMode('login')
    resetLogin()
    resetRegister()
  }, [role])

  useEffect(() => {
    resetLogin()
    resetRegister()
  }, [mode])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [isOpen, onClose])

  if (!isOpen) return null

  function resetLogin() { setUsername(''); setPass(''); setLoginError(null) }
  function resetRegister() {
    setRegStep(1)
    setRegName(''); setRegType('puskesmas'); setRegAddress(''); setRegRegion('')
    setRegUsername(''); setRegPassword(''); setRegPasswordConfirm(''); setRegPhone('')
    setRegError(null); setRegSuccess(false)
  }

  const isDr = role === 'dokter'
  const isRegister = mode === 'register' && !isDr

  // Accent colors — unified indigo→blue gradient CTA for both roles; solid tone for text/focus
  const accentSolid     = isDr ? '#5B6BF0' : '#0D9488'
  const accentGrad      = 'linear-gradient(120deg, #5B6BF0 0%, #3D48C4 100%)'
  const accentGradHover = 'linear-gradient(120deg, #4F52D8 0%, #333DAB 100%)'
  const accentShadow    = 'rgba(77,72,196,0.32)'
  const focusColor   = accentSolid
  const focusShadow  = isDr ? 'rgba(91,107,240,0.15)' : 'rgba(13,148,136,0.15)'

  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      e.target.style.borderColor = focusColor
      e.target.style.boxShadow = `0 0 0 3px ${focusShadow}`
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      e.target.style.borderColor = '#E2EAF2'
      e.target.style.boxShadow = 'none'
    },
  }

  const EyeButton = ({ shown, onToggle }: { shown: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={shown ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
      style={{
        position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: '#8A93A1',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = focusColor)}
      onMouseLeave={e => (e.currentTarget.style.color = '#8A93A1')}
    >
      {shown ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  )

  // Left panel content
  const panelTitle = isRegister
    ? 'Daftar Faskes Baru'
    : isDr ? 'Dashboard Klinis Dokter' : 'Dashboard Admin Faskes'
  const panelDesc = isRegister
    ? 'Daftarkan klinik atau puskesmas Anda ke platform Sehatiku untuk mulai mengelola program Prolanis pasien.'
    : isDr
    ? 'Pantau antrean prioritas pasien Anda, telaah tren harian & faktor risiko, lalu tindak lanjuti — dalam satu layar klinis.'
    : 'Kelola registrasi pasien & dokter, pantau antrian prioritas berbasis Health Score, dan tanggapi eskalasi klinis — semua dalam satu tempat.'
  const features = isRegister
    ? ['Registrasi gratis, aktif langsung setelah daftar', 'Kelola dokter & pasien Prolanis dalam satu platform', 'Eskalasi otomatis & monitoring real-time via WhatsApp']
    : isDr
    ? ['Antrean prioritas pasien berbasis Health Score', 'Tren harian gula darah & tensi + atribusi AI', 'Tindak lanjut & umpan balik model satu ketuk']
    : ['Registrasi pasien & dokter dengan OCR KTP', 'Antrian prioritas otomatis berbasis Health Score', 'Eskalasi otomatis via WhatsApp & SMS real-time']

  // ── Login handler ─────────────────────────────────────────────────────────

  const handleLogin = async () => {
    if (!username.trim() || !pass.trim()) {
      setLoginError('Username dan kata sandi wajib diisi.')
      return
    }
    setLoginError(null)
    setLoginLoading(true)
    try {
      if (role === 'faskes') {
        await loginFaskes(username.trim(), pass)
        onLoginSuccess('faskes')
      } else {
        await loginNakes(username.trim(), pass)
        onLoginSuccess('dokter')
      }
    } catch (err: unknown) {
      const apiErr = err as { status?: number; body?: { message?: string } }
      if (apiErr.status === 401) setLoginError('Username atau kata sandi salah.')
      else if (apiErr.status === 429) setLoginError('Terlalu banyak percobaan. Coba lagi dalam 15 menit.')
      else setLoginError(apiErr.body?.message ?? 'Terjadi kesalahan server. Coba lagi.')
    } finally {
      setLoginLoading(false)
    }
  }

  // ── Register handler ──────────────────────────────────────────────────────

  // ── Step-1 validation (Info Faskes) ──────────────────────────────────────
  const handleStep1Next = () => {
    setRegError(null)
    if (!regName.trim()) { setRegError('Nama faskes wajib diisi.'); return }
    if (!regRegion.trim()) { setRegError('Kota/wilayah wajib diisi.'); return }
    if (!regAddress.trim()) { setRegError('Alamat lengkap wajib diisi.'); return }
    const phoneClean = regPhone.replace(/[-\s]/g, '')
    if (!PHONE_RE.test(phoneClean)) {
      setRegError('Nomor WhatsApp tidak valid. Contoh: 08123456789 atau 628123456789.')
      return
    }
    setRegStep(2)
  }

  const handleRegister = async () => {
    setRegError(null)
    if (regUsername.length < 4) { setRegError('Username minimal 4 karakter.'); return }
    if (regPassword.length < 8) { setRegError('Password minimal 8 karakter.'); return }
    if (regPassword !== regPasswordConfirm) { setRegError('Password dan konfirmasi tidak cocok.'); return }
    const phoneClean = regPhone.replace(/[-\s]/g, '')

    setRegLoading(true)
    try {
      await authFaskesApi.register({
        name: regName.trim(),
        type: regType,
        address: regAddress.trim(),
        region: regRegion.trim(),
        username: regUsername.trim(),
        password: regPassword,
        phone_number: phoneClean,
      })
      setRegSuccess(true)
    } catch (err: unknown) {
      const apiErr = err as { status?: number; body?: { message?: string } }
      if (apiErr.status === 409) setRegError('Username sudah digunakan faskes lain. Coba username berbeda.')
      else setRegError(apiErr.body?.message ?? 'Terjadi kesalahan server. Coba lagi.')
    } finally {
      setRegLoading(false)
    }
  }

  // Password strength helper
  const pwStrength = (() => {
    if (!regPassword) return null
    let score = 0
    if (regPassword.length >= 8) score++
    if (regPassword.length >= 12) score++
    if (/[A-Z]/.test(regPassword)) score++
    if (/[0-9]/.test(regPassword)) score++
    if (/[^A-Za-z0-9]/.test(regPassword)) score++
    if (score <= 1) return { label: 'Lemah', color: '#EF4444', pct: 25 }
    if (score <= 2) return { label: 'Cukup', color: '#F59E0B', pct: 50 }
    if (score <= 3) return { label: 'Baik', color: '#1EC8A5', pct: 75 }
    return { label: 'Kuat', color: '#10B981', pct: 100 }
  })()

  // ─────────────────────────────────────────────────────────────────────────

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
        background: 'linear-gradient(150deg, #161B57 0%, #232C86 52%, #2D3799 100%)',
        padding: '56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        {/* Mesh glows */}
        <div style={{ position: 'absolute', top: -120, right: -80, width: 340, height: 340, background: 'radial-gradient(circle, rgba(91,107,240,0.55) 0%, rgba(91,107,240,0) 70%)', borderRadius: '50%', filter: 'blur(10px)' }} />
        <div style={{ position: 'absolute', bottom: -140, left: -60, width: 320, height: 320, background: 'radial-gradient(circle, rgba(30,200,165,0.4) 0%, rgba(30,200,165,0) 70%)', borderRadius: '50%', filter: 'blur(8px)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '55%', width: 200, height: 200, background: 'radial-gradient(circle, rgba(122,201,67,0.14) 0%, rgba(122,201,67,0) 70%)', borderRadius: '50%' }} />
        {/* Dot grid texture */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '22px 22px', opacity: 0.6, maskImage: 'linear-gradient(to bottom, black, transparent 80%)', WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 80%)' }} />

        <div style={{ position: 'relative', zIndex: 1, marginBottom: 24 }}>
          <img
            src="/logo_sehatiku_horizontal.png"
            alt="Sehatiku"
            style={{ height: 34, objectFit: 'contain', display: 'block' }}
          />
        </div>

        <div key={`panel-${role}-${isRegister}`} className="anim-fadein" style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 36, lineHeight: 1.15, fontWeight: 800, color: '#fff', letterSpacing: '-0.9px', margin: '0 0 16px' }}>
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

        <div style={{ position: 'relative', zIndex: 1, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
          © 2026 Sehatiku — Mitra Prolanis BPJS Kesehatan
        </div>
      </div>

      {/* ── RIGHT: Form panel ── */}
      <div style={{ display: 'flex', flexDirection: 'column', background: '#fff', overflowY: 'auto' }}>

        {/* Back button — sticky di atas, selalu bisa diklik */}
        <div style={{ padding: '28px 56px 0', flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#94A3B8', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#475569' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Kembali ke beranda
          </button>
        </div>

        {/* Form content — centered, scrollable ketika overflow */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 56px 48px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Role toggle: Faskes / Dokter — sliding pill */}
          <div style={{ position: 'relative', display: 'flex', background: '#EEF2F8', border: '1px solid #E4E9F0', borderRadius: 14, padding: 5, marginBottom: 18 }}>
            {/* sliding thumb */}
            <div style={{
              position: 'absolute', top: 5, bottom: 5, left: 5, width: 'calc(50% - 5px)',
              background: '#fff', borderRadius: 10, boxShadow: '0 2px 10px rgba(15,36,68,0.12)',
              transform: role === 'dokter' ? 'translateX(100%)' : 'translateX(0)',
              transition: 'transform 0.36s cubic-bezier(0.34, 1.4, 0.5, 1)',
            }} />
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
              const colActive = r === 'faskes' ? '#0D9488' : '#5B6BF0'
              const col = active ? colActive : '#94A3B8'
              return (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  style={{
                    position: 'relative', zIndex: 1,
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    padding: '11px', border: 'none', borderRadius: 10,
                    fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'color 0.25s ease',
                    background: 'transparent',
                    color: col,
                  }}
                >
                  {icon(col)}{label}
                </button>
              )
            })}
          </div>

          {/* Mode toggle: Login / Daftar — only for faskes — sliding pill */}
          {!isDr && (
            <div style={{ position: 'relative', display: 'flex', background: '#EEF2F8', border: '1px solid #E4E9F0', borderRadius: 12, padding: 4, marginBottom: 22 }}>
              {/* sliding thumb */}
              <div style={{
                position: 'absolute', top: 4, bottom: 4, left: 4, width: 'calc(50% - 4px)',
                background: 'linear-gradient(120deg, #5B6BF0 0%, #3D48C4 100%)', borderRadius: 9,
                boxShadow: '0 3px 12px rgba(77,72,196,0.34)',
                transform: mode === 'register' ? 'translateX(100%)' : 'translateX(0)',
                transition: 'transform 0.36s cubic-bezier(0.34, 1.4, 0.5, 1)',
              }} />
              {(['login', 'register'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    position: 'relative', zIndex: 1,
                    flex: 1, padding: '10px', border: 'none', borderRadius: 9,
                    fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.25s ease',
                    background: 'transparent',
                    color: mode === m ? '#fff' : '#94A3B8',
                  }}
                >
                  {m === 'login' ? 'Masuk' : 'Daftar Faskes Baru'}
                </button>
              ))}
            </div>
          )}

          {/* ── REGISTER FORM ── */}
          {isRegister && !regSuccess && (
            <div className="anim-fadein">

              {/* ── Step progress bar ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24 }}>
                {(['Info Faskes', 'Kredensial'] as const).map((label, idx) => {
                  const stepNum = idx + 1 as 1 | 2
                  const done = regStep > stepNum
                  const active = regStep === stepNum
                  const stepColor = done || active ? '#1EC8A5' : '#CBD5E1'
                  return (
                    <>
                      <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', border: `2.5px solid ${stepColor}`,
                          background: done ? '#1EC8A5' : active ? 'rgba(30,200,165,0.1)' : '#F8FAFC',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 800, color: done ? '#fff' : active ? '#1EC8A5' : '#94A3B8',
                          transition: 'all 0.2s',
                        }}>
                          {done
                            ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            : stepNum
                          }
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: active ? '#1EC8A5' : done ? '#64748B' : '#94A3B8', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
                      </div>
                      {idx < 1 && (
                        <div style={{ flex: 2, height: 2, background: regStep > 1 ? '#1EC8A5' : '#E2EAF2', borderRadius: 2, marginBottom: 18, transition: 'background 0.3s' }} />
                      )}
                    </>
                  )
                })}
              </div>

              {regError && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '11px 14px', marginBottom: 18 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <div style={{ fontSize: 13, color: '#DC2626', fontWeight: 500, lineHeight: 1.4 }}>{regError}</div>
                </div>
              )}

              {/* ── STEP 1: Info Faskes ── */}
              {regStep === 1 && (
                <div className="anim-fadein">
                  {/* Card: Identitas Faskes */}
                  <div style={{ background: '#F8FBFF', border: '1px solid #E8EEF4', borderRadius: 12, padding: '16px 18px', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(30,200,165,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1EC8A5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" />
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#0F2444' }}>Identitas Faskes</div>
                        <div style={{ fontSize: 10, color: '#94A3B8' }}>Nama dan kategori fasilitas kesehatan</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                      <div>
                        <label style={labelStyle}>Nama Faskes</label>
                        <input type="text" value={regName} onChange={e => setRegName(e.target.value)}
                          placeholder="Puskesmas Sukajadi / RS Sehat Sentosa" style={inputStyle} {...focusHandlers} />
                      </div>
                      <div>
                        <label style={labelStyle}>Tipe Faskes</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                          {FASKES_TYPES.map(t => {
                            const active = regType === t.v
                            return (
                              <button
                                key={t.v}
                                type="button"
                                onClick={() => setRegType(t.v)}
                                style={{
                                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                  padding: '13px 6px', borderRadius: 11, cursor: 'pointer', fontFamily: 'inherit',
                                  border: `1.5px solid ${active ? '#1EC8A5' : '#E2EAF2'}`,
                                  background: active ? 'rgba(30,200,165,0.08)' : '#fff',
                                  color: active ? '#0E9384' : '#64748B',
                                  fontSize: 11.5, fontWeight: 700, transition: 'all 0.18s ease',
                                  boxShadow: active ? '0 3px 12px rgba(30,200,165,0.18)' : 'none',
                                  transform: active ? 'translateY(-1px)' : 'none',
                                }}
                                onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = '#B7E9DE'; e.currentTarget.style.background = '#F7FCFB' } }}
                                onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = '#E2EAF2'; e.currentTarget.style.background = '#fff' } }}
                              >
                                {t.icon(active ? '#1EC8A5' : '#94A3B8')}
                                {t.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Kota / Wilayah</label>
                        <input type="text" value={regRegion} onChange={e => setRegRegion(e.target.value)}
                          placeholder="Bandung" style={inputStyle} {...focusHandlers} />
                      </div>
                    </div>
                  </div>

                  {/* Card: Kontak & Lokasi */}
                  <div style={{ background: '#F8FBFF', border: '1px solid #E8EEF4', borderRadius: 12, padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(21,101,216,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1565D8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#0F2444' }}>Kontak & Lokasi</div>
                        <div style={{ fontSize: 10, color: '#94A3B8' }}>Alamat dan nomor WhatsApp admin faskes</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                      <div>
                        <label style={labelStyle}>Alamat Lengkap</label>
                        <input type="text" value={regAddress} onChange={e => setRegAddress(e.target.value)}
                          placeholder="Jl. Merdeka No. 10, Kel. Sukajadi" style={inputStyle} {...focusHandlers} />
                      </div>
                      <div>
                        <label style={labelStyle}>Nomor WhatsApp Admin</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#94A3B8', pointerEvents: 'none' }}>📱</span>
                          <input type="text" value={regPhone} onChange={e => setRegPhone(e.target.value)}
                            placeholder="08123456789 atau 628123456789"
                            style={{ ...inputStyle, paddingLeft: 32 }} {...focusHandlers} />
                        </div>
                        {regPhone && !PHONE_RE.test(regPhone.replace(/[-\s]/g, '')) && (
                          <div style={{ fontSize: 11, color: '#F59E0B', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            Format: 08xx, 628xx (10–14 digit angka)
                          </div>
                        )}
                        {regPhone && PHONE_RE.test(regPhone.replace(/[-\s]/g, '')) && (
                          <div style={{ fontSize: 11, color: '#10B981', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                            Nomor valid
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleStep1Next}
                    style={{
                      width: '100%', marginTop: 18,
                      background: '#1EC8A5', color: '#fff', border: 'none',
                      borderRadius: 11, padding: '13px', fontSize: 14, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'inherit', transition: '0.15s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      boxShadow: '0 6px 20px rgba(30,200,165,0.28)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#17b093'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#1EC8A5'; e.currentTarget.style.transform = 'none' }}
                  >
                    Lanjut ke Kredensial
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              )}

              {/* ── STEP 2: Kredensial Login ── */}
              {regStep === 2 && (
                <div className="anim-fadein">
                  {/* Summary faskes */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(30,200,165,0.06)', border: '1px solid rgba(30,200,165,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(30,200,165,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1EC8A5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0F2444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{regName}</div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>{regType === 'puskesmas' ? 'Puskesmas' : 'Klinik'} · {regRegion}</div>
                    </div>
                    <button
                      onClick={() => { setRegStep(1); setRegError(null) }}
                      style={{ background: 'none', border: 'none', color: '#1EC8A5', fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: 0, flexShrink: 0 }}
                    >
                      Edit
                    </button>
                  </div>

                  {/* Card: Kredensial */}
                  <div style={{ background: '#F8FBFF', border: '1px solid #E8EEF4', borderRadius: 12, padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(91,107,240,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5B6BF0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#0F2444' }}>Kredensial Login</div>
                        <div style={{ fontSize: 10, color: '#94A3B8' }}>Username & password untuk masuk ke dashboard</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={labelStyle}>Username</label>
                        <input type="text" value={regUsername} onChange={e => setRegUsername(e.target.value)}
                          placeholder="Min. 4 karakter, unik" style={inputStyle} {...focusHandlers}
                          autoComplete="off" />
                        {regUsername && regUsername.length < 4 && (
                          <div style={{ fontSize: 11, color: '#F59E0B', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            Minimal 4 karakter
                          </div>
                        )}
                      </div>
                      <div>
                        <label style={labelStyle}>Password</label>
                        <div style={{ position: 'relative' }}>
                          <input type={showRegPass ? 'text' : 'password'} value={regPassword} onChange={e => setRegPassword(e.target.value)}
                            placeholder="Min. 8 karakter" style={{ ...inputStyle, paddingRight: 42 }} {...focusHandlers}
                            autoComplete="new-password" />
                          <EyeButton shown={showRegPass} onToggle={() => setShowRegPass(v => !v)} />
                        </div>
                        {/* Password strength bar */}
                        {pwStrength && (
                          <div style={{ marginTop: 7 }}>
                            <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                              {[25, 50, 75, 100].map(t => (
                                <div key={t} style={{ flex: 1, height: 3, borderRadius: 2, background: pwStrength.pct >= t ? pwStrength.color : '#E2EAF2', transition: 'background 0.2s' }} />
                              ))}
                            </div>
                            <div style={{ fontSize: 11, color: pwStrength.color, fontWeight: 600 }}>Kekuatan: {pwStrength.label}</div>
                          </div>
                        )}
                      </div>
                      <div>
                        <label style={labelStyle}>Konfirmasi Password</label>
                        <div style={{ position: 'relative' }}>
                          <input type={showRegPass2 ? 'text' : 'password'} value={regPasswordConfirm} onChange={e => setRegPasswordConfirm(e.target.value)}
                            placeholder="Ulangi password" style={{
                              ...inputStyle, paddingRight: 42,
                              borderColor: regPasswordConfirm && regPassword !== regPasswordConfirm ? '#FCA5A5' : '#E2EAF2',
                            }} {...focusHandlers}
                            autoComplete="new-password" />
                          <EyeButton shown={showRegPass2} onToggle={() => setShowRegPass2(v => !v)} />
                        </div>
                        {regPasswordConfirm && regPassword !== regPasswordConfirm && (
                          <div style={{ fontSize: 11, color: '#EF4444', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="8" y1="8" x2="16" y2="16" /><line x1="16" y1="8" x2="8" y2="16" /></svg>
                            Password tidak cocok
                          </div>
                        )}
                        {regPasswordConfirm && regPassword === regPasswordConfirm && (
                          <div style={{ fontSize: 11, color: '#10B981', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                            Password cocok
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, marginTop: 18 }}>
                    <button
                      onClick={() => { setRegStep(1); setRegError(null) }}
                      style={{
                        background: '#F0F5FA', color: '#64748B', border: '1px solid #E2EAF2',
                        borderRadius: 11, padding: '13px', fontSize: 14, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'inherit', transition: '0.15s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#E8EEF4'}
                      onMouseLeave={e => e.currentTarget.style.background = '#F0F5FA'}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                      </svg>
                      Kembali
                    </button>
                    <button
                      onClick={handleRegister}
                      disabled={regLoading}
                      style={{
                        background: regLoading ? '#A0A9C5' : '#1EC8A5', color: '#fff', border: 'none',
                        borderRadius: 11, padding: '13px', fontSize: 14, fontWeight: 700,
                        cursor: regLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: '0.15s',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: regLoading ? 'none' : '0 6px 20px rgba(30,200,165,0.28)',
                      }}
                      onMouseEnter={e => { if (!regLoading) { e.currentTarget.style.background = '#17b093'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
                      onMouseLeave={e => { if (!regLoading) { e.currentTarget.style.background = '#1EC8A5'; e.currentTarget.style.transform = 'none' } }}
                    >
                      {regLoading ? (
                        <>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" />
                          </svg>
                          Mendaftarkan...
                        </>
                      ) : (
                        <>
                          Daftarkan Faskes
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── REGISTER SUCCESS ── */}
          {isRegister && regSuccess && (
            <div className="anim-fadein" style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(30,200,165,0.15) 0%, rgba(21,101,216,0.08) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px',
                boxShadow: '0 4px 20px rgba(30,200,165,0.2)',
              }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#1EC8A5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0F2444', marginBottom: 8, letterSpacing: '-0.4px' }}>Faskes Berhasil Didaftarkan!</div>
              <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.65, marginBottom: 24 }}>
                Akun <strong style={{ color: '#0F2444' }}>{regName}</strong> telah aktif.<br />
                Silakan login menggunakan username <strong style={{ color: '#1565D8' }}>@{regUsername}</strong> dan password yang baru dibuat.
              </div>
              {/* Info cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 22, textAlign: 'left' }}>
                {[
                  { icon: '✅', label: 'Akun Aktif', sub: 'Langsung dapat digunakan' },
                  { icon: '🔐', label: 'Kredensial Aman', sub: 'Password terenkripsi' },
                ].map(c => (
                  <div key={c.label} style={{ background: '#F8FBFF', border: '1px solid #E8EEF4', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{c.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0F2444' }}>{c.label}</div>
                    <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{c.sub}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { setMode('login'); setUsername(regUsername) }}
                style={{
                  width: '100%', background: '#1EC8A5', color: '#fff', border: 'none',
                  borderRadius: 11, padding: '14px', fontSize: 15, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 6px 20px rgba(30,200,165,0.28)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#17b093'}
                onMouseLeave={e => e.currentTarget.style.background = '#1EC8A5'}
              >
                Lanjut ke Halaman Login
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {!isRegister && (
            <div key={`login-${role}`} className="anim-fadein">
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0F2444', letterSpacing: '-0.5px', marginBottom: 6 }}>
                {isDr ? 'Masuk sebagai Dokter' : 'Masuk ke Akun Faskes'}
              </div>
              <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 22 }}>
                {isDr
                  ? 'Gunakan kredensial yang dikirim faskes Anda via WhatsApp'
                  : 'Gunakan username dan password faskes Anda'}
              </div>

              {loginError && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#DC2626', fontWeight: 500 }}>
                  {loginError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Username</label>
                  <input
                    type="text" value={username} onChange={e => setUsername(e.target.value)}
                    placeholder={isDr ? 'username dokter Anda' : 'username admin faskes'}
                    autoComplete="username"
                    style={inputStyle} {...focusHandlers}
                    onKeyDown={e => { if (e.key === 'Enter') handleLogin() }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Kata Sandi</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      style={{ ...inputStyle, paddingRight: 42 }} {...focusHandlers}
                      onKeyDown={e => { if (e.key === 'Enter') handleLogin() }}
                    />
                    <EyeButton shown={showPass} onToggle={() => setShowPass(v => !v)} />
                  </div>
                </div>
              </div>

              <div style={{ height: 22 }} />

              <button
                onClick={handleLogin}
                disabled={loginLoading}
                style={{
                  width: '100%', background: loginLoading ? '#A0A9C5' : accentGrad, color: '#fff', border: 'none',
                  borderRadius: 12, padding: '15px', fontSize: 15, fontWeight: 700,
                  cursor: loginLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: '0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                  boxShadow: loginLoading ? 'none' : `0 8px 22px ${accentShadow}`,
                }}
                onMouseEnter={e => { if (!loginLoading) { e.currentTarget.style.background = accentGradHover; e.currentTarget.style.transform = 'translateY(-1px)' } }}
                onMouseLeave={e => { if (!loginLoading) { e.currentTarget.style.background = accentGrad; e.currentTarget.style.transform = 'none' } }}
              >
                {loginLoading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    Masuk ke Dashboard
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>

              {/* Footer contextual */}
              <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#94A3B8' }}>
                {isDr
                  ? 'Akun dokter didaftarkan oleh faskes. '
                  : 'Faskes belum terdaftar? '}
                {isDr ? (
                  <span style={{ fontWeight: 700, color: accentSolid, cursor: 'pointer' }}>Belum terima kredensial?</span>
                ) : (
                  <span
                    style={{ fontWeight: 700, color: accentSolid, cursor: 'pointer' }}
                    onClick={() => setMode('register')}
                  >
                    Daftar sekarang →
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
