// Advertising-cookie consent.
//
// Google Ads gtag.js used to be loaded unconditionally from the <head> of
// every page, so an advertising cookie was set before anyone had been asked
// and regardless of where they were. The tag is now loaded only after an
// explicit accept, which is also what the privacy policy promises.
//
// Deliberately localStorage rather than a cookie: storing a consent record in
// a cookie, before consent, is the thing this is meant to avoid. The value
// never leaves the device.

export const CONSENT_KEY = "ethix-consent-ads";
export type ConsentChoice = "granted" | "denied";

/** The stored choice, or null if the visitor has not been asked yet. */
export function readConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    // Private mode or blocked storage. Treat as "not asked": the banner shows
    // again next time, which is the conservative behaviour - it never results
    // in the tag loading without an accept.
    return null;
  }
}

export function writeConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // Nothing to persist to. The choice still applies for this page view.
  }
}

const GTAG_ID = "AW-18387669255";
const GTAG_SRC = `https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`;

let loading = false;

/**
 * Injects gtag.js and runs its bootstrap. Idempotent and safe to call on
 * every page view once consent is granted; does nothing on the server.
 */
export function loadAdsTag(): void {
  if (typeof document === "undefined" || loading) return;
  if (document.querySelector(`script[src="${GTAG_SRC}"]`)) return;
  loading = true;

  window.dataLayer = window.dataLayer || [];
  // gtag.js reads its queue as an `arguments` object, so this has to push the
  // real thing rather than a plain array.
  function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  }
  window.gtag = gtag as typeof window.gtag;
  gtag("js", new Date());
  gtag("config", GTAG_ID);

  const script = document.createElement("script");
  script.src = GTAG_SRC;
  script.async = true;
  document.head.appendChild(script);
}
