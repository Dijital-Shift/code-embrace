import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

/** Premium invite card — send your link to bring someone onto the wall. */
export function CallToWallCard({ url, invited, walking, className = "" }: { url: string; invited: number; walking: number; className?: string }) {
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== "undefined" && typeof (navigator as any).share === "function";

  async function copy() {
    try { await navigator.clipboard.writeText(url); } catch { /* ignore */ }
    setCopied(true);
    try { navigator.vibrate?.(25); } catch { /* unsupported */ }
    setTimeout(() => setCopied(false), 4000);
  }
  async function share() {
    try {
      await (navigator as any).share({
        title: "Kingdom Protocol",
        text: "Walk with me on Kingdom Protocol — accountability with a watchman.",
        url,
      });
    } catch { /* cancelled */ }
  }

  return (
    <div className={`kp-upgrade ${className}`}>
      <div className="kp-upgrade-inner">
        <p className="text-center text-[0.6rem] font-bold tracking-[0.24em] uppercase text-[#c9a84c]">Invite</p>
        <h3 className="mt-2 text-center text-xl text-[#f3e6c4]" style={{ fontFamily: "Cinzel, serif" }}>
          Call someone to the wall
        </h3>
        <p className="mt-3 text-center text-sm italic text-[#c2af80] leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          “Two are better than one… for if they fall, the one will lift up his fellow.”
          <span className="block not-italic text-[0.7rem] text-[#8f887c] mt-1">Ecclesiastes 4:9–10</span>
        </p>
        <p className="mt-4 text-center text-xs text-[#a49d8e] leading-relaxed">
          They sign up and start their own paths. It does not make them your watchman.
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          <button type="button" onClick={canShare ? share : copy} className="kp-lifetime-btn w-full rounded-xl px-5 py-3.5 text-[#0a0800] font-bold text-sm flex items-center justify-center gap-2">
            {canShare ? <Share2 size={16} /> : copied ? <Check size={16} /> : <Copy size={16} />}
            {canShare ? "Send your invite" : copied ? "Link copied" : "Copy invite link"}
          </button>
          {canShare && (
            <button type="button" onClick={copy} className="w-full rounded-xl border border-[#c9a84c]/40 bg-[#0a0800]/60 px-5 py-3 text-sm font-semibold text-[#e8dcc0] flex items-center justify-center gap-2">
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? "Link copied" : "Copy link"}
            </button>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg border border-[#c9a84c]/20 py-2.5">
            <p className="text-xl font-bold text-[#e5af38]">{invited}</p>
            <p className="text-[0.6rem] uppercase tracking-wider text-[#8f887c]">Joined</p>
          </div>
          <div className="rounded-lg border border-[#c9a84c]/20 py-2.5">
            <p className="text-xl font-bold text-[#e5af38]">{walking}</p>
            <p className="text-[0.6rem] uppercase tracking-wider text-[#8f887c]">Walking</p>
          </div>
        </div>
      </div>
    </div>
  );
}
