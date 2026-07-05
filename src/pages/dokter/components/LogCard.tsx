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

function CardShell({ children }: { children: React.ReactNode }) {
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
      {children}
    </div>
  )
}

export default function LogCard({ dailyLogs, loading = false }: LogCardProps) {
  const headerEl = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #E5E7EB' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15.5, color: '#0F172A' }}>Log Harian Pasien</div>
          <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>Catatan harian terbaru dari pasien</div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return <CardShell>{headerEl}<div style={{ minHeight: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: 13 }}>Memuat log harian...</div></CardShell>
  }

  if (!dailyLogs || dailyLogs.length === 0) {
    return (
      <CardShell>
        {headerEl}
        <div style={{ minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#64748B' }}>
          <span style={{ fontSize: 24 }}>📝</span>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500, textAlign: 'center' }}>Belum ada catatan harian dari pasien.</p>
        </div>
      </CardShell>
    )
  }

  const logs = [...dailyLogs].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))

  return (
    <CardShell>
      {headerEl}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {logs.map((log, i) => {
          const parts: string[] = []
          if (log.blood_sugar != null) parts.push(`Gula ${log.blood_sugar} mg/dL`)
          if (log.systolic != null && log.diastolic != null) parts.push(`Tensi ${log.systolic}/${log.diastolic}`)
          if (log.weight != null) parts.push(`BB ${log.weight} kg`)
          const detail = parts.length > 0 ? parts.join(' · ') : 'Tidak ada metrik tercatat'

          return (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 0', borderBottom: i < logs.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
              <span style={{ fontSize: 11.5, color: '#64748B', minWidth: 52, fontWeight: 700, flexShrink: 0, paddingTop: 1 }}>
                {formatTanggal(log.date)}
              </span>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4F46E5', marginTop: 5, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: '0 0 3px', fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>{detail}</p>
                <p style={{ margin: 0, fontSize: 11.5, color: '#64748B' }}>
                  {log.health_score != null ? (
                    <>
                      Health Score: <span style={{ fontWeight: 800, color: '#4F46E5' }}>{log.health_score}</span>
                    </>
                  ) : 'Health Score belum dihitung'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </CardShell>
  )
}
