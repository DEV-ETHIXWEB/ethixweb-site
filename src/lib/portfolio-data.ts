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
    slug: "garys-pipeline",
    client: "Gary's Pipelining & Drain Cleaning",
    year: "2026",
    industry: "Trenchless Sewer Repair",
    services: ["Web Design", "SEO"],
    headline: "Turning specialist searches into specialist calls",
    challenge:
      "Gary's Pipelining offers a premium specialty most general plumbers don't - trenchless sewer repair - but the old site didn't do the work of proving that expertise, or converting two very different audiences: homeowners and contractor partners.",
    approach:
      "A ground-up, 25+ page static rebuild with two separate enquiry paths, dedicated pages per service and city, an honest chat assistant, and a built-in accessibility toolkit tested against WCAG 2.1 AA.",
    impact:
      "The rebuild replaced an old, underperforming site with one built specifically to convert specialist search traffic into calls - for both homeowners and the contractors who need a subcontractor.",
    metrics: [
      { value: "25+", label: "Pages built" },
      { value: "2", label: "Dedicated enquiry paths" },
      { value: "24/7", label: "Emergency response line" },
    ],
    image: {
      src: "/images/case-studies/garys-pipeline/after-screenshot.webp",
      alt: "The rebuilt Gary's Pipelining & Drain Cleaning website",
      width: 1920,
      height: 1080,
    },
  },
  {
    slug: "preventive-home-solutions",
    client: "Preventive Home Solutions",
    year: "2026",
    industry: "Local Home Services",
    services: ["Web Design"],
    headline: "From cluttered template to booked inspections",
    challenge:
      "A licensed Northern Utah plumbing and HVAC company was stuck on an old site that opened with a spammy deals banner and two crowded rows of navigation, hiding the trust signals homeowners actually look for.",
    approach:
      "A full redesign around a knight and shield brand, with a Book Your Inspection form built into the hero, license and review proof up front, a chat assistant, and clear service and area pages.",
    impact:
      "A branded, trust-first site that turns a stressed homeowner into a booked inspection in one step, across phone, tablet and desktop.",
    metrics: [
      { value: "5.0", label: "Google rating" },
      { value: "Licensed", label: "& insured" },
    ],
    image: {
      src: "/images/case-studies/preventive-home-solutions/after-screenshot.webp",
      alt: "The rebuilt Preventive Home Solutions website",
      width: 1897,
      height: 980,
    },
  },
  {
    slug: "catching-chrome",
    client: "Catching Chrome",
    year: "2026",
    industry: "Outdoor & Recreation",
    services: ["Web Design"],
    headline: "Turning phone-first anglers into booked trips",
    challenge:
      "An Oregon salmon and steelhead guide service with decades on the water was stuck on an aging blue template that split visitors between two competing buttons and buried the credentials that win bookings.",
    approach:
      "A full mobile-first redesign led by cinematic Pacific Northwest photography, with USCG and experience credentials in the hero and one clear Book Now path on every screen.",
    impact:
      "A cleaner, more credible site that makes the next step obvious and books more guided trips from anglers researching on their phones.",
    metrics: [
      { value: "40+ yrs", label: "On the water" },
      { value: "USCG", label: "Certified guide" },
    ],
    image: {
      src: "/images/case-studies/catching-chrome/after-screenshot.webp",
      alt: "The rebuilt Catching Chrome Guide Service website",
      width: 1892,
      height: 1078,
    },
  },
];
