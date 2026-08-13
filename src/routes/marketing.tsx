import { createFileRoute, Link } from "@tanstack/react-router";
import { jsonLdStringify } from "@/lib/json-ld";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/shared/PageHero";
import { Reveal } from "@/components/shared/Reveal";
import { Container } from "@/components/shared/Container";
import { CTASection } from "@/components/shared/CTASection";
import { WebSpotlight } from "@/components/shared/WebSpotlight";
import { trackWebSpotlight } from "@/lib/web-spotlight";
import {
  Megaphone,
  BarChart3,
  Target,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  Users,
  SlidersHorizontal,
} from "lucide-react";

export const Route = createFileRoute("/marketing")({
  head: () => ({
    meta: [
      { title: "Social Media Marketing - Drive Engagement and Growth | Ethixweb" },
      {
        name: "description",
        content:
          "Elevate your brand with expert social media marketing: content, engagement tracking, paid campaigns and flexible plans built for home service businesses.",
      },
      { property: "og:title", content: "Social Media Marketing - Ethixweb" },
      {
        property: "og:description",
        content: "Engage, grow and convert effectively with data driven social media strategy.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://ethixweb.com/ethixweb.png" },
      { property: "og:url", content: "https://ethixweb.com/marketing" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Social Media Marketing - Ethixweb" },
      {
        name: "twitter:description",
        content:
          "Elevate your brand with expert social media marketing: content, engagement tracking, paid campaigns and flexible plans built for home service businesses.",
      },
      { name: "twitter:image", content: "https://ethixweb.com/ethixweb.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://ethixweb.com/marketing" }],
  }),
  component: Page,
});

const helpItems = [
  {
    i: Layers,
    t: "Content Creation",
    d: "We craft eye catching, engaging content tailored to your brand, ensuring it resonates with your audience and encourages sharing.",
  },
  {
    i: BarChart3,
    t: "Engagement Tracking",
    d: "We monitor real time interactions across platforms, providing insights to help you understand and optimize audience engagement.",
  },
  {
    i: Target,
    t: "Paid Campaigns",
    d: "Our data driven ads are designed to boost leads and attract top tier technicians, helping you grow your business efficiently.",
  },
  {
    i: SlidersHorizontal,
    t: "Flexible Plans",
    d: "Enjoy the freedom of no long term contracts, with services designed to scale with your business and needs.",
  },
];

const plans = [
  {
    name: "Basic",
    score: "98%",
    ads: "2-3 ads / month",
    perks: ["Content calendar", "Community management", "Monthly reporting"],
  },
  {
    name: "Standard",
    score: "100%",
    ads: "4-6 ads / month",
    perks: ["Everything in Basic", "Paid ad management", "Bi weekly creative refresh"],
    featured: true,
  },
  {
    name: "Business",
    score: "95%",
    ads: "6-7 ads / month",
    perks: ["Everything in Standard", "Influencer partnerships", "Dedicated strategist"],
  },
];

const SERVICE_SCHEMA = jsonLdStringify({
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Social Media Marketing",
  provider: { "@type": "Organization", name: "Ethixweb", url: "https://ethixweb.com" },
  description:
    "Content creation, engagement tracking, paid campaigns and social media strategy for home service businesses.",
  url: "https://ethixweb.com/marketing",
  areaServed: { "@type": "Country", name: "United States" },
  serviceType: "Social Media Marketing",
});

function Page() {
  return (
    <SiteLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SERVICE_SCHEMA }} />
      <PageHero
        eyebrow="Social Media Marketing"
        title="Drive Engagement and Growth with Social Media"
      >
        Engage, grow and convert effectively: content, campaigns and analytics under one roof.
      </PageHero>

      {/* What We Do */}
      <section className="py-24">
        <Container size="medium" className="text-center">
          <Reveal>
            <p className="text-sm uppercase tracking-widest text-primary-text mb-4">What We Do</p>
            <h2 className="font-display text-5xl font-bold text-gradient pb-1">
              Elevate Your Brand with Social Media Marketing
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              A strong social media presence is essential for building brand awareness, engaging
              with your audience and driving business growth. Our expert social media marketing
              services help you create compelling content, manage your platforms and run targeted ad
              campaigns to reach the right customers. We focus on strategy, engagement and analytics
              to ensure your brand stands out and delivers real results.
            </p>
            <Link
              to="/contact"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 font-medium shadow-glow hover:scale-[1.03] transition-transform"
            >
              Contact Us <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* Interesting Fact */}
      <section className="py-24 border-y border-white/5 bg-gradient-to-b from-transparent via-primary/[0.04] to-transparent">
        <Container className="grid items-center gap-12 sm:grid-cols-2 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <div className="relative">
              <div className="absolute -inset-8 bg-gradient-glow blur-3xl opacity-50" />
              <div className="relative glass-strong rounded-[2rem] p-10 text-center">
                <Users className="h-10 w-10 text-primary mx-auto mb-4" />
                <p className="text-sm uppercase tracking-widest text-primary-text">
                  Interesting Fact
                </p>
                <div className="mt-4 font-display text-6xl font-bold text-gradient-brand">
                  3.4B+
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  people connect via social media
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-4xl font-bold text-gradient leading-tight pb-1">
              Over 3.4 billion people connect via social media.
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Over 3.4 billion people connect via social media, making it a powerful force in
              today's digital landscape. From sharing daily moments to driving global conversations,
              social platforms shape how we communicate, learn and engage with the world. Whether
              for entertainment, business or activism, social media continues to influence cultures,
              industries and societies, bridging gaps and creating new opportunities like never
              before.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* We'll Help You */}
      <section className="py-24">
        <Container>
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-widest text-primary-text mb-4">
                We'll Help You
              </p>
              <h2 className="font-display text-5xl font-bold text-gradient pb-1">
                Strategy. Content. Conversion.
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed max-w-xl">
                We help you navigate the ever evolving world of social media with tailored
                strategies that fit your unique goals. No long term contracts, just real results.
              </p>
            </div>
          </Reveal>
          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {helpItems.map((s, i) => (
              <Reveal key={s.t} delay={i * 0.06}>
                <div
                  onMouseMove={trackWebSpotlight}
                  className="group relative h-full overflow-hidden rounded-3xl glass p-7 hover:bg-white/[0.06] transition"
                >
                  <WebSpotlight />
                  <s.i className="h-9 w-9 text-primary mb-5" strokeWidth={1.5} />
                  <h3 className="font-display text-lg font-semibold">{s.t}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-10">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              View all services <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Plans */}
      <section className="py-24">
        <Container>
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-widest text-primary-text mb-4">Pricing</p>
              <h2 className="font-display text-5xl font-bold text-gradient pb-1">
                Become the social media leader in your local market.
              </h2>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {plans.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.08}>
                <div
                  onMouseMove={trackWebSpotlight}
                  className={`group relative h-full overflow-hidden rounded-3xl p-8 ${
                    p.featured
                      ? "bg-gradient-brand shadow-glow ring-1 ring-primary/40"
                      : "glass hover:bg-white/[0.06] transition"
                  }`}
                >
                  <WebSpotlight />
                  {p.featured && (
                    <span className="absolute -top-3 right-6 rounded-full bg-background px-3 py-1 text-[10px] uppercase tracking-widest">
                      Most Popular
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-2xl font-semibold">{p.name}</h3>
                    <div
                      className={`font-display text-3xl font-bold ${p.featured ? "" : "text-gradient-brand"}`}
                    >
                      {p.score}
                    </div>
                  </div>
                  <p
                    className={`mt-2 text-sm ${p.featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                  >
                    {p.ads}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {p.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-sm">
                        <CheckCircle2
                          className={`h-4 w-4 mt-0.5 shrink-0 ${p.featured ? "" : "text-primary"}`}
                        />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/contact"
                    className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium ${
                      p.featured
                        ? "bg-background text-foreground hover:scale-[1.02] transition-transform"
                        : "bg-gradient-brand text-primary-foreground hover:scale-[1.02] transition-transform"
                    }`}
                  >
                    Get started <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <CTASection
        icon={Megaphone}
        title="Ready to grow on social?"
        description="We'll audit your current social presence and come back with a clear, no jargon plan."
        ctaLabel="Get a free audit"
        ctaTo="/contact"
      />
    </SiteLayout>
  );
}
