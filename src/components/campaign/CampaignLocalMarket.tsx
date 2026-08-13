import { Compass, Waves } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { CampaignSection } from "@/components/campaign/CampaignSection";
import type { CampaignConfig } from "@/lib/campaigns/types";

export function CampaignLocalMarket({ config }: { config: CampaignConfig }) {
  const { localMarket } = config;
  if (!localMarket) return null;

  return (
    <CampaignSection>
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-1.5 text-sm uppercase tracking-widest text-primary-text">
            <Compass className="h-4 w-4" /> Local market
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold text-gradient pb-1 sm:text-5xl">
            {localMarket.headline}
          </h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">{localMarket.body}</p>
        </div>
      </Reveal>
      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {localMarket.points.map((p, i) => (
          <Reveal key={p} delay={i * 0.05}>
            <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-4">
              <Waves className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm">{p}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </CampaignSection>
  );
}
