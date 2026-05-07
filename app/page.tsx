import Link from 'next/link'

export default function LandingPage() {
  return (
    <main style={s.page}>

      {/* Radial glow behind logo */}
      <div style={s.glow} />

      <div style={s.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-full.png"
          alt="Kingdom Protocol"
          style={s.logo}
        />

        <p style={s.descriptor}>Behavioral Accountability for the Kingdom-Minded</p>

        <div style={s.verse}>
          <p style={s.verseText}>
            "Two are better than one; because they have a good reward for their labour.
            For if they fall, the one will lift up his fellow: but woe to him that is alone
            when he falleth; for he hath not another to help him up."
          </p>
          <p style={s.verseRef}>Ecclesiastes 4:9–10  ·  KJV</p>
        </div>

        <div style={s.actions}>
          <Link href="/login" style={s.primaryBtn}>
            Get Started
          </Link>
          <Link href="/how-it-works" style={s.secondaryBtn}>
            How it works
          </Link>
        </div>

        <Link href="/login" style={s.signIn}>
          Already have an account? <span style={{ color: '#888', textDecoration: 'underline' }}>Sign in</span>
        </Link>
      </div>

      <p style={s.credit}>Built by Dijital Shift</p>
    </main>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1.5rem',
    background: '#0a0800',
    overflow: 'hidden',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '800px',
    height: '500px',
    background: 'radial-gradient(ellipse at center top, rgba(201,168,76,0.28) 0%, rgba(201,168,76,0.08) 45%, transparent 70%)',
    pointerEvents: 'none',
  },
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    width: '100%',
    maxWidth: '380px',
    position: 'relative',
    zIndex: 1,
  },
  logo: {
    width: '300px',
    maxWidth: '80vw',
    objectFit: 'contain',
    marginBottom: '2rem',
  },
  descriptor: {
    fontSize: '0.8rem',
    color: '#666',
    letterSpacing: '0.04em',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  verse: {
    marginBottom: '2.5rem',
    padding: '0 0.5rem',
  },
  verseText: {
    color: '#c9a84c',
    fontSize: '0.875rem',
    fontStyle: 'italic',
    lineHeight: 1.75,
    marginBottom: '0.6rem',
    fontWeight: 400,
  },
  verseRef: {
    color: '#fff',
    fontSize: '0.65rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontWeight: 500,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: '100%',
    marginBottom: '1.25rem',
  },
  primaryBtn: {
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
    letterSpacing: '0.01em',
    boxShadow: '0 0 24px rgba(201,168,76,0.25)',
  },
  secondaryBtn: {
    display: 'block',
    width: '100%',
    padding: '0.9rem',
    background: 'transparent',
    color: '#888',
    border: '1px solid #222',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    textAlign: 'center',
  },
  signIn: {
    fontSize: '0.78rem',
    color: '#444',
    textDecoration: 'none',
  },
  credit: {
    position: 'fixed',
    bottom: '0.875rem',
    right: '1rem',
    fontSize: '0.6rem',
    color: '#222',
    letterSpacing: '0.05em',
  },
}
