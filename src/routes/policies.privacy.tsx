import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/policies/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy - Ethixweb" },
      { name: "description", content: "Ethixweb privacy policy — how we collect, use, and protect your data." },
    ],
  }),
  component: PrivacyPolicy,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-8">
      <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">{children}</div>
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Policies" title="Privacy Policy">
        Last updated: January 2025
      </PageHero>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl space-y-5">
          <Reveal>
            <Section title="1. Information We Collect">
              <p>We collect information you provide directly, including:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Name, email address, and company name when you fill out our contact form</li>
                <li>Project details and requirements you share with us</li>
                <li>Payment information processed securely through Stripe or PayPal</li>
              </ul>
              <p>
                We also collect standard web analytics data (pages visited, time on site, browser
                type) via privacy-respecting tools. We do not sell personal data.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.06}>
            <Section title="2. How We Use Your Information">
              <p>Your information is used to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Respond to your enquiries and deliver project services</li>
                <li>Send project updates and invoices</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p>
                We do not use your data for targeted advertising or share it with third parties
                except as necessary to deliver services (e.g., payment processors, hosting
                providers).
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.08}>
            <Section title="3. Data Storage & Security">
              <p>
                Your data is stored on secure servers. We use industry-standard encryption
                (TLS/SSL) for data in transit and access controls for data at rest. No method of
                transmission over the internet is 100% secure; we take all reasonable precautions
                to protect your information.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.1}>
            <Section title="4. Cookies">
              <p>
                This website uses minimal cookies to ensure functionality (theme preferences,
                session state). We do not use third-party tracking cookies. You may disable cookies
                in your browser settings; some features may not work as expected.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.12}>
            <Section title="5. Your Rights">
              <p>You have the right to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access the personal data we hold about you</li>
                <li>Request correction or deletion of your data</li>
                <li>Withdraw consent to marketing communications at any time</li>
                <li>Lodge a complaint with a relevant data protection authority</li>
              </ul>
              <p>
                To exercise any of these rights, email{" "}
                <a href="mailto:info@ethixweb.com" className="text-primary hover:underline">
                  info@ethixweb.com
                </a>
                .
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.14}>
            <Section title="6. Third-Party Services">
              <p>
                Our site may link to third-party websites. We are not responsible for their privacy
                practices. We recommend reviewing their policies before submitting personal
                information.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.16}>
            <Section title="7. Children's Privacy">
              <p>
                Our services are not directed at individuals under 13. We do not knowingly collect
                data from children. If you believe a child has provided us data, please contact us
                immediately.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.18}>
            <Section title="8. Changes to This Policy">
              <p>
                We may update this policy periodically. The "Last updated" date at the top reflects
                the most recent revision. Continued use of our site after changes constitutes
                acceptance of the updated policy.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="glass-strong rounded-3xl p-8 text-center">
              <h3 className="font-display text-lg font-semibold">Privacy questions?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Reach out and we'll respond within one business day.
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
