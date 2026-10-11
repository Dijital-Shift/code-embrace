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
  const chipBg = isAvoid ? "#241009" : "#0c2010";
  const chipFg = isAvoid ? "#f0957a" : "#6ee7a0";
  const chipBorder = isAvoid ? "rgba(240,149,122,0.3)" : "rgba(110,231,160,0.3)";

  const inner = (
    <>
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="font-semibold text-sm text-white leading-snug">{template.title}</p>
        <span
          className="text-[0.62rem] px-2 py-0.5 rounded-full font-semibold uppercase tracking-[0.1em] shrink-0 border"
          style={{ background: chipBg, color: chipFg, borderColor: chipBorder }}
        >
          {isAvoid ? "Avoid" : "Complete"}
        </span>
      </div>
      <p className="text-xs text-[#b8b0a4] mb-3 leading-relaxed">{template.description}</p>
      {variant === "full" && template.support_scripture[0] && (
        <p className="text-xs text-[#c9a84c]/85 italic leading-relaxed mb-3 border-l border-[#c9a84c]/40 pl-2.5">
          {template.support_scripture[0]}
        </p>
      )}
      <span className="inline-flex items-center gap-1 text-[0.72rem] font-semibold" style={{ color: "#c9a84c" }}>
        Start this path <span aria-hidden>→</span>
      </span>
    </>
  );

  const cls = "kp-card block text-left w-full p-4 no-underline transition-colors hover:border-[#c9a84c]/60";
  const style = undefined;

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
