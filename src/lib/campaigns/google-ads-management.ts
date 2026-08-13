import {
  Search,
  Globe2,
  Bot,
  MessageSquare,
  Code2,
  Sparkles,
  Megaphone,
  ShieldCheck,
  Radar,
  Gauge,
  MousePointerClick,
  TrendingUp,
  Target,
  BarChart3,
  Briefcase,
  MapPinned,
  DollarSign,
  FileText,
} from "lucide-react";
import type { CampaignConfig } from "./types";

const CANONICAL_PATH = "/google-ads-management";

export const googleAdsManagement: CampaignConfig = {
  id: "google-ads-management",
  industry: "Paid Search",
  audience:
    "Businesses actively looking for Google Ads management, Local Services Ads users, PPC/lead-generation buyers and local service businesses",

  seo: {
    title: "Google Ads Management | PPC & Local Services Ads | Ethixweb",
    description:
      "Ethixweb runs Google Ads and Local Services Ads campaigns built around measurable leads, not vanity clicks: keyword strategy, conversion tracking, landing pages and ongoing optimization. Get a free ads audit.",
    ogTitle: "Google Ads Management | Ethixweb",
    ogDescription:
      "Turn search intent into measurable leads. Campaign structure, tracking and landing pages built to convert, not just spend.",
    path: CANONICAL_PATH,
  },

  schema: {
    serviceType: "Google Ads and PPC Campaign Management",
    serviceName: "Google Ads Management",
    serviceDescription:
      "Google Ads and Local Services Ads campaign setup, landing pages, conversion tracking and ongoing optimization.",
    areaServed: [{ type: "Place", name: "United States" }],
  },

  hero: {
    eyebrow: "Google Ads Management",
    headline: "Turn Search Intent Into Measurable Leads.",
    subheadline:
      "Ethixweb builds and manages Google Ads and Local Services Ads campaigns around business outcomes, not vanity metrics: relevant keywords, fast landing pages, real conversion tracking and ongoing optimization.",
    primaryCta: "Get My Free Ads Audit",
    secondaryCta: "Book a Strategy Call",
    trustMessage: "Built with accessibility in mind · No spam, no fake guarantees",
    flowLabel: "Search to conversion",
    flow: [
      { label: "Search", icon: Search },
      { label: "Ad", icon: Megaphone },
      { label: "Page", icon: Globe2 },
      { label: "Convert", icon: MousePointerClick },
      { label: "Optimize", icon: TrendingUp },
    ],
    points: [
      { icon: Gauge, label: "Fast, mobile-first landing pages" },
      { icon: Radar, label: "Call and form conversions tracked to the source" },
      { icon: Target, label: "Budget shifts toward what actually converts" },
    ],
  },

  problem: {
    eyebrow: "Clicks are not the goal",
    headline: "Clicks ≠ Leads ≠ Booked Jobs.",
    body: [
      "A campaign can generate plenty of clicks and still lose money if the keywords are too broad, the landing page is slow or generic, or nothing is tracked well enough to know what actually worked.",
      "We optimize around business outcomes, not vanity metrics: qualified search, a relevant ad, a fast landing page, a tracked call or form, and a feedback loop that puts budget where it converts.",
    ],
    icon: MousePointerClick,
  },

  painPoints: [
    {
      title: "Wasted clicks",
      description:
        "Broad keywords and weak negative-keyword lists burning budget on the wrong searches.",
      icon: MousePointerClick,
    },
    {
      title: "No tracking",
      description: "Spend with no reliable way to see which campaigns produce real leads.",
      icon: Radar,
    },
    {
      title: "Weak landing pages",
      description:
        "Ads sending traffic to a slow, generic homepage instead of a page built to convert.",
      icon: Globe2,
    },
    {
      title: "Set-and-forget campaigns",
      description: "Accounts left running without ongoing optimization as results come in.",
      icon: BarChart3,
    },
  ],

  aiSection: {
    eyebrow: "The key differentiator",
    headline: "AI That Captures the Lead Your Ads Paid For.",
    body: "An AI assistant trained on your business can answer common questions, capture lead details and qualify inquiries the moment a paid visitor lands, so the click you paid for doesn't go to waste on a slow follow-up.",
    boundaryNote:
      "It doesn't replace your sales process. It makes sure every paid-traffic inquiry gets a fast, accurate answer and lands in front of your team instead of disappearing.",
    capabilities: [
      "Structured company knowledge base",
      "Custom instructions per business",
      "LLM-flexible architecture",
      "Send lead summaries to your team",
      "Works outside business hours",
      "Integrates into CRM/workflows",
    ],
    demo: {
      opening: {
        question: "I clicked your ad, can you tell me more about pricing?",
        answer:
          "Happy to help. Pricing depends on the specifics of what you need. I can grab a few quick details so the right person can follow up with an accurate quote.",
      },
      presets: [
        {
          question: "How fast will someone get back to me?",
          answer:
            "I'll get your details to the team right away so they can follow up as quickly as possible.",
        },
        {
          question: "Do you serve my area?",
          answer:
            "I can check that. Can you share your city or zip code so I can confirm service availability?",
        },
        {
          question: "What information do you need from me?",
          answer:
            "Just your name, contact info and a short description of what you're looking for. The team takes it from there.",
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
        icon: Briefcase,
        items: ["Services offered", "Booking/contact process"],
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
        items: ["Common FAQs", "Policies", "Contact information"],
      },
    ],
  },

  systemSection: {
    eyebrow: "The full system",
    headline: "It's More Than an Ads Account.",
    body: "Ads, landing page, AI, tracking and optimization, working as one system instead of a campaign running in isolation.",
    items: [
      { icon: Search, label: "Research finds real intent" },
      { icon: Megaphone, label: "Ads reach the right searches" },
      { icon: Globe2, label: "Landing page converts the visitor" },
      { icon: Bot, label: "AI captures the question" },
      { icon: Radar, label: "Tracking shows what worked" },
      { icon: TrendingUp, label: "Budget shifts toward results" },
    ],
  },

  ads: {
    eyebrow: "What we actually do",
    headline: "The Real Campaign System, Not Just an Account Login.",
    intro: "Every account we run includes the fundamentals that actually drive results:",
    searchExamples: [
      "emergency service near me",
      "[service] company near me",
      "best [service] near me",
      "[service] cost",
      "same day [service]",
      "licensed [service] contractor",
      "[service] free quote",
      "24 hour [service]",
    ],
    approach: [
      "Search intent and keyword research, not broad guesswork",
      "Tightly structured campaigns and ad groups",
      "Location and audience targeting",
      "Negative keywords to cut wasted spend",
      "Conversion tracking for calls and form fills",
      "Google Analytics and Tag Manager readiness",
      "Local Services Ads strategy where relevant",
      "Ongoing optimization of bids, terms and creative",
      "Reporting tied to business outcomes, not just clicks",
    ],
  },

  funnel: {
    eyebrow: "The system, end to end",
    headline: "Research. Structure. Target. Convert.",
    steps: [
      { title: "Research", description: "Real search intent & keyword strategy", icon: Search },
      {
        title: "Structure & Target",
        description: "Campaigns, ad groups, location targeting",
        icon: Target,
      },
      {
        title: "Convert",
        description: "Fast landing page, tracked call or form",
        icon: MousePointerClick,
      },
      { title: "Optimize & Scale", description: "What works gets more budget", icon: TrendingUp },
    ],
  },

  website: {
    eyebrow: "Your landing page",
    headline: "Your Landing Page Should Convert the Click You Paid For.",
    body: "Sending paid traffic to a slow, generic homepage wastes ad spend. We build landing pages matched to the ad, fast on mobile, with one clear next step.",
    points: [
      "Message match with the ad that brought the click",
      "Fast load times on real phones, not just lab tests",
      "Accessible navigation and forms",
      "One clear, immediate call to action",
      "Conversion tracking built in from day one",
      "Built to be tested and improved over time",
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
        points: ["Headless landing pages", "Performance", "Accessibility", "SEO foundation"],
      },
      {
        key: "intelligence",
        title: "Intelligence",
        icon: Sparkles,
        points: ["AI lead capture", "Company knowledge", "LLM-flexible architecture", "Automation"],
      },
      {
        key: "grow",
        title: "Grow",
        icon: Megaphone,
        points: [
          "Google Ads",
          "Local Services Ads",
          "Conversion tracking",
          "Reporting & optimization",
        ],
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
    status: "coming-soon",
  },

  offer: {
    eyebrow: "Free Google Ads Growth Audit",
    headline: "Get My Free Ads Audit",
    body: "We'll take a real look at your account structure (or your current lack of one), keyword strategy, landing page, conversion tracking and where budget is likely being wasted, then tell you honestly what's worth fixing first.",
    checks: [
      { label: "Account/campaign structure", icon: Target },
      { label: "Keyword strategy", icon: Search },
      { label: "Landing page", icon: Globe2 },
      { label: "Conversion tracking", icon: Radar },
      { label: "Mobile experience", icon: ShieldCheck },
      { label: "Lead capture", icon: MessageSquare },
      { label: "AI opportunities", icon: Bot },
      { label: "Reporting", icon: BarChart3 },
    ],
  },

  form: {
    businessTypes: [
      { id: "hvac", label: "HVAC" },
      { id: "plumbing", label: "Plumbing" },
      { id: "fishing-marine", label: "Fishing / Marine" },
      { id: "electrical", label: "Electrical" },
      { id: "construction", label: "Construction" },
      { id: "professional-services", label: "Professional Services" },
      { id: "ecommerce", label: "E-commerce" },
      { id: "other", label: "Other" },
    ],
    goals: [
      { id: "leads", label: "More Leads" },
      { id: "wasted-spend", label: "Lower Wasted Spend" },
      { id: "ads", label: "Google Ads" },
      { id: "lsa", label: "Local Services Ads" },
      { id: "tracking", label: "Conversion Tracking" },
      { id: "landing-page", label: "Better Landing Page" },
      { id: "full-system", label: "Full Growth System" },
      { id: "not-sure", label: "Not Sure" },
    ],
    successHeadline: "You're all set.",
    successBody:
      "Your ads audit request has been received. We'll review the information and get back to you.",
    websitePlaceholder: "yourcompany.com",
  },

  faqs: [
    {
      q: "How much does Google Ads management cost?",
      a: "Management pricing depends on account size and scope, and is separate from your actual ad spend budget. We'll give you real numbers after the free ads audit, not a generic package price.",
    },
    {
      q: "Do you manage Local Services Ads too?",
      a: "Yes, where relevant to your business. We can advise on LSA strategy alongside standard Search campaigns.",
    },
    {
      q: "Can you guarantee a certain number of leads?",
      a: "No. Nobody honestly can. What we can guarantee is a structured, transparent approach: relevant keywords, real tracking and ongoing optimization based on what the data shows.",
    },
    {
      q: "Do I need a new landing page to run ads?",
      a: "Not always, but your landing page needs to load fast, work on mobile and match the ad that brought the click. If your current site can't do that, ads traffic gets wasted. We'll tell you honestly which one you need.",
    },
    {
      q: "Can you set up conversion tracking?",
      a: "Yes. Call tracking and form-conversion tracking are part of how we measure whether a campaign is actually working, not just whether it's spending.",
    },
    {
      q: "Can the AI assistant help with leads from my ads?",
      a: "Yes. It can answer common questions and capture lead details the moment a paid visitor lands, on a knowledge base built from your actual business information.",
    },
    {
      q: "Can I choose which AI model powers the assistant?",
      a: "Our architecture is LLM-flexible, so you're not locked into one provider as models and pricing change.",
    },
    {
      q: "Do you work with businesses outside the Seattle area?",
      a: "Yes. Google Ads management is a national-capable service. Tell us about your market on the audit request.",
    },
    {
      q: "Do you have a Google Partner badge?",
      a: "We don't make certification or partner-status claims we haven't verified. If that changes, we'll say so plainly rather than imply it.",
    },
    {
      q: "What if I already have an ads account running?",
      a: "We can audit the existing account and tell you honestly what's working, what's wasting spend, and what we'd change.",
    },
  ],

  finalCta: {
    headline: "Every Day Without Tracking Is Budget You Can't Account For.",
    body: "Let's find out what your ads are actually producing, and fix what isn't working.",
    primaryCta: "Get My Free Ads Audit",
    secondaryCta: "Book a Strategy Call",
  },

  submitEndpoint: "/api/landing/google-ads-management",
};
