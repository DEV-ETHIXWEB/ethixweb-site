import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/policies/refunds")({
  head: () => ({
    meta: [
      { title: "Cancellation & Refunds - Ethixweb" },
      { name: "description", content: "Ethixweb cancellation and refund policy for digital services." },
      { property: "og:title", content: "Cancellation & Refunds - Ethixweb" },
      { property: "og:description", content: "Ethixweb cancellation and refund policy for digital services." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://ethixweb.com/policies/refunds" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://ethixweb.com/policies/refunds" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://ethixweb.com/" },
            { "@type": "ListItem", position: 2, name: "Policies", item: "https://ethixweb.com/policies" },
            { "@type": "ListItem", position: 3, name: "Cancellation & Refunds", item: "https://ethixweb.com/policies/refunds" },
          ],
        }),
      },
    ],
  }),
  component: RefundsPolicy,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-8">
      <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">{children}</div>
    </div>
  );
}

function RefundsPolicy() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Policies" title="Cancellation & Refunds">
        Last updated: January 2025
      </PageHero>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl space-y-5">
          <Reveal>
            <Section title="Project Cancellations">
              <p>
                Clients may cancel a project at any time by providing written notice to{" "}
                <a href="mailto:info@ethixweb.com" className="text-primary hover:underline">
                  info@ethixweb.com
                </a>
                . Cancellations are processed within 2 business days of receipt.
              </p>
              <p>
                Work completed up to the cancellation date is billable. Any unused portion of a
                prepaid project fee will be refunded on a pro rated basis, minus work already
                delivered and a 10% administrative processing fee.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.06}>
            <Section title="Refund Eligibility">
              <p>
                Refunds are available under the following conditions:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The project has not been started (full refund, minus payment processing fees).</li>
                <li>
                  Ethixweb fails to deliver agreed deliverables within the contracted timeline
                  without client caused delays (partial or full refund at our discretion).
                </li>
                <li>A material defect in delivered work that cannot be rectified within 2
                  revision cycles.</li>
              </ul>
              <p>
                Refunds are not available for completed and approved deliverables, rush fees,
                third party costs (domain registration, hosting, ad spend), or delays caused by
                incomplete client supplied assets or approvals.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.12}>
            <Section title="Monthly Retainers">
              <p>
                Monthly retainer agreements may be cancelled with 30 days' written notice.
                Fees for the current billing cycle are non-refundable. The final month of service
                will be provided in full before the retainer concludes.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.18}>
            <Section title="Processing Time">
              <p>
                Approved refunds are processed within 7–14 business days and returned to the
                original payment method. Stripe or PayPal processing fees are non-recoverable.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.24}>
            <Section title="Contact">
              <p>
                For refund requests or cancellation notices, please email{" "}
                <a href="mailto:info@ethixweb.com" className="text-primary hover:underline">
                  info@ethixweb.com
                </a>{" "}
                with your project name and invoice number.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="glass-strong rounded-3xl p-8 text-center">
              <h3 className="font-display text-lg font-semibold">Have a question?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Our team is happy to walk you through any concerns before you commit.
              </p>
              <Link
                to="/contact"
                className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-glow"
              >
                Get in touch <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
