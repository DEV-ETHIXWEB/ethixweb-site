import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { guardRequestByToken } from "@/lib/api-guard";
import { getGadsStore } from "@/lib/gads/store";
import {
  GADS_MAX_CAMERA_SNAPSHOTS,
  GADS_MAX_MIC_SAMPLES,
  GADS_MAX_VIOLATIONS,
  loadGadsAssessment,
} from "@/lib/gads/service";
import { type GadsAssessmentRow } from "@/lib/gads/types";
import { mergeProctoringEvents, micSampleKey, violationKey } from "@/lib/proctoring-merge";
import { gadsAnswerValueSchema, gadsQuestionIndexSchema, gadsTokenSchema } from "@/lib/gads/wire";

// Batched, debounced flush - the client accumulates violations/mic-activity
// in its own state (same convention as useExamGuard) and piggybacks the
// current in-flight draft answer, all on one autosave call rather than one
// network round trip per event. `draftAnswer` only ever applies when
// `forQuestionIndex` still matches the server's current_index - a stale
// save arriving after an advance already moved the server on is silently
// ignored rather than mis-attributed to the new question.

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
  token: gadsTokenSchema,
  forQuestionIndex: gadsQuestionIndexSchema.optional(),
  draftAnswer: gadsAnswerValueSchema.nullable().optional(),
  violations: z.array(violationSchema).max(GADS_MAX_VIOLATIONS).optional(),
  micActivity: z.array(micSampleSchema).max(GADS_MAX_MIC_SAMPLES).optional(),
  cameraSnapshotUrl: z.string().url().regex(SNAPSHOT_URL_RE).optional(),
  recordingUrl: z.string().url().regex(RECORDING_URL_RE).optional(),
});

export const Route = createFileRoute("/api/gads/save")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
        }

        const guard = await guardRequestByToken(
          request,
          "gads-save",
          parsed.data.token,
          250,
          10 * 60 * 1000,
        );
        if (guard) return guard;
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
        // Proctoring evidence is append-only. Both fields used to be assigned
        // straight from the request, which broke in two different ways:
        //
        //  - violations: the client sends its whole cumulative list, so a
        //    request carrying `[]` overwrote every violation already on the
        //    row. A candidate could clear their own proctoring record.
        //  - mic_activity: the client DRAINS its buffer (drainMicSamples), so
        //    it sends only new samples - and replacing meant the row never
        //    held more than the last batch. The history was being discarded.
        //
        // Merging keyed on identity fixes both: a cumulative re-send can't
        // duplicate, an incremental batch accumulates, and nothing a client
        // sends can shrink what is already recorded.
        if (body.violations !== undefined) {
          const merged = mergeProctoringEvents(
            row.violations,
            body.violations,
            violationKey,
            GADS_MAX_VIOLATIONS,
          );
          if (merged) update.violations = merged;
        }
        if (body.micActivity !== undefined) {
          const merged = mergeProctoringEvents(
            row.mic_activity,
            body.micActivity,
            micSampleKey,
            GADS_MAX_MIC_SAMPLES,
          );
          if (merged) update.mic_activity = merged;
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
