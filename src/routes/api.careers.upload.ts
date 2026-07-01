import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_RESUME_BYTES = 10 * 1024 * 1024; // 10MB

// Token handshake for direct-to-Blob resume uploads. The actual file bytes
// never pass through this function (or Vercel's serverless body limit) -
// the browser uploads straight to Blob storage using the short-lived token
// minted here, which is the only way to reliably support 10MB uploads on
// Vercel's serverless runtime.
export const Route = createFileRoute("/api/careers/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!checkRateLimit(`upload:${clientIp(request)}`, 20, 10 * 60 * 1000)) {
          return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
        }

        const body = (await request.json().catch(() => null)) as HandleUploadBody | null;
        if (!body) {
          return Response.json({ error: "Invalid request body" }, { status: 400 });
        }

        try {
          const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async () => ({
              allowedContentTypes: ALLOWED_RESUME_TYPES,
              maximumSizeInBytes: MAX_RESUME_BYTES,
              addRandomSuffix: true,
            }),
            onUploadCompleted: async () => {
              // No DB to update - the apply endpoint receives the resulting
              // blob URL directly from the client once upload() resolves.
            },
          });
          return Response.json(jsonResponse);
        } catch (err) {
          console.error("[api/careers/upload] handleUpload threw:", err);
          return Response.json(
            { error: err instanceof Error ? err.message : "Upload failed" },
            { status: 400 },
          );
        }
      },
    },
  },
});
