import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  HeartPulse,
  Hammer,
  Sailboat,
  Fish,
  Scale,
  Leaf,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { AnimatedStat } from "@/components/portfolio/AnimatedStat";
import { WebSpotlight } from "@/components/shared/WebSpotlight";
import { trackWebSpotlight } from "@/lib/web-spotlight";
import { hasCaseStudyDetail } from "@/data/case-studies";
import type { CaseStudy } from "@/lib/portfolio-data";

const INDUSTRY_ICONS: Record<string, LucideIcon> = {
  "Local Home Services": Wrench,
  Healthcare: HeartPulse,
  "Home & Cabinetry": Hammer,
  "Marine & Boating": Sailboat,
  "Outdoor & Recreation": Fish,
  "Legal & Financial": Scale,
  "Wellness & DTC": Leaf,
};

/** Featured case study card, following the approved "Our Work" design: the
 * whole card is the project visual - a real screenshot when one exists, an
 * honest branded panel when none does (never a fabricated screenshot) - with
 * a white plate docked in the top-left corner carrying the title, and the
 * service + year pills floating on the visual beside it. On desktop the plate
 * only drops open when the pointer is over the white heading plate itself
 * (or on keyboard focus anywhere in the card), revealing the story, metric
 * tiles and the "View Case Study" CTA; below lg there is no hover, so the
 * plate ships expanded and nothing is unreachable on touch. */
