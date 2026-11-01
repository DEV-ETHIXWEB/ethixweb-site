// One published article (/blog/$slug). Plain data so posts can move to a
// CMS later without reshaping. Inline text supports two bits of markup,
// rendered by components/blog/RichText: [label](/internal-path) for links
// and **bold**. Nothing else, so copy stays easy to write and review.

export type PostBlock =
  | { h2: string }
  | { h3: string }
  | { p: string }
  | { ul: string[] }
  | { ol: string[] }
  /** A highlighted takeaway box. */
  | { note: string };

export type Post = {
  slug: string;
  title: string;
  /** <title>, 50 to 62 characters. */
  metaTitle: string;
  /** Meta description, 140 to 160 characters. */
  metaDescription: string;
  /** Must match a category on /blog. */
  category: string;
  readMinutes: number;
  /** ISO date, e.g. "2026-11-01". */
  published: string;
  updated?: string;
  /** One or two sentences for the card and the article intro. */
  excerpt: string;
  body: PostBlock[];
  /** Internal pages to point readers to at the end. */
  related: { label: string; to: string }[];
};
