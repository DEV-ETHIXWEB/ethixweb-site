import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import spiderweb from "@/assets/spiderweb.svg";

/**
 * The band's right-hand visual: the date set as one enormous numeral, with
 * the brand's web radiating out from behind it and a hairline rule running
 * through it.
 *
 * The previous attempt here was a glowing orb ringed by floating pills. It
 * looked generated, for a reason worth writing down: the pills were a
 * second copy of the hero's badge pattern, the orb was a shape with no
 * meaning, and everything was evenly spaced around a centre. That is the
 * house style of a template.
 *
 * This is typographic instead. The numeral IS the artwork, at a size no
 * template picks, and the web finally does structural work by converging on
 * the date rather than sitting behind it as texture. The web's own strands
 * carry the horizontal reading; a pair of drawn rules across the numeral was
 * tried here and cut, because against the web they read as stray lines
 * rather than structure.
 */
export function PromoDate({
  day,
  month,
  range,
  wordmark,
}: {
  day: string;
  month: string;
  range: string;
  /** Set large under the date. Decorative: the band's real heading is the
   * one in the copy column, and repeating it as a second heading would make
   * a screen reader read the name twice. The whole block is aria-hidden. */
  wordmark: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Pointer parallax straight to CSS variables, never React state: this
  // fires on every move and re-rendering at that rate is what makes an
  // effect feel cheap. The web and the numeral shift by different amounts,
  // which is what sells the depth.
  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;
    let raf = 0;
    let x = 0;
    let y = 0;
    const flush = () => {
      el.style.setProperty("--px", x.toFixed(3));
      el.style.setProperty("--py", y.toFixed(3));
      raf = 0;
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
      if (!raf) raf = requestAnimationFrame(flush);
    };
    const onLeave = () => {
      x = 0;
      y = 0;
      if (!raf) raf = requestAnimationFrame(flush);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);

  return (
    <div ref={ref} aria-hidden="true" className="promo-date relative select-none">
      {/* The web, scaled up and allowed to bleed, so it reads as structure
          rather than wallpaper. Its hub is at 55.3%/45.7% of the artwork, not
          dead centre, so it is nudged by the difference to land under the
          numeral. One transform only: in Tailwind v4 the translate utilities
          are a separate property that composes with `transform` rather than
          replacing it. */}
      <img
        src={spiderweb}
        alt=""
        draggable={false}
        loading="lazy"
        decoding="async"
        className="promo-date-web pointer-events-none absolute top-1/2 left-1/2 h-[150%] w-[150%] max-w-none"
      />

      <div className="promo-date-type relative flex flex-col items-center">
        <span className="promo-numeral font-display">{day}</span>
        <span className="promo-month font-display">{month}</span>
        <span className="promo-wordmark font-display">{wordmark}</span>
      </div>

      {/* Signature detail: the window set vertically down the right edge. A
          deliberate piece of craft, and the kind of thing a layout generator
          does not reach for. */}
      <span className="promo-vertical font-display">{range}</span>
    </div>
  );
}
