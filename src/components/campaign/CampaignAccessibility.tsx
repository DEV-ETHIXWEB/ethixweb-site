import { Check, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { CampaignSection } from "@/components/campaign/CampaignSection";
import type { CampaignConfig } from "@/lib/campaigns/types";

export function CampaignAccessibility({ config }: { config: CampaignConfig }) {
  const { accessibility } = config;

  return (
    <CampaignSection compact narrow>
      <Reveal>
        <div className="glass rounded-[2rem] p-8 sm:p-10">
          <p className="inline-flex items-center gap-1.5 text-sm uppercase tracking-widest text-primary-text">
            <ShieldCheck className="h-4 w-4" /> Accessibility
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold text-gradient pb-1 sm:text-4xl">
            {accessibility.headline}
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {accessibility.points.map((p) => (
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
