import type { NakesDailyLog } from '../../../lib/types'

interface LogCardProps {
  dailyLogs: NakesDailyLog[]
  loading?: boolean
}

function formatTanggal(date: string): string {
  try {
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  } catch {
    return date
  }
}

function dotColor(score: number | null): string {
  if (score == null) return '#8A93A1'
  if (score >= 70) return '#0D9488'
  if (score >= 40) return '#F59E0B'
  return '#EF4444'
}

const CardShell = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 2px rgba(0,0,0,0.06)', border: '1px solid #F0F1F4', fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif' }}>{children}</div>
)

const Header = (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #F1F5F9' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(16,185,129,0.1)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
      </div>
      <span style={{ fontWeight: 800, fontSize: 14.5, color: '#1E293B', letterSpacing: '-0.2px' }}>Log Harian Pasien</span>
    </div>
  </div>
)

export default function LogCard({ dailyLogs, loading = false }: LogCardProps) {
  if (loading) {
    return <CardShell>{Header}<div style={{ minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 12.5 }}>Memuat log harian…</div></CardShell>
  }

  if (!dailyLogs || dailyLogs.length === 0) {
    return (
      <CardShell>
        {Header}
        <div style={{ minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#9CA3AF' }}>
          <span style={{ fontSize: 22 }}>📝</span>
          <p style={{ margin: 0, fontSize: 12.5, textAlign: 'center' }}>Belum ada catatan harian dari pasien.</p>
        </div>
      </CardShell>
    )
  }

  // Terbaru dulu
  const logs = [...dailyLogs].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))

  return (
    <CardShell>
      {Header}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {logs.map((log, i) => {
          const parts: string[] = []
          if (log.blood_sugar != null) parts.push(`Gula ${log.blood_sugar} mg/dL`)
          if (log.systolic != null && log.diastolic != null) parts.push(`Tensi ${log.systolic}/${log.diastolic}`)
          if (log.weight != null) parts.push(`BB ${log.weight} kg`)
          const detail = parts.length > 0 ? parts.join(' · ') : 'Tidak ada metrik tercatat'
          return (
            <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: i < logs.length - 1 ? 18 : 0 }}>
              <span style={{ fontSize: 10.5, color: '#B0B7C3', fontFamily: 'IBM Plex Mono, monospace', minWidth: 48, textAlign: 'right', paddingTop: 1, fontWeight: 500, flexShrink: 0 }}>
                {formatTanggal(log.date)}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, background: dotColor(log.health_score), marginTop: 2 }} />
                {i < logs.length - 1 && <div style={{ width: 1, flex: 1, background: '#E8ECF2', marginTop: 5, minHeight: 18 }} />}
              </div>
              <div style={{ flex: 1, paddingBottom: 2, paddingTop: 1 }}>
                <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{detail}</p>
                <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF', lineHeight: 1.4 }}>
                  {log.health_score != null ? `Health Score hari itu: ${log.health_score}` : 'Health Score belum dihitung'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </CardShell>
  )
}
