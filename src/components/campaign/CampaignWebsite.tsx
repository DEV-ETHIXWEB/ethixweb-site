import { Check } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { CampaignSection } from "@/components/campaign/CampaignSection";
import type { CampaignConfig } from "@/lib/campaigns/types";

export function CampaignWebsite({ config }: { config: CampaignConfig }) {
  const { website } = config;

  return (
    <CampaignSection innerClassName="grid items-center gap-12 lg:grid-cols-2">
      <Reveal>
        <p className="text-sm uppercase tracking-widest text-primary-text">{website.eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl font-bold text-gradient pb-1 sm:text-5xl">
          {website.headline}
        </h2>
        <p className="mt-5 text-muted-foreground leading-relaxed">{website.body}</p>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="glass-strong rounded-3xl p-7 sm:p-8">
          <ul className="space-y-3.5">
            {website.points.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </CampaignSection>
  );
}
