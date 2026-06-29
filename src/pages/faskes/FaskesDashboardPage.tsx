import { useState, useEffect } from 'react'
import { LogoImg } from '../../components/ui/Icons'
import { faskesApi } from '../../lib/api'
import { useAuth } from '../../auth/AuthContext'
import type { NakesItem, FaskesProfile } from '../../lib/types'

// Import modular tab subcomponents
import PendaftaranTab from './components/PendaftaranTab'
import OperasionalTab from './components/OperasionalTab'
import EskalasiTab from './components/EskalasiTab'
import NakesTab from './components/NakesTab'
import PasienTab from './components/PasienTab'

// ── Color tokens (from design palette) ─────────────────────────────────────
const C = {
  indigo: '#5B6BF0',
  indigoDark: '#4558E8',
  teal: '#1EC8A5',
  purple: '#8B5CF6',
  lavender: '#EEF0FF',
  slate: '#2D3748',
  sidebarFrom: '#262F8A',
  sidebarTo: '#1A2066',
}

// ── Helper: format today's date in Indonesian ───────────────────────────────
function todayLabel(): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date())
}

// ── Helper: faskes type label ──────────────────────────────────────────────
function faskesTypeLabel(type: string): string {
  if (type === 'puskesmas') return 'Puskesmas'
  if (type === 'klinik') return 'Klinik'
  if (type === 'rumah_sakit') return 'RS'
  return type
}

