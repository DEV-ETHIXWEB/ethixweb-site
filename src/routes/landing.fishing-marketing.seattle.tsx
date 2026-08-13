import { createFileRoute } from "@tanstack/react-router";
import { fishingMarketingSeattle } from "@/lib/campaigns/fishing-marketing-seattle";
import { buildCampaignHead } from "@/lib/campaigns/seo";
import { CampaignLandingPage } from "@/components/campaign/CampaignLandingPage";

// Google Ads landing page for Seattle / Puget Sound fishing and marine
// businesses. This route is intentionally thin: all content lives in the
// campaign config (src/lib/campaigns/fishing-marketing-seattle.ts) and all
// layout/behavior lives in the reusable campaign component tree (src/
// components/campaign/). A new industry+location page is a new config file
// + a route file shaped exactly like this one, not a new 1,000-line page.
export const Route = createFileRoute("/landing/fishing-marketing/seattle")({
  head: () => buildCampaignHead(fishingMarketingSeattle),
  component: Page,
});

function Page() {
  return <CampaignLandingPage config={fishingMarketingSeattle} />;
}