export function CaseStudyCard({ study, index }: { study: CaseStudy; index: number }) {
  const Icon = INDUSTRY_ICONS[study.industry] ?? HeartPulse;
  const monogram = study.client.charAt(0);
  const hasDetail = hasCaseStudyDetail(study.slug);
  const heroMetric = study.metrics[0];

  // `open` drives every desktop expansion class. It flips on pointer-hover of
  // the white heading plate only (not the whole card), and on keyboard focus
  // anywhere in the card for accessibility. Below lg the plate is always
  // expanded via the base classes, so `open` is only ever read through lg:
  // variants. Two cheap booleans - no layout reads, no per-frame work.
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const open = hovered || focused;

  return (
    <motion.article
      layout
      // Only re-project the card's layout when its position in the list
      // actually changes (filtering) - NOT on every hover-state re-render.
      // Without this, toggling `open` re-measures the box each time and the
      // backdrop-filtered card micro-jitters at its edges.
      layoutDependency={index}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      // No transform-based hover lift: translating a backdrop-filter card
      // re-samples the blur at subpixel offsets every frame, which reads as a
      // quiver/shimmer along the top edge. Hover feedback is the shadow shift
      // on `.premium-card:hover` + `hover:shadow-lg`, which never moves the
      // backdrop and so stays perfectly still.
      onMouseMove={trackWebSpotlight}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      className="premium-card group relative h-[27rem] overflow-hidden rounded-3xl transition-shadow duration-300 hover:shadow-lg"
      style={{ transformOrigin: "center" }}
    >
      {/* ── Visual: full-bleed screenshot or branded dark panel.
          Forced-dark fallback in both themes, so its colors are hardcoded. ── */}
      <div className="absolute inset-0 overflow-hidden bg-[linear-gradient(135deg,#3a0b0d_0%,#1c0607_55%,#120405_100%)]">
        {study.image ? (
          <>
            <img
              src={study.image.src}
              alt={study.image.alt}
              width={study.image.width}
              height={study.image.height}
              loading="lazy"
              className={`h-full w-full object-cover object-top transition-transform duration-500 ${open ? "lg:scale-[1.03]" : ""}`}
            />
            {/* Top scrim so the floating pills stay legible over busy screenshots */}
            <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(18,4,5,0.45),transparent)]" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_0%,rgba(157,27,32,0.35),transparent_70%)]" />
            <div className="absolute inset-0 grid-bg" />
            {/* Outlined monogram watermark */}
            <span className="absolute -right-3 bottom-0 select-none font-display text-[11rem] font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.10)]">
              {monogram}
            </span>
            {/* Abstract browser-window sketch - fills the panel with a "site
                being built" texture while staying clearly a placeholder, not
                a fabricated screenshot */}
            <div className="absolute -right-8 top-[32%] h-[85%] w-[66%] rotate-[4deg] rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-white/15" />
                <span className="h-2 w-2 rounded-full bg-white/15" />
                <span className="h-2 w-2 rounded-full bg-white/15" />
                <span className="ml-2 h-2 w-20 rounded-full bg-white/10" />
              </div>
              <div className="mt-4 h-2.5 w-3/4 rounded-full bg-white/10" />
              <div className="mt-2 h-2.5 w-1/2 rounded-full bg-white/[0.07]" />
              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="h-12 rounded-lg bg-white/[0.07]" />
                <div className="h-12 rounded-lg bg-white/[0.04]" />
                <div className="h-12 rounded-lg bg-white/[0.04]" />
              </div>
              <div className="mt-3 h-16 rounded-lg bg-gradient-to-br from-primary/25 to-transparent" />
            </div>
          </>
        )}
        {/* Bottom scrim so the metric overlay and pills stay legible on both
            screenshots and the dark panel */}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(0deg,rgba(18,4,5,0.8),transparent)]" />
        {/* Headline metric - the payoff while the plate is collapsed. Fades
            out when the plate expands (the tiles take over), and stays hidden
            below lg where the plate is always expanded. */}
        {heroMetric && (
          <div
            className={`absolute bottom-5 left-5 hidden transition-opacity duration-300 lg:block ${open ? "lg:opacity-0" : ""}`}
          >
            <AnimatedStat
              value={heroMetric.value}
              className="block font-display text-4xl font-extrabold text-white"
            />
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-white/60">
              {heroMetric.label}
            </p>
          </div>
        )}
        <span className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-glow ring-1 ring-white/20">
          <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
        </span>
        <WebSpotlight size="lg" />
      </div>

      {/* ── Left plate + service/year pills on the visual. The container is
          pointer-events-none so its large transparent area never intercepts
          hover or clicks meant for the visual link beneath it - only the
          opaque plate re-enables pointer events. z-20 lifts the plate above
          the full-card visual link (z-10) so the plate can catch its own
          hover; the plate then carries its own case-study link. ── */}
      <div className="pointer-events-none absolute inset-0 z-20 flex justify-between gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-[24rem]">
          {/* Inverted corner fillets that melt the plate into the card edges -
              same radius as rounded-br-3xl, drawn with the card token so they
              track both themes */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-full top-0 h-6 w-6 bg-[radial-gradient(circle_at_100%_100%,transparent_23.5px,var(--card)_24px)]"
          />
          {/* Bottom fillet only exists while collapsed on lg - its offset must
              match the lg:max-h cap on the plate below */}
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute left-0 top-[8.5rem] hidden h-6 w-6 bg-[radial-gradient(circle_at_100%_100%,transparent_23.5px,var(--card)_24px)] transition-opacity duration-200 lg:block ${open ? "lg:opacity-0" : ""}`}
          />

          {/* The white heading plate - the ONLY hover target. It ships as an
              8.5rem title bar on lg and grows to full height on hover/focus;
              because the same element grows under the cursor there is no
              hover flicker. onMouseEnter/Leave scope the drop-down strictly
              to this plate. */}
          <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={`pointer-events-auto relative flex h-full max-h-full flex-col overflow-hidden rounded-br-3xl bg-card shadow-[0_24px_48px_-24px_rgba(0,0,0,0.55)] transition-[max-height] duration-500 ease-out ${open ? "lg:max-h-full" : "lg:max-h-[8.5rem]"}`}
          >
            {/* Whole-plate case-study link (mouse only - keyboard uses the
                visual link below, so this stays aria-hidden to avoid a
                duplicate). Transparent, on top of the decorative content. */}
            {hasDetail && (
              <Link
                to="/portfolio/$slug"
                params={{ slug: study.slug }}
                aria-hidden="true"
                tabIndex={-1}
                className="absolute inset-0 z-10"
              />
            )}
            <div className="px-5 pt-5 sm:px-6 sm:pt-6">
              <h3
                className={`font-display text-xl font-bold leading-snug text-foreground transition-colors duration-300 sm:text-2xl ${open ? "lg:text-primary" : ""}`}
              >
                {study.client}
              </h3>

              {/* Collapsed-state arrow - desktop only, swapped out once the
                  plate expands on hover/focus */}
              <span
                aria-hidden="true"
                className={`mt-4 hidden h-9 w-9 items-center justify-center rounded-full border border-border text-foreground ${open ? "lg:hidden" : "lg:inline-flex"}`}
              >
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>

            {/* Expandable detail - always open below lg, hover/focus-open on lg+ */}
            <div
              className={`grid flex-1 [grid-template-rows:1fr] transition-[grid-template-rows] duration-500 ease-out ${open ? "lg:[grid-template-rows:1fr]" : "lg:[grid-template-rows:0fr]"}`}
            >
              <div className="flex min-h-0 flex-col overflow-hidden px-5 pb-5 sm:px-6 sm:pb-6">
                <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {study.impact}
                </p>

                {study.metrics.length > 0 && (
                  <div
                    className={`mt-4 grid grid-cols-2 gap-2 ${study.metrics.length >= 3 ? "lg:grid-cols-3" : ""}`}
                  >
                    {study.metrics.slice(0, 3).map((m) => (
                      <div
                        key={m.label}
                        className="rounded-xl bg-foreground/[0.04] px-3 py-2.5 ring-1 ring-foreground/[0.06]"
                      >
                        <AnimatedStat
                          value={m.value}
                          className="block font-display text-base font-extrabold text-foreground"
                        />
                        <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-muted-foreground">
                          {m.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* mt-auto pins the CTA row to the plate's bottom edge once
                    the plate is full height; the inner mt-5 keeps a minimum
                    gap when space is tight */}
                {hasDetail ? (
                  // The whole plate is a stretched link to the case study
                  // (added above), so this row is a decorative indicator, not
                  // its own <a> - avoids nesting a second link inside the
                  // stretched one.
                  <div className="mt-auto">
                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                      <span className="text-sm font-bold text-foreground">View Case Study</span>
                      <span
                        aria-hidden="true"
                        className={`flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition-transform duration-300 ${open ? "lg:translate-x-0.5" : ""}`}
                      >
                        <ArrowRight className="h-4.5 w-4.5" />
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-auto">
                    <Link
                      to="/contact"
                      aria-label={`Start a project like ${study.client}`}
                      className="relative z-10 mt-5 flex items-center justify-between border-t border-border pt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                      <span className="text-sm font-bold text-foreground">Start a project</span>
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition-transform duration-300 ${open ? "lg:translate-x-0.5" : ""}`}
                      >
                        <ArrowRight className="h-4.5 w-4.5" />
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2 self-start p-4 xl:flex-row xl:items-center">
          <span className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-glow ring-1 ring-white/20">
            {study.services[0]}
          </span>
          <span className="rounded-full bg-black/45 px-3.5 py-1.5 text-xs font-bold text-white ring-1 ring-white/25 backdrop-blur-sm">
            {study.year}
          </span>
        </div>
      </div>

      {hasDetail && (
        <Link
          to="/portfolio/$slug"
          params={{ slug: study.slug }}
          aria-label={`View case study: ${study.client}`}
          className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        />
      )}
    </motion.article>
  );
}
