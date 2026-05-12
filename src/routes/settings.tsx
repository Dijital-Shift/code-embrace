import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getSettings, updateProfile } from "@/lib/api.functions";
import { AppLayout } from "@/components/AppLayout";

const TIMEZONES = ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Phoenix", "America/Anchorage", "Pacific/Honolulu"];

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Kingdom Protocol" }] }),
  component: () => <AppLayout><Settings /></AppLayout>,
});

function Settings() {
  const fn = useServerFn(getSettings);
  const update = useServerFn(updateProfile);
  const { data, isLoading, refetch } = useQuery({ queryKey: ["settings"], queryFn: () => fn() });
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [phone, setPhone] = useState("");
  const [bedtime, setBedtime] = useState("22:00");
  const [tz, setTz] = useState("America/Chicago");
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const m = useMutation({
    mutationFn: () => update({ data: { first_name: first, last_name: last, phone, bedtime, timezone: tz } }),
    onSuccess: (r: any) => { if (r?.error) setErr(r.error); else { setSaved(true); refetch(); } },
  });

  useEffect(() => {
    if (data?.profile) {
      setFirst(data.profile.first_name ?? "");
      setLast(data.profile.last_name ?? "");
      setPhone(data.profile.phone ?? "");
      setBedtime((data.profile.bedtime ?? "22:00:00").slice(0, 5));
      setTz(data.profile.timezone ?? "America/Chicago");
    }
  }, [data]);

  if (isLoading) return <p className="text-[#555]">Loading…</p>;
  const archived = data?.archivedLanes ?? [];
  const inputCls = "px-4 py-3 bg-[#111] border border-[#222] rounded-md text-white outline-none w-full";

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <Link to="/dashboard" className="text-[#666]">←</Link>
        <h2 className="text-xl font-bold">Settings</h2>
      </div>
      <p className="text-[#555] text-xs mb-8">Your bedtime sets when check-in reminders fire. Your phone goes to watchmen on breach or miss.</p>

      <form onSubmit={(e) => { e.preventDefault(); setErr(null); setSaved(false); m.mutate(); }} className="flex flex-col gap-6 max-w-md">
        <div className="flex gap-3">
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-sm font-semibold text-[#ccc]">First Name</label>
            <input value={first} onChange={(e) => setFirst(e.target.value)} maxLength={50} className={inputCls} />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-sm font-semibold text-[#ccc]">Last Name</label>
            <input value={last} onChange={(e) => setLast(e.target.value)} maxLength={50} className={inputCls} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#ccc]">Email</label>
          <input value={data?.profile?.email ?? ""} disabled className={inputCls + " text-[#444] cursor-not-allowed"} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#ccc]">Phone Number</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" className={inputCls} />
          <p className="text-xs text-[#555]">Shared with watchmen only when a breach or miss occurs.</p>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#ccc]">Bedtime</label>
          <input type="time" required value={bedtime} onChange={(e) => setBedtime(e.target.value)} className={inputCls} />
          <p className="text-xs text-[#555]">Reminder fires 1 hour before this.</p>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#ccc]">Timezone</label>
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

      {archived.length > 0 && (
        <div className="mt-12">
          <p className="text-[0.7rem] text-[#555] uppercase tracking-wider font-semibold mb-2">Archived Lanes</p>
          <div className="flex flex-col gap-1.5">
            {archived.map((l) => (
              <div key={l.lane_id} className="flex justify-between items-center px-3 py-2 rounded border border-[#141414]" style={{ background: "#0a0a0a" }}>
                <span className="text-sm text-[#555]">{l.title}</span>
                <span className="text-xs text-[#333]">{new Date(l.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
