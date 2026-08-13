import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { GlowBlob } from "@/components/shared/GlowBlob";
import { Reveal } from "@/components/shared/Reveal";
import { CampaignHeroForm } from "@/components/campaign/CampaignHeroForm";
import type { CampaignConfig } from "@/lib/campaigns/types";
import type { CampaignMeta } from "@/lib/campaigns/tracking";
import { trackCampaignEvent } from "@/lib/campaigns/tracking";

export function CampaignHero({ config, meta }: { config: CampaignConfig; meta: CampaignMeta }) {
  return (
    <section className="relative -mt-24 overflow-hidden bg-gradient-hero pb-16 pt-36 sm:pb-20 sm:pt-40">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <GlowBlob size="lg" color="primary" className="top-0 left-1/2 -translate-x-1/2" />
      <Container className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <Reveal>
          <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.3em] text-primary-text">
            {config.hero.eyebrow}
          </p>
          <h1 className="mt-5 font-display text-5xl font-bold leading-[1.1] text-gradient pb-1 sm:text-6xl lg:text-7xl">
            {config.hero.headline}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
            {config.hero.subheadline}
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              to="/contact"
              onClick={() =>
                trackCampaignEvent("campaign_cta_click", meta, { cta: "hero_secondary" })
              }
              className="btn-secondary group inline-flex min-w-[200px] items-center justify-center gap-2 rounded-full px-7 py-3.5 font-bold"
            >
              {config.hero.secondaryCta}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">{config.hero.trustMessage}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <CampaignHeroForm config={config} meta={meta} />
        </Reveal>
      </Container>
    </section>
  );
}
