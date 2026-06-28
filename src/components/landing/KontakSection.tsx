import { C } from '../../lib/constants'
import { Arr } from '../ui/Icons'
import Reveal from './Reveal'

export default function KontakSection({ onLoginClick }: { onLoginClick: () => void }) {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  return (
    <section id="sec-kontak" style={{ background: C.white }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '80px 44px' }}>
        <Reveal>
          <div style={{
            position: 'relative', overflow: 'hidden',
            background: 'rgb(245,243,255)', border: `1px solid ${C.cardBorder}`,
            borderRadius: 26, padding: 56, textAlign: 'center',
          }}>
            {/* animated glow accents */}
            <div className="aurora-a" style={{ position: 'absolute', top: -90, right: -50, width: 280, height: 280, background: 'radial-gradient(circle, rgba(99,102,241,0.18), transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div className="aurora-b" style={{ position: 'absolute', bottom: -120, left: -60, width: 300, height: 300, background: 'radial-gradient(circle, rgba(20,185,160,0.15), transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />

            <div style={{ position: 'relative' }}>
              <h2 style={{ fontSize: 34, fontWeight: 800, color: 'rgb(30,36,51)', letterSpacing: '-1px', margin: '0 0 14px' }}>
                Siap melengkapi <span className="text-gradient-anim">Prolanis</span> di faskes Anda?
              </h2>
              <p style={{ fontSize: 16, color: 'rgb(90,102,120)', margin: '0 auto 32px', maxWidth: 520, lineHeight: 1.65 }}>
                Masuk ke dashboard untuk mulai memantau, atau ajukan kemitraan untuk faskes penyelenggara Prolanis Anda.
              </p>
              <div style={{ display: 'flex', gap: 13, alignItems: 'center', justifyContent: 'center' }}>
                <button
                  id="btn-cta-masuk"
                  onClick={onLoginClick}
                  className="btn-sheen"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    background: 'linear-gradient(120deg, #6366F1, #7C5CF6)', color: '#fff', border: 'none',
                    borderRadius: 13, padding: '15px 32px', fontSize: 15, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit', transition: '0.18s',
                    boxShadow: '0 10px 28px rgba(99,102,241,0.32)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 16px 38px rgba(99,102,241,0.42)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(99,102,241,0.32)' }}
                >
                  Masuk ke Dashboard <Arr sz={16} col="white" />
                </button>
                <button
                  id="btn-ajukan-kemitraan"
                  onClick={() => scrollTo('sec-fitur')}
                  style={{
                    background: C.white, color: 'rgb(51,65,85)',
                    border: '1.5px solid rgb(228,226,242)', borderRadius: 13,
                    padding: '15px 28px', fontSize: 15, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit', transition: '0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgb(238,240,254)'; e.currentTarget.style.borderColor = '#ABAEF9' }}
                  onMouseLeave={e => { e.currentTarget.style.background = C.white; e.currentTarget.style.borderColor = 'rgb(228,226,242)' }}
                >
                  Ajukan Kemitraan
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
