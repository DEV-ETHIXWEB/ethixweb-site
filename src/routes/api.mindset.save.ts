import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { clientIp } from "@/lib/rate-limit";
import { guardRequest } from "@/lib/api-guard";
import { getMindsetStore } from "@/lib/mindset/store";
import { loadMindsetAssessment, MINDSET_MAX_VIOLATIONS } from "@/lib/mindset/service";
import { MINDSET_TOTAL_QUESTIONS, type MindsetAssessmentRow } from "@/lib/mindset/types";

// Batched, debounced flush - the client accumulates violations in its own
// state (same convention as useMindsetExamGuard) and piggybacks the current
// in-flight draft answer, on one autosave call. `draftAnswer` only ever
// applies when `forQuestionIndex` still matches the server's current_index.

const draftValueSchema = z.union([z.number().int().min(0).max(4), z.string().max(2000)]);

const violationSchema = z.object({
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
    "refresh_attempt",
  ]),
  at: z.string().max(40),
  detail: z.string().max(200).optional(),
});

const bodySchema = z.object({
  token: z
    .string()
    .length(64)
    .regex(/^[0-9a-f]{64}$/),
  forQuestionIndex: z
    .number()
    .int()
    .min(0)
    .max(MINDSET_TOTAL_QUESTIONS - 1)
    .optional(),
  draftAnswer: draftValueSchema.nullable().optional(),
  violations: z.array(violationSchema).max(MINDSET_MAX_VIOLATIONS).optional(),
});

export const Route = createFileRoute("/api/mindset/save")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const guard = await guardRequest(
          request,
          `mindset-save:${clientIp(request)}`,
          400,
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
          return Response.json(
            {
              ok: false,
              error: "This assessment is no longer accepting updates",
              status: row.status,
            },
            { status: 409 },
          );
        }

        const update: Partial<MindsetAssessmentRow> = {};

        if (body.forQuestionIndex !== undefined && body.forQuestionIndex === row.current_index) {
          update.draft_answer = body.draftAnswer ?? null;
        }
        if (body.violations !== undefined) {
          update.violations = body.violations.slice(-MINDSET_MAX_VIOLATIONS);
        }

        if (Object.keys(update).length > 0) {
          const updated = await getMindsetStore().updateIf(
            row.id,
            { status: "in_progress" },
            update,
          );
          if (!updated) {
            return Response.json({ ok: false, error: "Could not save" }, { status: 502 });
          }
        }

        return Response.json({ ok: true, serverNow: new Date().toISOString() });
      },
    },
  },
});
