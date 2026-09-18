import { useEffect, useRef } from "react";

/** Freezes an element's infinite CSS animations while it is scrolled out of view.
 *
 * Decorative loops (SVG pulses, dash flows, glow filters) keep ticking on the main
 * thread even when nobody can see them, invalidating style and paint every frame -
 * which is exactly what makes scrolling elsewhere on the page stutter. Toggling a
 * `data-offscreen` attribute pauses them via the rule in styles.css; they resume
 * from the same frame when scrolled back, so there is no visible restart. */
export function usePauseOffscreen<T extends Element>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.removeAttribute("data-offscreen");
        else el.setAttribute("data-offscreen", "");
      },
      // Resume slightly before it enters the viewport so it is already moving.
      { rootMargin: "150px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
