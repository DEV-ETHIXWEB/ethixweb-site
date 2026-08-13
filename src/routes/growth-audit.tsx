import { createFileRoute } from "@tanstack/react-router";
import { growthAudit } from "@/lib/campaigns/growth-audit";
import { buildCampaignHead } from "@/lib/campaigns/seo";
import { CampaignLandingPage } from "@/components/campaign/CampaignLandingPage";

// Single combined growth-marketing campaign landing page, used across ad
// campaigns for HVAC, plumbing, fishing/marine and general local-service
// growth traffic. Thin wrapper: all content lives in
// src/lib/campaigns/growth-audit.ts.
export const Route = createFileRoute("/growth-audit")({
  head: () => buildCampaignHead(growthAudit),
  component: Page,
});

function Page() {
  return <CampaignLandingPage config={growthAudit} />;
}
