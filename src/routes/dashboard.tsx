import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboard } from "@/lib/api.functions";
import { getMyReferral } from "@/lib/referrals.functions";
import { AppLayout } from "@/components/AppLayout";
import { CallToWallCard } from "@/components/CallToWallCard";
import { AccessBanner, LifetimeBadge } from "@/components/AccessBanner";
import { statusColor, statusLabel } from "@/lib/status";
import { DayProgressBar, WatchmanPips, DashboardSkeleton } from "@/components/DashboardPieces";
import { WatchmanWordsModal, type Word } from "@/components/WatchmanWordsModal";
import { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check } from "lucide-react";
import { StarterWalkCard } from "@/components/StarterWalkCard";
import { pathStartLabel } from "@/lib/path-start";


export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [
    { title: "Dashboard — Kingdom Protocol" },
    { name: "description", content: "Your daily walk, active Paths, and words from your Watchmen." },
    { property: "og:title", content: "Dashboard — Kingdom Protocol" },
    { property: "og:description", content: "Your daily walk, active Paths, and words from your Watchmen." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  loader: ({ context }) => {
    if (typeof window === "undefined") return;
    void context.queryClient.prefetchQuery({ queryKey: ["dashboard"], queryFn: () => getDashboard() }).catch(() => {});
  },
  component: () => <AppLayout><Dashboard /></AppLayout>,
});

