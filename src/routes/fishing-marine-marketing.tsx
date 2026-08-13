import { createFileRoute } from "@tanstack/react-router";
import { fishingMarineMarketing } from "@/lib/campaigns/fishing-marine-marketing";
import { buildCampaignHead } from "@/lib/campaigns/seo";
import { CampaignLandingPage } from "@/components/campaign/CampaignLandingPage";

// General, national-capable acquisition page for fishing & marine
// businesses. Distinct from /landing/fishing-marketing/seattle, which is a
// specific Seattle Google Ads destination - both routes stay live and serve
// different purposes. Thin wrapper: all content lives in src/lib/campaigns/
// fishing-marine-marketing.ts.
export const Route = createFileRoute("/fishing-marine-marketing")({
  head: () => buildCampaignHead(fishingMarineMarketing),
  component: Page,
});

function Page() {
  return <CampaignLandingPage config={fishingMarineMarketing} />;
}
