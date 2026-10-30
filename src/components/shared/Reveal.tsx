import { useEffect, useRef, type ReactNode } from "react";

/** Scroll-in reveal that never holds content back.
 *
 * Content is visible by default, straight from the server HTML. Only a block
 * that is still below the screen when the page boots is hidden, and it fades
 * in as it approaches. Nothing the visitor can already see is ever hidden.
 *
 * It used to work the other way round: every Reveal (~200 a page) started at
 * opacity 0 in CSS and waited for JavaScript to download, hydrate and fire an
 * observer before it could appear. On a mid-range phone that left the hero
 * without its intro, buttons and badge for ~1.2s after the page had painted
 * (live site, 4G profile: first paint 1.9s, hero complete 3.2s), added a
 * 0.45s fade to every page change, and made sections arrive empty while
 * scrolling, because a block only started to fade once it was 80px inside
 * the screen. Hiding below-the-fold blocks after boot happens where nobody is
 * looking, so the scroll-in effect survives with none of that waiting.
 *
 * ONE IntersectionObserver is shared by every instance, and the fade itself
 * is a CSS transition the compositor runs; see [data-reveal] in styles.css. */
let sharedObserver: IntersectionObserver | null = null;

/** Blocks the observer has already sorted into "on screen at mount" or
 * "below, hidden until it approaches". The first callback for an element
 * decides which; only the second kind needs a later callback. */
const classified = new WeakSet<Element>();

function getObserver() {
  if (sharedObserver) return sharedObserver;
  sharedObserver = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        const el = entry.target;
        if (!classified.has(el)) {
          classified.add(el);
          // On screen (or near it), or already scrolled past: leave it alone.
          // Below the screen: hide it now, unseen, and reveal it on approach.
          if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
            obs.unobserve(el);
          } else {
            el.setAttribute("data-reveal-pending", "");
          }
          continue;
        }
        if (entry.isIntersecting) {
          el.removeAttribute("data-reveal-pending");
          obs.unobserve(el);
        }
      }
    },
    // Start the fade a little before the block reaches the screen, so on a
    // phone it is already arriving as the thumb brings it into view rather
    // than appearing late. This used to be -80px: the fade only began once
    // the block was 80px inside the viewport.
    { rootMargin: "0px 0px 12% 0px" },
  );
  return sharedObserver;
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
    const obs = getObserver();
    obs.observe(el);
    return () => {
      obs.unobserve(el);
      classified.delete(el);
    };
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
