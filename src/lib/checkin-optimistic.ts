/**
 * Client-safe: move one Path into Logged inside the cached Check-In page, so the
 * card leaves on the tap instead of lingering until the refetch lands.
 */
export function withLoggedCheckin<T extends { checkins?: any[]; catchUp?: string[] }>(
  data: T,
  laneId: string,
  date: string,
  status: "completed" | "breached" | "skipped",
  day: "today" | "yesterday",
  now: Date = new Date(),
): T {
  const row = { lane_id: laneId, checkin_date: date, status, completion_time: now.toISOString() };
  return {
    ...data,
    checkins: [
      ...(data.checkins ?? []).filter((c) => !(c.lane_id === laneId && c.checkin_date === date)),
      row,
    ],
    catchUp: day === "yesterday" ? (data.catchUp ?? []).filter((id) => id !== laneId) : data.catchUp,
  };
}
