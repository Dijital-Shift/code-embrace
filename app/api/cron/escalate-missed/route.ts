import { NextResponse } from 'next/server'
import { escalateMissedToPartners } from '@/lib/checkin/actions'

// Runs every morning at 7AM UTC
// Escalates missed check-ins to partners only if user didn't self-correct overnight
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await escalateMissedToPartners()
  return NextResponse.json({ ok: true })
}
