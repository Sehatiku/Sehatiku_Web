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

  useEffect(() => {
    setNotes('')
    setError('')
  }, [consultation?.id])

  if (!consultation) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: 14,
        padding: '18px 20px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        border: '1px dashed #E5E7EB',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: '#F0FDF4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 13.5, color: '#111827' }}>Tidak Ada Keluhan Aktif</p>
          <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF' }}>Pasien belum mengajukan konsultasi atau keluhan baru saat ini.</p>
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

  const categoryStyles: Record<string, { bg: string; text: string; border: string }> = {
    'Konsultasi Dokter': { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
    'Laporkan Keluhan':  { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3' },
    'Minta Review Hasil': { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' },
  }
  const catStyle = categoryStyles[consultation.complaint_type] || { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' }

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
      borderRadius: 16,
      padding: '20px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12, marginBottom: 20,
        paddingBottom: 16, borderBottom: '1px solid #F1F5F9',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: '#EEF2FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5B6BF0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 14.5, color: '#1E293B' }}>Review Keluhan Pasien</span>
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{
            background: catStyle.bg, color: catStyle.text, border: `1px solid ${catStyle.border}`,
            borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700,
          }}>
            {consultation.complaint_type}
          </span>
          {isPending ? (
            <span style={{
              background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A',
              borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
              Pending
            </span>
          ) : (
            <span style={{
              background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0',
              borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Selesai
            </span>
          )}
        </div>
      </div>

      {/* Patient info — flat rows, no container box */}
      <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', paddingBottom: 16, borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 4 }}>
              Keluhan Sejak Kapan
            </span>
            <span style={{ fontSize: 13.5, color: '#1E293B', fontWeight: 600 }}>{consultation.complaint_since}</span>
          </div>
          <div style={{ paddingLeft: 24, borderLeft: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 4 }}>
              Kategori
            </span>
            <span style={{ fontSize: 13.5, color: '#1E293B', fontWeight: 600 }}>{consultation.complaint_type}</span>
          </div>
        </div>
        <div style={{ paddingTop: 16 }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 6 }}>
            Detail Keluhan
          </span>
          <span style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.7, display: 'block', fontWeight: 500 }}>
            {consultation.complaint_detail}
          </span>
        </div>
      </div>

      {/* Doctor action */}
      {isPending ? (
        <div>
          <label htmlFor="notes-area" style={{ display: 'block', fontSize: 9.5, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
            Feedback Dokter untuk Pasien
          </label>
          <textarea
            id="notes-area"
            value={notes}
            onChange={e => {
              setNotes(e.target.value)
              if (e.target.value.trim()) setError('')
            }}
            placeholder="Berikan saran medis, tanggapan keluhan, resep obat, atau arahan diet/gaya hidup..."
            rows={4}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 12,
              border: error ? '2px solid #EF4444' : '2px solid #E2E8F0',
              fontSize: 14,
              fontFamily: 'inherit',
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
              transition: 'all 0.2s ease',
              background: '#fff',
              boxSizing: 'border-box',
              color: '#1E293B',
            }}
            onFocus={e => {
              if (!error) {
                e.target.style.borderColor = '#5B6BF0'
                e.target.style.boxShadow = '0 0 0 4px rgba(91,107,240,0.15)'
              }
            }}
            onBlur={e => {
              if (!error) {
                e.target.style.borderColor = '#E2E8F0'
                e.target.style.boxShadow = 'none'
              }
            }}
          />
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p style={{ margin: 0, fontSize: 12, color: '#EF4444', fontWeight: 600 }}>{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            style={{
              marginTop: 14,
              width: '100%',
              background: '#5B6BF0',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '11px 20px',
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              transition: 'background 0.15s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#4F46E5' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#5B6BF0' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Kirim Feedback ke Pasien
          </button>
        </div>
      ) : (
        <div style={{ paddingTop: 16, borderTop: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Feedback Anda
            </span>
            <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>
              {formatRepliedAt(consultation.replied_at)}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: '#334155', lineHeight: 1.7, fontWeight: 500, whiteSpace: 'pre-wrap' }}>
            {consultation.nakes_note || 'Tidak ada catatan tertulis.'}
          </p>
        </div>
      )}
    </div>
  )
}
