import { createFileRoute } from "@tanstack/react-router";
import { hvacPlumbingMarketing } from "@/lib/campaigns/hvac-plumbing-marketing";
import { buildCampaignHead } from "@/lib/campaigns/seo";
import { CampaignLandingPage } from "@/components/campaign/CampaignLandingPage";

// Google Ads campaign landing page for plumbing/HVAC marketing intent
// (Campaign 1, ad groups 1A-1D). Thin wrapper: all content lives in
// src/lib/campaigns/hvac-plumbing-marketing.ts.
export const Route = createFileRoute("/hvac-plumbing-marketing")({
  head: () => buildCampaignHead(hvacPlumbingMarketing),
  component: Page,
});

function Page() {
  return <CampaignLandingPage config={hvacPlumbingMarketing} />;
}
