import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { clientIp } from "@/lib/rate-limit";
import { guardRequest } from "@/lib/api-guard";
import { getSupabase } from "@/lib/supabase";
import { loadAssessment, isPastGrace } from "@/lib/assessment/service";
import { verifySessionToken } from "@/lib/assessment/session";
import { TOTAL_QUESTIONS } from "@/lib/assessment/types";

// Auto-save endpoint, hit (debounced) after every interaction. Accepts the
// full answer map + full violation list each time - idempotent, so a lost or
// out-of-order request never corrupts state. Also attaches recording URLs,
// which is the one write still allowed after the exam is over (the webcam
// upload finishes after submit by design).

const RECORDING_URL_RE =
  /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/assessment-recordings\//i;
const MAX_RECORDINGS = 5;
/** Recording attach window after the exam started - uploads are slow, but not 3-hours slow. */
const RECORDING_WINDOW_MS = 3 * 60 * 60 * 1000;

const answerValueSchema = z.union([
  z.number().int().min(0).max(19),
  z.array(z.number().int().min(0).max(19)).max(12),
  z.string().max(8000),
]);

const bodySchema = z.object({
  assessmentId: z.string().uuid(),
  sessionToken: z.string().length(64),
  answers: z.record(z.string().regex(/^\d{1,3}$/), answerValueSchema).optional(),
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
    .max(300)
    .optional(),
  recordingUrl: z.string().url().regex(RECORDING_URL_RE).optional(),
});

export const Route = createFileRoute("/api/assessment/save")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const guard = await guardRequest(
          request,
          `assessment-save:${clientIp(request)}`,
          400,
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

        const supabase = getSupabase();
        const update: Record<string, unknown> = {};

        if (body.recordingUrl) {
          const withinWindow =
            Date.now() < new Date(row.started_at).getTime() + RECORDING_WINDOW_MS;
          if (withinWindow && !row.recording_urls.includes(body.recordingUrl)) {
            if (row.recording_urls.length >= MAX_RECORDINGS) {
              return Response.json(
                { ok: false, error: "Recording limit reached" },
                { status: 400 },
              );
            }
            update.recording_urls = [...row.recording_urls, body.recordingUrl];
          }
        }

        const wantsAnswerSave = body.answers !== undefined || body.violations !== undefined;
        if (wantsAnswerSave) {
          if (row.status !== "in_progress" || isPastGrace(row)) {
            // Recording attach (if any) still goes through; answer writes are
            // over. The client uses `status` to move to its submitted screen.
            if (Object.keys(update).length > 0) {
              await supabase.from("assessments").update(update).eq("id", row.id);
            }
            return Response.json(
              {
                ok: false,
                error: "This assessment is no longer accepting answers",
                status: row.status,
              },
              { status: 409 },
            );
          }

          if (body.answers !== undefined) {
            const validIds = new Set(row.questions.map((q) => String(q.id)));
            const keys = Object.keys(body.answers);
            if (keys.length > TOTAL_QUESTIONS || keys.some((k) => !validIds.has(k))) {
              return Response.json({ ok: false, error: "Invalid answers" }, { status: 400 });
            }
            update.answers = body.answers;
          }
          if (body.violations !== undefined) {
            update.violations = body.violations;
          }
        }

        if (Object.keys(update).length > 0) {
          // Guard on status so a save racing the submit's atomic claim can't
          // resurrect answers onto a finalized row (recording-only updates
          // are exempt - they're expected after submit).
          let query = supabase.from("assessments").update(update).eq("id", row.id);
          if (update.answers !== undefined || update.violations !== undefined) {
            query = query.eq("status", "in_progress");
          }
          const { error } = await query;
          if (error) {
            console.error("[api/assessment/save] update failed:", error);
            return Response.json({ ok: false, error: "Could not save" }, { status: 502 });
          }
        }

        const remainingSeconds = Math.max(
          0,
          Math.round((new Date(row.expires_at).getTime() - Date.now()) / 1000),
        );
        return Response.json({ ok: true, remainingSeconds, serverNow: new Date().toISOString() });
      },
    },
  },
});
