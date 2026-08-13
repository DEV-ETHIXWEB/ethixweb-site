import { createHmac, timingSafeEqual } from "node:crypto";

// Server-only helpers for the /hackathon unlock flow. The code itself never
// reaches the client - the browser only ever receives a signed proof token
// after a correct guess, and that token (not the code) is what re-unlocks
// the registration section on refresh (see api.hackathon.unlock.ts).

const PROOF_WINDOW_MS = 24 * 60 * 60 * 1000; // stays unlocked for a day

function isProduction(): boolean {
  const env = process.env.VERCEL_ENV ?? process.env.NODE_ENV;
  return env !== "development" && env !== "preview" && env !== "test";
}

export function getUnlockCode(): string | null {
  const code = process.env.HACKATHON_UNLOCK_CODE;
  return code && code.trim() ? code.trim() : null;
}

export function codeMatches(candidate: string, expected: string): boolean {
  const a = Buffer.from(candidate.trim().toUpperCase());
  const b = Buffer.from(expected.toUpperCase());
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Signs a short-lived proof that this browser already supplied the correct
 * code, using the unlock code itself as the HMAC key - it's already a
 * server-only secret, and only someone who already knows (or correctly
 * guessed) the code could ever produce a valid signature with it. */
export function signUnlockProof(): { token: string; exp: number } | null {
  const code = getUnlockCode();
  if (!code) return null;
  const exp = Date.now() + PROOF_WINDOW_MS;
  const token = createHmac("sha256", code).update(`unlocked:${exp}`).digest("hex");
  return { token, exp };
}

export function verifyUnlockProof(token: unknown, exp: unknown): boolean {
  const code = getUnlockCode();
  if (!code || typeof token !== "string") return false;
  if (typeof exp !== "number" && typeof exp !== "string") return false;
  const expNum = Number(exp);
  if (!Number.isFinite(expNum) || Date.now() > expNum) return false;

  const expected = createHmac("sha256", code).update(`unlocked:${expNum}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export { isProduction };
