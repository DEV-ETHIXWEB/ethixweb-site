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
