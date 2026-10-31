import { useEffect } from "react";
import type Lenis from "lenis";

/** Eased wheel and trackpad scrolling, the way premium sites feel.
 *
 * Native wheel scrolling moves the page in hard steps: one notch measured as a
 * 400px jump in a single frame. Lenis turns the same notch into a glide that
 * eases out over about a second, which is the "smooth" the site was compared
 * against (fruiticana.vercel.app runs Lenis with the same defaults).
 *
 * Three deliberate limits:
 * - Mouse and trackpad only. Phones already scroll with native momentum, and
 *   smoothing touch fights it, so on a device without a fine pointer Lenis is
 *   never even downloaded.
 * - Off for anyone who prefers reduced motion.
 * - Its animation loop runs only while a glide is in progress. Lenis expects
 *   to be ticked every frame for the life of the page; that would undo the
 *   idle-CPU work elsewhere on the site, so the loop wakes on a wheel or an
 *   anchor click and stops as soon as the glide settles.
 *
 * Mounted by SiteLayout, which every public page renders for itself, so the
 * instance is created and destroyed with each page: a glide in progress can
 * never carry over into the next page's scroll position. Inner scrollers
 * (the chat panel, the timezone list) opt out with data-lenis-prevent. */
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let lenis: Lenis | null = null;
    let raf = 0;
    let disposed = false;

    const tick = (time: number) => {
      raf = 0;
      if (!lenis) return;
      lenis.raf(time);
      if (lenis.isScrolling === "smooth") raf = requestAnimationFrame(tick);
    };

    // Lenis measures each step from its last tick. After the loop has been
    // asleep that gap is huge, and the first frame would jump straight to the
    // target instead of gliding; zero makes that first step a no-op instead.
    const wake = () => {
      if (!lenis || raf) return;
      lenis.time = 0;
      raf = requestAnimationFrame(tick);
    };

    import("lenis").then(({ default: LenisCtor }) => {
      if (disposed) return;
      // Defaults otherwise (lerp 0.1), the same feel as the reference site.
      lenis = new LenisCtor({ anchors: true });
      // Registered after Lenis's own listeners, so it has already set its
      // target by the time the loop wakes.
      window.addEventListener("wheel", wake, { passive: true });
      window.addEventListener("click", wake);
    });

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("wheel", wake);
      window.removeEventListener("click", wake);
      lenis?.destroy();
    };
  }, []);
}
