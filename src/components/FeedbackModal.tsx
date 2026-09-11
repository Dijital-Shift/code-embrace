import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { sendFeedback } from "@/lib/feedback.functions";

const CATEGORIES = ["Love it", "Suggestion", "Something off", "Other"] as const;
type Category = (typeof CATEGORIES)[number];
const MIN = 20;

/** Feedback popup — dark/gold, star rating, category pills, note. */
export function FeedbackModal({ onClose }: { onClose: () => void }) {
  const send = useServerFn(sendFeedback);
  const [rating, setRating] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const len = message.trim().length;
  const ready = len >= MIN && !busy;

  async function submit() {
    if (!ready) return;
    setBusy(true);
    setErr(null);
    const r: any = await send({ data: { message: message.trim(), rating, category } });
    setBusy(false);
    if (r?.error) { setErr(r.error); return; }
    setDone(true);
    setTimeout(onClose, 1400);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.72)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6"
        style={{ background: "#100d05", border: "1px solid #2a2518", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
      >
        {done ? (
          <div className="py-8 text-center">
            <p className="text-[#e5af38] font-semibold mb-1">Received. Thank you.</p>
            <p className="text-xs text-[#b8b0a4]">We read every note.</p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3 mb-1">
              <h3 className="text-lg font-bold text-white">Send Feedback</h3>
              <button type="button" onClick={onClose} className="text-[#948d80] text-lg leading-none px-1" style={{ minHeight: 0 }} aria-label="Close">×</button>
            </div>
            <p className="text-xs text-[#b8b0a4] leading-relaxed mb-5">
              Share what you love or what feels off. This isn't a support channel — just a direct note to us.
            </p>

            <div className="flex gap-1.5 mb-5" onMouseLeave={() => setHover(null)}>
              {[1, 2, 3, 4, 5].map((n) => {
                const on = (hover ?? rating ?? 0) >= n;
                return (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    onMouseEnter={() => setHover(n)}
                    onClick={() => setRating(rating === n ? null : n)}
                    className="text-2xl leading-none px-0.5 bg-transparent border-0"
                    style={{ minHeight: 0, color: on ? "#e5af38" : "#3a3428" }}
                  >
                    ★
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {CATEGORIES.map((c) => {
                const on = category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(on ? null : c)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border"
                    style={{
                      minHeight: 0,
                      background: on ? "#c9a84c" : "#0d0b09",
                      color: on ? "#000" : "#ded8cc",
                      borderColor: on ? "#c9a84c" : "#2a2518",
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your thoughts..."
              rows={5}
              maxLength={4000}
              className="w-full px-4 py-3 rounded-md text-white outline-none resize-none"
              style={{ background: "#0a0800", border: "1px solid #222", fontSize: "16px" }}
            />
            <p className="text-[0.7rem] mt-2 mb-4" style={{ color: len >= MIN ? "#9e968a" : "#b8b0a4" }}>
              {len < MIN ? `${MIN - len} more character${MIN - len === 1 ? "" : "s"} to send` : `${len} characters`}
            </p>

            {err && <p className="text-red-400 text-sm mb-3">{err}</p>}

            <button
              type="button"
              disabled={!ready}
              onClick={submit}
              className="w-full py-3 rounded-md font-semibold"
              style={{ background: ready ? "#c9a84c" : "#1a1710", color: ready ? "#000" : "#6d675c" }}
            >
              {busy ? "Sending…" : "Send Feedback"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
