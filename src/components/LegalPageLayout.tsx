import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

const SERIF = "'Cinzel', Georgia, serif";

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-[#f0e8d8]" style={{ fontFamily: SERIF }}>
        {title}
      </h2>
      <div className="space-y-2 text-[#c4bdaf]">{children}</div>
    </section>
  );
}

export function LegalPageLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0a0800]">
      <div className="px-5 pt-[calc(env(safe-area-inset-top,0px)+1rem)] max-w-2xl mx-auto w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-[#a8a094] hover:text-[#c9a84c] py-2 min-h-[2.75rem]"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
      </div>
      <main className="flex-1 px-5 py-8 max-w-2xl mx-auto w-full">
        <header className="mb-8 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-[#c9a84c]" style={{ fontFamily: SERIF }}>
            {title}
          </h1>
          <p className="text-xs text-[#9e968a]">Last updated {updated}</p>
        </header>
        <article className="space-y-6 text-sm leading-relaxed text-[#d8d0c0]">{children}</article>
      </main>
      <footer className="px-5 py-10 border-t border-[#2a2418] text-center">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-[#b0a89c]">
          <Link to="/terms" className="hover:text-[#c9a84c]">Terms</Link>
          <span className="text-[#3a342a]">·</span>
          <Link to="/privacy" className="hover:text-[#c9a84c]">Privacy</Link>
          <span className="text-[#3a342a]">·</span>
          <Link to="/refund" className="hover:text-[#c9a84c]">Refund Policy</Link>
        </div>
        <p className="mt-6 text-xs text-[#9e968a] tracking-wider">Dijital System · 02</p>
      </footer>
    </div>
  );
}

export function legalHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} — Kingdom Protocol` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} — Kingdom Protocol` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  };
}
