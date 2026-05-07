import { createClient } from '@/lib/supabase/server'
import CompleteButton from '@/components/checkin/CompleteButton'
import CheckInForm from '@/components/checkin/CheckInForm'
import BackButton from '@/components/ui/BackButton'

export default async function CheckInPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const { data: lanes } = await supabase
    .from('lanes')
    .select('lane_id, title, description, lane_type')
    .eq('user_id', user!.id)
    .eq('status', 'active')

  const laneIds = (lanes ?? []).map(l => l.lane_id)

  const { data: recentCheckins } = laneIds.length
    ? await supabase
        .from('checkins')
        .select('lane_id, checkin_date, status')
        .eq('user_id', user!.id)
        .in('checkin_date', [today, yesterdayStr])
        .in('lane_id', laneIds)
    : { data: [] }

  const todayMap = new Map(
    (recentCheckins ?? []).filter(c => c.checkin_date === today).map(c => [c.lane_id, c])
  )
  const missedYesterdayMap = new Map(
    (recentCheckins ?? []).filter(c => c.checkin_date === yesterdayStr && c.status === 'missed').map(c => [c.lane_id, c])
  )

  const completeLanes = (lanes ?? []).filter(l => l.lane_type === 'complete')
  const avoidLanes = (lanes ?? []).filter(l => l.lane_type === 'avoid')

  const completePending = completeLanes.filter(l => !todayMap.has(l.lane_id))
  const completeDone = completeLanes.filter(l => todayMap.has(l.lane_id))

  const avoidLate = avoidLanes.filter(l => missedYesterdayMap.has(l.lane_id) && !todayMap.has(l.lane_id))
  const avoidPending = avoidLanes.filter(l => !todayMap.has(l.lane_id) && !missedYesterdayMap.has(l.lane_id))
  const avoidDone = avoidLanes.filter(l => todayMap.has(l.lane_id))

  const allDone = completePending.length === 0 && avoidPending.length === 0 && avoidLate.length === 0

  if (!lanes?.length) {
    return (
      <div style={s.empty}>
        <p style={{ color: '#555', marginBottom: '1rem' }}>No active lanes.</p>
        <a href="/lanes/new" style={s.cta}>Create a Lane</a>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
        <BackButton href="/dashboard" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Check-In</h2>
      </div>
      <p style={{ color: '#666', fontSize: '0.8rem', marginBottom: '2rem' }}>
        {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>

      {allDone && (
        <div style={s.cleanCard}>
          <p style={{ fontWeight: 600, color: '#4ade80', marginBottom: '0.25rem' }}>All lanes checked in.</p>
          <p style={{ fontSize: '0.8rem', color: '#555' }}>Stay in your lane.</p>
        </div>
      )}

      {/* Complete lanes — tap to log */}
      {completeLanes.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <p style={s.label}>Complete</p>
          <div style={s.list}>
            {completePending.map(lane => (
              <CompleteButton key={lane.lane_id} laneId={lane.lane_id} title={lane.title} />
            ))}
            {completeDone.map(lane => (
              <CompleteButton key={lane.lane_id} laneId={lane.lane_id} title={lane.title} />
            ))}
          </div>
        </section>
      )}

      {/* Avoid lanes — late submission window */}
      {avoidLate.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <p style={{ ...s.label, color: '#f59e0b' }}>Missed Yesterday — Submit Before 7AM</p>
          <p style={{ fontSize: '0.75rem', color: '#555', marginBottom: '0.75rem' }}>
            Your partner hasn't been notified yet.
          </p>
          <div style={s.list}>
            {avoidLate.map(lane => (
              <CheckInForm key={lane.lane_id} lane={lane} isLate />
            ))}
          </div>
        </section>
      )}

      {/* Avoid lanes — today */}
      {avoidLanes.length > 0 && (avoidPending.length > 0 || avoidDone.length > 0) && (
        <section style={{ marginBottom: '2rem' }}>
          <p style={s.label}>Avoid</p>
          <div style={s.list}>
            {avoidPending.map(lane => (
              <CheckInForm key={lane.lane_id} lane={lane} />
            ))}
            {avoidDone.map(lane => {
              const c = todayMap.get(lane.lane_id)!
              const color = c.status === 'completed' ? '#4ade80' : '#f87171'
              return (
                <div key={lane.lane_id} style={s.doneRow}>
                  <span style={{ fontSize: '0.9rem' }}>{lane.title}</span>
                  <span style={{ fontSize: '0.75rem', color, textTransform: 'capitalize' }}>{c.status === 'completed' ? 'Aligned' : 'Breach'}</span>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem', textAlign: 'center' },
  cta: { padding: '0.6rem 1.25rem', background: '#fff', color: '#000', borderRadius: '5px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' },
  cleanCard: { padding: '1.25rem', border: '1px solid #166534', borderRadius: '12px', background: 'linear-gradient(135deg, #052e16 0%, #031a0d 100%)', marginBottom: '2rem', boxShadow: '0 0 24px rgba(74,222,128,0.06)' },
  label: { fontSize: '0.65rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem', fontWeight: 600 },
  list: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  doneRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', background: '#161210', border: '1px solid #2a2518', borderRadius: '8px', color: '#fff' },
}
