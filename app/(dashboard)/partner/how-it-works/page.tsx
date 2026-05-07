import Link from 'next/link'
import BackButton from '@/components/ui/BackButton'

export default function PartnerHowItWorksPage() {
  return (
    <div style={s.container}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <BackButton href="/partner" />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>How It Works</h2>
      </div>
      <p style={{ color: '#666', fontSize: '0.8rem', marginBottom: '2rem' }}>
        You're a partner. Here's the full picture.
      </p>

      <div style={s.steps}>

        <div style={s.card('#111', '#2a2518')}>
          <span style={s.watermark}>01</span>
          <div style={s.cardBody}>
            <h3 style={s.heading}>Create a Lane</h3>
            <p style={s.body}>
              A lane is a behavior someone is committing to. Either something they want to <strong style={{ color: '#fff' }}>avoid</strong> — or something they want to <strong style={{ color: '#fff' }}>complete</strong>. One lane, one focus. Up to 10 active at a time.
            </p>
          </div>
        </div>

        <div style={s.card('#111', '#2a2518')}>
          <span style={s.watermark}>02</span>
          <div style={s.cardBody}>
            <h3 style={s.heading}>Assign a Partner</h3>
            <p style={s.body}>
              Every lane is watched by one person they trust. A partner holds a maximum of 2 lanes — not monitoring someone's whole life, just a specific area.
            </p>
            <p style={{ fontSize: '0.78rem', color: '#c9a84c', marginTop: '0.75rem', fontWeight: 600 }}>
              That's the role you're in right now.
            </p>
          </div>
        </div>

        <div style={s.card('#111', '#2a2518')}>
          <span style={s.watermark}>03</span>
          <div style={s.cardBody}>
            <h3 style={s.heading}>Check In Daily</h3>
            <p style={s.body}>
              Once a day, near bedtime, they get a push notification. Open the app, report each lane, done. Less than 30 seconds. <strong style={{ color: '#fff' }}>Complete lanes</strong> can be tapped anytime. <strong style={{ color: '#fff' }}>Avoid lanes</strong> are reported at night when the day is over.
            </p>
          </div>
        </div>

        <div style={s.card('#051a0a', '#166534')}>
          <span style={{ ...s.watermark, color: 'rgba(74,222,128,0.04)' }}>04</span>
          <div style={s.cardBody}>
            <h3 style={{ ...s.heading, color: '#4ade80' }}>Silence Means Aligned</h3>
            <p style={s.body}>
              When they're doing what they said they'd do, you hear nothing. No notifications. No updates. Complete silence. That's the system working as intended — and a good sign for them.
            </p>
          </div>
        </div>

        <div style={s.card('#1a0505', '#7f1d1d')}>
          <span style={{ ...s.watermark, color: 'rgba(248,113,113,0.04)' }}>05</span>
          <div style={s.cardBody}>
            <h3 style={{ ...s.heading, color: '#f87171' }}>Breach or Miss — You're Notified</h3>
            <p style={s.body}>
              They report a breach and you're notified immediately. They miss a check-in and they get a nudge first. No response by 10AM — you're notified. You see their phone number. You reach out. Everything after that happens in real life.
            </p>
          </div>
        </div>

        <div style={s.card('#111', '#2a2518')}>
          <span style={s.watermark}>06</span>
          <div style={s.cardBody}>
            <h3 style={s.heading}>Weekly Recap — For Them Only</h3>
            <p style={s.body}>
              Every Sunday, a quiet summary of their week. Days aligned, days missed. You don't see it — it's between them and their own record. What they do with it is up to them.
            </p>
          </div>
        </div>

      </div>

      <div style={s.kingdom}>
        <h2 style={s.kingdomHeading}>For the Kingdom Minded</h2>
        <p style={{ ...s.body, marginBottom: '1rem' }}>
          This app is built for those who live by the Word of God — not as a religion, but as a way of life. Accountability here isn't a feature. It's a principle.
        </p>
        <p style={{ ...s.body, marginBottom: '1rem' }}>
          When you say you'll do something and don't, that has weight. Your word matters before God and before your partner. "Can two walk together unless they are agreed?" — Amos 3:3. That's not a motivational quote. That's the design.
        </p>
        <p style={s.body}>
          Kingdom Protocol doesn't track habits. It holds you to your word. What you build with that discipline — that's yours to carry.
        </p>
      </div>

      <div style={s.cta}>
        <Link href="/lanes/new" style={s.ctaPrimary}>Create a Lane</Link>
        <Link href="/partner" style={s.ctaSecondary}>Back to your assignments</Link>
      </div>

    </div>
  )
}

const s: Record<string, any> = {
  container: { maxWidth: '520px', paddingBottom: '2rem' },
  steps: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' },
  card: (bg: string, border: string): React.CSSProperties => ({
    position: 'relative',
    overflow: 'hidden',
    padding: '1.25rem',
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: '10px',
  }),
  watermark: {
    position: 'absolute',
    top: '-0.25rem',
    right: '0.75rem',
    fontSize: '5rem',
    fontWeight: 800,
    color: 'rgba(255,255,255,0.04)',
    lineHeight: 1,
    userSelect: 'none',
    pointerEvents: 'none',
  } as React.CSSProperties,
  cardBody: { position: 'relative' as const },
  heading: { fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' } as React.CSSProperties,
  body: { fontSize: '0.875rem', color: '#999', lineHeight: 1.75 } as React.CSSProperties,
  kingdom: {
    padding: '1.5rem',
    background: '#0a0800',
    border: '1px solid #2a2000',
    borderRadius: '10px',
    marginBottom: '2rem',
    textAlign: 'center',
  } as React.CSSProperties,
  kingdomHeading: { fontSize: '1.1rem', fontWeight: 700, color: '#c9a84c', marginBottom: '1rem' } as React.CSSProperties,
  cta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  } as React.CSSProperties,
  ctaPrimary: {
    display: 'block',
    width: '100%',
    padding: '1rem',
    background: '#c9a84c',
    color: '#000',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '1rem',
    textAlign: 'center',
    boxSizing: 'border-box',
  } as React.CSSProperties,
  ctaSecondary: {
    display: 'block',
    width: '100%',
    padding: '0.9rem',
    background: 'transparent',
    color: '#666',
    border: '1px solid #222',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    textAlign: 'center',
    boxSizing: 'border-box',
  } as React.CSSProperties,
}
