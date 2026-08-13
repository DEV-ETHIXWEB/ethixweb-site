import { TrendingUp, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { CampaignSection } from "@/components/campaign/CampaignSection";
import type { CampaignConfig } from "@/lib/campaigns/types";

const STAGES = ["Problem", "Strategy", "Build", "Launch", "Result"] as const;

export function CampaignCaseStudy({ config }: { config: CampaignConfig }) {
  const { caseStudy } = config;
  const locationPrefix = config.location ? `${config.location.city}-Area ` : "";

  if (caseStudy.status === "coming-soon") {
    return (
      <CampaignSection compact narrow>
        <Reveal>
          <div className="glass relative overflow-hidden rounded-[2rem] border-dashed p-8 text-center sm:p-10">
            <TrendingUp className="mx-auto h-8 w-8 text-primary/60" strokeWidth={1.5} />
            <h2 className="mt-4 font-display text-2xl font-semibold">
              Real Results From a {locationPrefix}
              {config.industry} Business
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground leading-relaxed">
              This is where a real client story goes once we have one to share: problem, strategy,
              implementation, leads, bookings and cost per lead. Until then, the free growth audit
              is the fastest way to see our process and technology firsthand.
            </p>
          </div>
        </Reveal>
      </CampaignSection>
    );
  }

  return (
    <CampaignSection>
      <Reveal>
        <div className="text-center">
          <p className="text-sm uppercase tracking-widest text-primary-text">Case study</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-gradient pb-1 sm:text-5xl">
            {caseStudy.client}
          </h2>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {STAGES.map((stage, i) => (
            <span key={stage} className="flex items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {stage}
              </span>
              {i < STAGES.length - 1 && (
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50" />
              )}
            </span>
          ))}
        </div>
      </Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {[
          { label: "Problem", value: caseStudy.problem },
          { label: "Strategy", value: caseStudy.strategy },
          { label: "Build", value: caseStudy.build },
          { label: "Result", value: caseStudy.result },
        ]
          .filter((s) => s.value)
          .map((s, i) => (
            <Reveal key={s.label} delay={i * 0.05}>
              <div className="glass h-full rounded-2xl p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-primary-text">
                  {s.label}
                </p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.value}</p>
              </div>
            </Reveal>
          ))}
      </div>

      {caseStudy.metrics && caseStudy.metrics.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {caseStudy.metrics.map((m, i) => (
            <Reveal key={m.label} delay={i * 0.05}>
              <div className="glass-strong rounded-2xl p-6 text-center">
                <p className="font-display text-3xl font-bold text-gradient pb-1">{m.value}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                  {m.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </CampaignSection>
  );
}
