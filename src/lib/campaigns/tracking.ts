// Tracking + attribution abstraction shared by every campaign landing page.
// Pushes to window.dataLayer using the standard GTM convention - a safe
// no-op today since no GTM container is loaded in __root.tsx yet, and will
// start flowing the moment one is added with zero changes here.

export type CampaignTrackEvent =
  | "campaign_page_view"
  | "campaign_cta_click"
  | "campaign_form_start"
  | "campaign_form_step"
  | "campaign_form_submit"
  | "campaign_phone_click"
  | "campaign_booking_click";

export interface CampaignMeta {
  industry: string;
  location: string;
  campaign: string;
  page: string;
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function trackCampaignEvent(
  event: CampaignTrackEvent,
  meta: CampaignMeta,
  extra?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...meta, ...extra });
}

// ── Attribution (UTM / Google Ads click ids) ────────────────────────────

const ATTRIBUTION_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
] as const;

export type AttributionData = Partial<Record<(typeof ATTRIBUTION_PARAMS)[number], string>>;

const STORAGE_KEY = "ethixweb_attribution";

/**
 * Captures known UTM/click-id params from the current URL and persists them
 * in sessionStorage so they survive the visitor navigating from the landing
 * page to the in-page form (and a same-tab reload) without needing a
 * server-side session. Existing stored values are only overwritten by
 * params actually present in the URL, so a later page view without them
 * doesn't erase attribution captured on landing.
 */
export function captureAttribution(): AttributionData {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const fromUrl: AttributionData = {};
  for (const key of ATTRIBUTION_PARAMS) {
    const value = params.get(key);
    if (value) fromUrl[key] = value;
  }

  let stored: AttributionData = {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) stored = JSON.parse(raw) as AttributionData;
  } catch {
    // sessionStorage unavailable (privacy mode, etc.) - fall back to URL-only.
  }

  const merged = { ...stored, ...fromUrl };

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // Best-effort only.
  }

  return merged;
}
