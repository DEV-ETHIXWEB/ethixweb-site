import type { LucideIcon } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────
// Reusable Google Ads campaign landing page architecture. One config per
// industry+location combination drives the entire page (src/routes/landing.
// <slug>.tsx becomes a thin wrapper around <CampaignLandingPage config={...}
// />). Adding a new campaign should mean adding a new file in this folder,
// not duplicating components. See src/components/campaign/CampaignLandingPage.tsx.
// ─────────────────────────────────────────────────────────────────────────

export interface CampaignLocation {
  city: string;
  state: string;
  region: string;
  /** Neighborhoods/nearby cities mentioned naturally across sections. */
  nearbyAreas: string[];
  /** Short line of local color used in the local-market section. */
  localContext: string;
}

export interface CampaignHeroFlowStep {
  label: string;
  icon: LucideIcon;
}

export interface CampaignHeroPoint {
  icon: LucideIcon;
  label: string;
}

export interface CampaignPainPoint {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface CampaignFunnelStep {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface CampaignAiDemoTurn {
  question: string;
  answer: string;
}

export interface CampaignAiDemo {
  /** The conversation shown by default before the visitor clicks anything. */
  opening: CampaignAiDemoTurn;
  /** Preset follow-up questions the visitor can click to see a canned answer. */
  presets: CampaignAiDemoTurn[];
}

export interface CampaignKnowledgeCategory {
  label: string;
  icon: LucideIcon;
  items: string[];
}

export interface CampaignAdsApproach {
  searchExamples: string[];
  approach: string[];
}

export interface CampaignSeasonPhase {
  label: string;
  title: string;
  description: string;
}

export interface CampaignWhyPillar {
  key: "build" | "intelligence" | "grow";
  title: string;
  icon: LucideIcon;
  points: string[];
}

export interface CampaignCaseStudy {
  /** When absent, the page renders the "coming soon" placeholder state. */
  status: "coming-soon" | "verified";
  client?: string;
  problem?: string;
  strategy?: string;
  build?: string;
  result?: string;
  metrics?: { label: string; value: string }[];
}

export interface CampaignOfferCheck {
  label: string;
  icon: LucideIcon;
}

export interface CampaignFaq {
  q: string;
  a: string;
}

export interface CampaignBusinessTypeOption {
  id: string;
  label: string;
}

export interface CampaignGoalOption {
  id: string;
  label: string;
}

export interface CampaignSeo {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  path: string;
}

export interface CampaignSchema {
  serviceType: string;
  serviceName: string;
  serviceDescription: string;
  areaServed: { type: "City" | "Place"; name: string }[];
}

export interface CampaignConfig {
  /** Stable id used in tracking payloads, e.g. "fishing-marketing-seattle". */
  id: string;
  industry: string;
  audience: string;
  /** Omit for national-capable campaign pages not tied to one metro. */
  location?: CampaignLocation;

  seo: CampaignSeo;
  schema: CampaignSchema;

  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
    trustMessage: string;
    /** The animated flow strip in the hero visual, e.g. Search -> Call -> AI -> Booked Job.
     * Each page gets a contextually different sequence rather than one shared icon set. */
    flow: CampaignHeroFlowStep[];
    /** Supporting bullet points under the hero flow card. */
    points: CampaignHeroPoint[];
    /** Label above the flow card, e.g. "Search to booking" or "Search to booked job". */
    flowLabel: string;
  };

  problem: {
    eyebrow: string;
    headline: string;
    body: string[];
    icon: LucideIcon;
  };

  painPoints: CampaignPainPoint[];

  aiSection: {
    eyebrow: string;
    headline: string;
    body: string;
    boundaryNote: string;
    capabilities: string[];
    demo: CampaignAiDemo;
    /** Switchable category tabs for the "business knowledge" panel, e.g. Services / Locations / Pricing / Policies. */
    knowledgeCategories: CampaignKnowledgeCategory[];
  };

  systemSection: {
    eyebrow: string;
    headline: string;
    body: string;
    items: { icon: LucideIcon; label: string }[];
  };

  ads: {
    eyebrow: string;
    headline: string;
    intro: string;
  } & CampaignAdsApproach;

  funnel: {
    eyebrow: string;
    headline: string;
    steps: CampaignFunnelStep[];
  };

  /** Omit for national-capable pages with no single local market to describe. */
  localMarket?: {
    eyebrow: string;
    headline: string;
    body: string;
    points: string[];
  };

  /** Omit when the business/service isn't meaningfully seasonal. */
  seasonality?: {
    eyebrow: string;
    headline: string;
    body: string;
    phases: CampaignSeasonPhase[];
  };

  website: {
    eyebrow: string;
    headline: string;
    body: string;
    points: string[];
  };

  whyEthixweb: {
    eyebrow: string;
    headline: string;
    pillars: CampaignWhyPillar[];
  };

  accessibility: {
    headline: string;
    points: string[];
  };

  /** Omit when "own your customer journey vs. marketplaces" isn't relevant to this industry. */
  ownership?: {
    eyebrow: string;
    headline: string;
    body: string;
  };

  caseStudy: CampaignCaseStudy;

  offer: {
    eyebrow: string;
    headline: string;
    body: string;
    checks: CampaignOfferCheck[];
  };

  form: {
    businessTypes: CampaignBusinessTypeOption[];
    goals: CampaignGoalOption[];
    successHeadline: string;
    successBody: string;
    /** Example domain shown as the website field's placeholder, e.g. "yourcompany.com". */
    websitePlaceholder: string;
  };

  faqs: CampaignFaq[];

  finalCta: {
    headline: string;
    body: string;
    primaryCta: string;
    secondaryCta: string;
  };

  /** Endpoint the lead form posts to - lets each campaign share or override the pipeline. */
  submitEndpoint: string;

  /** Omit until a real, verified business phone number exists - the mobile
   * sticky bar and any "Call" CTA only render when this is present so we
   * never invent a number. */
  phone?: { display: string; href: string };
}
