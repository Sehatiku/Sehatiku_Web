import { useState, useRef } from 'react'
import { faskesApi } from '../../../lib/api'
import type { NakesItem, NakesRole, NakesStatus, NakesDetail, RegisterNakesResult } from '../../../lib/types'
import { initials, formatDate } from '../../../lib/utils'
import NakesDetailDrawer from './NakesDetailDrawer'
import TimePicker from '../../../components/ui/TimePicker'

interface NakesTabProps {
  nakesItems: NakesItem[]
  nakesLoading: boolean
  nakesError: string | null
  refreshNakes: () => void
  showToastMsg: (msg: string) => void
}

export default function NakesTab({
  nakesItems,
  nakesLoading,
  nakesError,
  refreshNakes,
  showToastMsg,
}: NakesTabProps) {
  // Form States
  const [newDrName, setNewDrName] = useState('')
  const [newDrNik, setNewDrNik] = useState('')
  const [newDrAlamat, setNewDrAlamat] = useState('')
  const [newDrPhone, setNewDrPhone] = useState('')
  const [newDrRole, setNewDrRole] = useState<NakesRole>('dokter')
  const [newDrSpecialization, setNewDrSpecialization] = useState('')
  const [newDrUsername, setNewDrUsername] = useState('')
  const [newDrPassword, setNewDrPassword] = useState('')
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)
  
  // Doctor Schedule states
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('14:00')
  
  // Registration result modal state
  const [registerResult, setRegisterResult] = useState<RegisterNakesResult | null>(null)
  
  // OCR & Submission States
  const ocrInputRef = useRef<HTMLInputElement>(null)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [drSubmitted, setDrSubmitted] = useState(false)

  // Status Toggle States
  const [nakesToToggle, setNakesToToggle] = useState<NakesItem | null>(null)
  const [toggleLoading, setToggleLoading] = useState(false)

  // Detail Drawer States
  const [selectedNakes, setSelectedNakes] = useState<NakesDetail | null>(null)
  const [nakesDetailLoading, setNakesDetailLoading] = useState(false)

  const handleSelectNakes = async (id: string) => {
    setSelectedNakes(null)
    setNakesDetailLoading(true)
    try {
      const detail = await faskesApi.getNakesDetail(id)
      setSelectedNakes(detail)
    } catch {
      showToastMsg('⚠️ Gagal memuat detail nakes. Coba lagi.')
    } finally {
      setNakesDetailLoading(false)
    }
  }

  const normalizePhone = (val: string): string => {
    const d = val.replace(/\D/g, '')
    if (!d) return ''
    if (d.startsWith('0')) return '62' + d.slice(1)
    if (!d.startsWith('62')) return '62' + d
    return d
  }

  const formatSelectedDays = (days: string[]): string => {
    if (days.length === 0) return ''
    if (days.length === 7) return 'Setiap Hari'
    
    const DAYS_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
    const indices = days.map(d => DAYS_ORDER.indexOf(d)).sort((a, b) => a - b)
    
    let isConsecutive = true
    for (let i = 1; i < indices.length; i++) {
      if (indices[i] !== indices[i - 1] + 1) {
        isConsecutive = false
        break
      }
    }
    
    if (isConsecutive && indices.length >= 3) {
      return `${DAYS_ORDER[indices[0]]} - ${DAYS_ORDER[indices[indices.length - 1]]}`
    }
    
    return days.join(', ')
  }

  // Computed Validation
  const drPhoneDigits = newDrPhone.replace(/\D/g, '')
  const drValidation = {
    name: !newDrName.trim() ? 'Nama wajib diisi' : '',
    nik: !/^\d{16}$/.test(newDrNik) ? 'NIK harus 16 digit angka' : '',
    alamat: !newDrAlamat.trim() ? 'Alamat wajib diisi' : '',
    phone: !/^62\d{8,12}$/.test(drPhoneDigits) ? 'Harus diawali 62 (contoh: 628123456789)' : '',
    username: newDrUsername.trim().length < 4 ? 'Username minimal 4 karakter' : '',
    password: newDrPassword.length < 8 ? 'Password minimal 8 karakter' : '',
    scheduleDays: newDrRole === 'dokter' && selectedDays.length === 0 ? 'Pilih minimal satu hari praktek' : '',
    scheduleTime: newDrRole === 'dokter' && (!startTime || !endTime || startTime >= endTime) ? 'Jam selesai harus setelah jam mulai' : '',
  }
  const drHasError = Object.values(drValidation).some(Boolean)
  const drErr = (k: keyof typeof drValidation) => drSubmitted ? drValidation[k] : ''

  const handleOcrFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setOcrLoading(true)
    try {
      const result = await faskesApi.ocrKtp(file)
      setNewDrName(result.full_name)
      setNewDrNik(result.nik)
      setNewDrAlamat(result.alamat)
      showToastMsg('✓ OCR Berhasil! Data nakes terisi otomatis dari scan KTP.')
    } catch {
      showToastMsg('⚠️ OCR gagal. Pastikan foto KTP jelas (JPG/PNG, maks 5 MB) dan coba lagi.')
    } finally {
      setOcrLoading(false)
    }
  }

  const handleSubmitDoctor = async () => {
    setDrSubmitted(true)
    setRegisterError(null)
    if (drHasError) return

    setRegisterLoading(true)
    try {
      const res = await faskesApi.registerNakes({
        nik: newDrNik,
        full_name: newDrName.trim(),
        alamat: newDrAlamat.trim(),
        phone_number: drPhoneDigits,
        role: newDrRole,
        username: newDrUsername.trim(),
        password: newDrPassword,
        ...(newDrRole === 'dokter' ? {
          specialization: newDrSpecialization.trim() || 'Dokter Umum',
          schedule: [{
            days: formatSelectedDays(selectedDays),
            time: `${startTime} - ${endTime}`
          }]
        } : {}),
      })
      setRegisterResult(res)
      showToastMsg(`✓ ${newDrName} berhasil didaftarkan ke sistem Sehatiku!`)
      setNewDrName(''); setNewDrNik(''); setNewDrAlamat(''); setNewDrPhone('')
      setNewDrUsername(''); setNewDrPassword(''); setNewDrRole('dokter'); setNewDrSpecialization('')
      setSelectedDays([])
      setStartTime('08:00')
      setEndTime('14:00')
      setDrSubmitted(false)
      refreshNakes()
    } catch (err: unknown) {
      const apiErr = err as { status?: number; body?: { message?: string } }
      if (apiErr.status === 409) {
        setRegisterError('NIK atau username sudah terdaftar di sistem.')
      } else {
        setRegisterError(apiErr.body?.message ?? 'Terjadi kesalahan server. Coba lagi.')
      }
    } finally {
      setRegisterLoading(false)
    }
  }

  const handleToggleNakesStatus = async () => {
    if (!nakesToToggle) return
    const newStatus: NakesStatus = nakesToToggle.status === 'active' ? 'inactive' : 'active'
    setToggleLoading(true)
    try {
      await faskesApi.updateNakesStatus(nakesToToggle.nakes_id, newStatus)
      showToastMsg(`✓ Status ${nakesToToggle.full_name} berhasil diubah ke ${newStatus === 'active' ? 'Aktif' : 'Nonaktif'}.`)
      setNakesToToggle(null)
      refreshNakes()
    } catch {
      showToastMsg('⚠️ Gagal mengubah status nakes. Coba lagi.')
      setNakesToToggle(null)
    } finally {
      setToggleLoading(false)
    }
  }

  return (
    <div>
      <div className="anim-fadein">
        <div style={{ background: 'linear-gradient(130deg, #262F8A 0%, #5B6BF0 100%)', borderRadius: 14, padding: '20px 24px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 20px rgba(38,47,138,0.18)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ width: 46, height: 46, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, marginBottom: 3 }}>Manajemen Nakes</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, lineHeight: 1.5 }}>Kelola akun dokter &amp; perawat faskes — daftarkan nakes baru atau pantau daftar nakes yang sudah terdaftar</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10, padding: '10px 20px', textAlign: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}>
          <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{nakesItems.filter(d => d.status === 'active').length}</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: 600, marginTop: 2 }}>Nakes Aktif</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 16 }}>

        {/* Form Registrasi */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #DCDFE8', height: 'fit-content' }}>
          {/* Hidden file input for OCR */}
          <input
            ref={ocrInputRef}
            type="file"
            accept="image/jpeg,image/png"
            style={{ display: 'none' }}
            onChange={handleOcrFileChange}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2B2D42' }}>Form Registrasi Nakes</div>
              <div style={{ fontSize: 11, color: '#8A93A1', marginTop: 2 }}>Daftarkan dokter, kader, atau admin baru</div>
            </div>
            <button
              onClick={() => ocrInputRef.current?.click()}
              disabled={ocrLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 7, background: ocrLoading ? '#F4F5F7' : '#EEEFFE', border: '1.5px dashed #5B6BF0', borderRadius: 9, padding: '8px 13px', cursor: ocrLoading ? 'not-allowed' : 'pointer', color: '#5B6BF0', fontSize: 12, fontWeight: 600 }}
            >
              {ocrLoading ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5B6BF0" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5B6BF0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 7H5v3M16 7h3v3M8 17H5v-3M16 17h3v-3" />
                </svg>
              )}
              {ocrLoading ? 'Memproses...' : 'Scan KTP'}
            </button>
          </div>

          {/* Error banner */}
          {registerError && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 13px', marginBottom: 14, fontSize: 12, color: '#DC2626', fontWeight: 500 }}>
              {registerError}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nama Lengkap</label>
              <input
                type="text" value={newDrName} onChange={e => setNewDrName(e.target.value)}
                placeholder="Nama sesuai KTP"
                style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${drErr('name') ? '#EF4444' : '#DCDFE8'}`, borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
              />
              {drErr('name') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{drErr('name')}</div>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>NIK</label>
                <input
                  type="text" value={newDrNik} onChange={e => setNewDrNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="16 digit NIK"
                  maxLength={16}
                  style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${drErr('nik') ? '#EF4444' : '#DCDFE8'}`, borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', fontFamily: 'monospace', letterSpacing: '1px', boxSizing: 'border-box' }}
                />
                {drErr('nik') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{drErr('nik')}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</label>
                <select
                  value={newDrRole}
                  onChange={e => setNewDrRole(e.target.value as NakesRole)}
                  style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #DCDFE8', borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                >
                  <option value="dokter">Dokter</option>
                </select>
              </div>
            </div>
            {newDrRole === 'dokter' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Spesialisasi Dokter</label>
                  <input
                    type="text" value={newDrSpecialization} onChange={e => setNewDrSpecialization(e.target.value)}
                    placeholder="mis. Penyakit Dalam, Jantung, Umum, dll."
                    style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #DCDFE8', borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hari Praktek</label>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 6 }}>
                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(day => {
                      const isSelected = selectedDays.includes(day)
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            setSelectedDays(prev =>
                              prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
                            )
                          }}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 18,
                            border: '1.5px solid',
                            borderColor: isSelected ? '#5B6BF0' : '#DCDFE8',
                            background: isSelected ? '#EEEFFE' : '#F7F8FA',
                            color: isSelected ? '#5B6BF0' : '#636B78',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                  {drErr('scheduleDays') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{drErr('scheduleDays')}</div>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Jam Mulai</label>
                    <TimePicker
                      value={startTime}
                      onChange={setStartTime}
                      error={!!drErr('scheduleTime')}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Jam Selesai</label>
                    <TimePicker
                      value={endTime}
                      onChange={setEndTime}
                      error={!!drErr('scheduleTime')}
                    />
                  </div>
                </div>
                {drErr('scheduleTime') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{drErr('scheduleTime')}</div>}
              </>
            )}
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Alamat Lengkap</label>
              <input
                type="text" value={newDrAlamat} onChange={e => setNewDrAlamat(e.target.value)}
                placeholder="Alamat sesuai KTP (terisi otomatis via OCR)"
                style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${drErr('alamat') ? '#EF4444' : '#DCDFE8'}`, borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
              />
              {drErr('alamat') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{drErr('alamat')}</div>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nomor WhatsApp</label>
              <input
                type="text" value={newDrPhone}
                onChange={e => setNewDrPhone(e.target.value)}
                onBlur={() => setNewDrPhone(normalizePhone(newDrPhone))}
                placeholder="628xxxxxxxxxx (awali dengan 62)"
                style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${drErr('phone') ? '#EF4444' : '#DCDFE8'}`, borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
              />
              {drErr('phone') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{drErr('phone')}</div>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username</label>
                <input
                  type="text" value={newDrUsername} onChange={e => setNewDrUsername(e.target.value)}
                  placeholder="Min 4 karakter"
                  style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${drErr('username') ? '#EF4444' : '#DCDFE8'}`, borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                />
                {drErr('username') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{drErr('username')}</div>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#636B78', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                <input
                  type="password" value={newDrPassword} onChange={e => setNewDrPassword(e.target.value)}
                  placeholder="Min 8 karakter"
                  style={{ width: '100%', padding: '10px 13px', border: `1.5px solid ${drErr('password') ? '#EF4444' : '#DCDFE8'}`, borderRadius: 9, fontSize: 13, color: '#2B2D42', background: '#F7F8FA', outline: 'none', boxSizing: 'border-box' }}
                />
                {drErr('password') && <div style={{ fontSize: 10, color: '#EF4444', marginTop: 3 }}>{drErr('password')}</div>}
              </div>
            </div>
            <button
              onClick={handleSubmitDoctor}
              disabled={registerLoading}
              style={{ width: '100%', background: registerLoading ? '#A0A9C5' : '#5B6BF0', color: '#fff', border: 'none', borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700, cursor: registerLoading ? 'not-allowed' : 'pointer', boxShadow: registerLoading ? 'none' : '0 3px 14px rgba(91,107,240,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2 }}
            >
              {registerLoading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  Mendaftarkan...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
                  Daftarkan Nakes ke Sistem
                </>
              )}
            </button>
          </div>
        </div>

        {/* List Nakes Terdaftar */}
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #DCDFE8', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#2B2D42' }}>Daftar Nakes Terdaftar</div>
              <div style={{ fontSize: 11, color: '#8A93A1', marginTop: 2 }}>{nakesItems.length} nakes · {nakesItems.filter(n => n.status === 'active').length} aktif</div>
            </div>
            <button
              onClick={refreshNakes}
              disabled={nakesLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F4F5F7', border: '1px solid #DCDFE8', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600, color: '#636B78', cursor: nakesLoading ? 'not-allowed' : 'pointer' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
              Refresh
            </button>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 520 }}>
            {nakesLoading && (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#8A93A1', fontSize: 13 }}>Memuat daftar nakes...</div>
            )}
            {!nakesLoading && nakesError && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 12 }}>{nakesError}</div>
                <button onClick={refreshNakes} style={{ background: '#EEEFFE', color: '#5B6BF0', border: '1px solid rgba(91,107,240,0.18)', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Coba Lagi</button>
              </div>
            )}
            {!nakesLoading && !nakesError && nakesItems.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#8A93A1', fontSize: 13 }}>Belum ada nakes terdaftar. Gunakan form di sebelah kiri untuk mendaftarkan nakes baru.</div>
            )}
            {!nakesLoading && nakesItems.map(doc => {
              const isActive = doc.status === 'active'
              const roleColors: Record<string, { bg: string; color: string }> = {
                dokter: { bg: '#EEEFFE', color: '#5B6BF0' },
                kader: { bg: '#F0FDF8', color: '#059669' },
                admin: { bg: '#FFF7ED', color: '#D97706' },
              }
              const rc = roleColors[doc.role] ?? roleColors.dokter
              return (
                <div key={doc.nakes_id} onClick={() => handleSelectNakes(doc.nakes_id)} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 20px', borderBottom: '1px solid #F4F5F7', opacity: isActive ? 1 : 0.55, cursor: 'pointer' }} onMouseEnter={e => (e.currentTarget.style.background = '#F7F8FF')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: rc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: rc.color, flexShrink: 0 }}>
                    {initials(doc.full_name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#2B2D42', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.full_name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                      <span style={{ ...rc, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, textTransform: 'capitalize' }}>{doc.role}</span>
                      <span style={{ fontSize: 10, color: '#8A93A1' }}>@{doc.username}</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#8A93A1', marginTop: 2 }}>{doc.phone_number} · Terdaftar {formatDate(doc.enrolled_at)}</div>
                  </div>
                  <span style={{
                    flexShrink: 0,
                    background: isActive ? '#F0FDF8' : '#F7F8FA',
                    color: isActive ? '#1EC8A5' : '#8A93A1',
                    border: `1.5px solid ${isActive ? 'rgba(30,200,165,0.2)' : '#DCDFE8'}`,
                    fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  }}>
                    {isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

      </div>
      </div>

      {/* ── NAKES DETAIL DRAWER ── */}
      {(nakesDetailLoading || selectedNakes !== null) && (
        <NakesDetailDrawer
          detail={selectedNakes}
          loading={nakesDetailLoading}
          onClose={() => { setSelectedNakes(null); setNakesDetailLoading(false) }}
          onToggleStatus={nakes => {
            setSelectedNakes(null)
            setNakesDetailLoading(false)
            setNakesToToggle({ ...nakes, role: selectedNakes?.role ?? 'dokter', username: selectedNakes?.username ?? '', phone_number: selectedNakes?.phone_number ?? '', enrolled_at: selectedNakes?.enrolled_at ?? '' })
          }}
        />
      )}

      {/* ── NAKES STATUS TOGGLE CONFIRM MODAL ── */}
      {nakesToToggle && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setNakesToToggle(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(43,45,66,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)', animation: 'fadeIn 0.2s ease-out' }}
        >
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 400, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(15,36,68,0.25)', border: '1px solid #DCDFE8' }}>
            {(() => {
              const isActive = nakesToToggle.status === 'active'
              const accentColor = isActive ? '#DC2626' : '#10B981'
              const accentBg = isActive ? '#FEF2F2' : '#F0FDF8'
              return (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 12, background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {isActive
                          ? <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="18" y1="8" x2="23" y2="13" /><line x1="23" y1="8" x2="18" y2="13" /></>
                          : <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></>
                        }
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#2B2D42' }}>{isActive ? 'Nonaktifkan Nakes?' : 'Aktifkan Kembali Nakes?'}</div>
                      <div style={{ fontSize: 12, color: '#8A93A1', marginTop: 2 }}>{nakesToToggle.full_name}</div>
                    </div>
                  </div>
                  <div style={{ background: '#F7F8FA', borderRadius: 10, padding: '12px 14px', marginBottom: 22, fontSize: 13, color: '#636B78', lineHeight: 1.55 }}>
                    {isActive
                      ? `Nakes ini tidak akan bisa login ke sistem Sehatiku setelah dinonaktifkan. Anda dapat mengaktifkannya kembali kapan saja.`
                      : `Nakes ini akan dapat login kembali ke sistem Sehatiku setelah diaktifkan.`
                    }
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <button
                      onClick={() => setNakesToToggle(null)}
                      disabled={toggleLoading}
                      style={{ padding: '11px 0', background: '#F4F5F7', border: '1px solid #DCDFE8', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#636B78', cursor: toggleLoading ? 'not-allowed' : 'pointer' }}
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleToggleNakesStatus}
                      disabled={toggleLoading}
                      style={{ padding: '11px 0', background: toggleLoading ? '#A0A9C5' : accentColor, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, color: '#fff', cursor: toggleLoading ? 'not-allowed' : 'pointer', boxShadow: toggleLoading ? 'none' : `0 3px 12px ${isActive ? 'rgba(220,38,38,0.28)' : 'rgba(16,185,129,0.28)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
                    >
                      {toggleLoading ? (
                        <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>Memproses...</>
                      ) : (
                        isActive ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'
                      )}
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* ── NAKES REGISTRATION SUCCESS / CREDENTIALS MODAL ── */}
      {registerResult && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setRegisterResult(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(43,45,66,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)', animation: 'fadeIn 0.2s ease-out' }}
        >
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 440, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(15,36,68,0.25)', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%', background: '#25D366',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(37,211,102,0.3)', marginBottom: 16
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#2B2D42' }}>Nakes Berhasil Didaftarkan</h3>
              <p style={{ margin: '6px 0 0', fontSize: 12, color: '#636B78', lineHeight: 1.5 }}>
                Undangan aktivasi &amp; kredensial siap dikirimkan kepada nakes <strong>{registerResult.full_name}</strong>.
              </p>
            </div>

            {/* Credentials Card */}
            <div style={{ background: '#F5F3FF', border: '1.5px solid #DDD6FE', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#2B2D42', fontFamily: 'IBM Plex Mono, monospace' }}>{registerResult.credentials.username}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kata Sandi</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#2B2D42', fontFamily: 'IBM Plex Mono, monospace' }}>{registerResult.credentials.password}</span>
              </div>
            </div>

            {/* WA Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
              {registerResult.wa_warmup.status === 'unavailable' ? (
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 14px', fontSize: 12, color: '#B45309', lineHeight: 1.5, textAlign: 'center' }}>
                  <strong>⚠️ WhatsApp Bot Offline:</strong> Kredensial tidak dapat dikirim otomatis via bot. Sampaikan detail akun di atas secara manual kepada nakes.
                </div>
              ) : (
                <>
                  {registerResult.wa_warmup.nakes_direct_link && (
                    <div>
                      <button
                        onClick={() => window.open(registerResult.wa_warmup.nakes_direct_link, '_blank')}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          background: '#25D366', color: '#fff', border: 'none', borderRadius: 10,
                          padding: '11px 18px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(37,211,102,0.2)', transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#20ba59'}
                        onMouseLeave={e => e.currentTarget.style.background = '#25D366'}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                        Hubungkan WhatsApp Nakes
                      </button>
                      <p style={{ margin: '6px 0 0 4px', fontSize: 11, color: '#8A93A1', lineHeight: 1.45, textAlign: 'center' }}>
                        Membuka chat WhatsApp faskes langsung ke nomor nakes dengan teks undangan aktivasi. Nakes tinggal klik kirim pesan.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            <button
              onClick={() => setRegisterResult(null)}
              style={{
                width: '100%', padding: '11px 0', background: '#F4F5F7', border: '1px solid #DCDFE8',
                borderRadius: 10, fontSize: 14, fontWeight: 700, color: '#636B78', cursor: 'pointer'
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
