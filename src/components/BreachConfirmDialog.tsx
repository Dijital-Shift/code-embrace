import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { MIN_BREACH_NOTE, breachNoteReady } from "@/lib/late-breach";
import { contactHaptic } from "@/lib/watchman-alert";

/**
 * Deliberate second step before a breach is sealed and the Watchman alerted.
 * Editable mode collects the note inside the dialog (late confession);
 * review mode shows the already-written note so it can be read before sending.
 */
export function BreachConfirmDialog({
  title, description, note, onNoteChange, cancelLabel, busy, error, onCancel, onConfirm,
}: {
  title: string;
  description: string;
  note: string;
  onNoteChange?: (v: string) => void;
  cancelLabel: string;
  busy: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const ready = breachNoteReady(note);
  const editable = !!onNoteChange;

  return (
    <Dialog open onOpenChange={(o) => { if (!o && !busy) onCancel(); }}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-md rounded-xl border-action-stone-edge bg-card max-h-[90dvh] overflow-y-auto"
        onOpenAutoFocus={(e) => { e.preventDefault(); cancelRef.current?.focus({ preventScroll: true }); }}
        onEscapeKeyDown={(e) => { if (busy) e.preventDefault(); }}
        onInteractOutside={(e) => { if (busy) e.preventDefault(); }}
      >
        <DialogTitle className="pr-6 text-parchment leading-snug">{title}</DialogTitle>
        <DialogDescription className="text-stone leading-relaxed">{description}</DialogDescription>

        {editable ? (
          <div>
            <label htmlFor="breach-note" className="block text-[0.65rem] uppercase font-semibold tracking-wider text-stone mb-2">What happened?</label>
            <textarea
              id="breach-note" rows={4} maxLength={1000} value={note} disabled={busy}
              onChange={(e) => onNoteChange!(e.target.value)}
              placeholder="Be honest."
              className="w-full rounded-md border border-action-stone-edge bg-background p-3 text-base text-parchment placeholder:text-stone resize-none outline-none focus:border-primary/60"
            />
            {!ready && <p className="text-[0.65rem] text-stone mt-1.5">{note.trim().length} / {MIN_BREACH_NOTE} characters minimum</p>}
          </div>
        ) : (
          <blockquote className="rounded-md border-l-2 border-action-ember-edge bg-background px-3 py-2.5 text-sm text-parchment whitespace-pre-wrap [overflow-wrap:anywhere]">
            {note.trim()}
          </blockquote>
        )}

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

        <div className="grid grid-cols-1 min-[360px]:grid-cols-[auto_1fr] gap-2">
          <Button ref={cancelRef} type="button" variant="pathPause" disabled={busy}
            onClick={() => { contactHaptic(); onCancel(); }}
            className="rounded-full px-4 text-xs font-semibold whitespace-nowrap">
            {cancelLabel}
          </Button>
          <Button type="button" variant="pathArchive" disabled={!ready || busy}
            onClick={() => { contactHaptic(); onConfirm(); }}
            className="rounded-full px-3 text-xs font-bold whitespace-nowrap">
            {busy ? "Sounding…" : "Confirm & Sound Alarm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
