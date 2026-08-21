import { localDate, prevDay, DEFAULT_TZ } from './localday';

/**
 * Short-lived per-process cache of a user's timezone. A single page load fires
 * several server functions that each need "today"; without this they each hit
 * profiles for the same string. TTL is short and the cache is cleared whenever
 * the user changes their timezone, so day boundaries can never drift.
 */
const TTL_MS = 60_000;
const tzCache = new Map<string, { tz: string; at: number }>();

export function invalidateUserTimezone(userId: string) {
  tzCache.delete(userId);
}

export async function getUserTimezone(supabase: any, userId: string) {
  const hit = tzCache.get(userId);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.tz;
  let tz = DEFAULT_TZ;
  try {
    const { data } = await supabase.from('profiles').select('timezone').eq('user_id', userId).maybeSingle();
    tz = data?.timezone || DEFAULT_TZ;
  } catch {}
  tzCache.set(userId, { tz, at: Date.now() });
  return tz;
}

/**
 * The authoritative "today" for a given user, in THEIR timezone.
 * Every date-sensitive write/read must go through this so check-ins and the
 * escalation cron can never disagree about which day it is.
 */
export async function userDay(supabase: any, userId: string) {
  const tz = await getUserTimezone(supabase, userId);
  const today = localDate(tz);
  return { tz, today, yesterday: prevDay(today) };
}
