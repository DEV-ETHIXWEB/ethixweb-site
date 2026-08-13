import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createCampaignLeadHandler } from "@/lib/campaigns/lead-handler";

// Lead-capture endpoint for the Seattle fishing/marine Google Ads landing
// page (src/routes/landing.fishing-marketing.seattle.tsx). Thin wrapper
// around the shared campaign lead pipeline (src/lib/campaigns/lead-handler.ts)
// - validate -> Turnstile -> Supabase -> ClickUp -> Resend.

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
  "not-sure": "Not Sure",
};

export const Route = createFileRoute("/api/landing/fishing-seattle")({
  server: {
    handlers: {
      POST: createCampaignLeadHandler({
        routeId: "landing-fishing-seattle",
        sourceLabel: "Seattle Fishing Marketing Landing Page",
        emailFooterSource: "the /landing/fishing-marketing/seattle page",
        businessTypeLabels: BUSINESS_TYPE_LABELS,
        goalLabels: GOAL_LABELS,
      }),
    },
  },
});
