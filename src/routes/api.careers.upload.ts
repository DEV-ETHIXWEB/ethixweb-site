import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { clientIp } from "@/lib/rate-limit";
import { guardRequest } from "@/lib/api-guard";

const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_RESUME_BYTES = 10 * 1024 * 1024; // 10MB

// Ethixweb is not currently hiring. Flip to false (or delete the guard
// block below) to reopen this endpoint.
const CAREERS_DISABLED = true;

// Token handshake for direct-to-Blob resume uploads. The actual file bytes
// never pass through this function (or Vercel's serverless body limit) -
// the browser uploads straight to Blob storage using the short-lived token
// minted here, which is the only way to reliably support 10MB uploads on
// Vercel's serverless runtime.
export const Route = createFileRoute("/api/careers/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Ethixweb is not currently hiring - the public application flow
        // (/careers/apply) redirects to /not-hiring, and this endpoint no
        // longer accepts resume uploads. Delete this block to reopen it.
        if (CAREERS_DISABLED) {
          return Response.json(
            { ok: false, error: "Resume uploads are not being accepted at this time." },
            { status: 410 },
          );
        }

        const guard = await guardRequest(
          request,
          `upload:${clientIp(request)}`,
          20,
          10 * 60 * 1000,
        );
        if (guard) return guard;

        const body = (await request.json().catch(() => null)) as HandleUploadBody | null;
        if (!body) {
          return Response.json({ ok: false, error: "Invalid request body" }, { status: 400 });
        }

        // Fail fast, loudly, when the Blob store isn't provisioned. Without
        // this guard handleUpload throws the same generic error as any other
        // failure, and "every resume upload fails" looks like a user problem
        // instead of a missing BLOB_READ_WRITE_TOKEN.
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
          console.error(
            "[api/careers/upload] BLOB_READ_WRITE_TOKEN is not set - resume uploads cannot work. " +
              "Create a Blob store on the Vercel project (Dashboard -> Storage -> Create -> Blob) and redeploy. " +
              "For local dev, run `vercel link` then `vercel env pull` to write the token into .env.",
          );
          return Response.json(
            { ok: false, error: "Resume uploads are temporarily unavailable." },
            { status: 503 },
          );
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
          return Response.json({ ok: true, ...jsonResponse });
        } catch (err) {
          // Log the real error server-side only - don't pass raw exception
          // text (which can include internal details) to the client.
          console.error("[api/careers/upload] handleUpload threw:", err);
          return Response.json({ ok: false, error: "Upload failed" }, { status: 400 });
        }
      },
    },
  },
});
