import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { PathTemplateCard } from "@/components/PathTemplateCard";
import { PathCategoryAccordion } from "@/components/PathCategoryAccordion";
import { SubpageHeader } from "@/components/SubpageHeader";
import { useAuth } from "@/lib/auth";
import { PATH_TEMPLATES } from "@/lib/path-templates";

export const Route = createFileRoute("/paths/library")({
  head: () => ({
    meta: [
      { title: "Path Library — Kingdom Protocol" },
      { name: "description", content: `All ${PATH_TEMPLATES.length} Kingdom Protocol Paths with their KJV Scripture — prayer, fasting, purity, speech, substances and more. Browse before you sign up.` },
      { property: "og:title", content: "Path Library — Kingdom Protocol" },
      { property: "og:description", content: `Browse all ${PATH_TEMPLATES.length} Scripture-backed Pursue and Flee Paths before you sign up.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://kingdomprotocol.app/paths/library" }],
  }),
  component: LibraryRoute,
});

/** Members see the Library inside the app; visitors can read every Path before signing up. */
function LibraryRoute() {
  const { user, loading } = useAuth();
  if (user) {
    return (
      <AppLayout>
        <SubpageHeader title="Path Library" link={{ to: "/paths" }} />
        <Library guest={false} />
      </AppLayout>
    );
  }
  return <PublicLibrary showCta={!loading} />;
}

function PublicLibrary({ showCta }: { showCta: boolean }) {
  return (
    <div className="min-h-[100dvh] text-white" style={{ background: "#0a0800" }}>
      <header className="sticky top-0 z-30 border-b border-[#2a2518]/60 backdrop-blur" style={{ background: "rgba(10,8,0,0.85)" }}>
        <div className="mx-auto grid max-w-5xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2 sm:px-6">
          <div className="flex justify-start">
            <Link
              to="/"
              onClick={(e) => { if ((window.history.state?.__TSR_index ?? 0) > 0) { e.preventDefault(); window.history.back(); } }}
              className="inline-flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-1 text-xs font-semibold text-primary"
            >
              <ArrowLeft className="h-4 w-4" /> <span>Back</span>
            </Link>
          </div>
          <Link to="/" aria-label="Kingdom Protocol home" className="flex justify-center">
            <img src="/kingdom-protocol-logo.png" alt="Kingdom Protocol" className="h-10 w-10 object-contain" />
          </Link>
          <div className="flex justify-end">
            {showCta && (
              <Link to="/login" search={{ mode: "signup" }} className="inline-flex h-9 items-center rounded-full bg-primary px-3.5 text-xs font-bold text-primary-foreground whitespace-nowrap">
                Start free
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 pt-8 pb-16">
        <h1 className="text-2xl sm:text-3xl text-[#f3e6c4] mb-3" style={{ fontFamily: "Cinzel, Georgia, serif" }}>Path Library</h1>
        <Library guest />
        <p className="mt-10 text-center text-xs text-[#9e968a] tracking-wider">Dijital System · 02</p>
      </main>
    </div>
  );
}

const ctaClass = "inline-flex items-center justify-center px-5 py-2.5 rounded-md font-semibold text-xs no-underline";
const ctaStyle = { background: "linear-gradient(135deg, #f0cd6a 0%, #c9a84c 55%, #a8842e 100%)", color: "#0a0800", boxShadow: "0 6px 20px rgba(201,168,76,0.25)" };

function Library({ guest }: { guest: boolean }) {
  return (
    <div>
      <p className="text-sm text-[#b8b0a4] mb-8 max-w-xl">
        {PATH_TEMPLATES.length} Paths drawn straight from Scripture, each with its KJV verses. Flee what He warns against,
        pursue what He calls you to.{guest && " Read them all before you sign up — free for 30 days, no card."}
      </p>

      <PathCategoryAccordion
        renderCard={(t) => <PathTemplateCard key={t.id} template={t} guest={guest} />}
      />

      <div className="mt-12 kp-card-glow p-6 text-center">
        <p className="text-[0.65rem] uppercase tracking-[0.18em] text-[#c9a84c] font-semibold mb-2">Your own walk</p>
        <p className="text-base text-[#f0e8d8] font-semibold mb-1.5" style={{ fontFamily: "'Cinzel', Georgia, serif" }}>
          Walking something not listed?
        </p>
        <p className="text-xs text-[#b8b0a4] leading-relaxed mb-5 max-w-sm mx-auto">
          The library is a starting place, not a ceiling. Build your own path with your own Scripture.
        </p>
        {guest ? (
          <Link to="/login" search={{ mode: "signup" }} className={ctaClass} style={ctaStyle}>
            Start free to build your own →
          </Link>
        ) : (
          <Link to="/paths/new" className={ctaClass} style={ctaStyle}>
            Create a custom path →
          </Link>
        )}
      </div>
    </div>
  );
}
