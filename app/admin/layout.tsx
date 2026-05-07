import { requireAdmin } from '@/lib/admin/auth'
import Link from 'next/link'
import { logout } from '@/lib/supabase/actions'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      <nav style={s.nav}>
        <span style={s.brand}>Kingdom Protocol <span style={s.badge}>Admin</span></span>
        <div style={s.links}>
          <Link href="/admin" style={s.link}>Overview</Link>
          <Link href="/admin/users" style={s.link}>Users</Link>
          <Link href="/admin/notifications" style={s.link}>Notifications</Link>
          <Link href="/dashboard" style={s.link}>← App</Link>
          <form action={logout}>
            <button type="submit" style={s.signOut}>Sign Out</button>
          </form>
        </div>
      </nav>
      <main style={s.main}>{children}</main>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1rem 1.5rem', borderBottom: '1px solid #1a1a1a',
  },
  brand: { fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  badge: {
    fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: '#1a1a1a',
    border: '1px solid #333', borderRadius: '4px', color: '#888', fontWeight: 400,
  },
  links: { display: 'flex', alignItems: 'center', gap: '1.25rem' },
  link: { color: '#666', textDecoration: 'none', fontSize: '0.8rem' },
  signOut: { background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: '0.8rem', padding: 0 },
  main: { flex: 1, padding: '1.5rem', maxWidth: '900px', width: '100%', margin: '0 auto' },
}
