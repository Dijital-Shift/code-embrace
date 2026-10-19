import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { getInvitePreview, acceptLaneInvite } from "@/lib/invites.functions";
import { Button } from "@/components/ui/button";

// Pulls the invite token out of a pasted link, a pasted message, or a bare code.
export function extractInviteToken(raw: string): string | null {
  const text = raw.trim();
  const m = text.match(/\/invite\/([A-Za-z0-9_-]{10,100})/);
  if (m) return m[1];
  return /^[A-Za-z0-9_-]{10,100}$/.test(text) ? text : null;
}

type Preview = Awaited<ReturnType<typeof getInvitePreview>>;

export function ClaimInviteCard() {
  const previewFn = useServerFn(getInvitePreview);
  const acceptFn = useServerFn(acceptLaneInvite);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const acceptingRef = useRef(false);

  function reset() {
    setValue(""); setToken(null); setPreview(null); setErr(null);
  }

  async function lookup() {
    setErr(null);
    const t = extractInviteToken(value);
    if (!t) { setErr("That doesn't look like an invite link. Paste the whole message or link."); return; }
    setBusy(true);
    const p = await previewFn({ data: { token: t } }).catch(() => null);
    setBusy(false);
    if (!p || !p.found) { setErr("This link is no longer active. Reach out to whoever sent it for a fresh link."); return; }
    if (p.pathGone) { setErr(`This path is no longer active. Reach out to ${p.ownerFirstName || "the sender"} directly.`); return; }
    if (p.status === "revoked") { setErr("This invite was cancelled. Ask the sender for a fresh link."); return; }
    if (p.expired || p.status === "expired") { setErr("This invite has expired. Ask the sender for a fresh link."); return; }
    if (p.status === "accepted") { setErr("This invite has already been accepted."); return; }
    setToken(t); setPreview(p);
  }

  async function accept() {
    if (!token || acceptingRef.current) return;
    acceptingRef.current = true;
    setBusy(true); setErr(null);
    const r: any = await acceptFn({ data: { token } }).catch(() => ({ error: "Couldn't accept. Try again." }));
    acceptingRef.current = false;
    setBusy(false);
    if (r?.error && !r?.alreadyWatchman) { setErr(r.error); return; }
    await qc.invalidateQueries({ queryKey: ["partner"] });
    reset(); setOpen(false);
  }

  if (!open) {
    return (
      <div className="mb-6 flex justify-between items-center gap-3 rounded-lg border border-[#2a2418] px-4 py-3">
        <p className="text-xs text-[#a8a094]">Someone sent you a Watchman link?</p>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>Accept an invite</Button>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-[#c9a84c]/50 p-5" style={{ background: "linear-gradient(135deg, #1a1408 0%, #0a0800 100%)" }}>
      {!preview ? (
        <>
          <p className="font-semibold mb-1 text-[#c9a84c]">Accept an invite</p>
          <p className="text-xs text-[#c2af80] mb-3">Paste the message or link you were sent.</p>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-[#2a2418] bg-[#0d0d0d] p-3 text-base text-[#e8dfc4]"
            placeholder="https://kingdomprotocol.app/invite/…"
          />
          {err && <p className="text-xs text-[#f87171] mt-2">{err}</p>}
          <div className="flex gap-2 mt-3">
            <Button size="sm" disabled={busy || !value.trim()} onClick={lookup}>{busy ? "Checking…" : "Continue"}</Button>
            <Button size="sm" variant="ghost" onClick={() => { reset(); setOpen(false); }}>Cancel</Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-[0.65rem] uppercase tracking-[0.22em] text-[#c2af80] mb-2">Called to the wall</p>
          <p className="text-lg text-[#f3e6c4] mb-1" style={{ fontFamily: "Cinzel, serif" }}>
            {preview.ownerFirstName || "Someone"} asked you to stand watch
          </p>
          <p className="text-sm text-[#e8dfc4] font-semibold">
            {preview.laneTitle} <span className="text-[0.6rem] uppercase tracking-wider text-[#c9a84c] ml-1">{preview.isAvoid ? "Flee" : "Pursue"}</span>
          </p>
          {preview.laneDescription && <p className="text-xs text-[#a8a094] mt-1">{preview.laneDescription}</p>}
          <p className="text-xs text-[#c2af80] mt-3">Watching is free forever. You're only alerted when they miss a check-in or fall.</p>
          {err && <p className="text-xs text-[#f87171] mt-2">{err}</p>}
          <div className="flex gap-2 mt-4">
            <Button size="sm" disabled={busy} onClick={accept}>{busy ? "Accepting…" : "Stand watch"}</Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={reset}>Back</Button>
          </div>
        </>
      )}
    </div>
  );
}
