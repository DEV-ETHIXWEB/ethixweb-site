import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { GlowBlob } from "@/components/shared/GlowBlob";
import { Reveal } from "@/components/shared/Reveal";
import type { CampaignConfig } from "@/lib/campaigns/types";
import type { CampaignMeta } from "@/lib/campaigns/tracking";
import { trackCampaignEvent } from "@/lib/campaigns/tracking";

export function CampaignHero({ config, meta }: { config: CampaignConfig; meta: CampaignMeta }) {
  return (
    <section className="relative -mt-24 overflow-hidden bg-gradient-hero pb-16 pt-36 sm:pb-20 sm:pt-40">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <GlowBlob size="lg" color="primary" className="top-0 left-1/2 -translate-x-1/2" />
      <Container className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <Reveal>
          <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.3em] text-primary-text">
            {config.hero.eyebrow}
          </p>
          <h1 className="mt-5 font-display text-5xl font-bold leading-[1.1] text-gradient pb-1 sm:text-6xl lg:text-7xl">
            {config.hero.headline}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
            {config.hero.subheadline}
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="#audit-form"
              onClick={() =>
                trackCampaignEvent("campaign_cta_click", meta, { cta: "hero_primary" })
              }
              className="btn-primary shine-cta group inline-flex min-w-[220px] items-center justify-center gap-2 rounded-full border border-transparent px-7 py-3.5 font-bold"
            >
              {config.hero.primaryCta}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <Link
              to="/contact"
              onClick={() =>
                trackCampaignEvent("campaign_cta_click", meta, { cta: "hero_secondary" })
              }
              className="btn-secondary group inline-flex min-w-[200px] items-center justify-center gap-2 rounded-full px-7 py-3.5 font-bold"
            >
              {config.hero.secondaryCta}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">{config.hero.trustMessage}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <CampaignHeroSystemCard config={config} />
        </Reveal>
      </Container>
    </section>
  );
}

/** Live flow-strip system demo: a glowing head travels the rail on a loop,
 * and each node lights up (ring pulse + icon glow) the moment the head
 * reaches it - the same "state, not decoration" language as the funnel's
 * EngagementRhythm component. Nodes are also clickable: focusing/hovering
 * one pins the active stage so a visitor can inspect the sequence at their
 * own pace instead of only watching it loop. Purely CSS/transform driven
 * plus one requestAnimationFrame loop, so it stays cheap on mobile. */
function CampaignHeroSystemCard({ config }: { config: CampaignConfig }) {
  const reduce = useReducedMotion();
  const { flow, points, flowLabel } = config.hero;
  const n = flow.length;

  const [autoIndex, setAutoIndex] = useState(0);
  // Click pins a stage permanently (until a different one is clicked).
  // Hover only *previews* a stage while nothing is pinned - it never clears
  // a click, so moving the mouse away right after clicking (the ordinary
  // case for every real user) can't wipe out the selection.
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const activeIndex = clickedIndex ?? hoverIndex ?? autoIndex;

  // Advance the auto-playing active stage on a fixed beat. Paused entirely
  // under reduced motion (activeIndex then just stays at 0, no flashing).
  // Also paused once a stage is pinned, so the visitor's choice sticks.
  useEffect(() => {
    if (reduce || clickedIndex !== null) return;
    const id = window.setInterval(() => {
      setAutoIndex((i) => (i + 1) % n);
    }, 1400);
    return () => window.clearInterval(id);
  }, [reduce, n, clickedIndex]);

  const progressPct = n > 1 ? (activeIndex / (n - 1)) * 100 : 0;

  return (
    <div className="premium-card relative mx-auto max-w-md overflow-hidden rounded-[2rem] p-6 sm:p-7">
      <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/25 blur-3xl" />
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary-text">{flowLabel}</p>
      <div className="relative mt-6">
        <div
          aria-hidden="true"
          className="absolute left-[10%] right-[10%] top-[22px] h-px bg-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute left-[10%] top-[22px] h-px bg-gradient-to-r from-primary/40 to-primary transition-[width] duration-500 ease-out"
          style={{ width: `${(progressPct / 100) * 80}%` }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute top-[22px] h-2 w-2 -translate-y-1/2 rounded-full bg-primary"
          style={{ boxShadow: "0 0 12px 4px rgba(229,29,37,0.7)" }}
          animate={{ left: `${10 + (progressPct / 100) * 80}%` }}
          transition={reduce ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
        />
        <div
          className="relative flex items-center justify-between"
          role="tablist"
          aria-label={`${flowLabel} stages`}
        >
          {flow.map((step, i) => {
            const active = i === activeIndex;
            return (
              <button
                key={step.label}
                type="button"
                role="tab"
                aria-selected={active}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                onFocus={() => setHoverIndex(i)}
                onBlur={() => setHoverIndex(null)}
                onClick={() => setClickedIndex(i)}
                className="flex flex-1 flex-col items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 ${
                    active
                      ? "border-primary/60 bg-primary/15 shadow-[0_0_0_4px_rgba(229,29,37,0.12)]"
                      : "border-white/10 bg-white/[0.05]"
                  }`}
                >
                  <step.icon
                    className={`h-5 w-5 transition-colors duration-300 ${active ? "text-primary" : "text-primary/70"}`}
                    strokeWidth={1.75}
                  />
                </span>
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wide transition-colors duration-300 ${
                    active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-7 space-y-3 border-t border-white/10 pt-6">
        {points.map((item) => (
          <div key={item.label} className="flex items-center gap-3 text-sm">
            <item.icon className="h-4 w-4 shrink-0 text-primary" />
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
