import { Check, Link2 } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { GlowBlob } from "@/components/shared/GlowBlob";
import { CampaignSection } from "@/components/campaign/CampaignSection";
import type { CampaignConfig } from "@/lib/campaigns/types";

/** The signature "Build / Intelligence / Grow -> One Connected System" panel.
 * Three pillars converge visually into a single glowing node, echoing the
 * page's core positioning without duplicating the funnel or system sections. */
export function CampaignWhyEthixweb({ config }: { config: CampaignConfig }) {
  const { whyEthixweb } = config;

  return (
    <CampaignSection band>
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm uppercase tracking-widest text-primary-text">
            {whyEthixweb.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold text-gradient pb-1 sm:text-5xl">
            {whyEthixweb.headline}
          </h2>
        </div>
      </Reveal>

      <div className="relative mt-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {whyEthixweb.pillars.map((pillar, i) => (
            <Reveal key={pillar.key} delay={i * 0.08}>
              <div className="glass-strong relative h-full overflow-hidden rounded-3xl p-7">
                {i === 1 && <GlowBlob size="sm" color="primary" className="-top-10 right-0" />}
                <pillar.icon className="relative h-9 w-9 text-primary" strokeWidth={1.5} />
                <h3 className="relative mt-5 font-display text-xl font-semibold">{pillar.title}</h3>
                <ul className="relative mt-4 space-y-2.5">
                  {pillar.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.24}>
          <div className="relative mt-6 flex justify-center">
            <div className="hidden lg:block absolute -top-10 left-1/2 h-10 w-px -translate-x-1/2 bg-gradient-to-b from-transparent to-primary/40" />
            <div className="glass inline-flex items-center gap-2.5 rounded-full px-6 py-3">
              <Link2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">One connected system</span>
            </div>
          </div>
        </Reveal>
      </div>
    </CampaignSection>
  );
}
