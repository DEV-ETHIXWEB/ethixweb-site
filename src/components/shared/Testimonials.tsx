import { useEffect, useRef } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "framer-motion";
import { Star, ExternalLink } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Container } from "@/components/shared/Container";
import { GlowBlob } from "@/components/shared/GlowBlob";
import { WebSpotlight } from "@/components/shared/WebSpotlight";
import { trackWebSpotlight } from "@/lib/web-spotlight";

const BRAND_DARK = "#ffffff";
const BRAND_LIGHT = "#c0272d";

// Pulled from https://www.trustpilot.com/review/ethixweb.com - every entry is
// the reviewer's own wording, newest first. Keep this list in sync with the
// public profile; do not paraphrase or invent entries.
const REVIEWS = [
  {
    stars: 5,
    text: "I have been contacted by many people/companies that want to build a website for my business, but I'm always skeptical about it. I decided to give Ethixweb that chance and they have proven themselves! I have been with them 2 years and within that first year my business had doubled. The second year my business had doubled again. My website is easy to follow, has everything on it I asked for, it loads fast and it's easy to maintain. The folks at Ethixweb are very professional, schedule meetings via video when I need something fixed and are on top of it. My computer skills are absolute garbage, so I am very lucky to have Ethixweb a part of my business!",
    author: "Ryan Taylor",
    date: "October 2026",
  },
  {
    stars: 5,
    text: "I had Ethixweb.com create me a website not only did they do it extremely professional, but they did it extremely fast and it came out fabulous they are very professional and they communicate great. I would highly recommend this company to create your next website. They are exceptional.",
    author: "Clinton Mcculloch",
    date: "October 2026",
  },
  {
    stars: 5,
    text: "Amar is very thorough and quick to make changes on our website. Over the years that has been my biggest issue with web designers. Small changes can take way too long. Thankfully that is not the case here. Good service! Very happy customer!!",
    author: "Leslie Whitehurst-Manners",
    date: "April 2026",
  },
  {
    stars: 5,
    text: "Ethixweb did an incredible job on our business website. It is very sharp, modern looking and has all the extra bells and whistles we need. The team was easy to work with, great communication and done in efficient time. They provided all details from start to finish and gave details to us moving forward with our website. I'd highly recommend them!!",
    author: "Kayla Kjl",
    date: "March 2025",
  },
];

function StarRow({
  count,
  brand,
  total = count,
  className = "h-4 w-4",
}: {
  count: number;
  brand: string;
  total?: number;
  className?: string;
}) {
  return (
    <div className="flex gap-1" role="img" aria-label={`${count} out of ${total} stars`}>
      {Array.from({ length: total }).map((_, i) => {
        const color = i < count ? brand : "#6b7280";
        return (
          <Star key={i} aria-hidden="true" className={className} style={{ fill: color, color }} />
        );
      })}
    </div>
  );
}

function TrustpilotLogo({ size = "sm" }: { size?: "sm" | "lg" }) {
  const label = size === "lg" ? "text-3xl" : "text-xs";
  return <span className={`${label} font-bold tracking-tight text-foreground`}>Trustpilot</span>;
}

function ReviewCard({ review, brand }: { review: (typeof REVIEWS)[number]; brand: string }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.015 }}
      onMouseMove={trackWebSpotlight}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="premium-card group relative min-w-60 sm:min-w-75 max-w-72 sm:max-w-90 shrink-0 overflow-hidden rounded-2xl p-6"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl"
        style={{ background: `${brand}18` }}
      />
      <WebSpotlight />

      <StarRow count={review.stars} brand={brand} />

      <p className="mt-4 text-sm leading-7 text-muted-foreground">&ldquo;{review.text}&rdquo;</p>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <div>
          <p className="text-sm font-bold text-foreground">{review.author}</p>
          <p className="mt-0.5 text-[11px] uppercase tracking-widest text-muted-foreground/60">
            Verified Client · {review.date}
          </p>
        </div>
        <TrustpilotLogo />
      </div>
    </motion.div>
  );
}

