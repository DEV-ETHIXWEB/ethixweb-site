import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/shared/PageHero";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Reveal } from "@/components/shared/Reveal";
import { Container } from "@/components/shared/Container";
import { PolicySection as Section } from "@/components/policies/PolicySection";
import { ArrowUpRight, FileText } from "lucide-react";
import { OG_IMAGE, siteUrl } from "@/lib/site";

export const Route = createFileRoute("/policies/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions | Ethixweb Contractor Marketing" },
      {
        name: "description",
        content:
          "The terms that govern Ethixweb's website, marketing and software services, including scope, payments, ownership of your website and content, and support.",
      },
      { property: "og:title", content: "Terms & Conditions | Ethixweb Contractor Marketing" },
      {
        property: "og:description",
        content: "Terms and conditions governing use of Ethixweb services.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:url", content: siteUrl("/policies/terms") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Terms & Conditions | Ethixweb Contractor Marketing" },
      {
        name: "twitter:description",
        content: "Terms and conditions governing use of Ethixweb services.",
      },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: siteUrl("/policies/terms") }],
  }),
  component: TermsPolicy,
});

function TermsPolicy() {
  return (
    <SiteLayout>
      <PageHero icon={FileText} eyebrow="Policies" title="Terms & Conditions">
        Last updated: November 2026
      </PageHero>
      <Container>
        <Breadcrumbs items={[{ label: "Terms & Conditions" }]} />
      </Container>
      <section className="py-20">
        <Container className="grid gap-5 lg:grid-cols-2">
          <Reveal className="lg:col-span-2">
            <Section title="1. Agreement">
              <p>
                By engaging Ethixweb for services, you agree to these Terms & Conditions. These
                terms govern all projects, retainer agreements, and service interactions between
                Ethixweb ("we", "us") and the client ("you").
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.06}>
            <Section className="h-full" title="2. Services">
              <p>
                Ethixweb provides digital services including web design, web development, AI
                automation, digital marketing, SEO, CRM integrations, and related services. Specific
                deliverables, timelines, and fees are defined in individual project proposals or
                service agreements.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.08}>
            <Section className="h-full" title="3. Payment Terms">
              <p>
                Projects require a deposit (typically 50%) before work begins. The remaining balance
                is due upon project completion or as outlined in the agreed payment schedule.
                Monthly retainers are billed on the 1st of each month.
              </p>
              <p>
                Invoices unpaid beyond 14 days of the due date may incur a 1.5% monthly late fee.
                Ethixweb reserves the right to pause work on overdue accounts.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.1}>
            <Section className="h-full" title="4. Client Responsibilities">
              <p>You agree to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide accurate information, content, and brand assets in a timely manner</li>
                <li>Designate a single point of contact for project approvals</li>
                <li>Respond to review requests within 5 business days</li>
                <li>Ensure you have the rights to all content provided to us</li>
              </ul>
            </Section>
          </Reveal>
          <Reveal delay={0.12}>
            <Section className="h-full" title="5. Intellectual Property">
              <p>
                Upon receipt of full payment, all custom work product created for your project
                becomes your property. Ethixweb retains the right to display completed work in our
                portfolio unless otherwise agreed in writing.
              </p>
              <p>
                Third party assets (stock images, fonts, plugins) are subject to their respective
                licenses. Ethixweb is not responsible for licensing violations arising from client
                supplied materials.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.14}>
            <Section className="h-full" title="6. Confidentiality">
              <p>
                Both parties agree to keep confidential any proprietary or sensitive information
                shared during the engagement. This obligation survives termination of the project.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.16}>
            <Section className="h-full" title="7. Limitation of Liability">
              <p>
                Ethixweb's total liability for any claim shall not exceed the total fees paid by the
                client for the specific project in question. We are not liable for indirect,
                incidental, or consequential damages, including lost revenue or data.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.18}>
            <Section className="h-full" title="8. Governing Law">
              <p>
                These terms are governed by the laws of India. Any disputes shall be resolved
                through good faith negotiation, and if necessary, binding arbitration in accordance
                with applicable law.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.2}>
            <Section className="h-full" title="9. Changes to Terms">
              <p>
                We reserve the right to update these terms at any time. Material changes will be
                communicated via email to active clients. Continued use of our services constitutes
                acceptance of updated terms.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.22} className="lg:col-span-2">
            <Section title="10. SMS / Text Messaging Terms">
              <p>
                <strong className="text-foreground">Program:</strong> ETHIXWEB USA LLC customer
                notifications. When you opt in by ticking the optional SMS box on our contact form
                at ethixweb.com/contact, you agree to receive text messages from ETHIXWEB USA LLC
                about your enquiry, project updates and customer support replies.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Message frequency varies.</li>
                <li>Message and data rates may apply.</li>
                <li>
                  Reply <strong className="text-foreground">STOP</strong> to cancel at any time. You
                  will receive one final message confirming you have been unsubscribed.
                </li>
                <li>
                  Reply <strong className="text-foreground">HELP</strong> for help, or email{" "}
                  <a href="mailto:info@ethixweb.com" className="text-primary hover:underline">
                    info@ethixweb.com
                  </a>
                  .
                </li>
                <li>Consent to receive text messages is not a condition of any purchase.</li>
                <li>Carriers are not liable for delayed or undelivered messages.</li>
              </ul>
              <p>
                Your mobile information is handled as described in our{" "}
                <Link to="/policies/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                . No mobile information will be shared with third parties or affiliates for
                marketing or promotional purposes.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.26} className="lg:col-span-2">
            <div className="glass-strong rounded-3xl p-8 text-center">
              <h3 className="font-display text-lg font-semibold">Questions about our terms?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We're always happy to clarify anything before you engage.
              </p>
              <Link
                to="/contact"
                className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-6 py-2.5 text-sm font-medium shadow-glow"
              >
                Contact us <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    </SiteLayout>
  );
}
