import { createFileRoute, Link } from "@tanstack/react-router";
import { jsonLdStringify } from "@/lib/json-ld";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { GlowBlob } from "@/components/shared/GlowBlob";
import { HeroWebVisual } from "@/components/shared/HeroWebVisual";
import { MarqueeBand } from "@/components/shared/MarqueeBand";
import { EditorialHeader } from "@/components/shared/EditorialHeader";
import { WebSpotlight } from "@/components/shared/WebSpotlight";
import { trackWebSpotlight } from "@/lib/web-spotlight";
import {
  Wrench,
  Anchor,
  Bot,
  ShieldCheck,
  MapPin,
  ShoppingBag,
  Mail,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title: "Industries - Ethixweb" },
      {
        name: "description",
        content:
          "Specialized tech and marketing systems for HVAC, plumbing and fishing charter operators.",
      },
      { property: "og:title", content: "Industries - HVAC, Plumbing & Fishing" },
      {
        property: "og:description",
        content: "Industry specific websites, AI booking and CRM management.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://ethixweb.com/ethixweb.png" },
      { property: "og:url", content: "https://ethixweb.com/industries" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Industries - HVAC, Plumbing & Fishing" },
      {
        name: "twitter:description",
        content:
          "Specialized tech and marketing systems for HVAC, plumbing and fishing charter operators.",
      },
      { name: "twitter:image", content: "https://ethixweb.com/ethixweb.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://ethixweb.com/industries" }],
  }),
  component: Industries,
});

const hvac = [
  {
    i: Bot,
    t: "CRM / FSM Management",
    d: "Expert setup and management of ServiceTitan, Jobber and Housecall Pro.",
  },
  {
    i: ShieldCheck,
    t: "AI Lead Protection",
    d: "24/7 AI receptionist that texts and books customers instantly if you miss a call.",
  },
  {
    i: MapPin,
    t: "Map Pack Dominance",
    d: "Weekly GMB updates and automated review harvesting to own local search.",
  },
  {
    i: Mail,
    t: "IT & Security",
    d: "Secure business email (Google Workspace) and field team communication setup.",
  },
];

const fishing = [
  {
    i: Anchor,
    t: "Booking Engine Integration",
    d: "FareHarbor, Peek Pro and Bókun management to ensure zero overbookings.",
  },
  {
    i: ShoppingBag,
    t: "E Commerce Merch Store",
    d: "Fully managed Shopify integration to sell your brand's gear 24/7.",
  },
  {
    i: MapPin,
    t: "Catch of the Day SEO",
    d: "We handle catch reports and fishing logs to boost local SEO.",
  },
  {
    i: Mail,
    t: "Reliable Email & IT",
    d: "Pro grade business email and tech support for booking hardware on the boat.",
  },
];

const MARQUEE_ITEMS = [
  "HVAC & Plumbing",
  "Fishing charters",
  "AI lead capture",
  "CRM / FSM",
  "Map pack SEO",
  "Booking engines",
  "24/7 response",
];

const INDUSTRIES_SCHEMA = jsonLdStringify({
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Industry-Specific Technology Systems",
  provider: { "@type": "Organization", name: "Ethixweb", url: "https://ethixweb.com" },
  description:
    "Specialized tech and marketing systems for HVAC, plumbing and fishing charter operators.",
  url: "https://ethixweb.com/industries",
  areaServed: { "@type": "Country", name: "United States" },
  serviceType: "Industry-Specific Digital Operations",
});

