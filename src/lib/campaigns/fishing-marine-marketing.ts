import {
  Search,
  Globe2,
  Bot,
  PhoneMissed,
  MessageSquare,
  Anchor,
  Send,
  Code2,
  Sparkles,
  Megaphone,
  ShieldCheck,
  Radar,
  Gauge,
  Compass,
  Fish,
  MapPin,
  DollarSign,
  FileText,
} from "lucide-react";
import type { CampaignConfig } from "./types";

const CANONICAL_PATH = "/fishing-marine-marketing";

export const fishingMarineMarketing: CampaignConfig = {
  id: "fishing-marine-marketing",
  industry: "Fishing & Marine",
  audience:
    "Fishing charters, fishing guides, marine businesses, boat dealers, tackle/e-commerce brands and outdoor recreation businesses",

  seo: {
    title: "Fishing & Marine Marketing | Websites, AI & Google Ads | Ethixweb",
    description:
      "Ethixweb builds the website, AI lead assistant and Google Ads system that helps fishing charters, guides and marine businesses turn more searches into bookings. Get a free growth audit.",
    ogTitle: "Fishing & Marine Marketing | Ethixweb",
    ogDescription:
      "Website + AI + Google Ads for fishing and marine businesses. More bookings, better customer experience, less time chasing inquiries.",
    path: CANONICAL_PATH,
  },

  schema: {
    serviceType: "Marketing for Fishing Charters and Marine Businesses",
    serviceName: "Fishing & Marine Business Marketing",
    serviceDescription:
      "Website design, AI lead capture and Google Ads management for fishing charters, guides and marine businesses.",
    areaServed: [{ type: "Place", name: "United States" }],
  },

  hero: {
    eyebrow: "Fishing & Marine",
    headline: "More Bookings. Better Customer Experience. Less Time Chasing Inquiries.",
    subheadline:
      "Ethixweb builds the website, AI lead assistant and Google Ads system that helps fishing charters, guides and marine businesses get found, answer inquiries and turn more searches into bookings, never missing the next customer while you're on the water.",
    primaryCta: "Get My Free Growth Audit",
    secondaryCta: "Book a Strategy Call",
    trustMessage: "Built with accessibility in mind · No spam, no fake guarantees",
    flowLabel: "Search to booking",
    flow: [
      { label: "Search", icon: Search },
      { label: "Website", icon: Globe2 },
      { label: "AI First Mate", icon: Bot },
      { label: "Inquiry", icon: MessageSquare },
      { label: "Booking", icon: Anchor },
    ],
    points: [
      { icon: Gauge, label: "Fast, mobile-first landing pages" },
      { icon: Bot, label: "AI answers while you're on the water" },
      { icon: Radar, label: "Every lead tracked back to its source" },
    ],
  },

  problem: {
    eyebrow: "The real problem",
    headline: "You're on the water. Your next customer isn't waiting.",
    body: [
      "You might be running a trip, launching the boat, out of cell range, or handling the customers already in front of you. Meanwhile, someone else is researching availability, pricing, trip length and what's running this week. If nobody answers fast, they move to the next option.",
      "That inquiry doesn't come back. It just goes to whoever answered first.",
    ],
    icon: PhoneMissed,
  },

  painPoints: [
    {
      title: "Missed inquiries",
      description: "Calls and messages that come in while you're on a trip or out of range.",
      icon: PhoneMissed,
    },
    {
      title: "Seasonal swings",
      description: "Demand that spikes fast and needs campaigns that move with it.",
      icon: Compass,
    },
    {
      title: "Marketplace dependence",
      description: "Relying on booking platforms instead of owning the customer relationship.",
      icon: Anchor,
    },
    {
      title: "Generic websites",
      description: "A slow, dated site that loses the booking before your team even sees it.",
      icon: Globe2,
    },
  ],

  aiSection: {
    eyebrow: "The key differentiator",
    headline: "Your Digital First Mate.",
    body: "An AI assistant trained on your actual business, not generic scripts. It can answer common questions, explain trip types and pricing, capture lead information, qualify inquiries and route booking requests, day or night.",
    boundaryNote:
      "It doesn't automatically book trips for you unless that's specifically built into your setup. It makes sure every inquiry gets a fast, accurate answer and lands in front of your team instead of disappearing.",
    capabilities: [
      "Structured company knowledge base",
      "Custom instructions per business",
      "LLM-flexible architecture",
      "Send summaries to your team",
      "Works outside business hours",
      "Integrates into CRM/workflows",
    ],
    demo: {
      opening: {
        question: "Do you have a private trip available next Saturday?",
        answer:
          "Yes, we have openings next Saturday. Want me to grab your name and number so the team can confirm your spot and send the details?",
      },
      presets: [
        {
          question: "What's included?",
          answer:
            "Trips typically include gear, licenses and fuel depending on the operator. Bring food, water and weather-appropriate clothing. I can confirm exactly what's included for your trip.",
        },
        {
          question: "What does it cost?",
          answer:
            "Pricing depends on trip length, group size and season. I can share the current rate sheet or connect you with the team for an exact quote.",
        },
        {
          question: "Where do trips leave from?",
          answer:
            "Departure points vary by operator. I can confirm which marina or dock your trip departs from.",
        },
        {
          question: "What's your cancellation policy?",
          answer:
            "Cancellation windows and any fees depend on how far out you cancel. I can walk you through the specific policy for your booking.",
        },
        {
          question: "What happens if weather changes?",
          answer:
            "Safety comes first. If conditions turn, the captain or team will discuss rescheduling or other options with you directly.",
        },
      ],
    },
    knowledgeCategories: [
      {
        label: "Trips",
        icon: Fish,
        items: ["Trip/service types", "Target species or offerings", "Availability rules"],
      },
      {
        label: "Locations",
        icon: MapPin,
        items: ["Departure locations", "Service area", "Marina/dock details"],
      },
      {
        label: "Pricing",
        icon: DollarSign,
        items: ["Trip rates", "Group pricing", "Deposits", "Cancellation policy"],
      },
      {
        label: "Policies",
        icon: FileText,
        items: ["Weather policy", "License information", "FAQs", "Contact information"],
      },
    ],
  },

  systemSection: {
    eyebrow: "The full system",
    headline: "It's More Than a Chatbot.",
    body: "Website, AI, ads, analytics, lead capture and automation, working as one system instead of six disconnected tools.",
    items: [
      { icon: Search, label: "Ads bring the visitor" },
      { icon: Globe2, label: "Website converts the visitor" },
      { icon: Bot, label: "AI captures the question" },
      { icon: Radar, label: "Tracking shows where the lead came from" },
      { icon: Send, label: "Automation follows up" },
      { icon: Anchor, label: "You get the opportunity" },
    ],
  },

  ads: {
    eyebrow: "Google Ads",
    headline: "Be There When Someone Searches for Their Next Trip.",
    intro:
      "High-intent searches happen every day around fishing and marine businesses. A few examples of what that looks like:",
    searchExamples: [
      "fishing charter near me",
      "salmon fishing charter",
      "private fishing charter",
      "deep sea fishing trip",
      "fishing guide booking",
      "boat dealer near me",
      "fishing tackle online",
      "marine service near me",
    ],
    approach: [
      "Highly relevant keywords, not broad guesswork",
      "Tightly structured campaigns by trip or service type",
      "Location targeting matched to your real service area",
      "Negative keywords to cut wasted spend",
      "Conversion and phone-call tracking",
      "Remarketing to past visitors where appropriate",
      "Landing page relevance, not a generic homepage",
      "Ongoing optimization, not set-and-forget",
    ],
  },

  funnel: {
    eyebrow: "The system, end to end",
    headline: "From search to booked trip.",
    steps: [
      { title: "Get Found", description: "Google search & ads bring them in", icon: Search },
      { title: "Land & Engage", description: "Fast page, AI answers questions", icon: Bot },
      { title: "Capture", description: "Lead, call or inquiry, tracked", icon: MessageSquare },
      { title: "Book", description: "Follow-up turns it into revenue", icon: Anchor },
    ],
  },

  website: {
    eyebrow: "Your website",
    headline: "Your Website Should Sell the Trip Before You Answer the Phone.",
    body: "A slow, outdated or confusing site loses the booking before your team even gets the inquiry. We build sites that get more bookings, not just sites that look nice.",
    points: [
      "Modern, mobile-first design",
      "Fast load times on real phones, not just lab tests",
      "Accessible navigation and forms",
      "SEO-ready structure and content",
      "Clear, direct booking pathways",
      "Conversion-focused layout, not just a brochure",
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
        points: ["Headless website", "Performance", "Accessibility", "SEO"],
      },
      {
        key: "intelligence",
        title: "Intelligence",
        icon: Sparkles,
        points: ["AI chatbot", "Company knowledge", "LLM-flexible architecture", "Automation"],
      },
      {
        key: "grow",
        title: "Grow",
        icon: Megaphone,
        points: ["Google Ads", "SEO", "Tracking", "Lead generation"],
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

  ownership: {
    eyebrow: "Direct bookings",
    headline: "Own More of Your Customer Journey.",
    body: "Marketplaces can be a useful acquisition channel. Ethixweb helps you build a direct channel you own as well: direct traffic, direct inquiries, your own customer data and your own follow-up, so repeat customers come back to you first.",
  },

  caseStudy: {
    status: "coming-soon",
  },

  offer: {
    eyebrow: "Free Fishing & Marine Growth Audit",
    headline: "Get My Free Growth Audit",
    body: "We'll take a real look at your website, Google visibility, Google Ads opportunity, conversion experience, mobile experience, lead capture, AI opportunities and tracking, then tell you honestly what's worth fixing first.",
    checks: [
      { label: "Website", icon: Globe2 },
      { label: "Google visibility", icon: Search },
      { label: "Google Ads opportunity", icon: Megaphone },
      { label: "Conversion experience", icon: Sparkles },
      { label: "Mobile experience", icon: ShieldCheck },
      { label: "Lead capture", icon: MessageSquare },
      { label: "AI opportunities", icon: Bot },
      { label: "Tracking", icon: Radar },
    ],
  },

  form: {
    businessTypes: [
      { id: "fishing-charter", label: "Fishing Charter" },
      { id: "fishing-guide", label: "Fishing Guide" },
      { id: "marine-business", label: "Marine Business" },
      { id: "tackle-ecommerce", label: "Tackle / E-commerce" },
      { id: "boat-dealer", label: "Boat Dealer" },
      { id: "other", label: "Other" },
    ],
    goals: [
      { id: "bookings", label: "More Bookings" },
      { id: "website", label: "Better Website" },
      { id: "ads", label: "Google Ads" },
      { id: "ai", label: "AI / Automation" },
      { id: "seo", label: "SEO" },
      { id: "ecommerce", label: "E-commerce Growth" },
      { id: "not-sure", label: "Not Sure" },
    ],
    successHeadline: "You're all set.",
    successBody:
      "Your growth audit request has been received. We'll review the information and get back to you.",
    websitePlaceholder: "yourbusiness.com",
  },

  faqs: [
    {
      q: "How much does fishing or marine business marketing cost?",
      a: "It depends on scope: a new website, ongoing Google Ads management and an AI lead assistant are priced differently than a single service. We'll give you real numbers after the free growth audit, not a generic package price.",
    },
    {
      q: "Can you build a website for a fishing or marine business?",
      a: "Yes. We design and build modern, mobile-first websites built around getting a visitor from search to a booking inquiry or sale.",
    },
    {
      q: "Can you run Google Ads for a fishing or marine business?",
      a: "Yes. We build and manage Google Ads campaigns with location targeting, conversion tracking and ongoing optimization. We don't promise guaranteed leads or rankings, but we do promise a transparent, structured approach.",
    },
    {
      q: "Can the AI chatbot answer questions about our trips or products?",
      a: "Yes, once it's set up with your business information: offerings, pricing, policies and FAQs. It can answer common questions, capture lead details and qualify inquiries, even outside business hours.",
    },
    {
      q: "Can the AI be trained on our company information?",
      a: "Yes. It's built on a structured knowledge base of your offerings, pricing, availability rules, policies and FAQs, so its answers reflect your actual business.",
    },
    {
      q: "Can I choose which AI model powers the assistant?",
      a: "Our architecture is LLM-flexible, so you're not locked into one provider as models and pricing change.",
    },
    {
      q: "Can you track calls and bookings from Google Ads?",
      a: "Yes. Conversion tracking and call tracking are part of how we measure whether a campaign is actually working, not just whether it's spending.",
    },
    {
      q: "Can you redesign an existing website?",
      a: "Yes. Many of the businesses we work with already have a site. We can rebuild it or improve it depending on what the audit finds.",
    },
    {
      q: "Do you work with businesses outside one specific region?",
      a: "Yes. This program is built for fishing and marine businesses generally. Ask us about your specific market.",
    },
    {
      q: "Do I need a new website to run Google Ads?",
      a: "Not always, but your landing page needs to load fast, work on mobile and make the next step obvious. If your current site can't do that, ads traffic gets wasted. We'll tell you honestly which one you need.",
    },
  ],

  finalCta: {
    headline: "Your Next Customer Is Already Searching.",
    body: "Let's make sure they find you, trust you, and get an answer before they move on.",
    primaryCta: "Get My Free Growth Audit",
    secondaryCta: "Book a Strategy Call",
  },

  submitEndpoint: "/api/landing/fishing-marine",
};
