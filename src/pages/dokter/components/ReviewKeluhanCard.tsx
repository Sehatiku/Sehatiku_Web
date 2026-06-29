import { useState, useEffect } from 'react'
import type { ConsultationResult } from '../../../lib/types'

interface ReviewKeluhanCardProps {
  consultation?: ConsultationResult
  onReview: (id: string, notes: string) => void
}

export default function ReviewKeluhanCard({
  consultation,
  onReview,
}: ReviewKeluhanCardProps) {
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  // Clear notes when switching consultations
  useEffect(() => {
    setNotes('')
    setError('')
  }, [consultation?.id])

  if (!consultation) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '20px 22px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        border: '1px dashed #DCDFE8',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: '#F0FDF4',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1EC8A5', fontWeight: 'bold'
        }}>
          ✓
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#2B2D42' }}>Tidak Ada Keluhan Aktif</p>
          <p style={{ margin: 0, fontSize: 11, color: '#8A93A1' }}>Pasien belum mengajukan konsultasi atau keluhan baru saat ini.</p>
        </div>
      </div>
    )
  }

  const isPending = consultation.status === 'open'

  const handleSubmit = () => {
    if (!notes.trim()) {
      setError('Harap masukkan jawaban atau saran rekomendasi Anda.')
      return
    }
    setError('')
    onReview(consultation.id, notes)
  }

  // Visual markers based on category
  const categoryStyles = {
    'Konsultasi Dokter': { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD', icon: '💬' },
    'Laporkan Keluhan': { bg: '#FFE4E6', text: '#BE123C', border: '#FECDD3', icon: '⚠️' },
    'Minta Review Hasil': { bg: '#F3E8FF', text: '#6B21A8', border: '#E9D5FF', icon: '📋' },
  }

  const catStyle = categoryStyles[consultation.complaint_type as keyof typeof categoryStyles] || { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB', icon: '📝' }

  const formatRepliedAt = (val?: string | null) => {
    if (!val) return ''
    try {
      return new Date(val).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ', hari ini'
    } catch {
      return val
    }
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      padding: '24px',
      boxShadow: '0 10px 30px -10px rgba(26,32,102,0.06), 0 1px 3px rgba(26,32,102,0.02)',
      border: isPending ? '1px solid #FFE2B7' : '1px solid #E2E8F0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Visual background accents for waiting review */}
      {isPending && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)',
        }} />
      )}

      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🩺</span>
          <span style={{ fontWeight: 800, fontSize: 16.5, color: '#1A2066', letterSpacing: '-0.3px' }}>
            Review Keluhan Pasien
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Category Badge */}
          <span style={{
            background: catStyle.bg,
            color: catStyle.text,
            border: `1px solid ${catStyle.border}`,
            borderRadius: 8,
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
          }}>
            <span>{catStyle.icon}</span>
            {consultation.complaint_type}
          </span>

          {/* Status Badge */}
          {isPending ? (
            <span style={{
              background: '#FFF9F0',
              color: '#D97706',
              border: '1px solid #FFE2B7',
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}>
              <span className="anim-blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
              Butuh Review
            </span>
          ) : (
            <span style={{
              background: '#ECFDF5',
              color: '#065F46',
              border: '1px solid #A7F3D0',
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}>
              ✓ Selesai
            </span>
          )}
        </div>
      </div>

      {/* Patient Input Content */}
      <div style={{
        background: '#F8FAFC',
        borderRadius: 14,
        padding: '18px',
        border: '1px solid #E2E8F0',
        marginBottom: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>
        {/* Top Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: '#fff', padding: '10px 14px', borderRadius: 10, border: '1px solid #EFF1F5' }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 4 }}>
              ⏱️ KELUHAN SEJAK KAPAN
            </span>
            <span style={{ fontSize: 13.5, color: '#1E293B', fontWeight: 700 }}>{consultation.complaint_since}</span>
          </div>

          <div style={{ background: '#fff', padding: '10px 14px', borderRadius: 10, border: '1px solid #EFF1F5' }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 4 }}>
              🩺 KATEGORI
            </span>
            <span style={{ fontSize: 13.5, color: '#1E293B', fontWeight: 700 }}>{consultation.complaint_type}</span>
          </div>
        </div>

        {/* Bottom Details Row */}
        <div style={{ background: '#fff', padding: '14px', borderRadius: 10, border: '1px solid #EFF1F5' }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 6 }}>
            💬 DETAIL KELUHAN
          </span>
          <span style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6, display: 'block', fontWeight: 500 }}>
            {consultation.complaint_detail}
          </span>
        </div>
      </div>

      {/* Doctor Action Section */}
      {isPending ? (
        <div>
          <label htmlFor="notes-area" style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
            Feedback Dokter untuk Pasien
          </label>
          <textarea
            id="notes-area"
            value={notes}
            onChange={e => {
              setNotes(e.target.value)
              if (e.target.value.trim()) setError('')
            }}
            placeholder="Berikan saran medis, tanggapan keluhan, resep obat, atau arahan diet/gaya hidup untuk dikirim ke pasien..."
            rows={3}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 12,
              border: error ? '1.5px solid #EF4444' : '1.5px solid #E2E8F0',
              fontSize: 13.5,
              fontFamily: 'inherit',
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
              transition: 'all 0.2s ease-in-out',
              background: '#fff',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
            }}
            onFocus={e => {
              if (!error) {
                e.target.style.borderColor = '#5B6BF0'
                e.target.style.boxShadow = '0 0 0 3px rgba(91,107,240,0.15)'
              }
            }}
            onBlur={e => {
              if (!error) {
                e.target.style.borderColor = '#E2E8F0'
                e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.02)'
              }
            }}
          />
          {error && <p style={{ margin: '6px 0 0', fontSize: 11.5, color: '#EF4444', fontWeight: 700 }}>⚠️ {error}</p>}

          <button
            onClick={handleSubmit}
            style={{
              marginTop: 14,
              width: '100%',
              background: 'linear-gradient(135deg, #262F8A 0%, #1A2066 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '12px 20px',
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              fontFamily: 'inherit',
              boxShadow: '0 4px 14px rgba(26,32,102,0.2)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(26,32,102,0.3)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none'
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(26,32,102,0.2)'
            }}
            onMouseDown={e => {
              e.currentTarget.style.transform = 'translateY(1px) scale(0.99)'
            }}
            onMouseUp={e => {
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
          >
            <span style={{ fontSize: 15 }}>✓</span> Kirim Feedback ke Pasien
          </button>
        </div>
      ) : (
        <div style={{
          background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
          border: '1px solid #BBF7D0',
          borderRadius: 16,
          padding: '18px 20px',
          boxShadow: '0 4px 12px rgba(22,163,74,0.03)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, borderBottom: '1px dashed #A7F3D0', paddingBottom: 10 }}>
            <span style={{ fontSize: 16 }}>👩‍⚕️</span>
            <span style={{ fontWeight: 800, fontSize: 12, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Feedback Anda
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 11.5, color: '#16A34A', fontWeight: 700 }}>
              {formatRepliedAt(consultation.replied_at)}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: '#14532D', lineHeight: 1.6, fontWeight: 600 }}>
            {consultation.nakes_note}
          </p>
        </div>
      )}
    </div>
  )
}
