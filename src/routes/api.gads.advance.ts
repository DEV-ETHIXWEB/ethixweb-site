import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { guardRequestByToken } from "@/lib/api-guard";
import { advanceGadsQuestion, loadGadsAssessment } from "@/lib/gads/service";
import { GADS_TOTAL_QUESTIONS } from "@/lib/gads/types";
import { gadsAnswerValueSchema, gadsQuestionIndexSchema, gadsTokenSchema } from "@/lib/gads/wire";

// The forced-advance state machine step: commits the answer for
// `questionIndex` and moves current_index forward by one. Elapsed time and
// lateness are always computed server-side from current_question_started_at,
// never trusted from the client. A stale index (already advanced past by an
// earlier call, the timer path, or a race) is a 409 the client resyncs
// from - never an overwrite. See advanceGadsQuestion in gads-service.ts.

const bodySchema = z.object({
  token: gadsTokenSchema,
  questionIndex: gadsQuestionIndexSchema,
  value: gadsAnswerValueSchema.nullable().optional(),
});

export const Route = createFileRoute("/api/gads/advance")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
        }

        const guard = await guardRequestByToken(
          request,
          "gads-advance",
          parsed.data.token,
          150,
          10 * 60 * 1000,
        );
        if (guard) return guard;
        const body = parsed.data;

        const row = await loadGadsAssessment(body.token);
        if (!row) {
          return Response.json({ ok: false, error: "Assessment not found" }, { status: 404 });
        }
        if (row.status !== "in_progress") {
          return Response.json({ ok: true, duplicate: true, status: row.status });
        }

        const result = await advanceGadsQuestion(row, body.questionIndex, body.value ?? null);
        if (!result.ok) {
          if (result.reason === "stale_index") {
            return Response.json(
              { ok: false, error: "stale_index", currentIndex: result.currentIndex },
              { status: 409 },
            );
          }
          return Response.json({ ok: false, error: "not_in_progress" }, { status: 409 });
        }

        if (result.currentIndex >= GADS_TOTAL_QUESTIONS) {
          return Response.json({ ok: true, done: true, serverNow: new Date().toISOString() });
        }

        return Response.json({
          ok: true,
          done: false,
          currentIndex: result.currentIndex,
          serverNow: new Date().toISOString(),
        });
      },
    },
  },
});
