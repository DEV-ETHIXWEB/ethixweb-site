import { createFileRoute, Link } from "@tanstack/react-router";
import { jsonLdStringify } from "@/lib/json-ld";
import { SiteLayout } from "@/components/SiteLayout";
import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";
import { GlowBlob } from "@/components/GlowBlob";
import { HeroWebVisual } from "@/components/HeroWebVisual";
import { MarqueeBand } from "@/components/MarqueeBand";
import {
  ArrowUpRight,
  Code2,
  Megaphone,
  Search,
  Palette,
  BarChart3,
  PhoneCall,
  ShoppingCart,
  Share2,
} from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services - Ethixweb" },
      {
        name: "description",
        content:
          "Websites, Google Ads, Local Services Ads, SEO, conversion tracking and lead gen for US home service businesses.",
      },
      { property: "og:title", content: "Ethixweb Services" },
      {
        property: "og:description",
        content: "Marketing services for plumbing, HVAC and electrical contractors.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://ethixweb.com/ethixweb.png" },
      { property: "og:url", content: "https://ethixweb.com/services" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Ethixweb Services" },
      {
        name: "twitter:description",
        content:
          "Websites, Google Ads, Local Services Ads, SEO, conversion tracking and lead gen for US home service businesses.",
      },
      { name: "twitter:image", content: "https://ethixweb.com/ethixweb.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://ethixweb.com/services" }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLdStringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Ethixweb Services",
          url: "https://ethixweb.com/services",
          description:
            "Websites, Google Ads, Local Services Ads, SEO, conversion tracking and lead gen for US home service businesses.",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Website Design & Development",
              url: "https://ethixweb.com/web-development",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "AI & Workflow Automation",
              url: "https://ethixweb.com/ai-automation",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "Social Media Marketing",
              url: "https://ethixweb.com/marketing",
            },
            {
              "@type": "ListItem",
              position: 4,
              name: "Graphic Design & Branding",
              url: "https://ethixweb.com/graphic-design",
            },
          ],
        }),
      },
    ],
  }),
  component: Services,
});

const SERVICES = [
  {
    icon: Code2,
    title: "Website Design & Dev",
    description: "WordPress, Astro and headless builds: fast, mobile first, built to convert.",
    to: "/web-development",
  },
  {
    icon: Megaphone,
    title: "Google Ads",
    description:
      "Search campaigns managed by senior media buyers, optimized weekly for booked jobs.",
    to: "/marketing",
  },
  {
    icon: PhoneCall,
    title: "Local Services Ads",
    description: "Google LSA setup, verification and optimization for top of page placement.",
    to: "/marketing",
  },
  {
    icon: Search,
    title: "SEO & Local SEO",
    description: "Technical SEO, content engines, GBP optimization and local authority building.",
    to: "/services",
  },
  {
    icon: BarChart3,
    title: "Conversion Tracking",
    description: "GA4, GTM and CallRail setup so every lead is attributed to its real source.",
    to: "/services",
  },
  {
    icon: Share2,
    title: "Social & Content",
    description: "Social media management and content that builds trust in your local market.",
    to: "/marketing",
  },
  {
    icon: Palette,
    title: "Brand & Creative",
    description:
      "Identity, ad creative and photography direction that looks trustworthy and premium.",
    to: "/services",
  },
  {
    icon: ShoppingCart,
    title: "CRM & Lead Systems",
    description:
      "CRM integrations, lifecycle flows and lead routing that turn calls into customers.",
    to: "/ai-automation",
  },
];

