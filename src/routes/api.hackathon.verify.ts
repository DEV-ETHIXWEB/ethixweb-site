import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { guardRequest } from "@/lib/api-guard";
import { clientIp } from "@/lib/rate-limit";
import { verifyUnlockProof } from "@/lib/hackathon/unlock";

// Lets the page silently re-confirm a previously-issued unlock proof (stored
// client-side in localStorage) on refresh/direct navigation, without ever
// having the client hold or resend the actual code.
export const Route = createFileRoute("/api/hackathon/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const guard = await guardRequest(
          request,
          `hackathon-verify:${clientIp(request)}`,
          30,
          10 * 60 * 1000,
        );
        if (guard) return guard;

        const body = await request.json().catch(() => null);
        const { token, exp } =
          body && typeof body === "object"
            ? (body as Record<string, unknown>)
            : { token: null, exp: null };

        return Response.json({ ok: verifyUnlockProof(token, exp) }, { status: 200 });
      },
    },
  },
});
