import { Reveal } from "@/components/shared/Reveal";
import { CampaignSection } from "@/components/campaign/CampaignSection";
import type { CampaignConfig } from "@/lib/campaigns/types";

export function CampaignSystem({ config }: { config: CampaignConfig }) {
  const { systemSection } = config;

  return (
    <CampaignSection band compact>
      <Reveal>
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-widest text-primary-text">
            {systemSection.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold text-gradient pb-1 sm:text-5xl">
            {systemSection.headline}
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">{systemSection.body}</p>
        </div>
      </Reveal>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {systemSection.items.map((item, i) => (
          <Reveal key={item.label} delay={i * 0.05}>
            <div className="glass flex h-full items-center gap-4 rounded-2xl p-5">
              <item.icon className="h-8 w-8 shrink-0 text-primary" strokeWidth={1.5} />
              <span className="text-sm font-semibold">{item.label}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </CampaignSection>
  );
}