function Dashboard() {
  const fn = useServerFn(getDashboard);
  const refFn = useServerFn(getMyReferral);
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: () => fn() });
  const { data: ref } = useQuery({ queryKey: ["my-referral"], queryFn: () => refFn() });
  const [starterVisible, setStarterVisible] = useState(false);
  const [openLane, setOpenLane] = useState<string | null>(null);
  // Snapshot the words when opened so the modal survives the refetch that clears them.
  const [openWords, setOpenWords] = useState<Word[]>([]);
  useEffect(() => {
    if (!openLane) { setOpenWords([]); return; }
    setOpenWords((prev) => prev.length ? prev : ((data as any)?.unreadWords ?? []).filter((w: Word) => w.lane_id === openLane));
  }, [openLane]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <DashboardSkeleton />;
  const lanes = data?.lanes ?? [];
  const todayCheckins = data?.todayCheckins ?? [];
  const statusByLane = new Map(todayCheckins.map((c) => [c.lane_id, c.status]));
  const checkedIds = new Set(todayCheckins.map((c) => c.lane_id));
  const dueLanes = lanes.filter((l) => !l.upcoming);
  const upcomingLanes = lanes.filter((l) => l.upcoming);
  const pendingCount = dueLanes.filter((l) => !checkedIds.has(l.lane_id)).length;
  const unreadByLane = new Map(((data?.unreadPaths ?? []) as { lane_id: string; count: number }[]).map((p) => [p.lane_id, p.count]));

  const greeting = data?.profile?.first_name ? `${data.profile.first_name}.` : "Welcome.";
  const needsGender = data?.profile && !((data.profile as any).gender);
  const refUrl = ref && "code" in ref ? `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${ref.code}` : "";

  const renderLane = (lane: (typeof lanes)[number]) => {
              const st = statusByLane.get(lane.lane_id) ?? "pending";
              const color = statusColor(st);
              const standing = data?.standingByLane?.[lane.lane_id] ?? 0;
              const seats = data?.seatsByLane?.[lane.lane_id] ?? { active: 0, pending: 0 };
              const unread = unreadByLane.get(lane.lane_id) ?? 0;
              const isAvoid = lane.lane_type === "avoid";
              return (
                <Link
                  key={lane.lane_id}
                  to="/paths/$id"
                  params={{ id: lane.lane_id }}
                  search={{ newlyCreated: false }}
                  className="relative overflow-hidden kp-card flex justify-between items-center gap-3 px-4 py-4 text-white no-underline transition-colors hover:border-[#c9a84c]/50"
                >
                  {st === "pending" && !lane.upcoming && (
                    <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r" style={{ background: "#e5af38", boxShadow: "0 0 10px #e5af3899" }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug flex items-center gap-2">
                      <span className="truncate">{lane.title}</span>
                      <span className="text-[0.62rem] px-2 py-0.5 rounded-full font-semibold uppercase tracking-[0.1em] shrink-0 border" style={isAvoid
                        ? { background: "#201008", color: "#e0a075", borderColor: "rgba(224,160,117,0.35)" }
                        : { background: "#0c2010", color: "#6ee7a0", borderColor: "rgba(110,231,160,0.3)" }}>
                        {isAvoid ? "Flee" : "Pursue"}
                      </span>
                      {unread > 0 && (
                        <button
                          type="button"
                          aria-label={`Read new words from your Watchman on ${lane.title}`}
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenLane(lane.lane_id); }}
                          className="text-[0.6rem] px-2 py-1 -my-1 rounded-full font-semibold uppercase tracking-[0.1em] shrink-0 cursor-pointer"
                          style={{ background: "rgba(201,168,76,0.12)", color: "#e5af38", border: "1px solid rgba(201,168,76,0.5)" }}
                        >New</button>
                      )}
                    </p>
                    {lane.description && <p className="text-xs text-[#b8b0a4] leading-relaxed mt-1 mb-1.5 line-clamp-2">{lane.description}</p>}
                    <p className="text-[0.72rem]" style={{ color: "#4ade80" }}>{standing} standing</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <WatchmanPips active={seats.active} pending={seats.pending} />
                    {lane.upcoming ? <span className="text-xs text-stone border border-border rounded-md px-2 py-1 max-w-24 text-center">{pathStartLabel(lane.starts_at ?? '', data?.today ?? '')}</span> : <span className="text-[0.62rem] px-2 py-0.5 rounded-full font-semibold uppercase tracking-[0.1em] border shrink-0" style={{ color, background: `${color}14`, borderColor: `${color}44` }}>
                      {statusLabel(st)}
                    </span>}
                  </div>
                </Link>
              );
  };
  const openLanes = dueLanes.filter((l) => !checkedIds.has(l.lane_id));
  const doneLanes = dueLanes.filter((l) => checkedIds.has(l.lane_id));

  return (
    <div>
      <div className="mb-7">
        <p className="text-xs text-[#9e968a] uppercase tracking-wider mb-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-3xl tracking-wide text-[#f3e6c4]" style={{ fontFamily: "Cinzel, serif" }}>{greeting}</h2>
          <LifetimeBadge />
        </div>
      </div>

      <AccessBanner />

      {(data?.unreadEncouragements ?? 0) > 0 && (() => {
        const paths = (data?.unreadPaths ?? []) as { lane_id: string; count: number; title: string }[];
        const one = paths.length === 1 ? paths[0] : null;
        const total = data?.unreadEncouragements ?? 0;
        const inner = (
          <>
            <p className="text-sm font-semibold text-[#e5af38] mb-0.5">
              {one
                ? `${total > 1 ? `${total} words` : "A word"} from your watchman on ${one.title}`
                : `${total} word${total > 1 ? "s" : ""} from your watchman`}
            </p>
            <p className="text-xs text-[#c2af80]">
              {one ? "Tap to read it." : `Waiting on ${paths.length} paths — marked New in your list.`}
            </p>
          </>
        );
        const cls = "block mb-5 px-4 py-3 kp-card-glow no-underline";
        const style = { background: "linear-gradient(135deg, #1a1408 0%, #0a0800 100%)" };
        return one ? (
          <button type="button" onClick={() => setOpenLane(one.lane_id)} className={`${cls} w-full text-left`} style={style}>{inner}</button>
        ) : (
          <Link to="/paths" className={cls} style={style}>{inner}</Link>
        );
      })()}

      {needsGender && (
        <Link to="/settings" className="block mb-5 px-4 py-3 kp-card no-underline">
          <p className="text-xs text-[#c2af80]">One detail still open in Settings — male or female. Tap to set it whenever you like.</p>
        </Link>
      )}

      {dueLanes.length > 0 && (
        <DayProgressBar statuses={dueLanes.map((l) => statusByLane.get(l.lane_id) ?? "pending")} />
      )}

      {(() => {
        const starter = lanes.find((l) => l.title === "Send Scripture");
        return starter ? <StarterWalkCard laneId={starter.lane_id} onVisibilityChange={setStarterVisible} /> : null;
      })()}


      {!starterVisible && (<>
      {pendingCount > 0 ? (
        <div className="p-5 kp-card-glow">
          <div className="flex justify-between items-center gap-3">
            <div className="min-w-0">
              <p className="font-semibold mb-1">{pendingCount} still open tonight</p>
              <p className="text-[#b8b0a4] text-sm">Check in before your bedtime window closes.</p>
            </div>
            <Link to="/checkin" className="shrink-0 whitespace-nowrap px-4 py-2 kp-lifetime-btn text-black rounded-lg font-bold text-sm">Check In</Link>
          </div>
        </div>
      ) : lanes.length > 0 ? (
        <div className="p-5 kp-card">
          <p className="text-[#4ade80] font-semibold">All clear.</p>
          <p className="text-stone text-xs">{dueLanes.length ? 'Every Path due today is checked in.' : 'Your Paths start tomorrow. Nothing is owed tonight.'}</p>
        </div>
      ) : (
        <div className="p-5 kp-card">
          <p className="text-[#b8b0a4] text-sm mb-4">No active paths yet.</p>
          <Link to="/paths/new" className="inline-block px-4 py-2 bg-white text-black rounded-md font-semibold text-sm">Create your first path</Link>
        </div>
      )}
      </>)}

      <div className="mt-8">
        <div className="flex items-center gap-3 mb-3">
          <p className="text-[0.65rem] text-[#a8a094] uppercase tracking-wider font-semibold shrink-0">Active Paths</p>
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, #c9a84c55, transparent)" }} />
          <Link to="/paths/new" className="text-xs text-[#c9a84c] font-semibold shrink-0">+ New</Link>
        </div>

        {lanes.length === 0 ? (
          <p className="text-[#8a8478] text-sm">None yet.</p>
        ) : (
          <>
            {openLanes.length > 0 && <div className="flex flex-col gap-2">{openLanes.map(renderLane)}</div>}
            {upcomingLanes.length > 0 && <div className={openLanes.length ? 'flex flex-col gap-2 mt-3' : 'flex flex-col gap-2'}>{upcomingLanes.map(renderLane)}</div>}
            {doneLanes.length > 0 && (
              <Accordion type="single" collapsible className={openLanes.length ? "mt-3" : ""}>
                <AccordionItem value="done" className="border-t border-border border-b-0">
                  <AccordionTrigger className="text-stone hover:no-underline text-sm">
                    <span className="flex items-center gap-2"><Check size={16} className="text-history-held" aria-hidden="true" />Completed today · {doneLanes.length}</span>
                  </AccordionTrigger>
                  <AccordionContent><div className="flex flex-col gap-2">{doneLanes.map(renderLane)}</div></AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </>
        )}
      </div>

      {starterVisible && (<div className="mt-6">
      {pendingCount > 0 ? (
        <div className="p-5 kp-card-glow">
          <div className="flex justify-between items-center gap-3">
            <div className="min-w-0">
              <p className="font-semibold mb-1">{pendingCount} still open tonight</p>
              <p className="text-[#b8b0a4] text-sm">Check in before your bedtime window closes.</p>
            </div>
            <Link to="/checkin" className="shrink-0 whitespace-nowrap px-4 py-2 kp-lifetime-btn text-black rounded-lg font-bold text-sm">Check In</Link>
          </div>
        </div>
      ) : lanes.length > 0 ? (
        <div className="p-5 kp-card">
          <p className="text-[#4ade80] font-semibold">All clear.</p>
          <p className="text-stone text-xs">{dueLanes.length ? 'Every Path due today is checked in.' : 'Your Paths start tomorrow. Nothing is owed tonight.'}</p>
        </div>
      ) : (
        <div className="p-5 kp-card">
          <p className="text-[#b8b0a4] text-sm mb-4">No active paths yet.</p>
          <Link to="/paths/new" className="inline-block px-4 py-2 bg-white text-black rounded-md font-semibold text-sm">Create your first path</Link>
        </div>
      )}
      </div>)}

      {ref && "code" in ref && (
        <CallToWallCard className="mt-8" url={refUrl} invited={ref.invited ?? 0} walking={ref.walking ?? 0} />
      )}

      {openLane && openWords.length > 0 && (
        <WatchmanWordsModal
          laneId={openLane}
          title={lanes.find((l) => l.lane_id === openLane)?.title ?? "Your path"}
          words={openWords}
          onClose={() => setOpenLane(null)}
        />
      )}
    </div>
  );
}
