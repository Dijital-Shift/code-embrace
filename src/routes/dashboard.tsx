import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getDashboard } from "@/lib/api.functions";
import { getMyReferral } from "@/lib/referrals.functions";
import { AppLayout } from "@/components/AppLayout";
import { AccessBanner } from "@/components/AccessBanner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Kingdom Protocol" }] }),
  component: () => <AppLayout><Dashboard /></AppLayout>,
});

function Dashboard() {
  const fn = useServerFn(getDashboard);
  const refFn = useServerFn(getMyReferral);
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: () => fn() });
  const { data: ref } = useQuery({ queryKey: ["my-referral"], queryFn: () => refFn() });
  const [copied, setCopied] = useState(false);

  if (isLoading) return <p className="text-[#555]">Loading…</p>;
  const lanes = data?.lanes ?? [];
  const todayCheckins = data?.todayCheckins ?? [];
  const checkedIds = new Set(todayCheckins.map((c) => c.lane_id));
  const pendingCount = lanes.filter((l) => !checkedIds.has(l.lane_id)).length;
  const greeting = data?.profile?.first_name ? `${data.profile.first_name}.` : "Welcome.";
  const needsGender = data?.profile && !((data.profile as any).gender);
  const refUrl = ref && "code" in ref ? `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${ref.code}` : "";

  return (
    <div>
      <div className="mb-7">
        <p className="text-xs text-[#555] uppercase tracking-wider mb-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h2 className="text-3xl font-extrabold tracking-tight">{greeting}</h2>
      </div>

      <AccessBanner />

      {needsGender && (
        <Link to="/settings" className="block mb-5 p-4 rounded-xl border border-[#3a2f12] no-underline" style={{ background: "#1e1808" }}>
          <p className="text-sm text-[#c9a84c] font-semibold">One quick detail — male or female?</p>
          <p className="text-xs text-[#aa9560] mt-1">Tap to set it in Settings. Used for pastoral fit, never public.</p>
        </Link>
      )}

      {pendingCount > 0 ? (
        <div className="p-5 rounded-xl border border-[#c9a84c33]" style={{ background: "linear-gradient(135deg, #0f0d00 0%, #0a0800 100%)" }}>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold mb-1">{pendingCount} path{pendingCount > 1 ? "s" : ""} need attention</p>
              <p className="text-[#888] text-sm">Check in before your bedtime window closes.</p>
            </div>
            <Link to="/checkin" className="px-4 py-2 bg-[#c9a84c] text-black rounded-md font-bold text-sm">Check In</Link>
          </div>
        </div>
      ) : lanes.length > 0 ? (
        <div className="p-5 rounded-xl border border-[#2a2518]" style={{ background: "#161210" }}>
          <p className="text-[#4ade80] font-semibold">All clear.</p>
          <p className="text-[#555] text-xs">Every path checked in. Stay aligned.</p>
        </div>
      ) : (
        <div className="p-5 rounded-xl border border-[#2a2518]" style={{ background: "#161210" }}>
          <p className="text-[#888] text-sm mb-4">No active paths yet.</p>
          <Link to="/paths/new" className="inline-block px-4 py-2 bg-white text-black rounded-md font-semibold text-sm">Create your first path</Link>
        </div>
      )}

      {(standing + fallen) > 0 && (
        <div className="mt-8 p-5 rounded-xl border border-[#2a2518] text-center" style={{ background: "#161210" }}>
          <div className="flex items-baseline justify-center gap-4">
            <div>
              <div className="text-3xl font-extrabold text-[#4ade80]">{standing}</div>
              <div className="text-[0.6rem] uppercase tracking-wider text-[#4ade80]">Standing</div>
            </div>
            <span className="text-[#444] text-xl">·</span>
            <div>
              <div className="text-2xl font-bold text-[#f87171]">{fallen}</div>
              <div className="text-[0.6rem] uppercase tracking-wider text-[#f87171]">Fallen</div>
            </div>
          </div>
          <p className="text-[0.7rem] text-[#aa9560] mt-3">{standing} standing · {fallen} fallen — still rising.</p>
          <p className="text-[0.65rem] italic text-[#666] mt-1">
            For a just man falleth seven times, and riseth up again. — Proverbs 24:16
          </p>
        </div>
      )}

      <div className="mt-8">
        <div className="flex justify-between items-center mb-3">
          <p className="text-[0.65rem] text-[#666] uppercase tracking-wider font-semibold">Active Paths</p>
          <Link to="/paths/new" className="text-xs text-[#c9a84c] font-semibold">+ New</Link>
        </div>

        {lanes.length === 0 ? (
          <p className="text-[#333] text-sm">None yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {lanes.map((lane) => {
              const checked = checkedIds.has(lane.lane_id);
              return (
                <Link key={lane.lane_id} to="/paths/$id" params={{ id: lane.lane_id }} search={{ newlyCreated: false }} className="flex justify-between items-center px-4 py-3.5 rounded-xl border border-[#2a2518] text-white no-underline" style={{ background: "#161210" }}>
                  <span className="text-sm font-medium">{lane.title}</span>
                  <span className="text-[0.7rem] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ color: checked ? "#4ade80" : "#c9a84c", background: checked ? "#052e16" : "#1a1400" }}>
                    {checked ? "Done" : "Pending"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {ref && "code" in ref && (
        <div className="mt-8 p-5 rounded-xl border border-[#2a2518]" style={{ background: "#161210" }}>
          <p className="text-sm font-semibold text-[#c9a84c] mb-1">Call someone to the wall.</p>
          <p className="text-xs text-[#888] mb-4 leading-relaxed">
            Not as your watchman — as someone walking their own path. If they become your watchman later, that's the Lord's doing.
          </p>
          <div className="flex items-center gap-2">
            <input readOnly value={refUrl} className="flex-1 px-3 py-2 text-xs bg-[#0a0800] border border-[#222] rounded text-[#aaa] outline-none" />
            <button
              type="button"
              onClick={async () => {
                try { await navigator.clipboard.writeText(refUrl); } catch {}
                setCopied(true); setTimeout(() => setCopied(false), 2000);
              }}
              className="text-xs px-3 py-2 bg-[#c9a84c] text-black rounded font-semibold"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-[0.7rem] text-[#555] mt-3">
            You've invited <span className="text-[#c9a84c] font-semibold">{ref.invited}</span> · <span className="text-[#c9a84c] font-semibold">{ref.walking}</span> are walking.
          </p>
        </div>
      )}
    </div>
  );
}
