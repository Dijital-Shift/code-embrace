import { createFileRoute, Link } from "@tanstack/react-router";
import { LineageTimeline } from "@/components/LineageTimeline";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import { getLane, updateLaneStatus, deleteLane, markEncouragementsRead } from "@/lib/api.functions";
import {
  createLaneInvite,
  listLaneInvites,
  revokeLaneInvite,
  removeWatchman,
} from "@/lib/invites.functions";
import { Avatar } from "@/components/AvatarPicker";
import { AppLayout } from "@/components/AppLayout";
// status helpers used by timeline
import { toast } from "sonner";

export const Route = createFileRoute("/paths/$id")({
  head: () => ({ meta: [
    { title: "Path history — Kingdom Protocol" },
    { name: "description", content: "Walk your Path with daily accountability, check-in history, and words from your Watchmen." },
    { property: "og:title", content: "Path history — Kingdom Protocol" },
    { property: "og:description", content: "Daily accountability, check-in history, and words from your Watchmen." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  validateSearch: (s: Record<string, unknown>) => ({
    newlyCreated: s.newlyCreated === true || s.newlyCreated === "true",
  }),
  loader: ({ context, params }) => {
    if (typeof window === "undefined") return;
    void context.queryClient.prefetchQuery({ queryKey: ["lane", params.id], queryFn: () => getLane({ data: { id: params.id } }) }).catch(() => {});
  },
  component: () => <AppLayout><LaneDetail /></AppLayout>,
});

const TYPE_PILL = {
  avoid: { bg: "#241009", fg: "#f0957a", border: "rgba(240,149,122,0.3)" },
  complete: { bg: "#0c2010", fg: "#6ee7a0", border: "rgba(110,231,160,0.3)" },
} as const;

const STATUS_META: Record<string, { fg: string; border: string; dot: string }> = {
  active: { fg: "#6ee7a0", border: "rgba(110,231,160,0.28)", dot: "#4ade80" },
  paused: { fg: "#c9a84c", border: "rgba(201,168,76,0.32)", dot: "#c9a84c" },
  archived: { fg: "#8a8276", border: "#2a2518", dot: "#6b6459" },
};

function Pill({
  label,
  bg,
  fg,
  border,
  dot,
}: {
  label: string;
  bg: string;
  fg: string;
  border: string;
  dot?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-semibold uppercase tracking-[0.1em] leading-none border"
      style={{ background: bg, color: fg, borderColor: border }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />}
      {label}
    </span>
  );
}

function LaneDetail() {
  const { id } = Route.useParams();
  const { newlyCreated } = Route.useSearch();
  const getFn = useServerFn(getLane);
  const statusFn = useServerFn(updateLaneStatus);
  const deleteFn = useServerFn(deleteLane);
  const qc = useQueryClient();
  const [err, setErr] = useState<string | null>(null);
  const markReadFn = useServerFn(markEncouragementsRead);

  const { data, isLoading } = useQuery({ queryKey: ["lane", id], queryFn: () => getFn({ data: { id } }) });

  // Which encouragements were unread when this page first loaded — drives the
  // "New" tag independently of the refreshed server data.
  const [unreadIds, setUnreadIds] = useState<string[]>([]);
  const [fadedIds, setFadedIds] = useState<string[]>([]);
  const capturedRef = useRef(false);
  const sentRef = useRef<Set<string>>(new Set());
  const pendingRef = useRef<Set<string>>(new Set());
  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (capturedRef.current) return;
    const list = (data as any)?.encouragements;
    if (!list) return;
    capturedRef.current = true;
    setUnreadIds(list.filter((e: any) => !e.read_at).map((e: any) => e.id));
  }, [data]);

  // Only mark a note as seen once it has actually been on screen.
  const handleSeen = useCallback((encId: string) => {
    if (sentRef.current.has(encId)) return;
    sentRef.current.add(encId);
    pendingRef.current.add(encId);
    // Let the reader register the gold tag before it fades.
    setTimeout(() => setFadedIds((f) => (f.includes(encId) ? f : [...f, encId])), 4000);
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(() => {
      const ids = Array.from(pendingRef.current);
      pendingRef.current.clear();
      if (!ids.length) return;
      markReadFn({ data: { ids } })
        .then(() => {
          qc.invalidateQueries({ queryKey: ["lane", id] });
          qc.invalidateQueries({ queryKey: ["lanes"] });
          qc.invalidateQueries({ queryKey: ["dashboard"] });
          qc.invalidateQueries({ queryKey: ["unread-encouragements"] });
        })
        .catch(() => {});
    }, 800);
  }, [markReadFn, qc, id]);



  const [pending, setPending] = useState<null | "paused" | "archived" | "delete">(null);
  const [reason, setReason] = useState("");
  const [showAllWords, setShowAllWords] = useState(false);

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
  const canDelete = (data?.watchmen ?? []).length === 0;

  const isAvoid = (lane.lane_type ?? "complete") !== "complete";
  const type = TYPE_PILL[isAvoid ? "avoid" : "complete"];
  const status = STATUS_META[lane.status] ?? STATUS_META.paused;
  const scriptures = (lane.support_scripture ?? []).filter(Boolean);
  const hasDetails =
    Boolean(lane.notes) ||
    Boolean(lane.ends_at);


  

  return (
    <div>
      <div
        className="sticky z-30 -mx-5 px-5 py-2.5 mb-5 border-b border-[#2a2518]/60"
        style={{
          top: "calc(48px + env(safe-area-inset-top, 0px))",
          background: "rgba(10,8,0,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <Link
          to="/paths"
          className="inline-flex items-center gap-1 text-[0.8rem] uppercase tracking-[0.18em] font-semibold text-[#8a8276] no-underline transition-colors hover:text-[#c9a84c]"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Paths
        </Link>
      </div>

      <div className="mb-7">
        <div className="flex items-center gap-2 flex-wrap mt-5">
          <Pill label={isAvoid ? "Flee" : "Pursue"} bg={type.bg} fg={type.fg} border={type.border} />
          <Pill label={lane.status} bg="#12100a" fg={status.fg} border={status.border} dot={status.dot} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug mt-3">
          {lane.title}
        </h1>
        {lane.description && (
          <p className="text-xs sm:text-sm text-[#b8b0a4] leading-relaxed mt-2">{lane.description}</p>
        )}
        {/^send scripture/i.test(lane.title ?? "") && (
          <a href="https://sendscripture.xyz" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-3 py-2 text-sm font-semibold text-primary no-underline">
            SendScripture.xyz <span aria-hidden="true">↗</span>
          </a>
        )}
        {scriptures.length > 0 && (
          <div className="mt-4 flex flex-col gap-2 border-l-2 border-[#c9a84c]/50 pl-3.5 py-1">
            {scriptures.map((s, i) => (
              <p key={i} className="text-xs italic text-[#c9a84c]/90 leading-relaxed">“{s}”</p>
            ))}
          </div>
        )}
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

      <div className="kp-card-glow p-6 mb-5">
        <div className="grid grid-cols-2 divide-x divide-[#2a2518]">
          <div className="text-center">
            <div className="text-5xl font-extrabold text-[#4ade80] leading-none" style={{ textShadow: "0 0 24px #4ade8040" }}>{data?.standing ?? 0}</div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#4ade80] mt-2">Days Standing</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-extrabold text-[#f87171] leading-none" style={{ textShadow: "0 0 24px #f8717140" }}>{data?.fallen ?? 0}</div>
            <div className="text-xs uppercase tracking-[0.2em] text-[#f87171] mt-2">Days Fallen</div>
          </div>
        </div>
        {(data?.fallen ?? 0) > 0 && (
          <p className="text-center text-[0.8rem] text-[#a8a094] mt-3">
            {data?.breached ?? 0} breach{(data?.breached ?? 0) === 1 ? "" : "es"} · {data?.missed ?? 0} silent
          </p>
        )}
        {lane.created_at && (
          <p className="text-center text-[0.8rem] text-[#8a8276] mt-2">
            Since {new Date(lane.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {(data?.standing ?? 0) + (data?.fallen ?? 0)} days walked
          </p>
        )}
        <div className="mt-4 pt-4 border-t border-[#2a2518] text-center">
          <p className="text-xs italic text-[#c9a84c]/90 leading-relaxed">
            “For a just man falleth seven times, and riseth up again.”
          </p>
          <p className="text-xs uppercase tracking-[0.16em] text-[#8a8276] mt-1.5">Proverbs 24:16 (KJV)</p>
        </div>
      </div>

      <p className="text-xs text-[#a8a094] uppercase tracking-wider font-semibold mb-2">Last 14 Days</p>
      <LineageTimeline checkins={checkins} words={data?.encouragements ?? []}
        startDate={data?.historyStartDate ?? lane.created_at.slice(0, 10)}
        today={data?.historyToday ?? lane.created_at.slice(0, 10)}
        renderWord={(e) => <EncouragementCard key={e.id} enc={e} isNew={unreadIds.includes(e.id)} faded={fadedIds.includes(e.id)} onSeen={handleSeen} defaultOpen />} />

      {(data?.encouragements ?? []).length > 0 && (
        <div className="mt-6">
          <p className="text-xs text-[#a8a094] uppercase tracking-wider font-semibold mb-2">Encouragements received</p>
          <div className="flex flex-col gap-1.5">
            {(data?.encouragements ?? []).slice(0, showAllWords ? undefined : 5).map((e: any) => (
              <EncouragementCard
                key={e.id}
                enc={e}
                isNew={unreadIds.includes(e.id)}
                faded={fadedIds.includes(e.id)}
                onSeen={handleSeen}
              />
            ))}
          </div>
          {(data?.encouragements ?? []).length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllWords((v) => !v)}
              className="mt-2 bg-transparent border-0 p-0 text-[0.8rem] font-semibold text-[#c9a84c] cursor-pointer"
            >
              {showAllWords ? "Show fewer" : `Show earlier (${(data?.encouragements ?? []).length - 5})`}
            </button>
          )}
        </div>
      )}

      {hasDetails && (
        <div className="kp-card mt-6 p-4">
          <p className="text-xs text-[#a8a094] uppercase tracking-wider font-semibold mb-3">Notes & details</p>
          {lane.notes && (
            <div className="mt-2 pl-3 border-l-2 border-[#c9a84c]/60">
              <p className="text-xs uppercase tracking-wider text-[#c9a84c] font-semibold mb-1">Notes</p>
              <p className="text-sm text-[#e8dfc4] whitespace-pre-wrap">{lane.notes}</p>
            </div>
          )}
          {lane.ends_at && (
            <p className="text-xs text-[#a8a094] mt-3">
              Ends <span className="text-[#c9a84c]">{lane.ends_at}</span>
            </p>
          )}
        </div>
      )}


      <WatchmenPanel laneId={id} watchmen={(data?.watchmen ?? []) as any} ownerName={data?.ownerFirstName ?? null} pathTitle={lane.title} />

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
        <Link to="/paths/edit/$id" params={{ id }} className="inline-flex items-center justify-center px-4 py-2 rounded-md text-xs font-semibold leading-none border border-[#222] text-[#ded8cc] no-underline" style={{ background: "#2a2518" }}>Edit</Link>
        {canDelete && (
          <button
            disabled={del.isPending}
            onClick={() => { setErr(null); setPending("delete"); }}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md text-xs font-semibold leading-none border border-[#222] text-[#f87171]"
            style={{ background: "#1a0a0a" }}
          >{del.isPending ? "Deleting…" : "Delete"}</button>
        )}
      </div>

      {pending === "delete" && (
        <div className="mt-4 p-5 rounded-xl border border-[#5a1f1f]" style={{ background: "#1a0a0a" }}>
          <p className="text-base font-semibold text-[#f3e6c4]">Delete this Path?</p>
          <p className="text-sm text-[#c2af80] leading-relaxed mt-1.5">
            This permanently removes “{lane.title}”, its notes, and its walk history. This cannot be undone.
          </p>
          <div className="flex gap-2 mt-4">
            <button
              disabled={del.isPending}
              onClick={() => del.mutate()}
              className="px-4 py-2.5 rounded-md text-sm font-bold bg-[#b91c1c] text-white"
            >{del.isPending ? "Deleting…" : "Delete Path"}</button>
            <button onClick={() => setPending(null)} className="px-4 py-2.5 rounded-md text-sm font-semibold border border-[#2a2518] text-[#ded8cc] bg-transparent">Keep Path</button>
          </div>
        </div>
      )}
      <div className="hidden">
      </div>

      {pending && pending !== "delete" && (
        <div
          key={pending}
          ref={(el) => {
            if (!el) return;
            requestAnimationFrame(() => {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
              el.querySelector("textarea")?.focus({ preventScroll: true });
            });
          }}
          className="mt-4 p-5 rounded-xl border border-[#3a2f12] scroll-mt-24" style={{ background: "#1a1408" }}>
          <StatusHelp kind={pending === "paused" ? "paused" : "archived"} />
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


    </div>
  );
}

function EncouragementCard({
  enc,
  isNew,
  faded,
  onSeen,
  defaultOpen = false,
}: {
  enc: any;
  isNew: boolean;
  faded: boolean;
  onSeen: (id: string) => void;
  defaultOpen?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      onSeen(enc.id);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((en) => en.isIntersecting)) {
          onSeen(enc.id);
          obs.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [enc.id, onSeen]);

  // Thin row by default; tap to read the whole note.
  return (
    <div ref={ref} className="rounded border border-[#3a2f12]" style={{ background: "#1a1408" }}>
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); onSeen(enc.id); }}
        className="w-full flex items-center justify-between gap-3 text-left px-3 py-2.5"
      >
        <div className="min-w-0 flex items-center gap-2">
          <Avatar src={enc.from_avatar} name={enc.from_name} size={24} />
          {isNew && (
            <span
              className="shrink-0 text-[0.55rem] font-bold uppercase tracking-wider text-[#0a0800] bg-[#c9a84c] px-1.5 py-0.5 rounded-full transition-opacity duration-700"
              style={{ opacity: faded ? 0 : 1 }}
            >New</span>
          )}
          <span className="text-sm text-[#e8dfc4] truncate">
            {open ? enc.from_name : enc.body}
          </span>
        </div>
        <span className="text-xs text-[#a8a094] shrink-0">
          {new Date(enc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </button>

      {open && (
        <div className="px-3 pb-3">
          {enc.context && (
            <p className="text-xs uppercase tracking-wider text-[#c9a84c] font-semibold mb-1">{enc.context}</p>
          )}
          <p className="text-sm text-[#e8dfc4] leading-relaxed whitespace-pre-wrap">{enc.body}</p>
          <p className="text-[0.8rem] text-[#a8a094] mt-1.5">
            {enc.from_name} ·{" "}
            {new Date(enc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
          </p>
        </div>
      )}
    </div>
  );
}


type WatchmanSlot = { id: string; name: string; email: string; relationship: string | null };

function WatchmenPanel({ laneId, watchmen, ownerName }: { laneId: string; watchmen: WatchmanSlot[]; ownerName?: string | null; pathTitle?: string }) {
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
        setErr("This path already has two Watchmen (active or pending). Remove one before inviting another.");
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

  async function remove(w: WatchmanSlot) {
    const reason = window.prompt(
      `Removing ${w.name} is not silent — they'll be told. Why are you removing them?`,
    );
    if (reason === null) return;
    if (reason.trim().length < 3) {
      toast.error("A reason is required to remove a Watchman.");
      return;
    }
    const r: any = await removeFn({ data: { laneId, watchmanRowId: w.id, reason: reason.trim() } });
    if (r?.error) { toast.error(r.error); return; }
    toast.success("Watchman removed — they've been notified.");
    qc.invalidateQueries({ queryKey: ["lane", laneId] });
    qc.invalidateQueries({ queryKey: ["invites", laneId] });
  }


  function hoursLeft(expiresAt: string) {
    const ms = new Date(expiresAt).getTime() - Date.now();
    const h = Math.max(0, Math.floor(ms / 3600000));
    if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
    return `${h}h`;
  }

  const slotCount = watchmen.length + activePending.length;
  const atCap = slotCount >= 2;
  const emptySlots = Math.max(0, 2 - slotCount);

  return (
    <div className="kp-card mt-6 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[#a8a094] uppercase tracking-wider font-semibold">Watchmen</p>
        <span className="text-xs text-[#a8a094]">{slotCount}/2</span>
      </div>

      {watchmen.map((w) => (
        <div key={w.id} className="flex items-center justify-between gap-3 p-3 rounded border border-[#2a2518] mb-3" style={{ background: "#1a1612" }}>
          <div className="min-w-0">
            <p className="text-sm text-white truncate">{w.name}</p>
            <p className="text-xs text-[#4ade80]">
              Active Watchman{w.relationship ? ` · ${w.relationship}` : ""}
            </p>
          </div>
          <button onClick={() => remove(w)} className="text-xs text-[#f87171] px-3 py-1.5 rounded border border-[#3a1a1a]" style={{ background: "#1a0a0a" }}>
            Remove
          </button>
        </div>
      ))}


      {activePending.map((inv: any) => {
        const url = `${window.location.origin}/invite/${inv.token}`;
        return (
          <div key={inv.invite_id} className="flex flex-col gap-2 p-3 rounded border border-[#3a2f12] mb-3" style={{ background: "#1a1408" }}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-[#c9a84c]">Invite pending · expires in {hoursLeft(inv.expires_at)}</p>
              <button onClick={() => revoke(inv.invite_id)} className="text-xs text-[#b8b0a4] hover:text-[#f87171]">Cancel</button>
            </div>
            <div className="flex items-center gap-2">
              <input readOnly value={inviteText(url)} className="flex-1 px-2 py-1.5 text-base bg-[#0a0800] border border-[#222] rounded text-white outline-none" />
              <button onClick={() => copy(inv.token)} className="text-xs px-3 py-1.5 bg-[#c9a84c] text-black rounded font-semibold">Copy</button>
            </div>
          </div>
        );
      })}

      {Array.from({ length: emptySlots }).map((_, i) => (
        <div key={`empty-${i}`} className="p-3 rounded border border-dashed border-[#2a2518] mb-3 text-center">
          <p className="text-xs text-[#7d766b]">Empty slot — no Watchman yet</p>
        </div>
      ))}



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

      <p className="text-[0.8rem] text-[#9e968a] mt-3 leading-relaxed">
        Up to two watchmen per path. They see your check-ins and get pinged when you breach or go silent. Links expire in 48 hours.
      </p>
    </div>
  );
}

const STATUS_HELP = {
  paused: {
    title: "Pause this path?",
    body: "Rest this path for a season — sickness, travel, a planned break. Daily check-ins and Watchman alerts stop while it rests, and your record stays as it is. Set it active again whenever you are ready.",
  },
  archived: {
    title: "Archive this path?",
    body: "Close this path when the walk is finished or no longer yours to keep. It leaves your daily check-in, your full record is kept, and you can restore it later from your archived Paths.",
  },
} as const;

function StatusHelp({ kind }: { kind: "paused" | "archived" }) {
  const [open, setOpen] = useState(false);
  const h = STATUS_HELP[kind];
  return (
    <div className="mb-1">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-[#c9a84c]">{h.title}</p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={`What does ${kind === "paused" ? "pause" : "archive"} do?`}
          className="!min-h-0 w-5 h-5 rounded-full border text-xs font-bold leading-none flex items-center justify-center"
          style={{ borderColor: open ? "#c9a84c" : "#5a4a22", color: open ? "#0a0800" : "#c9a84c", background: open ? "#c9a84c" : "transparent" }}
        >
          ?
        </button>
      </div>
      {open && (
        <p className="mt-2 mb-2 text-xs leading-relaxed text-[#e0d4b0] pl-3 border-l-2 border-[#c9a84c]/60">{h.body}</p>
      )}
    </div>
  );
}
