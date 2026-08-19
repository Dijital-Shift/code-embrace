import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Notice — Kingdom Protocol" },
      { name: "description", content: "How Kingdom Protocol collects and uses your data." },
      { property: "og:title", content: "Privacy Notice — Kingdom Protocol" },
      { property: "og:description", content: "How Kingdom Protocol collects and uses your data." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Home</Link>
        <h1 className="mt-6 text-3xl font-bold">Privacy Notice</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: June 11, 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Who we are</h2>
            <p>Kingdom Protocol is operated by <strong>Dijital Shift LLC</strong>. We act as the data controller for personal data collected through the service. Contact: <a className="underline" href="mailto:dijitalshift@protonmail.com">dijitalshift@protonmail.com</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Data we collect</h2>
            <ul className="ml-6 list-disc space-y-1">
              <li><strong>Account data</strong> — name, email, password hash, phone number (optional).</li>
              <li><strong>Profile & preferences</strong> — timezone, bedtime, accountability partners.</li>
              <li><strong>Behavioral data</strong> — paths (commitments), check-ins, breach reports, missed-check-in events.</li>
              <li><strong>Support communications</strong> — messages you send us.</li>
              <li><strong>Technical data</strong> — IP address, device identifiers, browser/user-agent, basic usage telemetry, push-notification tokens.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Why we use it</h2>
            <ul className="ml-6 list-disc space-y-1">
              <li><strong>Provide the service</strong> — create your account, run check-ins, notify partners (contract performance).</li>
              <li><strong>Security & fraud prevention</strong> — protect accounts and the platform (legitimate interests).</li>
              <li><strong>Improvement</strong> — diagnose issues, measure feature usage (legitimate interests).</li>
              <li><strong>Support</strong> — respond to your inquiries (contract / legitimate interests).</li>
              <li><strong>Legal compliance</strong> — meet obligations under applicable law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Who we share it with</h2>
            <ul className="ml-6 list-disc space-y-1">
              <li><strong>Accountability partners you assign</strong> — they receive your name and (only when a breach or missed check-in occurs) your phone number, so they can reach out.</li>
              <li><strong>Service providers / subprocessors</strong> — hosting and database (Supabase), transactional email (Resend), application hosting (Cloudflare / Lovable).</li>
              <li><strong>Merchant of Record</strong> — Paddle.com handles all sales, subscription management, payments, tax compliance, and invoicing. See Paddle's <a className="underline" href="https://www.paddle.com/legal/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.</li>
              <li><strong>Professional advisers</strong> — legal and accounting, where necessary.</li>
              <li><strong>Authorities</strong> — when required by law.</li>
            </ul>
            <p>We do not sell your personal data.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Retention</h2>
            <p>We keep personal data for as long as your account is active and for a reasonable period afterward to meet legal, accounting, or reporting obligations. When data is no longer needed, we delete or anonymise it.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. International transfers</h2>
            <p>Our service providers may process data outside your country, including in the United States. Where required, we rely on appropriate safeguards (such as Standard Contractual Clauses or adequacy decisions).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Your rights</h2>
            <p>Depending on where you live, you may have the right to access, correct, delete, restrict, port, or object to processing of your personal data, and to withdraw consent. EU/UK residents may lodge a complaint with their supervisory authority. To exercise any right, email <a className="underline" href="mailto:dijitalshift@protonmail.com">dijitalshift@protonmail.com</a>. We will respond within one month.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Security</h2>
            <p>We use appropriate technical and organisational measures — including encryption in transit, access controls, and row-level security on the database — to protect personal data. No system is fully secure; we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">9. Cookies</h2>
            <p>We use only essential cookies and local storage required to keep you signed in and operate the service. We do not use third-party advertising or tracking cookies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">10. Changes</h2>
            <p>We may update this Privacy Notice from time to time. Material changes will be communicated through the service or by email.</p>
          </section>
        </div>

        <p className="mt-12 text-xs text-muted-foreground">Dijital System · 02</p>
      </div>
    </main>
  );
}
