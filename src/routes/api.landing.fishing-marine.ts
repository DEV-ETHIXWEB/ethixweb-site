import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createCampaignLeadHandler } from "@/lib/campaigns/lead-handler";

// Lead-capture endpoint for the general fishing & marine campaign landing
// page (src/routes/fishing-marine-marketing.tsx). Distinct from the
// Seattle-specific /api/landing/fishing-seattle endpoint - the two pages
// serve different purposes and stay independently trackable. Thin wrapper
// around the shared campaign lead pipeline (src/lib/campaigns/lead-handler.ts).

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  "fishing-charter": "Fishing Charter",
  "fishing-guide": "Fishing Guide",
  "marine-business": "Marine Business",
  "tackle-ecommerce": "Tackle / E-commerce",
  "boat-dealer": "Boat Dealer",
  other: "Other",
};

const GOAL_LABELS: Record<string, string> = {
  bookings: "More Bookings",
  website: "Better Website",
  ads: "Google Ads",
  ai: "AI / Automation",
  seo: "SEO",
  ecommerce: "E-commerce Growth",
  "not-sure": "Not Sure",
};

export const Route = createFileRoute("/api/landing/fishing-marine")({
  server: {
    handlers: {
      POST: createCampaignLeadHandler({
        routeId: "landing-fishing-marine",
        sourceLabel: "Fishing & Marine Marketing Landing Page",
        emailFooterSource: "the /fishing-marine-marketing page",
        businessTypeLabels: BUSINESS_TYPE_LABELS,
        goalLabels: GOAL_LABELS,
      }),
    },
  },
});
