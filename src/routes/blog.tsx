import { createFileRoute, Link } from "@tanstack/react-router";
import { jsonLdStringify } from "@/lib/json-ld";
import { useMemo, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/shared/Reveal";
import { Container } from "@/components/shared/Container";
import { GlowBlob } from "@/components/shared/GlowBlob";
import { MarqueeBand } from "@/components/shared/MarqueeBand";
import { RotatingText } from "@/components/shared/RotatingText";
import { WebSpotlight } from "@/components/shared/WebSpotlight";
import { trackWebSpotlight } from "@/lib/web-spotlight";
import { ArrowUpRight, Check, Clock, PenLine } from "lucide-react";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog - Ethixweb" },
      { name: "description", content: "Essays on design, AI and growth from the Ethixweb team." },
      { property: "og:title", content: "Ethixweb Blog" },
      { property: "og:description", content: "Insights on design, AI and growth." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://ethixweb.com/ethixweb.png" },
      { property: "og:url", content: "https://ethixweb.com/blog" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Ethixweb Blog" },
      {
        name: "twitter:description",
        content: "Essays on design, AI and growth from the Ethixweb team.",
      },
      { name: "twitter:image", content: "https://ethixweb.com/ethixweb.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://ethixweb.com/blog" }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLdStringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Ethixweb Blog",
          url: "https://ethixweb.com/blog",
          description: "Essays on design, AI and growth from the Ethixweb team.",
          publisher: {
            "@type": "Organization",
            name: "Ethixweb",
            url: "https://ethixweb.com",
            logo: "https://ethixweb.com/ethixweb.png",
          },
          inLanguage: "en-US",
        }),
      },
    ],
  }),
  component: Blog,
});

// No post pages exist yet, so every entry is an honest "in the works" preview
// rather than a dead link - the page sells the journal without pretending to
// be one. When real posts ship, give each a slug + route and swap the cards
// to links. Topics deliberately mirror the services/industries we actually
// sell, so nothing here drifts into content-mill filler.
const POSTS = [
  {
    t: "Why your landing page isn't converting",
    c: "Growth",
    r: "6 min read",
    d: "The 7 elements every modern hero section needs in 2026 - and the friction patterns we remove first on every client rebuild.",
  },
  {
    t: "Building an AI support agent in 14 days",
    c: "AI",
    r: "8 min read",
    d: "How we shipped a production agent for ShipForge.",
  },
  {
    t: "Your ad budget isn't the problem. Your follow-up is.",
    c: "Growth",
    r: "6 min read",
    d: "Five leaks in the average lead funnel, and what plugging each one is worth.",
  },
  {
    t: "The Google Map Pack is your real homepage",
    c: "Local SEO",
    r: "6 min read",
    d: "The top three local results get the calls. Here's the weekly routine that gets you there.",
  },
  {
    t: "Brand systems that scale with you",
    c: "Design",
    r: "5 min read",
    d: "Designing identities that survive ten product pivots.",
  },
  {
    t: "An AI receptionist answered while you were on a ladder",
    c: "AI",
    r: "5 min read",
    d: "What 24/7 missed-call capture actually looks like for a two-truck HVAC shop.",
  },
  {
    t: "SEO is dead. Long live SEO.",
    c: "SEO",
    r: "7 min read",
    d: "What AI search means for organic growth.",
  },
  {
    t: "Core Web Vitals for people who sell real things",
    c: "Engineering",
    r: "7 min read",
    d: "Taking a contractor site from a 40 to a 95+ without a replatform.",
  },
  {
    t: "Trust signals that make a $10k job feel safe to book",
    c: "Design",
    r: "5 min read",
    d: "Reviews, licenses, photos - and the order they should appear on the page.",
  },
  {
    t: "What AI Overviews mean for local service search",
    c: "SEO",
    r: "8 min read",
    d: "Where the clicks are going, and how to stay the answer.",
  },
  {
    t: "WordPress, Astro or headless: an honest decision tree",
    c: "Engineering",
    r: "9 min read",
    d: "The stack we pick for each kind of client, and why it's rarely the trendy one.",
  },
  {
    t: "Review harvesting without begging",
    c: "Local SEO",
    r: "4 min read",
    d: "Automations that turn happy customers into a steady stream of five-star reviews.",
  },
];

