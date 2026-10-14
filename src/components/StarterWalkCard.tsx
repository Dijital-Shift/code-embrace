import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const KEY = "kp-starter-walk-dismissed";

/** One-time explainer for the Send Scripture Path every new member starts with. */
export function StarterWalkCard({ laneId, onVisibilityChange }: { laneId: string; onVisibilityChange?: (visible: boolean) => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let visible = true;
    try { visible = localStorage.getItem(KEY) !== "1"; } catch {}
    setShow(visible);
    onVisibilityChange?.(visible);
  }, [onVisibilityChange]);
  if (!show) return null;
  const dismiss = () => {
    try { localStorage.setItem(KEY, "1"); } catch {}
    setShow(false);
    onVisibilityChange?.(false);
  };

  return (
    <div className="kp-card-glow relative mb-5 px-4 py-4">
      <button type="button" onClick={dismiss} aria-label="Dismiss" className="absolute top-2 right-3 text-[#a8a094] text-lg leading-none bg-transparent border-0">×</button>
      <p className="text-[0.62rem] uppercase tracking-[0.14em] font-semibold text-[#c9a84c] mb-1.5">Your Starter Walk</p>
      <p className="text-sm text-[#ded8cc] leading-relaxed pr-5">
        "Send Scripture" is already on your walk so you can begin on day one. Send one verse to one person each day, then check in.
      </p>
      <p className="text-xs text-[#948d80] leading-relaxed mt-1.5">
        It's yours to keep, edit, pause, or remove anytime from the Path's page.
      </p>
      <div className="flex items-center gap-4 mt-3">
        <Button asChild variant="link" className="px-0 text-xs">
          <a href="https://sendscripture.xyz" target="_blank" rel="noopener noreferrer">SendScripture.xyz ↗</a>
        </Button>
        <Link to="/paths/$id" params={{ id: laneId }} search={{ newlyCreated: false }} onClick={dismiss}
          className="px-3 py-1.5 rounded text-xs font-bold no-underline"
          style={{ border: "1px solid #c9a84c", background: "#1c1608", color: "#e5af38" }}>View Path</Link>
        <button type="button" onClick={dismiss} className="text-xs text-[#a8a094] underline bg-transparent border-0">Got it</button>
      </div>
    </div>
  );
}
