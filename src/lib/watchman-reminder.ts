export type ReminderPath = {
  id: string;
  title: string;
  status: string;
  watchmen: number;
  endsAt?: string | null;
  today?: string;
};

export type ReminderInvite = { status: string; expires_at: string };

export function needsWatchman(path: ReminderPath): boolean {
  return path.status === 'active' && path.watchmen === 0 &&
    !(path.endsAt && path.today && path.endsAt < path.today);
}

export function hasPendingWatchman(invites: readonly ReminderInvite[], now = Date.now()): boolean {
  return invites.some((invite) => invite.status === 'pending' && new Date(invite.expires_at).getTime() > now);
}