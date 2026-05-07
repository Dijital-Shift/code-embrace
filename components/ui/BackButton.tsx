'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

export default function BackButton({ href }: { href?: string }) {
  const router = useRouter()

  return (
    <button
      onClick={() => href ? router.push(href) : router.back()}
      style={{
        background: 'none',
        border: 'none',
        color: '#666',
        cursor: 'pointer',
        padding: '0.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '44px',
        minWidth: '36px',
      }}
      aria-label="Go back"
    >
      <ChevronLeft size={22} strokeWidth={2} />
    </button>
  )
}
