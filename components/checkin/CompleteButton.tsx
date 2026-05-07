'use client'

import { useState, useTransition } from 'react'
import { logComplete, revertComplete, skipCheckin } from '@/lib/checkin/actions'

export default function CompleteButton({ laneId, title, alreadyDone = false }: { laneId: string; title: string; alreadyDone?: boolean }) {
  const [done, setDone] = useState(alreadyDone)
  const [skipped, setSkipped] = useState(false)
  const [completedAt, setCompletedAt] = useState<number | null>(alreadyDone ? Date.now() : null)
  const [isPending, startTransition] = useTransition()
  const [revertError, setRevertError] = useState<string | null>(null)

  const canRevert = done && completedAt !== null && (Date.now() - completedAt) / 60000 <= 30

  function handleTap() {
    if (done || isPending) return
    startTransition(async () => {
      await logComplete(laneId)
      setDone(true)
      setCompletedAt(Date.now())
    })
  }

  function handleRevert() {
    setRevertError(null)
    startTransition(async () => {
      const result = await revertComplete(laneId)
      if (result?.error) {
        setRevertError(result.error)
      } else {
        setDone(false)
        setCompletedAt(null)
      }
    })
  }

  function handleSkip() {
    if (done || skipped || isPending) return
    startTransition(async () => {
      await skipCheckin(laneId)
      setSkipped(true)
    })
  }

  if (skipped) {
    return (
      <div style={{ ...s.btn(false), background: '#0d0a00', borderColor: '#3d2c00', cursor: 'default' }}>
        <span style={{ ...s.circle(false), borderColor: '#c9a84c' }} />
        <span style={{ flex: 1, fontSize: '0.95rem', color: '#c9a84c' }}>{title}</span>
        <span style={{ fontSize: '0.7rem', color: '#c9a84c' }}>Sabbath</span>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={handleTap}
        disabled={done || isPending}
        style={s.btn(done)}
        aria-label={done ? `${title} — completed` : `Mark ${title} as complete`}
      >
        <span style={s.circle(done)}>
          {done ? '✓' : isPending ? '…' : ''}
        </span>
        <span style={{ flex: 1, textAlign: 'left', fontSize: '0.95rem', color: done ? '#4ade80' : '#fff' }}>
          {title}
        </span>
        {done && <span style={{ fontSize: '0.7rem', color: '#4ade80' }}>Done</span>}
      </button>

      {canRevert && (
        <button onClick={handleRevert} disabled={isPending} style={s.revert}>
          Undo (within 30 min)
        </button>
      )}
      {!done && (
        <button onClick={handleSkip} disabled={isPending} style={s.skip}>
          Skip — Sabbath
        </button>
      )}
      {revertError && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>{revertError}</p>}
    </div>
  )
}

const s: Record<string, any> = {
  btn: (done: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    width: '100%',
    padding: '1rem 1.1rem',
    background: done
      ? 'linear-gradient(135deg, #052e16 0%, #031a0d 100%)'
      : '#161210',
    border: `1px solid ${done ? '#166534' : '#2a2518'}`,
    borderRadius: '12px',
    cursor: done ? 'default' : 'pointer',
    transition: 'all 0.15s',
    textAlign: 'left',
    boxShadow: done
      ? '0 0 16px rgba(74,222,128,0.08)'
      : 'inset 0 1px 0 rgba(255,255,255,0.03)',
  }),
  circle: (done: boolean): React.CSSProperties => ({
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    border: `2px solid ${done ? '#4ade80' : '#333'}`,
    background: done ? '#4ade80' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    color: '#000',
    fontWeight: 700,
    flexShrink: 0,
    transition: 'all 0.15s',
  }),
  revert: {
    background: 'none',
    border: 'none',
    color: '#555',
    fontSize: '0.72rem',
    cursor: 'pointer',
    padding: '0.25rem 0',
    textDecoration: 'underline',
    marginRight: '0.75rem',
  },
  skip: {
    background: 'none',
    border: 'none',
    color: '#4a3a10',
    fontSize: '0.72rem',
    cursor: 'pointer',
    padding: '0.25rem 0',
    textDecoration: 'underline',
  },
}
