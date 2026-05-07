'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createLane } from '@/lib/lanes/actions'

export default function NewLanePage() {
  const [laneType, setLaneType] = useState<'avoid' | 'complete'>('avoid')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('lane_type', laneType)

    startTransition(async () => {
      const result = await createLane(formData)
      if (result?.error) setError(result.error)
      else router.push('/lanes')
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/lanes" style={{ color: '#555', textDecoration: 'none', fontSize: '0.875rem' }}>←</Link>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>New Lane</h2>
      </div>

      <form onSubmit={handleSubmit} style={s.form}>

        <div style={s.field}>
          <label style={s.label}>Lane Type</label>
          <div style={s.typeRow}>
            {(['avoid', 'complete'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setLaneType(type)}
                style={s.typeBtn(laneType === type)}
              >
                <strong>{type === 'avoid' ? 'Avoid' : 'Complete'}</strong>
                <span style={s.typeHint}>
                  {type === 'avoid' ? "Something you don't want to do" : 'Something you want to do'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div style={s.field}>
          <label style={s.label}>What's the lane?</label>
          <input
            name="title"
            placeholder={laneType === 'avoid' ? 'e.g. No alcohol' : 'e.g. Daily workout'}
            required
            maxLength={80}
            style={s.input}
          />
        </div>

        <div style={s.field}>
          <label style={s.label}>Description <span style={{ color: '#444' }}>(optional)</span></label>
          <textarea
            name="description"
            placeholder="Add context or rules..."
            maxLength={300}
            rows={2}
            style={{ ...s.input, resize: 'none' }}
          />
        </div>

        <div style={s.field}>
          <label style={s.label}>Support Scripture <span style={{ color: '#444' }}>(optional — up to 3)</span></label>
          {[
            { n: 1, placeholder: 'e.g. Prov. 27:17' },
            { n: 2, placeholder: 'e.g. Heb. 10:24' },
            { n: 3, placeholder: 'e.g. 1 Cor. 9:27' },
          ].map(({ n, placeholder }) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#555', fontWeight: 700, width: '1rem', flexShrink: 0 }}>{n}.</span>
              <input
                name={`support_scripture_${n}`}
                type="text"
                placeholder={placeholder}
                maxLength={200}
                style={{ ...s.input, marginBottom: 0 }}
              />
            </div>
          ))}
          <p style={s.hint}>Verses that anchor this commitment.</p>
        </div>

        <div style={s.field}>
          <label style={s.label}>Accountability Partner Email</label>
          <input
            name="partner_email"
            type="email"
            placeholder="partner@email.com"
            required
            style={s.input}
          />
          <p style={s.hint}>They'll receive an invite if they're not registered. Only notified if you miss a check-in.</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: '#1a0a0a', border: '1px solid #3d1515', borderRadius: '6px' }}>
            <p style={{ color: '#f87171', fontSize: '0.875rem' }}>{error}</p>
          </div>
        )}

        <button type="submit" disabled={isPending} style={s.btn}>
          {isPending ? 'Creating…' : 'Create Lane'}
        </button>
      </form>
    </div>
  )
}

const s: Record<string, any> = {
  form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.875rem', fontWeight: 600, color: '#ccc' },
  typeRow: { display: 'flex', gap: '0.75rem' },
  typeBtn: (active: boolean): React.CSSProperties => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    padding: '0.875rem',
    border: `1px solid ${active ? '#fff' : '#222'}`,
    borderRadius: '6px',
    background: active ? '#1e1a10' : '#161210',
    color: active ? '#fff' : '#666',
    cursor: 'pointer',
    textAlign: 'left',
  }),
  typeHint: { fontSize: '0.72rem', fontWeight: 400, color: '#555' },
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
    padding: '0.875rem',
    background: '#fff',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
  },
}
