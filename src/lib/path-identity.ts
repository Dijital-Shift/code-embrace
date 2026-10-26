export const IDENTITY_GRACE_MS = 30 * 60 * 1000;

/** Correct a new commitment only before anyone has relied on it. */
export function pathIdentityEditable(createdAt: string, checkins: number, watchmen: number, now = new Date()): boolean {
  const age = now.getTime() - new Date(createdAt).getTime();
  return Number.isFinite(age) && age >= 0 && age < IDENTITY_GRACE_MS && checkins === 0 && watchmen === 0;
}

export function pathIdentityChanged(current: { title: string; description?: string | null }, next: { title: string; description?: string | null }): boolean {
  return next.title.trim() !== current.title || (next.description?.trim() || null) !== (current.description || null);
}