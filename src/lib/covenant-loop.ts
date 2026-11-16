/** The five-beat accountability loop shown at the top of How It Works. Pure, client-safe sequencing. */
export type LoopBeatId = "create" | "invite" | "checkin" | "alarm" | "watch";
export type LoopRole = "walker" | "watchman";


/** Per-frame dwell: quick taps snap (~1.8s); reading and payoff frames hold (2.8–3.2s). */
export const LOOP_BEATS: readonly { id: LoopBeatId; frames: number; roles: readonly LoopRole[]; dwell: readonly number[] }[] = [
  { id: "create", frames: 3, roles: ["walker", "walker", "walker"], dwell: [1800, 1800, 2800] },
  { id: "invite", frames: 4, roles: ["walker", "walker", "watchman", "walker"], dwell: [1800, 2800, 1800, 2800] },
  { id: "checkin", frames: 4, roles: ["walker", "walker", "walker", "walker"], dwell: [1800, 1800, 3000, 3000] },
  { id: "alarm", frames: 3, roles: ["watchman", "watchman", "watchman"], dwell: [2800, 3200, 3200] },
  { id: "watch", frames: 3, roles: ["watchman", "watchman", "watchman"], dwell: [2800, 3200, 3200] },
];

export type LoopPosition = { beat: number; frame: number };

/** Advance one frame; the last frame of the Watchman's answer returns to creating a Path. */
export function nextLoopPosition(p: LoopPosition): LoopPosition {
  const beat = LOOP_BEATS[p.beat];
  if (!beat) return { beat: 0, frame: 0 };
  if (p.frame + 1 < beat.frames) return { beat: p.beat, frame: p.frame + 1 };
  return { beat: (p.beat + 1) % LOOP_BEATS.length, frame: 0 };
}

export function loopFrameRole(p: LoopPosition): LoopRole {
  return LOOP_BEATS[p.beat]?.roles[p.frame] ?? "walker";
}

export function loopFrameMs(p: LoopPosition): number {
  return LOOP_BEATS[p.beat]?.dwell[p.frame] ?? 2800;
}

export function loopDurationMs(): number {
  return LOOP_BEATS.reduce((n, b) => n + b.dwell.reduce((a, d) => a + d, 0), 0);
}