const CATEGORIES = ["All", "Growth", "AI", "Design", "SEO", "Local SEO", "Engineering"];

const TOPICS = [
  "Growth",
  "AI",
  "Design",
  "SEO",
  "Local SEO",
  "Engineering",
  "Case studies",
  "Field notes",
];

// Kept low on purpose - the tilt should read as "the card is alive under my
// cursor", not a carnival ride.
const MAX_TILT_DEG = 5;

/** Blog card with a cursor-following 3D tilt + spiderweb spotlight - the
 * hover treatment, rather than a plain lift. Needs to be its own component
 * because the tilt uses per-card motion-value hooks. */
function PostCard({ post, displayIndex }: { post: (typeof POSTS)[number]; displayIndex: number }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Pointer position within the card, -0.5..0.5 on both axes.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [MAX_TILT_DEG, -MAX_TILT_DEG]), {
    stiffness: 220,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-MAX_TILT_DEG, MAX_TILT_DEG]), {
    stiffness: 220,
    damping: 18,
  });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    trackWebSpotlight(e);
    if (reduceMotion) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r || r.width === 0 || r.height === 0) return;
    px.set((e.clientX - r.x) / r.width - 0.5);
    py.set((e.clientY - r.y) / r.height - 0.5);
  }

  function handleMouseLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    // The perspective wrapper must be the tilted element's parent, so the
    // rotateX/rotateY read as 3D depth instead of a flat skew.
    <div className="h-full" style={{ perspective: 1000 }}>
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={reduceMotion ? undefined : { rotateX, rotateY }}
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-foreground/[0.02] p-6 transition-[border-color,box-shadow] duration-300 hover:border-primary/35 hover:shadow-lg"
      >
        <WebSpotlight />
        {/* Crimson wash on hover */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.07] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span
          aria-hidden="true"
          className="absolute right-5 top-4 select-none font-display text-4xl font-extrabold leading-none text-transparent transition-all duration-300 [-webkit-text-stroke:1.5px_rgba(165,28,34,0.25)] group-hover:[-webkit-text-stroke:1.5px_rgba(165,28,34,0.55)]"
        >
          {String(displayIndex).padStart(2, "0")}
        </span>

        <div className="relative flex flex-wrap items-center gap-2.5 pr-14 text-xs">
          <span className="font-bold uppercase tracking-widest text-primary-text">{post.c}</span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> {post.r}
          </span>
        </div>
        <h3 className="relative mt-4 font-display text-xl font-semibold leading-snug transition-colors duration-300 group-hover:text-primary">
          {post.t}
        </h3>
        <p className="relative mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">
          {post.d}
        </p>
        <div className="relative mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[11px] font-semibold text-muted-foreground">
            <PenLine className="h-3 w-3 text-primary" /> In the works
          </span>
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground/60 transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
          >
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
          </span>
        </div>
      </motion.div>
    </div>
  );
}

