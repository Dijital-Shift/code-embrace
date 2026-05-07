import { requireAdmin } from '@/lib/admin/auth'
import { createServiceClient } from '@/lib/supabase/server'

export default async function AdminNotificationsPage() {
  await requireAdmin()
  const supabase = await createServiceClient()

  const { data: notifications } = await supabase
    .from('notifications')
    .select(`
      notification_id, type, status, message_content, sent_at, created_at,
      lane:lanes!notifications_lane_id_fkey(title),
      partner:profiles!notifications_partner_id_fkey(email)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  const failed = (notifications ?? []).filter(n => n.status === 'failed')
  const sent = (notifications ?? []).filter(n => n.status === 'sent')
  const pending = (notifications ?? []).filter(n => n.status === 'pending')

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Notifications</h2>

      <div style={s.statRow}>
        <span style={s.stat('#4ade80')}>{sent.length} sent</span>
        <span style={s.stat('#f59e0b')}>{pending.length} pending</span>
        <span style={s.stat('#f87171')}>{failed.length} failed</span>
      </div>

      {failed.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ ...s.label, color: '#f87171' }}>Failed — Partner Has No Push Subscription</p>
          <div style={s.list}>
            {failed.map(n => <NotifRow key={n.notification_id} n={n} />)}
          </div>
        </div>
      )}

      {sent.length > 0 && (
        <div>
          <p style={s.label}>Sent</p>
          <div style={s.list}>
            {sent.map(n => <NotifRow key={n.notification_id} n={n} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function NotifRow({ n }: { n: any }) {
  const color = n.type === 'breach_report' ? '#f87171' : '#f59e0b'
  return (
    <div style={{
      padding: '0.875rem 1rem', background: '#0d0d0d',
      border: '1px solid #1a1a1a', borderRadius: '6px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '3px', background: '#1a1a1a', color }}>
            {n.type === 'breach_report' ? 'Breach' : 'Missed'}
          </span>
          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{n.lane?.title}</span>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#444' }}>
          {n.sent_at
            ? new Date(n.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
            : new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
      <p style={{ fontSize: '0.75rem', color: '#555' }}>→ {n.partner?.email}</p>
      <p style={{ fontSize: '0.75rem', color: '#444', marginTop: '0.25rem' }}>{n.message_content}</p>
    </div>
  )
}

const s: Record<string, any> = {
  statRow: { display: 'flex', gap: '1rem', marginBottom: '2rem' },
  stat: (color: string): React.CSSProperties => ({
    fontSize: '0.8rem', fontWeight: 600, color,
    padding: '0.4rem 0.75rem', background: '#0d0d0d',
    border: `1px solid ${color}33`, borderRadius: '5px',
  }),
  label: {
    fontSize: '0.7rem', color: '#555', textTransform: 'uppercase',
    letterSpacing: '0.05em', marginBottom: '0.6rem', fontWeight: 600,
  },
  list: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
}
