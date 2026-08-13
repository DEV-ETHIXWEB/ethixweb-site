import { Check, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { CampaignSection } from "@/components/campaign/CampaignSection";
import type { CampaignConfig } from "@/lib/campaigns/types";

/** The website pitch, folded together with accessibility and (where set)
 * direct-ownership messaging - these were three separate stacked sections
 * making the same broader point ("your own site is the foundation"), now
 * told once. */
export function CampaignWebsite({ config }: { config: CampaignConfig }) {
  const { website, accessibility, ownership } = config;

  return (
    <CampaignSection innerClassName="grid items-center gap-12 lg:grid-cols-2">
      <Reveal>
        <p className="text-sm uppercase tracking-widest text-primary-text">{website.eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl font-bold text-gradient pb-1 sm:text-5xl">
          {website.headline}
        </h2>
        <p className="mt-5 text-muted-foreground leading-relaxed">{website.body}</p>
        {ownership && (
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{ownership.body}</p>
        )}
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
          <div className="mt-6 border-t border-white/10 pt-6">
            <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary-text">
              <ShieldCheck className="h-3.5 w-3.5" /> Accessibility
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{accessibility.headline}</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {accessibility.points.slice(0, 4).map((p) => (
                <li key={p} className="flex items-start gap-2 text-xs">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </CampaignSection>
  );
}
