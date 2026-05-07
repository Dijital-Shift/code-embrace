'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from '@/lib/profile/actions'

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
]

interface Props {
  profile: {
    email: string | null
    first_name: string | null
    last_name: string | null
    phone: string | null
    timezone: string | null
    bedtime: string | null
  }
}

export default function SettingsForm({ profile }: Props) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bedtime = profile.bedtime?.slice(0, 5) ?? '22:00'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaved(false)
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result?.error) setError(result.error)
      else setSaved(true)
    })
  }

  return (
    <form onSubmit={handleSubmit} style={s.form}>
      <div style={s.row}>
        <div style={s.field}>
          <label style={s.label}>First Name</label>
          <input
            name="first_name"
            type="text"
            defaultValue={profile.first_name ?? ''}
            maxLength={50}
            style={s.input}
          />
        </div>
        <div style={s.field}>
          <label style={s.label}>Last Name</label>
          <input
            name="last_name"
            type="text"
            defaultValue={profile.last_name ?? ''}
            maxLength={50}
            style={s.input}
          />
        </div>
      </div>

      <div style={s.field}>
        <label style={s.label}>Email</label>
        <input value={profile.email ?? ''} disabled style={{ ...s.input, color: '#444', cursor: 'not-allowed' }} />
      </div>

      <div style={s.field}>
        <label style={s.label}>Phone Number</label>
        <input
          name="phone"
          type="tel"
          placeholder="+1 555 000 0000"
          defaultValue={profile.phone ?? ''}
          style={s.input}
        />
        <p style={s.hint}>Shared with partners only when a breach or miss occurs.</p>
      </div>

      <div style={s.field}>
        <label style={s.label}>Bedtime</label>
        <input
          name="bedtime"
          type="time"
          defaultValue={bedtime}
          required
          style={s.input}
        />
        <p style={s.hint}>Reminder fires 1 hour before this. Day is done — time to check in.</p>
      </div>

      <div style={s.field}>
        <label style={s.label}>Timezone</label>
        <select name="timezone" defaultValue={profile.timezone ?? 'America/Chicago'} style={s.input}>
          {TIMEZONES.map(tz => (
            <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {error && (
        <p style={{ color: '#f87171', fontSize: '0.8rem' }}>{error}</p>
      )}

      {saved && (
        <p style={{ color: '#4ade80', fontSize: '0.8rem' }}>Settings saved.</p>
      )}

      <button type="submit" disabled={isPending} style={s.btn}>
        {isPending ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}

const s: Record<string, any> = {
  form: { display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' },
  row: { display: 'flex', gap: '0.75rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 },
  label: { fontSize: '0.875rem', fontWeight: 600, color: '#ccc' },
  input: {
    padding: '0.75rem 1rem',
    background: '#111',
    border: '1px solid #222',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  hint: { fontSize: '0.75rem', color: '#555' },
  btn: {
    padding: '0.75rem',
    background: '#fff',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    maxWidth: '400px',
  },
}
