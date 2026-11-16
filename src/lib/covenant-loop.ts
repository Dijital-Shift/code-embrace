/** The five-beat accountability loop shown at the top of How It Works. Pure, client-safe sequencing. */
export type LoopBeatId = "create" | "invite" | "checkin" | "alarm" | "watch";
export type LoopRole = "walker" | "watchman";

export const LOOP_FRAME_MS = 2800;

export const LOOP_BEATS: readonly { id: LoopBeatId; frames: number; roles: readonly LoopRole[] }[] = [
  { id: "create", frames: 3, roles: ["walker", "walker", "walker"] },
  { id: "invite", frames: 4, roles: ["walker", "walker", "watchman", "walker"] },
  { id: "checkin", frames: 4, roles: ["walker", "walker", "walker", "walker"] },
  { id: "alarm", frames: 3, roles: ["watchman", "watchman", "watchman"] },
  { id: "watch", frames: 3, roles: ["watchman", "watchman", "watchman"] },
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

export function loopDurationMs(): number {
  return LOOP_BEATS.reduce((n, b) => n + b.frames, 0) * LOOP_FRAME_MS;
}
