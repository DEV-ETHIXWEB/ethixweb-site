import { Check } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { CampaignSection } from "@/components/campaign/CampaignSection";
import type { CampaignConfig } from "@/lib/campaigns/types";

export function CampaignAds({ config }: { config: CampaignConfig }) {
  const { ads } = config;

  return (
    <CampaignSection innerClassName="grid gap-12 lg:grid-cols-2">
      <Reveal>
        <p className="text-sm uppercase tracking-widest text-primary-text">{ads.eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl font-bold text-gradient pb-1 sm:text-5xl">
          {ads.headline}
        </h2>
        <p className="mt-5 text-muted-foreground leading-relaxed">{ads.intro}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {ads.searchExamples.map((s) => (
            <span
              key={s}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          Examples only, not a guarantee of specific search volume, rankings or leads.
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="glass-strong rounded-3xl p-7 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary-text">
            Our approach
          </p>
          <ul className="mt-5 space-y-3.5">
            {ads.approach.map((a) => (
              <li key={a} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </CampaignSection>
  );
}
