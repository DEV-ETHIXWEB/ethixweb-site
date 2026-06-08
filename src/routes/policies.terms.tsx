import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/policies/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions - Ethixweb" },
      { name: "description", content: "Ethixweb terms and conditions governing use of our services." },
    ],
  }),
  component: TermsPolicy,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-8">
      <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">{children}</div>
    </div>
  );
}

function TermsPolicy() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Policies" title="Terms & Conditions">
        Last updated: January 2025
      </PageHero>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl space-y-5">
          <Reveal>
            <Section title="1. Agreement">
              <p>
                By engaging Ethixweb for services, you agree to these Terms & Conditions. These
                terms govern all projects, retainer agreements, and service interactions between
                Ethixweb ("we", "us") and the client ("you").
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.06}>
            <Section title="2. Services">
              <p>
                Ethixweb provides digital services including web design, web development, AI
                automation, digital marketing, SEO, CRM integrations, and related services.
                Specific deliverables, timelines, and fees are defined in individual project
                proposals or service agreements.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.08}>
            <Section title="3. Payment Terms">
              <p>
                Projects require a deposit (typically 50%) before work begins. The remaining
                balance is due upon project completion or as outlined in the agreed payment
                schedule. Monthly retainers are billed on the 1st of each month.
              </p>
              <p>
                Invoices unpaid beyond 14 days of the due date may incur a 1.5% monthly late fee.
                Ethixweb reserves the right to pause work on overdue accounts.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.1}>
            <Section title="4. Client Responsibilities">
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
            <Section title="5. Intellectual Property">
              <p>
                Upon receipt of full payment, all custom work product created for your project
                becomes your property. Ethixweb retains the right to display completed work in
                our portfolio unless otherwise agreed in writing.
              </p>
              <p>
                Third-party assets (stock images, fonts, plugins) are subject to their respective
                licenses. Ethixweb is not responsible for licensing violations arising from client-
                supplied materials.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.14}>
            <Section title="6. Confidentiality">
              <p>
                Both parties agree to keep confidential any proprietary or sensitive information
                shared during the engagement. This obligation survives termination of the project.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.16}>
            <Section title="7. Limitation of Liability">
              <p>
                Ethixweb's total liability for any claim shall not exceed the total fees paid by
                the client for the specific project in question. We are not liable for indirect,
                incidental, or consequential damages, including lost revenue or data.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.18}>
            <Section title="8. Governing Law">
              <p>
                These terms are governed by the laws of India. Any disputes shall be resolved
                through good-faith negotiation, and if necessary, binding arbitration in accordance
                with applicable law.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.2}>
            <Section title="9. Changes to Terms">
              <p>
                We reserve the right to update these terms at any time. Material changes will be
                communicated via email to active clients. Continued use of our services constitutes
                acceptance of updated terms.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.26}>
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
        </div>
      </section>
    </SiteLayout>
  );
}
