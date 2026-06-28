import { useState, useEffect } from 'react'
import { LogoImg } from '../../components/ui/Icons'
import { faskesApi } from '../../lib/api'
import { useAuth } from '../../auth/AuthContext'
import type { NakesItem } from '../../lib/types'
import { initials } from '../../lib/utils'

// Import modular tab subcomponents
import PendaftaranTab from './components/PendaftaranTab'
import OperasionalTab from './components/OperasionalTab'
import EskalasiTab from './components/EskalasiTab'
import NakesTab from './components/NakesTab'
import PasienTab from './components/PasienTab'

export default function FaskesDashboardPage({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'pendaftaran' | 'operasional' | 'eskalasi' | 'dokter' | 'pasien'>('operasional')

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

  // ── Nakes list (fetched from API, shared with tabs) ──────────────────────
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

  // Modals States
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Title selector based on active tab
  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'pendaftaran': return 'Fase Pendaftaran — Registrasi Pasien'
      case 'operasional': return 'Fase Operasional — Dashboard Monitoring'
      case 'eskalasi': return 'Notifikasi & Eskalasi Klinis'
      case 'dokter': return 'Manajemen Nakes'
      case 'pasien': return 'Daftar Pasien Terdaftar'
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif', background: '#F4F5F7' }}>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: 248,
        minWidth: 248,
        background: 'linear-gradient(180deg, #262F8A 0%, #1A2066 100%)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        boxShadow: '4px 0 24px rgba(26, 32, 102, 0.15)',
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
                sehat<span style={{ color: '#1EC8A5' }}>iku</span>
              </div>
              <div style={{ fontSize: 8.5, color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginTop: 2 }}>Admin Faskes</div>
            </div>
          </div>
        </div>

        {/* Faskes Badge */}
        <div style={{
          margin: '10px 14px 0',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 10,
          padding: '8px 12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div className="anim-blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#1EC8A5' }}></div>
            <span style={{ fontSize: 8.5, fontWeight: 800, color: '#1EC8A5', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Mitra Prolanis Aktif</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', lineHeight: 1.3 }}>RS Umum Sejahtera</div>
          <div style={{ fontSize: 9.5, color: 'rgba(255, 255, 255, 0.45)', marginTop: 1, fontFamily: 'monospace' }}>Kode: RSU-TBB-2024-007</div>
        </div>

        {/* Nav Menu Header */}
        <div style={{ padding: '12px 18px 4px' }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255, 255, 255, 0.35)', textTransform: 'uppercase', letterSpacing: '1px' }}>Menu Utama</div>
        </div>

        {/* Nav Items */}
        <div style={{ padding: '0 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {[
            {
              id: 'pendaftaran',
              label: 'Fase Pendaftaran',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              ),
            },
            {
              id: 'operasional',
              label: 'Fase Operasional',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                </svg>
              ),
            },
            {
              id: 'eskalasi',
              label: 'Notifikasi & Eskalasi',
              badge: '3',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              ),
            },
            {
              id: 'dokter',
              label: 'Manajemen Nakes',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ),
            },
            {
              id: 'pasien',
              label: 'Daftar Pasien',
              icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              ),
            },
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
                  borderLeft: `3px solid ${isSelected ? '#1EC8A5' : 'transparent'}`,
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
                  color: isSelected ? '#1EC8A5' : 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 20,
                  flexShrink: 0
                }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: isSelected ? 700 : 600 }}>{item.label}</div>
                  {'sublabel' in item && isSelected && (
                    <div style={{ fontSize: 9.5, color: '#1EC8A5', marginTop: 1, fontWeight: 600 }}>{(item as any).sublabel}</div>
                  )}
                </div>
                {item.badge && (
                  <span style={{
                    background: '#EF4444',
                    color: '#ffffff',
                    fontSize: 8.5,
                    fontWeight: 800,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    boxShadow: '0 2px 5px rgba(239, 68, 68, 0.3)'
                  }}>
                    {item.badge}
                  </span>
                )}
              </div>
            )
          })}

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', margin: '10px 12px 6px' }}></div>
          <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255, 255, 255, 0.35)', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 12px', marginBottom: 4 }}>Ringkasan</div>

          {/* Stat pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <span style={{ fontSize: 10.5, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>Total Nakes</span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#ffffff' }}>{nakesLoading ? '…' : nakesItems.length}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(30, 200, 165, 0.03)', borderRadius: 8, border: '1px solid rgba(30, 200, 165, 0.08)' }}>
              <span style={{ fontSize: 10.5, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>Nakes Aktif</span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#1EC8A5' }}>{nakesLoading ? '…' : nakesItems.filter(n => n.status === 'active').length}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.04)' }}>
              <span style={{ fontSize: 10.5, color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>Total Pasien</span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(255, 255, 255, 0.4)' }}>—</span>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div style={{ padding: '10px 12px 0', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 10px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 10,
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #5B6BF0, #4FC3F7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 11,
              fontWeight: 700,
              flexShrink: 0
            }}>
              {initials(user?.name ?? 'F')}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name ?? 'Faskes'}</div>
              <div style={{ fontSize: 9.5, color: 'rgba(255, 255, 255, 0.45)', fontWeight: 500, marginTop: 1 }}>Admin Faskes</div>
            </div>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1EC8A5', flexShrink: 0 }}></div>
          </div>
        </div>

        {/* Logout Button */}
        <div style={{ padding: '10px 12px 12px' }}>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '8px 12px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 10,
              cursor: 'pointer',
              color: '#EF4444',
              fontSize: 12.5,
              fontWeight: 700,
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

        {/* Top Header Bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #DCDFE8', padding: '0 24px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, boxShadow: '0 1px 6px rgba(15,36,68,0.04)' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#2B2D42' }}>{getHeaderTitle()}</div>
            <div style={{ fontSize: 11, color: '#8A93A1', marginTop: 1 }}>Platform Sehatiku — Prolanis PTM · 24 Juni 2026</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EEEFFE', border: '1px solid rgba(91,107,240,0.18)', borderRadius: 8, padding: '6px 12px' }}>
              <div className="anim-blink" style={{ width: 7, height: 7, borderRadius: '50%', background: '#5B6BF0' }}></div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#5B6BF0' }}>Mode: Faskes</span>
            </div>

            <div
              onClick={() => setActiveTab('eskalasi')}
              style={{ position: 'relative', width: 38, height: 38, background: '#F4F5F7', border: '1px solid #DCDFE8', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#636B78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#EF4444', color: '#fff', fontSize: 9, fontWeight: 800, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
            </div>

          </div>
        </div>

        {/* ── SCROLLABLE TAB CONTENTS ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px', background: '#F4F5F7' }}>

          {/* TAB 1: PENDAFTARAN */}
          {activeTab === 'pendaftaran' && (
            <PendaftaranTab
              nakesItems={nakesItems}
              nakesLoading={nakesLoading}
              nakesError={nakesError}
              showToastMsg={showToastMsg}
            />
          )}

          {/* TAB 2: OPERASIONAL */}
          {activeTab === 'operasional' && (
            <OperasionalTab
              setActiveTab={setActiveTab}
              showToastMsg={showToastMsg}
            />
          )}

          {/* TAB 3: ESKALASI */}
          {activeTab === 'eskalasi' && (
            <EskalasiTab showToastMsg={showToastMsg} />
          )}

          {/* TAB 4: MANAJEMEN NAKES */}
          {activeTab === 'dokter' && (
            <NakesTab
              nakesItems={nakesItems}
              nakesLoading={nakesLoading}
              nakesError={nakesError}
              refreshNakes={refreshNakes}
              showToastMsg={showToastMsg}
            />
          )}

          {/* TAB 5: DAFTAR PASIEN */}
          {activeTab === 'pasien' && (
            <PasienTab showToastMsg={showToastMsg} />
          )}

        </div>
      </div>

      {/* ── TOAST MESSAGE ── */}
      {showToast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#2B2D42', color: '#fff', borderRadius: 12, padding: '14px 18px', fontSize: 13, fontWeight: 500, boxShadow: '0 8px 30px rgba(15,36,68,0.22)', zIndex: 9999, maxWidth: 420, display: 'flex', alignItems: 'flex-start', gap: 11, borderLeft: '4px solid #1EC8A5', animation: 'slideIn 0.3s ease-out', lineHeight: '1.45' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1EC8A5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><polyline points="20,6 9,17 4,12" /></svg>
          {toastMsg}
        </div>
      )}

      {/* ── LOGOUT CONFIRM MODAL ── */}
      {showLogoutConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(43,45,66,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)', animation: 'fadeIn 0.2s ease-out' }}>
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
