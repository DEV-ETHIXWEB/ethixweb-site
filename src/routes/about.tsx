import { createFileRoute, Link } from "@tanstack/react-router";
import { jsonLdStringify } from "@/lib/json-ld";
import { motion, useReducedMotion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { MarqueeBand } from "@/components/shared/MarqueeBand";
import { EditorialHeader } from "@/components/shared/EditorialHeader";
import { Reveal } from "@/components/shared/Reveal";
import { Container } from "@/components/shared/Container";
import { GlowBlob } from "@/components/shared/GlowBlob";
import { CardGrid } from "@/components/shared/CardGrid";
import { WebSpotlight } from "@/components/shared/WebSpotlight";
import { trackWebSpotlight } from "@/lib/web-spotlight";
import {
  Target,
  Heart,
  Zap,
  ArrowUpRight,
  Compass,
  Eye,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About - Ethixweb" },
      {
        name: "description",
        content:
          "Ethixweb is a small, senior team helping US home service contractors grow with marketing that moves revenue.",
      },
      { property: "og:title", content: "About Ethixweb" },
      {
        property: "og:description",
        content: "Our story, how we work and why home service contractors trust us.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://ethixweb.com/ethixweb.png" },
      { property: "og:url", content: "https://ethixweb.com/about" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "About Ethixweb" },
      {
        name: "twitter:description",
        content: "Our story, how we work and why home service contractors trust us.",
      },
      { name: "twitter:image", content: "https://ethixweb.com/ethixweb.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://ethixweb.com/about" }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLdStringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About Ethixweb",
          url: "https://ethixweb.com/about",
          description:
            "Ethixweb is a small, senior team helping US home service contractors grow with marketing that moves revenue.",
          mainEntity: {
            "@type": "Organization",
            name: "Ethixweb",
            url: "https://ethixweb.com",
            logo: "https://ethixweb.com/ethixweb.png",
            email: "akash@ethixweb.com",
            foundingDate: "2020",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Kent",
              addressRegion: "WA",
              addressCountry: "US",
            },
            sameAs: [
              "https://www.linkedin.com/company/ethixweb/",
              "https://www.instagram.com/ethix.web/",
            ],
          },
        }),
      },
    ],
  }),
  component: About,
});

const PROCESS_STEPS = [
  {
    n: "01",
    t: "Discover & strategize",
    d: "We dig into your business, customers, and competitors to build a plan focused on revenue, not vanity metrics.",
  },
  {
    n: "02",
    t: "Design & build",
    d: "Senior designers and developers create a fast, conversion focused site or system, built right the first time.",
  },
  {
    n: "03",
    t: "Launch & optimize",
    d: "We ship in weeks, not months, then track real data to refine messaging, design, and performance.",
  },
  {
    n: "04",
    t: "Grow & scale",
    d: "Once the foundation works, we double down on what's driving results and scale it across channels.",
  },
];

const STATS = [
  { value: "2-4 wks", label: "Typical time to launch" },
  { value: "100%", label: "Senior led delivery" },
  { value: "24/7", label: "Global availability" },
  { value: "5.0", label: "Avg. client rating" },
];

const COMPARISON = [
  {
    k: "Who does the work",
    us: "The senior team on your kickoff call",
    them: "Juniors behind an account manager",
  },
  {
    k: "Pricing",
    us: "Fixed scope, agreed in writing upfront",
    them: "Open-ended retainers and surprise invoices",
  },
  {
    k: "What gets reported",
    us: "Calls, bookings and revenue",
    them: "Impressions, clicks and vanity dashboards",
  },
  {
    k: "Time to launch",
    us: "2-4 weeks",
    them: "A quarter of discovery theater",
  },
  {
    k: "Getting answers",
    us: "A direct line to the people building",
    them: "Ticket queues and message relays",
  },
];

const REASONS = [
  "Direct access to senior developers & strategists",
  "Transparent pricing, no hidden retainers",
  "Decisions backed by data, not guesswork",
  "Fast turnarounds without cutting corners",
  "Ongoing support after launch",
  "US focused communication & operations",
];

