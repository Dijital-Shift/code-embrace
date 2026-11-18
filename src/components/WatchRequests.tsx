import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { acceptLaneInvite } from "@/lib/invites.functions";
import { declineWatchRequest, listWatchRequests } from "@/lib/watch-requests.functions";

// Requests addressed to this Watchman by name. Accept uses the same seat and pair limits as any link.
export function WatchRequests() {
  const qc = useQueryClient();
  const listFn = useServerFn(listWatchRequests);
  const acceptFn = useServerFn(acceptLaneInvite);
  const declineFn = useServerFn(declineWatchRequest);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { data: requests = [] } = useQuery({ queryKey: ["watch-requests"], queryFn: () => listFn(), staleTime: 30_000 });
  if (!requests.length) return null;

  async function act(inviteId: string, run: () => Promise<any>, done: string) {
    if (busyId) return;
    setBusyId(inviteId);
    const r = await run().catch(() => ({ error: "Something went wrong. Try again." }));
    setBusyId(null);
    if (r?.error) { toast.error(r.error); return; }
    try { navigator.vibrate?.(25); } catch { /* unsupported */ }
    toast.success(done);
    void qc.invalidateQueries({ queryKey: ["watch-requests"] });
    void qc.invalidateQueries({ queryKey: ["partner"] });
  }

  return (
    <div className="mb-8 space-y-3">
      {requests.map((r) => {
        const first = r.ownerName.split(" ")[0];
        return (
          <article key={r.inviteId} className="relative rounded-lg border border-primary/50 bg-card p-5">
            <span className={`absolute top-3 right-3 rounded border px-2 py-1 text-xs font-semibold ${r.isAvoid ? "text-history-breach border-action-ember-edge" : "text-history-held border-action-gold-edge"}`}>
              {r.isAvoid ? "Flee" : "Pursue"}
            </span>
            <p className="mb-2 text-xs font-semibold uppercase text-primary">Watch request</p>
            <h3 className="pr-16 text-base font-semibold text-parchment">{first} asked you to watch their Path</h3>
            <p className="mt-2 break-words text-sm font-semibold text-parchment">“{r.laneTitle}”</p>
            {r.laneDescription && <p className="mt-1 break-words text-sm leading-relaxed text-stone">{r.laneDescription}</p>}
            <div className="mt-4 flex flex-wrap gap-3">
              <Button className="min-h-11 font-semibold" disabled={busyId !== null}
                onClick={() => act(r.inviteId, () => acceptFn({ data: { token: r.token } }), `You're now watching ${first}'s Path.`)}>
                {busyId === r.inviteId ? "Working…" : "Accept Watch"}
              </Button>
              <Button variant="outline" className="min-h-11 text-secondary-foreground" disabled={busyId !== null}
                onClick={() => act(r.inviteId, () => declineFn({ data: { inviteId: r.inviteId } }), "Request declined.")}>
                Decline
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
