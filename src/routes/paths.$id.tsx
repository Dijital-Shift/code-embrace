import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { getLane, updateLaneStatus, deleteLane, markEncouragementsRead } from "@/lib/api.functions";
import {
  createLaneInvite,
  listLaneInvites,
  revokeLaneInvite,
  removeWatchman,
} from "@/lib/invites.functions";
import { AppLayout } from "@/components/AppLayout";
import { statusColor, statusLabel } from "@/lib/status";
import { toast } from "sonner";

export const Route = createFileRoute("/paths/$id")({
  validateSearch: (s: Record<string, unknown>) => ({
    newlyCreated: s.newlyCreated === true || s.newlyCreated === "true",
  }),
  component: () => <AppLayout><LaneDetail /></AppLayout>,
});

function LaneDetail() {
  const { id } = Route.useParams();
  const { newlyCreated } = Route.useSearch();
  const getFn = useServerFn(getLane);
  const statusFn = useServerFn(updateLaneStatus);
  const deleteFn = useServerFn(deleteLane);
  const qc = useQueryClient();
  const [err, setErr] = useState<string | null>(null);
  const markReadFn = useServerFn(markEncouragementsRead);
  const markedRef = useRef(false);

  const { data, isLoading } = useQuery({ queryKey: ["lane", id], queryFn: () => getFn({ data: { id } }) });

  const [pending, setPending] = useState<null | "paused" | "archived" | "delete">(null);
  const [reason, setReason] = useState("");

  const setStatus = useMutation({
    mutationFn: (v: { status: "active" | "paused" | "archived"; reason?: string }) =>
      statusFn({ data: { id, status: v.status, reason: v.reason ?? null } }),
    onSuccess: (r: any) => {
      if (r?.error) { setErr(r.error); return; }
      setPending(null); setReason(""); setErr(null);
      qc.invalidateQueries({ queryKey: ["lane", id] });
    },
  });
  const del = useMutation({
    mutationFn: () => deleteFn({ data: { id, reason: null } }),
    onSuccess: (r: any) => {
      if (r?.error) setErr(r.error);
      else window.location.href = "/paths";
    },
  });

  if (isLoading) return <p className="text-[#9e968a]">Loading…</p>;
  const lane = data?.lane;
  if (!lane) return <p>Not found.</p>;

  const checkins = data?.checkins ?? [];
  // Delete is only offered while no watchman is locked in — nobody to notify.
  const canDelete = !lane.partner_id;
  

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/paths" className="text-[#9e968a] text-sm">← Paths</Link>
          <h2 className="text-xl font-bold">{lane.title}</h2>
        </div>
      </div>

      {newlyCreated && (
        <div className="mb-5 p-4 rounded-md border border-[#3a2f12]" style={{ background: "#1e1808" }}>
          <p className="text-sm text-[#c9a84c] font-semibold mb-1">Path created.</p>
          <p className="text-xs text-[#c2af80]">Now invite your Watchman below. They get pinged when you breach or go silent two days running.</p>
          <Link
            to="/paths/edit/$id"
            params={{ id }}
            className="inline-block mt-3 px-3 py-1.5 rounded text-xs font-semibold text-[#0a0800] no-underline"
            style={{ background: "#c9a84c" }}
          >Edit this path</Link>
        </div>
      )}

      <div className="p-5 rounded-lg border border-[#2a2518]" style={{ background: "#161210" }}>
        {lane.description && <p className="text-[#b8b0a4] text-sm mb-3">{lane.description}</p>}
        {(lane.support_scripture ?? []).filter(Boolean).map((s, i) => (
          <p key={i} className="text-[#c9a84c] text-xs italic mb-1">{i + 1}. "{s}"</p>
        ))}
        {/^send scripture/i.test(lane.title ?? "") && (
          <p className="text-xs text-[#a8a094] mt-2">
            Easy way to do this:{" "}
            <a href="https://sendscripture.xyz" target="_blank" rel="noreferrer" className="text-[#c9a84c] font-semibold no-underline">SendScripture.xyz</a>
          </p>
        )}
        {lane.notes && (
          <div className="mt-3 pl-3 border-l-2 border-[#c9a84c]/60">
            <p className="text-[0.6rem] uppercase tracking-wider text-[#c9a84c] font-semibold mb-1">Notes</p>
            <p className="text-sm text-[#e8dfc4] whitespace-pre-wrap">{lane.notes}</p>
          </div>
        )}
        <p className="text-xs text-[#a8a094] mt-2">
          Status: <span className="capitalize" style={{ color: lane.status === "active" ? "#4ade80" : "#888" }}>{lane.status}</span>
          {lane.ends_at && (
            <span className="ml-3">Ends <span className="text-[#c9a84c]">{lane.ends_at}</span></span>
          )}
        </p>
      </div>


      {(data?.encouragements ?? []).length > 0 && (
        <div className="mt-6 p-5 rounded-lg border border-[#2a2518]" style={{ background: "#161210" }}>
          <p className="text-[0.65rem] text-[#a8a094] uppercase tracking-wider font-semibold mb-3">Recent encouragements received</p>
          <div className="flex flex-col gap-3">
            {(data?.encouragements ?? []).map((e: any) => (
              <div key={e.id} className="p-3 rounded border border-[#3a2f12]" style={{ background: "#1a1408" }}>
                {!e.read_at && (
                  <span className="inline-flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-wider text-[#0a0800] bg-[#c9a84c] px-2 py-0.5 rounded-full mb-1.5">New</span>
                )}
                <p className="text-sm text-[#e8dfc4] leading-relaxed whitespace-pre-wrap">{e.body}</p>
                <p className="text-[0.7rem] text-[#a8a094] mt-1.5">
                  {new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <WatchmenPanel laneId={id} hasWatchman={!!lane.partner_id} watchmanEmail={data?.partnerEmail ?? lane.partner_email ?? null} ownerName={data?.ownerFirstName ?? null} pathTitle={lane.title} />


      <div className="mt-8 flex gap-2 flex-wrap">
        {lane.status !== "active" && (
          <button onClick={() => setStatus.mutate({ status: "active" })} className="inline-flex items-center justify-center px-4 py-2 bg-white text-black rounded-md text-xs font-semibold leading-none">Set Active</button>
        )}
        {lane.status === "active" && (
          <button onClick={() => { setErr(null); setReason(""); setPending("paused"); }} className="inline-flex items-center justify-center px-4 py-2 rounded-md text-xs font-semibold leading-none border border-[#222] text-[#b8b0a4]" style={{ background: "#2a2518" }}>Pause</button>
        )}
        {lane.status !== "archived" && (
          <button onClick={() => { setErr(null); setReason(""); setPending("archived"); }} className="inline-flex items-center justify-center px-4 py-2 rounded-md text-xs font-semibold leading-none border border-[#222] text-[#f87171]" style={{ background: "#2a2518" }}>Archive</button>
        )}
        {canDelete && (
          <button
            disabled={del.isPending}
            onClick={() => { setErr(null); del.mutate(); }}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md text-xs font-semibold leading-none border border-[#222] text-[#f87171]"
            style={{ background: "#1a0a0a" }}
          >{del.isPending ? "Deleting…" : "Delete"}</button>
        )}
        <Link to="/paths/edit/$id" params={{ id }} className="inline-flex items-center justify-center px-4 py-2 rounded-md text-xs font-semibold leading-none border border-[#222] text-[#ded8cc] no-underline" style={{ background: "#2a2518" }}>Edit</Link>
      </div>

      {pending && (
        <div className="mt-4 p-5 rounded-xl border border-[#3a2f12]" style={{ background: "#1a1408" }}>
          <p className="text-sm font-semibold text-[#c9a84c] mb-1">
            {pending === "paused" ? "Pause this path?" : "Archive this path?"}
          </p>
          <p className="text-xs text-[#c2af80] leading-relaxed mb-3">
            Your watchman will be told you did this. You cannot do it quietly. Write a short reason — they will see it word for word.
          </p>
          <textarea
            rows={3}
            minLength={5}
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you stepping off this path?"
            className="w-full px-3 py-2 text-base bg-[#0a0800] border border-[#2a2518] rounded text-white outline-none resize-none"
          />
          <div className="flex gap-2 mt-3">
            <button
              disabled={reason.trim().length < 5 || setStatus.isPending}
              onClick={() => {
                if (pending !== "delete") setStatus.mutate({ status: pending, reason: reason.trim() });
              }}
              className="px-4 py-2 rounded-md text-xs font-bold"
              style={{ background: reason.trim().length >= 5 ? "#c9a84c" : "#2a2518", color: reason.trim().length >= 5 ? "#0a0800" : "#7d7668" }}
            >
              {pending === "paused" ? "Pause and notify" : "Archive and notify"}
            </button>
            <button onClick={() => { setPending(null); setReason(""); }} className="px-4 py-2 rounded-md text-xs font-semibold border border-[#2a2518] text-[#b8b0a4] bg-transparent">Cancel</button>
          </div>
        </div>
      )}

      {err && <p className="text-red-400 text-xs mt-2">{err}</p>}

      <div className="mt-8">
        <div className="flex items-center justify-center gap-6 p-4 rounded-xl border border-[#2a2518] mb-4" style={{ background: "#161210" }}>
          <div className="text-center">
            <div className="text-3xl font-extrabold text-[#4ade80]">{data?.standing ?? 0}</div>
            <div className="text-[0.6rem] uppercase tracking-wider text-[#4ade80]">Days Standing</div>
          </div>
          <span className="text-[#948d80] text-xl">·</span>
          <div className="text-center">
            <div className="text-3xl font-extrabold text-[#f87171]">{data?.fallen ?? 0}</div>
            <div className="text-[0.6rem] uppercase tracking-wider text-[#f87171]">Days Fallen</div>
          </div>
        </div>

        <p className="text-[0.65rem] text-[#a8a094] uppercase tracking-wider font-semibold mb-3">Last 14 Days</p>
        {checkins.length === 0 ? (
          <p className="text-[#948d80] text-sm">No check-ins yet.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {checkins.map((c) => (
              <div key={c.checkin_date} className="flex justify-between px-3 py-2 rounded border border-[#2a2518]" style={{ background: "#161210" }}>
                <span className="text-sm">{c.checkin_date}</span>
                <span className="text-xs" style={{ color: statusColor(c.status) }}>{statusLabel(c.status)}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-[0.7rem] italic text-[#a8a094] mt-6">
          For a just man falleth seven times, and riseth up again. — Proverbs 24:16 (KJV)
        </p>
      </div>

    </div>
  );
}

function WatchmenPanel({ laneId, hasWatchman, watchmanEmail, ownerName, pathTitle }: { laneId: string; hasWatchman: boolean; watchmanEmail: string | null; ownerName?: string | null; pathTitle?: string }) {
  const inviteText = (url: string) => `${ownerName || "Someone"} is inviting you to be their watchman on Kingdom Protocol — ${url}`;
  const qc = useQueryClient();
  const createFn = useServerFn(createLaneInvite);
  const listFn = useServerFn(listLaneInvites);
  const revokeFn = useServerFn(revokeLaneInvite);
  const removeFn = useServerFn(removeWatchman);

  const [copied, setCopied] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: invites = [] } = useQuery({
    queryKey: ["invites", laneId],
    queryFn: () => listFn({ data: { laneId } }),
  });

  const activePending = invites.filter(
    (i: any) => i.status === "pending" && new Date(i.expires_at) > new Date(),
  );

  async function generate() {
    setErr(null);
    setBusy(true);
    const r = await createFn({ data: { laneId } });
    setBusy(false);
    if ("error" in r && r.error) {
      if ((r as any).code === "CAP_REACHED") {
        setErr("This path already has a Watchman or a pending invite. Remove them first.");
      } else {
        setErr(r.error);
      }
      return;
    }
    if ("token" in r && r.token) {
      const url = `${window.location.origin}/invite/${r.token}`;
      try {
        await navigator.clipboard.writeText(inviteText(url));
        setCopied(url);
      } catch {
        setCopied(url);
      }
      qc.invalidateQueries({ queryKey: ["invites", laneId] });
    }
  }

  async function copy(token: string) {
    const url = `${window.location.origin}/invite/${token}`;
    try {
      await navigator.clipboard.writeText(inviteText(url));
      setCopied(url);
      toast.success("Invite text copied");
    } catch {
      setCopied(url);
    }
  }

  async function revoke(inviteId: string) {
    await revokeFn({ data: { inviteId } });
    toast.success("Invite canceled");
    qc.invalidateQueries({ queryKey: ["invites", laneId] });
  }

  async function remove() {
    if (!confirm("Remove this Watchman? They'll stop receiving pings for this path.")) return;
    await removeFn({ data: { laneId } });
    qc.invalidateQueries({ queryKey: ["lane", laneId] });
    qc.invalidateQueries({ queryKey: ["invites", laneId] });
  }

  function hoursLeft(expiresAt: string) {
    const ms = new Date(expiresAt).getTime() - Date.now();
    const h = Math.max(0, Math.floor(ms / 3600000));
    if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
    return `${h}h`;
  }

  const slotCount = (hasWatchman ? 1 : 0) + activePending.length;
  const atCap = slotCount >= 2;

  return (
    <div className="mt-6 p-5 rounded-lg border border-[#2a2518]" style={{ background: "#161210" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[0.65rem] text-[#a8a094] uppercase tracking-wider font-semibold">Watchmen</p>
        <span className="text-xs text-[#a8a094]">{slotCount}/2</span>
      </div>

      {hasWatchman && (
        <div className="flex items-center justify-between gap-3 p-3 rounded border border-[#2a2518] mb-3" style={{ background: "#1a1612" }}>
          <div className="min-w-0">
            <p className="text-sm text-white truncate">{watchmanEmail ?? "—"}</p>
            <p className="text-xs text-[#4ade80]">Active Watchman</p>
          </div>
          <button onClick={remove} className="text-xs text-[#f87171] px-3 py-1.5 rounded border border-[#3a1a1a]" style={{ background: "#1a0a0a" }}>
            Remove
          </button>
        </div>
      )}

      {activePending.map((inv: any) => {
        const url = `${window.location.origin}/invite/${inv.token}`;
        return (
          <div key={inv.invite_id} className="flex flex-col gap-2 p-3 rounded border border-[#3a2f12] mb-3" style={{ background: "#1a1408" }}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-[#c9a84c]">Invite pending · expires in {hoursLeft(inv.expires_at)}</p>
              <button onClick={() => revoke(inv.invite_id)} className="text-[0.65rem] text-[#b8b0a4] hover:text-[#f87171]">Cancel</button>
            </div>
            <div className="flex items-center gap-2">
              <input readOnly value={inviteText(url)} className="flex-1 px-2 py-1.5 text-base bg-[#0a0800] border border-[#222] rounded text-white outline-none" />
              <button onClick={() => copy(inv.token)} className="text-xs px-3 py-1.5 bg-[#c9a84c] text-black rounded font-semibold">Copy</button>
            </div>
          </div>
        );
      })}

      <button
        onClick={generate}
        disabled={busy || atCap}
        className="w-full py-3 rounded-md text-sm font-semibold"
        style={{
          background: atCap ? "#2a2518" : "#c9a84c",
          color: atCap ? "#666" : "#000",
          cursor: atCap ? "not-allowed" : "pointer",
        }}
      >
        {busy ? "Generating…" : atCap ? "2 watchmen — at the limit" : slotCount === 0 ? "+ Invite Watchman" : "+ Invite second Watchman"}
      </button>

      {copied && (
        <p className="text-xs text-[#4ade80] mt-3">
          Link copied. Paste it to your Watchman (text, DM, anywhere).
        </p>
      )}
      {err && <p className="text-red-400 text-xs mt-2">{err}</p>}

      <p className="text-[0.7rem] text-[#9e968a] mt-3 leading-relaxed">
        Up to two watchmen per path. They see your check-ins and get pinged when you breach or go silent. Links expire in 48 hours.
      </p>
    </div>
  );
}
