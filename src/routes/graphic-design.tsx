import { createFileRoute, Link } from "@tanstack/react-router";
import { jsonLdStringify } from "@/lib/json-ld";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/shared/PageHero";
import { Reveal } from "@/components/shared/Reveal";
import { Container } from "@/components/shared/Container";
import { GlowBlob } from "@/components/shared/GlowBlob";
import { WebSpotlight } from "@/components/shared/WebSpotlight";
import { trackWebSpotlight } from "@/lib/web-spotlight";
import {
  Palette,
  Megaphone,
  Share2,
  Layout,
  Package,
  BookOpen,
  Wand2,
  Lightbulb,
  Target,
  ShieldCheck,
  Eye,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/graphic-design")({
  head: () => ({
    meta: [
      { title: "Graphic Design & Branding - Build a Powerful Brand Identity | Ethixweb" },
      {
        name: "description",
        content:
          "Logo design, brand identity, marketing collateral, social graphics and UI/UX: bespoke branding that builds trust and drives engagement.",
      },
      { property: "og:title", content: "Graphic Design & Branding - Ethixweb" },
      { property: "og:description", content: "Create a powerful brand identity that stands out." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.ethixweb.com/ethixweb.png" },
      { property: "og:url", content: "https://www.ethixweb.com/graphic-design" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Graphic Design & Branding - Ethixweb" },
      {
        name: "twitter:description",
        content:
          "Logo design, brand identity, marketing collateral, social graphics and UI/UX: bespoke branding that builds trust and drives engagement.",
      },
      { name: "twitter:image", content: "https://www.ethixweb.com/ethixweb.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://www.ethixweb.com/graphic-design" }],
  }),
  component: Page,
});

const whyMatters = [
  {
    i: Eye,
    t: "First Impressions Matter",
    d: "Customers form an opinion about your brand in seconds.",
  },
  {
    i: ShieldCheck,
    t: "Consistency Builds Trust",
    d: "A cohesive brand increases recognition and credibility.",
  },
  {
    i: Wand2,
    t: "Visuals Drive Engagement",
    d: "Professionally designed graphics attract more attention.",
  },
];

const services = [
  {
    i: Palette,
    t: "Logo Design & Brand Identity",
    d: "Distinctive marks and visual systems that capture your essence.",
  },
  {
    i: Megaphone,
    t: "Marketing & Promotional Materials",
    d: "Flyers, brochures, ads and print collateral that convert.",
  },
  {
    i: Share2,
    t: "Social Media Graphics",
    d: "Scroll stopping templates and assets for every platform.",
  },
  {
    i: Layout,
    t: "Website & UI/UX Design",
    d: "Interfaces engineered for clarity, conversion and delight.",
  },
  {
    i: Package,
    t: "Packaging & Product Design",
    d: "Shelf ready packaging that tells your story at a glance.",
  },
  {
    i: BookOpen,
    t: "Brand Guidelines & Strategy",
    d: "Documented systems so your team stays on brand everywhere.",
  },
];

const whyUs = [
  {
    i: Lightbulb,
    t: "Creative Experts",
    d: "Our team specializes in unique, high impact designs.",
  },
  {
    i: Target,
    t: "Custom Branding Strategies",
    d: "Tailored solutions that align with your business goals.",
  },
  {
    i: ShieldCheck,
    t: "Quality & Consistency",
    d: "Professional designs that maintain brand integrity.",
  },
  { i: Eye, t: "Attention to Detail", d: "Every design element crafted for maximum impact." },
];

const SERVICE_SCHEMA = jsonLdStringify({
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Graphic Design & Branding",
  provider: { "@type": "Organization", name: "Ethixweb", url: "https://www.ethixweb.com" },
  description:
    "Logo design, brand identity, marketing collateral, social graphics and UI/UX for modern businesses.",
  url: "https://www.ethixweb.com/graphic-design",
  areaServed: { "@type": "Country", name: "United States" },
  serviceType: "Graphic Design and Branding",
});

function Page() {
  return (
    <SiteLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SERVICE_SCHEMA }} />
      <PageHero
        eyebrow="Graphic Design & Branding"
        title="Create a Powerful Brand Identity That Stands Out"
      >
        Rank your brand above others at the speed of light with a distinctive visual identity that
        converts attention into trust.
      </PageHero>

      {/* Why It Matters */}
      <section className="py-24">
        <Container>
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-widest text-primary-text mb-4">What We Do</p>
              <h2 className="font-display text-5xl font-bold text-gradient pb-1">
                Why Graphic Design & Branding Matter
              </h2>
            </div>
          </Reveal>
          <div className="mt-14 grid md:grid-cols-3 gap-5">
            {whyMatters.map((s, i) => (
              <Reveal key={s.t} delay={i * 0.08}>
                <div
                  onMouseMove={trackWebSpotlight}
                  className="group relative h-full overflow-hidden rounded-3xl glass p-8 hover:bg-white/[0.06] transition"
                >
                  <WebSpotlight />
                  <s.i className="h-10 w-10 text-primary mb-5" strokeWidth={1.5} />
                  <h3 className="font-display text-xl font-semibold">{s.t}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Services */}
      <section className="py-24 border-y border-white/5 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent">
        <Container>
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-widest text-primary-text mb-4">
                Our Services
              </p>
              <h2 className="font-display text-5xl font-bold text-gradient pb-1">
                Graphic Design & Branding Services
              </h2>
            </div>
          </Reveal>
          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <Reveal key={s.t} delay={i * 0.05}>
                <div
                  onMouseMove={trackWebSpotlight}
                  className="group relative h-full overflow-hidden rounded-3xl glass p-8 hover:bg-white/[0.06] transition"
                >
                  <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/30 blur-3xl opacity-0 group-hover:opacity-100 transition" />
                  <WebSpotlight />
                  <s.i className="h-10 w-10 text-primary mb-6" strokeWidth={1.5} />
                  <h3 className="font-display text-xl font-semibold">{s.t}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Why Choose Us */}
      <section className="py-24">
        <Container>
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-widest text-primary-text mb-4">
                Why Choose Us
              </p>
              <h2 className="font-display text-5xl font-bold text-gradient pb-1">
                Design that earns attention.
              </h2>
            </div>
          </Reveal>
          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyUs.map((s, i) => (
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
        </Container>
      </section>

      {/* Story Block */}
      <section className="py-24">
        <Container className="glass-strong relative overflow-hidden rounded-[2.5rem] p-8 sm:p-10 lg:p-16">
          <GlowBlob size="md" color="primary" blur={120} className="-top-32 -left-32" />
          <GlowBlob size="md" color="brand" blur={120} className="-bottom-32 -right-32" />
          <Reveal>
            <p className="text-sm uppercase tracking-widest text-primary-text mb-4 relative">
              Why Us
            </p>
            <h2 className="relative font-display text-5xl font-bold text-gradient max-w-3xl pb-1">
              Graphic Design & Branding
            </h2>
            <div className="relative mt-6 space-y-5 text-muted-foreground leading-relaxed max-w-3xl">
              <p>
                Your brand is more than just a logo. It's the story, personality and visual identity
                that sets your business apart. Strong branding and eye catching graphic design
                create a lasting impression, build trust and connect with your audience.
              </p>
              <p>
                Our Graphic Design & Branding services help businesses establish a unique and
                professional identity that attracts customers and strengthens brand loyalty.
              </p>
            </div>
            <div className="relative mt-10 grid sm:grid-cols-2 gap-3 max-w-2xl">
              {[
                "Distinctive visual identity",
                "Cohesive brand system",
                "Print + digital ready",
                "Built to scale with you",
              ].map((p) => (
                <div
                  key={p}
                  className="flex items-center gap-3 rounded-2xl bg-white/[0.03] border border-white/5 px-5 py-3"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm">{p}</span>
                </div>
              ))}
            </div>
            <div className="relative mt-10 flex flex-wrap gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 font-medium shadow-glow hover:scale-[1.03] transition-transform"
              >
                Request a consultation <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to="/our-work"
                className="inline-flex items-center gap-2 rounded-full glass px-7 py-3.5 font-medium hover:bg-white/10 transition"
              >
                See our work <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    </SiteLayout>
  );
}
