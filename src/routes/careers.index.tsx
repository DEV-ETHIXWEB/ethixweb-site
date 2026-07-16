import { createFileRoute, Link } from "@tanstack/react-router";
import { jsonLdStringify } from "@/lib/json-ld";
import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { Container } from "@/components/Container";
import { GlowBlob } from "@/components/GlowBlob";
import { HeroWebVisual } from "@/components/HeroWebVisual";
import { MarqueeBand } from "@/components/MarqueeBand";
import { RotatingText } from "@/components/RotatingText";
import { JobCard } from "@/components/careers/JobCard";
import { JOBS, HIRING_PROCESS } from "@/lib/careers-data";
import {
  ArrowUpRight,
  Globe2,
  Handshake,
  Sparkles,
  Code2,
  GraduationCap,
  Rocket,
  Bot,
  TrendingUp,
  Target,
  Telescope,
  Flag,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/careers/")({
  head: () => ({
    meta: [
      { title: "Careers - Ethixweb" },
      {
        name: "description",
        content:
          "Join Ethixweb, a small, remote first team building websites, AI automation, SEO and software for US businesses. Open roles in engineering and SEO.",
      },
      { property: "og:title", content: "Careers at Ethixweb" },
      { property: "og:description", content: "Open roles at a remote first, senior led team." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://ethixweb.com/ethixweb.png" },
      { property: "og:url", content: "https://ethixweb.com/careers" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Careers at Ethixweb" },
      {
        name: "twitter:description",
        content:
          "Join Ethixweb, a small, remote first team building websites, AI automation, SEO and software for US businesses.",
      },
      { name: "twitter:image", content: "https://ethixweb.com/ethixweb.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://ethixweb.com/careers" }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLdStringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Open roles at Ethixweb",
          itemListElement: JOBS.map((job, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `https://ethixweb.com/careers/${job.slug}`,
            item: {
              "@type": "JobPosting",
              title: job.title,
              description: job.about,
              datePosted: job.datePosted,
              employmentType: "FULL_TIME",
              hiringOrganization: {
                "@type": "Organization",
                name: "Ethixweb",
                sameAs: "https://ethixweb.com",
                logo: "https://ethixweb.com/ethixweb.png",
              },
              jobLocationType: "TELECOMMUTE",
              applicantLocationRequirements: { "@type": "Country", name: "India" },
            },
          })),
        }),
      },
    ],
  }),
  component: Careers,
});

// Life-at-Ethixweb bento tiles. `modern-engineering-stack.webp` is an actual
// screenshot of this repo's own JobCard.tsx; the rest are free-to-use,
// no-attribution-required photos (Pexels license) chosen to match each value.
// Swap any of these for real Ethixweb photos/screenshots whenever they're
// available. `wide` drives the bento column spans: rows read as
// [2+1+1], [1+1+2], [2+2] on desktop.
const LIFE_VALUES = [
  {
    icon: Rocket,
    t: "Real Client Impact",
    d: "Work directly on projects used by real US businesses.",
    image: "/images/careers/real-client-impact.webp",
    alt: "Team reviewing a client project together around a laptop",
    wide: true,
  },
  {
    icon: Code2,
    t: "Modern Engineering Stack",
    d: "React, Node.js, TypeScript, AI tools and modern workflows.",
    image: "/images/careers/modern-engineering-stack.webp",
    alt: "Code editor showing a real React component from the Ethixweb codebase",
    wide: false,
  },
  {
    icon: Bot,
    t: "AI First Workflow",
    d: "AI assisted planning, development, testing and productivity.",
    image: "/images/careers/ai-first-workflow.webp",
    alt: "Abstract visualization of an AI neural network",
    wide: false,
  },
  {
    icon: Target,
    t: "Ownership & Responsibility",
    d: "Own complete features and projects from idea to deployment.",
    image: "/images/careers/ownership-responsibility.webp",
    alt: "Person focused on their laptop at a shared workspace",
    wide: false,
  },
  {
    icon: TrendingUp,
    t: "Fast Career Growth",
    d: "Small team, bigger responsibility and faster career progression.",
    image: "/images/careers/fast-career-growth.webp",
    alt: "Person presenting an upward-trending growth chart",
    wide: false,
  },
  {
    icon: Globe2,
    t: "Flexible Remote Work",
    d: "Work from anywhere in India with an async first culture built on trust and ownership.",
    image: "/images/careers/flexible-remote-work.webp",
    alt: "Laptop screen showing a remote team video call",
    wide: true,
  },
  {
    icon: Handshake,
    t: "Direct Collaboration",
    d: "Work closely with founders and US clients, no unnecessary layers.",
    image: "/images/careers/direct-collaboration.webp",
    alt: "Team gathered around a table collaborating together",
    wide: true,
  },
  {
    icon: GraduationCap,
    t: "Continuous Learning",
    d: "Regular mentorship and exposure to new tools and technologies.",
    image: "/images/careers/continuous-learning.webp",
    alt: "Person studying with books and a laptop",
    wide: true,
  },
];

