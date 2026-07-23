import { lazy, Suspense, useEffect, useState } from "react";
import { jsonLdStringify } from "@/lib/json-ld";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Bot,
  BrainCircuit,
  Cable,
  Code2,
  Globe2,
  Layers3,
  LifeBuoy,
  Megaphone,
  Search,
  ShieldCheck,
  Workflow,
} from "lucide-react";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/shared/Reveal";
import { RotatingText } from "@/components/shared/RotatingText";
import { Testimonials } from "@/components/shared/Testimonials";
import { PipelineDiagram } from "@/components/home/PipelineDiagram";
import { Container } from "@/components/shared/Container";
import { GlowBlob } from "@/components/shared/GlowBlob";
import { HeroWebVisual } from "@/components/shared/HeroWebVisual";
import { SystemShift } from "@/components/home/SystemShift";
import { WebSpotlight } from "@/components/shared/WebSpotlight";
import { trackWebSpotlight } from "@/lib/web-spotlight";

const GlobalNetwork = lazy(() =>
  import("@/components/home/GlobalNetwork").then((m) => ({ default: m.GlobalNetwork })),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ethixweb - We run the tech. You run the business." },
      {
        name: "description",
        content:
          "We manage your digital operation, from AI booking agents and CRM integrations to websites, SEO and ads.",
      },
      { property: "og:title", content: "Ethixweb - Premium Technology Partner" },
      {
        property: "og:description",
        content:
          "AI automation, websites, web applications, CRM integrations, SEO, ads, maintenance, and digital operations.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://ethixweb.com/ethixweb.png" },
      { property: "og:url", content: "https://ethixweb.com/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Ethixweb - We run the tech. You run the business." },
      {
        name: "twitter:description",
        content:
          "We manage your digital operation, from AI booking agents and CRM integrations to websites, SEO and ads.",
      },
      { name: "twitter:image", content: "https://ethixweb.com/ethixweb.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://ethixweb.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLdStringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: "Ethixweb",
          url: "https://ethixweb.com",
          logo: "https://ethixweb.com/ethixweb.png",
          description: "AI automation, websites, CRM integrations, SEO, and digital operations.",
          email: "info@ethixweb.com",
          openingHours: "Mo-Fr 09:00-17:00",
          areaServed: "US",
          sameAs: [
            "https://www.linkedin.com/company/ethixweb/",
            "https://www.instagram.com/ethix.web/",
          ],
        }),
      },
    ],
  }),
  component: Home,
});

const services = [
  {
    icon: Bot,
    title: "AI Receptionists",
    desc: "Voice and chat agents that answer, qualify, route, and book leads while your team stays focused.",
    to: "/ai-automation",
  },
  {
    icon: BrainCircuit,
    title: "AI Automation",
    desc: "Workflow automation, internal copilots, data syncs, and operational systems built for real teams.",
    to: "/ai-automation",
  },
  {
    icon: Globe2,
    title: "Websites",
    desc: "Fast, premium websites with sharp positioning, conversion paths, analytics, and SEO foundations.",
    to: "/web-development",
  },
  {
    icon: Code2,
    title: "Web Applications",
    desc: "Custom portals, dashboards, booking flows, and software tools engineered for daily operations.",
    to: "/web-development",
  },
  {
    icon: Cable,
    title: "CRM Integrations",
    desc: "HubSpot, GoHighLevel, Zapier, forms, calls, calendars, and pipelines connected into one system.",
    to: "/services",
  },
  {
    icon: Search,
    title: "SEO",
    desc: "Technical SEO, local SEO, content systems, and measurement that compound into durable demand.",
    to: "/services",
  },
  {
    icon: LifeBuoy,
    title: "Maintenance & Support",
    desc: "Fast fixes, uptime care, site updates, reporting, and a responsive team when something needs attention.",
    to: "/services",
  },
  {
    icon: Workflow,
    title: "Digital Operations",
    desc: "A senior tech team for your digital stack, from strategy through launch, support, and optimization.",
    to: "/services",
  },
];

const metrics = [
  { value: "24/7", label: "global coverage", desc: "Always on call, wherever you're located." },
  { value: "<1h", label: "support response", desc: "Quick answers from a real support team." },
  { value: "US", label: "operations focus", desc: "United States of America, our home base." },
  { value: "AI", label: "automation ready", desc: "Set up for AI-driven tools and workflows." },
];

