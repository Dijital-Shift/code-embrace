// Offline check-ins: a small localStorage queue plus a cached copy of the
// last Check-In page. Queued entries store the real calendar date so a
// check-in saved offline lands on the right day even if it syncs later.
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCheckinPage, submitCheckin, skipCheckin } from "@/lib/api.functions";

export type QueuedCheckin = {
  id: string;
  laneId: string;
  date: string; // YYYY-MM-DD in the user's timezone
  kind: "aligned" | "breach" | "skip";
  explanation: string | null;
  queuedAt: number;
};

const QUEUE_KEY = "kp-offline-checkins";
const CACHE_KEY = "kp-checkin-cache";
export const QUEUE_EVENT = "kp-offline-queue";

const hasLS = () => typeof window !== "undefined" && !!window.localStorage;

export function readQueue(): QueuedCheckin[] {
  if (!hasLS()) return [];
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]"); } catch { return []; }
}
function writeQueue(q: QueuedCheckin[]) {
  if (!hasLS()) return;
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  window.dispatchEvent(new Event(QUEUE_EVENT));
}
export function enqueueCheckin(item: Omit<QueuedCheckin, "id" | "queuedAt">) {
  const q = readQueue().filter((x) => !(x.laneId === item.laneId && x.date === item.date));
  q.push({ ...item, id: `${item.laneId}-${item.date}`, queuedAt: Date.now() });
  writeQueue(q);
}
export function dequeueCheckin(laneId: string, date: string) {
  writeQueue(readQueue().filter((x) => !(x.laneId === laneId && x.date === date)));
}

export function saveCheckinCache(data: unknown) {
  if (!hasLS()) return;
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
}
export function readCheckinCache<T = any>(): T | null {
  if (!hasLS()) return null;
  try { const v = localStorage.getItem(CACHE_KEY); return v ? JSON.parse(v) : null; } catch { return null; }
}

/** A fetch failure (no signal) — as opposed to a real server answer. */
export function isNetworkError(e: unknown) {
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;
  const msg = String((e as any)?.message ?? e ?? "");
  return /fetch|network|load failed|offline/i.test(msg);
}

let syncing = false;

/** Replays queued check-ins when the device is back online. Mount once. */
export function useOfflineCheckinSync(enabled: boolean) {
  const qc = useQueryClient();
  const page = useServerFn(getCheckinPage);
  const submit = useServerFn(submitCheckin);
  const skip = useServerFn(skipCheckin);

  useEffect(() => {
    if (!enabled) return;
    async function flush() {
      if (syncing || !navigator.onLine || readQueue().length === 0) return;
      syncing = true;
      try {
        const p: any = await page();
        for (const item of readQueue()) {
          const forDay = item.date === p.today ? "today" : item.date === p.yesterday ? "yesterday" : null;
          if (!forDay) { dequeueCheckin(item.laneId, item.date); continue; } // too old to record
          try {
            if (item.kind === "skip") await skip({ data: { laneId: item.laneId, forDay } });
            else await submit({ data: { laneId: item.laneId, response: item.kind, explanation: item.explanation, forDay } });
            dequeueCheckin(item.laneId, item.date); // server answered (ok or rejected)
          } catch (e) {
            if (isNetworkError(e)) break; // still offline — try again later
            dequeueCheckin(item.laneId, item.date);
          }
        }
        qc.invalidateQueries({ queryKey: ["checkin"] });
        qc.invalidateQueries({ queryKey: ["dashboard"] });
      } catch { /* offline or not signed in — retry later */ }
      finally { syncing = false; }
    }
    flush();
    window.addEventListener("online", flush);
    const t = setInterval(flush, 60_000);
    return () => { window.removeEventListener("online", flush); clearInterval(t); };
  }, [enabled, page, submit, skip, qc]);
}
