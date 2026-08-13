import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createCampaignLeadHandler } from "@/lib/campaigns/lead-handler";

// Lead-capture endpoint for the combined growth-audit campaign landing page
// (src/routes/growth-audit.tsx). Thin wrapper around the shared campaign
// lead pipeline (src/lib/campaigns/lead-handler.ts).

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  hvac: "HVAC",
  plumbing: "Plumbing",
  "hvac-plumbing": "HVAC + Plumbing",
  "fishing-charter": "Fishing Charter",
  "marine-business": "Marine Business",
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
  website: "New Website",
  "ai-lead-capture": "AI Lead Capture",
  tracking: "Conversion Tracking",
  "full-system": "Full Growth System",
  "not-sure": "Not Sure",
};

export const Route = createFileRoute("/api/landing/growth-audit")({
  server: {
    handlers: {
      POST: createCampaignLeadHandler({
        routeId: "landing-growth-audit",
        sourceLabel: "Growth Audit Landing Page",
        emailFooterSource: "the /growth-audit page",
        businessTypeLabels: BUSINESS_TYPE_LABELS,
        goalLabels: GOAL_LABELS,
      }),
    },
  },
});
