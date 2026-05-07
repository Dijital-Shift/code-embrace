'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateLane } from '@/lib/lanes/actions'

export default function EditLanePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ title?: string; description?: string; s1?: string; s2?: string; s3?: string }>
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [resolvedId, setResolvedId] = useState<string | null>(null)
  const [defaultTitle, setDefaultTitle] = useState('')
  const [defaultDesc, setDefaultDesc] = useState('')
  const [defaultScriptures, setDefaultScriptures] = useState(['', '', ''])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    Promise.all([params, searchParams]).then(([p, s]) => {
      setResolvedId(p.id)
      setDefaultTitle(s.title ?? '')
      setDefaultDesc(s.description ?? '')
      setDefaultScriptures([s.s1 ?? '', s.s2 ?? '', s.s3 ?? ''])
      setReady(true)
    })
  }, [])

  if (!ready) return null

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateLane(resolvedId!, formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href={`/lanes/${resolvedId}`} style={{ color: '#555', textDecoration: 'none', fontSize: '0.875rem' }}>←</Link>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Edit Lane</h2>
      </div>

      <form onSubmit={handleSubmit} style={s.form}>
        <div style={s.field}>
          <label style={s.label}>What's the lane?</label>
          <input
            name="title"
            defaultValue={defaultTitle}
            required
            maxLength={80}
            style={s.input}
          />
        </div>

        <div style={s.field}>
          <label style={s.label}>Description <span style={{ color: '#444' }}>(optional)</span></label>
          <textarea
            name="description"
            defaultValue={defaultDesc}
            maxLength={300}
            rows={2}
            style={{ ...s.input, resize: 'none' }}
          />
        </div>

        <div style={s.field}>
          <label style={s.label}>Support Scripture <span style={{ color: '#444' }}>(optional — up to 3)</span></label>
          {[
            { i: 0, placeholder: 'e.g. Prov. 27:17' },
            { i: 1, placeholder: 'e.g. Heb. 10:24' },
            { i: 2, placeholder: 'e.g. 1 Cor. 9:27' },
          ].map(({ i, placeholder }) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#555', fontWeight: 700, width: '1rem', flexShrink: 0 }}>{i + 1}.</span>
              <input
                name={`support_scripture_${i + 1}`}
                type="text"
                defaultValue={defaultScriptures[i]}
                placeholder={placeholder}
                maxLength={200}
                style={{ ...s.input, marginBottom: 0 }}
              />
            </div>
          ))}
          <p style={{ fontSize: '0.75rem', color: '#555' }}>Verses that anchor this commitment.</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: '#1a0a0a', border: '1px solid #3d1515', borderRadius: '6px' }}>
            <p style={{ color: '#f87171', fontSize: '0.875rem' }}>{error}</p>
          </div>
        )}

        <button type="submit" disabled={isPending} style={s.btn}>
          {isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

const s: Record<string, any> = {
  form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
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