export default function FaskesDashboardPage({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'pendaftaran' | 'operasional' | 'eskalasi' | 'dokter' | 'pasien'>('operasional')

  // Toast State
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')
  const [toastTimer, setToastTimer] = useState<any | null>(null)

  const showToastMsg = (msg: string, type?: 'success' | 'error' | 'info') => {
    if (toastTimer) clearTimeout(toastTimer)
    
    let finalType: 'success' | 'error' | 'info' = type ?? 'success'
    if (!type) {
      if (msg.includes('⚠️') || msg.toLowerCase().includes('gagal') || msg.toLowerCase().includes('error')) {
        finalType = 'error'
      } else if (msg.toLowerCase().includes('info') || msg.toLowerCase().includes('detail')) {
        finalType = 'info'
      }
    }
    
    setToastType(finalType)
    setToastMsg(msg)
    setShowToast(true)
    const timer = setTimeout(() => { setShowToast(false) }, 4200)
    setToastTimer(timer)
  }

  // ── Nakes list ─────────────────────────────────────────────────────────────
  const [nakesItems, setNakesItems] = useState<NakesItem[]>([])
  const [nakesLoading, setNakesLoading] = useState(true)
  const [nakesError, setNakesError] = useState<string | null>(null)

  useEffect(() => {
    faskesApi.getNakes()
      .then(data => { setNakesItems(data); setNakesLoading(false) })
      .catch(() => { setNakesError('Gagal memuat daftar nakes.'); setNakesLoading(false) })
  }, [])

  const refreshNakes = () => {
    setNakesLoading(true)
    setNakesError(null)
    faskesApi.getNakes()
      .then(data => { setNakesItems(data); setNakesLoading(false) })
      .catch(() => { setNakesError('Gagal memuat daftar nakes.'); setNakesLoading(false) })
  }

  // ── Faskes Profile (real API) ───────────────────────────────────────────────
  const [profile, setProfile] = useState<FaskesProfile | null>(null)

  useEffect(() => {
    faskesApi.getProfile()
      .then(data => setProfile(data))
      .catch(() => { /* silently fallback to user.name */ })
  }, [])

  const faskesName = profile?.name ?? user?.name ?? 'Faskes'
  const faskesCode = profile ? `${faskesTypeLabel(profile.type).toUpperCase().slice(0, 3)}-${profile.faskes_id.slice(-8).toUpperCase()}` : '—'

  // Modal States
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // ── Tab meta ───────────────────────────────────────────────────────────────
  const TAB_META: Record<string, { title: string; subtitle: string; icon: React.ReactNode }> = {
    pendaftaran: {
      title: 'Fase Pendaftaran',
      subtitle: 'Registrasi pasien & tenaga kesehatan baru',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
        </svg>
      ),
    },
    operasional: {
      title: 'Dashboard Monitoring',
      subtitle: 'Ringkasan status pasien Prolanis hari ini',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    eskalasi: {
      title: 'Notifikasi & Eskalasi Klinis',
      subtitle: 'Pantau alert risiko & tindak lanjut darurat',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
    dokter: {
      title: 'Manajemen Nakes',
      subtitle: 'Kelola dokter, kader & status aktif/nonaktif',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    pasien: {
      title: 'Daftar Pasien',
      subtitle: 'Semua pasien Prolanis terdaftar di faskes ini',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
    },
  }

  const currentTab = TAB_META[activeTab]

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif', background: '#F0F1FE' }}>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: 248,
        minWidth: 248,
        background: `linear-gradient(180deg, ${C.sidebarFrom} 0%, ${C.sidebarTo} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        boxShadow: '4px 0 24px rgba(26, 32, 102, 0.18)',
        color: '#ffffff',
        position: 'relative',
        zIndex: 10,
      }}>

        {/* Logo */}
        <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LogoImg size={32} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px', lineHeight: 1 }}>
                sehat<span style={{ color: C.teal }}>iku</span>
              </div>
              <div style={{ fontSize: 8.5, color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginTop: 2 }}>Admin Faskes</div>
            </div>
          </div>
        </div>

        {/* Faskes Badge — populated from real API */}
        <div style={{
          margin: '10px 14px 0',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 10,
          padding: '8px 12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div className="anim-blink" style={{ width: 6, height: 6, borderRadius: '50%', background: C.teal }} />
            <span style={{ fontSize: 8.5, fontWeight: 800, color: C.teal, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Mitra Prolanis Aktif</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', lineHeight: 1.3 }}>{faskesName}</div>
          <div style={{ fontSize: 9.5, color: 'rgba(255, 255, 255, 0.45)', marginTop: 1, fontFamily: 'monospace' }}>
            {profile ? `Kode: ${faskesCode}` : 'Memuat profil...'}
          </div>
        </div>

        {/* Nav Menu Header */}
        <div style={{ padding: '12px 18px 4px' }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255, 255, 255, 0.35)', textTransform: 'uppercase', letterSpacing: '1px' }}>Menu Utama</div>
        </div>

        {/* Nav Items */}
        <div style={{ padding: '0 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {[
            { id: 'pendaftaran', label: 'Fase Pendaftaran', icon: TAB_META.pendaftaran.icon },
            { id: 'operasional', label: 'Fase Operasional', icon: TAB_META.operasional.icon },
            { id: 'eskalasi', label: 'Notifikasi & Eskalasi', badge: '3', icon: TAB_META.eskalasi.icon },
            { id: 'dokter', label: 'Manajemen Nakes', icon: TAB_META.dokter.icon },
            { id: 'pasien', label: 'Daftar Pasien', icon: TAB_META.pasien.icon },
          ].map(item => {
            const isSelected = activeTab === item.id
            return (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  borderLeft: `3px solid ${isSelected ? C.teal : 'transparent'}`,
                  color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                    e.currentTarget.style.color = '#ffffff'
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)'
                  }
                }}
              >
                <div style={{
                  color: isSelected ? C.teal : 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 20, flexShrink: 0
                }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: isSelected ? 700 : 600 }}>{item.label}</div>
                </div>
                {item.badge && (
                  <span style={{
                    background: '#EF4444', color: '#ffffff', fontSize: 8.5, fontWeight: 800,
                    minWidth: 16, height: 16, borderRadius: 8, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', padding: '0 3px', boxShadow: '0 2px 5px rgba(239, 68, 68, 0.3)'
                  }}>
                    {item.badge}
                  </span>
                )}
              </div>
            )
          })}

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '10px 12px 6px' }} />
          <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255, 255, 255, 0.35)', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 12px', marginBottom: 4 }}>Ringkasan</div>

          {/* Stat pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <span style={{ fontSize: 10.5, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>Total Nakes</span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#ffffff' }}>{nakesLoading ? '…' : nakesItems.length}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(30, 200, 165, 0.03)', borderRadius: 8, border: '1px solid rgba(30, 200, 165, 0.08)' }}>
              <span style={{ fontSize: 10.5, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>Nakes Aktif</span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: C.teal }}>{nakesLoading ? '…' : nakesItems.filter(n => n.status === 'active').length}</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div style={{ padding: '10px 12px 12px' }}>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, padding: '8px 12px', background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 10,
              cursor: 'pointer', color: '#EF4444', fontSize: 12.5, fontWeight: 700,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Keluar
          </button>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* ── TOP HEADER BAR — beautiful redesign ── */}
        <div style={{
          background: '#ffffff',
          borderBottom: '1px solid #E2E5F1',
          padding: '0 28px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          boxShadow: '0 1px 12px rgba(91,107,240,0.07)',
        }}>
          {/* Left: breadcrumb + page title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Accent stripe */}
            <div style={{
              width: 3.5, height: 36, borderRadius: 2,
              background: `linear-gradient(180deg, ${C.indigo} 0%, ${C.purple} 100%)`,
              flexShrink: 0,
            }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.indigo, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Platform Sehatiku
                </span>
                <span style={{ fontSize: 10, color: '#C5CAE3' }}>·</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#8A93A1' }}>Prolanis PTM</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.slate, lineHeight: 1, letterSpacing: '-0.2px' }}>
                {currentTab.title}
              </div>
              <div style={{ fontSize: 11, color: '#9AA0B9', marginTop: 2, fontWeight: 500 }}>
                {currentTab.subtitle}
              </div>
            </div>
          </div>

          {/* Right: date + mode badge + bell */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

            {/* Live date pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: C.lavender, border: `1px solid rgba(91,107,240,0.18)`,
              borderRadius: 10, padding: '7px 14px',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.indigo} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: C.indigo, whiteSpace: 'nowrap' }}>
                {todayLabel()}
              </span>
            </div>

            {/* Mode badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: 10, padding: '7px 14px',
            }}>
              <div className="anim-blink" style={{ width: 7, height: 7, borderRadius: '50%', background: C.purple }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: C.purple }}>Mode: Faskes</span>
            </div>

            {/* Notification bell */}
            <div
              onClick={() => setActiveTab('eskalasi')}
              style={{
                position: 'relative', width: 40, height: 40,
                background: '#F7F8FF', border: `1px solid #E2E5F1`, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = C.lavender
                e.currentTarget.style.borderColor = `rgba(91,107,240,0.3)`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#F7F8FF'
                e.currentTarget.style.borderColor = '#E2E5F1'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#636B78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span style={{
                position: 'absolute', top: -5, right: -5,
                background: '#EF4444', color: '#fff', fontSize: 9, fontWeight: 800,
                width: 17, height: 17, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(239,68,68,0.4)',
                border: '2px solid #ffffff',
              }}>3</span>
            </div>
          </div>
        </div>

        {/* ── SCROLLABLE TAB CONTENTS ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px', background: '#F0F1FE' }}>

          {activeTab === 'pendaftaran' && (
            <PendaftaranTab
              nakesItems={nakesItems}
              nakesLoading={nakesLoading}
              nakesError={nakesError}
              showToastMsg={showToastMsg}
            />
          )}

          {activeTab === 'operasional' && (
            <OperasionalTab
              setActiveTab={setActiveTab}
              showToastMsg={showToastMsg}
            />
          )}

          {activeTab === 'eskalasi' && (
            <EskalasiTab showToastMsg={showToastMsg} />
          )}

          {activeTab === 'dokter' && (
            <NakesTab
              nakesItems={nakesItems}
              nakesLoading={nakesLoading}
              nakesError={nakesError}
              refreshNakes={refreshNakes}
              showToastMsg={showToastMsg}
            />
          )}

          {activeTab === 'pasien' && (
            <PasienTab showToastMsg={showToastMsg} />
          )}

        </div>
      </div>

      {/* ── TOAST MESSAGE ── */}
      {showToast && (() => {
        const cleanMsg = toastMsg.replace(/^[✓⚠️✗]\s*/, '')
        
        let bg = '#EEF0FF'
        let color = '#1A2066'
        let borderLeftColor = '#5B6BF0'
        let borderColor = '#DCDFE8'
        let icon = (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5B6BF0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        )

        if (toastType === 'error') {
          bg = '#FEF2F2'
          color = '#991B1B'
          borderLeftColor = '#EF4444'
          borderColor = '#FEE2E2'
          icon = (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )
        } else if (toastType === 'success') {
          bg = '#ECFDF5'
          color = '#065F46'
          borderLeftColor = '#10B981'
          borderColor = '#D1FAE5'
          icon = (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <polyline points="20,6 9,17 4,12" />
            </svg>
          )
        }

        return (
          <div style={{
            position: 'fixed', bottom: 24, right: 24, 
            background: bg, color: color,
            borderRadius: 12, padding: '14px 18px', fontSize: 13, fontWeight: 600,
            boxShadow: '0 8px 30px rgba(15,36,68,0.12)', zIndex: 9999, maxWidth: 420,
            display: 'flex', alignItems: 'flex-start', gap: 11,
            borderLeft: `4px solid ${borderLeftColor}`,
            borderTop: `1px solid ${borderColor}`,
            borderRight: `1px solid ${borderColor}`,
            borderBottom: `1px solid ${borderColor}`,
            animation: 'slideIn 0.3s ease-out', lineHeight: '1.45'
          }}>
            {icon}
            <span>{cleanMsg}</span>
          </div>
        )
      })()}

      {/* ── LOGOUT CONFIRM MODAL ── */}
      {showLogoutConfirm && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowLogoutConfirm(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(43,45,66,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)', animation: 'fadeIn 0.2s ease-out' }}
        >
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 380, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(15,36,68,0.25)', border: '1px solid #DCDFE8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#2B2D42' }}>Keluar dari Sehatiku?</div>
                <div style={{ fontSize: 12, color: '#8A93A1', marginTop: 2 }}>Sesi aktif Anda akan diakhiri</div>
              </div>
            </div>
            <div style={{ background: '#F7F8FA', borderRadius: 10, padding: '12px 14px', marginBottom: 22, fontSize: 13, color: '#636B78', lineHeight: 1.55 }}>
              Pastikan semua pekerjaan sudah disimpan sebelum keluar. Anda perlu login kembali untuk mengakses dashboard faskes.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{ padding: '11px 0', background: '#F4F5F7', border: '1px solid #DCDFE8', borderRadius: 10, fontSize: 14, fontWeight: 600, color: '#636B78', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#E8EAF0'}
                onMouseLeave={e => e.currentTarget.style.background = '#F4F5F7'}
              >
                Batal
              </button>
              <button
                onClick={() => { setShowLogoutConfirm(false); onLogout() }}
                style={{ padding: '11px 0', background: '#DC2626', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', boxShadow: '0 3px 12px rgba(220,38,38,0.28)' }}
                onMouseEnter={e => e.currentTarget.style.background = '#B91C1C'}
                onMouseLeave={e => e.currentTarget.style.background = '#DC2626'}
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
