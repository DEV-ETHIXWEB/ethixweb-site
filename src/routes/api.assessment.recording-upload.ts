import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { clientIp } from "@/lib/rate-limit";
import { guardRequest } from "@/lib/api-guard";
import { getSupabase } from "@/lib/supabase";
import { verifySessionToken } from "@/lib/assessment/session";

// Token handshake for direct-to-Blob webcam/mic recording uploads (same
// pattern as resume uploads - the video bytes never touch our serverless
// function). Unlike resumes, minting a token here requires a valid assessment
// session: the clientPayload must carry the assessment id + bearer token, so
// only a candidate who legitimately started an exam can put recordings in
// our store.

const ALLOWED_RECORDING_TYPES = ["video/webm", "video/mp4", "audio/webm", "audio/mp4"];
const MAX_RECORDING_BYTES = 500 * 1024 * 1024; // ~30 min of 640p webm is well under this
const UPLOAD_WINDOW_MS = 3 * 60 * 60 * 1000;

export const Route = createFileRoute("/api/assessment/recording-upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Multipart uploads mint several tokens per recording - keep headroom.
        const guard = await guardRequest(
          request,
          `assessment-recording:${clientIp(request)}`,
          40,
          10 * 60 * 1000,
        );
        if (guard) return guard;

        const body = (await request.json().catch(() => null)) as HandleUploadBody | null;
        if (!body) {
          return Response.json({ ok: false, error: "Invalid request body" }, { status: 400 });
        }

        if (!process.env.BLOB_READ_WRITE_TOKEN) {
          console.error(
            "[api/assessment/recording-upload] BLOB_READ_WRITE_TOKEN is not set - recording " +
              "uploads cannot work. Create a Blob store on the Vercel project and redeploy.",
          );
          return Response.json(
            { ok: false, error: "Recording uploads are temporarily unavailable." },
            { status: 503 },
          );
        }

        try {
          const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname, clientPayload) => {
              if (!pathname.startsWith("assessment-recordings/")) {
                throw new Error("Invalid upload path");
              }

              let payload: { assessmentId?: unknown; sessionToken?: unknown } = {};
              try {
                payload = JSON.parse(clientPayload ?? "");
              } catch {
                throw new Error("Missing session payload");
              }
              if (
                typeof payload.assessmentId !== "string" ||
                typeof payload.sessionToken !== "string"
              ) {
                throw new Error("Missing session payload");
              }

              const { data: row, error } = await getSupabase()
                .from("assessments")
                .select("id, session_token_hash, started_at")
                .eq("id", payload.assessmentId)
                .maybeSingle();
              if (error || !row) throw new Error("Assessment not found");
              if (!verifySessionToken(payload.sessionToken, row.session_token_hash)) {
                throw new Error("Invalid session");
              }
              if (Date.now() > new Date(row.started_at).getTime() + UPLOAD_WINDOW_MS) {
                throw new Error("Upload window has closed");
              }

              return {
                allowedContentTypes: ALLOWED_RECORDING_TYPES,
                maximumSizeInBytes: MAX_RECORDING_BYTES,
                addRandomSuffix: true,
              };
            },
            onUploadCompleted: async () => {
              // The recording URL is attached to the assessment row by the
              // client via /api/assessment/save once upload() resolves -
              // this webhook doesn't fire on localhost, so it can't be the
              // source of truth.
            },
          });
          return Response.json({ ok: true, ...jsonResponse });
        } catch (err) {
          console.error("[api/assessment/recording-upload] handleUpload threw:", err);
          return Response.json({ ok: false, error: "Upload failed" }, { status: 400 });
        }
      },
    },
  },
});
