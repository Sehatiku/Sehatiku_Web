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
        style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <img
          src="/logo_sehatiku_horizontal.png"
          alt="Sehatiku"
          style={{ height: 30, objectFit: 'contain', display: 'block', filter: 'brightness(0) invert(0.2)' }}
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
            className="link-underline"
            style={{
              background: 'none', border: 'none', fontFamily: 'inherit',
              fontSize: 13.5, fontWeight: 600, color: C.navText,
              cursor: 'pointer', padding: '8px 13px', borderRadius: 8, transition: 'color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = C.primary }}
            onMouseLeave={e => { e.currentTarget.style.color = C.navText }}
          >
            {item.label}
          </button>
        ))}
        <button
          id="btn-masuk-navbar"
          onClick={onLoginClick}
          className="btn-sheen"
          style={{
            display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12,
            background: 'linear-gradient(120deg, #6366F1, #7C5CF6)', color: '#fff', border: 'none',
            borderRadius: 11, padding: '10px 20px', fontSize: 13.5, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', transition: '0.18s',
            boxShadow: '0 4px 14px rgba(99,102,241,0.28)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(99,102,241,0.38)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.28)' }}
        >
          Masuk <Arr sz={15} col="white" />
        </button>
      </div>
    </nav>
  )
}
