import { useState } from 'react'
import './index.css'
import { AuthProvider, useAuth } from './auth/AuthContext'
import FaskesDashboardPage from './pages/faskes/FaskesDashboardPage'
import Navbar from './components/landing/Navbar'
import HeroSection from './components/landing/HeroSection'
import FiturSection from './components/landing/FiturSection'
import AktorSection from './components/landing/AktorSection'
import TentangSection from './components/landing/TentangSection'
import KontakSection from './components/landing/KontakSection'
import Footer from './components/landing/Footer'
import LoginPage from './pages/auth/LoginPage'

function AppInner() {
  const { user, logout } = useAuth()
  const [screen, setScreen] = useState<'landing' | 'login'>('landing')
  const [loginRole, setLoginRole] = useState<'faskes' | 'dokter'>('faskes')

  const openLogin = (role: 'faskes' | 'dokter' = 'faskes') => {
    setLoginRole(role)
    setScreen('login')
  }

  const handleLogout = async () => {
    await logout()
    setScreen('landing')
  }

  // ── Authenticated screens ──
  if (user?.actor_type === 'faskes') {
    return <FaskesDashboardPage onLogout={handleLogout} />
  }

  if (user?.actor_type === 'nakes') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#F0F5FA', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ background: '#fff', padding: 40, borderRadius: 20, boxShadow: '0 4px 20px rgba(15,36,68,0.08)', textAlign: 'center', maxWidth: 400 }}>
          <h2 style={{ color: '#0F2444', fontWeight: 800, fontSize: 22, marginBottom: 12 }}>Dashboard Dokter</h2>
          <p style={{ color: '#64748B', fontSize: 14, marginBottom: 8 }}>
            Selamat datang, <strong>{user.name}</strong>.
          </p>
          <p style={{ color: '#64748B', fontSize: 14, marginBottom: 24 }}>Modul Dokter sedang dikembangkan (Fase FE-2).</p>
          <button
            onClick={handleLogout}
            style={{ background: '#14B9A0', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(20,185,160,0.25)' }}
          >
            Keluar
          </button>
        </div>
      </div>
    )
  }

  // ── Landing / Login ──
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
      <LoginPage
        isOpen={screen === 'login'}
        onClose={() => setScreen('landing')}
        defaultRole={loginRole}
        onLoginSuccess={() => {
          // user state in AuthContext is already set by loginFaskes/loginNakes;
          // closing the modal lets the render above re-evaluate user.actor_type
          setScreen('landing')
        }}
      />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
