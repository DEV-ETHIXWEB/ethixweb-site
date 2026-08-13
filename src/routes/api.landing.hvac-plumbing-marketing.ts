import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createCampaignLeadHandler } from "@/lib/campaigns/lead-handler";

// Lead-capture endpoint for the plumbing/HVAC campaign landing page
// (src/routes/hvac-plumbing-marketing.tsx). Thin wrapper around the shared
// campaign lead pipeline (src/lib/campaigns/lead-handler.ts).

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  hvac: "HVAC",
  plumbing: "Plumbing",
  "hvac-plumbing": "HVAC + Plumbing",
  "home-services": "Home Services",
  other: "Other",
};

const GOAL_LABELS: Record<string, string> = {
  leads: "More Leads",
  ads: "Google Ads",
  lsa: "Local Services Ads",
  website: "Better Website",
  "ai-automation": "AI / Automation",
  seo: "SEO",
  tracking: "Tracking",
  "wasted-spend": "Lower Wasted Spend",
  "not-sure": "Not Sure",
};

export const Route = createFileRoute("/api/landing/hvac-plumbing-marketing")({
  server: {
    handlers: {
      POST: createCampaignLeadHandler({
        routeId: "landing-hvac-plumbing-marketing",
        sourceLabel: "HVAC & Plumbing Marketing Landing Page",
        emailFooterSource: "the /hvac-plumbing-marketing page",
        businessTypeLabels: BUSINESS_TYPE_LABELS,
        goalLabels: GOAL_LABELS,
      }),
    },
  },
});
