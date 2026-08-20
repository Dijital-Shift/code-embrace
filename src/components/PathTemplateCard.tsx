import { Link } from "@tanstack/react-router";
import type { PathTemplate } from "@/lib/path-templates";

export function PathTemplateCard({
  template,
  variant = "full",
  onSelect,
}: {
  template: PathTemplate;
  variant?: "full" | "condensed";
  onSelect?: (id: string) => void;
}) {
  const isAvoid = template.lane_type === "avoid";
  const chipBg = isAvoid ? "#2a1410" : "#102a14";
  const chipFg = isAvoid ? "#f87171" : "#4ade80";

  const inner = (
    <>
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="font-semibold text-sm text-white leading-snug">{template.title}</p>
        <span
          className="text-[0.6rem] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0"
          style={{ background: chipBg, color: chipFg }}
        >
          {isAvoid ? "Avoid" : "Complete"}
        </span>
      </div>
      <p className="text-xs text-[#b8b0a4] mb-3">{template.description}</p>
      {variant === "full" && template.support_scripture[0] && (
        <p className="text-[0.72rem] text-[#9a8b5c] italic leading-relaxed mb-3 border-l-2 border-[#2a2518] pl-3">
          {template.support_scripture[0]}
        </p>
      )}
      <span className="text-[0.72rem] font-semibold" style={{ color: "#c9a84c" }}>
        Start this path →
      </span>
    </>
  );

  const cls =
    "block text-left w-full p-4 rounded-xl border border-[#2a2518] no-underline transition-colors hover:border-[#c9a84c]/60";
  const style = { background: "#161210" };

  if (onSelect) {
    return (
      <button type="button" onClick={() => onSelect(template.id)} className={cls} style={style}>
        {inner}
      </button>
    );
  }
  return (
    <Link
      to="/paths/new"
      search={{ template: template.id }}
      className={cls}
      style={style}
    >
      {inner}
    </Link>
  );
}
