import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { clientIp } from "@/lib/rate-limit";
import { guardRequest } from "@/lib/api-guard";
import { findGadsByToken } from "@/lib/gads/service";

// Token handshake for direct-to-Blob webcam/mic recording and periodic
// snapshot uploads - the media bytes never touch our serverless function.
// One endpoint, two path prefixes: gads-recordings/ (continuous video/
// audio) and gads-snapshots/ (periodic JPEG stills), branching on the
// requested pathname. clientPayload carries only the exam token (not an
// assessmentId - the candidate never learns a row id, the token IS the
// credential).

const RECORDING_TYPES = ["video/webm", "video/mp4", "audio/webm", "audio/mp4"];
const SNAPSHOT_TYPES = ["image/jpeg"];
const MAX_RECORDING_BYTES = 500 * 1024 * 1024;
const MAX_SNAPSHOT_BYTES = 2 * 1024 * 1024;
const UPLOAD_WINDOW_MS = 3 * 60 * 60 * 1000;

export const Route = createFileRoute("/api/gads/media-upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const guard = await guardRequest(
          request,
          `gads-media:${clientIp(request)}`,
          60,
          10 * 60 * 1000,
        );
        if (guard) return guard;

        const body = (await request.json().catch(() => null)) as HandleUploadBody | null;
        if (!body) {
          return Response.json({ ok: false, error: "Invalid request body" }, { status: 400 });
        }

        if (!process.env.BLOB_READ_WRITE_TOKEN) {
          console.error(
            "[api/gads/media-upload] BLOB_READ_WRITE_TOKEN is not set - media uploads cannot work.",
          );
          return Response.json(
            { ok: false, error: "Media uploads are temporarily unavailable." },
            { status: 503 },
          );
        }

        try {
          const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname, clientPayload) => {
              const isRecording = pathname.startsWith("gads-recordings/");
              const isSnapshot = pathname.startsWith("gads-snapshots/");
              if (!isRecording && !isSnapshot) throw new Error("Invalid upload path");

              let payload: { token?: unknown } = {};
              try {
                payload = JSON.parse(clientPayload ?? "");
              } catch {
                throw new Error("Missing session payload");
              }
              if (typeof payload.token !== "string" || !/^[0-9a-f]{64}$/.test(payload.token)) {
                throw new Error("Missing session payload");
              }

              const row = await findGadsByToken(payload.token);
              if (!row) throw new Error("Assessment not found");
              if (row.status !== "in_progress") throw new Error("Assessment is not in progress");
              if (
                !row.started_at ||
                Date.now() > new Date(row.started_at).getTime() + UPLOAD_WINDOW_MS
              ) {
                throw new Error("Upload window has closed");
              }

              return {
                allowedContentTypes: isRecording ? RECORDING_TYPES : SNAPSHOT_TYPES,
                maximumSizeInBytes: isRecording ? MAX_RECORDING_BYTES : MAX_SNAPSHOT_BYTES,
                addRandomSuffix: true,
              };
            },
            onUploadCompleted: async () => {
              // The resulting URL is attached to the row by the client via
              // /api/gads/save once upload() resolves - this webhook doesn't
              // fire on localhost, so it can't be the source of truth.
            },
          });
          return Response.json({ ok: true, ...jsonResponse });
        } catch (err) {
          console.error("[api/gads/media-upload] handleUpload threw:", err);
          return Response.json({ ok: false, error: "Upload failed" }, { status: 400 });
        }
      },
    },
  },
});
