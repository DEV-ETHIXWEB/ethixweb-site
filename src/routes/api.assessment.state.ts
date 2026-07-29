import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { clientIp } from "@/lib/rate-limit";
import { guardRequest } from "@/lib/api-guard";
import { loadAssessment } from "@/lib/assessment/service";
import { verifySessionToken } from "@/lib/assessment/session";
import { sanitizeQuestion } from "@/lib/assessment/types";

// Session restore after a refresh/crash: given the id + bearer token the
// browser stashed at start, returns the sanitized questions, saved answers,
// and the server-authoritative deadline so the timer picks up where it left
// off. loadAssessment() also lazily finalizes an exam whose window lapsed.

const bodySchema = z.object({
  assessmentId: z.string().uuid(),
  sessionToken: z.string().length(64),
});

export const Route = createFileRoute("/api/assessment/state")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const guard = await guardRequest(
          request,
          `assessment-state:${clientIp(request)}`,
          30,
          10 * 60 * 1000,
        );
        if (guard) return guard;

        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
        }

        const row = await loadAssessment(parsed.data.assessmentId);
        if (!row) {
          return Response.json({ ok: false, error: "Assessment not found" }, { status: 404 });
        }
        if (!verifySessionToken(parsed.data.sessionToken, row.session_token_hash)) {
          return Response.json({ ok: false, error: "Invalid session" }, { status: 403 });
        }

        if (row.status !== "in_progress") {
          return Response.json({ ok: true, status: row.status });
        }

        return Response.json({
          ok: true,
          status: row.status,
          roleId: row.role_id,
          candidateName: row.candidate_name,
          questions: row.questions.map(sanitizeQuestion),
          answers: row.answers,
          violations: row.violations,
          expiresAt: row.expires_at,
          serverNow: new Date().toISOString(),
        });
      },
    },
  },
});
