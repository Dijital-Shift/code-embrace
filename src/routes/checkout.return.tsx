import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id: sessionId } = Route.useSearch();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0800] px-5">
      <div className="max-w-md w-full rounded-2xl border border-[#c9a84c]/40 bg-[#100d05] p-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-3">
          {sessionId ? "Payment received." : "No session found."}
        </h1>
        <p className="text-[#a8a39a] mb-6">
          {sessionId
            ? "Your access is being activated. You can head back to the app."
            : "Try again from the pricing page."}
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 rounded-xl bg-[#c9a84c] text-black font-bold"
        >
          Continue
        </Link>
      </div>
    </div>
  );
}
