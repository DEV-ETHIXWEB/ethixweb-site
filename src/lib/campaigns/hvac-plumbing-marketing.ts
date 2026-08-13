import {
  Search,
  Globe2,
  Bot,
  PhoneMissed,
  MessageSquare,
  Send,
  Code2,
  Sparkles,
  Megaphone,
  ShieldCheck,
  Radar,
  Gauge,
  PhoneCall,
  Wrench,
  MapPinned,
  Wallet,
  DollarSign,
  FileText,
} from "lucide-react";
import type { CampaignConfig } from "./types";

const CANONICAL_PATH = "/hvac-plumbing-marketing";

export const hvacPlumbingMarketing: CampaignConfig = {
  id: "hvac-plumbing-marketing",
  industry: "HVAC & Plumbing",
  audience: "HVAC contractors, plumbing companies and independent home-service operators",

  seo: {
    title: "HVAC & Plumbing Marketing | Websites, AI & Google Ads | Ethixweb",
    description:
      "Ethixweb builds the website, AI receptionist and Google Ads system that helps HVAC and plumbing contractors turn search demand into qualified calls and booked jobs. Get a free growth audit.",
    ogTitle: "HVAC & Plumbing Marketing | Ethixweb",
    ogDescription:
      "Website + AI + Google Ads for HVAC and plumbing companies. More qualified calls, more booked jobs, less wasted ad spend.",
    path: CANONICAL_PATH,
  },

  schema: {
    serviceType: "Marketing for HVAC and Plumbing Contractors",
    serviceName: "HVAC & Plumbing Business Marketing",
    serviceDescription:
      "Website design, AI lead capture and Google Ads management for HVAC and plumbing contractors.",
    areaServed: [{ type: "Place", name: "United States" }],
  },

  hero: {
    eyebrow: "HVAC & Plumbing",
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
      { label: "Page", icon: Globe2 },
      { label: "AI", icon: Bot },
      { label: "Call", icon: PhoneCall },
    ],
    points: [
      { icon: Gauge, label: "Fast, mobile-first landing pages" },
      { icon: Bot, label: "AI answers and qualifies after hours" },
      { icon: Radar, label: "Every call and lead tracked back to its source" },
    ],
  },

  problem: {
    eyebrow: "The real problem",
    headline: "Every missed call is a job that goes to a competitor.",
    body: [
      "A customer with no heat, a burst pipe, or a water heater out overnight isn't going to wait around. If your phone rings during a job, after hours, or during a busy stretch and nobody picks up, they call the next number on the search results page.",
      "Meanwhile, ad spend keeps running. Clicks without a fast, reliable way to capture and qualify the lead behind them are money spent for nothing.",
    ],
    icon: PhoneMissed,
  },

  painPoints: [
    {
      title: "Missed calls",
      description: "Inquiries lost during jobs, after hours, or during busy stretches.",
      icon: PhoneMissed,
    },
    {
      title: "Expensive clicks",
      description:
        "Google Ads spend that doesn't convert because the landing page or follow-up is weak.",
      icon: Wallet,
    },
    {
      title: "Weak local visibility",
      description: "Showing up inconsistently for the searches that actually turn into jobs.",
      icon: MapPinned,
    },
    {
      title: "Disconnected tools",
      description: "Website, ads, LSA and CRM that don't talk to each other or track results.",
      icon: Radar,
    },
  ],

  aiSection: {
    eyebrow: "The key differentiator",
    headline: "Your Digital Receptionist.",
    body: "An AI assistant trained on your actual services, service area and pricing approach, not a generic script. It can answer common questions, capture lead details, qualify the job type and urgency, and make sure every inquiry reaches your team.",
    boundaryNote:
      "It doesn't automatically dispatch a technician or book the job unless that's specifically built into your setup. It makes sure every inquiry gets a fast, accurate answer and lands in front of your team instead of going to voicemail.",
    capabilities: [
      "Structured company knowledge base",
      "Custom instructions per business",
      "LLM-flexible architecture",
      "Send job summaries to your team",
      "Works outside business hours",
      "Integrates into CRM/workflows",
    ],
    demo: {
      opening: {
        question: "My AC stopped working and I'm in Seattle. Do you service my area?",
        answer:
          "Yes, we service that area. I can grab a few details, like your address and whether the unit is completely off or just not cooling, so the team can get back to you with next steps.",
      },
      presets: [
        {
          question: "Do you handle emergency plumbing?",
          answer:
            "Emergency availability depends on the business and time of day. I can flag this as urgent and get your contact details to the team right away.",
        },
        {
          question: "My water heater is leaking, what should I do?",
          answer:
            "First, if it's safe to do so, shut off the water supply to the unit. I'll pass your details and the situation along so the team can advise on next steps or schedule a visit.",
        },
        {
          question: "Do you do drain cleaning?",
          answer:
            "I can check whether drain service is offered and get you connected with someone who can quote the job.",
        },
        {
          question: "What does an HVAC installation typically involve?",
          answer:
            "It usually starts with an on-site assessment so the team can recommend the right system for your home. I can help set that up.",
        },
        {
          question: "Can I book a maintenance visit?",
          answer:
            "Yes, I can capture your preferred dates and contact info so the team can confirm a maintenance appointment.",
        },
      ],
    },
    knowledgeCategories: [
      {
        label: "Services",
        icon: Wrench,
        items: ["HVAC repair & install", "Plumbing repair", "Maintenance plans"],
      },
      {
        label: "Service area",
        icon: MapPinned,
        items: ["Coverage zones", "Response times", "Emergency availability"],
      },
      {
        label: "Pricing",
        icon: DollarSign,
        items: ["Pricing approach", "Estimate process", "Financing options"],
      },
      {
        label: "Policies",
        icon: FileText,
        items: ["Scheduling rules", "Licensing/insurance info", "Common FAQs"],
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
      { icon: PhoneCall, label: "You get the booked job" },
    ],
  },

  ads: {
    eyebrow: "Google Ads & Local Services Ads",
    headline: "Be There When Someone Searches for a Contractor Right Now.",
    intro:
      "High-intent, often urgent searches happen every day in your service area. A few examples of what that looks like:",
    searchExamples: [
      "emergency plumber near me",
      "AC repair same day",
      "furnace not working",
      "water heater installation",
      "drain cleaning service",
      "HVAC company near me",
      "24 hour plumber",
      "AC installation cost",
    ],
    approach: [
      "Highly relevant keywords, not broad guesswork",
      "Tightly structured campaigns by service type",
      "Location targeting matched to your real service area",
      "Negative keywords to cut wasted spend",
      "Conversion and phone-call tracking",
      "Local Services Ads support where relevant",
      "Landing page relevance, not a generic homepage",
      "Ongoing optimization, not set-and-forget",
    ],
  },

  funnel: {
    eyebrow: "The system, end to end",
    headline: "From search to booked job.",
    steps: [
      { title: "Get Found", description: "Google search & ads bring them in", icon: Search },
      { title: "Land & Engage", description: "Fast page, AI answers questions", icon: Bot },
      { title: "Capture", description: "Call or form, tracked to the source", icon: MessageSquare },
      { title: "Booked Job", description: "Follow-up turns it into revenue", icon: Wrench },
    ],
  },

  website: {
    eyebrow: "Your website",
    headline: "Your Website Should Sell the Job Before You Answer the Phone.",
    body: "A slow, outdated or confusing site loses the call before your team even gets the inquiry. We build sites that get more booked jobs, not just sites that look nice.",
    points: [
      "Modern, mobile-first design",
      "Fast load times on real phones, not just lab tests",
      "Accessible navigation and forms",
      "SEO-ready structure and content",
      "Clear, direct call-to-book pathways",
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
        points: ["AI receptionist", "Company knowledge", "LLM-flexible architecture", "Automation"],
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
    status: "coming-soon",
  },

  offer: {
    eyebrow: "Free HVAC & Plumbing Growth Audit",
    headline: "Get My Free Growth Audit",
    body: "We'll take a real look at your website, Google visibility, Google Ads and LSA opportunity, conversion experience, mobile experience, lead capture, AI opportunities and tracking, then tell you honestly what's worth fixing first.",
    checks: [
      { label: "Website", icon: Globe2 },
      { label: "Google visibility", icon: Search },
      { label: "Ads & LSA opportunity", icon: Megaphone },
      { label: "Conversion experience", icon: Sparkles },
      { label: "Mobile experience", icon: ShieldCheck },
      { label: "Lead capture", icon: MessageSquare },
      { label: "AI opportunities", icon: Bot },
      { label: "Tracking", icon: Radar },
    ],
  },

  form: {
    businessTypes: [
      { id: "hvac", label: "HVAC" },
      { id: "plumbing", label: "Plumbing" },
      { id: "hvac-plumbing", label: "HVAC + Plumbing" },
      { id: "other", label: "Other" },
    ],
    goals: [
      { id: "leads", label: "More Leads" },
      { id: "ads", label: "Google Ads" },
      { id: "lsa", label: "Local Services Ads" },
      { id: "website", label: "Better Website" },
      { id: "ai", label: "AI / Automation" },
      { id: "seo", label: "SEO" },
      { id: "tracking", label: "Tracking" },
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
      a: "It depends on scope: a new website, ongoing Google Ads management and an AI receptionist are priced differently than a single service. We'll give you real numbers after the free growth audit, not a generic package price.",
    },
    {
      q: "Can you build an HVAC or plumbing website?",
      a: "Yes. We design and build modern, mobile-first websites built around getting a visitor from search to a booked job.",
    },
    {
      q: "Can you run Google Ads and Local Services Ads?",
      a: "Yes. We build and manage Google Ads campaigns with location targeting, conversion tracking and ongoing optimization, and can support LSA strategy where relevant. We don't promise guaranteed leads or rankings, but we do promise a transparent, structured approach.",
    },
    {
      q: "Can the AI answer emergency calls?",
      a: "It can capture and flag urgent inquiries and get details to your team quickly, even after hours. Whether it dispatches a technician automatically depends on your specific setup.",
    },
    {
      q: "Can the AI be trained on our services and pricing approach?",
      a: "Yes. It's built on a structured knowledge base of your services, service area, pricing approach, scheduling rules and FAQs, so its answers reflect your actual business.",
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
      q: "Do you work outside Seattle?",
      a: "Seattle is our current focus for this program, but the same website, AI and ads approach applies to other US metros. Ask us about your market.",
    },
    {
      q: "Do I need a new website to run Google Ads?",
      a: "Not always, but your landing page needs to load fast, work on mobile and make the next step obvious. If your current site can't do that, ads traffic gets wasted. We'll tell you honestly which one you need.",
    },
  ],

  finalCta: {
    headline: "Your Next Job Is Already Being Searched For.",
    body: "Let's make sure they find you, trust you, and reach a real answer before they call someone else.",
    primaryCta: "Get My Free Growth Audit",
    secondaryCta: "Book a Strategy Call",
  },

  submitEndpoint: "/api/landing/hvac-plumbing",
};
