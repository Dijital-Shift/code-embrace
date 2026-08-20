import { localDate, prevDay, DEFAULT_TZ } from './localday';

/**
 * The authoritative "today" for a given user, in THEIR timezone.
 * Every date-sensitive write/read must go through this so check-ins and the
 * escalation cron can never disagree about which day it is.
 */
export async function userDay(supabase: any, userId: string) {
  let tz = DEFAULT_TZ;
  try {
    const { data } = await supabase.from('profiles').select('timezone').eq('user_id', userId).maybeSingle();
    tz = data?.timezone || DEFAULT_TZ;
  } catch {}
  const today = localDate(tz);
  return { tz, today, yesterday: prevDay(today) };
}
