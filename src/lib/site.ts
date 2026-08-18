// Site-wide constants used outside the email-template context (SEO,
// structured data, canonical URLs) - kept separate from lib/email.ts so
// non-email code doesn't couple to a module dedicated to Resend templates.

export const SITE_URL = import.meta.env.VITE_SITE_URL || "https://www.ethixweb.com";
