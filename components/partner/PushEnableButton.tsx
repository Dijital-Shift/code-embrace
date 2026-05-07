'use client'

import { useState, useEffect } from 'react'

export default function PushEnableButton() {
  const [status, setStatus] = useState<'loading' | 'unsupported' | 'denied' | 'enabled' | 'prompt'>('loading')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    const perm = Notification.permission
    if (perm === 'granted') {
      setStatus('enabled')
    } else if (perm === 'denied') {
      setStatus('denied')
    } else {
      setStatus('prompt')
    }
  }, [])

  async function enable() {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { setStatus('denied'); return }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })

      setStatus('enabled')
    } catch {
      setStatus('denied')
    }
  }

  if (status === 'loading' || status === 'unsupported') return null

  if (status === 'enabled') {
    return (
      <div style={s.banner('#052e16', '#4ade80')}>
        Push notifications enabled — you'll be alerted on breaches.
      </div>
    )
  }

  if (status === 'denied') {
    return (
      <div style={s.banner('#1a0a0a', '#f87171')}>
        Notifications blocked. Enable them in your browser settings to receive breach alerts.
      </div>
    )
  }

  return (
    <div style={s.promptCard}>
      <div>
        <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Enable alerts</p>
        <p style={{ fontSize: '0.8rem', color: '#666' }}>
          You'll only be notified when a breach or missed check-in occurs. Silent otherwise.
        </p>
      </div>
      <button onClick={enable} style={s.btn}>Enable</button>
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

const s: Record<string, any> = {
  banner: (bg: string, color: string): React.CSSProperties => ({
    padding: '0.75rem 1rem',
    background: bg,
    border: `1px solid ${color}22`,
    borderRadius: '6px',
    fontSize: '0.8rem',
    color,
    marginBottom: '1.5rem',
  }),
  promptCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: '#0d0d0d',
    border: '1px solid #222',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    gap: '1rem',
  },
  btn: {
    padding: '0.5rem 1.25rem',
    background: '#fff',
    color: '#000',
    border: 'none',
    borderRadius: '5px',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    flexShrink: 0,
  },
}