const stack = ["AI agents", "CRM", "Websites", "SEO", "Ads", "Analytics", "Automations", "Support"];

function Home() {
  return (
    <SiteLayout>
      {/* One continuous hero background behind the whole page so the sections
          below share the hero's tint instead of the flat page background.
          The -mt-24 that used to sit on <Hero> lives here now so the gradient
          starts under the navbar. */}
      <div className="relative -mt-24 bg-gradient-hero">
        <Hero />
        <SignalStrip />
        <Services />
        <Suspense fallback={null}>
          <GlobalNetwork />
        </Suspense>
        <Testimonials />
        <OperatingSystem />
        <Proof />
        <CTA />
      </div>
    </SiteLayout>
  );
}

/** Below lg, HeroWebVisual becomes a low-opacity backdrop sitting behind the
 * text (see Hero below) instead of its own side-by-side column - the value-
 * prop badges ("More booked jobs" etc.) are only meant to float in open space
 * next to the text, not overlap on top of it, so they're hidden in that mode
 * and only shown once a desktop-width (lg) viewport is confirmed. Defaults to
 * false so mobile (the more common first paint) never flashes overlapping
 * badges before this can check; a brief absence of badges on desktop before
 * hydration confirms the width is the safer direction to default. */
function useShowHeroBadges() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setShow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return show;
}

function Hero() {
  const showBadges = useShowHeroBadges();
  return (
    <section className="relative overflow-hidden pb-4 pt-20 sm:pb-28 sm:pt-36 lg:pt-40">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <GlowBlob
        size="md"
        color="primary"
        blur={140}
        className="left-1/2 top-0 -translate-x-1/2 opacity-60"
      />

      <Container className="relative grid items-center gap-14 pt-4 sm:pt-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative z-10">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_18px_rgba(138,24,28,0.9)]" />
              Premium digital operations team
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-7 max-w-5xl pb-2 text-[clamp(2.61rem,6.34vw,6.16rem)] font-extrabold leading-[0.9] text-gradient">
              We run the{" "}
              <span className="tech-3d relative inline-block" data-text="tech.">
                tech.
              </span>
              <br />
              You run the{" "}
              <span
                className="accent-shimmer relative inline-block bg-clip-text text-transparent"
                data-text="business."
                style={{
                  backgroundImage: "linear-gradient(135deg, #D13A40 0%, #B32228 50%, #8A181C 100%)",
                }}
              >
                business.
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-7 max-w-2xl text-lg font-medium leading-8 text-foreground/75 sm:text-xl">
              We manage your digital operation, from AI booking agents and CRM integrations to
              websites, SEO and ads.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/contact"
                className="btn-primary group inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-bold"
              >
                Start a project
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <div
                aria-disabled="true"
                title="Coming soon"
                className="btn-secondary inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-bold opacity-60 cursor-not-allowed select-none"
              >
                See our work
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          </Reveal>
        </div>

        {/* Below lg, this becomes a low-opacity full-bleed backdrop sitting behind
         * the text (one cohesive block) instead of a separate stacked section -
         * at lg: and up it reverts to the original side-by-side grid column. */}
        <Reveal delay={0.18}>
          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-25 lg:pointer-events-auto lg:static lg:opacity-100 lg:-ml-8">
            <HeroWebVisual showBadges={showBadges} />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function SignalStrip() {
  return (
    <div className="signal-strip overflow-hidden border-y py-7">
      <div className="flex gap-14 whitespace-nowrap animate-marquee">
        {[...stack, ...stack, ...stack].map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex items-center gap-14 text-xl font-extrabold uppercase tracking-[0.32em] text-muted-foreground/70"
          >
            {item}
            <span className="h-2 w-2 rounded-full bg-primary" />
          </span>
        ))}
      </div>
    </div>
  );
}

