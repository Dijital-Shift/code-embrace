'use client'

import { useState, useTransition } from 'react'
import { saveOnboarding } from '@/lib/profile/actions'

export default function OnboardingPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await saveOnboarding(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <main style={s.page}>
      <div style={s.card}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logomark.png"
          alt="Kingdom Protocol"
          style={{ width: '120px', objectFit: 'contain', marginBottom: '1.5rem' }}
        />
        <h1 style={s.title}>Welcome to Kingdom Protocol</h1>
        <p style={s.sub}>What should your accountability partners call you?</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.row}>
            <input
              name="first_name"
              type="text"
              placeholder="First name"
              required
              maxLength={50}
              style={s.input}
            />
            <input
              name="last_name"
              type="text"
              placeholder="Last name"
              required
              maxLength={50}
              style={s.input}
            />
          </div>

          {error && <p style={s.error}>{error}</p>}

          <button type="submit" disabled={isPending} style={s.btn}>
            {isPending ? 'Saving…' : 'Get Started'}
          </button>
        </form>
      </div>

      <p style={s.tag}>Built by Dijital Shift</p>
    </main>
  )
}

const s: Record<string, any> = {
  page: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '1.5rem', background: '#000',
  },
  card: {
    width: '100%', maxWidth: '380px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
  },
  title: { fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '0.4rem' },
  sub: { color: '#666', fontSize: '0.875rem', marginBottom: '2rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' },
  row: { display: 'flex', gap: '0.75rem' },
  input: {
    flex: 1, padding: '0.75rem 1rem', background: '#111',
    border: '1px solid #222', borderRadius: '6px', color: '#fff',
    fontSize: '1rem', outline: 'none', width: '100%', boxSizing: 'border-box',
  },
  btn: {
    padding: '0.875rem', background: '#fff', color: '#000',
    border: 'none', borderRadius: '6px', fontWeight: 600,
    fontSize: '1rem', cursor: 'pointer',
  },
  error: { color: '#f87171', fontSize: '0.8rem' },
  tag: {
    position: 'fixed' as const, bottom: '1rem', right: '1.25rem',
    fontSize: '0.7rem', color: '#333',
  },
}
