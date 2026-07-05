import { useEffect, useState } from 'react'
import type { ConsultationResult } from '../../../lib/types'

interface ReviewKeluhanCardProps {
  consultation?: ConsultationResult
  onReview: (id: string, notes: string) => void
}

export default function ReviewKeluhanCard({ consultation, onReview }: ReviewKeluhanCardProps) {
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
        borderRadius: 16,
        padding: '18px 20px',
        border: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 13.5, color: '#0F172A' }}>Tidak ada keluhan aktif</p>
          <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#64748B' }}>Pasien belum mengajukan konsultasi baru.</p>
        </div>
      </div>
    )
  }

  const isPending = consultation.status === 'open'

  const handleSubmit = () => {
    if (!notes.trim()) {
      setError('Harap isi rekomendasi terlebih dahulu.')
      return
    }
    setError('')
    onReview(consultation.id, notes)
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: '20px 22px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
      fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, paddingBottom: 14, marginBottom: 18, borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15.5, color: '#0F172A' }}>Review Keluhan Pasien</div>
            <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>Ringkasan keluhan dan tindak lanjut</div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 700,
            background: isPending ? '#FFF7ED' : '#ECFDF5',
            color: isPending ? '#C2410C' : '#047857',
            border: `1px solid ${isPending ? '#FED7AA' : '#A7F3D0'}`,
          }}>
            {isPending ? 'Pending' : 'Selesai'}
          </span>
          {!isPending && consultation.replied_at && (
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500, marginTop: 4 }}>
              Ditinjau {new Date(consultation.replied_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}, {new Date(consultation.replied_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.')}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Keluhan sejak kapan</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{consultation.complaint_since}</div>
        </div>
        <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Kategori keluhan</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{consultation.complaint_type}</div>
        </div>
      </div>

      <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 14, padding: '14px 16px', marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Detail deskripsi keluhan</div>
        <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, fontWeight: 600 }}>{consultation.complaint_detail}</div>
      </div>

      {isPending ? (
        <div>
          <label htmlFor="notes-area" style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
            Rekomendasi / Tindak Lanjut
          </label>
          <textarea
            id="notes-area"
            value={notes}
            onChange={e => {
              setNotes(e.target.value)
              if (e.target.value.trim()) setError('')
            }}
            placeholder="Tulis saran medis atau tindak lanjut untuk pasien"
            rows={4}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 12,
              border: error ? '2px solid #EF4444' : '1px solid #CBD5E1',
              fontSize: 13.5,
              fontFamily: 'inherit',
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none',
              background: '#fff',
              boxSizing: 'border-box',
              color: '#1E293B',
            }}
          />
          {error && (
            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#EF4444', fontWeight: 600 }}>{error}</p>
          )}

          <button
            onClick={handleSubmit}
            style={{
              marginTop: 14,
              width: '100%',
              background: '#4F46E5',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '11px 16px',
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Kirim feedback
          </button>
        </div>
      ) : (
        <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Feedback rekomendasi Anda</div>
          <p style={{ margin: 0, fontSize: 14, color: '#0F766E', lineHeight: 1.6, fontWeight: 600, whiteSpace: 'pre-wrap' }}>
            {consultation.nakes_note || 'Tidak ada catatan tertulis.'}
          </p>
        </div>
      )}
    </div>
  )
}
