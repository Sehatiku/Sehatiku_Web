import { useState, useEffect } from 'react'
import './index.css'
import { AuthProvider, useAuth } from './auth/AuthContext'
import FaskesDashboardPage from './pages/faskes/FaskesDashboardPage'
import DokterDashboardPage from './pages/dokter/DokterDashboardPage'
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
  // Bump to remount the landing so scroll-reveal animations replay
  const [landingKey, setLandingKey] = useState(0)

  useEffect(() => {
    if (user?.actor_type === 'faskes' || user?.actor_type === 'nakes') {
      document.body.classList.add('dashboard-active')
    } else {
      document.body.classList.remove('dashboard-active')
    }
    return () => {
      document.body.classList.remove('dashboard-active')
    }
  }, [user])

  const openLogin = (role: 'faskes' | 'dokter' = 'faskes') => {
    setLoginRole(role)
    setScreen('login')
  }

  // Back to landing: scroll to top + replay entrance animations (like a refresh)
  const closeLogin = () => {
    setScreen('landing')
    setLandingKey(k => k + 1)
    window.scrollTo({ top: 0, behavior: 'auto' })
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
    return <DokterDashboardPage onLogout={handleLogout} />
  }

  // ── Landing / Login ──
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: 'rgb(245,243,255)', minHeight: '100vh', margin: 0 }}>
      <div key={landingKey}>
        <Navbar onLoginClick={() => openLogin('faskes')} />
        <main>
          <HeroSection onLoginClick={() => openLogin('faskes')} />
          <FiturSection />
          <AktorSection onLoginClick={openLogin} />
          <TentangSection />
          <KontakSection onLoginClick={() => openLogin('faskes')} />
        </main>
        <Footer />
      </div>
      <LoginPage
        isOpen={screen === 'login'}
        onClose={closeLogin}
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
