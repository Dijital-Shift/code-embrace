import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CallToWallCard } from "@/components/CallToWallCard";

/** Settings entry for the app referral link, fenced off from Watchman invitations so the two are never confused. */
export function ReferralRow({ url, invited, walking }: { url: string; invited: number; walking: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="w-full flex items-center justify-between px-4 py-3.5 text-left bg-transparent border-0">
        <span>
          <span className="block text-sm text-[#ded8cc] font-medium">Refer someone to Kingdom Protocol</span>
          <span className="block text-[0.7rem] text-[#8f887c]">Share the app. Not for adding a Watchman.</span>
        </span>
        <span className="text-[#c9a84c]">›</span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88dvh] overflow-y-auto bg-[#100d05] border border-[#2a2415] text-foreground">
          <DialogHeader>
            <DialogTitle className="kp-briefing-title text-primary">Refer someone</DialogTitle>
            <DialogDescription className="text-stone">For someone who should start their own Paths.</DialogDescription>
          </DialogHeader>
          <div role="alert" className="rounded-xl border-2 border-[#e5af38] bg-[#e5af38]/10 px-4 py-3.5">
            <p className="flex items-center gap-2 text-sm font-bold text-[#f3c14b]">
              <TriangleAlert size={18} aria-hidden="true" className="shrink-0" />
              Not for adding a Watchman
            </p>
            <p className="mt-1.5 text-[0.8rem] leading-relaxed text-[#e8dcc0]">
              This link only invites someone to join the app. It does not let them watch your Paths.
            </p>
            <p className="mt-2 text-[0.8rem] leading-relaxed text-[#e8dcc0]">
              To add a Watchman, open a Path and tap <span className="font-semibold text-[#f3e6c4]">+ Invite Watchman</span>.
            </p>
            <Link to="/paths" onClick={() => setOpen(false)} className="mt-3 inline-flex min-h-11 items-center text-xs font-bold uppercase tracking-[0.12em] text-[#e5af38] no-underline">
              Go to my Paths →
            </Link>
          </div>
          <CallToWallCard url={url} invited={invited} walking={walking} />
        </DialogContent>
      </Dialog>
    </>
  );
}
