// One keyword landing page (e.g. /hvac-seo). Each targets a single
// commercial US search and is rendered by components/solutions/SolutionPage.
// Every page needs content of its own: two pages that differ only in the
// trade name would be treated as duplicates and help neither.

export type SolutionItem = { title: string; body: string };
export type SolutionFaq = { q: string; a: string };

export type Solution = {
  /** URL path segment at the site root, e.g. "hvac-seo". */
  slug: string;
  /** <title>, 50 to 62 characters. */
  metaTitle: string;
  /** Meta description, 140 to 160 characters. */
  metaDescription: string;
  /** Short label for the page tag and breadcrumbs. */
  label: string;
  h1: string;
  intro: string;
  /** schema.org Service name and type. */
  serviceName: string;
  serviceType: string;
  problemHeading: string;
  problem: string[];
  deliverablesHeading: string;
  deliverables: SolutionItem[];
  steps: SolutionItem[];
  faqs: SolutionFaq[];
  /** Case studies to show as proof. */
  proof: string[];
  /** Internal links: guides, services and city pages. */
  related: { label: string; to: string }[];
};
