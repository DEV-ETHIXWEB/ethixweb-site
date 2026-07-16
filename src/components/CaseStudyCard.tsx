import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  HeartPulse,
  Hammer,
  Sailboat,
  Fish,
  Scale,
  Leaf,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { AnimatedStat } from "./AnimatedStat";
import { WebSpotlight } from "./WebSpotlight";
import { trackWebSpotlight } from "@/lib/web-spotlight";
import type { CaseStudy } from "@/lib/portfolio-data";

const INDUSTRY_ICONS: Record<string, LucideIcon> = {
  Healthcare: HeartPulse,
  "Home & Cabinetry": Hammer,
  "Marine & Boating": Sailboat,
  "Outdoor & Recreation": Fish,
  "Legal & Financial": Scale,
  "Wellness & DTC": Leaf,
};

/** Featured case study card. The visual zone is a forced-dark branded panel
 * (outlined monogram watermark + industry icon + year) with the study's
 * headline metric overlaid - the result is the selling point, so it's always
 * visible instead of hidden behind hover. Hovering crossfades the panel into
 * the challenge/approach story. No real client screenshots exist yet, so the
 * panel stays an honest abstract treatment, not a fabricated screenshot. */
export function CaseStudyCard({ study, index }: { study: CaseStudy; index: number }) {
  const reduceMotion = useReducedMotion();
  const Icon = INDUSTRY_ICONS[study.industry] ?? HeartPulse;
  const monogram = study.client.charAt(0);
  const [heroMetric, ...restMetrics] = study.metrics;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -5 }}
      onMouseMove={trackWebSpotlight}
      className="premium-card group relative flex flex-col overflow-hidden rounded-3xl transition-shadow duration-300 hover:shadow-lg"
      style={{ transformOrigin: "center" }}
    >
      {/* ── Visual zone: branded dark panel <-> story crossfade, fixed height.
          Forced-dark in both themes, so colors are hardcoded. ── */}
      <div className="relative h-60 shrink-0 overflow-hidden bg-[linear-gradient(135deg,#3a0b0d_0%,#1c0607_55%,#120405_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_0%,rgba(157,27,32,0.35),transparent_70%)] transition-opacity duration-300 group-hover:opacity-0" />
        <div className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-0">
          {/* Outlined monogram watermark */}
          <span className="absolute -right-3 bottom-0 select-none font-display text-[11rem] font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.10)]">
            {monogram}
          </span>
          {/* Browser chrome hint */}
          <div className="absolute inset-x-5 top-5 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="ml-2 h-2 w-24 rounded-full bg-white/10" />
            <span className="ml-auto rounded-full border border-white/15 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-white/60">
              {study.year}
            </span>
          </div>
          {/* Headline metric - the payoff, visible by default */}
          {heroMetric && (
            <div className="absolute bottom-5 left-5">
              <AnimatedStat
                value={heroMetric.value}
                className="block font-display text-5xl font-extrabold text-white"
              />
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-white/60">
                {heroMetric.label}
              </p>
            </div>
          )}
          <span className="absolute bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-glow ring-1 ring-white/20">
            <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
          </span>
        </div>

        {/* Story overlay - the "detail preview" on hover/focus */}
        <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#1a1a1c] to-[#0d0d0f] p-6 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/45">
            The challenge
          </p>
          <p className="mt-1.5 line-clamp-3 translate-y-1 text-sm leading-relaxed text-white/80 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            {study.challenge}
          </p>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-white/45">
            Our approach
          </p>
          <p className="mt-1.5 line-clamp-2 translate-y-1 text-sm leading-relaxed text-white/80 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            {study.approach}
          </p>
        </div>

        <WebSpotlight size="lg" />
      </div>

      {/* ── Text zone ── */}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <span>{study.industry}</span>
          <span>{study.client}</span>
        </div>
        <h3 className="mt-3 font-display text-xl font-bold leading-snug text-foreground transition-colors duration-300 group-hover:text-primary">
          {study.headline}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {study.impact}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {study.services.map((s) => (
            <span
              key={s}
              className="rounded-full border border-border bg-foreground/[0.03] px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </div>

        {/* Remaining metrics + CTA - all visible, nothing reserved for hover */}
        <div className="mt-5 flex flex-1 items-end justify-between gap-4 border-t border-border pt-4">
          <div className="flex gap-6">
            {restMetrics.slice(0, 2).map((m) => (
              <div key={m.label}>
                <AnimatedStat
                  value={m.value}
                  className="block font-display text-lg font-extrabold text-gradient-brand sm:text-xl"
                />
                <p className="mt-0.5 text-[10.5px] leading-tight text-muted-foreground">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
          <Link
            to="/contact"
            aria-label={`Start a project like ${study.client}`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <ArrowUpRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:rotate-45" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
