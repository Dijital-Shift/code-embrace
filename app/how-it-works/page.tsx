'use client'

import Link from 'next/link'

export default function HowItWorksPage() {
  return (
    <main style={s.page}>
      <div style={s.container}>

        <button onClick={() => window.history.back()} style={s.back}>← Back</button>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-full.png" alt="Kingdom Protocol" style={{ width: '180px', maxWidth: '60vw', objectFit: 'contain', marginBottom: '1rem' }} />
          <p style={s.tagline}>STAY IN YOUR LANE</p>
        </div>

        <div style={s.steps}>

          <div style={s.card('#161210', '#2a2518')}>
            <span style={s.watermark}>01</span>
            <div style={s.cardBody}>
              <p style={s.label}>01</p>
              <h2 style={s.heading}>Create a Lane</h2>
              <p style={s.body}>
                A lane is a behavior you're committing to. Either something you want to <strong style={{ color: '#fff' }}>avoid</strong> — or something you want to <strong style={{ color: '#fff' }}>complete</strong>. One lane, one focus. Up to 10 active at a time.
              </p>
            </div>
          </div>

          <div style={s.card('#161210', '#2a2518')}>
            <span style={s.watermark}>02</span>
            <div style={s.cardBody}>
              <p style={s.label}>02</p>
              <h2 style={s.heading}>Assign a Partner</h2>
              <p style={s.body}>
                Every lane is watched by one person you trust. A partner holds a maximum of 2 of your lanes — they're not monitoring your whole life, just a specific area. They only hear from the system when something goes wrong.
              </p>
            </div>
          </div>

          <div style={s.card('#161210', '#2a2518')}>
            <span style={s.watermark}>03</span>
            <div style={s.cardBody}>
              <p style={s.label}>03</p>
              <h2 style={s.heading}>Check In Daily</h2>
              <p style={s.body}>
                Once a day, near your bedtime, you get a push notification. Open the app, report each lane, done. Less than 30 seconds. <strong style={{ color: '#fff' }}>Complete lanes</strong> can be tapped anytime during the day. <strong style={{ color: '#fff' }}>Avoid lanes</strong> are reported at night when the day is over.
              </p>
            </div>
          </div>

          <div style={s.card('#051a0a', '#166534')}>
            <span style={{ ...s.watermark, color: 'rgba(74,222,128,0.04)' }}>04</span>
            <div style={s.cardBody}>
              <p style={s.label}>04</p>
              <h2 style={{ ...s.heading, color: '#4ade80' }}>Silence Means Aligned</h2>
              <p style={s.body}>
                When you're doing what you said you'd do, nobody hears anything. No notifications. No updates. Complete silence. That's the system working as intended.
              </p>
            </div>
          </div>

          <div style={s.card('#1a0505', '#7f1d1d')}>
            <span style={{ ...s.watermark, color: 'rgba(248,113,113,0.04)' }}>05</span>
            <div style={s.cardBody}>
              <p style={s.label}>05</p>
              <h2 style={{ ...s.heading, color: '#f87171' }}>Breach or Miss — Partner Is Notified</h2>
              <p style={s.body}>
                Report a breach and your partner is notified immediately. Miss a check-in and you get a nudge first. No response by 10AM — your partner is notified. They see your phone number. They reach out. Everything after that happens in real life.
              </p>
            </div>
          </div>

          <div style={s.card('#161210', '#2a2518')}>
            <span style={s.watermark}>06</span>
            <div style={s.cardBody}>
              <p style={s.label}>06</p>
              <h2 style={s.heading}>Weekly Recap — For You Only</h2>
              <p style={s.body}>
                Every Sunday, a quiet summary of your week. Days aligned, days missed. No judgment — just your numbers. Your partner doesn't see it. What you do with it is up to you.
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
          <Link href="/login" style={s.ctaBtn}>Get Started</Link>
        </div>

      </div>
    </main>
  )
}

const s: Record<string, any> = {
  page: { minHeight: '100vh', background: '#0a0800', color: '#fff', padding: '2rem 1.5rem 4rem' },
  container: { maxWidth: '520px', margin: '0 auto' },
  back: { background: 'none', border: 'none', color: '#555', fontSize: '0.875rem', display: 'inline-block', marginBottom: '2rem', cursor: 'pointer', padding: 0 },
  tagline: { color: '#666', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.25em', marginTop: '0.5rem' },
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
  },
  cardBody: { position: 'relative' },
  label: { display: 'none' },
  heading: { fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' },
  body: { fontSize: '0.875rem', color: '#999', lineHeight: 1.75 },
  kingdom: {
    padding: '1.5rem',
    background: '#0a0800',
    border: '1px solid #2a2000',
    borderRadius: '10px',
    marginBottom: '0.75rem',
    textAlign: 'center',
  },
  kingdomHeading: { fontSize: '1.1rem', fontWeight: 700, color: '#c9a84c', marginBottom: '1rem' },
  cta: { marginTop: '2.5rem', textAlign: 'center' },
  ctaBtn: {
    display: 'inline-block',
    padding: '0.875rem 2.5rem',
    background: '#fff',
    color: '#000',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '1rem',
  },
}
