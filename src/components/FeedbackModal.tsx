import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendFeedback } from "@/lib/feedback.functions";

const CATEGORIES = ["Love it", "Suggestion", "Something off", "Other"] as const;
type Category = (typeof CATEGORIES)[number];
const MIN = 20;
const MAX = 2000;

/** Centered feedback dialog — mirrors the Send Scripture pattern. */
export function FeedbackModal({ onClose }: { onClose: () => void }) {
  const send = useServerFn(sendFeedback);
  const [rating, setRating] = useState<number | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const len = message.trim().length;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (len < MIN || busy) return;
    setBusy(true);
    try {
      const r: any = await send({ data: { message: message.trim(), rating, category } });
      if (r?.error) { toast.error("Couldn't send — please try again."); return; }
      toast.success("Thank you — received.");
      onClose();
    } catch {
      toast.error("Couldn't send — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="z-[80] w-[calc(100%-2rem)] rounded-lg sm:max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader className="items-center text-center sm:text-center">
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Share what you love or what feels off. Every note is read.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4 text-center">
          <div>
            <div className="mb-1.5 text-xs text-muted-foreground">Rating (optional)</div>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(rating === n ? null : n)}
                  className="p-1" style={{ minHeight: 0 }} aria-label={`${n} star${n > 1 ? "s" : ""}`}>
                  <Star className={`h-5 w-5 ${rating && n <= rating ? "fill-primary text-primary" : "text-muted-foreground/50"}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-xs text-muted-foreground">Category (optional)</div>
            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORIES.map((c) => (
                <button key={c} type="button" onClick={() => setCategory(category === c ? null : c)}
                  style={{ minHeight: 0 }}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    category === c ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value.slice(0, MAX))}
              placeholder="Share your thoughts…" rows={5} className="resize-none" style={{ fontSize: "1rem" }} />
            <div className="mt-1 flex items-center justify-between text-[0.625rem] text-muted-foreground/70">
              <span>{len < MIN ? `${MIN - len} more characters needed` : "\u00A0"}</span>
              <span>{message.length}/{MAX}</span>
            </div>
          </div>

          <Button type="submit" disabled={busy || len < MIN} className="w-full">
            {busy ? "Sending..." : "Send feedback"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
