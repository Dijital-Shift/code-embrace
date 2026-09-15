import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PathTemplateCard } from "@/components/PathTemplateCard";
import { PathCategoryAccordion } from "@/components/PathCategoryAccordion";


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

      <PathCategoryAccordion
        renderCard={(t) => <PathTemplateCard key={t.id} template={t} />}
      />


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
