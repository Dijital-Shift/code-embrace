import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Kingdom Protocol" },
      { name: "description", content: "Terms and conditions for using Kingdom Protocol." },
      { property: "og:title", content: "Terms & Conditions — Kingdom Protocol" },
      { property: "og:description", content: "Terms and conditions for using Kingdom Protocol." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Home</Link>
        <h1 className="mt-6 text-3xl font-bold">Terms & Conditions</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: June 11, 2026</p>

        <div className="prose prose-invert mt-10 max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Who you are contracting with</h2>
            <p>Kingdom Protocol is operated by <strong>Dijital Shift LLC</strong> ("we", "us", "our"). By creating an account or using the service, you ("you", "user") enter into a binding agreement with Dijital Shift LLC.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Acceptance</h2>
            <p>By accessing or continuing to use Kingdom Protocol, you agree to these Terms & Conditions, our Privacy Notice, and our Refund Policy. If you do not agree, do not use the service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Eligibility & authority</h2>
            <p>You confirm you are of legal age in your jurisdiction. If you are using the service on behalf of an organization, you confirm you have authority to bind that organization to these terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. The service</h2>
            <p>Kingdom Protocol is a behavioral accountability application that allows users to commit to daily behaviors, perform check-ins, and assign accountability partners ("watchmen") who are notified when commitments are missed or breached.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Accounts & accuracy</h2>
            <p>You must provide accurate information and keep it up to date. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Acceptable use</h2>
            <p>You must not misuse the service. Prohibited conduct includes, but is not limited to:</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Unlawful, fraudulent, or deceptive activity</li>
              <li>Spam, harassment, or abuse of other users or partners</li>
              <li>Infringing the intellectual property or privacy rights of others</li>
              <li>Interfering with security, integrity, or performance of the service (malware, probing, scraping, reverse engineering, circumventing technical limits)</li>
              <li>Reselling or redistributing access without our written consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Intellectual property</h2>
            <p>Dijital Shift LLC retains all right, title, and interest in the service, including software, documentation, content, and branding. We grant you a limited, non-exclusive, non-transferable, revocable right to use the service within your selected plan. You retain ownership of content you submit, and grant us a limited license to host and process that content solely to provide the service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Payments, subscriptions & taxes</h2>
            <p>Our order process is conducted by our online reseller <strong>Paddle.com</strong>. Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service inquiries and handles returns. Payment, billing, tax, cancellation, and refund mechanics are governed by the <a className="underline" href="https://www.paddle.com/legal/checkout-buyer-terms" target="_blank" rel="noreferrer">Paddle Checkout Buyer Terms</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">9. Service availability</h2>
            <p>We work to keep the service operational but do not guarantee uninterrupted or error-free performance. The service is provided "as is" and "as available". To the fullest extent permitted by law, we disclaim all implied warranties, including merchantability and fitness for a particular purpose.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">10. Suspension & termination</h2>
            <p>We may suspend or terminate your access for material breach of these terms, non-payment, suspected security or fraud risk, or repeated or serious policy violations. On termination, your right to use the service ends. We may provide a reasonable window to export your data before deletion.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">11. Limitation of liability</h2>
            <p>To the fullest extent permitted by law, our aggregate liability arising out of or relating to the service shall not exceed the fees you paid to us (via Paddle) in the twelve (12) months preceding the event giving rise to the claim. We are not liable for indirect, incidental, consequential, special, or exemplary damages, including loss of profits, data, or goodwill. Nothing in these terms excludes liability for fraud, death, or personal injury where such exclusion is prohibited by law.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">12. Indemnity</h2>
            <p>You agree to indemnify and hold harmless Dijital Shift LLC from claims arising out of your content, your unlawful use of the service, or your violation of these terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">13. Governing law & disputes</h2>
            <p>These terms are governed by the laws of the United States and the state in which Dijital Shift LLC is organized, without regard to conflict-of-laws principles. Disputes shall be resolved in the competent courts of that jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">14. Changes</h2>
            <p>We may update these terms from time to time. Continued use of the service after changes take effect constitutes acceptance of the revised terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">15. Contact</h2>
            <p>Questions about these terms: <a className="underline" href="mailto:dijitalshift@protonmail.com">dijitalshift@protonmail.com</a>.</p>
          </section>
        </div>

        <p className="mt-12 text-xs text-muted-foreground">Built by Dijital Shift</p>
      </div>
    </main>
  );
}
