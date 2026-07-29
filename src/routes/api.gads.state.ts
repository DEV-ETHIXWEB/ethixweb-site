import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { clientIp } from "@/lib/rate-limit";
import { guardRequest } from "@/lib/api-guard";
import { loadGadsAssessment } from "@/lib/gads/service";
import { GADS_TIME_LIMITS, sanitizeGadsQuestion } from "@/lib/gads/types";

// Resolves the one-time link on load / refresh. Deliberately does not
// distinguish "token not found" from "link expired" from "malformed token" -
// all three collapse to the same expired-link message, so a mistyped or
// guessed URL never confirms whether a real invite exists. Before the
// candidate has begun, this reveals nothing beyond "pending" - the name/
// email gate is what /api/gads/begin enforces, not this endpoint.

const bodySchema = z.object({
  token: z
    .string()
    .length(64)
    .regex(/^[0-9a-f]{64}$/),
});

export const Route = createFileRoute("/api/gads/state")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const guard = await guardRequest(
          request,
          `gads-state:${clientIp(request)}`,
          60,
          10 * 60 * 1000,
        );
        if (guard) return guard;

        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ ok: true, status: "expired" });
        }

        const row = await loadGadsAssessment(parsed.data.token);
        if (!row || row.status === "expired") {
          return Response.json({ ok: true, status: "expired" });
        }

        if (row.status !== "in_progress") {
          return Response.json({ ok: true, status: row.status });
        }
        if (!row.questions) {
          return Response.json({ ok: true, status: "expired" });
        }

        const currentQuestion = row.questions[row.current_index];
        const limit = currentQuestion ? GADS_TIME_LIMITS[currentQuestion.mechanic] : 0;
        const startedAt = row.current_question_started_at
          ? new Date(row.current_question_started_at).getTime()
          : Date.now();
        const remainingQuestionSeconds = currentQuestion
          ? Math.max(0, limit - Math.floor((Date.now() - startedAt) / 1000))
          : 0;

        return Response.json({
          ok: true,
          status: "in_progress",
          candidateName: row.candidate_name,
          questions: row.questions.map(sanitizeGadsQuestion),
          answers: row.answers,
          draftAnswer: row.draft_answer,
          currentIndex: row.current_index,
          remainingQuestionSeconds,
          expiresAt: row.expires_at,
          serverNow: new Date().toISOString(),
        });
      },
    },
  },
});
