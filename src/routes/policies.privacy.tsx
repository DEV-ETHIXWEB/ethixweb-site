import { createFileRoute, Link } from "@tanstack/react-router";
import { jsonLdStringify } from "@/lib/json-ld";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/shared/PageHero";
import { Reveal } from "@/components/shared/Reveal";
import { Container } from "@/components/shared/Container";
import { PolicySection as Section } from "@/components/policies/PolicySection";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/policies/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy - Ethixweb" },
      {
        name: "description",
        content: "Ethixweb privacy policy: how we collect, use, and protect your data.",
      },
      { property: "og:title", content: "Privacy Policy - Ethixweb" },
      {
        property: "og:description",
        content: "How Ethixweb collects, uses, and protects your data.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.ethixweb.com/ethixweb.png" },
      { property: "og:url", content: "https://www.ethixweb.com/policies/privacy" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Privacy Policy - Ethixweb" },
      {
        name: "twitter:description",
        content: "How Ethixweb collects, uses, and protects your data.",
      },
      { name: "twitter:image", content: "https://www.ethixweb.com/ethixweb.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://www.ethixweb.com/policies/privacy" }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLdStringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ethixweb.com/" },
            {
              "@type": "ListItem",
              position: 2,
              name: "Policies",
              item: "https://www.ethixweb.com/policies",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "Privacy Policy",
              item: "https://www.ethixweb.com/policies/privacy",
            },
          ],
        }),
      },
    ],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Policies" title="Privacy Policy">
        Last updated: September 2026
      </PageHero>
      <section className="py-20">
        <Container size="narrow" className="space-y-5">
          <Reveal>
            <Section title="1. Who We Are">
              <p>
                Ethixweb operates through two related companies: Ethixweb USA LLC, registered in
                Wyoming, United States, and Ethixweb India Private Limited, based in New Delhi,
                India. In this policy, "Ethixweb", "we", and "us" refer to both.
              </p>
              <p>
                Ethixweb USA LLC works directly with our clients, and our team at Ethixweb India
                Private Limited carries out the design, development, marketing, and support work.
                Both companies follow this same privacy policy.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.03}>
            <Section title="2. Information We Collect">
              <p>We collect information you provide directly, including:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Name, email address, phone number, and company name when you contact us</li>
                <li>Project details and materials you share with us</li>
                <li>Resumes and application details when you apply for a job with us</li>
              </ul>
              <p>
                We also collect basic technical data (such as pages visited, browser type, and IP
                address) and information about which ad or campaign brought you to our site.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.06}>
            <Section title="3. How We Use Your Information">
              <p>Your information is used to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Respond to your enquiries and deliver project services</li>
                <li>Send project updates and invoices</li>
                <li>Review job applications</li>
                <li>Improve our website, services, and marketing</li>
                <li>Comply with legal obligations</li>
              </ul>
            </Section>
          </Reveal>
          <Reveal delay={0.08}>
            <Section title="4. Sharing Your Information">
              <p>
                We do not sell your personal data. Your information may be shared between Ethixweb
                USA LLC and Ethixweb India Private Limited so our team can work on your project, and
                with trusted service providers (such as hosting, email, and payment providers) only
                as needed to run our business. We may also disclose information when required by
                law.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.1}>
            <Section title="5. Data Storage & Security">
              <p>
                Your data is stored on secure servers. We use industry standard encryption (TLS/SSL)
                for data in transit and access controls for data at rest. No method of transmission
                over the internet is 100% secure; we take all reasonable precautions to protect your
                information.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.12}>
            <Section title="6. Cookies">
              <p>
                This website uses cookies to remember your preferences (such as light or dark mode)
                and, through Google Ads, to measure how our advertising performs. You may disable
                cookies in your browser settings; some features may not work as expected.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.14}>
            <Section title="7. Your Rights">
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
          <Reveal delay={0.16}>
            <Section title="8. Third Party Services">
              <p>
                Our site may link to third party websites. We are not responsible for their privacy
                practices. We recommend reviewing their policies before submitting personal
                information.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.18}>
            <Section title="9. Children's Privacy">
              <p>
                Our services are not directed at individuals under 13. We do not knowingly collect
                data from children. If you believe a child has provided us data, please contact us
                immediately.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.2}>
            <Section title="10. Changes to This Policy">
              <p>
                We may update this policy periodically. The "Last updated" date at the top reflects
                the most recent revision. Continued use of our site after changes constitutes
                acceptance of the updated policy.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.26}>
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
        </Container>
      </section>
    </SiteLayout>
  );
}
