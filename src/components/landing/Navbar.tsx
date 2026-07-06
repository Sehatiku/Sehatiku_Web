import { useState, useEffect } from 'react'
import { C } from '../../lib/constants'
import { Arr } from '../ui/Icons'

export default function Navbar({ onLoginClick }: { onLoginClick: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <nav style={{
      position: 'fixed', top: scrolled ? 16 : 0, left: '50%',
      transform: 'translateX(-50%)', zIndex: 50,
      width: scrolled ? 'calc(100% - 32px)' : '100%',
      maxWidth: scrolled ? '1120px' : '100%',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      background: scrolled ? 'rgba(255, 255, 255, 0.85)' : 'rgba(245,243,255,0.7)',
      border: scrolled ? '1px solid rgba(99,102,241,0.12)' : '1px solid transparent',
      borderBottom: scrolled ? '1px solid rgba(99,102,241,0.12)' : '1px solid rgb(236,234,248)',
      borderRadius: scrolled ? '20px' : '0px',
      padding: scrolled ? '10px 24px' : '16px 44px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      boxShadow: scrolled ? '0 12px 30px -10px rgba(99,102,241,0.15), 0 2px 8px rgba(99,102,241,0.03)' : 'none',
    }}>
      {/* Brand */}
      <button
        onClick={() => scrollTo('sec-hero')}
        style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <img
          src="/logo_sehatiku_horizontal.png"
          alt="Sehatiku"
          style={{ height: 28, objectFit: 'contain', display: 'block', filter: 'brightness(0) invert(0.2)', transition: 'transform 0.3s ease' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
        />
        <span style={{
          fontSize: 9, fontWeight: 700, color: C.primary,
          background: 'rgb(238,240,254)',
          border: `1px solid rgba(99,102,241,0.16)`,
          padding: '3px 8px', borderRadius: 20,
          textTransform: 'uppercase', letterSpacing: '0.6px',
        }}>Prolanis PTM</span>
      </button>

      {/* Nav */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: scrolled ? 'rgba(99, 102, 241, 0.03)' : 'rgba(255, 255, 255, 0.25)',
        padding: '3px',
        borderRadius: '30px',
        border: '1px solid rgba(99, 102, 241, 0.06)',
        backdropFilter: 'blur(4px)',
        transition: 'all 0.3s ease',
      }}>
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
              fontSize: 13, fontWeight: 600, color: C.navText,
              cursor: 'pointer', padding: '8px 14px', borderRadius: '20px',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = C.primary
              e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = C.navText
              e.currentTarget.style.background = 'transparent'
            }}
          >
            {item.label}
          </button>
        ))}
        <button
          id="btn-masuk-navbar"
          onClick={onLoginClick}
          className="btn-sheen"
          style={{
            display: 'flex', alignItems: 'center', gap: 6, marginLeft: 10,
            background: 'linear-gradient(135deg, #5B6BF0 0%, #7C5CF6 100%)', color: '#fff', border: 'none',
            borderRadius: '20px', padding: '9px 18px', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 4px 12px rgba(91, 107, 240, 0.25)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)'
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(91, 107, 240, 0.35)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'none'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(91, 107, 240, 0.25)'
          }}
        >
          Masuk <Arr sz={14} col="white" />
        </button>
      </div>
    </nav>
  )
}
