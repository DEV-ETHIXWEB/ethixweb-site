import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/policies/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping Policy - Ethixweb" },
      { name: "description", content: "Ethixweb delivery policy for digital services and assets." },
    ],
  }),
  component: ShippingPolicy,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-8">
      <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">{children}</div>
    </div>
  );
}

function ShippingPolicy() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Policies" title="Delivery Policy">
        Last updated: January 2025
      </PageHero>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl space-y-5">
          <Reveal>
            <Section title="Digital Services Only">
              <p>
                Ethixweb is a fully digital agency. We do not ship physical products. All
                deliverables — websites, designs, reports, code files, and strategy documents —
                are delivered electronically.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.06}>
            <Section title="Delivery Methods">
              <p>Digital deliverables are provided through one or more of the following:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Secure file transfer via Google Drive or Dropbox</li>
                <li>Direct deployment to your hosting environment or domain</li>
                <li>Email with attached files or access credentials</li>
                <li>Shared project management workspace (Notion, ClickUp, etc.)</li>
              </ul>
            </Section>
          </Reveal>
          <Reveal delay={0.12}>
            <Section title="Delivery Timelines">
              <p>
                Project timelines are agreed upon in writing before work begins. Typical delivery
                windows:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <span className="font-medium text-foreground">Website designs:</span> 5–10 business
                  days for initial concepts
                </li>
                <li>
                  <span className="font-medium text-foreground">Full website builds:</span> 2–6 weeks
                  depending on scope
                </li>
                <li>
                  <span className="font-medium text-foreground">Monthly retainer deliverables:</span>{" "}
                  as specified in your service agreement
                </li>
              </ul>
              <p>
                Timelines may be extended if client-supplied assets (copy, images, brand files) are
                delayed. We will always communicate any timeline changes proactively.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.18}>
            <Section title="Access & Ownership">
              <p>
                Upon final payment, all agreed deliverables and associated intellectual property
                are transferred to the client. Login credentials, source files, and access details
                are provided at project close.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="glass-strong rounded-3xl p-8 text-center">
              <h3 className="font-display text-lg font-semibold">Questions about delivery?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We're transparent about timelines from day one. Reach out to discuss your project.
              </p>
              <Link
                to="/contact"
                className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gradient-brand px-6 py-2.5 text-sm font-medium shadow-glow"
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