// Ticker content for the rotated marquee band under the hero. Short,
// scannable claims only - it's set dressing, not documentation.
const MARQUEE_ITEMS = [
  "We're hiring",
  "React",
  "TypeScript",
  "Node.js",
  "Technical SEO",
  "AI-first workflow",
  "Remote · India",
  "US clients",
  "Flexible hours",
];

// "What we value" cards inside the founder-note section.
const CULTURE_VALUES = [
  {
    icon: Telescope,
    t: "Relentless Curiosity",
    d: "We hire people who constantly ask questions, explore new technologies, and never stop learning. Curiosity is one of the most valuable qualities we look for.",
  },
  {
    icon: Flag,
    t: "Ownership",
    d: "When you see a problem, take ownership. Great ideas can come from anyone regardless of experience or job title.",
  },
  {
    icon: TrendingUp,
    t: "Continuous Growth",
    d: "Every project is an opportunity to improve. We care more about your willingness to learn than pretending to know everything.",
  },
  {
    icon: Users,
    t: "Team First",
    d: "We believe the best work happens when talented people trust each other, share knowledge, and solve problems together.",
  },
];

// Brand-crimson emphasis inside the founder note. The section is forced-dark
// in both themes, so this is a hand-lightened tint of the brand primary that
// stays readable on the near-black background (raw primary is too dark there
// in light theme).
function Hl({ children }: { children: ReactNode }) {
  return <span className="font-semibold text-[#f2545b]">{children}</span>;
}

// Scroll-linked reading spotlight for the founder note: each line sits
// ghosted at ~12% opacity and brightens to full as it crosses the lower
// half of the viewport, so the letter reads itself out line by line as
// you scroll instead of appearing as one wall of text.
function ManifestoLine({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.92", "start 0.55"] });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.12, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [18, 0]);
  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div ref={ref} style={{ opacity, y }} className={className}>
      {children}
    </motion.div>
  );
}

