import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { guardRequest } from "@/lib/api-guard";
import { clientIp } from "@/lib/rate-limit";
import { getUnlockCode, codeMatches, signUnlockProof, isProduction } from "@/lib/hackathon/unlock";

export const Route = createFileRoute("/api/hackathon/unlock")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Tight limit - this endpoint exists specifically to resist guessing,
        // so a generous rate limit would defeat the point of the puzzle.
        const guard = await guardRequest(
          request,
          `hackathon-unlock:${clientIp(request)}`,
          8,
          10 * 60 * 1000,
          "Too many attempts. Please try again later.",
        );
        if (guard) return guard;

        const body = await request.json().catch(() => null);
        const candidate =
          body && typeof body === "object" ? (body as Record<string, unknown>).code : null;

        if (typeof candidate !== "string" || !candidate.trim()) {
          return Response.json({ ok: false, error: "Enter a code." }, { status: 400 });
        }

        const expected = getUnlockCode();
        if (!expected) {
          if (isProduction()) {
            console.error("[api/hackathon/unlock] HACKATHON_UNLOCK_CODE is not configured");
          }
          return Response.json(
            { ok: false, error: "Unlock is temporarily unavailable. Please try again later." },
            { status: 503 },
          );
        }

        if (!codeMatches(candidate, expected)) {
          // Never confirms/denies anything about the code itself.
          return Response.json(
            { ok: false, error: "That code isn't valid. Try again." },
            { status: 401 },
          );
        }

        const proof = signUnlockProof();
        if (!proof) {
          return Response.json(
            { ok: false, error: "Unlock is temporarily unavailable. Please try again later." },
            { status: 503 },
          );
        }

        return Response.json({ ok: true, token: proof.token, exp: proof.exp }, { status: 200 });
      },
    },
  },
});
