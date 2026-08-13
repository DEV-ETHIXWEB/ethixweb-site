import { Reveal } from "@/components/shared/Reveal";
import { CampaignSection } from "@/components/campaign/CampaignSection";
import type { CampaignConfig } from "@/lib/campaigns/types";

export function CampaignOwnership({ config }: { config: CampaignConfig }) {
  const { ownership } = config;
  if (!ownership) return null;

  return (
    <CampaignSection band narrow innerClassName="text-center">
      <Reveal>
        <p className="text-sm uppercase tracking-widest text-primary-text">{ownership.eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl font-bold text-gradient pb-1 sm:text-5xl">
          {ownership.headline}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-muted-foreground leading-relaxed">
          {ownership.body}
        </p>
      </Reveal>
    </CampaignSection>
  );
}
