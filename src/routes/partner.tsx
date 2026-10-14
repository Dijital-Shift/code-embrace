import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getPartnerView, sendEncouragement, dismissWatchmanPrompt } from "@/lib/api.functions";
import { AppLayout } from "@/components/AppLayout";
import { WatchmanPushPrompt } from "@/components/WatchmanPushPrompt";


export const Route = createFileRoute("/partner")({
  head: () => ({ meta: [
    { title: "Watchman — Kingdom Protocol" },
    { name: "description", content: "Review your Watchman assignments and accountability alerts." },
    { property: "og:title", content: "Watchman — Kingdom Protocol" },
    { property: "og:description", content: "Review your Watchman assignments and accountability alerts." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  loader: ({ context }) => {
    if (typeof window === "undefined") return;
    void context.queryClient.prefetchQuery({ queryKey: ["partner"], queryFn: () => getPartnerView() }).catch(() => {});
  },
  component: () => <AppLayout><Partner /></AppLayout>,
});

function Partner() {
  const fn = useServerFn(getPartnerView);
  const sendFn = useServerFn(sendEncouragement);
  const dismissFn = useServerFn(dismissWatchmanPrompt);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["partner"], queryFn: () => fn() });
  

  const dismissMut = useMutation({
    mutationFn: () => dismissFn(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["partner"] }),
  });

  if (isLoading) return <p className="text-[#9e968a]">Loading…</p>;
  const lanes = data?.lanes ?? [];
  const todayCheckins = data?.todayCheckins ?? [];
  const notifications = data?.notifications ?? [];
  const today = new Map(todayCheckins.map((c) => [c.lane_id, c]));
  const active = lanes.filter((l) => l.status === "active");
  const inactive = lanes.filter((l) => l.status !== "active");
  const statusColor: Record<string, string> = { completed: "#4ade80", breached: "#f87171", missed: "#f59e0b", pending: "#333", skipped: "#c9a84c" };

  // A watchman can hold several paths. Only the ones actually asking for a
  // response open by default; the rest stay one quiet line each.
  const needsYou = active.filter((l) => {
    if (l.resting) return false;
    const c = today.get(l.lane_id);
    return c?.status === "breached" || c?.status === "missed";
  });
  const resting = active.filter((l) => l.resting);
  const quiet = active.filter((l) => !needsYou.includes(l) && !l.resting);

  const showMicroPrompt =
    (data?.myEncouragementCount ?? 0) >= 1 &&
    (data?.myActiveLaneCount ?? 0) === 0 &&
    !data?.dismissedWatchmanPrompt;

  return (
    <div>
      <WatchmanPushPrompt />

      <div className="mb-8">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold mb-1">Your Assignments</h2>
        </div>
        <p className="text-[#a8a094] text-sm">You'll only be pinged when something goes wrong. Silence means they're aligned.</p>
        {lanes.length > 0 && (
          <p className="text-[0.7rem] text-[#c9a84c] mt-2">Tap a path to send encouragement.</p>
        )}
      </div>

      {showMicroPrompt && (
        <div className="p-5 rounded-xl border border-[#c9a84c]/50 mb-6" style={{ background: "linear-gradient(135deg, #1a1408 0%, #0a0800 100%)" }}>
          <p className="font-semibold mb-1 text-[#c9a84c]">You just held someone up.</p>
          <p className="text-xs text-[#c2af80] mb-3">The watch goes both ways — start your own path when you're ready.</p>
          <div className="flex gap-2">
            <Link to="/paths/new" className="inline-block px-4 py-2 bg-[#c9a84c] text-black rounded-md text-xs font-bold">Start a path</Link>
            <button onClick={() => dismissMut.mutate()} className="text-xs text-[#a8a094] px-3 py-2">Not now</button>
          </div>
        </div>
      )}

      {active.length > 0 && !showMicroPrompt && (data?.myActiveLaneCount ?? 0) === 0 && (
        <div className="p-5 rounded-xl border border-[#2a2000] mb-8" style={{ background: "#0a0800" }}>
          <p className="font-semibold mb-1 text-[#c9a84c]">You're holding someone up. Who's holding you?</p>
          <p className="text-xs text-[#a8a094] mb-3">The watch goes both ways. Start your own path when you're ready — no rush.</p>
          <Link to="/paths/new" className="inline-block px-5 py-2 bg-[#c9a84c] text-black rounded-md text-xs font-bold">Start a path of your own</Link>
        </div>
      )}

      {lanes.length === 0 && (
        <div className="text-center pt-12">
          <p className="text-[#9e968a] text-sm mb-4">No paths assigned to you yet.</p>
          <Link to="/paths/new" className="inline-block px-5 py-2 bg-[#c9a84c] text-black rounded-md text-xs font-bold">Set up your own</Link>
        </div>
      )}

      {needsYou.length > 0 && (
        <section className="mb-10">
          <p className="text-[0.65rem] text-[#f87171] uppercase tracking-wider mb-3 font-semibold">Needs you ({needsYou.length})</p>
          <div className="flex flex-col gap-3">
            {needsYou.map((lane) => (
              <AssignmentCard
                key={lane.lane_id} lane={lane} checkin={today.get(lane.lane_id)} statusColor={statusColor}
                defaultOpen sendFn={sendFn} onSent={() => qc.invalidateQueries({ queryKey: ["partner"] })}
              />
            ))}
          </div>
        </section>
      )}

      {quiet.length > 0 && (
        <section className="mb-10">
          <p className="text-[0.65rem] text-[#4ade80] uppercase tracking-wider mb-3 font-semibold">Quiet — walking well ({quiet.length})</p>
          <div className="flex flex-col gap-1.5">
            {quiet.map((lane) => (
              <AssignmentCard
                key={lane.lane_id} lane={lane} checkin={today.get(lane.lane_id)} statusColor={statusColor}
                sendFn={sendFn} onSent={() => qc.invalidateQueries({ queryKey: ["partner"] })}
              />
            ))}
          </div>
        </section>
      )}

      {resting.length > 0 && (
        <section className="mb-10">
          <p className="text-[0.65rem] text-[#948d80] uppercase tracking-wider mb-1 font-semibold">Resting ({resting.length})</p>
          <p className="text-[0.7rem] text-[#7d776c] mb-3">Their account is paused for now. No alerts until they pick it back up.</p>
          <div className="flex flex-col gap-1.5">
            {resting.map((lane) => (
              <AssignmentCard
                key={lane.lane_id} lane={lane} checkin={today.get(lane.lane_id)} statusColor={statusColor}
                sendFn={sendFn} onSent={() => qc.invalidateQueries({ queryKey: ["partner"] })}
              />
            ))}
          </div>
        </section>
      )}

      {inactive.length > 0 && (
        <section className="mb-10">
          <p className="text-[0.65rem] text-[#a8a094] uppercase tracking-wider mb-3 font-semibold">Inactive</p>
          <div className="flex flex-col gap-3">
            {inactive.map((lane) => (
              <div key={lane.lane_id} className="p-4 rounded-lg border border-[#1a1a1a] opacity-60" style={{ background: "#0d0d0d" }}>
                <div className="flex justify-between items-center gap-3">
                  <p className="font-semibold text-sm truncate">{lane.title}</p>
                  <span className="text-[0.6rem] uppercase tracking-wider px-2 py-0.5 rounded border border-[#2a2518] text-[#948d80] shrink-0">{lane.status === "archived" ? "Archived" : "Paused"}</span>
                </div>
                <p className="text-xs text-[#948d80]">{lane.owner?.first_name || lane.owner?.email}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {(data?.sentEncouragements ?? []).length > 0 && (
        <section className="mb-10">
          <p className="text-[0.65rem] text-[#a8a094] uppercase tracking-wider mb-3 font-semibold">Recent encouragements sent</p>
          <div className="flex flex-col gap-3">
            {(data?.sentEncouragements ?? []).slice(0, 3).map((e: any) => (
              <div key={e.id} className="p-4 rounded-lg border border-[#2a2518]" style={{ background: "#161210" }}>
                <div className="flex justify-between items-center mb-1.5 gap-3">
                  <span className="text-xs font-semibold text-[#c9a84c] truncate">{e.lane_title}</span>
                  <span className="text-[0.7rem] text-[#a8a094] shrink-0">
                    {new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                {e.context && (
                  <p className="text-[0.65rem] uppercase tracking-wider text-[#c9a84c] font-semibold mb-1">{e.context}</p>
                )}
                <p className="text-xs text-[#ded8cc] leading-relaxed whitespace-pre-wrap">{e.body}</p>

              </div>
            ))}
          </div>
        </section>
      )}


      {notifications.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <p className="text-[0.65rem] text-[#a8a094] uppercase tracking-wider font-semibold">Alert History</p>
            <p className="text-[0.7rem] text-[#948d80]">
              <span className="text-[#f59e0b] font-semibold">{notifications.filter((n) => n.type !== "breach_report").length} silent</span>
              <span className="mx-1.5">·</span>
              <span className="text-[#f87171] font-semibold">{notifications.filter((n) => n.type === "breach_report").length} breach</span>
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            {groupAlerts(notifications, lanes).map((g) => (
              <AlertGroup key={g.key} group={g} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

/**
 * One watched path. Urgent ones render expanded; quiet ones collapse to a
 * single line so watching several people stays readable.
 */
function AssignmentCard({ lane, checkin: c, statusColor, defaultOpen = false, sendFn, onSent }: {
  lane: any; checkin: any; statusColor: Record<string, string>; defaultOpen?: boolean; sendFn: any; onSent: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const todayLabel = c ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : "Pending";
  const todayCol = c ? statusColor[c.status] ?? "#333" : "#f59e0b";
  const needsContact = c?.status === "breached" || c?.status === "missed";
  const phone = lane.owner?.phone;
  const rel = lane.partner_relationship as string | null | undefined;

  return (
    <div className="rounded-lg border border-[#1a1a1a]" style={{ background: "#0d0d0d" }}>
      <button
        type="button" onClick={() => setOpen((v) => !v)}
        className="w-full flex justify-between items-center gap-3 text-left px-4 py-3"
      >
        <div className="min-w-0 flex items-center gap-3">
          {lane.owner?.avatar_url && (
            <img
              src={lane.owner.avatar_url} alt=""
              className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#c9a84c]/40"
            />
          )}
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{lane.title}</p>
            <p className="text-xs text-[#948d80] truncate">
              {rel && <span className="text-[#c9a84c] font-semibold">{rel} · </span>}
              {lane.owner?.first_name || lane.owner?.email}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-semibold" style={{ color: lane.resting ? "#948d80" : todayCol }}>
            {lane.resting ? "Resting" : todayLabel}
          </p>
          <p className="text-[0.65rem] text-[#c9a84c]">{open ? "Hide" : "Tap to encourage"}</p>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4">
          {lane.resting && (
            <p className="text-xs text-[#948d80] mb-3 leading-relaxed">
              This path is resting. Their history is all still here — you just won't get alerts
              until they pick it back up.
            </p>
          )}
          {lane.notes && (
            <div className="mb-3 pl-2.5 border-l-2 border-[#c9a84c]/50">
              <p className="text-[0.6rem] uppercase tracking-wider text-[#c9a84c] font-semibold mb-0.5">Notes from them</p>
              <p className="text-xs text-[#ded8cc] whitespace-pre-wrap">{lane.notes}</p>
            </div>
          )}
          {c?.status === "breached" && c.breach_explanation && (
            <div className="p-2.5 rounded mb-3 border border-[#3d1515]" style={{ background: "#1a0a0a" }}>
              <p className="text-[0.7rem] text-[#f87171] font-semibold mb-1">Breach explanation</p>
              <p className="text-xs text-[#ded8cc]">{c.breach_explanation}</p>
            </div>
          )}
          {needsContact && phone && (
            <div className="flex items-center gap-2 mb-3">
              <a href={`tel:${phone}`} className="px-5 py-2 rounded text-sm font-semibold bg-white text-black border border-[#222]">Call</a>
              <a href={`sms:${phone}`} className="px-5 py-2 rounded text-sm font-semibold text-white border border-[#222]" style={{ background: "#1a1a1a" }}>Text</a>
              <span className="text-xs text-[#948d80] ml-1">{phone}</span>
            </div>
          )}
          {needsContact && !phone && <p className="text-xs text-[#9e968a] mb-3">No phone number on file — reach out another way.</p>}
          <EncourageBox laneId={lane.lane_id} send={sendFn} alert={lane.latestAlert ?? null} onSent={onSent} />
        </div>
      )}
    </div>
  );
}

function EncourageBox({ laneId, send, onSent, alert }: { laneId: string; send: any; onSent: () => void; alert?: { checkin_id: string; label: string } | null }) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [linked, setLinked] = useState(true);

  const attach = !!alert && linked;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true); setErr(null);
    const r = await send({ data: { laneId, body: body.trim(), checkinId: attach ? alert!.checkin_id : null } });
    setBusy(false);
    if (r?.error) { setErr(r.error); return; }
    setBody(""); setSent(true);
    setTimeout(() => setSent(false), 2500);
    onSent();
  }

  return (
    <form onSubmit={submit} className="mt-2 pt-3 border-t border-[#1a1a1a]">
      <p className="text-[0.6rem] uppercase tracking-wider text-[#a8a094] font-semibold mb-2">Send encouragement</p>
      {alert && (
        <label className="flex items-center gap-2 mb-2 cursor-pointer">
          <input type="checkbox" checked={linked} onChange={(e) => setLinked(e.target.checked)} className="accent-[#c9a84c]" />
          <span className="text-[0.7rem] text-[#c9a84c] font-semibold">{alert.label}</span>
        </label>
      )}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value.slice(0, 280))}
        rows={2}
        placeholder="A verse, a line, a prayer. They'll see it."
        className="w-full px-3 py-2 text-base bg-[#0a0800] border border-[#2a2518] rounded text-white outline-none resize-none"
      />

      <div className="flex justify-between items-center mt-2">
        <span className="text-[0.65rem] text-[#948d80]">{body.length}/280</span>
        <button disabled={busy || !body.trim()} className="text-xs px-4 py-1.5 bg-[#c9a84c] text-black rounded font-semibold disabled:opacity-40">
          {busy ? "Sending…" : sent ? "Sent" : "Send"}
        </button>
      </div>
      {err && <p className="text-red-400 text-[0.7rem] mt-1">{err}</p>}
    </form>
  );
}

type AlertItem = { notification_id: string; type: string; sent_at: string | null; message_content: string | null; lane_id: string | null };
type AlertGroupData = { key: string; title: string; who: string | null; silent: number; breach: number; last: string | null; items: AlertItem[] };

/** One line per path instead of a wall of near-identical alert cards. */
function groupAlerts(notifications: any[], lanes: any[]): AlertGroupData[] {
  const meta = new Map(lanes.map((l: any) => [l.lane_id, l]));
  const groups = new Map<string, AlertGroupData>();
  for (const n of notifications as AlertItem[]) {
    const key = n.lane_id ?? "other";
    const lane = n.lane_id ? meta.get(n.lane_id) : null;
    let g = groups.get(key);
    if (!g) {
      g = {
        key,
        title: lane?.title ?? "Path",
        who: lane ? (lane.owner?.first_name || lane.owner?.email || null) : null,
        silent: 0, breach: 0, last: null, items: [],
      };
      groups.set(key, g);
    }
    if (n.type === "breach_report") g.breach++; else g.silent++;
    if (!g.last && n.sent_at) g.last = n.sent_at;
    g.items.push(n);
  }
  return [...groups.values()];
}

function AlertGroup({ group }: { group: AlertGroupData }) {
  const [open, setOpen] = useState(false);
  const parts: string[] = [];
  if (group.silent) parts.push(`${group.silent} silent`);
  if (group.breach) parts.push(`${group.breach} breach`);
  const lastLabel = group.last
    ? new Date(group.last).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  return (
    <div className="rounded-lg border border-[#2a2518]" style={{ background: "#161210" }}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex justify-between items-center gap-3 text-left px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm text-[#ded8cc] truncate">
            {group.title}{group.who ? <span className="text-[#948d80]"> · {group.who}</span> : null}
          </p>
          <p className="text-[0.7rem] text-[#948d80]">
            {parts.join(", ")}{lastLabel ? ` — last ${lastLabel}` : ""}
          </p>
        </div>
        <span className="text-[0.65rem] text-[#c9a84c] shrink-0">{open ? "Hide" : "Open"}</span>
      </button>

      {open && <IncidentList items={group.items} />}
    </div>
  );
}

type Incident = { key: string; kind: "breach" | "silent"; start: Date; end: Date; count: number; items: AlertItem[] };

/** Back-to-back alerts of the same kind (within ~36h) become one incident. */
function batchIncidents(items: AlertItem[]): Incident[] {
  const sorted = items
    .filter((n) => n.sent_at)
    .map((n) => ({ n, t: new Date(n.sent_at!) }))
    .sort((a, b) => b.t.getTime() - a.t.getTime());
  const out: Incident[] = [];
  for (const { n, t } of sorted) {
    const kind = n.type === "breach_report" ? "breach" : "silent";
    const cur = out[out.length - 1];
    if (cur && cur.kind === kind && cur.start.getTime() - t.getTime() <= 36 * 3600_000) {
      cur.start = t; cur.count++; cur.items.push(n);
    } else {
      out.push({ key: n.notification_id, kind, start: t, end: t, count: 1, items: [n] });
    }
  }
  return out;
}

function IncidentList({ items }: { items: AlertItem[] }) {
  const [showAll, setShowAll] = useState(false);
  const incidents = batchIncidents(items);
  const visible = showAll ? incidents : incidents.slice(0, 3);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return (
    <div className="px-4 pb-3 flex flex-col gap-1.5">
      {visible.map((i) => {
        const breach = i.kind === "breach";
        const range = fmt(i.start) === fmt(i.end) ? fmt(i.end) : `${fmt(i.start)} – ${fmt(i.end)}`;
        const label = breach
          ? (i.count > 1 ? `${i.count} breaches` : "Breach")
          : (i.count > 1 ? `Silent ${i.count} days` : "Silent day");
        return (
          <div key={i.key} className="flex justify-between items-center gap-3 px-3 py-2 rounded-md border border-[#2a2518]" style={{ background: "#0d0b06" }}>
            <span className="flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: breach ? "#f87171" : "#f59e0b" }} />
              <span className="text-xs font-semibold truncate" style={{ color: breach ? "#f87171" : "#f59e0b" }}>{label}</span>
            </span>
            <span className="text-[0.7rem] text-[#948d80] shrink-0">{range}</span>
          </div>
        );
      })}
      {incidents.length > 3 && (
        <button type="button" onClick={() => setShowAll((v) => !v)} className="text-[0.7rem] text-[#c9a84c] self-start mt-1">
          {showAll ? "Show fewer" : `Show ${incidents.length - 3} earlier`}
        </button>
      )}
    </div>
  );
}
