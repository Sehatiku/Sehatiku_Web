import { LogoImg } from '../ui/Icons'

export default function Footer() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  return (
    <footer style={{ background: 'rgb(30,36,51)', padding: '48px 44px 30px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 30, paddingBottom: 30,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          {/* Brand */}
          <div style={{ maxWidth: 300 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13 }}>
              <LogoImg size={32} />
              <div style={{ fontSize: 19, fontWeight: 800, color: '#fff', letterSpacing: '-0.4px' }}>
                sehat<span style={{ color: 'rgb(167,139,250)' }}>iku</span>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
              Terhubung, Terpantau, Terlindungi. Platform predictive monitoring penyakit kronis, mitra Prolanis BPJS Kesehatan.
            </div>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 64 }}>
            {/* Platform */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>
                Platform
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {[
                  { label: 'Alur Kerja', id: 'sec-fitur' },
                  { label: 'Faskes & Dokter', id: 'sec-aktor' },
                  { label: 'Tentang', id: 'sec-tentang' },
                ].map(link => (
                  <span
                    key={link.id}
                    onClick={() => scrollTo(link.id)}
                    style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: '0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.95)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                  >{link.label}</span>
                ))}
              </div>
            </div>
            {/* Kepatuhan */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14 }}>
                Kepatuhan
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {['Terdaftar PSE Kominfo', 'UU PDP No. 27/2022', 'Bukan Rekam Medis Elektronik'].map(t => (
                  <span key={t} style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingTop: 22 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>© 2026 Sehatiku — Mitra Prolanis BPJS Kesehatan</span>
          <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)' }}>Bukan alat diagnosis medis — pelengkap pemantauan Prolanis.</span>
        </div>
      </div>
    </footer>
  )
}
