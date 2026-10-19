// Site-wide constants used outside the email-template context (SEO,
// structured data, canonical URLs) - kept separate from lib/email.ts so
// non-email code doesn't couple to a module dedicated to Resend templates.
//
// Every canonical, og:url, JSON-LD url and sitemap-facing absolute URL must
// be built from here. They used to be written out by hand - roughly 150
// literal "https://www.ethixweb.com" across 25 files - which made
// VITE_SITE_URL dead config: a preview or staging deploy served pages whose
// canonical and og:url still pointed at production, telling crawlers the
// preview was production.

export const SITE_URL = import.meta.env.VITE_SITE_URL || "https://www.ethixweb.com";

/** Absolute URL for a site-relative path. Accepts "/about" or "about", and
 * returns SITE_URL itself for "/" so the homepage canonical stays
 * "https://www.ethixweb.com/" rather than gaining a second slash. */
export function siteUrl(path = "/"): string {
  if (!path || path === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** The wordmark, used for schema.org `logo` and the email header. A 422x63
 * transparent PNG - correct for a logo field, wrong for a social card. */
export const LOGO_IMAGE = siteUrl("/ethixweb.png");

/** The 1200x630 social card every page's og:image / twitter:image points at,
 * unless the page has a more specific image of its own (case studies use
 * their hero). Built by scripts/generate-og-image.mjs. */
export const OG_IMAGE = siteUrl("/og-image.png");
export const OG_IMAGE_WIDTH = "1200";
export const OG_IMAGE_HEIGHT = "630";
