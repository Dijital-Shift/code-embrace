import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/supabase/actions'
import BottomNav from '@/components/ui/BottomNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'radial-gradient(ellipse 120% 55% at 50% 0%, #1e1800 0%, #100d00 40%, #0a0800 100%)', color: '#fff', overflowX: 'hidden' }}>
      {/* Top bar — desktop only */}
      <nav className="nav-desktop-bar">
        <Link href="/dashboard" style={s.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logomark.png" alt="Kingdom Protocol" style={{ width: '32px', objectFit: 'contain' }} />
          <span style={{ marginLeft: '0.5rem' }}>Kingdom Protocol</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link href="/dashboard" style={s.link}>Home</Link>
          <Link href="/lanes" style={s.link}>Lanes</Link>
          <Link href="/checkin" style={s.link}>Check-In</Link>
          <Link href="/partner" style={s.link}>Partner</Link>
          <Link href="/settings" style={s.link}>Settings</Link>
          <form action={logout}>
            <button type="submit" style={s.logout}>Sign Out</button>
          </form>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '1.25rem', paddingBottom: '5rem', maxWidth: '640px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {children}
      </main>

      <div className="nav-mobile-only">
        <BottomNav />
      </div>

      <p style={s.tag}>Built by Dijital Shift</p>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  brand: { fontWeight: 700, fontSize: '0.95rem', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center' },
  link: { color: '#888', textDecoration: 'none', fontSize: '0.875rem' },
  logout: { background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '0.875rem', padding: 0 },
  tag: { position: 'fixed', bottom: '0.75rem', right: '1rem', fontSize: '0.65rem', color: '#2a2a2a', pointerEvents: 'none', zIndex: 99 },
}
