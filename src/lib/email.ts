// Shared Ethixweb email building blocks (Resend).
// Used by every lead-capture API route so notification + confirmation
// emails share one branded layout, helpers, and copy.

export const SITE_URL = "https://ethixweb.com";
export const APP_URL = "https://ethixweb-reimagined.vercel.app";
export const MASCOT_URL = `${SITE_URL}/Ethan%20view%203.png`;
export const LOGO_URL = `${APP_URL}/ethixweb.png`;
export const BRAND_RED = "#c0272d";
export const DARK = "#0e0c14";

export const FROM_EMAIL = "Ethixweb Website <forms@ethixweb.com>";
export const REPLY_TO_INFO = "info@ethixweb.com";

export const SERVICE_LABELS: Record<string, string> = {
  website: "Website",
  ai: "AI Automation",
  crm: "CRM & Integrations",
  seo: "SEO & Ads",
  webapp: "Web Application",
  other: "Something else",
};

export const TIMELINE_LABELS: Record<string, string> = {
  asap: "ASAP (under 2 weeks)",
  month: "This month (2-4 weeks)",
  quarter: "This quarter (1-3 months)",
  planning: "Just planning (3+ months out)",
};

export const NOTICE_PERIOD_LABELS: Record<string, string> = {
  immediate: "Immediate / Currently available",
  "15-days": "15 days",
  "30-days": "30 days",
  "60-days": "60 days",
  "90-days": "90+ days",
};

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** A single label/value row inside an email summary table. */
export function emailRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #f0f0f0;">
        <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9aa0a6;margin-bottom:4px;">${label}</div>
        <div style="font-size:15px;font-weight:600;color:#1a1a1a;">${value}</div>
      </td>
    </tr>`;
}

/** Wraps body HTML in the shared Ethixweb branded card (header + mascot + footer). */
export function emailShell({
  eyebrow,
  bodyHtml,
  footerText,
}: {
  eyebrow: string;
  bodyHtml: string;
  footerText: string;
}) {
  return `
    <div style="background:#f4f4f7;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #ececec;">
        <tr>
          <td style="background:${DARK};padding:32px;">
            <table role="presentation" width="100%">
              <tr>
                <td style="vertical-align:middle;">
                  <img src="${LOGO_URL}" width="160" height="24" alt="Ethixweb" style="display:block;border:0;width:160px;height:24px;" />
                  <div style="margin-top:10px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${BRAND_RED};">${eyebrow}</div>
                </td>
                <td style="width:72px;text-align:right;vertical-align:bottom;">
                  <img src="${MASCOT_URL}" width="72" alt="" style="display:block;border:0;" />
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px;background:#fafafa;border-top:1px solid #f0f0f0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9aa0a6;">${footerText}</p>
          </td>
        </tr>
      </table>
    </div>`;
}

/** Renders a branded button-style link used in both notification & confirmation emails. */
export function emailButton(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:${BRAND_RED};color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:999px;">${label}</a>`;
}
