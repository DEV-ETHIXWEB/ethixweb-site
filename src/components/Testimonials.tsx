import { useRef } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "framer-motion";
import { Star, ExternalLink } from "lucide-react";
import { Reveal } from "./Reveal";
import { useTheme } from "./ThemeProvider";

const BRAND_DARK = "#ffffff";
const BRAND_LIGHT = "#c0272d";

const REVIEWS = [
  {
    stars: 5,
    text: "Ethixweb created an incredible business website with a modern design and all the features we needed. The team communicated clearly, worked efficiently, and delivered beyond expectations.",
    author: "Kayla Kjl",
    date: "March 2025",
  },
  {
    stars: 5,
    text: "Quick and thorough service. Changes were handled fast, communication was excellent, and the entire process felt effortless. A great experience from start to finish.",
    author: "Leslie Whitehurst-Manners",
    date: "April 2026",
  },
  {
    stars: 5,
    text: "Professional, affordable, and highly reliable. The team delivered exactly what I needed and made the entire process smooth and stress free.",
    author: "Ryan Taylor",
    date: "April 2025",
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
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => {
        const color = i < count ? brand : "#6b7280";
        return <Star key={i} className={className} style={{ fill: color, color }} />;
      })}
    </div>
  );
}

function TrustpilotLogo({
  brand,
  filled = 5,
  size = "sm",
}: {
  brand: string;
  filled?: number;
  size?: "sm" | "lg";
}) {
  const starColor = brand === BRAND_DARK ? "#0c0d10" : "#ffffff";
  const box = size === "lg" ? "h-7 w-7" : "h-5 w-5";
  const icon = size === "lg" ? "h-4 w-4" : "h-3 w-3";
  const label = size === "lg" ? "text-base" : "text-xs";
  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => {
          const bg = i < filled ? brand : "#6b7280";
          return (
            <div key={i} className={`flex ${box} items-center justify-center`} style={{ background: bg }}>
              <Star className={icon} style={{ fill: starColor, color: starColor }} />
            </div>
          );
        })}
      </div>
      <span className={`${label} font-bold tracking-tight text-foreground`}>Trustpilot</span>
    </div>
  );
}

function ReviewCard({ review, brand }: { review: (typeof REVIEWS)[number]; brand: string }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="premium-card relative min-w-60 sm:min-w-75 max-w-72 sm:max-w-90 shrink-0 overflow-hidden rounded-2xl p-6"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl"
        style={{ background: `${brand}18` }}
      />

      <StarRow count={review.stars} brand={brand} />

      <p className="mt-4 text-sm leading-7 text-muted-foreground">&ldquo;{review.text}&rdquo;</p>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <div>
          <p className="text-sm font-bold text-foreground">{review.author}</p>
          <p className="mt-0.5 text-[11px] uppercase tracking-widest text-muted-foreground/60">
            Verified Client · {review.date}
          </p>
        </div>
        <TrustpilotLogo brand={brand} />
      </div>
    </motion.div>
  );
}

function InfiniteCarousel({ brand }: { brand: string }) {
  const x = useMotionValue(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const dragging = useRef(false);
  const reduceMotion = useReducedMotion();

  useAnimationFrame((_, delta) => {
    const trackW = trackRef.current?.scrollWidth ?? 0;
    const half = trackW / 2;
    if (half <= 0) return;
    if (!initialized.current) {
      x.set(-half);
      initialized.current = true;
      return;
    }
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
    <div className="overflow-x-hidden overflow-y-visible py-4">
      <motion.div
        ref={trackRef}
        className="flex cursor-grab gap-5 active:cursor-grabbing"
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
    <section className="relative px-6 py-12 sm:py-24 lg:pt-36 lg:pb-28 [clip-path:inset(-100vh_0px_-100vh_0px)]">
      <div
        className="pointer-events-none absolute left-1/4 top-1/2 h-144 w-xl -translate-y-1/2 rounded-full blur-[140px]"
        style={{ background: `${brand}0d` }}
      />
      <div className="pointer-events-none absolute right-1/4 top-1/2 h-112 w-md -translate-y-1/2 rounded-full bg-primary/8 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        <Reveal>
          <div className="flex flex-col items-center gap-12 text-center lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:text-left">
            <div className="max-w-xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-primary">
                Client Reviews
              </p>
              <h2 className="text-3xl font-extrabold leading-tight text-gradient lg:text-5xl pb-1">
                Trusted by businesses worldwide.
              </h2>
              <p className="mt-5 text-base leading-7 text-muted-foreground lg:text-lg">
                Real feedback from clients who trusted Ethixweb to design, build, and grow their
                digital presence.
              </p>
            </div>

            <div className="premium-card relative w-full max-w-sm shrink-0 overflow-visible rounded-3xl px-8 pb-4.5 pt-18.5 text-center sm:px-10 sm:pt-22.5 lg:max-w-sm lg:min-w-90 lg:pt-22.5">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-full right-[214px] -mb-[71px] h-[174px] sm:right-38 sm:h-75.25 sm:-mb-35 lg:right-40 lg:h-90.75 lg:-mb-37.5"
              >
                <div
                  aria-hidden="true"
                  className="platform-ledge absolute left-1/2 top-[58%] z-0 h-3 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-3.5 sm:w-28 lg:h-4 lg:w-32"
                />
                <img
                  src="/ethan%20sitting.webp"
                  alt=""
                  aria-hidden="true"
                  className="relative z-10 block h-full w-auto object-contain drop-shadow-[0_14px_28px_rgba(0,0,0,0.28)]"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="relative -top-10 -mt-2.5 flex justify-end">
                <TrustpilotLogo brand={brand} filled={4} size="lg" />
              </div>
              <div className="mt-1 flex items-end justify-center gap-3">
                <span className="text-7xl font-extrabold leading-none text-foreground sm:text-8xl">
                  4.0
                </span>
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
                Real feedback from real clients - we're proud to deliver work that earns trust,
                every time.
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
      </div>
    </section>
  );
}
