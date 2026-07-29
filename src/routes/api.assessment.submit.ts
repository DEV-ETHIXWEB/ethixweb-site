import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { clientIp } from "@/lib/rate-limit";
import { guardRequest } from "@/lib/api-guard";
import { loadAssessment, finalizeAssessment } from "@/lib/assessment/service";
import { verifySessionToken } from "@/lib/assessment/session";
import { TOTAL_QUESTIONS } from "@/lib/assessment/types";

// Final submission: manual, timer-driven, or violation-driven. Scoring and
// the HR report run inside finalizeAssessment behind an atomic claim, so a
// double-click, a retry, and the timer firing at the same moment produce
// exactly one scored result and one email. The candidate response never
// contains scores or correctness - only that the submission was received.

const answerValueSchema = z.union([
  z.number().int().min(0).max(19),
  z.array(z.number().int().min(0).max(19)).max(12),
  z.string().max(8000),
]);

const bodySchema = z.object({
  assessmentId: z.string().uuid(),
  sessionToken: z.string().length(64),
  reason: z.enum(["manual", "timer", "violations"]),
  answers: z.record(z.string().regex(/^\d{1,3}$/), answerValueSchema),
  violations: z
    .array(
      z.object({
        type: z.enum([
          "fullscreen_exit",
          "tab_hidden",
          "window_blur",
          "devtools_suspected",
          "copy_attempt",
          "paste_attempt",
          "cut_attempt",
          "context_menu",
          "shortcut_blocked",
        ]),
        at: z.string().max(40),
        detail: z.string().max(200).optional(),
      }),
    )
    .max(300),
});

export const Route = createFileRoute("/api/assessment/submit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const guard = await guardRequest(
          request,
          `assessment-submit:${clientIp(request)}`,
          12,
          10 * 60 * 1000,
        );
        if (guard) return guard;

        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
        }
        const body = parsed.data;

        const row = await loadAssessment(body.assessmentId);
        if (!row) {
          return Response.json({ ok: false, error: "Assessment not found" }, { status: 404 });
        }
        if (!verifySessionToken(body.sessionToken, row.session_token_hash)) {
          return Response.json({ ok: false, error: "Invalid session" }, { status: 403 });
        }

        // Idempotent for the client: if the timer submit and a manual submit
        // race (or loadAssessment just lazily expired it), the second caller
        // learns it's done rather than getting an error to retry.
        if (row.status !== "in_progress") {
          return Response.json({ ok: true, duplicate: true });
        }

        const validIds = new Set(row.questions.map((q) => String(q.id)));
        const keys = Object.keys(body.answers);
        if (keys.length > TOTAL_QUESTIONS || keys.some((k) => !validIds.has(k))) {
          return Response.json({ ok: false, error: "Invalid answers" }, { status: 400 });
        }

        try {
          await finalizeAssessment({
            row,
            reason: body.reason,
            answers: body.answers,
            violations: body.violations,
          });
        } catch (err) {
          console.error("[api/assessment/submit] finalize failed:", err);
          return Response.json(
            {
              ok: false,
              error:
                "Could not record your submission. Please try again - your answers are auto-saved.",
            },
            { status: 502 },
          );
        }

        return Response.json({ ok: true });
      },
    },
  },
});