function Blog() {
  const reduceMotion = useReducedMotion();
  const [filter, setFilter] = useState("All");

  const [featured, ...rest] = POSTS;
  const visible = useMemo(
    () => (filter === "All" ? rest : POSTS.filter((p) => p.c === filter)),
    [filter, rest],
  );

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
                Journal - {POSTS.length} essays in the queue
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-7 max-w-3xl pb-1 text-[clamp(2.5rem,5.2vw,4.5rem)] font-extrabold leading-[1.06] text-gradient">
                Field notes on{" "}
                <RotatingText
                  texts={["growth.", "AI.", "design.", "SEO.", "engineering."]}
                  mainClassName="align-bottom"
                  elementLevelClassName="text-primary"
                  rotationInterval={3200}
                  initial={{ y: "35%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-35%", opacity: 0 }}
                  transition={{ duration: 0.32, ease: "easeOut" }}
                />
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Tactics, essays and case studies on shipping great digital work - written by the
                people doing the shipping, not a content team.
              </p>
            </Reveal>
            {/* Glowing accent line with a traveling pulse */}
            <Reveal delay={0.22}>
              <div className="relative mt-9 h-px w-full max-w-md overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-primary/15 to-transparent" />
                {!reduceMotion && (
                  <motion.div
                    className="absolute top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-[#ff8a8f] to-transparent"
                    animate={{ left: ["-33%", "100%"] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <MarqueeBand items={TOPICS} rotate={false} />

      {/* ── Featured essay ───────────────────────────────────────────────── */}
      {filter === "All" && (
        <section className="pt-24">
          <Container>
            <Reveal>
              <div className="flex items-baseline gap-5">
                <span
                  aria-hidden="true"
                  className="select-none font-display text-6xl font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(165,28,34,0.5)] sm:text-7xl"
                >
                  01
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-6 text-sm uppercase tracking-widest text-primary-text">Up next</p>
            </Reveal>

            {/* Featured panel - forced-dark, colors hardcoded */}
            <Reveal delay={0.14}>
              <motion.article
                whileHover={reduceMotion ? undefined : { y: -5 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative mt-6 overflow-hidden rounded-4xl bg-[linear-gradient(135deg,#3a0b0d_0%,#1c0607_55%,#120405_100%)] p-8 ring-1 ring-white/10 sm:p-12"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(70%_60%_at_15%_0%,rgba(157,27,32,0.35),transparent_70%)]"
                />
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-4 bottom-0 select-none font-display text-[9rem] font-extrabold uppercase leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.07)] sm:text-[12rem]"
                  animate={reduceMotion ? undefined : { x: [0, -18, 0] }}
                  transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                >
                  {featured.c}
                </motion.span>
                <div className="relative max-w-2xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center rounded-full border border-[#f2545b]/40 bg-[#f2545b]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#f2545b]">
                      {featured.c}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/55">
                      <Clock className="h-3.5 w-3.5" /> {featured.r}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold text-white/60">
                      <PenLine className="h-3 w-3" /> In the works
                    </span>
                  </div>
                  <h2 className="mt-6 font-display text-3xl font-bold leading-tight text-white sm:text-5xl">
                    {featured.t}
                  </h2>
                  <p className="mt-4 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
                    {featured.d}
                  </p>
                </div>
              </motion.article>
            </Reveal>
          </Container>
        </section>
      )}

      {/* ── The queue ────────────────────────────────────────────────────── */}
      <section className="py-20">
        <Container>
          {/* Filter bar */}
          <Reveal>
            <div
              className="flex flex-wrap items-center gap-2"
              role="group"
              aria-label="Filter posts by topic"
            >
              {CATEGORIES.map((f) => {
                const active = filter === f;
                return (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter(f)}
                    className={`relative inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-glow"
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

          {/* Animated card grid */}
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {visible.map((p, i) => (
                <motion.article
                  key={p.t}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                  transition={{
                    duration: 0.45,
                    delay: (i % 6) * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="h-full"
                  style={{ transformOrigin: "center" }}
                >
                  <PostCard post={p} displayIndex={i + (filter === "All" ? 2 : 1)} />
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          {visible.length === 0 && (
            <p className="mt-12 text-center text-muted-foreground">
              Nothing in this topic yet - it&apos;s on the list.
            </p>
          )}
        </Container>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────
          Matches the site's crimson finale panels; forced-dark, hardcoded
          colors. No fake newsletter form - the honest action is the contact
          page. */}
      <section className="pb-24">
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
              NOTES
            </span>
            <div className="relative mx-auto max-w-2xl">
              <h2 className="pb-1 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
                Don&apos;t wait for the essay.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/75 sm:text-lg">
                Everything we&apos;re writing about, we already do for clients. Skip the reading
                list and put it to work on your business.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/contact"
                  className="magnetic group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-bold text-[#7a1418] shadow-[0_14px_40px_-12px_rgba(0,0,0,0.55)]"
                >
                  Talk to the team
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
