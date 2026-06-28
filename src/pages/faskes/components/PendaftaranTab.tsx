import { useState, useRef } from 'react'
import { faskesApi } from '../../../lib/api'
import type { NakesItem, DiseaseType } from '../../../lib/types'
import { initials } from '../../../lib/utils'

interface PendaftaranTabProps {
  nakesItems: NakesItem[]
  nakesLoading: boolean
  nakesError: string | null
  showToastMsg: (msg: string) => void
}

export default function PendaftaranTab({
  nakesItems,
  nakesLoading,
  nakesError,
  showToastMsg,
}: PendaftaranTabProps) {
  // Phase Pendaftaran States
  const [ptNik, setPtNik] = useState('')
  const [ptName, setPtName] = useState('')
  const [ptDob, setPtDob] = useState('')
  const [ptSex, setPtSex] = useState<'male' | 'female' | ''>('')
  const [ptAlamat, setPtAlamat] = useState('')
  const [ptPhone, setPtPhone] = useState('')
  const [ptCompanionName, setPtCompanionName] = useState('')
  const [ptCompanionPhone, setPtCompanionPhone] = useState('')
  const [ptDiseaseType, setPtDiseaseType] = useState<DiseaseType | ''>('')
  const [ptUsername, setPtUsername] = useState('')
  const [ptPassword, setPtPassword] = useState('')
  const [ptRegisterLoading, setPtRegisterLoading] = useState(false)
  const [ptRegisterError, setPtRegisterError] = useState<string | null>(null)
  const [ptOcrLoading, setPtOcrLoading] = useState(false)
  const ptOcrRef = useRef<HTMLInputElement>(null)
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null)
  const [ptSubmitted, setPtSubmitted] = useState(false)

  const normalizePhone = (val: string): string => {
    const d = val.replace(/\D/g, '')
    if (!d) return ''
    if (d.startsWith('0')) return '62' + d.slice(1)
    if (!d.startsWith('62')) return '62' + d
    return d
  }

  // Computed validation
  const ptPhoneDigits = ptPhone.replace(/\D/g, '')
  const ptCompPhoneDigits = ptCompanionPhone.replace(/\D/g, '')
  const ptValidation = {
    nik: !/^\d{16}$/.test(ptNik) ? 'NIK harus 16 digit angka' : '',
    name: !ptName.trim() ? 'Nama lengkap wajib diisi' : '',
    dob: !ptDob ? 'Tanggal lahir wajib diisi' : '',
    sex: !ptSex ? 'Jenis kelamin wajib dipilih' : '',
    alamat: !ptAlamat.trim() ? 'Alamat wajib diisi' : '',
    phone: !/^62\d{8,12}$/.test(ptPhoneDigits) ? 'Harus diawali 62 (contoh: 628123456789)' : '',
    companionName: !ptCompanionName.trim() ? 'Nama pendamping wajib diisi' : '',
    companionPhone: !/^62\d{8,12}$/.test(ptCompPhoneDigits) ? 'Harus diawali 62 (contoh: 628123456789)' : '',
    diseaseType: !ptDiseaseType ? 'Jenis penyakit wajib dipilih' : '',
    username: ptUsername.trim().length < 4 ? 'Username minimal 4 karakter' : '',
    password: ptPassword.length < 8 ? 'Password minimal 8 karakter' : '',
    assignedNakes: !selectedDoctorId ? 'Nakes penanggung jawab wajib dipilih' : '',
  }
  const ptHasError = Object.values(ptValidation).some(Boolean)
  const ptErr = (k: keyof typeof ptValidation) => ptSubmitted ? ptValidation[k] : ''

  const handlePtOcrFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setPtOcrLoading(true)
    try {
      const result = await faskesApi.ocrKtpPatient(file)
      setPtNik(result.nik)
      setPtName(result.full_name)
      setPtDob(result.date_of_birth)
      setPtSex(result.sex)
      setPtAlamat(result.alamat)
      showToastMsg('✓ OCR Berhasil! Data identitas pasien terisi otomatis dari KTP.')
    } catch {
      showToastMsg('⚠️ OCR gagal. Pastikan foto KTP jelas (JPG/PNG, maks 5 MB) dan coba lagi.')
    } finally {
      setPtOcrLoading(false)
    }
  }

  const resetPtForm = () => {
    setPtNik(''); setPtName(''); setPtDob(''); setPtSex(''); setPtAlamat('')
    setPtPhone(''); setPtCompanionName(''); setPtCompanionPhone('')
    setPtDiseaseType(''); setPtUsername(''); setPtPassword('')
    setPtRegisterError(null); setSelectedDoctorId(null); setPtSubmitted(false)
  }

  const handleSubmitPatient = async () => {
    setPtSubmitted(true)
    setPtRegisterError(null)
    if (ptHasError) return

    setPtRegisterLoading(true)
    try {
      await faskesApi.registerPatient({
        assigned_nakes_id: selectedDoctorId!,
        nik: ptNik,
        full_name: ptName.trim(),
        date_of_birth: ptDob,
        sex: ptSex as 'male' | 'female',
        alamat: ptAlamat.trim(),
        phone_number: ptPhoneDigits,
        companion_name: ptCompanionName.trim(),
        companion_phone: ptCompPhoneDigits,
        disease_type: ptDiseaseType as DiseaseType,
        username: ptUsername.trim(),
        password: ptPassword,
      })
      showToastMsg(`✓ ${ptName} berhasil didaftarkan ke Sehatiku! Kredensial dikirim via WhatsApp.`)
      resetPtForm()
    } catch (err: unknown) {
      const apiErr = err as { status?: number; body?: { message?: string } }
      if (apiErr.status === 409) {
        setPtRegisterError('NIK atau username pasien sudah terdaftar di sistem.')
      } else {
        setPtRegisterError(apiErr.body?.message ?? 'Terjadi kesalahan server. Coba lagi.')
      }
    } finally {
      setPtRegisterLoading(false)
    }
  }

  return (
    <div className="anim-fadein">
      <div style={{ background: 'linear-gradient(130deg, #1A2066 0%, #262F8A 100%)', borderRadius: 14, padding: '20px 24px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 20px rgba(26,32,102,0.18)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ width: 46, height: 46, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22,4 12,14.01 9,11.01" />
          </svg>
        </div>
        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>RS Umum Sejahtera — Akun Faskes Aktif di Sehatiku ✓</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 1.6 }}>Terdaftar sebagai Mitra Prolanis resmi BPJS Kesehatan. Status: <strong style={{ color: '#1EC8A5' }}>AKTIF</strong> · {nakesItems.length} nakes terdaftar</div>
        </div>
        <div style={{ display: 'flex', gap: 12, position: 'relative', zIndex: 1, flexShrink: 0 }}>
          <div style={{ background: 'rgba(30,200,165,0.2)', border: '1px solid rgba(30,200,165,0.35)', borderRadius: 10, padding: '10px 18px', textAlign: 'center' }}>
            <div style={{ color: '#1EC8A5', fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{nakesItems.filter(n => n.status === 'active').length}</div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: 600, marginTop: 2 }}>Nakes Aktif</div>
          </div>
        </div>
      </div>

      {/* Hidden OCR input for patient */}
      <input ref={ptOcrRef} type="file" accept="image/jpeg,image/png" style={{ display: 'none' }} onChange={handlePtOcrFileChange} />

      {/* Error banner */}
      {ptRegisterError && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 14, fontSize: 13, color: '#DC2626', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 9 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          {ptRegisterError}
        </div>
      )}

      {/* Main 2-col: form left, doctor right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, marginBottom: 14 }}>

        {/* LEFT: Full patient form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Card 1: Data Identitas */}
          <div style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #DCDFE8' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EEEFFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5B6BF0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 7H5v3M16 7h3v3M8 17H5v-3M16 17h3v-3" /></svg>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#2B2D42' }}>Data Identitas KTP</div>
                  <div style={{ fontSize: 10, color: '#8A93A1' }}>Terisi otomatis via Scan KTP atau input manual</div>
                </div>
              </div>
              <button
                onClick={() => ptOcrRef.current?.click()}
                disabled={ptOcrLoading}
                style={{ display: 'flex', alignItems: 'center', gap: 7, background: ptOcrLoading ? '#F4F5F7' : '#EEEFFE', border: '1.5px dashed #5B6BF0', borderRadius: 9, padding: '7px 13px', cursor: ptOcrLoading ? 'not-allowed' : 'pointer', color: '#5B6BF0', fontSize: 12, fontWeight: 600 }}
              >
                {ptOcrLoading
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5B6BF0" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>
                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5B6BF0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 7H5v3M16 7h3v3M8 17H5v-3M16 17h3v-3" /></svg>}
                {ptOcrLoading ? 'Memproses...' : 'Scan KTP'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>NIK *</label>
                <input
                  type="text" value={ptNik} onChange={e => setPtNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="16 digit NIK sesuai KTP"
                  maxLength={16}
                  style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${ptErr('nik') ? '#EF4444' : '#DCDFE8'}`, borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '2px', boxSizing: 'border-box' }}
                />
                {ptErr('nik') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{ptErr('nik')}</div>}
                {!ptErr('nik') && ptNik && ptNik.length < 16 && <div style={{ fontSize: 10, color: '#8A93A1', marginTop: 3 }}>{ptNik.length}/16 digit</div>}
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nama Lengkap *</label>
                <input
                  type="text" value={ptName} onChange={e => setPtName(e.target.value)}
                  placeholder="Nama sesuai KTP"
                  style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${ptErr('name') ? '#EF4444' : '#DCDFE8'}`, borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                />
                {ptErr('name') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{ptErr('name')}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tanggal Lahir *</label>
                <input
                  type="date" value={ptDob} onChange={e => setPtDob(e.target.value)}
                  style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${ptErr('dob') ? '#EF4444' : '#DCDFE8'}`, borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                />
                {ptErr('dob') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{ptErr('dob')}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Jenis Kelamin *</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['male', 'female'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setPtSex(s)}
                      style={{ flex: 1, padding: '9px 0', borderRadius: 9, border: `1.5px solid ${ptErr('sex') ? '#EF4444' : (ptSex === s ? '#5B6BF0' : '#DCDFE8')}`, background: ptSex === s ? '#EEEFFE' : '#F7F8FA', color: ptSex === s ? '#5B6BF0' : '#636B78', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                    >
                      {s === 'male' ? '♂ Laki-laki' : '♀ Perempuan'}
                    </button>
                  ))}
                </div>
                {ptErr('sex') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{ptErr('sex')}</div>}
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Alamat Lengkap *</label>
                <input
                  type="text" value={ptAlamat} onChange={e => setPtAlamat(e.target.value)}
                  placeholder="Alamat sesuai KTP (terisi otomatis via OCR)"
                  style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${ptErr('alamat') ? '#EF4444' : '#DCDFE8'}`, borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                />
                {ptErr('alamat') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{ptErr('alamat')}</div>}
              </div>
            </div>
          </div>

          {/* Card 2: Kontak Pasien & Pendamping */}
          <div style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #DCDFE8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EDFAF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1EC8A5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l1.64-1.64a2 2 0 0 1 2.11-.45c.91.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92z" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#2B2D42' }}>Kontak Pasien &amp; Pendamping</div>
                <div style={{ fontSize: 10, color: '#8A93A1' }}>Kredensial login dikirim ke nomor ini via WhatsApp</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>No. WhatsApp Pasien *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel" value={ptPhone}
                    onChange={e => setPtPhone(e.target.value)}
                    onBlur={() => setPtPhone(normalizePhone(ptPhone))}
                    placeholder="628xxxxxxxxxx"
                    style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${ptErr('phone') ? '#EF4444' : '#DCDFE8'}`, borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                {ptErr('phone') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{ptErr('phone')}</div>}
              </div>

              <div style={{ gridColumn: 'span 2', borderTop: '1px dashed #DCDFE8', paddingTop: 12, marginTop: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8A93A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#8A93A1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pendamping / Wali</span>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nama Pendamping *</label>
                <input
                  type="text" value={ptCompanionName} onChange={e => setPtCompanionName(e.target.value)}
                  placeholder="Nama lengkap wali/keluarga"
                  style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${ptErr('companionName') ? '#EF4444' : '#DCDFE8'}`, borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                />
                {ptErr('companionName') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{ptErr('companionName')}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>No. WhatsApp Pendamping *</label>
                <input
                  type="tel" value={ptCompanionPhone}
                  onChange={e => setPtCompanionPhone(e.target.value)}
                  onBlur={() => setPtCompanionPhone(normalizePhone(ptCompanionPhone))}
                  placeholder="628xxxxxxxxxx (awali dengan 62)"
                  style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${ptErr('companionPhone') ? '#EF4444' : '#DCDFE8'}`, borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                />
                {ptErr('companionPhone') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{ptErr('companionPhone')}</div>}
              </div>
            </div>
          </div>

          {/* Card 3: Jenis Penyakit & Akun Login */}
          <div style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #DCDFE8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#636B78" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#2B2D42' }}>Penyakit &amp; Akun Login</div>
                <div style={{ fontSize: 10, color: '#8A93A1' }}>Dipakai pasien untuk masuk ke aplikasi Sehatiku</div>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Jenis Penyakit *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {([
                  { val: 'diabetes_t2', label: 'Diabetes', color: '#5B6BF0', bg: '#EEEFFE', border: 'rgba(91,107,240,0.25)' },
                  { val: 'hypertension', label: 'Hipertensi', color: '#0277BD', bg: 'rgba(79,195,247,0.1)', border: 'rgba(2,119,189,0.25)' },
                  { val: 'both', label: 'Keduanya', color: '#7C3AED', bg: '#F5F3FF', border: 'rgba(124,58,237,0.25)' },
                ] as const).map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => setPtDiseaseType(opt.val)}
                    style={{
                      padding: '11px 8px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
                      border: `1.5px solid ${ptErr('diseaseType') && !ptDiseaseType ? '#EF4444' : (ptDiseaseType === opt.val ? opt.border : '#DCDFE8')}`,
                      background: ptDiseaseType === opt.val ? opt.bg : '#F7F8FA',
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: ptDiseaseType === opt.val ? opt.color : '#636B78' }}>{opt.label}</div>
                  </button>
                ))}
              </div>
              {ptErr('diseaseType') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 5 }}>{ptErr('diseaseType')}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username *</label>
                <input
                  type="text" value={ptUsername} onChange={e => setPtUsername(e.target.value)}
                  placeholder="Min 4 karakter"
                  style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${ptErr('username') ? '#EF4444' : '#DCDFE8'}`, borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                />
                {ptErr('username') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{ptErr('username')}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password *</label>
                <input
                  type="password" value={ptPassword} onChange={e => setPtPassword(e.target.value)}
                  placeholder="Min 8 karakter"
                  style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${ptErr('password') ? '#EF4444' : '#DCDFE8'}`, borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                />
                {ptErr('password') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{ptErr('password')}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Pilih Nakes PJ */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: `1px solid ${ptErr('assignedNakes') ? '#EF4444' : '#DCDFE8'}`, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, alignSelf: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#2B2D42' }}>Nakes Penanggung Jawab <span style={{ color: '#EF4444' }}>*</span></div>
              <div style={{ fontSize: 10, color: '#8A93A1', marginTop: 2 }}>Wajib dipilih — dikirim ke API sebagai <code>assigned_nakes_id</code></div>
            </div>
            {selectedDoctorId && (
              <span style={{ background: '#F0FDF8', color: '#1EC8A5', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, border: '1px solid rgba(30,200,165,0.2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1EC8A5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12" /></svg>
                Terpilih
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 420 }}>
            {nakesLoading && <div style={{ textAlign: 'center', padding: '20px 0', color: '#8A93A1', fontSize: 12 }}>Memuat daftar nakes...</div>}
            {!nakesLoading && nakesError && <div style={{ textAlign: 'center', padding: '16px 0', color: '#EF4444', fontSize: 12 }}>{nakesError}</div>}
            {!nakesLoading && !nakesError && nakesItems.filter(d => d.status === 'active').length === 0 && (
              <div style={{ textAlign: 'center', padding: '16px 0', color: '#8A93A1', fontSize: 12 }}>Belum ada nakes aktif terdaftar.</div>
            )}
            {!nakesLoading && nakesItems.filter(d => d.status === 'active').map(d => {
              const isSelected = selectedDoctorId === d.nakes_id
              return (
                <div
                  key={d.nakes_id}
                  onClick={() => setSelectedDoctorId(isSelected ? null : d.nakes_id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                    border: `1.5px solid ${isSelected ? '#5B6BF0' : '#DCDFE8'}`,
                    background: isSelected ? '#EEEFFE' : '#F7F8FA',
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: isSelected ? '#5B6BF0' : '#EEEFFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: isSelected ? '#fff' : '#5B6BF0', flexShrink: 0 }}>{initials(d.full_name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#2B2D42', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.full_name}</div>
                    <div style={{ fontSize: 10, color: '#636B78', marginTop: 1, textTransform: 'capitalize' }}>{d.role} · <span style={{ color: '#1EC8A5', fontWeight: 600 }}>Aktif</span></div>
                  </div>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: isSelected ? '#5B6BF0' : 'transparent', border: `1.5px solid ${isSelected ? '#5B6BF0' : '#DCDFE8'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: isSelected ? '0 2px 6px rgba(91,107,240,0.3)' : 'none' }}>
                    {isSelected && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12" /></svg>}
                  </div>
                </div>
              )
            })}
          </div>

          {ptErr('assignedNakes') && (
            <div style={{ marginTop: 10, fontSize: 11, color: '#EF4444', fontWeight: 600 }}>{ptErr('assignedNakes')}</div>
          )}
        </div>
      </div>

      {/* Submit bar */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '16px 22px', boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #DCDFE8', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: '#EDFAF6', border: '1px solid rgba(30,200,165,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1EC8A5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l1.64-1.64a2 2 0 0 1 2.11-.45c.91.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92z" /></svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#2B2D42' }}>Notifikasi WhatsApp Otomatis</div>
            <div style={{ fontSize: 11, color: '#8A93A1' }}>Kredensial login dikirim ke nomor pasien &amp; pendamping setelah pendaftaran berhasil</div>
          </div>
        </div>
        <button
          onClick={resetPtForm}
          disabled={ptRegisterLoading}
          style={{ padding: '10px 18px', border: '1.5px solid #DCDFE8', borderRadius: 9, background: '#fff', color: '#636B78', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          Reset Form
        </button>
        <button
          onClick={handleSubmitPatient}
          disabled={ptRegisterLoading}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: ptRegisterLoading ? '#A0A9C5' : '#5B6BF0', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 24px', fontSize: 14, fontWeight: 700, cursor: ptRegisterLoading ? 'not-allowed' : 'pointer', flexShrink: 0, boxShadow: ptRegisterLoading ? 'none' : '0 3px 14px rgba(91,107,240,0.3)' }}
        >
          {ptRegisterLoading
            ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>Mendaftarkan...</>
            : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>Daftarkan Pasien</>}
        </button>
      </div>
    </div>
  )
}
