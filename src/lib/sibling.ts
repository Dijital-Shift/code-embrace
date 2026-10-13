/**
 * Gender-aware "reach out" copy. Gender is optional, so the neutral form must
 * always read naturally on its own.
 */
export function siblingTerm(gender: string | null | undefined): string {
  if (gender === 'male') return 'brother';
  if (gender === 'sister' || gender === 'female') return 'sister';
  return 'them';
}

/** "Reach out to your brother." / "…sister." / "…them." */
export function reachOutLine(gender: string | null | undefined): string {
  const term = siblingTerm(gender);
  return term === 'them' ? 'Reach out to them.' : `Reach out to your ${term}.`;
}
