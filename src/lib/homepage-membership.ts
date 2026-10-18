type HomepageAccess = { hasAccess: boolean; isLifetime: boolean; planLockedIn: boolean };

/** Presentation only: use the existing access decision, never grant access here. */
export function homepageMembership(access?: HomepageAccess | null): "lifetime" | "monthly" | null {
  if (!access?.hasAccess) return null;
  if (access.isLifetime) return "lifetime";
  return access.planLockedIn ? "monthly" : null;
}