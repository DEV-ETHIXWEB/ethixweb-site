import { useEffect } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import type { CampaignConfig } from "@/lib/campaigns/types";
import type { CampaignMeta } from "@/lib/campaigns/tracking";
import { trackCampaignEvent, captureAttribution } from "@/lib/campaigns/tracking";
import { CampaignHero } from "@/components/campaign/CampaignHero";
import { CampaignProblem } from "@/components/campaign/CampaignProblem";
import { CampaignAiDemoSection } from "@/components/campaign/CampaignAiDemo";
import { CampaignAds } from "@/components/campaign/CampaignAds";
import { CampaignFunnel } from "@/components/campaign/CampaignFunnel";
import { CampaignLocalMarket } from "@/components/campaign/CampaignLocalMarket";
import { CampaignSeasonality } from "@/components/campaign/CampaignSeasonality";
import { CampaignWebsite } from "@/components/campaign/CampaignWebsite";
import { CampaignWhyEthixweb } from "@/components/campaign/CampaignWhyEthixweb";
import { CampaignCaseStudy } from "@/components/campaign/CampaignCaseStudy";
import { CampaignFaqSection } from "@/components/campaign/CampaignFaq";
import { CampaignFinalCta } from "@/components/campaign/CampaignFinalCta";
import { CampaignMobileCta } from "@/components/campaign/CampaignMobileCta";

/**
 * The reusable Google Ads campaign landing page shell. Every future
 * industry+location combination (HVAC/Seattle, plumbing/Seattle, fishing/
 * Portland, ...) is built by writing a new CampaignConfig in src/lib/campaigns
 * and a thin route file that renders <CampaignLandingPage config={...} />,
 * not by duplicating this component tree.
 */
export function CampaignLandingPage({ config }: { config: CampaignConfig }) {
  const meta: CampaignMeta = {
    industry: config.industry,
    location: config.location ? `${config.location.city}, ${config.location.state}` : "national",
    campaign: config.id,
    page: config.id,
  };

  useEffect(() => {
    captureAttribution();
    trackCampaignEvent("campaign_page_view", meta);
    // Only run once per mount - meta is derived from config.id, which is stable per page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SiteLayout>
      <CampaignHero config={config} meta={meta} />
      <CampaignProblem config={config} />
      <CampaignAiDemoSection config={config} />
      <CampaignAds config={config} />
      <CampaignFunnel config={config} />
      {config.localMarket && <CampaignLocalMarket config={config} />}
      {config.seasonality && <CampaignSeasonality config={config} />}
      <CampaignWebsite config={config} />
      <CampaignWhyEthixweb config={config} />
      <CampaignCaseStudy config={config} />
      <CampaignFaqSection config={config} />
      <CampaignFinalCta config={config} meta={meta} />
      <CampaignMobileCta config={config} meta={meta} />
    </SiteLayout>
  );
}
