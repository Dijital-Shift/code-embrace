import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getSettings, updateProfile, reactivateLane, deleteArchivedLane } from "@/lib/api.functions";
import { requestAccountDeletion, cancelAccountDeletion, deleteAccountNow } from "@/lib/deletion.functions";
import { getMyReferral } from "@/lib/referrals.functions";
import { AppLayout } from "@/components/AppLayout";
import { AppUpdateSection } from "@/components/AppUpdateSection";
import { CallToWallCard } from "@/components/CallToWallCard";
import { FeedbackModal } from "@/components/FeedbackModal";
import { AvatarPicker } from "@/components/AvatarPicker";
import { formatPhone, isValidPhone } from "@/lib/phone";
import { TIMEZONE_GROUPS } from "@/lib/localday";
import { useRevealOnOpen } from "@/hooks/useRevealOnOpen";


export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { title: "Settings — Kingdom Protocol" },
    { name: "description", content: "Manage your Kingdom Protocol profile, alerts, and account." },
    { property: "og:title", content: "Settings — Kingdom Protocol" },
    { property: "og:description", content: "Manage your Kingdom Protocol profile, alerts, and account." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  loader: ({ context }) => {
    if (typeof window === "undefined") return;
    void context.queryClient.prefetchQuery({ queryKey: ["settings"], queryFn: () => getSettings() }).catch(() => {});
  },
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
  const [tzAuto, setTzAuto] = useState(true);
  const [deviceTz, setDeviceTz] = useState<string | null>(null);
  useEffect(() => {
    try { setDeviceTz(Intl.DateTimeFormat().resolvedOptions().timeZone || null); } catch {}
  }, []);
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [showGender, setShowGender] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const m = useMutation({
    mutationFn: () => update({ data: { first_name: first, last_name: last, phone, bedtime, timezone: tzAuto && deviceTz ? deviceTz : tz, timezone_auto: tzAuto, gender: gender || null } }),
    onSuccess: (r: any) => { if (r?.error) setErr(r.error); else { setSaved(true); refetch(); } },
  });

  useEffect(() => {
    if (data?.profile) {
      setFirst(data.profile.first_name ?? "");
      setLast(data.profile.last_name ?? "");
      setPhone(formatPhone(data.profile.phone ?? ""));
      setBedtime((data.profile.bedtime ?? "22:00:00").slice(0, 5));
      setTz(data.profile.timezone ?? "America/Chicago");
      setTzAuto((data.profile as any).timezone_auto !== false);
      setGender(((data.profile as any).gender ?? "") as "male" | "female" | "");
    }
  }, [data]);

  if (isLoading) return <p className="text-[#9e968a]">Loading…</p>;
  const archived = data?.archivedLanes ?? [];
  const savedGender = ((data?.profile as any)?.gender ?? "") as "male" | "female" | "";
  const inputCls = "px-4 py-3 bg-[#0a0800] border border-[#c9a84c]/20 rounded-lg text-white outline-none w-full min-w-0 focus:border-[#c9a84c]/60";
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

  const sectionLabel = "text-[0.65rem] text-[#a8a094] uppercase tracking-[0.18em] font-semibold mb-3 px-1";
  const label = "text-xs font-semibold text-[#ded8cc]";
  const hint = "text-[0.7rem] text-[#9e968a] leading-relaxed";

  return (
    <div className="max-w-md mx-auto w-full">
      <div className="flex items-center gap-3 mb-1">
        <Link to="/dashboard" className="text-[#a8a094]">←</Link>
        <h2 className="text-2xl text-[#f3e6c4]" style={{ fontFamily: "Cinzel, serif" }}>Settings</h2>
      </div>
      <p className="text-[#a8a094] text-xs mb-8">Your profile, your day, and your invite.</p>

      <p className={sectionLabel}>Profile</p>
      <form onSubmit={(e) => { e.preventDefault(); setErr(null); setSaved(false); if (!isValidPhone(phone)) { setErr("Enter your full phone number — your Watchman can't reach you otherwise."); document.getElementById("kp-phone")?.focus(); return; } m.mutate(); }} className="kp-card p-5 flex flex-col gap-5">
        {data?.profile && (
          <AvatarPicker
            initial={(data.profile as any).avatar_url ?? null}
            name={`${first} ${last}`.trim()}
          />
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className={label}>First name</label>
            <input value={first} onChange={(e) => setFirst(e.target.value)} maxLength={50} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className={label}>Last name</label>
            <input value={last} onChange={(e) => setLast(e.target.value)} maxLength={50} className={inputCls} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={label}>Email</label>
          <input value={data?.profile?.email ?? ""} disabled className={inputCls + " text-[#948d80] cursor-not-allowed"} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={label}>Phone</label>
          <input id="kp-phone" required type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => { setPhone(formatPhone(e.target.value)); setErr(null); }} placeholder="(555) 123-4567" aria-invalid={!!phone && !isValidPhone(phone)} className={inputCls} style={phone && !isValidPhone(phone) ? { borderColor: "#e0a040" } : undefined} />
          {phone && !isValidPhone(phone) ? (
            <p className="text-[0.7rem] text-[#e0a040] font-semibold" role="alert">Incomplete number — {phone.trim().startsWith("+") ? "enter the full international number" : `${10 - Math.min(10, phone.replace(/\D/g, "").replace(/^1(?=\d{10})/, "").length)} digit(s) missing`}.</p>
          ) : (
            <p className={hint}>Your Watchman will call or text you when you breach or go silent. Kept strictly between the two of you.</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={label}>Male or female</label>
          {!savedGender || showGender ? (
            <>
              {genderToggle}
              <p className={hint}>Watchmen are matched man-to-man and woman-to-woman. Never shown publicly.</p>
            </>
          ) : (
            <p className="text-sm text-[#ded8cc] capitalize">
              {savedGender}{" "}
              <button type="button" onClick={() => setShowGender(true)} className="ml-2 normal-case text-xs text-[#c9a84c] underline bg-transparent border-0 p-0">Change</button>
            </p>
          )}
        </div>

        <div className="h-px bg-[#c9a84c]/15" />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className={label}>Bedtime</label>
            <input type="time" required value={bedtime} onChange={(e) => setBedtime(e.target.value)} className={inputCls + " appearance-none block"} style={{ WebkitAppearance: "none", minHeight: "3rem", textAlign: "left" }} />
          </div>
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className={label}>Timezone</label>
            <select value={tzAuto ? "auto" : tz} onChange={(e) => {
              if (e.target.value === "auto") { setTzAuto(true); if (deviceTz) setTz(deviceTz); }
              else { setTzAuto(false); setTz(e.target.value); }
            }} className={inputCls}>
              <option value="auto">Auto{deviceTz ? ` — ${deviceTz.replace(/_/g, " ")}` : ""}</option>
              {TIMEZONE_GROUPS.map((g) => (
                <optgroup key={g.group} label={g.group}>
                  {g.options.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </optgroup>
              ))}
              {!tzAuto && !TIMEZONE_GROUPS.some((g) => g.options.some((o) => o.value === tz)) && (
                <option value={tz}>{tz.replace(/_/g, " ")}</option>
              )}
            </select>
          </div>
        </div>
        <p className={hint + " -mt-3"}>We nudge you an hour before bedtime. Your day is counted on this clock.</p>

        {err && <p className="text-red-400 text-sm">{err}</p>}
        {saved && <p className="text-[#4ade80] text-sm">Settings saved.</p>}
        <button disabled={m.isPending} onClick={() => setShowGender(false)} className="kp-lifetime-btn py-3 text-[#0a0800] rounded-xl font-bold text-sm">
          {m.isPending ? "Saving…" : "Save changes"}
        </button>
      </form>


      {ref && "code" in ref && (
        <CallToWallCard className="mt-10" url={refUrl} invited={ref.invited ?? 0} walking={ref.walking ?? 0} />
      )}

      {archived.length > 0 && (
        <div className="mt-10">
          <p className={sectionLabel}>Archived paths · {archived.length}</p>
          <div className="flex flex-col gap-1.5">
            {archived.map((l) => (
              <ArchivedRow key={l.lane_id} lane={l} onChanged={() => refetch()} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <p className={sectionLabel}>More</p>
        <div className="kp-card overflow-hidden divide-y divide-[#c9a84c]/10">
          <Link to="/billing" className="flex items-center justify-between px-4 py-3.5 no-underline">
            <span>
              <span className="block text-sm text-[#ded8cc] font-medium">Billing</span>
              <span className="block text-[0.7rem] text-[#8f887c]">View your plan, manage your subscription, see receipts.</span>
            </span>
            <span className="text-[#c9a84c]">›</span>
          </Link>
          <button type="button" onClick={() => setFeedbackOpen(true)} className="w-full flex items-center justify-between px-4 py-3.5 text-left bg-transparent border-0">
            <span>
              <span className="block text-sm text-[#ded8cc] font-medium">Send feedback</span>
              <span className="block text-[0.7rem] text-[#8f887c]">Tell us what's working and what isn't.</span>
            </span>
            <span className="text-[#c9a84c]">›</span>
          </button>
          <a href="/?view=landing" className="flex items-center justify-between px-4 py-3.5 no-underline">
            <span>
              <span className="block text-sm text-[#ded8cc] font-medium">Kingdom Protocol homepage</span>
              <span className="block text-[0.7rem] text-[#8f887c]">See or share the main page.</span>
            </span>
            <span className="text-[#c9a84c]">›</span>
          </a>
          <Link to="/partner" className="flex items-center justify-between px-4 py-3.5 no-underline">
            <span>
              <span className="block text-sm text-[#ded8cc] font-medium">Watchman alerts</span>
              <span className="block text-[0.7rem] text-[#8f887c]">Check alerts on this device and send a test.</span>
            </span>
            <span className="text-[#c9a84c]">›</span>
          </Link>
          {([
            ["/terms", "Terms of Service", "The rules of the walk."],
            ["/privacy", "Privacy Policy", "What we keep and why."],
            ["/refund", "Refund Policy", "Handled through Stripe."],
          ] as const).map(([to, title, sub]) => (
            <Link key={to} to={to} className="flex items-center justify-between px-4 py-3.5 no-underline">
              <span>
                <span className="block text-sm text-[#ded8cc] font-medium">{title}</span>
                <span className="block text-[0.7rem] text-[#8f887c]">{sub}</span>
              </span>
              <span className="text-[#c9a84c]">›</span>
            </Link>
          ))}
        </div>
      </div>

      {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}

      <AppUpdateSection />

      <SignOutRow />

      <DeleteAccountSection
        requestedAt={(data?.profile as any)?.deletion_requested_at ?? null}
        onChanged={() => refetch()}
      />
    </div>
  );
}

function SignOutRow() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="kp-card w-full flex items-center justify-between px-4 py-3.5 text-left cursor-pointer"
      >
        <span>
          <span className="block text-sm text-[#ded8cc] font-medium">Sign out</span>
          <span className="block text-[0.7rem] text-[#8f887c]">You'll need your emailed code or Google to return.</span>
        </span>
        <span className="text-[#8f887c]">›</span>
      </button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="bg-[#100d05] border border-[#2a2415] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Sign out of Kingdom Protocol?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#a49d8e]">
              You will need your emailed code or Google to sign back in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-[#2a2415] text-[#cfc8b8] hover:bg-[#1a1509] hover:text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => { await signOut(); router.navigate({ to: "/login" }); }}
              className="bg-[#c9a84c] text-[#0a0800] hover:bg-[#dcbb5c]"
            >Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/** Self-serve account deletion: reason required, watchmen alerted, 14-day hold. */
function DeleteAccountSection({ requestedAt, onChanged }: { requestedAt: string | null; onChanged: () => void }) {
  const requestFn = useServerFn(requestAccountDeletion);
  const cancelFn = useServerFn(cancelAccountDeletion);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const boxRef = useRevealOnOpen<HTMLDivElement>(open);
  const nowFn = useServerFn(deleteAccountNow);
  const [sure, setSure] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const sureRef = useRevealOnOpen<HTMLDivElement>(sure, true);

  async function deleteNowClick() {
    if (busy) return;
    setBusy(true); setErr(null);
    const r: any = await nowFn({ data: { confirm: "confirm" } });
    if (r?.error) { setBusy(false); setErr(r.error); return; }
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.auth.signOut().catch(() => {});
    window.location.href = "/";
  }

  async function run(fn: () => Promise<any>) {
    if (busy) return;
    setBusy(true); setErr(null);
    const r: any = await fn();
    setBusy(false);
    if (r?.error) { setErr(r.error); return; }
    setOpen(false); setReason("");
    onChanged();
  }

  if (requestedAt) {
    const purgeDate = new Date(new Date(requestedAt).getTime() + 14 * 86400000);
    return (
      <div className="mt-10 kp-card p-5" style={{ borderColor: "#4a1f1f" }}>
        <p className="text-sm text-[#f87171] font-semibold mb-1">Account deletion pending</p>
        <p className="text-[0.7rem] text-[#9e968a] leading-relaxed mb-3">
          Your watchmen have been told. Everything is permanently deleted on{" "}
          <span className="text-[#ded8cc]">{purgeDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>{" "}
          unless you change your mind.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button" disabled={busy}
            onClick={() => run(() => cancelFn({}))}
            className="kp-lifetime-btn px-4 py-2.5 rounded-lg text-[#0a0800] text-xs font-bold"
          >{busy ? "Working…" : "Keep my account"}</button>
          <button
            type="button" disabled={busy}
            onClick={() => { setSure((s) => !s); setConfirmText(""); }}
            className="px-4 py-2.5 rounded-lg border border-[#4a1f1f] text-[#f87171] text-xs font-semibold"
          >I am sure</button>
        </div>
        {sure && (
          <div ref={sureRef} className="mt-4 scroll-mt-24">
            <p className="text-[0.7rem] text-[#9e968a] leading-relaxed mb-2">
              This deletes everything right now. It cannot be undone. Type <span className="text-[#ded8cc] font-semibold">confirm</span> to continue.
            </p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoCapitalize="none" autoCorrect="off" spellCheck={false}
              placeholder="confirm"
              className="w-full rounded-lg bg-[#0d0d0d] border border-[#4a1f1f] px-3 py-2.5 text-base text-[#ded8cc] mb-3"
            />
            <button
              type="button"
              disabled={busy || confirmText.trim().toLowerCase() !== "confirm"}
              onClick={deleteNowClick}
              className="w-full px-4 py-2.5 rounded-lg bg-[#b91c1c] disabled:opacity-40 text-[#fff] text-xs font-bold"
            >{busy ? "Deleting…" : "Delete my account now"}</button>
          </div>
        )}
        {err && <p className="text-red-400 text-xs mt-2">{err}</p>}
      </div>
    );
  }

  return (
    <div className="mt-10">
      <p className="text-[0.65rem] text-[#a8a094] uppercase tracking-[0.18em] font-semibold mb-3 px-1">Danger zone</p>
      <div className="kp-card overflow-hidden" style={{ borderColor: "#4a1f1f" }}>
        <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-4 py-3.5 text-left bg-transparent border-0">
          <span>
            <span className="block text-sm text-[#f87171] font-medium">Delete account</span>
            <span className="block text-[0.7rem] text-[#8f887c]">Your watchmen are told first. Nothing happens quietly.</span>
          </span>
          <span className="text-[#f87171]">›</span>
        </button>
        {open && (
          <div ref={boxRef} className="px-4 pb-4 pt-1 border-t border-[#2a2518] scroll-mt-24">
            <ul className="text-[0.7rem] text-[#9e968a] leading-relaxed list-disc pl-4 my-3 flex flex-col gap-1">
              <li>Every active watchman receives your reason before anything is deleted.</li>
              <li>Your account is held for 14 days — sign in anytime to cancel with one tap.</li>
              <li>An active monthly plan is cancelled so no further charges occur.</li>
              <li>A lifetime plan is forfeited — coming back later means buying again.</li>
              <li>After the hold, your profile, paths, check-ins and messages are gone for good.</li>
            </ul>
            <textarea
              rows={3}
              minLength={5}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you leaving? Your watchmen will read this word for word."
              className="w-full px-3 py-2 text-base bg-[#0a0800] border border-[#2a2518] rounded text-white outline-none resize-none"
            />
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                disabled={reason.trim().length < 5 || busy}
                onClick={() => run(() => requestFn({ data: { reason: reason.trim() } }))}
                className="px-4 py-2 rounded-md text-xs font-bold"
                style={{ background: reason.trim().length >= 5 ? "#7f1d1d" : "#2a2518", color: reason.trim().length >= 5 ? "#fff" : "#7d7668" }}
              >{busy ? "Notifying watchmen…" : "Notify watchmen and delete"}</button>
              <button type="button" onClick={() => { setOpen(false); setReason(""); }} className="text-xs text-[#a8a094] underline bg-transparent border-0">Cancel</button>
            </div>
            {err && <p className="text-red-400 text-xs mt-2">{err}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

/** One archived path with its two ways out: back onto the walk, or gone for good. */
function ArchivedRow({ lane, onChanged }: { lane: { lane_id: string; title: string; created_at: string; ends_at?: string | null }; onChanged: () => void }) {
  const finished = !!lane.ends_at && lane.ends_at < new Date().toLocaleDateString("en-CA");
  const reactivate = useServerFn(reactivateLane);
  const remove = useServerFn(deleteArchivedLane);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const confirmRef = useRevealOnOpen<HTMLDivElement>(confirming);
  const [err, setErr] = useState<string | null>(null);

  async function run(fn: () => Promise<any>) {
    if (busy) return;
    setBusy(true); setErr(null);
    const r: any = await fn();
    setBusy(false);
    if (r?.error) { setErr(r.error); return; }
    setConfirming(false);
    onChanged();
  }

  return (
    <div className="kp-card px-4 py-3">
      <div className="flex justify-between items-center gap-3">
        <div className="min-w-0">
          <span className="text-sm text-[#ded8cc] block truncate">{finished && <span className="text-[#c9a84c] mr-1" aria-hidden="true">✦</span>}{lane.title}</span>
          {finished
            ? <span className="text-[0.7rem] text-[#c9a84c] font-semibold">Completed · finished {lane.ends_at}</span>
            : <span className="text-[0.7rem] text-[#948d80]">Archived · started {new Date(lane.created_at).toLocaleDateString()}</span>}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button" disabled={busy}
            onClick={() => run(() => reactivate({ data: { id: lane.lane_id } }))}
            className="px-3 py-1.5 rounded text-xs font-bold"
            style={{ border: "1px solid #c9a84c", background: "#1c1608", color: "#e5af38" }}
          >Reactivate</button>
          <button
            type="button" disabled={busy}
            onClick={() => setConfirming((v) => !v)}
            className="px-3 py-1.5 rounded text-xs font-bold"
            style={{ border: "1px solid #4a1f1f", background: "#1a0f0f", color: "#f87171" }}
          >Delete</button>
        </div>
      </div>

      {confirming && (
        <div ref={confirmRef} className="mt-2.5 pt-2.5 border-t border-[#2a2518]">
          <p className="text-xs text-[#f87171] mb-2">
            Delete "{lane.title}" permanently? Every check-in, alert and encouragement on it goes with it. This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              type="button" disabled={busy}
              onClick={() => run(() => remove({ data: { id: lane.lane_id } }))}
              className="px-3 py-1.5 rounded text-xs font-bold"
              style={{ background: "#7f1d1d", color: "#fff" }}
            >{busy ? "Deleting…" : "Delete forever"}</button>
            <button type="button" onClick={() => setConfirming(false)} className="text-xs text-[#a8a094] underline">Cancel</button>
          </div>
        </div>
      )}

      {err && <p className="text-red-400 text-xs mt-2">{err}</p>}
    </div>
  );
}
