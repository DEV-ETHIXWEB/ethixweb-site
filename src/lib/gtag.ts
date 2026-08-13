// Fires the Google Ads "Submit lead form" conversion. gtag.js itself is
// loaded globally in __root.tsx; this only queues the conversion event once
// a lead form has genuinely succeeded (never on click, validation failure,
// or a failed API call).

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackLeadFormConversion() {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "conversion", {
    send_to: "AW-18387669255/PMlICKyYluEcEIei9r9E",
  });
}
