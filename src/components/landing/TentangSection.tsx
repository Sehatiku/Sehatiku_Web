export default function TentangSection() {
  const stats = [
    { val: '75%',     desc: 'kematian di Indonesia akibat Penyakit Tidak Menular' },
    { val: 'Rp30,5 T', desc: 'beban pembiayaan diabetes & hipertensi (2024)' },
    { val: '4,8 jt',   desc: 'peserta Prolanis aktif di 10.268+ Puskesmas' },
  ]
  return (
    <section id="sec-tentang" style={{
      position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg, rgb(79,70,229) 0%, rgb(99,102,241) 52%, rgb(137,92,246) 100%)',
    }}>
      <div style={{ position: 'absolute', top: -80, right: -40, width: 300, height: 300, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: -120, left: -60, width: 320, height: 320, background: 'rgba(20,185,160,0.16)', borderRadius: '50%' }} />
      <div style={{ position: 'relative', maxWidth: 1000, margin: '0 auto', padding: '74px 44px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1.4px', marginBottom: 16 }}>
          Posisi Sehatiku
        </div>
        <h2 style={{ fontSize: 36, lineHeight: 1.25, fontWeight: 800, color: '#fff', letterSpacing: '-1px', margin: '0 0 18px' }}>
          Mengubah <span style={{ color: 'rgb(167,243,228)' }}>29 hari kosong</span> antar kontrol Prolanis menjadi satu sinyal.
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.82)', maxWidth: 640, margin: '0 auto 44px' }}>
          Bukan pengganti Prolanis — melainkan lapisan pemantauan harian yang mengisi jendela waktu yang selama ini paling sedikit tersentuh sistem.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 16, padding: 24,
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-1px' }}>{s.val}</div>
              <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.78)', marginTop: 5, lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
