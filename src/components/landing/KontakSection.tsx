import { C } from '../../lib/constants'
import { Arr } from '../ui/Icons'

export default function KontakSection({ onLoginClick }: { onLoginClick: () => void }) {
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
