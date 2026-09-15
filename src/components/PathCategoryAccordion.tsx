import { useRef, useState, useLayoutEffect } from "react";
import { ChevronDown } from "lucide-react";
import { PATH_CATEGORIES, PATH_TEMPLATES, type PathTemplate } from "@/lib/path-templates";

/**
 * Collapsible category list for path templates — one category open at a time,
 * with the tapped header held visually still when sections resize.
 */
export function PathCategoryAccordion({
  renderCard,
}: {
  renderCard: (template: PathTemplate) => React.ReactNode;
}) {
  const [openCat, setOpenCat] = useState<string | null>(PATH_CATEGORIES[0] ?? null);
  const headerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const anchor = useRef<{ cat: string; top: number } | null>(null);

  useLayoutEffect(() => {
    const a = anchor.current;
    if (!a) return;
    anchor.current = null;
    const el = headerRefs.current[a.cat];
    if (!el) return;
    const delta = el.getBoundingClientRect().top - a.top;
    if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: "auto" });
  }, [openCat]);

  function toggle(cat: string) {
    const el = headerRefs.current[cat];
    if (el) anchor.current = { cat, top: el.getBoundingClientRect().top };
    setOpenCat((cur) => (cur === cat ? null : cat));
  }

  return (
    <div className="flex flex-col gap-2">
      {PATH_CATEGORIES.map((cat) => {
        const items = PATH_TEMPLATES.filter((t) => t.category === cat);
        if (items.length === 0) return null;
        const isOpen = openCat === cat;
        return (
          <section
            key={cat}
            className="rounded-xl border border-[#2a2518] overflow-hidden"
            style={{ background: "#120f0d" }}
          >
            <button
              type="button"
              ref={(el) => {
                headerRefs.current[cat] = el;
              }}
              onClick={() => toggle(cat)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
            >
              <span className="text-[0.68rem] text-[#c9a84c] uppercase tracking-[0.22em] font-bold">
                {cat}
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <span className="text-[0.68rem] text-[#8a8276]">{items.length}</span>
                <ChevronDown
                  size={16}
                  className="text-[#8a8276] transition-transform duration-200"
                  style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
                />
              </span>
            </button>
            {isOpen && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4 pb-4 pt-1">
                {items.map((t) => renderCard(t))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
