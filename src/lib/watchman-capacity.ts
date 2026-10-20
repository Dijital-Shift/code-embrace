export type WatchmanAssignment = {
  status: string;
  lanes: { user_id: string; status: string };
};

/** Capacity is per owner, never the Watchman's total across people. */
export function canWatchAnotherPath(assignments: WatchmanAssignment[], ownerId: string): boolean {
  return assignments.filter((assignment) =>
    assignment.status === 'active' && assignment.lanes.status === 'active' &&
    assignment.lanes.user_id === ownerId,
  ).length < 2;
}

export function watchmanCapacityMessage(ownerName: string): string {
  return `You're already watching 2 Paths for ${ownerName}. You can still watch Paths for other people.`;
}