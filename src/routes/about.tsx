import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import {
  Target,
  Heart,
  Zap,
  ArrowUpRight,
  Globe2,
  ShieldCheck,
  Workflow,
  Compass,
  Eye,
  CheckCircle2,
} from "lucide-react";
import operatorCharacter from "@/assets/operator-character.webp";

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
      { name: "twitter:description", content: "Our story, how we work and why home service contractors trust us." },
      { name: "twitter:image", content: "https://ethixweb.com/ethixweb.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://ethixweb.com/about" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About Ethixweb",
          url: "https://ethixweb.com/about",
          description: "Ethixweb is a small, senior team helping US home service contractors grow with marketing that moves revenue.",
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
    d: "We dig into your business, customers, and competitors to build a plan focused on revenue - not vanity metrics.",
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

const REASONS = [
  "Direct access to senior developers & strategists",
  "Transparent pricing - no hidden retainers",
  "Decisions backed by data, not guesswork",
  "Fast turnarounds without cutting corners",
  "Ongoing support after launch",
  "US focused communication & operations",
];

function About() {
  const reduceMotion = useReducedMotion();
  return (
    <SiteLayout>
      <PageHero
        eyebrow="About us"
        title={
          <>
            A small, senior team. No account{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #D13A40 0%, #B32228 50%, #8A181C 100%)",
              }}
            >
              managers.
            </span>
          </>
        }
      >
        <span className="light:text-foreground">
          Ethixweb is a digital marketing &amp; web development agency built for businesses that
          want measurable growth - not marketing noise.
        </span>
      </PageHero>

      <section className="relative px-6 py-20">
        <div className="pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/[0.05] blur-[120px]" />
        <div className="relative mx-auto max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <motion.div
              className="relative mx-auto max-w-80"
              animate={{ y: reduceMotion ? 0 : [0, -10, 0] }}
              transition={reduceMotion ? { duration: 0 } : { duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-6 rounded-full bg-primary/[0.14] blur-[90px]" />
              <div className="relative aspect-320/468 sm:h-117 sm:aspect-auto">
                <img
                  src={operatorCharacter}
                  alt="Ethixweb team"
                  width={1024}
                  height={1536}
                  loading="lazy"
                  decoding="async"
                  className="absolute bottom-0 left-1/2 z-10 h-[96%] sm:h-112.5 max-w-none -translate-x-1/2 object-contain drop-shadow-[0_16px_36px_rgba(0,0,0,0.4)]"
                />
                {[
                  { label: "US Focused Ops", icon: Globe2, style: { top: "8%", left: "4%" } },
                  { label: "Senior Team", icon: ShieldCheck, style: { top: "42%", left: "2%" } },
                  {
                    label: "Strategy to Launch",
                    icon: Workflow,
                    style: { bottom: "8%", left: "16%" },
                  },
                ].map((badge, i) => (
                  <motion.div
                    key={badge.label}
                    className="absolute z-20 flex items-center gap-1.5 rounded-xl border border-white/6 bg-[#15131c]/55 px-2.5 py-1 shadow-[0_4px_16px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-300 hover:border-primary/25 hover:shadow-[0_4px_18px_rgba(192,39,45,0.2)]"
                    style={badge.style}
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, type: "spring", stiffness: 280, damping: 20 }}
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/12">
                      <badge.icon className="h-2.5 w-2.5 text-primary" />
                    </span>
                    <span className="whitespace-nowrap text-xs font-semibold text-white/90">
                      {badge.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="max-w-xl">
              <p className="text-sm uppercase tracking-widest text-primary">Our story</p>
              <h2 className="mt-5 font-display text-4xl font-bold leading-[1.15] tracking-tight text-gradient pb-1">
                Built for contractors tired of big agency theater.
              </h2>
              <p className="mt-7 text-muted-foreground leading-relaxed">
                We started Ethixweb because we were tired of watching good businesses get
                mediocre results from agencies that overpromise and underdeliver.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                We're a tight knit team of developers, designers, and strategists, each senior
                in their craft. When you work with Ethixweb, you work directly with the people
                building your project. No account managers passing messages. No juniors learning
                on your budget.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-4 text-sm uppercase tracking-widest text-primary">What drives us</p>
              <h2 className="font-display text-4xl font-bold text-gradient lg:text-5xl pb-1">
                Mission &amp; vision
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2">
            <Reveal delay={0.05}>
              <div className="glass rounded-3xl p-8 h-full lg:p-10">
                <Compass className="h-10 w-10 text-primary mb-6" strokeWidth={1.5} />
                <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
                  Our mission
                </p>
                <h3 className="font-display text-2xl font-semibold">
                  Turn marketing spend into measurable revenue.
                </h3>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Every project we take on is judged the same way: did it move the needle on
                  bookings, leads, and revenue? We build websites and systems that earn their
                  place in your budget.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="glass rounded-3xl p-8 h-full lg:p-10">
                <Eye className="h-10 w-10 text-primary mb-6" strokeWidth={1.5} />
                <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
                  Our vision
                </p>
                <h3 className="font-display text-2xl font-semibold">
                  The senior team contractors call first.
                </h3>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  We're building Ethixweb into the go to growth partner for home service
                  businesses - known for senior craftsmanship, straight talk, and results you
                  can point to.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:items-start">
            <Reveal>
              <div>
                <p className="mb-4 text-sm uppercase tracking-widest text-primary">How we work</p>
                <h2 className="font-display text-4xl font-bold text-gradient lg:text-5xl pb-1">
                  A clear process. Zero guesswork.
                </h2>
                <p className="mt-6 text-muted-foreground leading-relaxed">
                  From the first call to launch day, you'll always know what's happening, why,
                  and what's next. No black boxes, no surprise invoices.
                </p>
                <div className="relative mx-auto mt-10 hidden h-64 w-full max-w-xs lg:block">
                  <div className="absolute inset-8 rounded-full bg-primary/15 blur-[80px]" />
                  <img
                    src="/Ethan%20view%207.webp"
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className="relative mx-auto h-64 w-auto object-contain drop-shadow-[0_16px_36px_rgba(0,0,0,0.35)]"
                  />
                </div>
              </div>
            </Reveal>
            <div className="grid gap-5 sm:grid-cols-2">
              {PROCESS_STEPS.map((s, i) => (
                <Reveal key={s.t} delay={i * 0.08}>
                  <div className="glass rounded-3xl p-8 h-full hover:bg-white/[0.06] transition">
                    <div className="font-display text-5xl font-bold text-gradient-brand">
                      {s.n}
                    </div>
                    <h3 className="mt-4 font-display text-xl font-semibold">{s.t}</h3>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-4 text-sm uppercase tracking-widest text-primary">
                What we stand for
              </p>
              <h2 className="font-display text-4xl font-bold text-gradient lg:text-5xl pb-1">
                Core values that shape everything we build.
              </h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: Target,
                t: "Revenue obsessed",
                d: "We measure success in booked jobs and revenue - not impressions, clicks or awards.",
              },
              {
                icon: Heart,
                t: "Senior team only",
                d: "You talk directly to the people doing the work. No layers, no handoffs, no jargon.",
              },
              {
                icon: Zap,
                t: "Move fast, ship clean",
                d: "Lean process, weekly iteration. We launch in weeks and optimize forever.",
              },
            ].map((v, i) => (
              <Reveal key={v.t} delay={i * 0.08}>
                <div className="glass rounded-3xl p-8 h-full">
                  <v.icon className="h-10 w-10 text-primary mb-6" strokeWidth={1.5} />
                  <h3 className="font-display text-xl font-semibold">{v.t}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{v.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-4 text-sm uppercase tracking-widest text-primary">Why Ethixweb</p>
              <h2 className="font-display text-4xl font-bold text-gradient lg:text-5xl pb-1">
                Why clients choose us - and stay.
              </h2>
            </div>
          </Reveal>

          <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.06}>
                <div className="glass rounded-3xl p-6 h-full text-center">
                  <p className="font-display text-4xl font-bold text-gradient-brand lg:text-5xl">
                    {s.value}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div className="glass-strong rounded-[2rem] relative overflow-hidden p-10 lg:p-12">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
              <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-center">
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
                <div className="relative mx-auto hidden h-64 w-full max-w-xs lg:block">
                  <div className="absolute inset-8 rounded-full bg-primary/15 blur-[80px]" />
                  <img
                    src="/Ethan%20view%2011.webp"
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className="relative mx-auto h-64 w-auto object-contain drop-shadow-[0_16px_36px_rgba(0,0,0,0.35)]"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="premium-card relative overflow-hidden rounded-4xl px-6 py-16 text-center sm:px-12 lg:py-24">
            <div className="absolute inset-0 ambient-red opacity-80" />
            <div className="absolute inset-0 grid-bg opacity-30" />
            <Reveal>
              <div className="relative mx-auto max-w-3xl">
                <h2 className="pb-1 text-4xl font-extrabold leading-tight text-gradient lg:text-7xl">
                  Ready for a sharper digital operation?
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                  Bring us the messy stack, missed leads, slow site, or stalled automation. We will
                  turn it into a system.
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-4">
                  <Link
                    to="/contact"
                    className="magnetic group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-bold text-primary-foreground shadow-glow"
                  >
                    Start a project
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                  </Link>
                  <Link
                    to="/portfolio"
                    className="magnetic inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4.5 px-7 py-3.5 font-bold text-foreground hover:border-primary/40 hover:bg-primary/10"
                  >
                    See our work
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
