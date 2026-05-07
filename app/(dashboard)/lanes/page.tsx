import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import BackButton from '@/components/ui/BackButton'

export default async function LanesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: lanes } = await supabase
    .from('lanes')
    .select(`
      lane_id, title, description, status, created_at, partner_email,
      partner:profiles!lanes_partner_id_fkey(email)
    `)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const active = (lanes ?? []).filter(l => l.status === 'active')
  const paused = (lanes ?? []).filter(l => l.status === 'paused')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BackButton href="/dashboard" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Lanes</h2>
        </div>
        <Link href="/lanes/new" style={s.ctaBtn}>+ New Lane</Link>
      </div>

      {active.length === 0 && paused.length === 0 && (
        <p style={{ color: '#444' }}>No lanes yet. Create your first one.</p>
      )}

      {active.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <p style={s.sectionLabel}>Active</p>
          <div style={s.list}>
            {active.map(lane => {
              const partnerPending = !(lane.partner as any)?.email && !!lane.partner_email
              return (
                <Link key={lane.lane_id} href={`/lanes/${lane.lane_id}`} style={s.card}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={s.laneTitle}>{lane.title}</p>
                    {lane.description && <p style={s.laneDesc}>{lane.description}</p>}
                    <p style={{ ...s.laneMeta, color: partnerPending ? '#c9a84c' : '#444' }}>
                      {partnerPending
                        ? `Invite sent — ${lane.partner_email}`
                        : `Partner: ${(lane.partner as any)?.email ?? '—'}`}
                    </p>
                  </div>
                  <span style={s.badge('active')}>Active</span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {paused.length > 0 && (
        <section>
          <p style={s.sectionLabel}>Paused</p>
          <div style={s.list}>
            {paused.map(lane => (
              <Link key={lane.lane_id} href={`/lanes/${lane.lane_id}`} style={{ ...s.card, opacity: 0.5 }}>
                <div>
                  <p style={s.laneTitle}>{lane.title}</p>
                  <p style={s.laneMeta}>Partner: {(lane.partner as any)?.email ?? '—'}</p>
                </div>
                <span style={s.badge('paused')}>Paused</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

const s: Record<string, any> = {
  ctaBtn: {
    padding: '0.5rem 1rem',
    background: '#c9a84c',
    color: '#000',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '0.8rem',
  },
  sectionLabel: {
    fontSize: '0.65rem',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '0.6rem',
    fontWeight: 600,
  },
  list: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.1rem',
    background: '#161210',
    border: '1px solid #2a2518',
    borderRadius: '12px',
    textDecoration: 'none',
    color: '#fff',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
  },
  laneTitle: { fontWeight: 600, marginBottom: '0.2rem', fontSize: '0.95rem' },
  laneDesc: { fontSize: '0.8rem', color: '#666', marginBottom: '0.2rem' },
  laneMeta: { fontSize: '0.72rem' },
  badge: (status: string) => ({
    fontSize: '0.65rem',
    padding: '0.2rem 0.55rem',
    borderRadius: '99px',
    background: status === 'active' ? '#052e16' : '#1a1a1a',
    color: status === 'active' ? '#4ade80' : '#555',
    textTransform: 'capitalize',
    flexShrink: 0,
    fontWeight: 600,
    letterSpacing: '0.04em',
  }),
}
