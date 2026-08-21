import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, useLayoutEffect } from "react";
import { ChevronDown } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PathTemplateCard } from "@/components/PathTemplateCard";
import { PATH_CATEGORIES, PATH_TEMPLATES } from "@/lib/path-templates";


export const Route = createFileRoute("/paths/library")({
  head: () => ({
    meta: [
      { title: "Path Library — Kingdom Protocol" },
      {
        name: "description",
        content:
          "Scripture-backed paths to walk: prayer, fasting, purity, speech, honoring parents, and more — straight from the Word.",
      },
    ],
  }),
  component: () => (
    <AppLayout>
      <Library />
    </AppLayout>
  ),
});

function Library() {
  const [openCat, setOpenCat] = useState<string | null>(PATH_CATEGORIES[0] ?? null);
  const headerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const anchor = useRef<{ cat: string; top: number } | null>(null);

  // Keep the tapped header visually still when sections above/below resize.
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
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Link to="/paths" className="text-[#a8a094]">
          ←
        </Link>
        <h2 className="text-xl font-bold">Path Library</h2>
      </div>
      <p className="text-sm text-[#b8b0a4] mb-8 max-w-xl">
        Concrete habits and behaviors drawn straight from Scripture. Pick a path to walk —
        avoid what He warns against, complete what He calls you to.
      </p>

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
                  {items.map((t) => (
                    <PathTemplateCard key={t.id} template={t} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>


      <div className="mt-12 p-5 rounded-xl border border-[#2a2518]" style={{ background: "#161210" }}>
        <p className="text-sm text-[#ded8cc] font-semibold mb-1">Walking something not listed?</p>
        <p className="text-xs text-[#b0a89c] mb-3">
          The library is a starting place, not a ceiling. Build your own path with your own Scripture.
        </p>
        <Link
          to="/paths/new"
          className="inline-block px-4 py-2 rounded-md border border-[#c9a84c]/50 text-[#c9a84c] font-semibold text-xs"
        >
          Create a custom path →
        </Link>
      </div>
    </div>
  );
}
