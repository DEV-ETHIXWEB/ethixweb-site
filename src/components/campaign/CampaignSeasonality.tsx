import { Reveal } from "@/components/shared/Reveal";
import { CampaignSection } from "@/components/campaign/CampaignSection";
import type { CampaignConfig } from "@/lib/campaigns/types";

export function CampaignSeasonality({ config }: { config: CampaignConfig }) {
  const { seasonality } = config;
  if (!seasonality) return null;

  return (
    <CampaignSection band>
      <Reveal>
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-widest text-primary-text">
            {seasonality.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold text-gradient pb-1 sm:text-5xl">
            {seasonality.headline}
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">{seasonality.body}</p>
        </div>
      </Reveal>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {seasonality.phases.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06}>
            <div className="glass h-full rounded-3xl p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-text">
                {s.label}
              </p>
              <h3 className="mt-3 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </CampaignSection>
  );
}
