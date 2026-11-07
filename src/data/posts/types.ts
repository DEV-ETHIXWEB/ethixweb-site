// One published article (/blog/$slug). Plain data so posts can move to a
// CMS later without reshaping. Inline text supports two bits of markup,
// rendered by components/blog/RichText: [label](/internal-path) for links
// and **bold**. Nothing else, so copy stays easy to write and review.

/** A responsive image. `width`/`height` are the intrinsic pixels of `src`,
 * so the browser can reserve the space before the file arrives and the
 * article never jumps while it loads. */
export type PostImage = {
  src: string;
  /** Width-descriptor set, e.g. "a-640w.webp 640w, a.webp 1512w". */
  srcSet: string;
  width: number;
  height: number;
  /** Describes the picture to a reader who can't see it. Never decorative. */
  alt: string;
};

export type PostBlock =
  | { h2: string }
  | { h3: string }
  | { p: string }
  /** A diagram inside the article body, with a caption under it. */
  | { figure: PostImage & { caption?: string } }
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
  /** Lead image under the hero. Also the article's schema.org image. */
  heroImage?: PostImage;
  /** 1200x630 social card for og:image / twitter:image. Falls back to the
   * site-wide card when a post doesn't have one of its own. */
  socialImage?: string;
  body: PostBlock[];
  /** Rendered as an accordion and marked up as FAQPage. Answers are plain
   * text: they go into structured data as written. */
  faqs?: { q: string; a: string }[];
  /** Internal pages to point readers to at the end. */
  related: { label: string; to: string }[];
};
