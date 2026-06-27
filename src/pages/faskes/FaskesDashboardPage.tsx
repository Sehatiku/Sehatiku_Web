import { useState } from 'react'
import { LogoImg } from '../../components/ui/Icons'

interface Doctor {
  id: number
  name: string
  specialty: string
  tags: string[]
  available: boolean
  sip: string
  phone: string
}

interface Patient {
  id: number
  name: string
  disease: string
  healthScore: number
  status: string
  cause: string
  age: number
}

interface Nakes {
  id: number
  name: string
  role: string
}

interface EscalationAlert {
  id: number
  patient: string
  disease: string
  healthScore: number
  trigger: string
  time: string
  sent: string
}

export default function FaskesDashboardPage({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'pendaftaran' | 'operasional' | 'eskalasi' | 'dokter'>('operasional')
  
  // Toast State
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastTimer, setToastTimer] = useState<any | null>(null)

  const showToastMsg = (msg: string) => {
    if (toastTimer) clearTimeout(toastTimer)
    setToastMsg(msg)
    setShowToast(true)
    const timer = setTimeout(() => {
      setShowToast(false)
    }, 4200)
    setToastTimer(timer)
  }

  // Phase Pendaftaran States
  const [patientName, setPatientName] = useState('')
  const [patientNik, setPatientNik] = useState('')
  const [patientDob, setPatientDob] = useState('')
  const [whatsappCheck, setWhatsappCheck] = useState(false)
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null)
  const [doctorFilter, setDoctorFilter] = useState<'all' | 'dm' | 'htn' | 'umum'>('all')

  // Phase Registrasi Dokter States
  const [newDrName, setNewDrName] = useState('')
  const [newDrNik, setNewDrNik] = useState('')
  const [newDrDob, setNewDrDob] = useState('')
  const [newDrSip, setNewDrSip] = useState('')
  const [newDrSpecialty, setNewDrSpecialty] = useState('Penyakit Dalam')
  const [newDrPhone, setNewDrPhone] = useState('')
  const [registeredDoctors, setRegisteredDoctors] = useState<Doctor[]>([
    { id: 1, name: 'Dr. Andi Wijaya, Sp.PD', specialty: 'Penyakit Dalam', tags: ['dm', 'htn'], available: true, sip: 'SIP/001/DKK/2022', phone: '0812-3456-7890' },
    { id: 2, name: 'Dr. Budi Santoso, Sp.JP', specialty: 'Kardiologi', tags: ['htn'], available: true, sip: 'SIP/002/DKK/2022', phone: '0813-2345-6789' },
    { id: 3, name: 'Dr. Citra Lestari', specialty: 'Dokter Umum', tags: ['dm', 'htn', 'umum'], available: true, sip: 'SIP/003/DKK/2023', phone: '0814-3456-7891' },
    { id: 4, name: 'Dr. Hendra Susanto, Sp.N', specialty: 'Neurologi', tags: ['htn'], available: false, sip: 'SIP/004/DKK/2021', phone: '0815-4567-8901' },
    { id: 5, name: 'Dr. Maya Putri, Sp.GK', specialty: 'Gizi Klinik', tags: ['dm'], available: true, sip: 'SIP/005/DKK/2023', phone: '0816-5678-9012' },
    { id: 6, name: 'Dr. Reza Firmansyah, Sp.PD', specialty: 'Penyakit Dalam', tags: ['dm', 'htn'], available: true, sip: 'SIP/006/DKK/2022', phone: '0817-6789-0123' },
  ])

  // Phase Operasional States
  const [patients, setPatients] = useState<Patient[]>([
    { id: 1, name: 'Ahmad Suharto', disease: 'Diabetes', healthScore: 8, status: 'Parah', cause: 'HbA1c Tinggi', age: 58 },
    { id: 2, name: 'Siti Rahayu', disease: 'Hipertensi', healthScore: 13, status: 'Parah', cause: 'Asupan Natrium Tinggi', age: 62 },
    { id: 3, name: 'Budi Santoso', disease: 'Diabetes', healthScore: 45, status: 'Waswas', cause: 'Kurang Tidur', age: 45 },
    { id: 4, name: 'Dewi Lestari', disease: 'Hipertensi', healthScore: 52, status: 'Waswas', cause: 'BMI Tinggi', age: 53 },
    { id: 5, name: 'Rini Handayani', disease: 'Diabetes', healthScore: 62, status: 'Waswas', cause: 'Gula Darah Tidak Stabil', age: 49 },
    { id: 6, name: 'Hasan Basri', disease: 'Hipertensi', healthScore: 72, status: 'Sehat', cause: 'Tekanan Darah Terkontrol', age: 67 },
    { id: 7, name: 'Nurul Fadilah', disease: 'Diabetes', healthScore: 78, status: 'Sehat', cause: 'Pola Makan Baik', age: 41 },
    { id: 8, name: 'Agus Permadi', disease: 'Hipertensi', healthScore: 88, status: 'Sehat', cause: 'Aktivitas Fisik Rutin', age: 55 },
  ])
  const [nakesList, setNakesList] = useState<Nakes[]>([
    { id: 1, name: 'Dr. Andi Wijaya, Sp.PD', role: 'Dokter Spesialis' },
    { id: 2, name: 'Ns. Sari Dewi', role: 'Perawat' },
    { id: 3, name: 'Dr. Budi Prasetyo', role: 'Dokter Umum' },
  ])
  const [showAddNakes, setShowAddNakes] = useState(false)
  const [newNakesName, setNewNakesName] = useState('')
  const [newNakesRole, setNewNakesRole] = useState('Dokter Umum')

  // Modals States
  const [showBaselineModal, setShowBaselineModal] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [progressPatientId, setProgressPatientId] = useState<number | null>(null)

  // Phase Eskalasi States
  const [followedUpIds, setFollowedUpIds] = useState<number[]>([])
  const [showPushAlert, setShowPushAlert] = useState(true)
  const [escalationAlerts] = useState<EscalationAlert[]>([
    { id: 1, patient: 'Ahmad Suharto', disease: 'Diabetes', healthScore: 8, trigger: 'HbA1c: 10.2% — Melewati Batas Kritis', time: '08:42 WIB', sent: 'WA + SMS terkirim' },
    { id: 2, patient: 'Siti Rahayu', disease: 'Hipertensi', healthScore: 13, trigger: 'Tekanan Darah: 175/110 mmHg — Krisis Hipertensi', time: '09:15 WIB', sent: 'WA + SMS terkirim' },
    { id: 3, patient: 'Budi Santoso', disease: 'Diabetes', healthScore: 45, trigger: 'Gula Darah Puasa: 285 mg/dL — Di Atas Normal', time: '10:30 WIB', sent: 'WA terkirim' },
  ])

  // Helper functions
  const getInitials = (name: string) => {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  }

  const getHealthColor = (score: number) => {
    if (score >= 70) return '#00B894' // Sehat (Green)
    if (score >= 40) return '#4FC3F7' // Waswas (Blue)
    return '#7B61FF' // Parah (Purple)
  }

  const getHealthShadow = (score: number) => {
    if (score >= 70) return 'rgba(0,184,148,0.28)'
    if (score >= 40) return 'rgba(79,195,247,0.28)'
    return 'rgba(123,97,255,0.28)'
  }

  const getHealthTier = (score: number) => {
    if (score >= 70) return 'Tinggi (Sehat)'
    if (score >= 40) return 'Sedang (Waswas)'
    return 'Rendah (Parah)'
  }

  const getStatusStyle = (st: string) => {
    if (st === 'Parah') return { color: '#7B61FF', bg: 'rgba(123,97,255,0.1)' }
    if (st === 'Waswas') return { color: '#0288A0', bg: 'rgba(79,195,247,0.15)' }
    return { color: '#00B894', bg: 'rgba(0,184,148,0.1)' } // Sehat
  }

  // Onboarding OCR
  const handleOcrPatient = () => {
    setPatientName('Ahmad Suharto')
    setPatientNik('3271012305680003')
    setPatientDob('1968-05-23')
    showToastMsg('✓ OCR Berhasil! Data pasien terisi otomatis dari scan KTP.')
  }

  const handleSubmitPatient = () => {
    if (!selectedDoctorId) {
      showToastMsg('⚠️ Harap pilih dokter penanggung jawab terlebih dahulu.')
      return
    }
    const doc = registeredDoctors.find(d => d.id === selectedDoctorId)
    const msg = whatsappCheck
      ? 'Notifikasi login berhasil dikirim ke WhatsApp Pasien/Wali dan ' + (doc ? doc.name : 'Dokter') + '!'
      : 'Pasien berhasil didaftarkan dengan dokter PJ: ' + (doc ? doc.name : '') + '!'
    
    // Add to patient list locally
    const newPatient: Patient = {
      id: Date.now(),
      name: patientName || 'Ahmad Suharto',
      disease: 'Diabetes',
      healthScore: 78,
      status: 'Sehat',
      cause: 'HbA1c Tinggi (Baseline Baru)',
      age: 58
    }
    setPatients(prev => [newPatient, ...prev])
    showToastMsg(msg)
    setPatientName('')
    setPatientNik('')
    setPatientDob('')
    setSelectedDoctorId(null)
    setWhatsappCheck(false)
  }

  // Doctor OCR
  const handleOcrDoctor = () => {
    setNewDrName('Dr. Fajar Nugroho, Sp.PD')
    setNewDrNik('3271098712850001')
    setNewDrDob('1985-12-07')
    setNewDrSip('SIP/009/DKK/2024')
    setNewDrPhone('0818-7890-1234')
    showToastMsg('✓ OCR Berhasil! Data dokter terisi otomatis dari scan KTP.')
  }

  const handleSubmitDoctor = () => {
    if (!newDrName.trim()) { showToastMsg('⚠️ Nama dokter wajib diisi.'); return; }
    if (!newDrSip.trim())  { showToastMsg('⚠️ Nomor SIP wajib diisi.'); return; }
    
    const tagMap: Record<string, string[]> = {
      'Penyakit Dalam': ['dm', 'htn'],
      'Kardiologi': ['htn'],
      'Dokter Umum': ['dm', 'htn', 'umum'],
      'Neurologi': ['htn'],
      'Gizi Klinik': ['dm'],
      'Endokrinologi': ['dm'],
      'Nefrologi': ['dm', 'htn'],
      'Perawat': ['dm', 'htn', 'umum'],
      'Bidan': ['umum'],
    }

    const newDoc: Doctor = {
      id: Date.now(),
      name: newDrName,
      specialty: newDrSpecialty,
      tags: tagMap[newDrSpecialty] || ['umum'],
      available: true,
      sip: newDrSip,
      phone: newDrPhone || '—',
    }

    setRegisteredDoctors(prev => [...prev, newDoc])
    showToastMsg(`✓ ${newDrName} berhasil didaftarkan ke sistem Sehatiku!`)
    setNewDrName('')
    setNewDrNik('')
    setNewDrDob('')
    setNewDrSip('')
    setNewDrPhone('')
  }

  const handleAddNakes = () => {
    if (!newNakesName.trim()) return
    const item: Nakes = { id: Date.now(), name: newNakesName, role: newNakesRole }
    setNakesList(prev => [...prev, item])
    setNewNakesName('')
    setShowAddNakes(false)
    showToastMsg(`${newNakesName} berhasil ditambahkan sebagai nakes!`)
  }

  const handleRemoveNakes = (id: number, name: string) => {
    setNakesList(prev => prev.filter(x => x.id !== id))
    showToastMsg(`Akun ${name} berhasil dihapus dari sistem.`)
  }

  const toggleDoctorAvail = (id: number, name: string, current: boolean) => {
    setRegisteredDoctors(prev => prev.map(d => d.id === id ? { ...d, available: !d.available } : d))
    showToastMsg(`${name} ${current ? 'dinonaktifkan.' : 'diaktifkan kembali.'}`)
  }

  const handleRemoveDoctor = (id: number, name: string) => {
    setRegisteredDoctors(prev => prev.filter(d => d.id !== id))
    showToastMsg(`Akun ${name} dihapus dari sistem.`)
  }

  // Modals helpers
  const selectedPatient = patients.find(p => p.id === selectedPatientId)
  const selectedPatientName = selectedPatient ? selectedPatient.name : ''
  const progressPatient = patients.find(p => p.id === progressPatientId)

  // Title selector based on active tab
  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'pendaftaran': return 'Fase Pendaftaran — Registrasi Pasien'
      case 'operasional': return 'Fase Operasional — Dashboard Monitoring'
      case 'eskalasi': return 'Notifikasi & Eskalasi Klinis'
      case 'dokter': return 'Registrasi Dokter & Nakes'
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif', background: '#F0F5FA' }}>
      
      {/* ── SIDEBAR ── */}
      <div style={{ width: 256, minWidth: 256, background: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0, borderRight: '1px solid #E2EAF2', boxShadow: '1px 0 8px rgba(15,36,68,0.05)' }}>
        
        {/* Logo */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid #F0F5FA' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <LogoImg size={34} />
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#0F2444', letterSpacing: '-0.4px', lineHeight: 1 }}>
                sehat<span style={{ color: '#895CF6' }}>iku</span>
              </div>
              <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: 1 }}>Admin Faskes</div>
            </div>
          </div>
        </div>

        {/* Faskes Badge */}
        <div style={{ margin: '12px 14px 0', background: 'linear-gradient(135deg,#EEF5FF,#E8EDFF)', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(21,101,216,0.12)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div className="anim-blink" style={{ width: 7, height: 7, borderRadius: '50%', background: '#00B894' }}></div>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#00B894', textTransform: 'uppercase', letterSpacing: '0.7px' }}>Mitra Prolanis Aktif</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0F2444', lineHeight: 1.3 }}>RS Umum Sejahtera</div>
          <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 1 }}>Kode: RSU-TBB-2024-007</div>
        </div>

        {/* Nav Menu */}
        <div style={{ padding: '16px 18px 6px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '1px' }}>Menu Utama</div>
        </div>

        {/* Nav Items */}
        <div style={{ padding: '0 10px', flex: 1 }}>
          <div
            onClick={() => setActiveTab('pendaftaran')}
            style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 3, transition: 'all 0.15s',
              background: activeTab === 'pendaftaran' ? '#EEF5FF' : 'transparent',
              borderLeft: `3px solid ${activeTab === 'pendaftaran' ? '#1565D8' : 'transparent'}`,
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'pendaftaran' ? '#1565D8' : '#64748B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: activeTab === 'pendaftaran' ? '#1565D8' : '#64748B', flex: 1 }}>Fase Pendaftaran</span>
          </div>

          <div
            onClick={() => setActiveTab('operasional')}
            style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 3, transition: 'all 0.15s',
              background: activeTab === 'operasional' ? '#EEF5FF' : 'transparent',
              borderLeft: `3px solid ${activeTab === 'operasional' ? '#1565D8' : 'transparent'}`,
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'operasional' ? '#1565D8' : '#64748B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: activeTab === 'operasional' ? '#1565D8' : '#64748B', flex: 1 }}>Fase Operasional</span>
          </div>

          <div
            onClick={() => setActiveTab('eskalasi')}
            style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 3, transition: 'all 0.15s',
              background: activeTab === 'eskalasi' ? '#EEF5FF' : 'transparent',
              borderLeft: `3px solid ${activeTab === 'eskalasi' ? '#1565D8' : 'transparent'}`,
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'eskalasi' ? '#1565D8' : '#64748B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: activeTab === 'eskalasi' ? '#1565D8' : '#64748B', flex: 1 }}>Notifikasi &amp; Eskalasi</span>
            <span style={{ background: '#7B61FF', color: '#fff', fontSize: 9, fontWeight: 800, minWidth: 18, height: 18, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>3</span>
          </div>

          <div
            onClick={() => setActiveTab('dokter')}
            style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 3, transition: 'all 0.15s',
              background: activeTab === 'dokter' ? '#EEF5FF' : 'transparent',
              borderLeft: `3px solid ${activeTab === 'dokter' ? '#1565D8' : 'transparent'}`,
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={activeTab === 'dokter' ? '#1565D8' : '#64748B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /><circle cx="12" cy="7" r="2" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: activeTab === 'dokter' ? '#1565D8' : '#64748B', flex: 1 }}>Registrasi Dokter</span>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #F0F5FA', margin: '12px 4px' }}></div>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 4px', marginBottom: 6 }}>Ringkasan</div>

          {/* Stat pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '0 2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', background: '#F8FAFD', borderRadius: 8, border: '1px solid #F0F5FA' }}>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>Total Pasien</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1565D8' }}>{patients.length}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', background: '#FDF5FF', borderRadius: 8, border: '1px solid rgba(123,97,255,0.1)' }}>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>Risiko Bahaya</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#7B61FF' }}>2</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', background: '#F0FDF8', borderRadius: 8, border: '1px solid rgba(0,184,148,0.12)' }}>
              <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>Status Aman</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#00B894' }}>3</span>
            </div>
          </div>
        </div>

        {/* Profile Card / Logout */}
        <div style={{ padding: '14px 14px', borderTop: '1px solid #F0F5FA' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: '#F8FAFD', borderRadius: 10, border: '1px solid #F0F5FA' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#1565D8,#4FC3F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>AD</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0F2444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Anisa Dewanti, SKM</div>
              <div style={{ fontSize: 10, color: '#94A3B8' }}>Admin Faskes</div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00B894', flexShrink: 0 }}></div>
          </div>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        
        {/* Top Header Bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #E2EAF2', padding: '0 24px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, boxShadow: '0 1px 6px rgba(15,36,68,0.04)' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F2444' }}>{getHeaderTitle()}</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>Platform Sehatiku — Prolanis PTM · 24 Juni 2026</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EEF5FF', border: '1px solid rgba(21,101,216,0.18)', borderRadius: 8, padding: '6px 12px' }}>
              <div className="anim-blink" style={{ width: 7, height: 7, borderRadius: '50%', background: '#1565D8' }}></div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#1565D8' }}>Mode: Faskes</span>
            </div>
            
            <div
              onClick={() => setActiveTab('eskalasi')}
              style={{ position: 'relative', width: 38, height: 38, background: '#F0F5FA', border: '1px solid #E2EAF2', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#7B61FF', color: '#fff', fontSize: 9, fontWeight: 800, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
            </div>

            <button
              onClick={onLogout}
              title="Keluar"
              style={{ width: 38, height: 38, background: '#F0F5FA', border: '1px solid #E2EAF2', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderStyle: 'none' }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── SCROLLABLE TAB CONTENTS ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px', background: '#F0F5FA' }}>
          
          {/* TAB 1: PENDAFTARAN */}
          {activeTab === 'pendaftaran' && (
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
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 1.6 }}>Terdaftar sebagai Mitra Prolanis resmi BPJS Kesehatan. Status: <strong style={{ color: '#1EC8A5' }}>AKTIF</strong> · {patients.length} pasien Prolanis terdaftar · Kode Faskes: RSU-TBB-2024-007</div>
                </div>
                <div style={{ display: 'flex', gap: 12, position: 'relative', zIndex: 1, flexShrink: 0 }}>
                  <div style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10, padding: '10px 18px', textAlign: 'center' }}>
                    <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{patients.length}</div>
                    <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: 600, marginTop: 2 }}>Pasien</div>
                  </div>
                  <div style={{ background: 'rgba(122,201,67,0.2)', border: '1px solid rgba(122,201,67,0.35)', borderRadius: 10, padding: '10px 18px', textAlign: 'center' }}>
                    <div style={{ color: '#7AC943', fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{nakesList.length}</div>
                    <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: 600, marginTop: 2 }}>Nakes</div>
                  </div>
                </div>
              </div>

              {/* Form Input + Doctor Selection Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                
                {/* Form Pasien Baru */}
                <div style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #E8EEF4' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F2444' }}>Data Pasien Baru</div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Input peserta Prolanis baru</div>
                    </div>
                    <button
                      onClick={handleOcrPatient}
                      style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#EEF5FF', border: '1.5px dashed #1565D8', borderRadius: 9, padding: '8px 14px', cursor: 'pointer', color: '#1565D8', fontSize: 12, fontWeight: 600 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1565D8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 7H5v3M16 7h3v3M8 17H5v-3M16 17h3v-3" />
                      </svg>
                      Scan KTP (OCR)
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nama Lengkap</label>
                      <input
                        type="text" value={patientName} onChange={e => setPatientName(e.target.value)}
                        placeholder="Nama sesuai KTP..."
                        style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #E2EAF2', borderRadius: 9, fontSize: 13, color: '#0F2444', background: '#FAFCFF', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>NIK</label>
                      <input
                        type="text" value={patientNik} onChange={e => setPatientNik(e.target.value)}
                        placeholder="16 digit NIK KTP"
                        style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #E2EAF2', borderRadius: 9, fontSize: 13, color: '#0F2444', background: '#FAFCFF', outline: 'none', fontFamily: 'monospace', letterSpacing: '1.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tanggal Lahir</label>
                      <input
                        type="date" value={patientDob} onChange={e => setPatientDob(e.target.value)}
                        style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #E2EAF2', borderRadius: 9, fontSize: 13, color: '#0F2444', background: '#FAFCFF', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Pilih Dokter PJ */}
                <div style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #E8EEF4', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F2444' }}>Pilih Dokter Penanggung Jawab</div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Pilih berdasarkan spesialisasi yang sesuai</div>
                    </div>
                    {selectedDoctorId && (
                      <span style={{ background: '#F0FDF8', color: '#00B894', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(0,184,148,0.2)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00B894" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12" /></svg>
                        Terpilih
                      </span>
                    )}
                  </div>

                  {/* Filter Spesialisasi */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {[
                      { id: 'all', label: 'Semua' },
                      { id: 'dm', label: 'Diabetes (DM)' },
                      { id: 'htn', label: 'Hipertensi' },
                      { id: 'umum', label: 'Umum' },
                    ].map(f => (
                      <div
                        key={f.id}
                        onClick={() => setDoctorFilter(f.id as any)}
                        style={{
                          padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                          background: doctorFilter === f.id ? '#1565D8' : '#F0F5FA',
                          color: doctorFilter === f.id ? '#fff' : '#64748B',
                          border: `1px solid ${doctorFilter === f.id ? '#1565D8' : '#E2EAF2'}`,
                        }}
                      >
                        {f.label}
                      </div>
                    ))}
                  </div>

                  {/* Doctor PJ list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 240 }}>
                    {registeredDoctors
                      .filter(d => doctorFilter === 'all' || d.tags.includes(doctorFilter))
                      .map(d => {
                        const isSelected = selectedDoctorId === d.id
                        return (
                          <div
                            key={d.id}
                            onClick={() => {
                              if (d.available) {
                                setSelectedDoctorId(isSelected ? null : d.id)
                              } else {
                                showToastMsg('⚠️ Dokter ini sedang tidak tersedia.')
                              }
                            }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                              border: `1.5px solid ${isSelected ? '#1565D8' : '#E8EEF4'}`,
                              background: isSelected ? '#EEF5FF' : (d.available ? '#FAFCFF' : '#F8FAFC'),
                            }}
                          >
                            <div style={{ width: 38, height: 38, borderRadius: '50%', background: isSelected ? '#1565D8' : '#EEF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: isSelected ? '#fff' : '#1565D8', flexShrink: 0 }}>
                              {getInitials(d.name)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F2444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                              <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>{d.specialty}</div>
                              <div style={{ fontSize: 10, color: d.available ? '#00B894' : '#94A3B8', marginTop: 2, fontWeight: 600 }}>● {d.available ? 'Tersedia' : 'Tidak Tersedia'}</div>
                            </div>
                            {isSelected ? (
                              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#1565D8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 6px rgba(21,101,216,0.3)' }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12" /></svg>
                              </div>
                            ) : (
                              <div style={{ width: 24, height: 24, borderRadius: '50%', border: '1.5px solid #E2EAF2', flexShrink: 0 }} />
                            )}
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>

              {/* Whatsapp notification & submit */}
              <div style={{ background: '#fff', borderRadius: 14, padding: '18px 22px', boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #E8EEF4', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EDFAF6', border: '1px solid rgba(0,184,148,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00B894" strokeWidth="2" strokeLinecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l1.64-1.64a2 2 0 0 1 2.11-.45c.91.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flex: 1 }}>
                  <input
                    type="checkbox" checked={whatsappCheck} onChange={e => setWhatsappCheck(e.target.checked)}
                    style={{ width: 17, height: 17, accentColor: '#00B894', cursor: 'pointer', flexShrink: 0, margin: 0 }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: '600', color: '#0F2444' }}>Kirim Detail Akun Login via WhatsApp</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Pasien, wali, dan dokter menerima notifikasi otomatis berisi credential login platform Sehatiku</div>
                  </div>
                </label>
                <button
                  onClick={handleSubmitPatient}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1565D8', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0, boxShadow: '0 3px 14px rgba(21,101,216,0.3)' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                  Daftarkan Pasien
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: OPERASIONAL */}
          {activeTab === 'operasional' && (
            <div className="anim-fadein">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
                <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #E8EEF4', borderTop: '3px solid #1565D8' }}>
                  <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Total Pasien</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#1565D8', lineHeight: 1, marginBottom: 3 }}>{patients.length}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>Terdaftar Prolanis</div>
                </div>
                <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #E8EEF4', borderTop: '3px solid #7B61FF' }}>
                  <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Kondisi Parah</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#7B61FF', lineHeight: 1, marginBottom: 3 }}>2</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>Perlu Eskalasi</div>
                </div>
                <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #E8EEF4', borderTop: '3px solid #4FC3F7' }}>
                  <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Status Waswas</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#0288A0', lineHeight: 1, marginBottom: 3 }}>3</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>Perlu Pemantauan</div>
                </div>
                <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #E8EEF4', borderTop: '3px solid #00B894' }}>
                  <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Kondisi Sehat</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#00B894', lineHeight: 1, marginBottom: 3 }}>3</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>Kondisi Terkontrol</div>
                </div>
              </div>

              {/* Priority Queue Table */}
              <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #E8EEF4', marginBottom: 18, overflow: 'hidden' }}>
                <div style={{ padding: '16px 22px', borderBottom: '1px solid #F0F5FA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0F2444' }}>Antrian Prioritas Pasien</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Diurutkan otomatis berdasarkan Health Score terendah — tertinggi</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#F0F5FA', border: '1px solid #E2EAF2', borderRadius: 8, padding: '7px 13px' }}>
                    <div className="anim-blink" style={{ width: 7, height: 7, borderRadius: '50%', background: '#1565D8' }}></div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#1565D8' }}>AI Auto-Sorted</span>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        <th style={{ padding: '10px 8px 10px 22px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', width: 54 }}>Rank</th>
                        <th style={{ padding: '10px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pasien</th>
                        <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Penyakit</th>
                        <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', width: 150 }}>Health Score</th>
                        <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                        <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Faktor Penyebab Utama</th>
                        <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((p, i) => {
                        const style = getStatusStyle(p.status)
                        const color = getHealthColor(p.healthScore)
                        const shadow = getHealthShadow(p.healthScore)
                        const tier = getHealthTier(p.healthScore)
                        return (
                          <tr key={p.id} className="qrow" style={{ borderTop: '1px solid #F0F5FA', transition: 'background 0.12s' }}>
                            <td style={{ padding: '13px 8px 13px 22px', textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 8, background: i < 2 ? 'rgba(123,97,255,0.12)' : '#F0F5FA', color: i < 2 ? '#7B61FF' : '#94A3B8', fontSize: 12, fontWeight: 800 }}>{i + 1}</div>
                            </td>
                            <td style={{ padding: '13px 10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: p.healthScore < 40 ? 'rgba(123,97,255,0.1)' : (p.healthScore < 70 ? 'rgba(79,195,247,0.12)' : 'rgba(0,184,148,0.1)'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: color, flexShrink: 0 }}>
                                  {getInitials(p.name)}
                                </div>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0F2444', whiteSpace: 'nowrap' }}>{p.name}</div>
                                  <div style={{ fontSize: 11, color: '#94A3B8' }}>{p.age} tahun</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '13px 14px' }}>
                              <span style={{
                                background: p.disease === 'Diabetes' ? 'rgba(21,101,216,0.08)' : 'rgba(79,195,247,0.12)',
                                color: p.disease === 'Diabetes' ? '#1565D8' : '#0277BD',
                                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap'
                              }}>
                                {p.disease}
                              </span>
                            </td>
                            <td style={{ padding: '13px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 12, background: color, boxShadow: `0 3px 10px ${shadow}`, flexShrink: 0 }}>
                                  <span style={{ color: '#fff', fontSize: 15, fontWeight: 800 }}>{p.healthScore}</span>
                                </div>
                                <div style={{ flex: 1, minWidth: 48 }}>
                                  <div style={{ height: 6, borderRadius: 4, background: '#EEF2F7', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${p.healthScore}%`, borderRadius: 4, background: color }}></div>
                                  </div>
                                  <div style={{ fontSize: 9, color: '#94A3B8', fontWeight: 600, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{tier}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '13px 14px', textAlign: 'center' }}>
                              <span style={{ background: style.bg, color: style.color, fontSize: 11, fontWeight: 700, padding: '4px 13px', borderRadius: 20, whiteSpace: 'nowrap' }}>{p.status}</span>
                            </td>
                            <td style={{ padding: '13px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }}></div>
                                <span style={{ fontSize: 12, color: '#334155' }}>{p.cause}</span>
                              </div>
                            </td>
                            <td style={{ padding: '13px 14px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                                <button
                                  onClick={() => { setProgressPatientId(p.id); setShowProgressModal(true) }}
                                  style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#EEF5FF', border: '1px solid rgba(21,101,216,0.18)', borderRadius: 8, padding: '6px 11px', fontSize: 11, fontWeight: 700, color: '#1565D8', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s', borderStyle: 'solid' }}
                                >
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1565D8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                                  Progress
                                </button>
                                <button
                                  onClick={() => { setSelectedPatientId(p.id); setShowBaselineModal(true) }}
                                  style={{ background: '#F0F5FA', border: '1px solid #E2EAF2', borderRadius: 8, padding: '6px 11px', fontSize: 11, fontWeight: 600, color: '#64748B', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s', borderStyle: 'solid' }}
                                >
                                  Baseline
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 22px', borderTop: '1px solid #F0F5FA', background: '#FCFDFE' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                  <span style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.4 }}>Health Score bersifat <strong style={{ color: '#64748B', fontWeight: 700 }}>indikatif — bukan diagnosis medis</strong>. Keputusan klinis tetap pada penilaian tenaga kesehatan.</span>
                </div>
              </div>

              {/* Nakes Management & Baseline Periodik */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                
                {/* Nakes list */}
                <div style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #E8EEF4' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F2444' }}>Manajemen Nakes</div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Kelola akun dokter &amp; perawat faskes</div>
                    </div>
                    <button
                      onClick={() => setShowAddNakes(!showAddNakes)}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#1565D8', color: '#fff', border: 'none', borderRadius: 9, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: '0 3px 10px rgba(21,101,216,0.28)' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      Tambah
                    </button>
                  </div>

                  {showAddNakes && (
                    <div style={{ background: '#F8FAFC', borderRadius: 10, padding: 14, marginBottom: 14, border: '1.5px dashed #CBD5E1' }}>
                      <input
                        type="text" value={newNakesName} onChange={e => setNewNakesName(e.target.value)}
                        placeholder="Nama nakes baru..."
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2EAF2', borderRadius: 8, fontSize: 13, marginBottom: 8, background: '#fff', color: '#0F2444', outline: 'none' }}
                      />
                      <select
                        value={newNakesRole} onChange={e => setNewNakesRole(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E2EAF2', borderRadius: 8, fontSize: 13, background: '#fff', color: '#0F2444', marginBottom: 10, outline: 'none' }}
                      >
                        <option value="Dokter Umum">Dokter Umum</option>
                        <option value="Dokter Spesialis">Dokter Spesialis</option>
                        <option value="Perawat">Perawat</option>
                        <option value="Bidan">Bidan</option>
                        <option value="Apoteker">Apoteker</option>
                      </select>
                      <button onClick={handleAddNakes} style={{ width: '100%', background: '#00B894', color: '#fff', border: 'none', borderRadius: 8, padding: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 3px 10px rgba(0,184,148,0.25)' }}>Simpan Nakes</button>
                    </div>
                  )}

                  {nakesList.map(n => (
                    <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 0', borderBottom: '1px solid #F0F5FA' }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#EEF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#1565D8', flexShrink: 0 }}>
                        {getInitials(n.name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0F2444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.name}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>{n.role}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                        <span style={{ background: '#F0FDF8', color: '#00B894', fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 10, border: '1px solid rgba(0,184,148,0.15)' }}>Aktif</span>
                        <button onClick={() => handleRemoveNakes(n.id, n.name)} style={{ background: '#FFF5F5', color: '#EF4444', border: '1.5px solid rgba(239,68,68,0.15)', borderRadius: 7, padding: '5px 9px', fontSize: 11, fontWeight: 600, cursor: 'pointer', borderStyle: 'solid' }}>Hapus</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Baseline Klinis Periodik */}
                <div style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #E8EEF4' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F2444', marginBottom: 3 }}>Baseline Klinis Periodik</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 16 }}>Klik "Update Baseline" pada tabel pasien di atas</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <div style={{ background: '#F8F5FF', borderRadius: 10, padding: '11px 13px', border: '1px solid rgba(123,97,255,0.12)' }}>
                      <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, marginBottom: 3 }}>HbA1c</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#7B61FF' }}>10.2%</div>
                      <div style={{ fontSize: 9, color: '#7B61FF', marginTop: 1, fontWeight: 600 }}>Kritis &gt;9%</div>
                    </div>
                    <div style={{ background: '#F0FAFF', borderRadius: 10, padding: '11px 13px', border: '1px solid rgba(79,195,247,0.15)' }}>
                      <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, marginBottom: 3 }}>LDL Kolesterol</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#4FC3F7' }}>145 mg/dL</div>
                      <div style={{ fontSize: 9, color: '#4FC3F7', marginTop: 1, fontWeight: 600 }}>Tinggi &gt;100</div>
                    </div>
                    <div style={{ background: '#F0FDF8', borderRadius: 10, padding: '11px 13px', border: '1px solid rgba(0,184,148,0.12)' }}>
                      <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, marginBottom: 3 }}>eGFR</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#00B894' }}>72 mL/min</div>
                      <div style={{ fontSize: 9, color: '#00B894', marginTop: 1, fontWeight: 600 }}>Normal ≥60</div>
                    </div>
                    <div style={{ background: '#EEF5FF', borderRadius: 10, padding: '11px 13px', border: '1px solid rgba(21,101,216,0.1)' }}>
                      <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, marginBottom: 3 }}>UACR</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#1565D8' }}>42 mg/g</div>
                      <div style={{ fontSize: 9, color: '#1565D8', marginTop: 1, fontWeight: 600 }}>Mikro 30–300</div>
                    </div>
                    <div style={{ background: '#F8F5FF', borderRadius: 10, padding: '11px 13px', border: '1px solid rgba(123,97,255,0.12)' }}>
                      <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, marginBottom: 3 }}>BMI</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#7B61FF' }}>29.3 kg/m²</div>
                      <div style={{ fontSize: 9, color: '#7B61FF', marginTop: 1, fontWeight: 600 }}>Overweight</div>
                    </div>
                    <div style={{ background: '#F8F5FF', borderRadius: 10, padding: '11px 13px', border: '1px solid rgba(123,97,255,0.12)' }}>
                      <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, marginBottom: 3 }}>Tensi Baseline</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#7B61FF' }}>148/92</div>
                      <div style={{ fontSize: 9, color: '#7B61FF', marginTop: 1, fontWeight: 600 }}>Grade 1 HTN</div>
                    </div>
                  </div>
                  <div style={{ background: '#F0FAFF', borderRadius: 10, padding: '11px 13px', border: '1px solid rgba(79,195,247,0.15)' }}>
                    <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, marginBottom: 3 }}>Lingkar Pinggang</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#4FC3F7' }}>94 cm</div>
                    <div style={{ fontSize: 9, color: '#4FC3F7', marginTop: 1, fontWeight: 600 }}>Risiko ≥90cm (L) / ≥80cm (P)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ESKALASI */}
          {activeTab === 'eskalasi' && (
            <div className="anim-fadein">
              {showPushAlert && (
                <div style={{ borderRadius: 14, padding: '22px 24px', marginBottom: 18, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #7F1D1D 0%, #DC2626 100%)', border: '1px solid rgba(220,38,38,0.3)', boxShadow: '0 6px 24px rgba(220,38,38,0.2)' }}>
                  <div style={{ position: 'absolute', top: -40, right: -20, width: 160, height: 160, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 15, position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 50, height: 50, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 24, border: '1px solid rgba(255,255,255,0.3)' }}>🚨</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: 'rgba(254,226,226,0.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: 5 }}>Simulasi Push Alert · WhatsApp &amp; SMS</div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginBottom: 7, lineHeight: 1.3 }}>⚠️ ESKALASI KRITIS: Ahmad Suharto — Health Score 8</div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: 16 }}>Pasien Diabetes melewati ambang batas kesehatan kritis. HbA1c mencapai <strong style={{ color: '#FACC15' }}>10.2%</strong>. Notifikasi WA &amp; SMS otomatis terkirim ke nakes penanggung jawab. <strong style={{ color: '#fff' }}>Tindak lanjut diperlukan segera.</strong></div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button onClick={() => setShowPushAlert(false)} style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', borderStyle: 'solid' }}>Tutup Alert</button>
                        <button
                          onClick={() => {
                            setShowPushAlert(false)
                            setFollowedUpIds(prev => prev.includes(1) ? prev : [...prev, 1])
                            showToastMsg('✓ Tindak lanjut Ahmad Suharto berhasil dicatat!')
                          }}
                          style={{ background: '#FFFFFF', color: '#DC2626', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, boxShadow: '0 4px 14px rgba(255,255,255,0.15)' }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12" /></svg>
                          One-Tap Follow Up
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #E8EEF4', overflow: 'hidden' }}>
                <div style={{ padding: '16px 22px', borderBottom: '1px solid #F0F5FA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0F2444' }}>Log Eskalasi Klinis</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Histori sinyal kritis &amp; status tindak lanjut tenaga kesehatan</div>
                  </div>
                  <div style={{ background: '#FDF5FF', border: '1px solid rgba(123,97,255,0.18)', borderRadius: 8, padding: '6px 13px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#7B61FF' }}>3 Alert Aktif</span>
                  </div>
                </div>

                {escalationAlerts.map(alert => {
                  const isFollowedUp = followedUpIds.includes(alert.id)
                  return (
                    <div key={alert.id} style={{ padding: '18px 22px', borderBottom: '1px solid #F0F5FA', display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 46, height: 46, borderRadius: 12, background: '#FDF5FF', border: '1px solid rgba(123,97,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B61FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#0F2444' }}>{alert.patient}</span>
                          <span style={{ background: '#FDF5FF', color: '#7B61FF', fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, border: '1px solid rgba(123,97,255,0.15)' }}>Health: {alert.healthScore}</span>
                          <span style={{ background: '#EEF5FF', color: '#1565D8', fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20, border: '1px solid rgba(21,101,216,0.12)' }}>{alert.disease}</span>
                        </div>
                        <div style={{ fontSize: 13, color: '#334155', marginBottom: 4, fontWeight: 500 }}>🔴 {alert.trigger}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>{alert.time} · {alert.sent}</div>
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        {isFollowedUp ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F0FDF8', color: '#00B894', borderRadius: 8, padding: '9px 14px', fontSize: 12, fontWeight: 700, border: '1px solid rgba(0,184,148,0.2)', whiteSpace: 'nowrap' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00B894" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12" /></svg>
                            Sudah Ditindak
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setFollowedUpIds(prev => [...prev, alert.id])
                              showToastMsg(`✓ Tindak lanjut ${alert.patient} dicatat. Pasien akan segera dihubungi oleh nakes.`)
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#7B61FF', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 15px', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 3px 10px rgba(123,97,255,0.25)' }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12" /></svg>
                            One-Tap Follow Up
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB 4: REGISTRASI DOKTER */}
          {activeTab === 'dokter' && (
            <div className="anim-fadein">
              <div style={{ background: 'linear-gradient(130deg, #262F8A 0%, #5B6BF0 100%)', borderRadius: 14, padding: '20px 24px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 20px rgba(38,47,138,0.18)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: -20, top: -30, width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
                <div style={{ width: 46, height: 46, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                  <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, marginBottom: 3 }}>Registrasi Dokter &amp; Nakes</div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, lineHeight: 1.5 }}>Daftarkan dokter dan tenaga kesehatan yang berpraktik di faskes ini sebagai pengguna platform Sehatiku</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10, padding: '10px 20px', textAlign: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                  <div style={{ color: '#fff', fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{registeredDoctors.filter(d => d.available).length}</div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: 600, marginTop: 2 }}>Dokter Aktif</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 16 }}>
                
                {/* Form Registrasi */}
                <div style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #E8EEF4', height: 'fit-content' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F2444' }}>Form Registrasi Dokter</div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Input data dokter baru ke sistem</div>
                    </div>
                    <button
                      onClick={handleOcrDoctor}
                      style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#EEF5FF', border: '1.5px dashed #1565D8', borderRadius: 9, padding: '8px 13px', cursor: 'pointer', color: '#1565D8', fontSize: 12, fontWeight: 600 }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1565D8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 7H5v3M16 7h3v3M8 17H5v-3M16 17h3v-3" />
                      </svg>
                      Scan KTP
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nama Lengkap &amp; Gelar</label>
                      <input
                        type="text" value={newDrName} onChange={e => setNewDrName(e.target.value)}
                        placeholder="Dr. Nama Lengkap, Sp.XX"
                        style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #E2EAF2', borderRadius: 9, fontSize: 13, color: '#0F2444', background: '#FAFCFF', outline: 'none' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>NIK</label>
                        <input
                          type="text" value={newDrNik} onChange={e => setNewDrNik(e.target.value)}
                          placeholder="16 digit NIK"
                          style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #E2EAF2', borderRadius: 9, fontSize: 13, color: '#0F2444', background: '#FAFCFF', outline: 'none', fontFamily: 'monospace', letterSpacing: '1px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tanggal Lahir</label>
                        <input
                          type="date" value={newDrDob} onChange={e => setNewDrDob(e.target.value)}
                          style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #E2EAF2', borderRadius: 9, fontSize: 13, color: '#0F2444', background: '#FAFCFF', outline: 'none' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nomor SIP (Surat Izin Praktik)</label>
                      <input
                        type="text" value={newDrSip} onChange={e => setNewDrSip(e.target.value)}
                        placeholder="SIP/123/DKK/2024"
                        style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #E2EAF2', borderRadius: 9, fontSize: 13, color: '#0F2444', background: '#FAFCFF', outline: 'none', fontFamily: 'monospace' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Spesialisasi</label>
                      <select
                        value={newDrSpecialty} onChange={e => setNewDrSpecialty(e.target.value)}
                        style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #E2EAF2', borderRadius: 9, fontSize: 13, color: '#0F2444', background: '#FAFCFF', outline: 'none' }}
                      >
                        <option value="Penyakit Dalam">Sp.PD — Penyakit Dalam</option>
                        <option value="Kardiologi">Sp.JP — Kardiologi &amp; Jantung</option>
                        <option value="Dokter Umum">Dokter Umum</option>
                        <option value="Neurologi">Sp.N — Neurologi</option>
                        <option value="Gizi Klinik">Sp.GK — Gizi Klinik</option>
                        <option value="Endokrinologi">Sp.PD-KEMD — Endokrinologi</option>
                        <option value="Nefrologi">Sp.PD-KGH — Nefrologi</option>
                        <option value="Perawat">Ns. — Perawat</option>
                        <option value="Bidan">Bidan</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nomor WhatsApp (Notifikasi)</label>
                      <input
                        type="text" value={newDrPhone} onChange={e => setNewDrPhone(e.target.value)}
                        placeholder="08xxxxxxxxxx"
                        style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #E2EAF2', borderRadius: 9, fontSize: 13, color: '#0F2444', background: '#FAFCFF', outline: 'none' }}
                      />
                    </div>
                    <button
                      onClick={handleSubmitDoctor}
                      style={{ width: '100%', background: '#1565D8', color: '#fff', border: 'none', borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 14px rgba(21,101,216,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2 }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
                      Daftarkan Dokter ke Sistem
                    </button>
                  </div>
                </div>

                {/* List Dokter Terdaftar */}
                <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(15,36,68,0.06)', border: '1px solid #E8EEF4', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F5FA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F2444' }}>Daftar Dokter Terdaftar</div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Dokter aktif yang dapat dipilih saat mendaftarkan pasien</div>
                    </div>
                  </div>
                  <div style={{ overflowY: 'auto', maxHeight: 520 }}>
                    {registeredDoctors.map(doc => (
                      <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 20px', borderBottom: '1px solid #F0F5FA' }}>
                        <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#EEF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#1565D8', flexShrink: 0 }}>
                          {getInitials(doc.name)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#0F2444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                            <span style={{ background: '#EEF5FF', color: '#1565D8', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>{doc.specialty}</span>
                            <span style={{ fontSize: 10, color: '#94A3B8' }}>SIP: {doc.sip}</span>
                          </div>
                          <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{doc.phone}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <span
                            onClick={() => toggleDoctorAvail(doc.id, doc.name, doc.available)}
                            style={{
                              background: doc.available ? '#F0FDF8' : '#F8FAFC',
                              color: doc.available ? '#00B894' : '#94A3B8',
                              border: `1.5px solid ${doc.available ? 'rgba(0,184,148,0.2)' : '#E2EAF2'}`,
                              fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, cursor: 'pointer', borderStyle: 'solid'
                            }}
                          >
                            {doc.available ? 'Tersedia' : 'Tidak Tersedia'}
                          </span>
                          <button onClick={() => handleRemoveDoctor(doc.id, doc.name)} style={{ background: '#FFF5F5', color: '#EF4444', border: '1.5px solid rgba(239,68,68,0.15)', borderRadius: 7, padding: '6px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', borderStyle: 'solid' }}>Hapus</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── TOAST MESSAGE ── */}
      {showToast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#0F2444', color: '#fff', borderRadius: 12, padding: '14px 18px', fontSize: 13, fontWeight: 500, boxShadow: '0 8px 30px rgba(15,36,68,0.22)', zIndex: 9999, maxWidth: 420, display: 'flex', alignItems: 'flex-start', gap: 11, borderLeft: '4px solid #00B894', animation: 'slideIn 0.3s ease-out', lineHeight: '1.45' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#00B894" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><polyline points="20,6 9,17 4,12" /></svg>
          {toastMsg}
        </div>
      )}

      {/* ── BASELINE MODAL ── */}
      {showBaselineModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,36,68,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out', backdropFilter: 'blur(2px)' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 540, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(15,36,68,0.25)', border: '1px solid #E8EEF4', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0F2444' }}>Update Baseline Klinis</div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>Pasien: <strong style={{ color: '#1565D8' }}>{selectedPatientName}</strong></div>
              </div>
              <button onClick={() => setShowBaselineModal(false)} style={{ background: '#F0F5FA', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: 16 }}>✕</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13, marginBottom: 22 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>HbA1c (%)</label>
                <input type="text" placeholder="e.g. 7.5" style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #E2EAF2', borderRadius: 9, fontSize: 13, color: '#0F2444', background: '#FAFCFF', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>LDL Kolesterol (mg/dL)</label>
                <input type="text" placeholder="e.g. 130" style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #E2EAF2', borderRadius: 9, fontSize: 13, color: '#0F2444', background: '#FAFCFF', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>eGFR (mL/min)</label>
                <input type="text" placeholder="e.g. 75" style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #E2EAF2', borderRadius: 9, fontSize: 13, color: '#0F2444', background: '#FAFCFF', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>UACR (mg/g)</label>
                <input type="text" placeholder="e.g. 30" style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #E2EAF2', borderRadius: 9, fontSize: 13, color: '#0F2444', background: '#FAFCFF', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>BMI (kg/m²)</label>
                <input type="text" placeholder="e.g. 25.0" style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #E2EAF2', borderRadius: 9, fontSize: 13, color: '#0F2444', background: '#FAFCFF', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lingkar Pinggang (cm)</label>
                <input type="text" placeholder="e.g. 90" style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #E2EAF2', borderRadius: 9, fontSize: 13, color: '#0F2444', background: '#FAFCFF', outline: 'none' }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tensi Baseline (mmHg)</label>
                <input type="text" placeholder="e.g. 130/85" style={{ width: '100%', padding: '10px 13px', border: '1.5px solid #E2EAF2', borderRadius: 9, fontSize: 13, color: '#0F2444', background: '#FAFCFF', outline: 'none' }} />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowBaselineModal(false)} style={{ padding: '10px 22px', border: '1.5px solid #E2EAF2', borderRadius: 9, background: '#fff', color: '#64748B', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderStyle: 'solid' }}>Batal</button>
              <button
                onClick={() => {
                  setShowBaselineModal(false)
                  showToastMsg('Data baseline klinis berhasil diperbarui!')
                }}
                style={{ padding: '10px 22px', background: '#1565D8', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 12px rgba(21,101,216,0.25)' }}
              >
                Simpan Baseline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PROGRESS MODAL ── */}
      {showProgressModal && progressPatient && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,36,68,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out', backdropFilter: 'blur(2px)', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 18, width: 620, maxWidth: '95vw', boxShadow: '0 20px 60px rgba(15,36,68,0.25)', border: '1px solid #E8EEF4', maxHeight: '92vh', overflowY: 'auto' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '22px 26px', borderBottom: '1px solid #F0F5FA', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, flexShrink: 0,
                background: progressPatient.disease === 'Diabetes' ? 'rgba(21,101,216,0.08)' : 'rgba(79,195,247,0.12)',
                color: progressPatient.disease === 'Diabetes' ? '#1565D8' : '#0277BD',
              }}>
                {getInitials(progressPatient.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#0F2444', letterSpacing: '-0.3px' }}>{progressPatient.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>{progressPatient.age} tahun</span>
                  <span style={{
                    background: progressPatient.disease === 'Diabetes' ? 'rgba(21,101,216,0.08)' : 'rgba(79,195,247,0.12)',
                    color: progressPatient.disease === 'Diabetes' ? '#1565D8' : '#0277BD',
                    fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20
                  }}>
                    {progressPatient.disease}
                  </span>
                  <span style={{
                    background: getStatusStyle(progressPatient.status).bg,
                    color: getStatusStyle(progressPatient.status).color,
                    fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20
                  }}>
                    {progressPatient.status}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 58, height: 58, borderRadius: 15, background: getHealthColor(progressPatient.healthScore), boxShadow: '0 4px 14px rgba(0,0,0,0.12)', flexShrink: 0 }}>
                <span style={{ color: '#fff', fontSize: 19, fontWeight: 800, lineHeight: 1 }}>{progressPatient.healthScore}</span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 }}>Sehat</span>
              </div>
              
              <button onClick={() => setShowProgressModal(false)} style={{ background: '#F0F5FA', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: 16, flexShrink: 0, marginLeft: 8 }}>✕</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '22px 26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F2444' }}>Tren Health Score</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>6 bulan terakhir</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#F8FAFC', border: '1px solid #EEF2F7', borderRadius: 9, padding: '6px 12px' }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: progressPatient.status === 'Sehat' ? '#00B894' : '#EF4444' }}>
                    {progressPatient.status === 'Sehat' ? '+24' : '-18'}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: progressPatient.status === 'Sehat' ? '#00B894' : '#EF4444' }}>
                    {progressPatient.status === 'Sehat' ? 'Membaik' : 'Memburuk'}
                  </span>
                </div>
              </div>

              {/* Monthly progress bars */}
              <div style={{ background: '#FAFBFE', border: '1px solid #EEF2F7', borderRadius: 13, padding: '18px 16px 12px', marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, height: 130 }}>
                  {(progressPatient.status === 'Sehat'
                    ? [
                        { month: 'Jan', score: 42 },
                        { month: 'Feb', score: 50 },
                        { month: 'Mar', score: 56 },
                        { month: 'Apr', score: 62 },
                        { month: 'Mei', score: 65 },
                        { month: 'Jun', score: progressPatient.healthScore },
                      ]
                    : [
                        { month: 'Jan', score: 42 },
                        { month: 'Feb', score: 38 },
                        { month: 'Mar', score: 30 },
                        { month: 'Apr', score: 22 },
                        { month: 'Mei', score: 15 },
                        { month: 'Jun', score: progressPatient.healthScore },
                      ]
                  ).map((bar, idx) => {
                    const barColor = getHealthColor(bar.score)
                    return (
                      <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', flex: 1, width: '100%' }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: '#475569', marginBottom: 6 }}>{bar.score}</div>
                          <div style={{ width: '100%', maxWidth: 34, height: `${bar.score}%`, background: barColor, borderRadius: '7px 7px 3px 3px' }}></div>
                        </div>
                        <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, marginTop: 8 }}>{bar.month}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Metrics changes list */}
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F2444', marginBottom: 12 }}>Perubahan Indikator Klinis</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
                {[
                  { label: 'HbA1c', value: progressPatient.disease === 'Diabetes' ? '7.4' : '5.8', unit: '%', arrow: '↓', delta: '-1.2', isGood: true },
                  { label: 'Gula Darah / Tensi', value: progressPatient.disease === 'Diabetes' ? '128' : '132/84', unit: progressPatient.disease === 'Diabetes' ? 'mg/dL' : 'mmHg', arrow: '↓', delta: progressPatient.disease === 'Diabetes' ? '-34' : '-18', isGood: true },
                  { label: 'BMI', value: '26.1', unit: 'kg/m²', arrow: '↓', delta: '-1.4', isGood: true },
                  { label: 'eGFR / Natrium', value: progressPatient.disease === 'Diabetes' ? '78' : 'Normal', unit: progressPatient.disease === 'Diabetes' ? 'mL/min' : '', arrow: '↑', delta: progressPatient.disease === 'Diabetes' ? '+4' : '-15%', isGood: true },
                ].map((m, idx) => (
                  <div key={idx} style={{ background: '#fff', border: '1px solid #EEF2F7', borderRadius: 11, padding: '13px 15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>{m.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#0F2444' }}>{m.value} <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8' }}>{m.unit}</span></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: m.isGood ? 'rgba(0,184,148,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: 8, padding: '5px 9px' }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: m.isGood ? '#00B894' : '#EF4444' }}>{m.arrow}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: m.isGood ? '#00B894' : '#EF4444' }}>{m.delta}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Timeline visit */}
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F2444', marginBottom: 14 }}>Riwayat Kunjungan</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { date: '18 Jun 2026', title: 'Kontrol rutin — membaik', note: `Health Score meningkat signifikan sejak pendaftaran. Terapi dilanjutkan.`, color: '#00B894' },
                  { date: '20 Mei 2026', title: 'Update baseline klinis', note: 'Hasil laboratorium menunjukkan perbaikan parameter klinis.', color: '#1565D8' },
                  { date: '15 Apr 2026', title: 'Edukasi gizi & aktivitas', note: 'Konsultasi dengan ahli gizi faskes untuk pola makan rendah garam/karbo.', color: '#4FC3F7' },
                ].map((t, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 13 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: 11, height: 11, borderRadius: '50%', background: t.color, border: '2.5px solid #fff', boxShadow: `0 0 0 1.5px ${t.color}` }}></div>
                      <div style={{ width: 2, flex: 1, background: '#EEF2F7', margin: '3px 0' }}></div>
                    </div>
                    <div style={{ paddingBottom: 16 }}>
                      <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, marginBottom: 2 }}>{t.date}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0F2444', marginBottom: 2 }}>{t.title}</div>
                      <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>{t.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
