import { useMemo, useState } from "react";
import { jsonLdStringify } from "@/lib/json-ld";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/shared/Reveal";
import { Container } from "@/components/shared/Container";
import { GlowBlob } from "@/components/shared/GlowBlob";
import { HeroWebVisual } from "@/components/shared/HeroWebVisual";
import { CaseStudyCard } from "@/components/portfolio/CaseStudyCard";
import { HeroCarousel, type HeroCarouselSlide } from "@/components/portfolio/HeroCarousel";
import { Testimonials } from "@/components/shared/Testimonials";
import { CASE_STUDIES, SERVICE_FILTERS } from "@/lib/portfolio-data";

// Hero carousel: a fixed set of four shipped-site screenshots, in this order.
// Pulled from the listing data (already has the after-screenshot + headline
// for each), not the full detail registry - this is a curated subset, not
// "every case study with a detail page".
const CAROUSEL_SLUGS = [
  "all-phase-plumbing",
  "preventive-home-solutions",
  "garys-pipeline",
  "catching-chrome",
] as const;
const CAROUSEL_SLIDES: HeroCarouselSlide[] = CAROUSEL_SLUGS.map((slug) => {
  const study = CASE_STUDIES.find((s) => s.slug === slug);
  if (!study || !study.image) {
    throw new Error(`Hero carousel: missing case study or image for "${slug}"`);
  }
  return { slug: study.slug, client: study.client, headline: study.headline, image: study.image };
});

export const Route = createFileRoute("/our-work/")({
  head: () => ({
    meta: [
      { title: "Our Work - Ethixweb" },
      {
        name: "description",
        content:
          "Real case studies from Ethixweb: websites, SEO and paid media that generated thousands of qualified leads.",
      },
      { property: "og:title", content: "Our Work - Ethixweb Case Studies" },
      { property: "og:description", content: "Selected client work and measurable results." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://ethixweb.com/ethixweb.png" },
      { property: "og:url", content: "https://ethixweb.com/our-work" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Our Work - Ethixweb Case Studies" },
      {
        name: "twitter:description",
        content:
          "Real case studies from Ethixweb: websites, SEO and paid media that generated thousands of qualified leads.",
      },
      { name: "twitter:image", content: "https://ethixweb.com/ethixweb.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://ethixweb.com/our-work" }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLdStringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Ethixweb Our Work",
          url: "https://ethixweb.com/our-work",
          description:
            "Real case studies from Ethixweb: websites, SEO and paid media that generated thousands of qualified leads.",
          itemListElement: CASE_STUDIES.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: s.client,
            description: s.impact,
          })),
        }),
      },
    ],
  }),
  component: Portfolio,
});

function Portfolio() {
  const [filter, setFilter] = useState<string>("All");
  const reduceMotion = useReducedMotion();

  const visible = useMemo(
    () =>
      filter === "All" ? CASE_STUDIES : CASE_STUDIES.filter((s) => s.services.includes(filter)),
    [filter],
  );

  return (
    <SiteLayout>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative -mt-24 overflow-hidden bg-gradient-hero pb-16 pt-36 sm:pb-24 sm:pt-44">
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
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_18px_rgba(138,24,28,0.9)]" />
                  Our Work
                </div>
              </Reveal>
              <Reveal delay={0.08}>
                <h1 className="mt-7 pb-1 text-[clamp(2.5rem,4.8vw,4.2rem)] font-extrabold leading-[1.06] text-gradient">
                  We build things
                  <br />
                  that <span className="text-primary">matter.</span>
                </h1>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                  From fast-moving local businesses to scaling brands - we ship websites and
                  campaigns that drive real outcomes. Here is a curated selection of our recent
                  work.
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
                    href="#case-studies"
                    className="btn-secondary group inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-bold"
                  >
                    See the case studies
                    <ArrowUpRight className="h-4 w-4 rotate-90 transition-transform duration-200 group-hover:rotate-[100deg]" />
                  </a>
                </div>
              </Reveal>
            </div>

            {/* Hero carousel - four shipped-site screenshots auto-crossfading
                every 3s, with a small name+headline plate pinned to the
                lower-right corner. */}
            <Reveal delay={0.2}>
              <HeroCarousel slides={CAROUSEL_SLIDES} />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ── Case studies ─────────────────────────────────────────────────── */}
      <section id="case-studies" className="scroll-mt-24 py-24">
        <Container>
          <Reveal>
            <div className="flex items-baseline gap-5">
              <span
                aria-hidden="true"
                className="select-none font-display text-6xl font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(165,28,34,0.5)] sm:text-7xl"
              >
                {String(CASE_STUDIES.length).padStart(2, "0")}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-6 max-w-2xl">
              <p className="mb-4 text-sm uppercase tracking-widest text-primary-text">
                Case studies
              </p>
              <h2 className="pb-1 font-display text-4xl font-bold text-gradient sm:text-5xl">
                A clear before and after, every time.
              </h2>
            </div>
          </Reveal>

          {/* Filter bar */}
          <Reveal delay={0.08}>
            <div
              className="mt-10 flex flex-wrap items-center gap-2"
              role="group"
              aria-label="Filter case studies by service"
            >
              {["All", ...SERVICE_FILTERS].map((f) => {
                const active = filter === f;
                return (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter(f)}
                    className={`relative inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-foreground/[0.03] text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                    {f}
                  </button>
                );
              })}
            </div>
          </Reveal>

          {/* Grid */}
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {visible.map((study, i) => (
                <CaseStudyCard key={study.slug} study={study} index={i} />
              ))}
            </AnimatePresence>
          </div>

          {visible.length === 0 && (
            <p className="mt-12 text-center text-muted-foreground">
              No case studies match that filter yet.
            </p>
          )}
        </Container>
      </section>

      {/* ── Trusted by - every name here is a real client from the case
          studies above, kept muted so it reads as proof, not decoration. ── */}
      <section className="overflow-hidden border-y border-border bg-foreground/[0.02] py-14">
        <Reveal>
          <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-primary-text">
            Trusted by businesses worldwide
          </p>
        </Reveal>
        <div
          aria-hidden="true"
          className="relative mt-8 flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]"
        >
          <motion.div
            className="flex w-max items-center"
            animate={reduceMotion ? undefined : { x: ["0%", "-50%"] }}
            transition={{ duration: 32, ease: "linear", repeat: Infinity }}
          >
            {(["a", "b"] as const).map((row) => (
              <div key={row} className="flex shrink-0 items-center">
                {CASE_STUDIES.map((s) => (
                  <span
                    key={`${row}-${s.slug}`}
                    className="flex items-center gap-10 whitespace-nowrap pr-10 font-display text-2xl font-extrabold text-foreground/15 sm:text-3xl"
                  >
                    {s.client}
                    <span className="text-lg text-primary/25">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── What clients say - real Trustpilot reviews, shared with home ──── */}
      <Testimonials />

      {/* ── Final CTA ────────────────────────────────────────────────────────
          Full-crimson finale panel, matching the careers page closer. Same in
          both themes, so colors are hardcoded against the brand gradient. */}
      <section className="px-4 py-20 xs:px-6 lg:px-8">
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
              RESULTS
            </span>
            <div className="relative mx-auto max-w-2xl">
              <h2 className="pb-1 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
                Let&apos;s create your next success story.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/75 sm:text-lg">
                Tell us where the friction is. We&apos;ll tell you how we&apos;d fix it - no pitch
                deck required.
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
                  to="/services"
                  className="magnetic inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 font-bold text-white transition-colors hover:bg-white/10"
                >
                  See what we do
                </Link>
              </div>
            </div>
          </Container>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
