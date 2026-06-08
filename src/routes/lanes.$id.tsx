import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getLane, updateLaneStatus, deleteLane } from "@/lib/api.functions";
import {
  createLaneInvite,
  listLaneInvites,
  revokeLaneInvite,
  removeWatchman,
} from "@/lib/invites.functions";
import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/lanes/$id")({
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

  const { data, isLoading } = useQuery({ queryKey: ["lane", id], queryFn: () => getFn({ data: { id } }) });

  const setStatus = useMutation({
    mutationFn: (status: "active" | "paused" | "archived") => statusFn({ data: { id, status } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lane", id] }),
  });
  const del = useMutation({
    mutationFn: () => deleteFn({ data: { id } }),
    onSuccess: (r: any) => {
      if (r?.error) setErr(r.error);
      else window.location.href = "/lanes";
    },
  });

  if (isLoading) return <p className="text-[#555]">Loading…</p>;
  const lane = data?.lane;
  if (!lane) return <p>Not found.</p>;

  const checkins = data?.checkins ?? [];
  const ageMin = (Date.now() - new Date(lane.created_at).getTime()) / 60000;
  const canDelete = ageMin <= 10 && checkins.length === 0;
  const statusColor: Record<string, string> = { completed: "#4ade80", breached: "#f87171", missed: "#f59e0b", skipped: "#c9a84c", pending: "#444" };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/lanes" className="text-[#555] text-sm">← Paths</Link>
          <h2 className="text-xl font-bold">{lane.title}</h2>
        </div>
      </div>

      {newlyCreated && (
        <div className="mb-5 p-4 rounded-md border border-[#3a2f12]" style={{ background: "#1e1808" }}>
          <p className="text-sm text-[#c9a84c] font-semibold mb-1">Path created.</p>
          <p className="text-xs text-[#aa9560]">Now invite your Watchman below. They get pinged when you miss a check-in.</p>
        </div>
      )}

      <div className="p-5 rounded-lg border border-[#2a2518]" style={{ background: "#161210" }}>
        {lane.description && <p className="text-[#888] text-sm mb-3">{lane.description}</p>}
        {(lane.support_scripture ?? []).filter(Boolean).map((s, i) => (
          <p key={i} className="text-[#c9a84c] text-xs italic mb-1">{i + 1}. "{s}"</p>
        ))}
        <p className="text-xs text-[#666] mt-2">
          Status: <span className="capitalize" style={{ color: lane.status === "active" ? "#4ade80" : "#888" }}>{lane.status}</span>
          {lane.ends_at && (
            <span className="ml-3">Ends <span className="text-[#c9a84c]">{lane.ends_at}</span></span>
          )}
        </p>
      </div>


      <WatchmenPanel laneId={id} hasWatchman={!!lane.partner_id} watchmanEmail={data?.partnerEmail ?? lane.partner_email ?? null} />

      <div className="mt-8 flex gap-2 flex-wrap">
        {lane.status !== "active" && (
          <button onClick={() => setStatus.mutate("active")} className="px-4 py-2 bg-white text-black rounded-md text-xs font-semibold">Set Active</button>
        )}
        {lane.status === "active" && (
          <button onClick={() => setStatus.mutate("paused")} className="px-4 py-2 rounded-md text-xs font-semibold border border-[#222] text-[#888]" style={{ background: "#2a2518" }}>Pause</button>
        )}
        {lane.status !== "archived" && (
          <button onClick={() => setStatus.mutate("archived")} className="px-4 py-2 rounded-md text-xs font-semibold border border-[#222] text-[#f87171]" style={{ background: "#2a2518" }}>Archive</button>
        )}
        {canDelete && (
          <button onClick={() => confirm("Delete this path?") && del.mutate()} className="px-4 py-2 rounded-md text-xs font-semibold border border-[#222] text-[#f87171]" style={{ background: "#1a0a0a" }}>Delete</button>
        )}
      </div>
      {err && <p className="text-red-400 text-xs mt-2">{err}</p>}

      <div className="mt-8">
        <p className="text-[0.65rem] text-[#666] uppercase tracking-wider font-semibold mb-3">Last 14 Days</p>
        {checkins.length === 0 ? (
          <p className="text-[#444] text-sm">No check-ins yet.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {checkins.map((c) => (
              <div key={c.checkin_date} className="flex justify-between px-3 py-2 rounded border border-[#2a2518]" style={{ background: "#161210" }}>
                <span className="text-sm">{c.checkin_date}</span>
                <span className="text-xs capitalize" style={{ color: statusColor[c.status] ?? "#444" }}>{c.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WatchmenPanel({ laneId, hasWatchman, watchmanEmail }: { laneId: string; hasWatchman: boolean; watchmanEmail: string | null }) {
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
        await navigator.clipboard.writeText(url);
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
      await navigator.clipboard.writeText(url);
      setCopied(url);
    } catch {
      setCopied(url);
    }
  }

  async function revoke(inviteId: string) {
    await revokeFn({ data: { inviteId } });
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
  const atCap = slotCount >= 1;

  return (
    <div className="mt-6 p-5 rounded-lg border border-[#2a2518]" style={{ background: "#161210" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[0.65rem] text-[#666] uppercase tracking-wider font-semibold">Watchmen</p>
        <span className="text-xs text-[#666]">{slotCount}/1</span>
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
              <button onClick={() => revoke(inv.invite_id)} className="text-[0.65rem] text-[#888] hover:text-[#f87171]">Cancel</button>
            </div>
            <div className="flex items-center gap-2">
              <input readOnly value={url} className="flex-1 px-2 py-1.5 text-xs bg-[#0a0800] border border-[#222] rounded text-[#888] outline-none" />
              <button onClick={() => copy(inv.token)} className="text-xs px-3 py-1.5 bg-[#c9a84c] text-black rounded font-semibold">Copy</button>
            </div>
          </div>
        );
      })}

      {!hasWatchman && (
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
          {busy ? "Generating…" : atCap ? "Invite pending" : "+ Invite Watchman"}
        </button>
      )}

      {copied && (
        <p className="text-xs text-[#4ade80] mt-3">
          Link copied. Paste it to your Watchman (text, DM, anywhere).
        </p>
      )}
      {err && <p className="text-red-400 text-xs mt-2">{err}</p>}

      <p className="text-[0.7rem] text-[#555] mt-3 leading-relaxed">
        Watchmen see your check-ins and get pinged when you breach or miss one. Links expire in 48 hours.
      </p>
    </div>
  );
}
