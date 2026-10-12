import { useRef, useState, useLayoutEffect, useEffect } from "react";

const CAT_KEY = "kp-library-cat";
import { PATH_CATEGORIES, PATH_TEMPLATES, type PathTemplate } from "@/lib/path-templates";

/**
 * Category selector for path templates: every category visible in a sticky
 * grid; tapping one reveals its Paths directly beneath the grid.
 */
export function PathCategoryAccordion({
  renderCard,
}: {
  renderCard: (template: PathTemplate) => React.ReactNode;
}) {
  const [openCat, setOpenCat] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const pendingScroll = useRef(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(CAT_KEY);
      if (saved && PATH_CATEGORIES.includes(saved as never)) setOpenCat(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (openCat) sessionStorage.setItem(CAT_KEY, openCat);
      else sessionStorage.removeItem(CAT_KEY);
    } catch {}
  }, [openCat]);

  useLayoutEffect(() => {
    if (!pendingScroll.current || !openCat) return;
    pendingScroll.current = false;
    requestAnimationFrame(() => {
      const content = contentRef.current;
      const grid = gridRef.current;
      if (!content || !grid) return;
      const stickyTop = parseFloat(getComputedStyle(grid).top) || 0;
      const y =
        content.getBoundingClientRect().top + window.scrollY - stickyTop - grid.offsetHeight - 12;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    });
  }, [openCat]);

  function select(cat: string) {
    setOpenCat((cur) => {
      const next = cur === cat ? null : cat;
      if (next) pendingScroll.current = true;
      return next;
    });
  }

  const items = openCat ? PATH_TEMPLATES.filter((t) => t.category === openCat) : [];

  return (
    <div>
      <div
        ref={gridRef}
        className="kp-cat-sticky z-20 -mx-4 px-4 pt-3 pb-3 grid grid-cols-2 md:grid-cols-4 gap-2"
        style={{
          background: "rgba(10,8,0,0.9)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid #2a2518",
        }}
      >
        {PATH_CATEGORIES.map((cat) => {
          const count = PATH_TEMPLATES.filter((t) => t.category === cat).length;
          if (count === 0) return null;
          const active = openCat === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => select(cat)}
              aria-pressed={active}
              className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border text-left transition-colors"
              style={{
                borderColor: active ? "#c9a84c" : "#2a2518",
                background: active ? "rgba(201,168,76,0.12)" : "#120f0d",
                boxShadow: active ? "0 0 12px rgba(201,168,76,0.15)" : "none",
              }}
            >
              <span
                className="text-xs uppercase tracking-[0.06em] font-medium truncate"
                style={{ color: active ? "#e8d9a8" : "#d6cfc2" }}
              >
                {cat}
              </span>
              <span
                className="text-[0.68rem] tabular-nums shrink-0"
                style={{ color: active ? "#c9a84c" : "#8a8276" }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {openCat ? (
        <div ref={contentRef} className="mt-4">
          <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[#c9a84c] font-semibold mb-3">
            {openCat} · {items.length} {items.length === 1 ? "Path" : "Paths"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((t) => renderCard(t))}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs text-[#8a8276] text-center">Tap a category to see its Paths.</p>
      )}
    </div>
  );
}
