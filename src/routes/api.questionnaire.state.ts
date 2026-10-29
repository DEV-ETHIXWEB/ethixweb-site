import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { clientIp } from "@/lib/rate-limit";
import { guardRequest, guardRequestByToken } from "@/lib/api-guard";
import { loadByToken, markOpened } from "@/lib/questionnaire/service";
import { TOKEN_SCHEMA, effectiveStatus } from "@/lib/questionnaire/types";

// Resolves an invitation link on load or refresh. Everything the candidate
// screen does starts here: whether the form is open at all, and if so, where
// they left off. The first successful load is what moves an invitation from
// "pending" to "opened" in the admin dashboard.

const bodySchema = z.object({ token: TOKEN_SCHEMA });

export const Route = createFileRoute("/api/questionnaire/state")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Per-IP first, because a malformed or guessed token has no bucket of
        // its own to throttle.
        const ipGuard = await guardRequest(
          request,
          `questionnaire-state:${clientIp(request)}`,
          120,
          10 * 60 * 1000,
        );
        if (ipGuard) return ipGuard;

        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ ok: true, status: "invalid" });

        const guard = await guardRequestByToken(
          request,
          "questionnaire-state",
          parsed.data.token,
          40,
          10 * 60 * 1000,
        );
        if (guard) return guard;

        const found = await loadByToken(parsed.data.token);
        if (!found) return Response.json({ ok: true, status: "invalid" });

        const status = effectiveStatus(found);
        if (status !== "pending" && status !== "opened") {
          return Response.json({ ok: true, status });
        }

        const row = await markOpened(found);
        return Response.json({
          ok: true,
          status: "open",
          invitedFirstName: row.invited_name.split(/\s+/)[0] ?? "",
          profile: row.profile_completed_at
            ? {
                name: row.candidate_name,
                phone: row.candidate_phone,
                email: row.candidate_email,
                college: row.candidate_college,
                linkedin: row.candidate_linkedin ?? "",
              }
            : null,
          draft: row.draft,
          expiresAt: row.expires_at,
        });
      },
    },
  },
});
