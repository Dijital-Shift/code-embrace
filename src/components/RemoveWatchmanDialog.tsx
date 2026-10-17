import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { MIN_REMOVAL_REASON, REMOVAL_CONFIRM_MS, removalReasonSchema } from '@/lib/watchman-removal';

export function RemoveWatchmanDialog({ name, onClose, onRemove }: {
  name: string; onClose: () => void; onRemove: (reason: string) => Promise<void>;
}) {
  const [reason, setReason] = useState('');
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const keepRef = useRef<HTMLButtonElement>(null);
  const valid = removalReasonSchema.safeParse(reason).success;

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), REMOVAL_CONFIRM_MS);
    return () => clearTimeout(timer);
  }, [armed]);

  async function confirm() {
    if (!valid || inFlight.current) return;
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    if (!armed) { setArmed(true); return; }
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      await onRemove(removalReasonSchema.parse(reason));
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't remove this Watchman. Please try again.");
      setArmed(false);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return <Dialog open onOpenChange={(open) => { if (!open && !inFlight.current) onClose(); }}>
    <DialogContent className="kp-removal-dialog w-[calc(100%-2rem)] max-w-md rounded-lg border-primary/30 bg-card max-h-[90dvh] overflow-y-auto"
      onOpenAutoFocus={(e) => { e.preventDefault(); keepRef.current?.focus({ preventScroll: true }); }}
      onEscapeKeyDown={(e) => { if (inFlight.current) e.preventDefault(); }}
      onInteractOutside={(e) => { if (inFlight.current) e.preventDefault(); }}>
      <DialogTitle className="pr-6 text-foreground leading-snug">Remove {name}?</DialogTitle>
      <DialogDescription className="text-muted-foreground leading-relaxed">
        {name} will see your explanation in The Watch, even if device alerts are off. Share why, honestly.
      </DialogDescription>
      <div>
        <label htmlFor="remove-reason" className="block text-xs uppercase font-semibold text-primary mb-2">Your reason</label>
        <textarea id="remove-reason" rows={3} maxLength={500} value={reason}
          onChange={(e) => { setReason(e.target.value); setArmed(false); setError(null); }} disabled={busy}
          aria-describedby="remove-reason-guidance" placeholder="We agreed to step back for a season."
          className="w-full rounded-md border border-border bg-muted p-3 text-base text-foreground placeholder:text-muted-foreground resize-none" />
        <p id="remove-reason-guidance" aria-live="polite" className={`text-xs mt-2 ${valid ? 'text-primary' : 'text-muted-foreground'}`}>
          {valid ? "They'll see this reason." : `${reason.trim().length} / ${MIN_REMOVAL_REASON} characters minimum`}
        </p>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="grid grid-cols-2 gap-2">
        <Button ref={keepRef} variant="secondary" disabled={busy} onClick={onClose} className="h-auto min-h-12 whitespace-normal">Keep Watchman</Button>
        <Button variant={armed ? 'destructive' : 'outline'} disabled={!valid || busy} onClick={confirm}
          className="h-auto min-h-12 whitespace-normal text-sm leading-snug">
          {busy ? 'Removing…' : armed ? 'Are you sure? Tap to confirm' : `Remove ${name}`}
        </Button>
      </div>
    </DialogContent>
  </Dialog>;
}