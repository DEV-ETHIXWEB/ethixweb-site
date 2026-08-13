import { createFileRoute } from "@tanstack/react-router";
import { googleAdsManagement } from "@/lib/campaigns/google-ads-management";
import { buildCampaignHead } from "@/lib/campaigns/seo";
import { CampaignLandingPage } from "@/components/campaign/CampaignLandingPage";

// Top-level Google Ads management campaign landing page. Deliberately a
// sibling of /marketing (the general marketing overview page), not nested
// under it - /marketing/google-ads-management does not exist and should
// not be created. Thin wrapper: all content lives in src/lib/campaigns/
// google-ads-management.ts.
export const Route = createFileRoute("/google-ads-management")({
  head: () => buildCampaignHead(googleAdsManagement),
  component: Page,
});

function Page() {
  return <CampaignLandingPage config={googleAdsManagement} />;
}
