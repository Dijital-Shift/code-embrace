import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getWatchReferralOffer, requestWatchFromReferrer } from "@/lib/watch-requests.functions";

const dismissKey = (laneId: string) => `kp-stand-with-dismissed:${laneId}`;

// Offers the person whose Watchman link brought this member in as a Watchman for this Path.
export function StandWithCard({ laneId }: { laneId: string }) {
  const qc = useQueryClient();
  const offerFn = useServerFn(getWatchReferralOffer);
  const requestFn = useServerFn(requestWatchFromReferrer);
  const [dismissed, setDismissed] = useState(true);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    try { setDismissed(localStorage.getItem(dismissKey(laneId)) === "1"); } catch { setDismissed(false); }
  }, [laneId]);
  const { data } = useQuery({
    queryKey: ["watch-offer", laneId],
    queryFn: () => offerFn({ data: { laneId } }),
    staleTime: 60_000,
  });
  if (!data || data.state !== "offer" || dismissed || !data.name) return null;
  const name = data.name;

  async function send() {
    if (busy) return;
    setBusy(true);
    const r: any = await requestFn({ data: { laneId } }).catch(() => ({ error: "Couldn't send the request. Try again." }));
    setBusy(false);
    if (r?.error) { toast.error(r.error); return; }
    try { navigator.vibrate?.(25); } catch { /* unsupported */ }
    toast.success(`Request sent to ${name}.`);
    void qc.invalidateQueries({ queryKey: ["watch-offer", laneId] });
    void qc.invalidateQueries({ queryKey: ["invites", laneId] });
    void qc.invalidateQueries({ queryKey: ["lanes"] });
  }

  function notNow() {
    try { localStorage.setItem(dismissKey(laneId), "1"); } catch { /* blocked */ }
    setDismissed(true);
  }

  return (
    <section aria-labelledby="stand-with-title" className="mt-6 rounded-lg border border-primary/50 bg-card p-5">
      <h2 id="stand-with-title" className="kp-briefing-title text-lg font-semibold text-parchment">Stand with {name}</h2>
      <div className="my-3 h-px w-12 bg-primary/50" />
      <p className="text-sm leading-relaxed text-secondary-foreground">
        {name} invited you to stand watch. Do you want {name} to watch your wall on this Path?
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button onClick={send} disabled={busy} className="min-h-11 font-semibold">
          {busy ? "Sending…" : `Invite ${name}`}
        </Button>
        <Button variant="ghost" onClick={notNow} className="min-h-11 text-stone">Not now</Button>
      </div>
    </section>
  );
}
