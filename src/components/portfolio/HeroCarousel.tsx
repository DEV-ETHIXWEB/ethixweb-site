import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const INTERVAL = 3000;

export interface HeroCarouselSlide {
  slug: string;
  client: string;
  headline: string;
  image: { src: string; alt: string; width: number; height: number };
}

/** Our Work hero visual: the shipped-site screenshots auto-crossfade every
 * 3s, with a small name+headline plate pinned to the lower-right corner that
 * always links to that slide's case study. Dots (top-left) give manual/
 * keyboard control and double as progress. Reduced-motion users get no
 * auto-cycle, matching the SpotlightCrossfade convention used on the case
 * study detail pages. */
export function HeroCarousel({ slides }: { slides: HeroCarouselSlide[] }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || slides.length < 2) return;
    const id = setInterval(() => setActive((a) => (a + 1) % slides.length), INTERVAL);
    return () => clearInterval(id);
  }, [slides.length, reduce]);

  const current = slides[active];

  return (
    <div className="relative h-[24rem] overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#3a0b0d_0%,#1c0607_55%,#120405_100%)] shadow-glow ring-1 ring-white/10 sm:h-[28rem]">
      {slides.map((slide, i) => (
        <img
          key={slide.slug}
          src={slide.image.src}
          alt={slide.image.alt}
          width={slide.image.width}
          height={slide.image.height}
          loading={i === 0 ? "eager" : "lazy"}
          className={cn(
            "absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-700 ease-out",
            i === active ? "opacity-100" : "opacity-0",
          )}
        />
      ))}

      {/* Scrims so the dots and info plate stay legible over bright screenshots */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(18,4,5,0.55),transparent)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(0deg,rgba(18,4,5,0.85),transparent)]"
      />

      {/* Progress dots - manual override + keyboard access */}
      {slides.length > 1 && (
        <div className="absolute left-4 top-4 z-10 flex gap-1.5">
          {slides.map((slide, i) => (
            <button
              key={slide.slug}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show ${slide.client}`}
              aria-current={i === active}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === active ? "w-6 bg-white" : "w-1.5 bg-white/35 hover:bg-white/60",
              )}
            />
          ))}
        </div>
      )}

      {/* Small name + headline plate, pinned lower-right, linking to the
          active slide's case study */}
      <Link
        to="/our-work/$slug"
        params={{ slug: current.slug }}
        aria-label={`Read the full ${current.client} case study`}
        className="group absolute bottom-4 right-4 z-10 max-w-[calc(100%-2rem)] rounded-2xl bg-[#120405]/85 p-4 ring-1 ring-white/15 backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:max-w-[19rem] sm:p-5"
      >
        <h3 className="font-display text-base font-bold text-white sm:text-lg">{current.client}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/70 sm:text-sm">
          {current.headline}
        </p>
        <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-white/85">
          Read case study
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </Link>
    </div>
  );
}
