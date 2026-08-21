import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getSettings, updateProfile } from "@/lib/api.functions";
import { getMyReferral } from "@/lib/referrals.functions";
import { AppLayout } from "@/components/AppLayout";
import { AppUpdateSection } from "@/components/AppUpdateSection";
import { TIMEZONE_OPTIONS } from "@/lib/localday";


export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Kingdom Protocol" }] }),
  component: () => <AppLayout><Settings /></AppLayout>,
});

function Settings() {
  const fn = useServerFn(getSettings);
  const update = useServerFn(updateProfile);
  const refFn = useServerFn(getMyReferral);
  const { data, isLoading, refetch } = useQuery({ queryKey: ["settings"], queryFn: () => fn() });
  const { data: ref } = useQuery({ queryKey: ["my-referral"], queryFn: () => refFn() });
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [phone, setPhone] = useState("");
  const [bedtime, setBedtime] = useState("22:00");
  const [tz, setTz] = useState("America/Chicago");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [showGender, setShowGender] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const m = useMutation({
    mutationFn: () => update({ data: { first_name: first, last_name: last, phone, bedtime, timezone: tz, gender: gender || null } }),
    onSuccess: (r: any) => { if (r?.error) setErr(r.error); else { setSaved(true); refetch(); } },
  });

  useEffect(() => {
    if (data?.profile) {
      setFirst(data.profile.first_name ?? "");
      setLast(data.profile.last_name ?? "");
      setPhone(data.profile.phone ?? "");
      setBedtime((data.profile.bedtime ?? "22:00:00").slice(0, 5));
      setTz(data.profile.timezone ?? "America/Chicago");
      setGender(((data.profile as any).gender ?? "") as "male" | "female" | "");
    }
  }, [data]);

  if (isLoading) return <p className="text-[#9e968a]">Loading…</p>;
  const archived = data?.archivedLanes ?? [];
  const savedGender = ((data?.profile as any)?.gender ?? "") as "male" | "female" | "";
  const inputCls = "px-4 py-3 bg-[#111] border border-[#222] rounded-md text-white outline-none w-full";
  const refUrl = ref && "code" in ref ? `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${ref.code}` : "";

  const genderToggle = (
    <div className="grid grid-cols-2 gap-2">
      {(["male", "female"] as const).map((g) => (
        <button
          key={g}
          type="button"
          onClick={() => setGender(g)}
          className="py-3 rounded-md border text-sm font-semibold capitalize"
          style={{
            background: gender === g ? "#c9a84c" : "#111",
            color: gender === g ? "#000" : "#fff",
            borderColor: gender === g ? "#c9a84c" : "#222",
          }}
        >
          {g}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <Link to="/dashboard" className="text-[#a8a094]">←</Link>
        <h2 className="text-xl font-bold">Settings</h2>
      </div>
      <p className="text-[#b8b0a4] text-sm mb-8">Your name, contact info, bedtime and timezone. This is also where you get your invite link.</p>

      <form onSubmit={(e) => { e.preventDefault(); setErr(null); setSaved(false); m.mutate(); }} className="flex flex-col gap-6 max-w-md">
        <div className="flex gap-3">
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-sm font-semibold text-[#ded8cc]">First Name</label>
            <input value={first} onChange={(e) => setFirst(e.target.value)} maxLength={50} className={inputCls} />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-sm font-semibold text-[#ded8cc]">Last Name</label>
            <input value={last} onChange={(e) => setLast(e.target.value)} maxLength={50} className={inputCls} />
          </div>
        </div>

        {!savedGender && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#ded8cc]">Are you male or female?</label>
            {genderToggle}
            <p className="text-xs text-[#b8b0a4]">Used so watchmen are matched man-to-man and woman-to-woman. Never shown publicly.</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#ded8cc]">Email</label>
          <input value={data?.profile?.email ?? ""} disabled className={inputCls + " text-[#948d80] cursor-not-allowed"} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#ded8cc]">Phone Number</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" className={inputCls} />
          <p className="text-xs text-[#b8b0a4]">Shared with watchmen only when you breach or go silent.</p>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#ded8cc]">Bedtime</label>
          <p className="text-xs text-[#b8b0a4]">We nudge you one hour before this time, so you can close the day out before you sleep.</p>
          <input type="time" required value={bedtime} onChange={(e) => setBedtime(e.target.value)} className={inputCls} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#ded8cc]">Timezone</label>
          <select value={tz} onChange={(e) => setTz(e.target.value)} className={inputCls}>
            {TIMEZONE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <p className="text-xs text-[#b8b0a4]">Your day starts and ends on this clock — check-ins are counted against it.</p>
        </div>
        {err && <p className="text-red-400 text-sm">{err}</p>}
        {saved && <p className="text-[#4ade80] text-sm">Settings saved.</p>}
        <button disabled={m.isPending} className="py-3 bg-white text-black rounded-md font-semibold">
          {m.isPending ? "Saving…" : "Save"}
        </button>
      </form>

      {ref && "code" in ref && (
        <div className="mt-12 max-w-md p-5 rounded-xl border border-[#2a2518]" style={{ background: "#161210" }}>
          <p className="text-sm font-semibold text-[#c9a84c] mb-1">Call someone to the wall.</p>
          <p className="text-xs text-[#b8b0a4] mb-4 leading-relaxed">
            This is your invite link. Send it to anyone you want using Kingdom Protocol. They open it, sign up, and start their own paths — it does not make them your watchman.
          </p>
          <div className="flex items-center gap-2">
            <input readOnly value={refUrl} className="flex-1 px-3 py-2 text-base bg-[#0a0800] border border-[#222] rounded text-white outline-none" />
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
          <p className="text-[0.7rem] text-[#9e968a] mt-3">
            You've invited <span className="text-[#c9a84c] font-semibold">{ref.invited}</span> · <span className="text-[#c9a84c] font-semibold">{ref.walking}</span> are walking.
          </p>
        </div>
      )}

      {archived.length > 0 && (
        <div className="mt-12">
          <p className="text-[0.7rem] text-[#9e968a] uppercase tracking-wider font-semibold mb-2">Archived Paths</p>

          <div className="flex flex-col gap-1.5">
            {archived.map((l) => (
              <div key={l.lane_id} className="flex justify-between items-center px-3 py-2 rounded border border-[#141414]" style={{ background: "#0a0a0a" }}>
                <span className="text-sm text-[#b8b0a4]">{l.title}</span>
                <span className="text-xs text-[#948d80]">{new Date(l.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {savedGender && (
        <div className="mt-12 max-w-md">
          {!showGender ? (
            <p className="text-xs text-[#a8a094]">
              Recorded as <span className="capitalize text-[#ded8cc]">{savedGender}</span>.{" "}
              <button type="button" onClick={() => setShowGender(true)} className="text-[#c9a84c] underline bg-transparent border-0 p-0 cursor-pointer text-xs">Change</button>
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {genderToggle}
              <button
                type="button"
                onClick={() => { setErr(null); setSaved(false); m.mutate(); setShowGender(false); }}
                className="py-2 bg-white text-black rounded-md font-semibold text-sm"
              >Save change</button>
            </div>
          )}
        </div>
      )}

      <AppUpdateSection />
    </div>

  );
}
