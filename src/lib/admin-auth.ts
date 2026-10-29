import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// The one recruiter password, shared by every internal admin page
// (/admin/assessments, /admin/questionnaire). It lives in GADS_ADMIN_PASSWORD
// for historical reasons and is compared only on the server. With it unset,
// isAdminConfigured() is false and every admin endpoint refuses, so a
// misconfigured deploy can't leave anything open.

export function isAdminConfigured(): boolean {
  return Boolean(process.env.GADS_ADMIN_PASSWORD);
}

export function adminPasswordMatches(supplied: string): boolean {
  const expected = process.env.GADS_ADMIN_PASSWORD;
  if (!expected) return false;
  // Compare fixed-width digests rather than the raw strings. timingSafeEqual
  // needs equal lengths, so the usual `a.length !== b.length` guard in front
  // of it answers "is the password N characters long?" before any comparison
  // happens. Hashing first makes both sides 32 bytes whatever was supplied,
  // so length tells an attacker nothing.
  const a = createHash("sha256").update(supplied).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

// A signed, expiring session for admin pages that make many calls (the
// questionnaire dashboard opens a candidate per click). Sign-in checks the
// password once under a tight rate limit and hands back
// "<expiryMs>.<hmac>"; every later call sends that instead. The HMAC key is
// the admin password itself, so rotating the password ends every session.
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function sessionMac(expiry: string): string {
  return createHmac("sha256", process.env.GADS_ADMIN_PASSWORD ?? "")
    .update(`admin-session:${expiry}`)
    .digest("hex");
}

export function issueAdminSession(): string {
  const expiry = String(Date.now() + SESSION_TTL_MS);
  return `${expiry}.${sessionMac(expiry)}`;
}

export function adminSessionValid(session: string): boolean {
  if (!process.env.GADS_ADMIN_PASSWORD) return false;
  const [expiry, mac] = session.split(".");
  if (!expiry || !mac || !/^\d+$/.test(expiry) || Number(expiry) < Date.now()) return false;
  const a = createHash("sha256").update(mac).digest();
  const b = createHash("sha256").update(sessionMac(expiry)).digest();
  return timingSafeEqual(a, b);
}
