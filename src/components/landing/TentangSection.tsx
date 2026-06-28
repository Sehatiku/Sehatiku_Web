import Reveal from './Reveal'

export default function TentangSection() {
  const stats = [
    { val: '75%', desc: 'kematian di Indonesia akibat Penyakit Tidak Menular' },
    { val: 'Rp30,5 T', desc: 'beban pembiayaan diabetes & hipertensi (2024)' },
    { val: '4,8 jt', desc: 'peserta Prolanis aktif di 10.268+ Puskesmas' },
  ]
  return (
    <section id="sec-tentang" style={{
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, rgb(79,70,229) 0%, rgb(99,102,241) 52%, rgb(137,92,246) 100%)',
    }}>
      <div className="aurora-a" style={{ position: 'absolute', top: -80, right: -40, width: 320, height: 320, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
      <div className="aurora-b" style={{ position: 'absolute', bottom: -120, left: -60, width: 340, height: 340, background: 'rgba(20,185,160,0.20)', borderRadius: '50%' }} />
      {/* faint dot texture */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1.4px)', backgroundSize: '26px 26px', WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, #000, transparent 75%)', maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, #000, transparent 75%)' }} />

      <div style={{ position: 'relative', maxWidth: 1000, margin: '0 auto', padding: '80px 44px', textAlign: 'center' }}>
        <Reveal>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '1.6px', marginBottom: 16 }}>
            — Posisi Sehatiku —
          </div>
          <h2 style={{ fontSize: 38, lineHeight: 1.22, fontWeight: 800, color: '#fff', letterSpacing: '-1.2px', margin: '0 0 18px' }}>
            Mengubah <span style={{ color: 'rgb(167,243,228)' }}>29 hari kosong</span> antar kontrol Prolanis menjadi satu sinyal.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.85)', maxWidth: 640, margin: '0 auto 46px' }}>
            Bukan pengganti Prolanis — melainkan lapisan pemantauan harian yang mengisi jendela waktu yang selama ini paling sedikit tersentuh sistem.
          </p>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 130} style={{ height: '100%' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: 16, padding: 26, height: '100%', backdropFilter: 'blur(4px)',
                  transition: 'transform 0.25s cubic-bezier(0.22,1,0.36,1), background 0.25s, border-color 0.25s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.16)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' }}
              >
                <div style={{ fontSize: 34, fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>{s.val}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.8)', marginTop: 6, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
