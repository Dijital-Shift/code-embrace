import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InstallWalkthrough } from "@/components/InstallWalkthrough";

/** Settings entry that reopens the install steps and animation anytime, e.g. to help a Watchman set up. */
export function InstallGuideRow() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="w-full flex items-center justify-between px-4 py-3.5 text-left bg-transparent border-0">
        <span>
          <span className="block text-sm text-[#ded8cc] font-medium">Install guide</span>
          <span className="block text-[0.7rem] text-[#8f887c]">How to put Kingdom Protocol on a Home Screen.</span>
        </span>
        <span className="text-[#c9a84c]">›</span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88dvh] overflow-y-auto bg-[#100d05] border border-[#2a2415] text-foreground">
          <DialogHeader>
            <DialogTitle className="kp-briefing-title text-primary">Install guide</DialogTitle>
            <DialogDescription className="text-stone">Alarms reach only the app on your Home Screen. No app store. Under a minute.</DialogDescription>
          </DialogHeader>
          {open && <InstallWalkthrough />}
        </DialogContent>
      </Dialog>
    </>
  );
}
