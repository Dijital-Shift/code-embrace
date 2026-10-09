import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout, LegalSection, legalHead } from "@/components/LegalPageLayout";

export const Route = createFileRoute("/refund")({
  head: () => legalHead("Refund Policy", "30-day money-back guarantee on Kingdom Protocol, handled through Stripe."),
  component: RefundPage,
});

function RefundPage() {
  return (
    <LegalPageLayout title="Refund Policy" updated="October 9, 2026">
      <p>
        Kingdom Protocol is operated by <strong>Dijital Shift LLC</strong> (Wyoming, USA). All payments,
        cancellations, and refunds are processed by our payment provider, <strong>Stripe</strong>.
      </p>

      <LegalSection title="Free first month">
        <p>
          Every new account begins with 30 days of full access at no charge. Nothing is billed during
          that month unless you choose a plan.
        </p>
      </LegalSection>

      <LegalSection title="30-day money-back guarantee">
        <p>
          We offer a <strong>30-day money-back guarantee</strong> on both the Monthly plan ($4.99/month)
          and the Lifetime purchase ($99). If you are not satisfied for any reason, you may receive a full
          refund within 30 days of the original charge.
        </p>
      </LegalSection>

      <LegalSection title="How refunds are handled">
        <p>
          Refunds are handled entirely through Stripe. There is no email to send and no reply to wait on.
          Refunds are returned to your original payment method and usually appear within 5–10 business
          days, depending on your bank or card issuer.
        </p>
      </LegalSection>

      <LegalSection title="Cancellations">
        <p>
          You may cancel a Monthly subscription at any time through Stripe. Cancellation stops future
          billing; access continues until the end of the current paid period.
        </p>
      </LegalSection>

      <LegalSection title="Monthly → Lifetime upgrades">
        <p>
          When you upgrade from Monthly to Lifetime, your recurring monthly billing ends so you are never
          charged for both.
        </p>
      </LegalSection>

      <LegalSection title="After a refund">
        <p>
          Your account returns to a resting state. Your Paths, check-in history, and Watchman messages are
          kept and remain readable — nothing is deleted. Choosing a plan again restores full use immediately.
        </p>
      </LegalSection>

      <LegalSection title="Chargebacks">
        <p>
          Filing a chargeback with your card issuer results in immediate suspension of paid access. Please
          use the Stripe refund process first — it is faster for everyone.
        </p>
      </LegalSection>

      <LegalSection title="Statutory rights">
        <p>Nothing in this policy limits any statutory consumer rights that apply in your jurisdiction.</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
