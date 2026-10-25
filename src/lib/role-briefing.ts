export type BriefingRole = "walker" | "watchman";

export function briefingDismissalKey(userId: string, role: BriefingRole) {
  return `kp-role-briefing:v1:${userId}:${role}`;
}