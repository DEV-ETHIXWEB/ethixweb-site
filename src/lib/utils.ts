import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Local part, then a dotted domain whose labels can't be empty and whose TLD
// is alphabetic. The older `[^\s@]+@[^\s@]+\.[^\s@]+` accepted "a@b..c" and
// anything else without a space in it; the length cap is RFC 5321's.
const EMAIL_RE = /^[^\s@]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i;
export const MAX_EMAIL_LENGTH = 254;
export const MAX_WEBSITE_LENGTH = 200;

export function isValidEmail(email: string) {
  return email.length <= MAX_EMAIL_LENGTH && EMAIL_RE.test(email);
}

/** Field caps for the public lead forms. The API routes used to apply none at
 * all, so a name or business name of any size was trimmed and then written
 * straight into Postgres, a ClickUp task and an email body. These mirror the
 * maxLength on the inputs, so a normal submission never reaches them. */
export const FIELD_LIMITS = {
  name: 120,
  phone: 30,
  email: MAX_EMAIL_LENGTH,
  website: MAX_WEBSITE_LENGTH,
  company: 160,
  shortChoice: 60,
  message: 4000,
} as const;

/**
 * Normalizes one free-text field off the wire: returns "" for anything that
 * isn't a string, collapses the control characters that don't belong in a
 * single-line value, and truncates to `max`.
 *
 * Newlines matter beyond tidiness - these values are interpolated into the
 * Resend subject line ("New lead request: ${business}"), and a raw CR/LF in a
 * mail header is the classic header-injection shape. Stripping them here
 * means no caller has to remember to.
 */
export function cleanField(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return (
    value
      // Matching control characters is the whole job here, so the rule that
      // flags them in a pattern is the one thing we don't want.
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001f\u007f]+/g, " ")
      .trim()
      .slice(0, max)
  );
}

/** Same, but keeps newlines - for genuinely multi-line values (a message or
 * project description) that are only ever rendered in a body, never a header. */
export function cleanMultiline(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return (
    value
      .replace(/\r\n?/g, "\n")
      // Same as above, minus \n and \t which are legitimate here.
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]+/g, " ")
      .trim()
      .slice(0, max)
  );
}

/** Phone is a required field on every lead form, so this only rejects entries
 * that can't be a real number: it counts digits and ignores the formatting
 * people actually type (+, spaces, dashes, brackets, a leading 00). 7 digits is
 * the shortest national number still in use; 15 is the E.164 maximum. */
export function isValidPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

/** The contact form asks for the prospect's website, and people type it every
 * way there is: "acme.com", "www.acme.com", "https://acme.com/pricing". Accept
 * all of those and hand back one canonical absolute URL so the team always has
 * something clickable. Returns null when the value can't be a real site, which
 * is how callers reject it. */
export function normalizeWebsiteUrl(website: string): string | null {
  const trimmed = website.trim();
  if (!trimmed || trimmed.length > MAX_WEBSITE_LENGTH) return null;

  // A bare domain has no scheme to parse, so assume https. Anything that does
  // name a scheme has to be http(s): mailto:, javascript: and friends are not
  // websites, and must not survive into an email or a ClickUp task as a link.
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed);
  let url: URL;
  try {
    url = new URL(hasScheme ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  // Require a dotted hostname with a plausible TLD - a single word typed into
  // the field ("mysite", "localhost") parses fine but isn't a site we can open.
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(url.hostname)) return null;

  // Strip embedded credentials. "https://user:pass@acme.com" passes every
  // check above (the hostname really is acme.com), and the result is mailed
  // to the team and written into a ClickUp task as a clickable link - so
  // whatever was in front of the @ would be stored and shared verbatim.
  url.username = "";
  url.password = "";

  return url.toString();
}
