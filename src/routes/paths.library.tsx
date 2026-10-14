import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { PathTemplateCard } from "@/components/PathTemplateCard";
import { PathCategoryAccordion } from "@/components/PathCategoryAccordion";
import { SubpageHeader } from "@/components/SubpageHeader";


export const Route = createFileRoute("/paths/library")({
  head: () => ({
    meta: [
      { title: "Path Library — Kingdom Protocol" },
      { property: "og:title", content: "Path Library — Kingdom Protocol" },
      { property: "og:description", content: "Scripture-backed Pursue and Flee Paths for your daily walk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
      <SubpageHeader title="Path Library" link={{ to: "/paths" }} />
      <p className="text-sm text-[#b8b0a4] mb-8 max-w-xl">
        Concrete habits and behaviors drawn straight from Scripture. Pick a path to walk —
        flee what He warns against, pursue what He calls you to.
      </p>

      <PathCategoryAccordion
        renderCard={(t) => <PathTemplateCard key={t.id} template={t} />}
      />


      <div className="mt-12 kp-card-glow p-6 text-center">
        <p className="text-[0.65rem] uppercase tracking-[0.18em] text-[#c9a84c] font-semibold mb-2">Your own walk</p>
        <p className="text-base text-[#f0e8d8] font-semibold mb-1.5" style={{ fontFamily: "'Cinzel', Georgia, serif" }}>
          Walking something not listed?
        </p>
        <p className="text-xs text-[#b8b0a4] leading-relaxed mb-5 max-w-sm mx-auto">
          The library is a starting place, not a ceiling. Build your own path with your own Scripture.
        </p>
        <Link
          to="/paths/new"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-md font-semibold text-xs no-underline"
          style={{ background: "linear-gradient(135deg, #f0cd6a 0%, #c9a84c 55%, #a8842e 100%)", color: "#0a0800", boxShadow: "0 6px 20px rgba(201,168,76,0.25)" }}
        >
          Create a custom path →
        </Link>
      </div>
    </div>
  );
}
