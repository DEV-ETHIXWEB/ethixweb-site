// Single source of truth for case studies on the "Our Work" page. Every fact
// here (client, industry, services, metrics) is real - only the challenge/
// approach/impact narrative is written up from the underlying result data,
// so nothing here should ever drift into invented client claims.

export type Metric = { value: string; label: string };

export interface CaseStudy {
  slug: string;
  client: string;
  year: string;
  industry: string;
  services: string[];
  /** Challenge-framed headline - communicates the problem, not just the client name. */
  headline: string;
  challenge: string;
  approach: string;
  impact: string;
  metrics: Metric[];
  /** Real screenshot of the shipped site, shown full-bleed behind the card.
   * Omitted = the card falls back to the branded panel treatment (we never
   * fabricate a screenshot for work we can't show). */
  image?: { src: string; alt: string; width: number; height: number };
}

export const SERVICE_FILTERS = [
  "Web Design",
  "SEO",
  "Paid Media",
  "Social",
  "UX Design",
  "Content",
] as const;

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "all-phase-plumbing",
    client: "All Phase Plumbing",
    year: "2026",
    industry: "Local Home Services",
    services: ["Web Design", "SEO"],
    headline: "From invisible online to fully booked in 90 days",
    challenge:
      "A 35-year-old, family-run Seattle plumbing company was stuck on a generic WordPress site that didn't match how good they actually are - in a market where whoever looks trustworthy and ranks well gets the call.",
    approach:
      "A full digital rebuild: website redesign on a custom stack (off WordPress, onto Google Cloud), on-page SEO, Google Business Profile cleanup, and mobile-first pages that get to the call button in seconds.",
    impact:
      "The new site finally matches the reputation - All Phase Plumbing went from invisible online to fully booked in 90 days.",
    metrics: [
      { value: "90 days", label: "From invisible to fully booked" },
      { value: "35 yrs", label: "Of reputation, finally online" },
    ],
    image: {
      src: "/images/case-studies/all-phase-plumbing/after-screenshot.webp",
      alt: "The rebuilt All Phase Plumbing website",
      width: 1800,
      height: 1012,
    },
  },
  {
    slug: "bals-mobile-dental-hygiene",
    client: "Bals Mobile Dental Hygiene",
    year: "2023",
    industry: "Healthcare",
    services: ["Web Design", "SEO", "Paid Media"],
    headline: "Turning hesitant patients into booked appointments",
    challenge:
      "Mobile dental hygiene is an unfamiliar model - most visitors had never booked a dental visit that came to them, and the old site didn't do the work of explaining why that was a good thing.",
    approach:
      "A full website revamp built around trust and clarity, paired with targeted SEO and paid campaigns aimed at the moments people search for at-home care.",
    impact:
      "Traffic and inquiries both moved fast: a 45% traffic lift and over 1,500 patient inquiries in the first year, with cost per lead as low as $5 during peak campaigns.",
    metrics: [
      { value: "+45%", label: "Traffic increase" },
      { value: "1,500+", label: "Patient inquiries (yr 1)" },
      { value: "$5", label: "Cost per lead (peak)" },
    ],
  },
  {
    slug: "mto-cabinets",
    client: "MTO Cabinets",
    year: "2021",
    industry: "Home & Cabinetry",
    services: ["Web Design", "SEO", "Paid Media", "Social"],
    headline: "Making custom cabinetry feel like a five-star experience online",
    challenge:
      "A premium, made-to-order cabinetry business was competing for attention against big-box retailers, and needed a site and funnel that could carry that premium feel through to a lead.",
    approach:
      "Website redesign anchored in craftsmanship and clarity, backed by SEO, paid ads and social to keep qualified demand flowing in year-round.",
    impact:
      "The funnel held up at scale: 2,500+ qualified leads across 12 months, with cost per lead as low as $6 during peak season.",
    metrics: [
      { value: "2,500+", label: "Qualified leads (12mo)" },
      { value: "$6", label: "Cost per lead (peak)" },
    ],
  },
  {
    slug: "bimini-buddie",
    client: "Bimini Buddie",
    year: "2022",
    industry: "Marine & Boating",
    services: ["UX Design", "Social", "Content"],
    headline: "Getting boaters from browsing to booking faster",
    challenge:
      "The buying journey for marine gear is research-heavy - the old experience made it easy to browse and easy to leave without ever reaching out.",
    approach:
      "A UX overhaul focused on removing friction at the point of decision, paired with paid social, search and email to keep interested buyers moving forward.",
    impact:
      "A 40% traffic lift and 1,500+ leads inside six months, with cost per lead down to $5 at peak.",
    metrics: [
      { value: "+40%", label: "Traffic increase" },
      { value: "1,500+", label: "Leads (6mo)" },
      { value: "$5", label: "Cost per lead (peak)" },
    ],
  },
  {
    slug: "catch-zone",
    client: "Catch Zone",
    year: "2023",
    industry: "Outdoor & Recreation",
    services: ["SEO", "Paid Media"],
    headline: "Reeling in qualified leads at a record-low cost",
    challenge:
      "A fishing-focused business needed lead volume that could scale with the season without the cost per lead scaling right alongside it.",
    approach:
      "Performance-driven, cross-channel campaigns tuned continuously against real conversion data rather than set-and-forget targeting.",
    impact:
      "2,000+ qualified leads generated, with cost per lead dipping to $3.50 during peak season - the strongest efficiency of any campaign in this set.",
    metrics: [
      { value: "2,000+", label: "Qualified leads" },
      { value: "$3.50", label: "Cost per lead (peak)" },
    ],
  },
  {
    slug: "sharpe-wysman",
    client: "Sharpe Wysman",
    year: "2022",
    industry: "Legal & Financial",
    services: ["SEO", "Content", "Paid Media"],
    headline: "Helping a legal & financial firm earn trust before the first call",
    challenge:
      "Legal and financial services live or die on trust, and the firm's search visibility didn't match the caliber of the team behind it.",
    approach:
      "Advanced technical SEO, authority-building content and precision-targeted ads aimed at high-intent searches rather than broad reach.",
    impact:
      "A 50% increase in traffic and 1,800+ qualified leads in the first year, at a $7 cost per lead.",
    metrics: [
      { value: "+50%", label: "Traffic increase" },
      { value: "1,800+", label: "Qualified leads (yr 1)" },
      { value: "$7", label: "Cost per lead" },
    ],
  },
  {
    slug: "always-natural",
    client: "Always Natural",
    year: "2023",
    industry: "Wellness & DTC",
    services: ["Web Design", "SEO", "Paid Media", "Social"],
    headline: "Turning wellness browsers into loyal customers",
    challenge:
      "A direct-to-consumer wellness brand needed its site to convert as well as its product performed, in a crowded, skepticism-heavy category.",
    approach:
      "Site redesign built around social proof and product clarity, supported by SEO, paid ads and social to bring in demand the new site could actually convert.",
    impact:
      "A 60% traffic increase and 2,200+ new leads within six months, at $4.50 cost per lead.",
    metrics: [
      { value: "+60%", label: "Traffic increase" },
      { value: "2,200+", label: "New leads (6mo)" },
      { value: "$4.50", label: "Cost per lead (peak)" },
    ],
  },
];