function Services() {
  return (
    <SiteLayout>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative -mt-24 overflow-hidden bg-gradient-hero pb-20 pt-36 sm:pb-24 sm:pt-44">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <GlowBlob
          size="md"
          color="primary"
          blur={130}
          className="left-1/2 top-0 -translate-x-1/2 opacity-60"
        />
        <div className="pointer-events-none absolute inset-x-0 top-24 mx-auto w-full max-w-5xl scale-110 opacity-10">
          <HeroWebVisual showBadges={false} />
        </div>

        <Container className="relative">
          <div className="max-w-3xl">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_18px_rgba(138,24,28,0.9)]" />
                Services
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-7 max-w-3xl pb-1 text-[clamp(2.5rem,5.2vw,4.5rem)] font-extrabold leading-[1.06] text-gradient">
                Everything a home service business needs to{" "}
                <span className="text-primary">grow.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Websites, ads, SEO and tracking, handled by a senior team that actually answers
                the phone.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  to="/contact"
                  className="btn-primary group inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-bold"
                >
                  Start a project
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <a
                  href="#what-we-offer"
                  className="btn-secondary group inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-bold"
                >
                  Browse services
                  <ArrowUpRight className="h-4 w-4 rotate-90 transition-transform duration-200 group-hover:rotate-[100deg]" />
                </a>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <MarqueeBand items={SERVICES.map((s) => s.title)} />

      {/* ── What we offer ─────────────────────────────────────────────────── */}
      <section id="what-we-offer" className="scroll-mt-24 py-24">
        <Container>
          <Reveal>
            <div className="flex items-baseline gap-5">
              <span
                aria-hidden="true"
                className="select-none font-display text-6xl font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(165,28,34,0.5)] sm:text-7xl"
              >
                {String(SERVICES.length).padStart(2, "0")}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-6 max-w-2xl">
              <p className="mb-4 text-sm uppercase tracking-widest text-primary-text">
                What we offer
              </p>
              <h2 className="pb-1 font-display text-4xl font-bold text-gradient sm:text-5xl">
                Everything under one roof.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Eight capabilities, one accountable team - so nothing falls between the agency
                cracks.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((item, i) => (
              <Reveal key={item.title} delay={(i % 4) * 0.06}>
                <Link
                  to={item.to}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-foreground/[0.02] p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/35 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {/* Crimson wash that sweeps in on hover */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.07] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span
                    aria-hidden="true"
                    className="absolute right-5 top-4 select-none font-display text-4xl font-extrabold leading-none text-transparent transition-all duration-300 [-webkit-text-stroke:1.5px_rgba(165,28,34,0.25)] group-hover:[-webkit-text-stroke:1.5px_rgba(165,28,34,0.55)]"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-glow ring-1 ring-white/15">
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
                    <item.icon className="relative h-5 w-5" strokeWidth={2} />
                  </span>

                  <h3 className="relative mt-5 font-display text-lg font-semibold transition-colors duration-300 group-hover:text-primary">
                    {item.title}
                  </h3>
                  <p className="relative mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>

                  <span className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/70 transition-colors duration-300 group-hover:text-primary">
                    Learn more
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────
          Full-crimson finale panel, matching the careers and portfolio pages.
          Same in both themes, so colors are hardcoded. */}
      <section className="pb-24 pt-4">
        <Reveal>
          <Container className="relative overflow-hidden rounded-4xl bg-[linear-gradient(135deg,#9d1b20_0%,#6b1114_45%,#30090b_100%)] px-6 py-12 text-center shadow-glow ring-1 ring-white/10 sm:px-12 sm:py-14 lg:py-16">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(55%_60%_at_50%_0%,rgba(255,255,255,0.14),transparent_70%)]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(40%_50%_at_90%_100%,rgba(0,0,0,0.35),transparent_70%)]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-[16vw] font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.09)] lg:text-[9rem]"
            >
              GROWTH
            </span>
            <div className="relative mx-auto max-w-2xl">
              <h2 className="pb-1 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
                One team for your whole growth system.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/75 sm:text-lg">
                Stop stitching together freelancers and point tools. Tell us what growth looks
                like for you - we&apos;ll map the system that gets you there.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/contact"
                  className="magnetic group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-bold text-[#7a1418] shadow-[0_14px_40px_-12px_rgba(0,0,0,0.55)]"
                >
                  Start a project
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                </Link>
                <Link
                  to="/portfolio"
                  className="magnetic inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 font-bold text-white transition-colors hover:bg-white/10"
                >
                  See the results
                </Link>
              </div>
            </div>
          </Container>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
