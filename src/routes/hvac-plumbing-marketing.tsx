import { createFileRoute } from "@tanstack/react-router";
import { hvacPlumbingMarketing } from "@/lib/campaigns/hvac-plumbing-marketing";
import { buildCampaignHead } from "@/lib/campaigns/seo";
import { CampaignLandingPage } from "@/components/campaign/CampaignLandingPage";

// National-capable Google Ads campaign landing page for HVAC and plumbing
// contractors. Thin wrapper around the shared campaign system - all content
// lives in src/lib/campaigns/hvac-plumbing-marketing.ts. A future location
// variant (e.g. /hvac-plumbing-marketing/seattle) is a new config + route
// file shaped like this one, not a rewrite of this page.
export const Route = createFileRoute("/hvac-plumbing-marketing")({
  head: () => buildCampaignHead(hvacPlumbingMarketing),
  component: Page,
});

function Page() {
  return <CampaignLandingPage config={hvacPlumbingMarketing} />;
}
