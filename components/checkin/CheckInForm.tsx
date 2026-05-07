'use client'

import { useState, useTransition } from 'react'
import { submitCheckin, skipCheckin } from '@/lib/checkin/actions'

interface Lane {
  lane_id: string
  title: string
  description: string | null
}

export default function CheckInForm({ lane, isLate = false }: { lane: Lane; isLate?: boolean }) {
  const [response, setResponse] = useState<'aligned' | 'breach' | null>(null)
  const [skipped, setSkipped] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!response) return
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('response', response)

    startTransition(async () => {
      const result = await submitCheckin(formData)
      if (result?.error) setError(result.error)
      else setSubmitted(true)
    })
  }

  function handleSkip() {
    if (isPending) return
    startTransition(async () => {
      await skipCheckin(lane.lane_id)
      setSkipped(true)
    })
  }

  if (skipped) {
    return (
      <div style={{ ...s.card, borderColor: '#3d2c00', background: '#0d0a00' }}>
        <p style={{ fontWeight: 600, color: '#c9a84c' }}>{lane.title} — Sabbath</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={{ ...s.card, borderColor: response === 'aligned' ? '#166534' : '#7f1d1d' }}>
        <p style={{ fontWeight: 600, color: response === 'aligned' ? '#4ade80' : '#f87171' }}>
          {lane.title} — {response === 'aligned' ? 'Aligned' : 'Breach reported'}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={s.card}>
      <input type="hidden" name="lane_id" value={lane.lane_id} />

      {isLate && (
        <p style={{ fontSize: '0.7rem', color: '#f59e0b', marginBottom: '0.5rem', fontWeight: 600 }}>
          LATE — Yesterday
        </p>
      )}

      <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{lane.title}</p>
      {lane.description && (
        <p style={{ fontSize: '0.78rem', color: '#555', marginBottom: '0.75rem' }}>{lane.description}</p>
      )}

      <p style={{ fontSize: '0.78rem', color: '#666', marginBottom: '0.75rem' }}>Did you avoid this today?</p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: response === 'breach' ? '0.75rem' : 0 }}>
        <button type="button" onClick={() => setResponse('aligned')} style={s.toggle(response === 'aligned', 'aligned')}>
          Yes — aligned
        </button>
        <button type="button" onClick={() => setResponse('breach')} style={s.toggle(response === 'breach', 'breach')}>
          No — breach
        </button>
      </div>

      {response === 'breach' && (
        <textarea
          name="explanation"
          placeholder="What happened? Be honest."
          required
          rows={3}
          style={s.textarea}
        />
      )}

      {error && <p style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '0.5rem' }}>{error}</p>}

      {response && (
        <button type="submit" disabled={isPending} style={s.submit(response)}>
          {isPending ? 'Submitting…' : response === 'aligned' ? 'Submit — Aligned' : 'Submit — Breach'}
        </button>
      )}

      <button type="button" onClick={handleSkip} disabled={isPending} style={s.skip}>
        Skip — Sabbath
      </button>
    </form>
  )
}

const s: Record<string, any> = {
  card: {
    padding: '1.1rem',
    background: '#161210',
    border: '1px solid #2a2518',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    color: '#fff',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
  },
  toggle: (active: boolean, type: 'aligned' | 'breach'): React.CSSProperties => ({
    flex: 1,
    padding: '0.875rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid',
    borderColor: active ? (type === 'aligned' ? '#4ade80' : '#f87171') : '#222',
    background: active ? (type === 'aligned' ? '#052e16' : '#2d0d0d') : '#161210',
    color: active ? (type === 'aligned' ? '#4ade80' : '#f87171') : '#666',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: active ? 600 : 400,
    minHeight: '44px',
  }),
  textarea: {
    width: '100%',
    padding: '0.75rem',
    background: '#161210',
    border: '1px solid #222',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    resize: 'none' as const,
    outline: 'none',
    boxSizing: 'border-box' as const,
    minHeight: '80px',
  },
  submit: (response: 'aligned' | 'breach'): React.CSSProperties => ({
    width: '100%',
    padding: '0.875rem',
    background: response === 'aligned' ? '#fff' : '#7f1d1d',
    color: response === 'aligned' ? '#000' : '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    minHeight: '44px',
  }),
  skip: {
    background: 'none',
    border: 'none',
    color: '#4a3a10',
    fontSize: '0.72rem',
    cursor: 'pointer',
    padding: '0.5rem 0',
    textDecoration: 'underline',
    textAlign: 'center' as const,
    width: '100%',
    minHeight: '44px',
  },
}
