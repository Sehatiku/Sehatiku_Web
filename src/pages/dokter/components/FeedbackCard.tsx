import type { PatientQueueItem } from '../../../lib/types'

interface FeedbackCardProps {
  patient: PatientQueueItem
  feedbacks: Record<string, 'tepat' | 'tidak'>
  onFeedback: (id: string, val: 'tepat' | 'tidak') => void
}

export default function FeedbackCard({
  patient,
  feedbacks,
  onFeedback,
}: FeedbackCardProps) {
  const given = feedbacks[patient.patient_id]
  return (
    <div style={{ background: 'linear-gradient(160deg, #262F8A 0%, #1A2066 100%)', borderRadius: 16, padding: '18px 20px' }}>
      <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 15, color: '#fff' }}>Umpan Balik Eskalasi</p>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#8A93A1', lineHeight: 1.6 }}>
        Apakah eskalasi untuk <span style={{ color: '#DCDFE8', fontWeight: 600 }}>{patient.full_name}</span> karena{' '}
        <em>{patient.main_factor || 'faktor klinis'}</em> sudah tepat?
      </p>
      {given ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>{given === 'tepat' ? '✅' : '❌'}</span>
            <span style={{ color: given === 'tepat' ? '#1EC8A5' : '#EF4444', fontWeight: 700, fontSize: 14 }}>
              Ditandai: {given === 'tepat' ? 'Tepat' : 'Tidak Tepat'}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#636B78' }}>Terima kasih — umpan balik Anda membantu meningkatkan model AI.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => onFeedback(patient.patient_id, 'tepat')} style={{
            flex: 1, padding: '10px 0', borderRadius: 10, border: '2px solid #1EC8A5',
            background: 'transparent', color: '#1EC8A5', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            ✓ Tepat
          </button>
          <button onClick={() => onFeedback(patient.patient_id, 'tidak')} style={{
            flex: 1, padding: '10px 0', borderRadius: 10, border: '2px solid #EF4444',
            background: 'transparent', color: '#EF4444', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            ✗ Tidak Tepat
          </button>
        </div>
      )}
      <p style={{ margin: '14px 0 0', fontSize: 11, color: '#4A5260', fontStyle: 'italic' }}>
        Umpan balik bersifat anonim dan digunakan untuk pelatihan ulang model secara berkala.
      </p>
    </div>
  )
}