function Industries() {
  return (
    <SiteLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: INDUSTRIES_SCHEMA }} />

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
                Industries
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-7 max-w-3xl pb-1 text-[clamp(2.5rem,5.2vw,4.5rem)] font-extrabold leading-[1.06] text-gradient">
                Built for the businesses that <span className="text-primary">build America.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                We specialize in two worlds: home services and fishing charters. Different
                operations, same problem - calls and bookings can&apos;t wait.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  to="/contact"
                  className="btn-primary group inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-bold"
                >
                  Book a consultation
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <a
                  href="#hvac"
                  className="btn-secondary group inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-bold"
                >
                  Find your industry
                  <ArrowUpRight className="h-4 w-4 rotate-90 transition-transform duration-200 group-hover:rotate-[100deg]" />
                </a>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <MarqueeBand items={MARQUEE_ITEMS} rotate={false} />

      <IndustryBlock
        id="hvac"
        index="01"
        eyebrow="HVAC & Plumbing"
        icon={Wrench}
        title="You handle the pipes. We handle the tech."
        pain="You spend $200+ per lead, but miss 30% of your calls while on a job. That's thousands in lost revenue every month."
        items={hvac}
        ctaLabel="Get the home services plan"
        proof={{
          heading: "Proof from the trades",
          stats: [
            { value: "2,500+", label: "Qualified leads in 12 months - MTO Cabinets" },
            { value: "$6", label: "Peak-season cost per lead - MTO Cabinets" },
          ],
        }}
      />

      <IndustryBlock
        id="fishing"
        index="02"
        eyebrow="Fishing & Charters"
        icon={Anchor}
        title="Your business shouldn't stop at the shoreline."
        pain="You're at sea 10 hours a day. While you're fishing, customers are trying to book. If they can't book instantly, they find another boat."
        items={fishing}
        ctaLabel="Get the charter plan"
        proof={{
          heading: "Proof from the water",
          stats: [
            { value: "2,000+", label: "Qualified leads - Catch Zone" },
            { value: "+40%", label: "Traffic lift in 6 months - Bimini Buddie" },
          ],
        }}
      />

      {/* ── Final CTA ────────────────────────────────────────────────────────
          Crimson finale panel matching the rest of the site; forced-dark,
          hardcoded colors. */}
      <section className="py-24">
        <Reveal>
          <Container className="relative overflow-hidden rounded-4xl bg-[linear-gradient(135deg,#9d1b20_0%,#6b1114_45%,#30090b_100%)] px-6 py-12 text-center shadow-glow ring-1 ring-white/10 sm:px-12 sm:py-14 lg:py-16">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(55%_60%_at_50%_0%,rgba(255,255,255,0.14),transparent_70%)]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-[15vw] font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.09)] lg:text-[8.5rem]"
            >
              YOUR TRADE
            </span>
            <div className="relative mx-auto max-w-2xl">
              <h2 className="pb-1 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
                Which industry are you in?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/75 sm:text-lg">
                Tell us about your operation. We&apos;ll come back with a clear plan tailored to
                your industry - no pitch deck required.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/contact"
                  className="magnetic group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-bold text-[#7a1418] shadow-[0_14px_40px_-12px_rgba(0,0,0,0.55)]"
                >
                  Book a consultation
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                </Link>
                <Link
                  to="/portfolio"
                  className="magnetic inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 font-bold text-white transition-colors hover:bg-white/10"
                >
                  See the case studies
                </Link>
              </div>
            </div>
          </Container>
        </Reveal>
      </section>
    </SiteLayout>
  );
}

function IndustryBlock({
  id,
  index,
  eyebrow,
  icon: Icon,
  title,
  pain,
  items,
  ctaLabel,
  proof,
}: {
  id: string;
  index: string;
  eyebrow: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  pain: string;
  items: {
    i: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    t: string;
    d: string;
  }[];
  ctaLabel: string;
  proof: { heading: string; stats: { value: string; label: string }[] };
}) {
  return (
    <section id={id} className="scroll-mt-24 py-16">
      <Container>
        <EditorialHeader
          className="mb-10 lg:mb-14"
          index={index}
          eyebrow={eyebrow}
          title={
            <span className="inline-flex items-start gap-4">
              <span className="relative mt-1.5 hidden h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-glow ring-1 ring-white/15 sm:flex">
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
                <Icon className="relative h-5 w-5" strokeWidth={2} />
              </span>
              {title}
            </span>
          }
        />

        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <Reveal>
            <div>
              {/* Pain callout - the reason this industry needs the system */}
              <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/[0.06] p-6 sm:p-7">
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-text">
                  <AlertTriangle className="h-4 w-4" /> The problem
                </p>
                <p className="mt-3 text-lg font-medium leading-relaxed text-foreground/90">
                  {pain}
                </p>
              </div>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                We build websites and systems that don&apos;t just look good - they&apos;re built to
                convert visitors into paying customers while you&apos;re on the job.
              </p>

              {/* Proof strip - real numbers from the case studies, linked */}
              <div className="mt-7 rounded-3xl border border-border bg-foreground/[0.02] p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-primary-text">
                  {proof.heading}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {proof.stats.map((s) => (
                    <div key={s.label}>
                      <p className="font-display text-2xl font-extrabold text-gradient-brand">
                        {s.value}
                      </p>
                      <p className="mt-1 text-[11px] leading-tight text-muted-foreground">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
                <Link
                  to="/portfolio"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-text underline-offset-4 hover:underline"
                >
                  Read the full case studies
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <Link
                to="/contact"
                className="magnetic group mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow"
              >
                {ctaLabel}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((x) => (
                <div
                  key={x.t}
                  onMouseMove={trackWebSpotlight}
                  className="group relative overflow-hidden rounded-3xl glass p-6 transition-colors duration-300 hover:bg-white/[0.06]"
                >
                  <WebSpotlight />
                  <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-glow ring-1 ring-white/15">
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
                    <x.i className="relative h-5 w-5" strokeWidth={2} />
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold">{x.t}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{x.d}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
