import { useRef } from "react";
import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
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
    text: "Professional, affordable, and highly reliable. The team delivered exactly what I needed and made the entire process smooth and stress-free.",
    author: "Ryan Taylor",
    date: "April 2025",
  },
];

function StarRow({ count, brand, total = count }: { count: number; brand: string; total?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: total }).map((_, i) => {
        const color = i < count ? brand : "#6b7280";
        return <Star key={i} className="h-4 w-4" style={{ fill: color, color }} />;
      })}
    </div>
  );
}

function TrustpilotLogo({ brand, filled = 5 }: { brand: string; filled?: number }) {
  const starColor = brand === BRAND_DARK ? "#0c0d10" : "#ffffff";
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => {
          const bg = i < filled ? brand : "#6b7280";
          return (
            <div key={i} className="flex h-5 w-5 items-center justify-center" style={{ background: bg }}>
              <Star className="h-3 w-3" style={{ fill: starColor, color: starColor }} />
            </div>
          );
        })}
      </div>
      <span className="text-xs font-bold tracking-tight text-foreground">Trustpilot</span>
    </div>
  );
}

function ReviewCard({ review, brand }: { review: (typeof REVIEWS)[number]; brand: string }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="premium-card relative min-w-[320px] max-w-90 shrink-0 overflow-hidden rounded-2xl p-6"
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

  useAnimationFrame((_, delta) => {
    const trackW = trackRef.current?.scrollWidth ?? 0;
    const half = trackW / 2;
    const next = (x.get() - 0.4 * delta * 0.06) % half;
    x.set(next <= -half ? 0 : next);
  });

  const duplicated = [...REVIEWS, ...REVIEWS, ...REVIEWS, ...REVIEWS];

  return (
    <div className="overflow-x-hidden overflow-y-visible py-4">
      <motion.div ref={trackRef} className="flex gap-5" style={{ x }}>
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
    <section className="relative overflow-hidden px-6 py-24">
      <div
        className="pointer-events-none absolute left-1/4 top-1/2 h-144 w-xl -translate-y-1/2 rounded-full blur-[140px]"
        style={{ background: `${brand}0d` }}
      />
      <div className="pointer-events-none absolute right-1/4 top-1/2 h-112 w-md -translate-y-1/2 rounded-full bg-primary/8 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        <Reveal>
          <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left">
            <div className="max-w-xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-primary">
                Client Reviews
              </p>
              <h2 className="text-3xl font-extrabold leading-tight text-gradient lg:text-5xl">
                Trusted by businesses worldwide.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Real feedback from clients who trusted Ethixweb to design, build, and grow their
                digital presence.
              </p>
            </div>

            <div className="premium-card relative shrink-0 rounded-2xl p-6 text-center lg:min-w-55">
              <img
                src="/Ethan%20view%20%204.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute hidden h-[202px] w-auto object-contain object-bottom drop-shadow-[0_12px_20px_rgba(0,0,0,0.25)] lg:block"
                loading="lazy"
                decoding="async"
                style={{ top: "calc(-6rem - 41px)", right: "calc(0.5rem + 70px)" }}
              />
              <TrustpilotLogo brand={brand} filled={4} />
              <div className="mt-4 flex items-end justify-center gap-1">
                <span className="text-5xl font-extrabold text-foreground">4.0</span>
                <span className="mb-1.5 text-lg text-muted-foreground">/5</span>
              </div>
              <div className="mt-2 flex justify-center">
                <StarRow count={4} total={5} brand={brand} />
              </div>
              <p className="mt-2 text-[11px] uppercase tracking-widest text-muted-foreground/60">
                Trustpilot Rating
              </p>
              <a
                href="https://www.trustpilot.com/review/ethixweb.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-4 py-1.5 text-xs font-bold text-foreground transition hover:bg-muted"
              >
                Read reviews
                <ExternalLink className="h-3 w-3" />
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
