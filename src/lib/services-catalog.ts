import {
  Accessibility,
  BarChart3,
  Bot,
  Boxes,
  Brain,
  Clapperboard,
  ClipboardList,
  Eye,
  Globe2,
  Headset,
  LayoutDashboard,
  LayoutTemplate,
  LifeBuoy,
  LineChart,
  Mail,
  Megaphone,
  MessageSquare,
  MousePointerClick,
  PhoneCall,
  Plug,
  RefreshCw,
  Rocket,
  ScanEye,
  Search,
  ShieldCheck,
  Target,
  UserCheck,
  Workflow,
  type LucideIcon,
} from "lucide-react";

/** The full Ethixweb service catalog, source-of-truth copy taken from
 * "The Ethixweb Services" one-pager (DATA/Ethixweb_Services.pdf). Deliberately
 * has no pricing - it's a capability list, not a rate card. Shared by the
 * homepage catalog teaser and the full breakdown on /services so the two
 * never drift out of sync. */
export type ServiceItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type ServiceCategory = {
  icon: LucideIcon;
  title: string;
  /** One-line summary used by the homepage teaser card. */
  teaser: string;
  /** Existing site page this category maps to, if one exists. */
  to?: string;
  items: ServiceItem[];
};

export const SERVICE_CATALOG: ServiceCategory[] = [
  {
    icon: Globe2,
    title: "Website",
    teaser: "Redesigns, headless builds, landing pages, and ongoing maintenance.",
    to: "/web-development",
    items: [
      {
        icon: LayoutTemplate,
        title: "Website Redesign",
        description: "A modern site built around how your business sells.",
      },
      {
        icon: Boxes,
        title: "Headless Architecture",
        description: "Faster, more flexible foundation for future growth.",
      },
      {
        icon: MousePointerClick,
        title: "Landing Pages",
        description: "Purpose-built pages that convert campaign traffic.",
      },
      {
        icon: ShieldCheck,
        title: "Maintenance & Security",
        description: "Updates, monitoring, and patching after launch.",
      },
    ],
  },
  {
    icon: Bot,
    title: "AI",
    teaser: "Chatbots and AI receptionists that qualify and route leads around the clock.",
    to: "/ai-automation",
    items: [
      {
        icon: MessageSquare,
        title: "Knowledge Chatbot",
        description: "Fast answers from a fixed script or FAQ library.",
      },
      {
        icon: Brain,
        title: "LLM Chatbot",
        description: "Reasons over your real knowledge base, in your voice.",
      },
      {
        icon: PhoneCall,
        title: "AI Receptionist / CSR",
        description: "Handles inquiries and requests around the clock.",
      },
      {
        icon: UserCheck,
        title: "Human Handoff",
        description: "A real person steps in when it actually matters.",
      },
    ],
  },
  {
    icon: Rocket,
    title: "Growth",
    teaser: "SEO, Google & Meta ads, social, and email working as one engine.",
    to: "/marketing",
    items: [
      {
        icon: Search,
        title: "SEO",
        description: "Technical fixes, content, and authority over time.",
      },
      {
        icon: Megaphone,
        title: "Google Ads + LSA",
        description: "Campaigns built, tracked, and optimized weekly.",
      },
      {
        icon: Target,
        title: "Meta Ads",
        description: "Facebook and Instagram, targeted and retargeted.",
      },
      {
        icon: Clapperboard,
        title: "Social + Reels",
        description: "Strategy, content calendar, and creative production.",
      },
      {
        icon: Mail,
        title: "Email Marketing",
        description: "Campaigns, automation, and segmentation that convert.",
      },
      {
        icon: Workflow,
        title: "CRM Integration",
        description: "Leads flow straight into the system you already use.",
      },
    ],
  },
  {
    icon: BarChart3,
    title: "Data",
    teaser: "Live dashboards, analytics, and monthly reporting for every channel.",
    to: "/contact",
    items: [
      {
        icon: LayoutDashboard,
        title: "Dashboard",
        description: "Every channel's performance in one live view.",
      },
      {
        icon: LineChart,
        title: "Analytics",
        description: "Website, ads, and lead tracking, fully connected.",
      },
      {
        icon: ClipboardList,
        title: "Monthly Reporting",
        description: "What happened, why, and what to do next.",
      },
    ],
  },
  {
    icon: Eye,
    title: "Accessibility",
    teaser: "Improvements and testing reviewed against recognized standards.",
    to: "/contact",
    items: [
      {
        icon: Accessibility,
        title: "Accessibility Improvements",
        description: "Contrast, navigation, and structure that includes everyone.",
      },
      {
        icon: ScanEye,
        title: "Accessibility Testing",
        description: "Reviewed against recognized accessibility standards.",
      },
    ],
  },
  {
    icon: LifeBuoy,
    title: "Support",
    teaser: "A real team on technical support, content, and API maintenance.",
    to: "/contact",
    items: [
      {
        icon: Headset,
        title: "Technical Support",
        description: "A real team, reachable when something breaks.",
      },
      {
        icon: RefreshCw,
        title: "AI + Content Updates",
        description: "Your chatbot's knowledge, kept current every month.",
      },
      {
        icon: Plug,
        title: "API Maintenance",
        description: "Every integration monitored and kept in sync.",
      },
    ],
  },
];

export const SERVICE_CATALOG_TOTAL = SERVICE_CATALOG.reduce(
  (total, category) => total + category.items.length,
  0,
);
