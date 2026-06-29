import type { PatientQueueItem } from '../../../lib/types'

interface FeedbackCardProps {
  patient: PatientQueueItem
  feedbacks: Record<string, 'tepat' | 'tidak'>
  onFeedback: (id: string, val: 'tepat' | 'tidak') => void
}

export default function FeedbackCard({ patient, feedbacks, onFeedback }: FeedbackCardProps) {
  const given = feedbacks[patient.patient_id]

  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      padding: '18px 20px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
      border: '1px solid #F0F1F4',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #F1F5F9' }}>
        <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 13.5, color: '#111827' }}>Umpan Balik Eskalasi</p>
        <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF', lineHeight: 1.5 }}>
          Apakah eskalasi AI untuk{' '}
          <span style={{ fontWeight: 600, color: '#6B7280' }}>{patient.full_name}</span>
          {patient.main_factor && <> karena <em>{patient.main_factor}</em></>} sudah tepat?
        </p>
      </div>

      {given ? (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          background: given === 'tepat' ? '#F0FDF9' : '#FFF5F5',
          border: `1px solid ${given === 'tepat' ? '#A7F3D0' : '#FECACA'}`,
          borderRadius: 10, padding: '14px 16px', gap: 6,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: given === 'tepat' ? '#D1FAE5' : '#FEE2E2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {given === 'tepat'
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              }
            </div>
            <span style={{
              fontWeight: 700, fontSize: 13,
              color: given === 'tepat' ? '#059669' : '#DC2626',
            }}>
              Ditandai: {given === 'tepat' ? 'Tepat' : 'Tidak Tepat'}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF' }}>
            Terima kasih — umpan balik Anda membantu meningkatkan model AI.
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button
              onClick={() => onFeedback(patient.patient_id, 'tepat')}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 9,
                border: '1.5px solid #D1FAE5',
                background: '#F0FDF9', color: '#059669',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#D1FAE5'; e.currentTarget.style.borderColor = '#6EE7B7' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#F0FDF9'; e.currentTarget.style.borderColor = '#D1FAE5' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Tepat
            </button>
            <button
              onClick={() => onFeedback(patient.patient_id, 'tidak')}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 9,
                border: '1.5px solid #FECACA',
                background: '#FFF5F5', color: '#DC2626',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.borderColor = '#FCA5A5' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FFF5F5'; e.currentTarget.style.borderColor = '#FECACA' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Tidak Tepat
            </button>
          </div>
          <p style={{ margin: 0, fontSize: 10.5, color: '#C4CBD4' }}>
            Anonim · digunakan untuk pelatihan ulang model secara berkala.
          </p>
        </>
      )}
    </div>
  )
}
