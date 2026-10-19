import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/shared/PageHero";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Reveal } from "@/components/shared/Reveal";
import { Container } from "@/components/shared/Container";
import { PolicySection as Section } from "@/components/policies/PolicySection";
import { ArrowUpRight } from "lucide-react";
import { OG_IMAGE, siteUrl } from "@/lib/site";

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
      { property: "og:image", content: OG_IMAGE },
      { property: "og:url", content: siteUrl("/policies/privacy") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Privacy Policy - Ethixweb" },
      {
        name: "twitter:description",
        content: "How Ethixweb collects, uses, and protects your data.",
      },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: siteUrl("/policies/privacy") }],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Policies" title="Privacy Policy">
        Last updated: October 2026
      </PageHero>
      <Container>
        <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
      </Container>
      <section className="py-20">
        <Container className="grid gap-5 lg:grid-cols-2">
          <Reveal className="lg:col-span-2">
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
            <Section className="h-full" title="2. Information We Collect">
              <p>We collect information you provide directly, including:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Name, phone number, and the address of your current website when you submit our
                  contact form
                </li>
                <li>
                  Email address, business name, business type and goals when you submit a campaign
                  enquiry form
                </li>
                <li>Project details and materials you share with us</li>
                <li>Resumes and application details when you apply for a job with us</li>
                <li>
                  Your answers, and the proctoring record described in section 3, if you sit one of
                  our candidate assessments
                </li>
              </ul>
              <p>
                We also collect basic technical data (such as pages visited, browser type, and IP
                address) and information about which ad or campaign brought you to our site.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.05} className="lg:col-span-2">
            <Section title="3. Candidate Assessments and Proctoring">
              <p>
                This section applies only to people who choose to sit one of our online candidate
                assessments. It does not apply to clients or to ordinary visitors to this site.
              </p>
              <p>
                Our assessments are proctored. Before an assessment begins we tell you what will be
                recorded and ask for your browser's permission; the assessment does not start unless
                you grant it, and you can decline and withdraw at any point. While an assessment is
                running we may collect:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Video and audio recorded from your webcam and microphone</li>
                <li>Still images captured from your webcam at intervals</li>
                <li>
                  A record of events that indicate the exam window lost focus, such as leaving
                  fullscreen, switching tabs, or an attempt to copy, paste, or print
                </li>
                <li>Your answers, the time spent on each question, and your resulting score</li>
              </ul>
              <p>
                This material is used for one purpose: confirming that the person sitting the
                assessment completed it themselves, and reviewing the result. It is seen only by the
                Ethixweb people involved in that hiring decision. We do not use it to train any
                model, we do not use face recognition or any other biometric identification on it,
                and we do not share or sell it.
              </p>
              <p>
                Recordings and images are stored with our hosting provider, Vercel, under randomly
                generated addresses. Sitting an assessment is always optional. If you would rather
                not be recorded, tell us and we will arrange a different way to assess you.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.06}>
            <Section className="h-full" title="4. How We Use Your Information">
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
            <Section className="h-full" title="5. Sharing Your Information">
              <p>
                We do not sell your personal data. Your information may be shared between Ethixweb
                USA LLC and Ethixweb India Private Limited so our team can work on your project, and
                with the service providers we rely on to run the business. Those currently are:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Vercel, for website hosting and file storage</li>
                <li>Supabase, for our database</li>
                <li>Resend, for sending email</li>
                <li>ClickUp, where our team tracks follow-up on new enquiries</li>
                <li>Google, for advertising measurement</li>
                <li>Cloudflare, for the anti-spam check on our forms</li>
                <li>Anthropic and Google, for assistance in reviewing assessment answers</li>
              </ul>
              <p>We may also disclose information when required by law.</p>
            </Section>
          </Reveal>
          <Reveal delay={0.1}>
            <Section className="h-full" title="6. Data Storage, Security and Retention">
              <p>
                Your data is stored on secure servers. We use industry standard encryption (TLS/SSL)
                for data in transit and access controls for data at rest. No method of transmission
                over the internet is 100% secure; we take all reasonable precautions to protect your
                information.
              </p>
              <p>We keep personal data no longer than we need it:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Enquiries and contact form submissions: up to 24 months from your last contact
                </li>
                <li>
                  Client project records: for the length of our engagement, plus 7 years where tax
                  or contract law requires it
                </li>
                <li>
                  Job applications from candidates we do not hire: up to 12 months, so we can
                  approach you about a later opening
                </li>
                <li>
                  Assessment recordings and proctoring records: up to 6 months from the date of the
                  assessment, then deleted
                </li>
              </ul>
              <p>
                You can ask us to delete your data sooner at any time, using the contact details in
                section 8.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.12}>
            <Section className="h-full" title="7. Cookies and Advertising">
              <p>
                We keep your display preference, such as light or dark mode, in your browser's local
                storage. That never leaves your device and we cannot read it.
              </p>
              <p>
                Separately, we use Google Ads to measure how our advertising performs, and that does
                set cookies. We ask before loading it: until you accept, no advertising or
                measurement cookie is set. If you decline, or simply ignore the banner, the site
                works exactly as it otherwise would. You can change your mind at any time by
                clearing this site's data in your browser. You may also disable cookies in your
                browser settings.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.14}>
            <Section className="h-full" title="8. Your Rights">
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
            <Section className="h-full" title="9. Third Party Services">
              <p>
                Our site may link to third party websites. We are not responsible for their privacy
                practices. We recommend reviewing their policies before submitting personal
                information.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.18}>
            <Section className="h-full" title="10. Children's Privacy">
              <p>
                Our services are not directed at individuals under 13. We do not knowingly collect
                data from children. If you believe a child has provided us data, please contact us
                immediately.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.2} className="lg:col-span-2">
            <Section title="11. Changes to This Policy">
              <p>
                We may update this policy periodically. The "Last updated" date at the top reflects
                the most recent revision. Continued use of our site after changes constitutes
                acceptance of the updated policy.
              </p>
            </Section>
          </Reveal>
          <Reveal delay={0.26} className="lg:col-span-2">
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
