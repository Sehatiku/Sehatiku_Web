import { useState } from 'react'
import './index.css'
import FaskesDashboardPage from './pages/faskes/FaskesDashboardPage'
import Navbar from './components/landing/Navbar'
import HeroSection from './components/landing/HeroSection'
import FiturSection from './components/landing/FiturSection'
import AktorSection from './components/landing/AktorSection'
import TentangSection from './components/landing/TentangSection'
import KontakSection from './components/landing/KontakSection'
import Footer from './components/landing/Footer'
import LoginPage from './pages/auth/LoginPage'

export default function App() {
  const [screen, setScreen] = useState<'landing' | 'login' | 'dashboard' | 'dokter'>('landing')
  const [loginRole, setLoginRole] = useState<'faskes' | 'dokter'>('faskes')

  const openLogin = (role: 'faskes' | 'dokter' = 'faskes') => {
    setLoginRole(role)
    setScreen('login')
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
      <LoginPage
        isOpen={screen === 'login'}
        onClose={() => setScreen('landing')}
        defaultRole={loginRole}
        onLoginSuccess={(role) => setScreen(role === 'faskes' ? 'dashboard' : 'dokter')}
      />
    </div>
  )
}
