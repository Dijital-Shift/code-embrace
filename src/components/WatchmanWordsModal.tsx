import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { markEncouragementsRead } from "@/lib/api.functions";

export type Word = { id: string; lane_id: string; body: string; created_at: string; from_name: string };

/** Shows unread Watchman words for one Path and marks them read once on screen. */
export function WatchmanWordsModal({ laneId, title, words, onClose }: { laneId: string; title: string; words: Word[]; onClose: () => void }) {
  const markFn = useServerFn(markEncouragementsRead);
  const qc = useQueryClient();
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current || !words.length) return;
    sent.current = true;
    markFn({ data: { ids: words.slice(0, 20).map((w) => w.id) } })
      .then(() => {
        qc.invalidateQueries({ queryKey: ["dashboard"] });
        qc.invalidateQueries({ queryKey: ["lanes"] });
        qc.invalidateQueries({ queryKey: ["lane", laneId] });
        qc.invalidateQueries({ queryKey: ["unread-encouragements"] });
      })
      .catch(() => {});
  }, [words, markFn, qc, laneId]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.72)" }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
        style={{ background: "#100d05", border: "1px solid #3a2f12", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
      >
        <p className="text-[0.62rem] uppercase tracking-[0.2em] text-[#c9a84c] font-semibold mb-1">From your Watchman</p>
        <h3 className="text-lg font-bold text-white leading-snug mb-4">{title}</h3>
        <div className="flex flex-col gap-3">
          {words.map((w) => (
            <div key={w.id} className="pl-3.5 py-1 border-l-2 border-[#c9a84c]/60">
              <p className="text-sm text-[#f3e6c4] leading-relaxed whitespace-pre-wrap">"{w.body}"</p>
              <p className="text-[0.68rem] text-[#a8a094] mt-1.5">
                — {w.from_name} · {new Date(w.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 mt-6">
          <Link to="/paths/$id" params={{ id: laneId }} search={{ newlyCreated: false }} className="text-xs font-semibold text-[#c9a84c] no-underline">View full path →</Link>
          <button onClick={onClose} className="px-5 py-2 kp-lifetime-btn text-black rounded-lg font-bold text-sm">Done</button>
        </div>
      </div>
    </div>
  );
}
