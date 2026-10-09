import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPageLayout, LegalSection, legalHead } from "@/components/LegalPageLayout";

export const Route = createFileRoute("/terms")({
  head: () => legalHead("Terms & Conditions", "The terms that govern your use of Kingdom Protocol."),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPageLayout title="Terms & Conditions" updated="October 9, 2026">
      <p>
        These Terms govern your use of Kingdom Protocol (kingdomprotocol.app, including the installable web app —
        the "Service"), operated by <strong>Dijital Shift LLC</strong>, a Wyoming limited liability company
        ("Dijital Shift", "we", "us", or "our").
      </p>

      <LegalSection title="1. Acceptance">
        <p>
          By using the Service you agree to these Terms. If you do not agree, do not use the Service. Continued use
          after an update constitutes acceptance of the updated Terms.
        </p>
      </LegalSection>

      <LegalSection title="2. The Service">
        <p>
          Kingdom Protocol is a behavioral accountability tool. You commit to daily Paths, check in each day, and
          invite up to two Watchmen per Path who are alerted when a Path is breached or goes silent, so they can
          reach out with encouragement and accountability.
        </p>
      </LegalSection>

      <LegalSection title="3. Eligibility & Account">
        <p>
          You must be of legal age in your jurisdiction to enter a binding contract. You are responsible for access
          to your email and for all activity under your account, and you agree to keep your information accurate.
        </p>
      </LegalSection>

      <LegalSection title="4. Watchmen">
        <p>
          Inviting someone as a Watchman shares your first name, the Path, and its alerts with them. Only invite
          people who have agreed to serve. Watchmen may decline or step away at any time, and you may remove a
          Watchman at any time.
        </p>
      </LegalSection>

      <LegalSection title="5. Acceptable Use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>use the Service in violation of any law;</li>
          <li>harass, threaten, or abuse a Watchman or any other user;</li>
          <li>engage in fraud, refund abuse, or spam;</li>
          <li>interfere with the security or integrity of the Service, including scraping or circumventing limits;</li>
          <li>resell or commercially exploit the Service; or</li>
          <li>reverse engineer or attempt to derive the source code of the Service.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Intellectual Property">
        <p>
          The Service, including its software, design, and branding, remains the property of Dijital Shift LLC. We
          grant you a limited, non-exclusive, non-transferable, revocable license for personal use. You retain
          ownership of what you write. The text of the King James Bible is in the public domain.
        </p>
      </LegalSection>

      <LegalSection title="7. Payments, Subscriptions & Refunds">
        <p>
          New accounts receive 30 days of full access at no charge. After that, continued use requires the Monthly
          plan ($4.99/month) or a one-time Lifetime purchase ($99). Payments, renewals, tax, cancellations, and
          refunds are processed by Stripe; card details are held by Stripe, not by us. See our{" "}
          <Link to="/refund" className="underline hover:text-[#c9a84c]">Refund Policy</Link>.
        </p>
        <p>
          If you do not choose a plan, your account rests: your data is kept and readable, but check-ins, reminders,
          and Watchman alerts pause until you subscribe.
        </p>
      </LegalSection>

      <LegalSection title="8. Service Availability">
        <p>
          The Service is provided "as is" and "as available". We do not guarantee that notifications or alerts will
          always be delivered on time, and we may modify or discontinue parts of the Service.
        </p>
      </LegalSection>

      <LegalSection title="9. Disclaimer of Warranties">
        <p>
          To the fullest extent permitted by law, we disclaim all implied warranties. The Service is a tool for your
          personal walk and mutual accountability; it is not a substitute for pastoral, medical, psychological,
          legal, or crisis care. If you are in danger, contact local emergency services.
        </p>
      </LegalSection>

      <LegalSection title="10. Limitation of Liability">
        <p>
          Our aggregate liability will not exceed the amount you paid us in the twelve (12) months preceding the
          claim. We are not liable for indirect, incidental, consequential, or punitive damages. Nothing here
          excludes liability that cannot lawfully be excluded.
        </p>
      </LegalSection>

      <LegalSection title="11. Indemnification">
        <p>
          You agree to indemnify Dijital Shift LLC from claims arising out of your breach of these Terms, your
          misuse of the Service, or your violation of any law or third-party right.
        </p>
      </LegalSection>

      <LegalSection title="12. Suspension & Termination">
        <p>
          We may suspend or terminate access for material breach, non-payment, suspected fraud, or abuse of other
          users. Provisions that by their nature should survive termination will survive.
        </p>
      </LegalSection>

      <LegalSection title="13. Governing Law & Disputes">
        <p>
          These Terms are governed by the laws of the State of Wyoming, USA. Disputes will be brought exclusively in
          the state or federal courts located in Wyoming.
        </p>
      </LegalSection>

      <LegalSection title="14. Changes to These Terms">
        <p>Material changes will be reflected in the "Last updated" date above.</p>
      </LegalSection>

      <LegalSection title="15. Assignment & Force Majeure">
        <p>
          You may not assign these Terms without our consent. Neither party is liable for delays caused by events
          beyond its reasonable control.
        </p>
      </LegalSection>

      <LegalSection title="16. Contact">
        <p>Dijital Shift LLC — Wyoming, USA. Reach us through the feedback form in Settings.</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
