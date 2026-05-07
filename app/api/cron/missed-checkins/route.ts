import { NextResponse } from 'next/server'
import { markMissedCheckins } from '@/lib/checkin/actions'

// Triggered by Vercel Cron — runs nightly after check-in window closes (e.g. 11PM)
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await markMissedCheckins()
  return NextResponse.json({ ok: true })
}
