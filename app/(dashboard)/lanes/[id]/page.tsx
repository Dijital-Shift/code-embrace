'use client'

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { useParams, notFound } from 'next/navigation'
import { updateLaneStatus, deleteLane } from '@/lib/lanes/actions'
import { createClient } from '@/lib/supabase/client'

type Lane = {
  lane_id: string
  title: string
  description: string | null
  support_scripture: string[] | null
  status: string
  created_at: string
  partner_email: string | null
  partner: { email: string } | null
  lane_type: string
}

type Checkin = {
  checkin_date: string
  status: string
}

export default function LaneDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [lane, setLane] = useState<Lane | null>(null)
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('lanes')
      .select('lane_id, title, description, support_scripture, status, created_at, partner_email, lane_type, partner:profiles!lanes_partner_id_fkey(email)')
      .eq('lane_id', id)
      .single()
      .then(({ data }) => {
        if (!data) return
        setLane(data as unknown as Lane)
      })

    supabase
      .from('checkins')
      .select('checkin_date, status')
      .eq('lane_id', id)
      .order('checkin_date', { ascending: false })
      .limit(14)
      .then(({ data }) => setCheckins((data ?? []) as Checkin[]))
  }, [id])

  if (!lane) return null

  const ageMinutes = (Date.now() - new Date(lane.created_at).getTime()) / 60000
  const canDelete = ageMinutes <= 10 && checkins.length === 0

  const statusColor: Record<string, string> = {
    completed: '#4ade80',
    breached: '#f87171',
    missed: '#f59e0b',
    skipped: '#c9a84c',
    pending: '#444',
  }

  const partnerDisplay = lane.partner?.email ?? (
    lane.partner_email
      ? `Awaiting — invite sent to ${lane.partner_email}`
      : '—'
  )
  const partnerPending = !lane.partner && !!lane.partner_email

  function handleDelete() {
    if (!confirm('Delete this lane? This cannot be undone.')) return
    setDeleteError(null)
    startTransition(async () => {
      const result = await deleteLane(id)
      if (result?.error) setDeleteError(result.error)
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/lanes" style={{ color: '#555', textDecoration: 'none', fontSize: '0.875rem' }}>← Lanes</Link>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{lane.title}</h2>
        </div>
        <Link
          href={`/lanes/${id}/edit?title=${encodeURIComponent(lane.title)}&description=${encodeURIComponent(lane.description ?? '')}&s1=${encodeURIComponent((lane.support_scripture ?? [])[0] ?? '')}&s2=${encodeURIComponent((lane.support_scripture ?? [])[1] ?? '')}&s3=${encodeURIComponent((lane.support_scripture ?? [])[2] ?? '')}`}
          style={s.editLink}
        >
          Edit
        </Link>
      </div>

      <div style={s.infoCard}>
        {lane.description && <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{lane.description}</p>}
        {(lane.support_scripture ?? []).filter(Boolean).length > 0 && (
          <div style={{ marginBottom: '0.75rem' }}>
            {(lane.support_scripture as string[]).filter(Boolean).map((s, i) => (
              <p key={i} style={{ color: '#c9a84c', fontSize: '0.8rem', fontStyle: 'italic', marginBottom: '0.25rem' }}>
                {i + 1}. "{s}"
              </p>
            ))}
          </div>
        )}
        <p style={s.meta}>
          Partner:{' '}
          <span style={{ color: partnerPending ? '#a16207' : '#ccc' }}>{partnerDisplay}</span>
        </p>
        <p style={s.meta}>Status: <span style={{ color: lane.status === 'active' ? '#4ade80' : '#888', textTransform: 'capitalize' }}>{lane.status}</span></p>
        <p style={s.meta}>Created: <span style={{ color: '#ccc' }}>{new Date(lane.created_at).toLocaleDateString()}</span></p>
      </div>

      <div style={{ marginTop: '2rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {lane.status !== 'active' && (
          <button
            disabled={isPending}
            onClick={() => startTransition(async () => { await updateLaneStatus(id, 'active'); setLane(l => l ? { ...l, status: 'active' } : l) })}
            style={s.actionBtn('#fff', '#000')}
          >Set Active</button>
        )}
        {lane.status === 'active' && (
          <button
            disabled={isPending}
            onClick={() => startTransition(async () => { await updateLaneStatus(id, 'paused'); setLane(l => l ? { ...l, status: 'paused' } : l) })}
            style={s.actionBtn('#2a2518', '#888')}
          >Pause</button>
        )}
        {lane.status !== 'archived' && (
          <button
            disabled={isPending}
            onClick={() => startTransition(async () => { await updateLaneStatus(id, 'archived'); setLane(l => l ? { ...l, status: 'archived' } : l) })}
            style={s.actionBtn('#2a2518', '#f87171')}
          >Archive</button>
        )}
        {canDelete && (
          <button onClick={handleDelete} disabled={isPending} style={s.actionBtn('#1a0a0a', '#f87171')}>
            Delete
          </button>
        )}
      </div>

      {deleteError && (
        <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.5rem' }}>{deleteError}</p>
      )}

      <div style={{ marginTop: '2rem' }}>
        <p style={s.sectionLabel}>Last 14 Days</p>
        {checkins.length === 0 ? (
          <p style={{ color: '#444', fontSize: '0.875rem' }}>No check-ins yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {checkins.map(c => (
              <div key={c.checkin_date} style={s.checkinRow}>
                <span style={{ fontSize: '0.875rem' }}>{c.checkin_date}</span>
                <span style={{ fontSize: '0.75rem', color: statusColor[c.status] ?? '#444', textTransform: 'capitalize' }}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const s: Record<string, any> = {
  infoCard: {
    padding: '1.25rem',
    background: '#161210',
    border: '1px solid #2a2518',
    borderRadius: '8px',
  },
  meta: { fontSize: '0.8rem', color: '#666', marginBottom: '0.3rem' },
  editLink: {
    fontSize: '0.8rem',
    color: '#888',
    textDecoration: 'none',
    padding: '0.35rem 0.75rem',
    border: '1px solid #222',
    borderRadius: '5px',
  },
  sectionLabel: {
    fontSize: '0.65rem',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.75rem',
    fontWeight: 600,
  },
  checkinRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0.75rem',
    background: '#161210',
    border: '1px solid #2a2518',
    borderRadius: '5px',
  },
  actionBtn: (bg: string, color: string): React.CSSProperties => ({
    padding: '0.5rem 1rem',
    background: bg,
    color,
    border: '1px solid #222',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 600,
  }),
}
