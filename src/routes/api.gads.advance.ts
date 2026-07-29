import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { clientIp } from "@/lib/rate-limit";
import { guardRequest } from "@/lib/api-guard";
import { advanceGadsQuestion, loadGadsAssessment } from "@/lib/gads/service";
import { GADS_TOTAL_QUESTIONS } from "@/lib/gads/types";

// The forced-advance state machine step: commits the answer for
// `questionIndex` and moves current_index forward by one. Elapsed time and
// lateness are always computed server-side from current_question_started_at,
// never trusted from the client. A stale index (already advanced past by an
// earlier call, the timer path, or a race) is a 409 the client resyncs
// from - never an overwrite. See advanceGadsQuestion in gads-service.ts.

const answerValueSchema = z.union([
  z.number().int().min(0).max(9),
  z.array(z.number().int().min(0).max(9)).max(6),
  z.string().max(4000),
]);

const bodySchema = z.object({
  token: z
    .string()
    .length(64)
    .regex(/^[0-9a-f]{64}$/),
  questionIndex: z
    .number()
    .int()
    .min(0)
    .max(GADS_TOTAL_QUESTIONS - 1),
  value: answerValueSchema.nullable().optional(),
});

export const Route = createFileRoute("/api/gads/advance")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const guard = await guardRequest(
          request,
          `gads-advance:${clientIp(request)}`,
          200,
          10 * 60 * 1000,
        );
        if (guard) return guard;

        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
        }
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
