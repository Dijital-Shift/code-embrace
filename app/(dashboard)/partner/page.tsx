import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PartnerLaneCard from '@/components/partner/PartnerLaneCard'
import PushEnableButton from '@/components/partner/PushEnableButton'

export default async function PartnerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: lanes } = await supabase
    .from('lanes')
    .select(`
      lane_id, title, description, status, created_at,
      owner:profiles!lanes_user_id_fkey(email)
    `)
    .eq('partner_id', user.id)
    .order('status')
    .order('created_at', { ascending: false })

  const activeLanes = (lanes ?? []).filter(l => l.status === 'active')
  const inactiveLanes = (lanes ?? []).filter(l => l.status !== 'active')

  const today = new Date().toISOString().split('T')[0]

  const laneIds = (lanes ?? []).map(l => l.lane_id)
  const { data: todayCheckins } = laneIds.length
    ? await supabase
        .from('checkins')
        .select('lane_id, status, breach_explanation, completion_time')
        .in('lane_id', laneIds)
        .eq('checkin_date', today)
    : { data: [] }

  const checkinMap = new Map((todayCheckins ?? []).map(c => [c.lane_id, c]))

  const { data: notifications } = await supabase
    .from('notifications')
    .select('notification_id, type, status, message_content, sent_at, lane_id')
    .eq('partner_id', user.id)
    .order('sent_at', { ascending: false })
    .limit(20)

  // Check if this user has any lanes of their own (for network nudge)
  const { count: ownLaneCount } = await supabase
    .from('lanes')
    .select('lane_id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'active')

  const showNudge = (ownLaneCount ?? 0) === 0

  return (
    <div>
      <PushEnableButton />

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Your Assignments</h2>
          <Link href="/partner/how-it-works" style={{ fontSize: '0.75rem', color: '#555', textDecoration: 'none', borderBottom: '1px solid #333', whiteSpace: 'nowrap' }}>
            How it works →
          </Link>
        </div>
        <p style={{ color: '#666', fontSize: '0.875rem' }}>
          You'll only be notified when something goes wrong. Silence means they're aligned.
        </p>
      </div>

      {showNudge && activeLanes.length > 0 && (
        <div style={s.nudge}>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem', color: '#c9a84c' }}>
            You're holding someone accountable. Who's holding you?
          </p>
          <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.75rem' }}>
            Create your own lane and assign a partner.
          </p>
          <Link href="/lanes/new" style={s.nudgeBtn}>Create a Lane</Link>
        </div>
      )}

      {activeLanes.length === 0 && inactiveLanes.length === 0 && (
        <div style={s.empty}>
          <p style={{ color: '#555', marginBottom: '1rem', fontSize: '0.9rem' }}>No lanes assigned to you yet.</p>
          <Link href="/lanes/new" style={s.nudgeBtn}>Set up your own</Link>
        </div>
      )}

      {activeLanes.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <p style={s.sectionLabel}>Active ({activeLanes.length}/2)</p>
          <div style={s.list}>
            {activeLanes.map(lane => (
              <PartnerLaneCard
                key={lane.lane_id}
                lane={lane}
                todayCheckin={checkinMap.get(lane.lane_id) ?? null}
              />
            ))}
          </div>
        </section>
      )}

      {inactiveLanes.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <p style={s.sectionLabel}>Inactive</p>
          <div style={s.list}>
            {inactiveLanes.map(lane => (
              <PartnerLaneCard
                key={lane.lane_id}
                lane={lane}
                todayCheckin={null}
              />
            ))}
          </div>
        </section>
      )}

      {(notifications ?? []).length > 0 && (
        <section>
          <p style={s.sectionLabel}>Alert History</p>
          <div style={s.list}>
            {notifications!.map(n => (
              <div key={n.notification_id} style={s.notifCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: n.type === 'breach_report' ? '#2d0d0d' : '#1a1200',
                    color: n.type === 'breach_report' ? '#f87171' : '#f59e0b',
                  }}>
                    {n.type === 'breach_report' ? 'Breach' : 'Missed'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#444' }}>
                    {n.sent_at ? new Date(n.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Pending'}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#888', lineHeight: 1.5 }}>{n.message_content}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  nudge: {
    padding: '1.25rem',
    background: '#0a0800',
    border: '1px solid #2a2000',
    borderRadius: '10px',
    marginBottom: '2rem',
  },
  nudgeBtn: {
    display: 'inline-block',
    padding: '0.5rem 1.25rem',
    background: '#c9a84c',
    color: '#000',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '0.8rem',
  },
  empty: {
    textAlign: 'center',
    paddingTop: '3rem',
  },
  sectionLabel: {
    fontSize: '0.65rem', color: '#666', textTransform: 'uppercase',
    letterSpacing: '0.05em', marginBottom: '0.75rem', fontWeight: 600,
  },
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  notifCard: {
    padding: '1rem', background: '#161210',
    border: '1px solid #2a2518', borderRadius: '8px',
  },
}
