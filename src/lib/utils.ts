import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string) {
  return EMAIL_RE.test(email);
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
  if (!trimmed) return null;

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

  return url.toString();
}
