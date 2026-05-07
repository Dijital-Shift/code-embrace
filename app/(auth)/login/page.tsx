'use client'

import { Suspense, useState, useTransition, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { sendOtp, verifyOtp } from '@/lib/supabase/actions'

function LoginForm() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const invited = searchParams.get('email')
    if (invited) setEmail(decodeURIComponent(invited))
  }, [searchParams])

  function handleEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await sendOtp(formData)
      if (result?.error) setError(result.error)
      else { setEmail(formData.get('email') as string); setStep('code') }
    })
  }

  function handleCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('email', email)
    startTransition(async () => {
      const result = await verifyOtp(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div style={s.card}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-full.png" alt="Kingdom Protocol" style={{ width: '220px', maxWidth: '75vw', objectFit: 'contain', marginBottom: '0.5rem' }} />
      <p style={s.sub}>
        {step === 'email' ? 'Enter your email to continue' : `Code sent to ${email}`}
      </p>

      {step === 'email' ? (
        <form onSubmit={handleEmail} style={s.form}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            autoComplete="email"
            autoFocus
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={s.input}
          />
          {error && <p style={s.error}>{error}</p>}
          <button type="submit" disabled={isPending} style={s.btn}>
            {isPending ? 'Sending…' : 'Send Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleCode} style={s.form} autoComplete="off">
          <input type="text" name="fake_user" style={{ display: 'none' }} autoComplete="username" readOnly />
          <input type="password" name="fake_pass" style={{ display: 'none' }} autoComplete="current-password" readOnly />
          <input
            name="token"
            type="text"
            placeholder="Enter code"
            required
            maxLength={8}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            style={{ ...s.input, letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.25rem' }}
          />
          {error && <p style={s.error}>{error}</p>}
          <button type="submit" disabled={isPending} style={s.btn}>
            {isPending ? 'Verifying…' : 'Verify'}
          </button>
          <button type="button" onClick={() => { setStep('email'); setError(null) }} style={s.back}>
            Use a different email
          </button>
        </form>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <main style={s.page}>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    height: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    background: '#0a0800',
    overflow: 'hidden',
  },
  card: {
    width: '100%',
    maxWidth: '360px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  sub: { color: '#666', marginBottom: '1.5rem', fontSize: '0.875rem', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' },
  input: {
    padding: '0.75rem 1rem', background: '#111', border: '1px solid #222',
    borderRadius: '6px', color: '#fff', fontSize: '1rem', outline: 'none',
    width: '100%', boxSizing: 'border-box',
  },
  btn: {
    padding: '0.875rem', background: '#fff', color: '#000', border: 'none',
    borderRadius: '6px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
  },
  back: {
    background: 'none', border: 'none', color: '#555',
    cursor: 'pointer', fontSize: '0.8rem', textAlign: 'center',
  },
  error: { color: '#f87171', fontSize: '0.8rem' },
}
