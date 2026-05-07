import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const today = new Date().toISOString().split('T')[0]

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name')
    .eq('user_id', user!.id)
    .single()

  const { data: lanes } = await supabase
    .from('lanes')
    .select('lane_id, title, status')
    .eq('user_id', user!.id)
    .eq('status', 'active')

  const { data: todayCheckins } = await supabase
    .from('checkins')
    .select('lane_id, status')
    .eq('user_id', user!.id)
    .eq('checkin_date', today)

  const checkedLaneIds = new Set((todayCheckins ?? []).map(c => c.lane_id))
  const pendingCount = (lanes ?? []).filter(l => !checkedLaneIds.has(l.lane_id)).length
  const greeting = profile?.first_name ? `${profile.first_name}.` : 'Welcome.'

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <p style={{ fontSize: '0.75rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{greeting}</h2>
      </div>

      {pendingCount > 0 ? (
        <div style={d.alertCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                {pendingCount} lane{pendingCount > 1 ? 's' : ''} need attention
              </p>
              <p style={{ color: '#888', fontSize: '0.875rem' }}>Check in before your bedtime window closes.</p>
            </div>
            <Link href="/checkin" style={d.ctaGold}>Check In</Link>
          </div>
        </div>
      ) : (lanes ?? []).length > 0 ? (
        <div style={d.cleanCard}>
          <p style={{ color: '#4ade80', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.15rem' }}>All clear.</p>
          <p style={{ color: '#555', fontSize: '0.8rem' }}>Every lane checked in. Stay aligned.</p>
        </div>
      ) : (
        <div style={d.cleanCard}>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>No active lanes yet.</p>
          <Link href="/lanes/new" style={d.ctaWhite}>Create your first lane</Link>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <p style={d.sectionLabel}>Active Lanes</p>
          <Link href="/lanes/new" style={{ fontSize: '0.8rem', color: '#c9a84c', textDecoration: 'none', fontWeight: 600 }}>+ New</Link>
        </div>
        {(lanes ?? []).length === 0 ? (
          <p style={{ color: '#333', fontSize: '0.875rem' }}>None yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {lanes!.map(lane => {
              const checked = checkedLaneIds.has(lane.lane_id)
              return (
                <Link key={lane.lane_id} href={`/lanes/${lane.lane_id}`} style={d.laneRow}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{lane.title}</span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: checked ? '#4ade80' : '#c9a84c',
                    background: checked ? '#052e16' : '#1a1400',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '99px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {checked ? 'Done' : 'Pending'}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const d: Record<string, React.CSSProperties> = {
  alertCard: {
    padding: '1.25rem',
    border: '1px solid #c9a84c33',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #0f0d00 0%, #0a0800 100%)',
    boxShadow: '0 0 0 1px rgba(201,168,76,0.08), inset 0 1px 0 rgba(201,168,76,0.06)',
  },
  cleanCard: {
    padding: '1.25rem',
    border: '1px solid #2a2518',
    borderRadius: '12px',
    background: '#161210',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
  },
  ctaGold: {
    display: 'inline-block',
    padding: '0.5rem 1.1rem',
    background: '#c9a84c',
    color: '#000',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
  },
  ctaWhite: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    background: '#fff',
    color: '#000',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
  },
  sectionLabel: {
    fontSize: '0.65rem',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 600,
  },
  laneRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.9rem 1rem',
    background: '#161210',
    border: '1px solid #2a2518',
    borderRadius: '10px',
    textDecoration: 'none',
    color: '#fff',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
  },
}
