'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Layers, CheckCircle, Users, Settings } from 'lucide-react'

const items = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/lanes', icon: Layers, label: 'Lanes' },
  { href: '/checkin', icon: CheckCircle, label: 'Check In' },
  { href: '/partner', icon: Users, label: 'Partner' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav style={s.bar}>
      {items.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
        const color = active ? '#c9a84c' : '#444'
        return (
          <Link key={href} href={href} style={s.item}>
            <Icon size={22} strokeWidth={active ? 2.5 : 1.5} color={color} />
            <span style={{ ...s.label, color }}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

const s: Record<string, React.CSSProperties> = {
  bar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '64px',
    background: '#0a0a0a',
    borderTop: '1px solid #1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 100,
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    flex: 1,
    height: '100%',
    textDecoration: 'none',
  },
  label: {
    fontSize: '0.58rem',
    fontWeight: 500,
    letterSpacing: '0.03em',
  },
}
