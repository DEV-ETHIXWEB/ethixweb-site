import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { mergeProctoringEvents, violationKey } from "@/lib/proctoring-merge";
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
        // By far the busiest endpoint: the client autosaves every 5s, so a
        // single 15 minute sitting costs roughly 180 calls on its own. The
        // limit has to be sized per BATCH, not per candidate, because a
        // college lab or an office all share one public IP: at the original
        // 400 the third candidate on a shared network was locked out
        // mid-exam. 12000 covers ~50 simultaneous sittings with headroom for
        // the client's retries, and still stops a runaway script. The real
        // protection against abuse is the session token and the one-attempt
        // email check, not this.
        const guard = await guardRequest(
          request,
          `mindset-save:${clientIp(request)}`,
          12000,
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
        // Append-only: the client sends its whole cumulative list, so
        // assigning it straight through let a request carrying `[]` erase
        // every violation already on the row. Merging on identity means a
        // re-send can't duplicate and nothing a client sends can shrink the
        // record. Mirrors api.gads.save.ts.
        if (body.violations !== undefined) {
          const merged = mergeProctoringEvents(
            row.violations,
            body.violations,
            violationKey,
            MINDSET_MAX_VIOLATIONS,
          );
          if (merged) update.violations = merged;
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
