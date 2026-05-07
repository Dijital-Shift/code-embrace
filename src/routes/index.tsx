import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/logo-full.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kingdom Protocol — Accountability that endures" },
      {
        name: "description",
        content:
          "Kingdom Protocol pairs you with a partner and keeps you on the path with check-ins, escalation, and grace.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center">
      <img
        src={logo}
        alt="Kingdom Protocol"
        className="h-20 md:h-28 w-auto mb-10 select-none"
      />
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
        Accountability that <span className="text-primary">endures</span>.
      </h1>
      <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl">
        Pair with a brother. Set the lane. Check in daily. Walk the narrow path
        — together.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Get started
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted"
        >
          How it works
        </Link>
      </div>
      <p className="mt-16 text-xs text-muted-foreground">
        Live preview · full port in progress
      </p>
    </main>
  );
}