function About() {
  const reduceMotion = useReducedMotion();
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
        <Container className="relative">
          <div className="max-w-3xl">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_18px_rgba(138,24,28,0.9)]" />
                About us
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-7 max-w-3xl pb-1 text-[clamp(2.5rem,5.2vw,4.5rem)] font-extrabold leading-[1.06] text-gradient">
                A small, senior team. <span className="text-primary">No account managers.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Ethixweb is a digital marketing &amp; web development agency built for businesses
                that want measurable growth, not marketing noise.
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
                  href="#how-we-work"
                  className="btn-secondary group inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-bold"
                >
                  How we work
                  <ArrowUpRight className="h-4 w-4 rotate-90 transition-transform duration-200 group-hover:rotate-[100deg]" />
                </a>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <MarqueeBand
        rotate={false}
        items={[
          "Senior-led",
          "No account managers",
          "Remote-first",
          "US clients",
          "Revenue over vanity metrics",
          "Since 2020",
        ]}
      />

      <section className="relative py-20">
        <GlowBlob
          size="lg"
          color="primary"
          blur={120}
          className="right-0 top-1/2 -translate-y-1/2 opacity-50"
        />
        <Container className="relative grid items-center gap-16 sm:grid-cols-2">
          <Reveal>
            {/* Layered photo collage - photos are the same free-to-use set
                used on the careers page (see that file's note); swap in real
                team photos whenever they exist. */}
            <motion.div
              className="relative mx-auto mb-12 w-full max-w-md"
              animate={{ y: reduceMotion ? 0 : [0, -8, 0] }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 7, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <div className="absolute -inset-6 rounded-full bg-primary/[0.12] blur-[90px]" />
              <div className="relative">
                <div className="relative rotate-[1.5deg] overflow-hidden rounded-3xl shadow-lg ring-1 ring-white/10">
                  <img
                    src="/images/careers/real-client-impact.webp"
                    alt="The team reviewing a client project together"
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                </div>
                <div className="absolute -bottom-10 -left-4 w-44 -rotate-[5deg] overflow-hidden rounded-2xl shadow-lg ring-1 ring-white/15 sm:w-56">
                  <img
                    src="/images/careers/direct-collaboration.webp"
                    alt="The team gathered around a table collaborating"
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>
                <div className="absolute -right-4 -top-5 rotate-[3deg] rounded-2xl border border-primary/20 bg-background/90 px-4 py-3 shadow-lg backdrop-blur">
                  <p className="font-display text-2xl font-extrabold text-gradient-brand">
                    Since 2020
                  </p>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Senior-led team
                  </p>
                </div>
              </div>
            </motion.div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="max-w-xl">
              <div className="flex items-baseline gap-4">
                <span
                  aria-hidden="true"
                  className="select-none font-display text-5xl font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(165,28,34,0.5)]"
                >
                  01
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
              </div>
              <p className="mt-5 text-sm uppercase tracking-widest text-primary-text">Our story</p>
              <h2 className="mt-5 font-display text-4xl font-bold leading-[1.15] tracking-tight text-gradient pb-1">
                Built for contractors tired of big agency theater.
              </h2>
              <p className="mt-7 text-muted-foreground leading-relaxed">
                We started Ethixweb because we were tired of watching good businesses get mediocre
                results from agencies that overpromise and underdeliver.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                We're a tight knit team of developers, designers, and strategists, each senior in
                their craft. When you work with Ethixweb, you work directly with the people building
                your project. No account managers passing messages. No juniors learning on your
                budget.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <EditorialHeader
            className="mb-12"
            index="02"
            eyebrow="What drives us"
            title={<>Mission &amp; vision</>}
          />
          <div className="grid gap-6 md:grid-cols-2">
            <Reveal delay={0.05}>
              <div
                onMouseMove={trackWebSpotlight}
                className="group relative h-full overflow-hidden rounded-3xl glass p-8 lg:p-10"
              >
                <WebSpotlight size="lg" />
                <span className="relative mb-6 flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-glow ring-1 ring-white/15">
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
                  <Compass className="relative h-5 w-5" strokeWidth={2} />
                </span>
                <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary-text">
                  Our mission
                </p>
                <h3 className="font-display text-2xl font-semibold">
                  Turn marketing spend into measurable revenue.
                </h3>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Every project we take on is judged the same way: did it move the needle on
                  bookings, leads, and revenue? We build websites and systems that earn their place
                  in your budget.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div
                onMouseMove={trackWebSpotlight}
                className="group relative h-full overflow-hidden rounded-3xl glass p-8 lg:p-10"
              >
                <WebSpotlight size="lg" />
                <span className="relative mb-6 flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-glow ring-1 ring-white/15">
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
                  <Eye className="relative h-5 w-5" strokeWidth={2} />
                </span>
                <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary-text">
                  Our vision
                </p>
                <h3 className="font-display text-2xl font-semibold">
                  The senior team contractors call first.
                </h3>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  We're building Ethixweb into the go to growth partner for home service businesses
                  - known for senior craftsmanship, straight talk, and results you can point to.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section id="how-we-work" className="scroll-mt-24 py-20">
        <Container>
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1fr_1.5fr] lg:items-start">
            <Reveal>
              <div>
                <div className="flex items-baseline gap-4">
                  <span
                    aria-hidden="true"
                    className="select-none font-display text-5xl font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(165,28,34,0.5)]"
                  >
                    03
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
                </div>
                <p className="mb-4 mt-5 text-sm uppercase tracking-widest text-primary-text">
                  How we work
                </p>
                <h2 className="font-display text-5xl font-bold text-gradient pb-1">
                  A clear process. Zero guesswork.
                </h2>
                <p className="mt-6 text-muted-foreground leading-relaxed">
                  From the first call to launch day, you'll always know what's happening, why, and
                  what's next. No black boxes, no surprise invoices.
                </p>
                {/* Dark branded panel (matches the process cards beside it) -
                    a washed-out photo looked out of place against them. */}
                <div className="relative mx-auto mt-10 hidden w-full max-w-xs lg:block">
                  <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-[60px]" />
                  <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#3a0b0d_0%,#1c0607_55%,#120405_100%)] p-6 ring-1 ring-white/10">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-3 -top-7 select-none font-display text-[6.5rem] font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.08)]"
                    >
                      ✓
                    </span>
                    <p className="relative text-xs font-bold uppercase tracking-widest text-[#f2545b]">
                      Every single week
                    </p>
                    <ul className="relative mt-4 space-y-4">
                      {[
                        "You know what's shipping",
                        "You know why it's prioritized",
                        "You see what it moved",
                      ].map((line) => (
                        <li
                          key={line}
                          className="flex items-start gap-2.5 border-b border-white/10 pb-4 text-sm font-medium text-white/85 last:border-b-0 last:pb-0"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#f2545b]" />
                          {line}
                        </li>
                      ))}
                    </ul>
                    <p className="relative mt-5 font-display text-2xl font-extrabold text-white">
                      2-4 weeks
                      <span className="mt-1 block text-[11px] font-semibold uppercase tracking-widest text-white/55">
                        Typical time to launch
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
            <div className="grid gap-5 sm:grid-cols-2">
              {PROCESS_STEPS.map((s, i) => (
                <Reveal key={s.t} delay={i * 0.08}>
                  <div
                    onMouseMove={trackWebSpotlight}
                    className="group relative h-full overflow-hidden rounded-3xl glass p-8 hover:bg-white/[0.06] transition"
                  >
                    <WebSpotlight />
                    <div className="font-display text-5xl font-bold text-gradient-brand">{s.n}</div>
                    <h3 className="mt-4 font-display text-xl font-semibold">{s.t}</h3>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <EditorialHeader
            className="mb-12"
            index="04"
            eyebrow="What we stand for"
            title="Core values that shape everything we build."
          />
          <CardGrid
            items={[
              {
                icon: Target,
                title: "Revenue obsessed",
                description:
                  "We measure success in booked jobs and revenue, not impressions, clicks or awards.",
              },
              {
                icon: Heart,
                title: "Senior team only",
                description:
                  "You talk directly to the people doing the work. No layers, no handoffs, no jargon.",
              },
              {
                icon: Zap,
                title: "Move fast, ship clean",
                description:
                  "Lean process, weekly iteration. We launch in weeks and optimize forever.",
              },
            ]}
          />
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <EditorialHeader
            className="mb-12"
            index="05"
            eyebrow="Why Ethixweb"
            title="Why clients choose us and stay."
          />

          <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.06}>
                <div
                  onMouseMove={trackWebSpotlight}
                  className="group relative h-full overflow-hidden rounded-3xl glass p-6 text-center"
                >
                  <WebSpotlight />
                  <p className="font-display text-5xl font-bold text-gradient-brand">{s.value}</p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div className="glass-strong rounded-[2rem] relative overflow-hidden p-8 sm:p-10 lg:p-12">
              <GlowBlob size="sm" color="primary" blur={100} className="-right-20 -top-20" />
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr] lg:items-center">
                <div className="grid gap-4 sm:grid-cols-2">
                  {REASONS.map((r) => (
                    <div
                      key={r}
                      className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3"
                    >
                      <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
                      <span className="text-sm text-foreground/85">{r}</span>
                    </div>
                  ))}
                </div>
                {/* Real client words instead of a stock photo - quote from the
                    Trustpilot set used in the Testimonials component. */}
                <div className="relative mx-auto hidden w-full max-w-xs lg:block">
                  <div className="absolute -inset-6 rounded-full bg-primary/15 blur-[80px]" />
                  <div className="relative rotate-[1.5deg] overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#3a0b0d_0%,#1c0607_55%,#120405_100%)] p-6 ring-1 ring-white/10">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-2 -top-10 select-none font-display text-[8rem] font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.08)]"
                    >
                      &rdquo;
                    </span>
                    <p className="relative font-display text-3xl font-extrabold text-white">
                      5.0 ★
                      <span className="mt-1 block text-[11px] font-semibold uppercase tracking-widest text-white/55">
                        Avg. client rating
                      </span>
                    </p>
                    <p className="relative mt-5 border-t border-white/10 pt-5 text-sm leading-relaxed text-white/80">
                      &ldquo;The team communicated clearly, worked efficiently, and delivered beyond
                      expectations.&rdquo;
                    </p>
                    <p className="relative mt-3 text-xs font-semibold uppercase tracking-widest text-[#f2545b]">
                      Kayla Kjl - verified client
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── The difference - this page's signature comparison block ──────── */}
      <section className="py-20">
        <Container size="medium">
          <EditorialHeader
            className="mb-12"
            index="06"
            eyebrow="The difference"
            title="Ethixweb vs. the typical agency."
          />
          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-3xl border border-border">
              {/* Header row (desktop) */}
              <div className="hidden border-b border-border bg-foreground/[0.03] text-xs font-bold uppercase tracking-widest sm:grid sm:grid-cols-[1fr_1.2fr_1.2fr]">
                <div className="p-4" />
                <div className="border-l border-primary/25 bg-primary/[0.05] p-4 text-primary-text">
                  Ethixweb
                </div>
                <div className="border-l border-border p-4 text-muted-foreground">
                  Typical agency
                </div>
              </div>
              {COMPARISON.map((row) => (
                <div
                  key={row.k}
                  className="grid border-b border-border text-sm last:border-b-0 sm:grid-cols-[1fr_1.2fr_1.2fr]"
                >
                  <div className="bg-foreground/[0.02] p-4 font-semibold sm:bg-transparent">
                    {row.k}
                  </div>
                  <div className="flex items-start gap-2.5 p-4 sm:border-l sm:border-primary/25 sm:bg-primary/[0.05]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>
                      <span className="mr-2 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-text sm:hidden">
                        Us
                      </span>
                      {row.us}
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5 p-4 text-muted-foreground sm:border-l sm:border-border">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                    <span>
                      <span className="mr-2 rounded bg-foreground/[0.06] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest sm:hidden">
                        Them
                      </span>
                      {row.them}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-16">
        <Container size="narrow">
          <Reveal>
            <div className="glass relative overflow-hidden rounded-3xl p-8 text-center shadow-glow ring-1 ring-primary/15 sm:p-10">
              <GlowBlob
                size="sm"
                color="primary"
                blur={90}
                className="left-1/2 top-0 -translate-x-1/2 opacity-70"
              />
              <div className="relative z-10">
                <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary-text">
                  US Business Entity
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Ethixweb operates in the United States through{" "}
                  <span className="font-semibold text-foreground">Ethixweb USA LLC</span>, a
                  Wyoming-registered company. When you work with us, you're contracting with a US
                  business entity, providing additional confidence, transparency, and accountability.
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

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
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-[16vw] font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.09)] lg:text-[9rem]"
            >
              SENIOR
            </span>
            <div className="relative mx-auto max-w-2xl">
              <h2 className="pb-1 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
                Ready for a sharper digital operation?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/75 sm:text-lg">
                Bring us the messy stack, missed leads, slow site, or stalled automation. We will
                turn it into a system.
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
                  See our work
                </Link>
              </div>
            </div>
          </Container>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
