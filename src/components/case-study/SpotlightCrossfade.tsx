import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/shared/Reveal";
import { Checklist } from "@/components/case-study/Checklist";
import { cn } from "@/lib/utils";
import type { SpotlightItem } from "@/data/case-studies/types";

const INTERVAL = 4500;

/** Design-approach spotlights that share ONE window: the first image + card
 * show, then the next fades in over the same frame (auto-cycling, or via the
 * dots). Reduced-motion users get no auto-cycle - they drive it with the dots. */
export function SpotlightCrossfade({ items }: { items: SpotlightItem[] }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || items.length < 2) return;
    const id = setInterval(() => setActive((a) => (a + 1) % items.length), INTERVAL);
    return () => clearInterval(id);
  }, [items.length, reduce]);

  const card = (item: SpotlightItem) => (
    <div className="glass-strong w-full rounded-b-[1.75rem] p-7 sm:rounded-[1.5rem] sm:p-8">
      <h3 className="font-display text-2xl font-bold leading-snug text-foreground">
        {item.card.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.card.description}</p>
      {item.card.checklist && <Checklist items={item.card.checklist} className="mt-5" />}
    </div>
  );

  return (
    <Reveal>
      <div className="px-6 sm:px-10 lg:px-[120px]">
        <div className="relative mx-auto max-w-[1440px]">
          {/* ── Shared image window: both photos stacked, crossfaded. ── */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-[1.75rem] sm:aspect-[2/1] sm:rounded-[1.75rem]">
            {items.map((item, i) => (
              <img
                key={i}
                src={item.image.src}
                alt={item.image.alt}
                width={item.image.width}
                height={item.image.height}
                loading="lazy"
                decoding="async"
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out",
                  item.focus === "top" && "object-top",
                  item.focus === "left" && "object-left",
                  (!item.focus || item.focus === "center") && "object-center",
                  i === active ? "opacity-100" : "opacity-0",
                )}
              />
            ))}

            {/* Floating cards (sm+): anchored right-center, crossfaded. */}
            <div className="pointer-events-none absolute inset-0 hidden sm:block">
              {items.map((item, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute right-8 top-1/2 w-[min(90vw,26rem)] -translate-y-1/2 transition-opacity duration-700 ease-out lg:right-12",
                    i === active ? "opacity-100" : "pointer-events-none opacity-0",
                  )}
                >
                  {card(item)}
                </div>
              ))}
            </div>
          </div>

          {/* Card below the window on mobile (only the active one, to avoid a
              tall stack). */}
          <div className="sm:hidden">
            {items.map((item, i) => (
              <div key={i} className={i === active ? "block" : "hidden"}>
                {card(item)}
              </div>
            ))}
          </div>

          {/* Dots - progress + manual control. */}
          {items.length > 1 && (
            <div className="mt-5 flex justify-center gap-2 sm:absolute sm:bottom-5 sm:left-6 sm:mt-0 sm:justify-start">
              {items.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show: ${item.card.title}`}
                  aria-current={i === active}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === active
                      ? "w-6 bg-primary"
                      : "w-2 bg-foreground/25 hover:bg-foreground/40 sm:bg-white/50 sm:hover:bg-white/80",
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}
