import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Refund Policy — Kingdom Protocol" },
      { name: "description", content: "30-day money-back guarantee on Kingdom Protocol." },
      { property: "og:title", content: "Refund Policy — Kingdom Protocol" },
      { property: "og:description", content: "30-day money-back guarantee on Kingdom Protocol." },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Home</Link>
        <h1 className="mt-6 text-3xl font-bold">Refund Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: June 11, 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">30-day money-back guarantee</h2>
            <p>We offer a <strong>30-day money-back guarantee</strong> on all paid subscriptions and one-time purchases of Kingdom Protocol. If you are not satisfied with your purchase, you may request a full refund within 30 days of your order date.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">How to request a refund</h2>
            <p>Refunds are processed by our payment provider, <strong>Paddle</strong>, the Merchant of Record for all Kingdom Protocol orders.</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Visit <a className="underline" href="https://paddle.net" target="_blank" rel="noreferrer">paddle.net</a> and locate your order using the email address you purchased with.</li>
              <li>Or contact us directly at <a className="underline" href="mailto:dijitalshift@protonmail.com">dijitalshift@protonmail.com</a> and we will coordinate your refund with Paddle.</li>
            </ul>
            <p>Refunds are typically issued back to the original payment method within 5–10 business days, depending on your bank or card issuer.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Cancellations</h2>
            <p>You may cancel a recurring subscription at any time. Cancellation stops future billing; access continues until the end of the current paid period. A cancellation by itself is not a refund — to request a refund within the 30-day window, follow the steps above.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Questions</h2>
            <p>Email <a className="underline" href="mailto:dijitalshift@protonmail.com">dijitalshift@protonmail.com</a> and we'll help.</p>
          </section>
        </div>

        <p className="mt-12 text-xs text-muted-foreground">Dijital · System 2</p>
      </div>
    </main>
  );
}
