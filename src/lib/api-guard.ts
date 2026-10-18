import { checkRateLimitDurable } from "@/lib/rate-limit";
import { isSameOriginRequest } from "@/lib/origin-check";

/**
 * Standard entry guard for public POST API routes: rejects cross-origin
 * requests, then enforces a durable per-IP rate limit. Returns a Response to
 * send immediately when the request should be rejected, or null to continue
 * handling it normally.
 */
export async function guardRequest(
  request: Request,
  rateLimitKey: string,
  limit: number,
  windowMs: number,
  rateLimitMessage = "Too many requests. Please try again later.",
): Promise<Response | null> {
  if (!isSameOriginRequest(request)) {
    return Response.json({ ok: false, error: "Invalid request origin" }, { status: 403 });
  }
  if (!(await checkRateLimitDurable(rateLimitKey, limit, windowMs))) {
    return Response.json({ ok: false, error: rateLimitMessage }, { status: 429 });
  }
  return null;
}

/**
 * Same as guardRequest, but the rate-limit bucket is the candidate's own
 * assessment token rather than their IP.
 *
 * Exam traffic is bursty and highly concurrent: a cohort sitting the test
 * from one campus, office or hostel all share a single public IP, so an
 * IP bucket silently becomes a shared allowance. At one save every five
 * seconds per candidate, four of them on the same network exhausted the old
 * 400-per-IP save budget inside the window and everyone after that started
 * getting 429s mid-question. The token is unguessable, already required, and
 * scoped to exactly one candidate, which makes it the honest unit to meter.
 *
 * Callers must still check the origin first - this only replaces the
 * rate-limit half of guardRequest.
 */
export async function guardRequestByToken(
  request: Request,
  bucket: string,
  token: string,
  limit: number,
  windowMs: number,
  rateLimitMessage = "Too many requests. Please try again in a moment.",
): Promise<Response | null> {
  if (!isSameOriginRequest(request)) {
    return Response.json({ ok: false, error: "Invalid request origin" }, { status: 403 });
  }
  // The token is a 64-hex secret; keep only a short prefix so it is never
  // written whole into rate-limit storage or logs.
  const scoped = `${bucket}:${token.slice(0, 16)}`;
  if (!(await checkRateLimitDurable(scoped, limit, windowMs))) {
    return Response.json({ ok: false, error: rateLimitMessage }, { status: 429 });
  }
  return null;
}
