/** Iron Freeze: a Path's end date may only be changed in the first 30 minutes. */
export const END_DATE_GRACE_MS = 30 * 60 * 1000;

export function endDateEditable(createdAt: string, now: Date = new Date()): boolean {
  return now.getTime() - new Date(createdAt).getTime() < END_DATE_GRACE_MS;
}

/** A course is complete once its end date has passed in the owner's local day. */
export function courseComplete(endsAt: string | null | undefined, today: string): boolean {
  return !!endsAt && endsAt < today;
}

/** Extension after completion: new end date must be after today, or null (open-ended). */
export function validExtension(newEndsAt: string | null, today: string): boolean {
  return newEndsAt === null || newEndsAt > today;
}

/** Hard delete only within 30 minutes of creation, with no check-ins and no Watchman. Otherwise: Archive. */
export const DELETE_GRACE_MS = 30 * 60 * 1000;
export function pathDeletable(createdAt: string, checkinCount: number, watchmanCount: number, now: Date = new Date()): boolean {
  return watchmanCount === 0 && checkinCount === 0 && now.getTime() - new Date(createdAt).getTime() < DELETE_GRACE_MS;
}
