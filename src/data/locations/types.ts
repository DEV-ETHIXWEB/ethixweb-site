// Shape of one service-area page (/locations/$slug). Every city page is
// rendered by the same route from one of these, so each file only holds what
// is genuinely local: the market, the neighborhoods, the questions owners
// there ask. Search engines treat near-identical city pages as doorway pages,
// so a new city earns a file only when it has something of its own to say.

export type LocationFaq = { q: string; a: string };

export type LocationFocus = {
  /** Short heading, e.g. "Heat pump demand". */
  title: string;
  body: string;
};

export type Location = {
  /** URL segment, e.g. "seattle-wa". */
  slug: string;
  city: string;
  /** Two-letter state code. */
  state: string;
  county: string;
  /** Wikipedia URL, used as the schema.org City `sameAs`. */
  wiki: string;
  /** <title>, 50 to 62 characters. */
  metaTitle: string;
  /** Meta description, 140 to 160 characters. */
  metaDescription: string;
  h1: string;
  /** One or two sentences under the H1. */
  intro: string;
  /** Heading for the local market section. */
  marketHeading: string;
  /** Two or three paragraphs about this market, specific to the city. */
  market: string[];
  /** Neighborhoods and nearby areas covered from this page. */
  areas: string[];
  /** Three things that matter most for contractors here. */
  focus: LocationFocus[];
  faqs: LocationFaq[];
  /** Slugs of nearby location pages to link to. */
  nearby: string[];
  /** Slugs of case studies from this area or close to it. */
  proof: string[];
};
