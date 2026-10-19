import { useEffect, useRef, type ReactNode } from "react";

/** ONE IntersectionObserver shared by every Reveal on the page.
 *
 * This component is used ~200 times per page. Giving each instance its own
 * Framer Motion component + observer + timer cost seconds of main-thread work
 * on hydration (Lighthouse: 2.1s total blocking time, "avoid non-composited
 * animations"). The reveal is a plain opacity/transform fade, so it is now a
 * CSS transition - which the compositor runs off the main thread - driven by a
 * single observer that flips one attribute per element. */
let sharedObserver: IntersectionObserver | null = null;

function getObserver() {
  if (sharedObserver) return sharedObserver;
  sharedObserver = new IntersectionObserver(
    (entries, obs) => {
      // Any callback at all proves the observer works - including one where
      // nothing is intersecting yet, which is the normal first call for
      // elements below the fold.
      markObserverWorking();
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-revealed", "");
        obs.unobserve(entry.target);
      }
    },
    // Mirrors the previous useInView({ margin: "-80px" }).
    { rootMargin: "-80px" },
  );
  return sharedObserver;
}

/** Safety net for the whole page instead of one timer per instance: if an
 * observer never fires (older iOS Safari has known rootMargin bugs), reveal
 * everything at once. `.reveal-fallback` is handled in styles.css.
 *
 * This used to fire unconditionally 1.4s after the first Reveal mounted, and
 * nothing ever removed the class - so on every page load the entire document
 * was forced visible after 1.4 seconds and the scroll reveal this component
 * exists for never ran for anything below the fold. The timer now only
 * trips when the observer has produced no callback at all, which is the one
 * situation it was written for; a working observer marks the document ready
 * and cancels it. */
let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
let observerFired = false;

function markObserverWorking() {
  observerFired = true;
  if (typeof document !== "undefined") {
    // Tells the independent in-head fallback in __root.tsx to stand down.
    document.documentElement.setAttribute("data-reveal-ready", "");
  }
  if (fallbackTimer) {
    clearTimeout(fallbackTimer);
    fallbackTimer = null;
  }
}

function armFallback() {
  if (fallbackTimer || observerFired || typeof document === "undefined") return;
  fallbackTimer = setTimeout(() => {
    fallbackTimer = null;
    if (!observerFired) document.documentElement.classList.add("reveal-fallback");
  }, 1400);
}

export function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li";
}) {
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    armFallback();
    const obs = getObserver();
    obs.observe(el);
    return () => obs.unobserve(el);
  }, []);

  const Tag = as;

  return (
    <Tag
      ref={ref}
      data-reveal=""
      className={className}
      style={delay ? ({ "--reveal-delay": `${delay}s` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
