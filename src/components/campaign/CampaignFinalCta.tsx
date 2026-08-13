import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { CampaignSection } from "@/components/campaign/CampaignSection";
import type { CampaignConfig } from "@/lib/campaigns/types";
import type { CampaignMeta } from "@/lib/campaigns/tracking";
import { trackCampaignEvent } from "@/lib/campaigns/tracking";

export function CampaignFinalCta({ config, meta }: { config: CampaignConfig; meta: CampaignMeta }) {
  const { finalCta } = config;

  return (
    <CampaignSection className="pb-20 pt-4 sm:pb-24 sm:pt-4">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-brand p-8 text-center sm:p-12">
          <h2 className="font-display text-4xl font-bold text-primary-foreground pb-1 sm:text-5xl">
            {finalCta.headline}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-primary-foreground/90">{finalCta.body}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#audit-form"
              onClick={() =>
                trackCampaignEvent("campaign_cta_click", meta, { cta: "final_primary" })
              }
              className="inline-flex min-w-[220px] items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 font-bold text-[#0c0d10] transition-transform hover:scale-[1.03]"
            >
              {finalCta.primaryCta} <ArrowUpRight className="h-4 w-4" />
            </a>
            <Link
              to="/contact"
              onClick={() =>
                trackCampaignEvent("campaign_cta_click", meta, { cta: "final_secondary" })
              }
              className="inline-flex min-w-[200px] items-center justify-center gap-2 rounded-full border border-white/40 px-7 py-3.5 font-bold text-primary-foreground transition hover:bg-white/10"
            >
              {finalCta.secondaryCta} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Reveal>
    </CampaignSection>
  );
}
