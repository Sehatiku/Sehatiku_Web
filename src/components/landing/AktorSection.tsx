import { C } from '../../lib/constants'
import { Arr, IcoCheck, IcoHome, IcoUser } from '../ui/Icons'
import Reveal from './Reveal'

const lift = {
  onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 18px 44px rgba(30,36,51,0.10)' },
  onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(30,36,51,0.05)' },
}

export default function AktorSection({ onLoginClick }: { onLoginClick: (r: 'faskes' | 'dokter') => void }) {
  const faskesItems = [
    'Registrasi pasien & dokter + OCR KTP',
    'Manajemen akun dokter & nakes',
    'Input baseline klinis & overview faskes',
  ]
  const dokterItems = [
    'Antrean prioritas pasien berbasis Health Score',
    'Tren harian gula darah & tensi + atribusi AI',
    'Tindak lanjut & umpan balik model satu ketuk',
  ]
  return (
    <section id="sec-aktor" style={{ background: 'rgb(245,243,255)' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '78px 44px' }}>
        {/* Header */}
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 46 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#895CF6', textTransform: 'uppercase', letterSpacing: '1.6px', marginBottom: 12 }}>
              — Dua Sudut Pandang —
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: 'rgb(30,36,51)', letterSpacing: '-1.2px', margin: 0 }}>
              Satu platform untuk <span className="text-gradient-anim">Faskes &amp; Dokter</span>
            </h2>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
          {/* Faskes */}
          <Reveal delay={80} style={{ height: '100%' }}>
            <div {...lift} style={{
              background: C.white, borderRadius: 20, padding: 34, height: '100%',
              border: `1px solid ${C.cardBorder}`,
              boxShadow: '0 1px 4px rgba(30,36,51,0.05)',
              transition: 'transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s',
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
          </Reveal>

          {/* Dokter */}
          <Reveal delay={200} style={{ height: '100%' }}>
            <div {...lift} style={{
              background: C.white, borderRadius: 20, padding: 34, height: '100%',
              border: `1px solid ${C.cardBorder}`,
              boxShadow: '0 1px 4px rgba(30,36,51,0.05)',
              transition: 'transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s',
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
          </Reveal>
        </div>
      </div>
    </section>
  )
}
