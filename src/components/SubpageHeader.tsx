import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

/** Sticky back bar for subpages — stays visible while scrolling. */
export function SubpageHeader({ title, link }: { title: string; link: any }) {
  return (
    <div className="kp-subpage-bar -mx-5 px-5 mb-6">
      <div className="flex items-center gap-3 py-3">
        <Link
          {...link}
          aria-label="Back"
          className="kp-ext-link inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#2a2518] text-[#c9a84c] no-underline shrink-0"
          style={{ background: "#161210" }}
        >
          <ArrowLeft size={18} />
        </Link>
        <h2 className="text-xl text-[#f3e6c4] truncate" style={{ fontFamily: "Cinzel, Georgia, serif" }}>{title}</h2>
      </div>
    </div>
  );
}