function Services() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <GlowBlob size="lg" color="brand" blur={160} className="left-0 top-1/4 opacity-70" />
      <Container className="relative">
        <Reveal>
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-primary-text">
              Robust Solutions
            </p>
            <h2 className="pb-1 text-6xl font-extrabold leading-tight text-gradient">
              Senior operators for the systems that grow the{" "}
              <RotatingText
                texts={["business.", "growth.", "revenue.", "pipeline."]}
                mainClassName="align-bottom"
                elementLevelClassName="text-primary"
                rotationInterval={3500}
                transition={{ type: "spring", damping: 28, stiffness: 380 }}
              />
            </h2>
          </div>
        </Reveal>
        <div className="mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service, index) => (
            <Reveal key={service.title} delay={index * 0.04}>
              <div className="relative h-full">
                <div
                  onMouseMove={trackWebSpotlight}
                  className="group premium-card relative h-full overflow-hidden rounded-2xl p-7 cursor-default"
                >
                  <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-primary/0 blur-3xl" />
                  <WebSpotlight />
                  <service.icon className="h-7 w-7 text-primary/60" strokeWidth={1.7} />
                  <h3 className="mt-7 text-xl font-bold text-foreground">{service.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-foreground/75">{service.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

const OS_ROWS = [
  {
    icon: ShieldCheck,
    title: "Trustworthy systems",
    desc: "Clean architecture, secure defaults, and reliable handoff across your stack.",
  },
  {
    icon: Layers3,
    title: "Layered execution",
    desc: "Strategy, design, development, automation, launch, and support under one roof.",
  },
  {
    icon: Megaphone,
    title: "Growth connected",
    desc: "SEO, ads, analytics, forms, calls, and CRM data aligned around revenue.",
  },
];

function OperatingSystem() {
  return (
    <section className="py-12 sm:py-20">
      <Container>
        <Reveal>
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-primary-text">
              Operating model
            </p>
            <h2 className="pb-1 text-6xl font-extrabold leading-tight text-gradient">
              Built like an internal technology team.
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Ethixweb brings software, automation, marketing operations, and support into one
              disciplined delivery system.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-16">
            <PipelineDiagram stages={OS_ROWS} />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function Proof() {
  return (
    <section className="py-10 sm:py-20">
      <Container className="grid grid-cols-2 items-stretch gap-5 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Reveal key={metric.label} delay={index * 0.05} className="h-full">
            <div className="premium-card web-card metric-flip rounded-2xl p-4 sm:p-6 text-center h-full flex flex-col items-center justify-center transition hover:bg-white/6">
              <div className="metric-flip-inner relative w-full">
                <div className="metric-flip-face flex flex-col items-center justify-center">
                  <div className="text-xl sm:text-4xl font-extrabold text-gradient whitespace-nowrap">
                    {metric.value}
                  </div>
                  <div className="mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {metric.label}
                  </div>
                </div>
                <div className="metric-flip-face metric-flip-back absolute inset-0 flex items-center justify-center px-2">
                  <p className="text-xs sm:text-sm font-semibold leading-snug text-foreground/90">
                    {metric.desc}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </Container>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-12 sm:py-24">
      <Reveal>
        <Container className="relative overflow-hidden rounded-4xl bg-card shadow-lg lg:aspect-25/12">
          <div className="grid grid-cols-1 items-center gap-8 px-8 py-14 sm:px-12 sm:py-16 lg:h-full lg:grid-cols-[1.13fr_1fr] lg:items-stretch lg:gap-2 lg:px-0 lg:py-0">
            <div className="relative z-10 flex flex-col justify-center text-center lg:pl-20 lg:pr-6 lg:text-left">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-primary-text sm:text-sm">
                Robust Solutions
              </p>
              <h2 className="mt-4 font-display text-[2.75rem] font-extrabold leading-[1.05] tracking-tight text-card-foreground sm:text-6xl lg:text-[5rem]">
                Want to work
                <br />
                with <span className="text-primary">us?</span>
              </h2>
              <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl lg:text-xl lg:mx-0">
                Tired of being account #200 at a big agency? Work with a senior team that knows your
                business by name.
              </p>
              <Link
                to="/contact"
                className="btn-primary mt-9 inline-flex items-center gap-2 rounded-full px-8 py-4 font-bold"
              >
                Get in touch <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative mx-auto h-[340px] w-full max-w-[340px] overflow-hidden sm:h-[400px] sm:max-w-[420px] lg:h-full lg:max-w-none">
              <SystemShift />
            </div>
          </div>
        </Container>
      </Reveal>
    </section>
  );
}
