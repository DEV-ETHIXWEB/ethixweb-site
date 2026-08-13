import {
  Search,
  Globe2,
  MessageCircle,
  MessageSquare,
  Code2,
  BrainCircuit,
  Megaphone,
  ShieldCheck,
  Radar,
  Gauge,
  MousePointerClick,
  TrendingUp,
  Target,
  BarChart3,
  Wrench,
  PhoneMissed,
  MapPinned,
  DollarSign,
  FileText,
} from "lucide-react";
import type { CampaignConfig } from "./types";

const CANONICAL_PATH = "/hvac-plumbing-marketing";

// Campaign 1: Plumbing & HVAC marketing (Ad Groups 1A-1D). Covers marketing
// agency, website design, and Google Ads/LSA intent for plumbing and HVAC
// businesses on one page instead of four separate landing pages, per the
// campaign plan. Case study material (All Phase Plumbing, Gary's
// Pipelining), the Trustpilot rating, and the "since 2020" founding date are
// all pulled from what's already live and verified elsewhere on the site -
// nothing here is a new/invented number.
export const hvacPlumbingMarketing: CampaignConfig = {
  id: "hvac-plumbing-marketing",
  industry: "Plumbing & HVAC",
  audience:
    "Plumbing companies, HVAC companies and home-service contractors looking for a marketing agency, a new website, or Google Ads/Local Services Ads management",

  seo: {
    title: "Plumbing & HVAC Marketing Agency | Websites, SEO & Google Ads | Ethixweb",
    description:
      "Ethixweb builds the website, Google Ads and AI lead capture system that turns search demand into qualified calls and booked jobs for plumbing and HVAC companies. Get a free growth audit.",
    ogTitle: "Plumbing & HVAC Marketing Agency | Ethixweb",
    ogDescription:
      "More qualified calls. More booked jobs. Less wasted ad spend. Websites, SEO, Google Ads and AI lead capture built for plumbing and HVAC companies.",
    path: CANONICAL_PATH,
  },

  schema: {
    serviceType: "Marketing Agency Services for Plumbing and HVAC Companies",
    serviceName: "Plumbing & HVAC Marketing",
    serviceDescription:
      "Websites, SEO, Google Ads, Local Services Ads and AI lead capture built and managed for plumbing and HVAC companies.",
    areaServed: [{ type: "Place", name: "Seattle, Washington" }],
  },

  hero: {
    eyebrow: "Plumbing & HVAC Marketing",
    headline: "More Qualified Calls. More Booked Jobs. Less Wasted Ad Spend.",
    subheadline:
      "Ethixweb builds the website, AI receptionist and Google Ads system that helps HVAC and plumbing companies turn search demand into qualified calls and booked jobs, with every lead tracked back to its source.",
    primaryCta: "Get My Free Growth Audit",
    secondaryCta: "Book a Strategy Call",
    trustMessage: "Built with accessibility in mind · No spam, no fake guarantees",
    flowLabel: "Search to booked job",
    flow: [
      { label: "Search", icon: Search },
      { label: "Ad", icon: Megaphone },
      { label: "Website", icon: Globe2 },
      { label: "AI", icon: MessageCircle },
      { label: "Booked Job", icon: Wrench },
    ],
    points: [
      { icon: Gauge, label: "Fast, mobile-first landing pages" },
      { icon: MessageCircle, label: "AI answers and qualifies after hours" },
      { icon: Radar, label: "Every call and lead tracked back to its source" },
    ],
  },

  problem: {
    eyebrow: "The real problem",
    headline: "Every missed call is a job that goes to a competitor.",
    body: [
      "A customer with a leak, a dead heater or a broken AC unit doesn't wait around. If they can't reach you fast, they're calling the next contractor on the search results page.",
      "Meanwhile, ad spend keeps running. Clicks without a fast, reliable way to capture and qualify the lead behind them are just money spent for nothing.",
    ],
    icon: PhoneMissed,
  },

  painPoints: [
    {
      title: "Missed calls",
      description: "Inquiries land during a job or off hours and never get followed up.",
      icon: PhoneMissed,
    },
    {
      title: "Expensive clicks",
      description: "Google Ads spend that isn't tracked back to which searches actually convert.",
      icon: MousePointerClick,
    },
    {
      title: "Weak local visibility",
      description: "Showing up inconsistently for the exact searches your next job is already in.",
      icon: MapPinned,
    },
    {
      title: "Disconnected tools",
      description:
        "Website, ads and CRM don't talk to each other, so leads fall through the cracks.",
      icon: BarChart3,
    },
  ],

  aiSection: {
    eyebrow: "The key differentiator",
    headline: "Your Digital Receptionist.",
    body: "An AI assistant trained on your services, service area and pricing approach can answer common questions, capture lead details and qualify inquiries the moment someone calls or fills out a form, day or night.",
    boundaryNote:
      "It doesn't replace your dispatcher or your sales process. It makes sure every inquiry gets a fast, accurate answer and lands in front of your team instead of going to voicemail.",
    capabilities: [
      "Structured company knowledge base",
      "Custom instructions per business",
      "LLM-flexible architecture",
      "Send lead summaries to your team",
      "Works outside business hours",
      "Integrates into CRM/dispatch workflows",
    ],
    demo: {
      opening: {
        question: "My water heater is leaking, can someone come out today?",
        answer:
          "Sorry to hear that. I can grab a few quick details now so the team can call you back and get someone scheduled as fast as possible.",
      },
      presets: [
        {
          question: "Do you work on furnaces too, or just AC?",
          answer:
            "Yes, the team handles both heating and cooling systems. I can pass along what you're dealing with so they come prepared.",
        },
        {
          question: "How much does a service call cost?",
          answer:
            "Pricing depends on the issue, so I can't quote an exact number here. I'll get your details to the team so they can give you an honest estimate.",
        },
        {
          question: "Do you serve my area?",
          answer:
            "I can check that. Can you share your city or zip code so I can confirm service availability?",
        },
        {
          question: "Is this a real person or a bot?",
          answer:
            "I'm an AI assistant trained on this business's information. A real team member follows up on every inquiry I capture.",
        },
        {
          question: "Can I just call instead?",
          answer:
            "Of course. I can also pass along a good time to reach you if you'd rather talk it through on the phone.",
        },
      ],
    },
    knowledgeCategories: [
      {
        label: "Services",
        icon: Wrench,
        items: ["HVAC install, repair & maintenance", "Plumbing, drain & water heater service"],
      },
      {
        label: "Locations",
        icon: MapPinned,
        items: ["Service area", "Business hours"],
      },
      {
        label: "Pricing",
        icon: DollarSign,
        items: ["Pricing approach", "Estimate process"],
      },
      {
        label: "Policies",
        icon: FileText,
        items: ["Common FAQs", "Emergency service policy", "Contact information"],
      },
    ],
  },

  systemSection: {
    eyebrow: "The full system",
    headline: "One Connected System, Not Four Separate Vendors.",
    body: "Website, Google Ads, AI lead capture and tracking, working together instead of pieces running in isolation.",
    items: [
      { icon: Search, label: "Research finds real search intent" },
      { icon: Megaphone, label: "Ads reach the right searches" },
      { icon: Globe2, label: "Website converts the visitor" },
      { icon: MessageCircle, label: "AI captures the call or form" },
      { icon: Radar, label: "Tracking shows what worked" },
      { icon: TrendingUp, label: "Budget shifts toward booked jobs" },
    ],
  },

  ads: {
    eyebrow: "Google Ads & Local Services Ads",
    headline: "Built Around Booked Jobs, Not Just Clicks.",
    intro:
      "High-intent, urgent searches happen every day in your service area. A few examples of what that looks like:",
    searchExamples: [
      "emergency plumber near me",
      "ac not cooling",
      "furnace won't turn on",
      "water heater replacement cost",
      "drain cleaning service",
      "hvac installation quote",
      "same day plumbing repair",
      "licensed hvac contractor",
    ],
    approach: [
      "Highly relevant keywords, not broad guesswork",
      "Tightly structured campaigns by service type",
      "Location targeting matched to your service area",
      "Negative keywords to cut wasted spend",
      "Conversion tracking for calls and form fills",
      "Local Services Ads setup and ongoing management",
      "Landing page relevance, not just generic homepage",
      "Ongoing optimization, not set-and-forget",
    ],
  },

  funnel: {
    eyebrow: "The system, end to end",
    headline: "From search to booked job.",
    steps: [
      { title: "Get Found", description: "Google search & ads bring them in", icon: Search },
      { title: "Land & Engage", description: "Fast page, answers questions", icon: Globe2 },
      {
        title: "Capture",
        description: "Call or form, tracked back to the source",
        icon: MessageCircle,
      },
      { title: "Booked Job", description: "Follow-up turns it into revenue", icon: Wrench },
    ],
  },

  website: {
    eyebrow: "Your website",
    headline: "Your Website Should Sell the Job Before You Answer the Phone.",
    body: "A slow, outdated site loses the lead your team will never even hear about. We build websites that load fast, work on mobile, and give visitors just one clear next step: call or book.",
    points: [
      "Modern, mobile-first design",
      "Fast load times on real phones, not just lab tests",
      "SEO-ready structure and content",
      "Clear, direct call-to-action above the fold",
      "Conversion tracking built in from day one",
      "Ongoing optimization, not just set-and-forget",
    ],
  },

  whyEthixweb: {
    eyebrow: "Why Ethixweb",
    headline: "One connected system.",
    pillars: [
      {
        key: "build",
        title: "Build",
        icon: Code2,
        points: ["Headless website", "Performance", "Accessibility", "SEO foundation"],
      },
      {
        key: "intelligence",
        title: "Intelligence",
        icon: BrainCircuit,
        points: ["AI lead capture", "Company knowledge", "LLM-flexible architecture", "Automation"],
      },
      {
        key: "grow",
        title: "Grow",
        icon: Megaphone,
        points: ["Google Ads", "Local Services Ads", "Tracking", "Lead generation"],
      },
    ],
  },

  accessibility: {
    headline: "Built with accessibility in mind.",
    points: [
      "Accessible navigation and semantic structure",
      "Keyboard usability throughout",
      "Readable contrast in light and dark",
      "Accessible, labeled form fields",
      "Screen-reader-friendly content structure",
    ],
  },

  caseStudy: {
    status: "verified",
    client: "All Phase Plumbing",
    problem:
      "A 35-year-old, family-run Seattle plumbing company had a dated, slow site that buried a strong local reputation instead of converting it into calls.",
    strategy:
      "A full digital rebuild: website redesign, on-page SEO, Google Business Profile cleanup and a content refresh built around one goal - getting the phone to ring.",
    build:
      "Migrated off legacy WordPress to a custom-built, faster, more reliable stack hosted on Google Cloud infrastructure, leading every page with the phone number, license and reviews.",
    result:
      "The rebuild leads with trust signals instead of a slow homepage carousel. “If All Phase Plumbing can go from invisible to fully booked in 90 days, imagine what we can do for your business.”",
  },

  offer: {
    eyebrow: "Free HVAC & Plumbing Growth Audit",
    headline: "Get My Free Growth Audit",
    body: "We'll take a real look at your website, Google visibility, Google Ads and Local Services Ads opportunity, conversion experience, mobile experience, lead capture, AI opportunities and tracking, then tell you honestly what's worth fixing first.",
    checks: [
      { label: "Website", icon: Globe2 },
      { label: "Google visibility", icon: Search },
      { label: "Ads & LSA opportunity", icon: Megaphone },
      { label: "Conversion experience", icon: Target },
      { label: "Mobile experience", icon: ShieldCheck },
      { label: "Lead capture", icon: MessageSquare },
      { label: "AI opportunities", icon: MessageCircle },
      { label: "Tracking", icon: Radar },
    ],
  },

  form: {
    businessTypes: [
      { id: "hvac", label: "HVAC" },
      { id: "plumbing", label: "Plumbing" },
      { id: "hvac-plumbing", label: "HVAC + Plumbing" },
      { id: "home-services", label: "Home Services" },
      { id: "other", label: "Other" },
    ],
    goals: [
      { id: "leads", label: "More Leads" },
      { id: "ads", label: "Google Ads" },
      { id: "lsa", label: "Local Services Ads" },
      { id: "website", label: "Better Website" },
      { id: "ai-automation", label: "AI / Automation" },
      { id: "seo", label: "SEO" },
      { id: "tracking", label: "Tracking" },
      { id: "wasted-spend", label: "Lower Wasted Spend" },
      { id: "not-sure", label: "Not Sure" },
    ],
    successHeadline: "You're all set.",
    successBody:
      "Your growth audit request has been received. We'll review the information and get back to you.",
    websitePlaceholder: "yourcompany.com",
  },

  faqs: [
    {
      q: "How much does HVAC or plumbing marketing cost?",
      a: "Pricing depends on the scope of work, and is separate from your ad spend budget. We'll give you real numbers after the free audit, not a generic package price.",
    },
    {
      q: "Can you build an HVAC or plumbing website?",
      a: "Yes. That's a core part of what we do - fast, accessible, conversion-focused websites for HVAC and plumbing companies. All Phase Plumbing and Gary's Pipelining are two examples.",
    },
    {
      q: "Can you run Google Ads and Local Services Ads?",
      a: "Yes. We manage both, with campaigns structured around your actual services and service area rather than broad, generic keywords.",
    },
    {
      q: "Can the AI answer emergency calls?",
      a: "It can answer common questions and capture lead details around the clock, so an inquiry never goes unanswered overnight or during a busy job. A real team member follows up on every lead it captures.",
    },
    {
      q: "Can I choose which AI model powers the assistant?",
      a: "Our architecture is LLM-flexible, so you're not locked into one provider as models and pricing change.",
    },
    {
      q: "Can you track calls and bookings from Google Ads?",
      a: "Yes. Call tracking and form-conversion tracking are part of how we measure whether a campaign is actually working, not just whether it's spending.",
    },
    {
      q: "Can you redesign an existing website?",
      a: "Yes. We can rebuild an existing site or start fresh, depending on what will actually move the needle for your business.",
    },
    {
      q: "Do you work outside Seattle?",
      a: "Yes. This is a national-capable service. Tell us about your market on the audit request.",
    },
    {
      q: "Do I need a new website to run Google Ads?",
      a: "Not always, but your landing page needs to load fast, work on mobile and match the ad that brought the click. If your current site can't do that, ad traffic gets wasted. We'll tell you honestly which one you need.",
    },
  ],

  finalCta: {
    headline: "Your Next Job Is Already Being Searched For.",
    body: "Let's find out what your current setup is actually producing, and fix what isn't working.",
    primaryCta: "Get My Free Growth Audit",
    secondaryCta: "Book a Strategy Call",
  },

  submitEndpoint: "/api/landing/hvac-plumbing-marketing",
};
