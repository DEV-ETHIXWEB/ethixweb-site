// Fires the Google Ads "Submit lead form" conversion. gtag.js is loaded on
// demand once the visitor accepts advertising cookies (see lib/consent.ts),
// so every call here no-ops until then.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const CONVERSION_SEND_TO = "AW-18387669255/PMlICKyYluEcEIei9r9E";

/**
 * Which form produced the lead. All five forms share one Google Ads
 * conversion label, so without this the Ads report cannot tell a /contact
 * submission from an HVAC landing page submission, and there is no way to
 * see which campaign page is actually paying for itself.
 *
 * Passing the source as an event parameter separates them in reporting
 * without inventing conversion labels that do not exist in the Ads account.
 * If you later create a per-page conversion action in Google Ads, give each
 * one its own `send_to` and key it off this same source.
 */
export type LeadSource =
  | "contact"
  | "chat"
  | "hvac-plumbing-marketing"
  | "google-ads-management"
  | "fishing-marine-marketing"
  | "fishing-marketing-seattle";

export function trackLeadFormConversion(source: LeadSource) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "conversion", {
    send_to: CONVERSION_SEND_TO,
    lead_source: source,
  });
}