function InfiniteCarousel({ brand }: { brand: string }) {
  const x = useMotionValue(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const dragging = useRef(false);
  const visible = useRef(false);
  const trackWidth = useRef(0);
  const reduceMotion = useReducedMotion();

  // Measure the track only when its size actually changes. Reading scrollWidth
  // inside the frame loop forced a synchronous layout on every frame for the
  // life of the page - even while the carousel was off-screen.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      trackWidth.current = el.offsetWidth;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Watch the static outer wrapper, not the track itself - the track is
  // constantly translated by the animation it's gating, so observing it
  // directly means its own box drifts out of the intersection root as soon
  // as it travels more than its width, permanently freezing the animation
  // the first time it scrolls past that point.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    const trackW = trackWidth.current;
    const half = trackW / 2;
    if (half <= 0) return;
    if (!initialized.current) {
      x.set(-half);
      initialized.current = true;
      return;
    }
    if (!visible.current) return;
    if (!dragging.current && !reduceMotion) {
      x.set(x.get() + 0.4 * delta * 0.06);
    }
    // Wrap so dragging (and autoplay) can roam freely while staying seamless -
    // the track is duplicated, so shifting by exactly `half` is visually identical.
    const v = x.get();
    if (v > 0) x.set(v - half);
    else if (v <= -trackW) x.set(v + half);
  });

  const duplicated = [...REVIEWS, ...REVIEWS, ...REVIEWS, ...REVIEWS];

  return (
    <div ref={wrapRef} className="overflow-x-hidden overflow-y-visible py-4">
      <motion.div
        ref={trackRef}
        className="flex w-max cursor-grab items-start gap-5 active:cursor-grabbing"
        style={{ x }}
        drag="x"
        dragElastic={0.05}
        dragMomentum={false}
        onDragStart={() => {
          dragging.current = true;
        }}
        onDragEnd={() => {
          dragging.current = false;
        }}
      >
        {duplicated.map((r, i) => (
          <ReviewCard key={i} review={r} brand={brand} />
        ))}
      </motion.div>
    </div>
  );
}

export function Testimonials() {
  const { theme } = useTheme();
  const brand = theme === "light" ? BRAND_LIGHT : BRAND_DARK;

  return (
    <section className="relative py-8 sm:py-16 lg:pt-24 lg:pb-20 [clip-path:inset(-100vh_0px_-100vh_0px)]">
      <div
        className="pointer-events-none absolute left-1/4 top-1/2 h-[clamp(16rem,32vw,36rem)] w-[clamp(22rem,45vw,36rem)] -translate-y-1/2 rounded-full blur-[140px]"
        style={{ background: `${brand}0d` }}
      />
      <GlowBlob
        size="lg"
        color="primary"
        blur={120}
        className="right-1/4 top-1/2 -translate-y-1/2 opacity-25"
      />

      <Container className="relative">
        <Reveal>
          <div className="flex flex-col items-center gap-24 text-center sm:gap-40 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:text-left">
            <div className="max-w-xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-primary-text">
                Client Reviews
              </p>
              <h2 className="text-5xl font-extrabold leading-tight text-gradient pb-1">
                Trusted by businesses worldwide.
              </h2>
              <p className="mt-5 text-base leading-7 text-muted-foreground lg:text-lg">
                Real feedback from clients who trusted Ethixweb to design, build, and grow their
                digital presence.
              </p>
            </div>

            <div className="premium-card relative w-full max-w-sm shrink-0 overflow-visible rounded-3xl px-8 pb-4.5 pt-18.5 text-center sm:px-10 sm:pt-22.5 lg:max-w-sm lg:min-w-90 lg:pt-22.5">
              <div className="relative -top-10 -mt-2.5 flex justify-center">
                <TrustpilotLogo size="lg" />
              </div>
              <div className="mt-1 flex items-end justify-center gap-3">
                <span className="text-8xl font-extrabold leading-none text-foreground">4.0</span>
                <span className="mb-3 text-2xl font-bold text-muted-foreground">/5</span>
              </div>
              <div className="mt-2 flex justify-center">
                <StarRow count={4} total={5} brand={brand} className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground/70">
                Trustpilot Rating
              </p>
              <div className="mt-2 border-y border-border py-2">
                <p className="text-3xl font-extrabold text-foreground">24/7</p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  Global Availability
                </p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Real feedback from real clients. We're proud to deliver work that earns trust, every
                time.
              </p>
              <a
                href="https://www.trustpilot.com/review/ethixweb.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand px-8 py-3 text-base font-bold text-primary-foreground shadow-glow transition hover:scale-[1.02]"
              >
                Read reviews
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </div>
        </Reveal>

        <div className="mt-12">
          <InfiniteCarousel brand={brand} />
        </div>

        <Reveal delay={0.12}>
          <div className="mt-10 text-center">
            <a
              href="https://www.trustpilot.com/review/ethixweb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-6 py-2.5 text-sm font-bold text-foreground transition hover:bg-muted"
            >
              Read more reviews on Trustpilot
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
