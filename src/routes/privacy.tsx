import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout, LegalSection, legalHead } from "@/components/LegalPageLayout";

export const Route = createFileRoute("/privacy")({
  head: () => legalHead("Privacy Notice", "How Kingdom Protocol collects, uses, and protects your information."),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Notice" updated="October 9, 2026">
      <p>
        This Notice explains how <strong>Dijital Shift LLC</strong> ("Dijital Shift", "we", "us"), a Wyoming
        limited liability company, collects and uses personal information in connection with Kingdom Protocol
        (kingdomprotocol.app and the installable web app).
      </p>

      <LegalSection title="Our role">
        <p>
          Dijital Shift acts as the data controller for information collected through the Service. Payment card
          and billing details are collected and processed by Stripe as an independent controller; see{" "}
          <a href="https://stripe.com/privacy" className="underline hover:text-[#c9a84c]" target="_blank" rel="noreferrer">
            stripe.com/privacy
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="What we collect">
        <p><strong>Account.</strong> Your email address, first name, and optional phone number. Sign-in uses one-time codes or Google — we do not store passwords.</p>
        <p><strong>Your Paths.</strong> The Paths you create, their notes and end dates, your daily check-ins (Held, Breach, Silent, Sabbath), and the honesty notes you write when you breach.</p>
        <p><strong>Watchmen.</strong> Who you invite, invitation status, encouragements exchanged, and alert history.</p>
        <p><strong>Preferences.</strong> Timezone, bedtime reminder time, and notification settings.</p>
        <p><strong>Technical.</strong> Push-notification tokens, device and browser type, and IP addresses briefly processed for security.</p>
        <p><strong>Feedback.</strong> Notes you send us through the in-app feedback form.</p>
      </LegalSection>

      <LegalSection title="Why we use it">
        <ul className="list-disc pl-5 space-y-1">
          <li>To run your daily check-ins and bedtime reminders.</li>
          <li>To alert your Watchmen when a Path is breached or goes silent.</li>
          <li>To deliver encouragements between you and your Watchmen.</li>
          <li>To manage your free month and paid access.</li>
          <li>To keep accounts secure and prevent abuse.</li>
          <li>To comply with legal obligations.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Legal basis">
        <p>
          We rely on the performance of our contract with you, our legitimate interests (security and service
          improvement), and compliance with legal obligations, as applicable.
        </p>
      </LegalSection>

      <LegalSection title="Who we share it with">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Watchmen you choose</strong> — they see your first name, the Paths they watch, and alerts for those Paths. If you add a phone number, it may be used for text-message alerts.</li>
          <li><strong>Hosting and infrastructure</strong> — our cloud provider, which hosts the database, sign-in, and email delivery.</li>
          <li><strong>Stripe</strong> — for payments, subscriptions, tax, receipts, and refunds.</li>
          <li><strong>Text-message provider</strong> — only to deliver alerts when push notifications are unavailable.</li>
          <li><strong>Authorities</strong> — only where disclosure is required by law.</li>
        </ul>
        <p>We do not sell personal information.</p>
      </LegalSection>

      <LegalSection title="International transfers">
        <p>
          The Service is operated from the United States. Information may be processed in the U.S. and other
          jurisdictions where our providers operate, subject to appropriate safeguards where required.
        </p>
      </LegalSection>

      <LegalSection title="How long we keep it">
        <p>
          We keep your data while your account exists, including when your access is resting after the free month.
          When your account is deleted, personal data is removed within 30 days, except records we must keep for
          legal or tax reasons.
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>
          Depending on where you live, you may have rights to access, correct, delete, restrict, or port your
          personal information and to object to certain processing. You may also lodge a complaint with your
          local supervisory authority.
        </p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          We use encryption in transit, row-level security on our database, passwordless sign-in, and
          least-privilege access. No system is perfectly secure; we cannot guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection title="Cookies & local storage">
        <p>
          We use only essential local storage to keep you signed in and remember small preferences. We do not use
          advertising or tracking cookies.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>The Service is not directed to children under 13, and we do not knowingly collect their information.</p>
      </LegalSection>

      <LegalSection title="Changes to this Notice">
        <p>Material changes will be reflected by the "Last updated" date above.</p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>Dijital Shift LLC — Wyoming, USA. Reach us through the feedback form in Settings.</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
