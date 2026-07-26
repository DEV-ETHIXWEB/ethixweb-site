import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Reveal } from "@/components/shared/Reveal";
import { getIcon } from "@/components/case-study/icon-map";
import type { InfoCard } from "@/data/case-studies/types";

/** The 3-up white card grid used by both the Context ("who/what/how") and
 * Snapshot ("what we did at a glance") sections - same card shell, only the
 * icon/logo + copy differ, so both sections share this one component.
 *
 * `glowLines` draws a red glowing line along one edge of each card, in
 * sequence across the row - card 1 top, card 2 bottom, card 3 top - once the
 * grid scrolls into view. */
export function InfoCardGrid({
  cards,
  glowLines = false,
}: {
  cards: readonly InfoCard[];
  glowLines?: boolean;
}) {
  // One shared in-view trigger for all glow lines, so they run in the intended
  // left-to-right sequence regardless of card height (tall tablet cards used to
  // trigger each card's top/bottom edge at different scroll points).
  const gridRef = useRef<HTMLDivElement>(null);
  const linesInView = useInView(gridRef, { once: true, margin: "-80px" });

  return (
    <div ref={gridRef} className="mt-10 grid gap-5 sm:grid-cols-3">
      {cards.map((card, i) => (
        <Reveal key={card.title} delay={i * 0.06}>
          <div className="relative h-full rounded-3xl border border-border bg-card p-7 shadow-sm">
            {glowLines && (
              <motion.span
                aria-hidden="true"
                // Edge per card: outer cards always top; the middle card sits on
                // top below lg (tablet/mobile) and flips to the bottom at lg+ to
                // keep the desktop top/bottom/top zigzag.
                className={`pointer-events-none absolute inset-x-6 h-[2px] origin-left rounded-full ${
                  i % 2 === 0 ? "top-0" : "top-0 lg:top-auto lg:bottom-0"
                }`}
                style={{
                  background:
                    "linear-gradient(90deg, rgba(229,29,37,0), rgba(229,29,37,0.95) 50%, rgba(229,29,37,0))",
                  boxShadow: "0 0 10px 2px rgba(229,29,37,0.6)",
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={linesInView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.5, ease: "easeOut" }}
              />
            )}
            {card.logo ? (
              <img
                src={card.logo.src}
                alt={card.logo.alt}
                width={card.logo.width}
                height={card.logo.height}
                loading="lazy"
                decoding="async"
                className="h-16 w-auto max-w-[170px] object-contain object-left"
              />
            ) : (
              (() => {
                const Icon = getIcon(card.icon);
                return <Icon className="h-10 w-10 text-primary-text" strokeWidth={1.6} />;
              })()
            )}
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-primary-text">
              {card.label}
            </p>
            <h3 className="mt-2 font-display text-xl font-bold text-foreground">{card.title}</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
              {card.description}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
