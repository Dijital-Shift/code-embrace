import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'

export default async function AdminOverviewPage() {
  await requireAdmin()
  const supabase = await createServiceClient()

  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoStr = weekAgo.toISOString().split('T')[0]

  const [
    { count: totalUsers },
    { count: activeLanes },
    { count: todayCheckins },
    { count: todayMissed },
    { count: todayBreaches },
    { count: failedNotifs },
    { count: newUsersWeek },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('lanes').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('checkins').select('*', { count: 'exact', head: true }).eq('checkin_date', today).eq('status', 'completed'),
    supabase.from('checkins').select('*', { count: 'exact', head: true }).eq('checkin_date', today).eq('status', 'missed'),
    supabase.from('checkins').select('*', { count: 'exact', head: true }).eq('checkin_date', today).eq('status', 'breached'),
    supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('status', 'failed'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgoStr),
  ])

  const totalToday = (todayCheckins ?? 0) + (todayMissed ?? 0) + (todayBreaches ?? 0)
  const alignRate = totalToday > 0 ? Math.round(((todayCheckins ?? 0) / totalToday) * 100) : null

  // Recent activity feed
  const { data: recentCheckins } = await supabase
    .from('checkins')
    .select(`
      checkin_id, checkin_date, status, completion_time,
      lane:lanes!checkins_lane_id_fkey(title, lane_type),
      user:profiles!checkins_user_id_fkey(email)
    `)
    .in('status', ['breached', 'missed'])
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Overview</h2>
      <p style={{ color: '#555', fontSize: '0.78rem', marginBottom: '2rem' }}>
        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>

      {/* Stat grid */}
      <div style={s.grid}>
        <StatCard label="Active Users" value={totalUsers ?? 0} />
        <StatCard label="Active Lanes" value={activeLanes ?? 0} />
        <StatCard label="New This Week" value={newUsersWeek ?? 0} />
        <StatCard label="Today — Aligned" value={todayCheckins ?? 0} color="#4ade80" />
        <StatCard label="Today — Missed" value={todayMissed ?? 0} color="#f59e0b" />
        <StatCard label="Today — Breaches" value={todayBreaches ?? 0} color="#f87171" />
        <StatCard
          label="Alignment Rate"
          value={alignRate !== null ? `${alignRate}%` : '—'}
          color={alignRate !== null ? (alignRate >= 80 ? '#4ade80' : alignRate >= 50 ? '#f59e0b' : '#f87171') : '#555'}
        />
        <StatCard
          label="Failed Notifications"
          value={failedNotifs ?? 0}
          color={(failedNotifs ?? 0) > 0 ? '#f87171' : '#4ade80'}
        />
      </div>

      {/* Recent breach/miss activity */}
      <div style={{ marginTop: '2.5rem' }}>
        <p style={s.sectionLabel}>Recent Failures</p>
        {!recentCheckins?.length ? (
          <p style={{ color: '#444', fontSize: '0.85rem' }}>No recent failures.</p>
        ) : (
          <div style={s.list}>
            {recentCheckins.map(c => (
              <div key={c.checkin_id} style={s.row}>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{(c.lane as any)?.title}</p>
                  <p style={{ fontSize: '0.72rem', color: '#555', marginTop: '0.15rem' }}>
                    {(c.user as any)?.email} · {c.checkin_date}
                  </p>
                </div>
                <span style={s.statusBadge(c.status)}>{c.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number | string; color?: string }) {
  return (
    <div style={{
      padding: '1rem',
      background: '#0d0d0d',
      border: '1px solid #1a1a1a',
      borderRadius: '8px',
    }}>
      <p style={{ fontSize: '0.7rem', color: '#555', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </p>
      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: color ?? '#fff' }}>{value}</p>
    </div>
  )
}

const s: Record<string, any> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '0.75rem',
  },
  sectionLabel: {
    fontSize: '0.7rem', color: '#555', textTransform: 'uppercase',
    letterSpacing: '0.05em', marginBottom: '0.75rem', fontWeight: 600,
  },
  list: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  row: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.875rem 1rem', background: '#0d0d0d',
    border: '1px solid #1a1a1a', borderRadius: '6px',
  },
  statusBadge: (status: string): React.CSSProperties => ({
    fontSize: '0.7rem', padding: '0.25rem 0.5rem', borderRadius: '4px',
    background: status === 'breached' ? '#2d0d0d' : '#1a1200',
    color: status === 'breached' ? '#f87171' : '#f59e0b',
    textTransform: 'capitalize', flexShrink: 0,
  }),
}
