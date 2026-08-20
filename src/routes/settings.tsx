import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getSettings, updateProfile } from "@/lib/api.functions";
import { getMyReferral } from "@/lib/referrals.functions";
import { AppLayout } from "@/components/AppLayout";

const TIMEZONES = ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Phoenix", "America/Anchorage", "Pacific/Honolulu"];

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
  const inputCls = "px-4 py-3 bg-[#111] border border-[#222] rounded-md text-white outline-none w-full";
  const refUrl = ref && "code" in ref ? `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${ref.code}` : "";

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <Link to="/dashboard" className="text-[#a8a094]">←</Link>
        <h2 className="text-xl font-bold">Settings</h2>
      </div>
      <p className="text-[#9e968a] text-xs mb-8">Your bedtime sets when check-in reminders fire. Your phone goes to watchmen on breach or miss.</p>

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
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#ded8cc]">Male or Female</label>
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
          <p className="text-xs text-[#9e968a]">Used for pastoral fit — never public.</p>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#ded8cc]">Email</label>
          <input value={data?.profile?.email ?? ""} disabled className={inputCls + " text-[#948d80] cursor-not-allowed"} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#ded8cc]">Phone Number</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" className={inputCls} />
          <p className="text-xs text-[#9e968a]">Shared with watchmen only when a breach or miss occurs.</p>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#ded8cc]">Bedtime</label>
          <input type="time" required value={bedtime} onChange={(e) => setBedtime(e.target.value)} className={inputCls} />
          <p className="text-xs text-[#9e968a]">Reminder fires 1 hour before this.</p>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#ded8cc]">Timezone</label>
          <select value={tz} onChange={(e) => setTz(e.target.value)} className={inputCls}>
            {TIMEZONES.map((t) => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
          </select>
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
            Not as your watchman — as someone walking their own path. If they become your watchman later, that's the Lord's doing.
          </p>
          <div className="flex items-center gap-2">
            <input readOnly value={refUrl} className="flex-1 px-3 py-2 text-xs bg-[#0a0800] border border-[#222] rounded text-[#c8c0b4] outline-none" />
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
                <span className="text-sm text-[#9e968a]">{l.title}</span>
                <span className="text-xs text-[#8a8478]">{new Date(l.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
