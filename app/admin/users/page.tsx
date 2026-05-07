import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { suspendUser, activateUser } from '@/lib/admin/actions'

export default async function AdminUsersPage() {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('user_id, email, phone, status, created_at, last_active, timezone')
    .order('created_at', { ascending: false })

  const userIds = (users ?? []).map(u => u.user_id)

  const { data: laneCounts } = userIds.length
    ? await supabase
        .from('lanes')
        .select('user_id')
        .in('user_id', userIds)
        .eq('status', 'active')
    : { data: [] }

  const laneMap = new Map<string, number>()
  for (const l of laneCounts ?? []) {
    laneMap.set(l.user_id, (laneMap.get(l.user_id) ?? 0) + 1)
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem' }}>
        Users <span style={{ fontSize: '0.8rem', color: '#555', fontWeight: 400 }}>({users?.length ?? 0})</span>
      </h2>

      <div style={s.list}>
        {(users ?? []).map(u => (
          <div key={u.user_id} style={s.row}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.2rem' }}>{u.email}</p>
              <p style={{ fontSize: '0.72rem', color: '#555' }}>
                {laneMap.get(u.user_id) ?? 0} active lane{laneMap.get(u.user_id) !== 1 ? 's' : ''}
                {u.phone ? ` · ${u.phone}` : ''}
                {u.last_active ? ` · Last active ${new Date(u.last_active).toLocaleDateString()}` : ''}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
              <span style={s.statusDot(u.status)} />
              {u.status === 'active' ? (
                <form action={suspendUser}>
                  <input type="hidden" name="user_id" value={u.user_id} />
                  <button style={s.actionBtn('#1a1a1a', '#f87171')}>Suspend</button>
                </form>
              ) : (
                <form action={activateUser}>
                  <input type="hidden" name="user_id" value={u.user_id} />
                  <button style={s.actionBtn('#1a1a1a', '#4ade80')}>Activate</button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const s: Record<string, any> = {
  list: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  row: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    padding: '0.875rem 1rem', background: '#0d0d0d',
    border: '1px solid #1a1a1a', borderRadius: '6px',
  },
  statusDot: (status: string): React.CSSProperties => ({
    width: '7px', height: '7px', borderRadius: '50%',
    background: status === 'active' ? '#4ade80' : status === 'suspended' ? '#f87171' : '#555',
    flexShrink: 0,
  }),
  actionBtn: (bg: string, color: string): React.CSSProperties => ({
    padding: '0.3rem 0.75rem', background: bg, color,
    border: `1px solid ${color}33`, borderRadius: '4px',
    cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
  }),
}
