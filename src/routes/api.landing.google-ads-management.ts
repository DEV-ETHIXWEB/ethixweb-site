import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createCampaignLeadHandler } from "@/lib/campaigns/lead-handler";

// Lead-capture endpoint for the Google Ads management campaign landing page
// (src/routes/google-ads-management.tsx). Thin wrapper around the shared
// campaign lead pipeline (src/lib/campaigns/lead-handler.ts).

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  hvac: "HVAC",
  plumbing: "Plumbing",
  "fishing-marine": "Fishing / Marine",
  electrical: "Electrical",
  construction: "Construction",
  "professional-services": "Professional Services",
  ecommerce: "E-commerce",
  other: "Other",
};

const GOAL_LABELS: Record<string, string> = {
  leads: "More Leads",
  "wasted-spend": "Lower Wasted Spend",
  ads: "Google Ads",
  lsa: "Local Services Ads",
  tracking: "Conversion Tracking",
  "landing-page": "Better Landing Page",
  "full-system": "Full Growth System",
  "not-sure": "Not Sure",
};

export const Route = createFileRoute("/api/landing/google-ads-management")({
  server: {
    handlers: {
      POST: createCampaignLeadHandler({
        routeId: "landing-google-ads-management",
        sourceLabel: "Google Ads Management Landing Page",
        emailFooterSource: "the /google-ads-management page",
        businessTypeLabels: BUSINESS_TYPE_LABELS,
        goalLabels: GOAL_LABELS,
      }),
    },
  },
});
