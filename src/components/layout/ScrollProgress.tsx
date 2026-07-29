import { useEffect, useRef } from "react";

/**
 * Persistent, low-key scroll-progress hairline - orientation feedback without competing
 * visually with content (Signal Systems plan: nav-as-identity principle, original geometry).
 * Framer's `useReducedMotion` isn't needed here: a position readout is informational, not
 * decorative motion, so it stays on even with reduced motion enabled.
 *
 * Where the browser supports scroll-driven animations this is pure CSS and costs no JS at
 * all (see `.scroll-progress-hairline` in styles.css). Older browsers fall back to the
 * passive listener below - still cheaper than the Framer `useScroll` + `useSpring` pair it
 * replaced, which kept a spring RAF alive on every page for the life of the session.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Native scroll-timeline drives the bar in CSS; no JS needed.
    if (CSS.supports("animation-timeline", "scroll()")) return;

    el.dataset.jsDriven = "";
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      el.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="scroll-progress-hairline fixed inset-x-0 top-0 z-70 h-[2px] origin-left bg-[linear-gradient(90deg,transparent,var(--color-primary)_35%,#f0f0f2_100%)]"
    />
  );
}
