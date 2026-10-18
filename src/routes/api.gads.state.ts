import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { guardRequestByToken } from "@/lib/api-guard";
import { loadGadsAssessment, registerGadsResume } from "@/lib/gads/service";
import { GADS_MAX_RESUMES, GADS_TIME_LIMITS, sanitizeGadsQuestion } from "@/lib/gads/types";

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
  // Set by the running exam when it re-reads its own position after a failed
  // advance. That is recovery inside a session the candidate never left, so
  // it must not spend one of their reopens - only a fresh page load does.
  resync: z.boolean().optional(),
});

export const Route = createFileRoute("/api/gads/state")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ ok: true, status: "expired" });
        }

        const guard = await guardRequestByToken(
          request,
          "gads-state",
          parsed.data.token,
          40,
          10 * 60 * 1000,
        );
        if (guard) return guard;

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

        // Reaching here with status in_progress means the run already
        // started and the page is being loaded again: a reopen. Spend one of
        // the candidate's reopens. Counting here rather than in the client
        // keeps it honest - the client cannot choose not to report.
        const resume = parsed.data.resync
          ? { resumeCount: row.resume_count ?? 0, limitReached: false }
          : await registerGadsResume(row);
        if (resume.limitReached) {
          return Response.json({
            ok: true,
            status: "resume_limit",
            resumeCount: resume.resumeCount,
            maxResumes: GADS_MAX_RESUMES,
          });
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
          resumeCount: resume.resumeCount,
          resumesLeft: Math.max(0, GADS_MAX_RESUMES - resume.resumeCount),
          maxResumes: GADS_MAX_RESUMES,
          remainingQuestionSeconds,
          expiresAt: row.expires_at,
          serverNow: new Date().toISOString(),
        });
      },
    },
  },
});
