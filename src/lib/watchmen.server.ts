import { supabaseAdmin } from '@/integrations/supabase/client.server';

export type WatchmanRow = {
  id: string;
  path_id: string;
  watchman_id: string | null;
  watchman_email: string;
  relationship: string | null;
  created_at: string;
  first_name: string | null;
  phone: string | null;
};

/** All active watchmen on a path, oldest first, hydrated with profile info. */
export async function activeWatchmen(pathId: string): Promise<WatchmanRow[]> {
  const { data } = await supabaseAdmin
    .from('path_watchmen')
    .select('id, path_id, watchman_id, watchman_email, relationship, created_at')
    .eq('path_id', pathId)
    .eq('status', 'active')
    .order('created_at', { ascending: true });
  return hydrate(data ?? []);
}

/** Active watchmen for many paths at once, keyed by path_id. */
export async function activeWatchmenFor(pathIds: string[]): Promise<Map<string, WatchmanRow[]>> {
  const map = new Map<string, WatchmanRow[]>();
  if (!pathIds.length) return map;
  const { data } = await supabaseAdmin
    .from('path_watchmen')
    .select('id, path_id, watchman_id, watchman_email, relationship, created_at')
    .in('path_id', pathIds)
    .eq('status', 'active')
    .order('created_at', { ascending: true });
  for (const row of await hydrate(data ?? [])) {
    const list = map.get(row.path_id) ?? [];
    list.push(row);
    map.set(row.path_id, list);
  }
  return map;
}

/** Just the user ids of every active watchman on a path. */
export async function activeWatchmanIds(pathId: string): Promise<string[]> {
  const { data } = await supabaseAdmin
    .from('path_watchmen')
    .select('watchman_id')
    .eq('path_id', pathId)
    .eq('status', 'active');
  return (data ?? []).map((r: any) => r.watchman_id).filter(Boolean) as string[];
}

/** Path ids this user actively watches. */
export async function watchedPathIds(userId: string): Promise<string[]> {
  const { data } = await supabaseAdmin
    .from('path_watchmen')
    .select('path_id')
    .eq('watchman_id', userId)
    .eq('status', 'active');
  return (data ?? []).map((r: any) => r.path_id);
}

/** Is this user an active watchman on this path? */
export async function isActiveWatchman(pathId: string, userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('path_watchmen')
    .select('id')
    .eq('path_id', pathId)
    .eq('watchman_id', userId)
    .eq('status', 'active')
    .maybeSingle();
  return !!data;
}

async function hydrate(rows: any[]): Promise<WatchmanRow[]> {
  const ids = [...new Set(rows.map((r) => r.watchman_id).filter(Boolean))] as string[];
  const profiles = new Map<string, { first_name: string | null; phone: string | null; email: string }>();
  if (ids.length) {
    const { data } = await supabaseAdmin
      .from('profiles')
      .select('user_id, first_name, phone, email')
      .in('user_id', ids);
    for (const p of data ?? []) profiles.set(p.user_id, { first_name: p.first_name, phone: p.phone, email: p.email });
  }
  return rows.map((r) => {
    const p = r.watchman_id ? profiles.get(r.watchman_id) : undefined;
    return {
      id: r.id,
      path_id: r.path_id,
      watchman_id: r.watchman_id,
      watchman_email: r.watchman_email || p?.email || '',
      relationship: r.relationship ?? null,
      created_at: r.created_at,
      first_name: p?.first_name ?? null,
      phone: p?.phone ?? null,
    };
  });
}

/** Display name for a watchman row — first name, else email. */
export function watchmanName(w: { first_name: string | null; watchman_email: string }): string {
  return (w.first_name || '').trim() || w.watchman_email || '—';
}
