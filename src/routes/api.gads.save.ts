import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { clientIp } from "@/lib/rate-limit";
import { guardRequest } from "@/lib/api-guard";
import { getGadsStore } from "@/lib/gads/store";
import {
  GADS_MAX_CAMERA_SNAPSHOTS,
  GADS_MAX_MIC_SAMPLES,
  GADS_MAX_VIOLATIONS,
  loadGadsAssessment,
} from "@/lib/gads/service";
import { GADS_TOTAL_QUESTIONS, type GadsAssessmentRow } from "@/lib/gads/types";

// Batched, debounced flush - the client accumulates violations/mic-activity
// in its own state (same convention as useExamGuard) and piggybacks the
// current in-flight draft answer, all on one autosave call rather than one
// network round trip per event. `draftAnswer` only ever applies when
// `forQuestionIndex` still matches the server's current_index - a stale
// save arriving after an advance already moved the server on is silently
// ignored rather than mis-attributed to the new question.

const draftValueSchema = z.union([
  z.number().int().min(0).max(9),
  z.array(z.number().int().min(0).max(9)).max(6),
  z.string().max(4000),
]);

const violationSchema = z.object({
  type: z.enum([
    "fullscreen_exit",
    "tab_hidden",
    "window_blur",
    "devtools_suspected",
    "copy_attempt",
    "paste_attempt",
    "cut_attempt",
    "select_all_attempt",
    "context_menu",
    "shortcut_blocked",
    "print_screen_suspected",
    "network_offline",
    "network_online",
    "window_resize",
    "refresh_attempt",
    "multi_monitor_detected",
    "multi_monitor_unsupported",
  ]),
  at: z.string().max(40),
  detail: z.string().max(200).optional(),
});

const micSampleSchema = z.object({
  at: z.string().max(40),
  level: z.number().min(0).max(1),
  active: z.boolean(),
});

const SNAPSHOT_URL_RE =
  /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/gads-snapshots\//i;
const RECORDING_URL_RE =
  /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/gads-recordings\//i;
const MAX_RECORDINGS = 5;

const bodySchema = z.object({
  token: z
    .string()
    .length(64)
    .regex(/^[0-9a-f]{64}$/),
  forQuestionIndex: z
    .number()
    .int()
    .min(0)
    .max(GADS_TOTAL_QUESTIONS - 1)
    .optional(),
  draftAnswer: draftValueSchema.nullable().optional(),
  violations: z.array(violationSchema).max(GADS_MAX_VIOLATIONS).optional(),
  micActivity: z.array(micSampleSchema).max(GADS_MAX_MIC_SAMPLES).optional(),
  cameraSnapshotUrl: z.string().url().regex(SNAPSHOT_URL_RE).optional(),
  recordingUrl: z.string().url().regex(RECORDING_URL_RE).optional(),
});

export const Route = createFileRoute("/api/gads/save")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const guard = await guardRequest(
          request,
          `gads-save:${clientIp(request)}`,
          400,
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
          return Response.json(
            {
              ok: false,
              error: "This assessment is no longer accepting updates",
              status: row.status,
            },
            { status: 409 },
          );
        }

        const update: Partial<GadsAssessmentRow> = {};

        if (body.forQuestionIndex !== undefined && body.forQuestionIndex === row.current_index) {
          update.draft_answer = body.draftAnswer ?? null;
        }
        if (body.violations !== undefined) {
          update.violations = body.violations.slice(-GADS_MAX_VIOLATIONS);
        }
        if (body.micActivity !== undefined) {
          update.mic_activity = body.micActivity.slice(-GADS_MAX_MIC_SAMPLES);
        }
        if (
          body.cameraSnapshotUrl &&
          !row.camera_snapshots.some((s) => s.url === body.cameraSnapshotUrl)
        ) {
          update.camera_snapshots = [
            ...row.camera_snapshots,
            { url: body.cameraSnapshotUrl, at: new Date().toISOString() },
          ].slice(-GADS_MAX_CAMERA_SNAPSHOTS);
        }
        if (
          body.recordingUrl &&
          !row.recording_urls.includes(body.recordingUrl) &&
          row.recording_urls.length < MAX_RECORDINGS
        ) {
          update.recording_urls = [...row.recording_urls, body.recordingUrl];
        }

        if (Object.keys(update).length > 0) {
          const updated = await getGadsStore().updateIf(row.id, { status: "in_progress" }, update);
          if (!updated) {
            return Response.json({ ok: false, error: "Could not save" }, { status: 502 });
          }
        }

        return Response.json({ ok: true, serverNow: new Date().toISOString() });
      },
    },
  },
});
