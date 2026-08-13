import { createFileRoute } from "@tanstack/react-router";
import { googleAdsManagement } from "@/lib/campaigns/google-ads-management";
import { buildCampaignHead } from "@/lib/campaigns/seo";
import { CampaignLandingPage } from "@/components/campaign/CampaignLandingPage";

// Top-level Google Ads management campaign landing page (Campaign 3, ad
// groups 3A-3C). Deliberately a sibling of /marketing (the general marketing
// overview page), not nested under it. Thin wrapper: all content lives in
// src/lib/campaigns/google-ads-management.ts.
export const Route = createFileRoute("/google-ads-management")({
  head: () => buildCampaignHead(googleAdsManagement),
  component: Page,
});

function Page() {
  return <CampaignLandingPage config={googleAdsManagement} />;
}
