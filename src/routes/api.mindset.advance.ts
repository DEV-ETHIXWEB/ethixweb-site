import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { clientIp } from "@/lib/rate-limit";
import { guardRequest } from "@/lib/api-guard";
import { advanceMindsetQuestion, loadMindsetAssessment } from "@/lib/mindset/service";
import { MINDSET_TOTAL_QUESTIONS } from "@/lib/mindset/types";

// The forward-only state machine step: commits the answer for
// `questionIndex` and moves current_index forward by one. Elapsed time is
// computed server-side, never trusted from the client. A stale index is a
// 409 the client resyncs from, never an overwrite.

// 0 to 4 covers both mechanics: a situational option index (0 to 3) and a
// likert scale point (0 to 4). An index past the end of a given question's
// own weights scores as unanswered rather than being trusted, see
// scoring.ts.
const answerValueSchema = z.union([z.number().int().min(0).max(4), z.string().max(2000)]);

const bodySchema = z.object({
  token: z
    .string()
    .length(64)
    .regex(/^[0-9a-f]{64}$/),
  questionIndex: z
    .number()
    .int()
    .min(0)
    .max(MINDSET_TOTAL_QUESTIONS - 1),
  value: answerValueSchema.nullable().optional(),
});

export const Route = createFileRoute("/api/mindset/advance")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const guard = await guardRequest(
          request,
          `mindset-advance:${clientIp(request)}`,
          200,
          10 * 60 * 1000,
        );
        if (guard) return guard;

        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
        }
        const body = parsed.data;

        const row = await loadMindsetAssessment(body.token);
        if (!row) {
          return Response.json({ ok: false, error: "Assessment not found" }, { status: 404 });
        }
        if (row.status !== "in_progress") {
          return Response.json({ ok: true, duplicate: true, status: row.status });
        }

        const result = await advanceMindsetQuestion(row, body.questionIndex, body.value ?? null);
        if (!result.ok) {
          if (result.reason === "stale_index") {
            return Response.json(
              { ok: false, error: "stale_index", currentIndex: result.currentIndex },
              { status: 409 },
            );
          }
          return Response.json({ ok: false, error: "not_in_progress" }, { status: 409 });
        }

        if (result.currentIndex >= MINDSET_TOTAL_QUESTIONS) {
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