// Full-bleed bento tile: the photo IS the card, with a cinematic scrim, a
// crimson wash + zoom on hover, and a description that slides up under the
// title. On touch/small layouts the description is always visible (there is
// no hover); the slide-up reveal only applies from lg up.
function LifeTile({ item, index }: { item: (typeof LIFE_VALUES)[number]; index: number }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative h-64 overflow-hidden rounded-3xl ring-1 ring-white/10 sm:h-72 lg:h-80"
    >
      <img
        src={item.image}
        alt={item.alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
      />
      {/* Readability scrim + crimson hover wash */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
      <div className="absolute inset-0 bg-[#8a181c]/0 transition-colors duration-500 group-hover:bg-[#8a181c]/25" />

      <span className="absolute left-5 top-5 flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-glow ring-1 ring-white/20">
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
        <item.icon className="relative h-5 w-5" strokeWidth={2} />
      </span>
      <span
        aria-hidden="true"
        className="absolute right-5 top-5 text-xs font-bold tracking-[0.2em] text-white/50"
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <h3 className="font-display text-lg font-semibold text-white sm:text-xl">{item.t}</h3>
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/75 transition-all duration-300 lg:mt-0 lg:max-h-0 lg:translate-y-2 lg:opacity-0 lg:group-hover:mt-1.5 lg:group-hover:max-h-24 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
          {item.d}
        </p>
      </div>
    </motion.div>
  );
}

// Editorial section header: big outlined index number + hairline, then the
// eyebrow/title/sub stack, all left-aligned - breaks the centered-header
// monotony the page had when every section used the same centered stack.
function SectionHeader({
  index,
  eyebrow,
  title,
  sub,
  className = "",
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  sub?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Reveal>
        <div className="flex items-baseline gap-5">
          <span
            aria-hidden="true"
            className="select-none font-display text-6xl font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(165,28,34,0.5)] sm:text-7xl"
          >
            {index}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="mt-6 text-sm uppercase tracking-widest text-primary-text">{eyebrow}</p>
      </Reveal>
      <Reveal delay={0.14}>
        <h2 className="mt-3 max-w-3xl pb-1 font-display text-4xl font-bold text-gradient sm:text-5xl">
          {title}
        </h2>
      </Reveal>
      {sub ? (
        <Reveal delay={0.2}>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{sub}</p>
        </Reveal>
      ) : null}
    </div>
  );
}

function Careers() {
  const reduceMotion = useReducedMotion();

  // Scroll-linked fill for the hiring-process timeline: the crimson line
  // grows as the steps scroll through the middle of the viewport.
  const processRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: processRef,
    offset: ["start 0.8", "end 0.55"],
  });

  return (
    <SiteLayout>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative -mt-24 overflow-hidden bg-gradient-hero pb-20 pt-36 sm:pb-28 sm:pt-44">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <GlowBlob
          size="lg"
          color="primary"
          blur={100}
          className="left-1/2 top-0 -translate-x-1/2"
        />
        <div className="pointer-events-none absolute inset-x-0 top-32 mx-auto w-full max-w-5xl scale-110 opacity-15">
          <HeroWebVisual showBadges={false} />
        </div>

        <Container className="relative flex flex-col items-center text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_18px_rgba(138,24,28,0.9)]" />
              We&apos;re hiring - {JOBS.length} open role{JOBS.length === 1 ? "" : "s"}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-7 max-w-4xl pb-1 text-[clamp(2.6rem,6vw,5.25rem)] font-extrabold leading-[1.03] text-gradient">
              Join the team that&apos;s building the future of{" "}
              {/* Stay on mode="wait" (the default): any overlapping mode
                  renders both words superimposed mid-swap - a double-exposure
                  mess at headline size (tried popLayout, reverted). The
                  smoothness instead comes from a short, soft tween over a
                  small travel distance, so the wait gap is imperceptible. */}
              <RotatingText
                texts={[
                  "digital operations.",
                  "AI automation.",
                  "modern websites.",
                  "technical SEO.",
                ]}
                mainClassName="align-bottom"
                elementLevelClassName="text-primary"
                rotationInterval={3500}
                initial={{ y: "35%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-35%", opacity: 0 }}
                transition={{ duration: 0.32, ease: "easeOut" }}
              />
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-7 max-w-xl text-lg leading-8 text-muted-foreground">
              We&apos;re a small, remote first team helping US businesses grow through modern
              websites, AI automation, SEO, and software engineering.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href="#open-positions"
                className="magnetic group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-bold text-primary-foreground shadow-glow"
              >
                View Open Positions
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
              </a>
              <a
                href="#hiring-process"
                className="magnetic inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4.5 px-7 py-3.5 font-bold text-foreground hover:border-primary/40 hover:bg-primary/10"
              >
                How we hire
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-12 flex flex-wrap items-start justify-center gap-y-6">
              {[
                { value: String(JOBS.length).padStart(2, "0"), label: "Open roles" },
                { value: "~2 wks", label: "Application to offer" },
                { value: "100%", label: "Remote · India" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`flex flex-col items-center px-8 sm:px-12 ${
                    i > 0 ? "sm:border-l sm:border-border" : ""
                  }`}
                >
                  <span className="font-display text-3xl font-extrabold text-gradient sm:text-4xl">
                    {stat.value}
                  </span>
                  <span className="mt-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.36}>
            {/* The link itself stays stationary (a perpetually-moving click
                target is hostile to users and to automation alike) - only the
                scroll dot inside it bounces. */}
            <a
              href="#open-positions"
              aria-label="Scroll to open roles"
              className="mt-14 flex h-10 w-6 items-start justify-center rounded-full border border-foreground/25 p-1.5 transition-colors hover:border-primary/50"
            >
              <motion.span
                className="h-2 w-1 rounded-full bg-primary"
                animate={reduceMotion ? undefined : { y: [0, 10, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </a>
          </Reveal>
        </Container>
      </section>

      <MarqueeBand items={MARQUEE_ITEMS} />

      {/* ── Open positions ───────────────────────────────────────────────────
          First section after the hero on purpose: candidates come to a careers
          page to see what's in it for them, so the hierarchy is open roles →
          how we hire → life at Ethixweb. */}
      <section id="open-positions" className="scroll-mt-24 pb-24 pt-24">
        <Container>
          <SectionHeader
            className="mb-12 lg:mb-16"
            index="01"
            eyebrow="Open positions"
            title={
              <>
                Roles we&apos;re hiring for <span className="whitespace-nowrap">right now.</span>
              </>
            }
            sub="Every role is full time, remote within India, and works directly with US clients - no layers in between."
          />
          <div className="flex flex-col gap-6">
            {JOBS.map((job, i) => (
              <Reveal key={job.id} delay={i * 0.08}>
                <JobCard job={job} />
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}>
            <p className="mt-8 text-sm text-muted-foreground">
              Applications are reviewed within 2-3 business days.{" "}
              <Link
                to="/careers/apply"
                search={{ role: "general" }}
                className="font-semibold text-primary-text underline-offset-4 hover:underline"
              >
                Not seeing your role? Apply generally
              </Link>
            </p>
          </Reveal>
        </Container>
      </section>

      {/* ── Hiring process timeline ──────────────────────────────────────── */}
      <section id="hiring-process" className="scroll-mt-24 py-24">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1fr_1.35fr] lg:gap-20">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <SectionHeader
                index="02"
                eyebrow="Hiring process"
                title="A clear path from application to offer."
                sub={
                  <>
                    No take-home marathons, no whiteboard trivia - most candidates go from
                    application to offer{" "}
                    <span className="font-semibold text-foreground">within two weeks</span>.
                  </>
                }
              />
              <Reveal delay={0.25}>
                <a
                  href="#open-positions"
                  className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4.5 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10"
                >
                  Browse open roles
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Reveal>
            </div>

            <div ref={processRef} className="relative">
              {/* Faint full-height rail + scroll-driven crimson fill */}
              <div
                aria-hidden="true"
                className="absolute bottom-3 left-[15.5px] top-3 w-px bg-primary/15"
              />
              <motion.div
                aria-hidden="true"
                className="absolute bottom-3 left-[15.5px] top-3 w-px origin-top bg-primary shadow-glow"
                style={{ scaleY: scrollYProgress }}
              />
              <ol className="space-y-11">
                {HIRING_PROCESS.map((step, i) => (
                  <Reveal as="li" key={step.title} delay={i * 0.05} className="relative pl-14">
                    <span className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white shadow-glow ring-4 ring-background">
                      {i + 1}
                    </span>
                    <h3 className="font-display text-xl font-semibold">{step.title}</h3>
                    <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Life at Ethixweb ─────────────────────────────────────────────── */}
      <section id="life-at-ethixweb" className="scroll-mt-24 py-24">
        <Container>
          <SectionHeader
            className="mb-12 lg:mb-16"
            index="03"
            eyebrow="Life at Ethixweb"
            title="Built for people who like to build."
            sub="The day-to-day, not the mission statement."
          />
          {/* Bento mosaic: full-bleed photo tiles with overlay text. Column
              spans come from each tile's `wide` flag so desktop reads as
              [2+1+1], [1+1+2], [2+2]. */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {LIFE_VALUES.map((item, i) => (
              <Reveal
                key={item.t}
                delay={(i % 4) * 0.06}
                className={item.wide ? "sm:col-span-2" : "sm:col-span-1"}
              >
                <LifeTile item={item} index={i} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Who thrives at Ethixweb - founder note ───────────────────────────
          Forced-dark in both themes on purpose: it's the one section that
          should read like a letter, not a landing page. All colors in here
          are hardcoded against the near-black background - theme tokens
          would flip illegible in light mode. */}
      <section
        id="who-thrives"
        className="relative scroll-mt-24 overflow-hidden border-y border-white/5 bg-[#120506] py-28 sm:py-32"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(138,24,28,0.32),transparent_70%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(45%_40%_at_88%_95%,rgba(138,24,28,0.22),transparent_70%)]"
        />
        <div className="absolute inset-0 grid-bg opacity-15" />

        <Container className="relative">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <div className="flex items-baseline gap-5">
                <span
                  aria-hidden="true"
                  className="select-none font-display text-6xl font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(242,84,91,0.4)] sm:text-7xl"
                >
                  04
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-[#f2545b]/40 to-transparent" />
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-6 text-sm uppercase tracking-widest text-[#f2545b]">
                Who thrives at Ethixweb
              </p>
            </Reveal>
            <Reveal delay={0.14}>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-[2.75rem] sm:leading-[1.15]">
                If your favorite part of the day is watching the clock hit{" "}
                <span className="text-[#f2545b]">5:00 PM</span>, we might not be your people.
              </h2>
            </Reveal>

            {/* Glowing accent line - a soft pulse of light travels it on loop */}
            <Reveal delay={0.2}>
              <div className="relative mt-9 h-px w-full max-w-md overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#f2545b]/50 via-white/15 to-transparent" />
                {!reduceMotion && (
                  <motion.div
                    className="absolute top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-[#ff8a8f] to-transparent"
                    animate={{ left: ["-33%", "100%"] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </div>
            </Reveal>

            <ManifestoLine className="mt-9">
              <p className="text-xl font-semibold leading-relaxed text-white sm:text-2xl">
                If your favorite part is solving one more interesting problem before logging
                off - keep reading.
              </p>
            </ManifestoLine>

            <div className="mt-8 space-y-6 text-lg leading-8 text-white/70">
              <ManifestoLine>
                <p>
                  We are building a team of <Hl>relentlessly curious</Hl> people. People who
                  learn because they genuinely enjoy learning, not because someone asked them
                  to.
                </p>
              </ManifestoLine>
              <ManifestoLine>
                <p>
                  We value <Hl>ownership over titles</Hl>, <Hl>initiative over instructions</Hl>
                  , and the confidence to respectfully question ideas - including our own.
                </p>
              </ManifestoLine>
              <ManifestoLine>
                <p>
                  Technology moves fast. We expect our team to move faster - by staying
                  curious, continuously learning, experimenting, and always striving to become{" "}
                  <Hl>a little better than yesterday</Hl>.
                </p>
              </ManifestoLine>
              <ManifestoLine>
                <p>
                  We are not looking for people who simply complete tasks. We are looking for{" "}
                  <Hl>builders</Hl> - people who enjoy solving meaningful problems, embrace
                  responsibility, and are excited by challenges that help them grow.
                </p>
              </ManifestoLine>
              <ManifestoLine>
                <p>
                  If you are looking for a place where you will be{" "}
                  <Hl>challenged, trusted and supported</Hl>, surrounded by people who push
                  each other to become better every day - you will feel at home here.
                </p>
              </ManifestoLine>
            </div>

            <Reveal delay={0.1}>
              <div className="mt-10 flex items-center gap-4">
                <div className="h-px w-10 bg-[#f2545b]/60" />
                <p className="text-sm font-semibold uppercase tracking-widest text-white/60">
                  The Ethixweb founders
                </p>
              </div>
            </Reveal>
          </div>

          {/* What we value */}
          <div className="mx-auto mt-24 max-w-6xl">
            <Reveal>
              <p className="text-center text-sm uppercase tracking-widest text-[#f2545b]">
                What we value
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h3 className="mt-3 text-center font-display text-3xl font-bold text-white sm:text-4xl">
                The four things we actually hire for.
              </h3>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {CULTURE_VALUES.map((item, i) => (
                <Reveal key={item.t} delay={i * 0.07}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-sm transition-colors duration-300 hover:border-[#f2545b]/40 hover:bg-white/[0.08]"
                  >
                    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-glow ring-1 ring-white/15">
                      <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
                      <item.icon className="relative h-5 w-5" strokeWidth={2} />
                    </span>
                    <h4 className="mt-5 font-display text-lg font-semibold text-white">
                      {item.t}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">{item.d}</p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Closing statement */}
          <div className="mx-auto mt-24 max-w-3xl text-center">
            <Reveal>
              <p className="font-display text-3xl font-bold leading-snug text-white sm:text-[2.6rem] sm:leading-tight">
                &ldquo;If this excites you more than it scares you,{" "}
                <span className="text-[#f2545b]">we would love to meet you</span>.&rdquo;
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <a
                href="#open-positions"
                className="magnetic group mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground shadow-glow"
              >
                Join Our Team
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
              </a>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────────────────────
          Full-crimson finale panel. Like the founder note, it's the same in
          both themes, so every color in here is hardcoded against the brand
          gradient rather than using theme tokens. */}
      <section className="py-20">
        <Container className="relative overflow-hidden rounded-4xl bg-[linear-gradient(135deg,#9d1b20_0%,#6b1114_45%,#30090b_100%)] px-6 py-12 text-center shadow-glow ring-1 ring-white/10 sm:px-12 sm:py-14 lg:py-16">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(55%_60%_at_50%_0%,rgba(255,255,255,0.14),transparent_70%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(40%_50%_at_90%_100%,rgba(0,0,0,0.35),transparent_70%)]"
          />
          {/* Giant outlined watermark behind the content */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-[18vw] font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.09)] lg:text-[9.5rem]"
          >
            JOIN US
          </span>

          <Reveal>
            <div className="relative mx-auto max-w-2xl">
              <Sparkles className="mx-auto h-8 w-8 text-white/90" strokeWidth={1.5} />
              <h2 className="mt-4 pb-1 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
                Don&apos;t see the right role?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
                We&apos;re always open to meeting senior, curious people. Send us a general
                application and we&apos;ll reach out if there&apos;s a fit.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/careers/apply"
                  search={{ role: "general" }}
                  className="magnetic group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-bold text-[#7a1418] shadow-[0_14px_40px_-12px_rgba(0,0,0,0.55)] transition-transform"
                >
                  Send a general application
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                </Link>
                <a
                  href="#open-positions"
                  className="magnetic inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 font-bold text-white transition-colors hover:bg-white/10"
                >
                  Browse open roles
                </a>
              </div>
              <p className="mt-6 text-sm text-white/60">
                Prefer email? Write to{" "}
                <a
                  href="mailto:info@ethixweb.com"
                  className="font-semibold text-white underline-offset-4 hover:underline"
                >
                  info@ethixweb.com
                </a>
              </p>
            </div>
          </Reveal>
        </Container>
      </section>
    </SiteLayout>
  );
}
