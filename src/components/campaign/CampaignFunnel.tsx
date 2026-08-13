import { Reveal } from "@/components/shared/Reveal";
import { EngagementRhythm } from "@/components/shared/EngagementRhythm";
import { CampaignSection } from "@/components/campaign/CampaignSection";
import type { CampaignConfig } from "@/lib/campaigns/types";

export function CampaignFunnel({ config }: { config: CampaignConfig }) {
  const { funnel } = config;

  return (
    <CampaignSection band>
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm uppercase tracking-widest text-primary-text">{funnel.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-gradient pb-1 sm:text-5xl">
            {funnel.headline}
          </h2>
        </div>
      </Reveal>
      <div className="mt-16">
        <EngagementRhythm
          steps={funnel.steps.map((s) => ({ icon: s.icon, t: s.title, d: s.description }))}
        />
      </div>
    </CampaignSection>
  );
}
