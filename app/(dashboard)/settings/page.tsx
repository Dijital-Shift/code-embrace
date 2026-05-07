import { createClient } from '@/lib/supabase/server'
import BackButton from '@/components/ui/BackButton'
import SettingsForm from '@/components/settings/SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, first_name, last_name, phone, timezone, bedtime')
    .eq('user_id', user!.id)
    .single()

  const { data: archivedLanes } = await supabase
    .from('lanes')
    .select('lane_id, title, created_at')
    .eq('user_id', user!.id)
    .eq('status', 'archived')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <BackButton href="/dashboard" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Settings</h2>
      </div>
      <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: '2rem' }}>
        Your bedtime sets when check-in reminders fire. Your phone goes to partners on breach or miss.
      </p>

      <SettingsForm profile={profile ?? { email: null, first_name: null, last_name: null, phone: null, timezone: null, bedtime: null }} />

      {(archivedLanes ?? []).length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <p style={s.sectionLabel}>Archived Lanes</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {archivedLanes!.map(lane => (
              <div key={lane.lane_id} style={s.archivedRow}>
                <span style={{ fontSize: '0.875rem', color: '#555' }}>{lane.title}</span>
                <span style={{ fontSize: '0.7rem', color: '#333' }}>
                  {new Date(lane.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const s: Record<string, any> = {
  sectionLabel: { fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.6rem' },
  archivedRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: '#0a0a0a', border: '1px solid #141414', borderRadius: '6px' },
}
