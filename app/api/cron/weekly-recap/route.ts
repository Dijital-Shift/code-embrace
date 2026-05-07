import { NextResponse } from 'next/server'
import { sendWeeklyRecaps } from '@/lib/recap/weekly'

// Runs Sunday at 8AM UTC
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await sendWeeklyRecaps()
  return NextResponse.json({ ok: true })
}
