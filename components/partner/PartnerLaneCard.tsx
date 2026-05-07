import { createClient } from '@/lib/supabase/server'

interface Checkin {
  lane_id: string
  status: string
  breach_explanation: string | null
  completion_time: string | null
}

interface Lane {
  lane_id: string
  title: string
  description: string | null
  status: string
  owner: { email: string }[] | { email: string } | null
}

export default async function PartnerLaneCard({
  lane,
  todayCheckin,
}: {
  lane: Lane
  todayCheckin: Checkin | null
}) {
  const supabase = await createClient()

  const { data: history } = await supabase
    .from('checkins')
    .select('checkin_date, status')
    .eq('lane_id', lane.lane_id)
    .order('checkin_date', { ascending: false })
    .limit(7)

  // Get owner's phone
  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('phone')
    .eq('email', (lane.owner as any)?.email)
    .single()

  const phone = ownerProfile?.phone ?? null

  const statusColor: Record<string, string> = {
    completed: '#4ade80',
    breached: '#f87171',
    missed: '#f59e0b',
    pending: '#333',
  }

  const todayColor = todayCheckin
    ? statusColor[todayCheckin.status] ?? '#333'
    : lane.status === 'active' ? '#f59e0b' : '#333'

  const todayLabel = todayCheckin
    ? todayCheckin.status.charAt(0).toUpperCase() + todayCheckin.status.slice(1)
    : lane.status === 'active' ? 'Pending' : '—'

  const needsContact = todayCheckin?.status === 'breached' || todayCheckin?.status === 'missed'

  return (
    <div style={s.card}>
      <div style={s.header}>
        <div>
          <p style={s.title}>{lane.title}</p>
          <p style={s.owner}>{(lane.owner as any)?.email}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.7rem', color: '#444', marginBottom: '0.2rem' }}>Today</p>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: todayColor }}>{todayLabel}</p>
        </div>
      </div>

      {todayCheckin?.status === 'breached' && todayCheckin.breach_explanation && (
        <div style={s.breachNote}>
          <p style={{ fontSize: '0.7rem', color: '#f87171', marginBottom: '0.2rem', fontWeight: 600 }}>Breach explanation</p>
          <p style={{ fontSize: '0.8rem', color: '#ccc' }}>{todayCheckin.breach_explanation}</p>
        </div>
      )}

      {needsContact && phone && (
        <div style={s.contactRow}>
          <a href={`tel:${phone}`} style={s.contactBtn('#fff', '#000')}>
            Call
          </a>
          <a href={`sms:${phone}`} style={s.contactBtn('#1a1a1a', '#fff')}>
            Text
          </a>
          <span style={{ fontSize: '0.75rem', color: '#444', marginLeft: '0.25rem' }}>{phone}</span>
        </div>
      )}

      {needsContact && !phone && (
        <p style={{ fontSize: '0.75rem', color: '#555', marginTop: '0.5rem' }}>
          No phone number on file — reach out another way.
        </p>
      )}

      {(history ?? []).length > 0 && (
        <div style={s.historyRow}>
          {history!.map(h => (
            <div
              key={h.checkin_date}
              title={`${h.checkin_date}: ${h.status}`}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '2px',
                background: statusColor[h.status] ?? '#1a1a1a',
                flexShrink: 0,
              }}
            />
          ))}
          <span style={{ fontSize: '0.65rem', color: '#444', marginLeft: '0.25rem' }}>7d</span>
        </div>
      )}
    </div>
  )
}

const s: Record<string, any> = {
  card: {
    padding: '1rem',
    background: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '8px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  title: { fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' },
  owner: { fontSize: '0.75rem', color: '#444' },
  breachNote: {
    padding: '0.6rem 0.75rem',
    background: '#1a0a0a',
    border: '1px solid #3d1515',
    borderRadius: '5px',
    marginBottom: '0.75rem',
  },
  contactRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  contactBtn: (bg: string, color: string) => ({
    padding: '0.5rem 1.25rem',
    background: bg,
    color,
    borderRadius: '5px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    border: '1px solid #222',
  }),
  historyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '0.5rem',
  },
}
