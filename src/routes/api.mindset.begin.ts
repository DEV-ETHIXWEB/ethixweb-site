import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { clientIp } from "@/lib/rate-limit";
import { guardRequest } from "@/lib/api-guard";
import { isValidPhone } from "@/lib/utils";
import { beginMindsetAssessment } from "@/lib/mindset/service";
import { sanitizeMindsetQuestion } from "@/lib/mindset/types";

// Self-serve start: the candidate's own details create the one row, no
// admin invite step. One attempt ever per email - see beginMindsetAssessment
// in mindset/service.ts for the dedup rules.

const bodySchema = z.object({
  candidateName: z.string().trim().min(2).max(120),
  candidateEmail: z.string().trim().email().max(200),
  candidatePhone: z.string().trim().min(1).max(30),
  candidateCollege: z.string().trim().min(2).max(160),
});

export const Route = createFileRoute("/api/mindset/begin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Per IP, so it has to allow a whole batch starting together from one
        // shared network (a college lab, an office) rather than one person.
        // Starting an exam is already bounded by the one-attempt-per-email
        // check below, which is the real guard; this only stops a flood.
        const guard = await guardRequest(
          request,
          `mindset-begin:${clientIp(request)}`,
          60,
          10 * 60 * 1000,
        );
        if (guard) return guard;

        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
        }
        const body = parsed.data;
        if (!isValidPhone(body.candidatePhone)) {
          return Response.json(
            { ok: false, error: "Please enter a valid phone number" },
            { status: 400 },
          );
        }

        const result = await beginMindsetAssessment({
          candidateName: body.candidateName,
          candidateEmail: body.candidateEmail,
          candidatePhone: body.candidatePhone,
          candidateCollege: body.candidateCollege,
        });

        if (!result.ok) {
          if (result.reason === "already_completed") {
            return Response.json(
              {
                ok: false,
                error:
                  "You've already completed this assessment. Our team will be in touch about next steps.",
              },
              { status: 409 },
            );
          }
          return Response.json(
            {
              ok: false,
              error:
                "An assessment is already in progress for this email. Return to the browser where you started it, or try again after it expires.",
            },
            { status: 409 },
          );
        }

        return Response.json(
          {
            ok: true,
            sessionToken: result.token,
            questions: result.row.questions.map(sanitizeMindsetQuestion),
            currentIndex: result.row.current_index,
            expiresAt: result.row.expires_at,
            serverNow: new Date().toISOString(),
          },
          { status: 201 },
        );
      },
    },
  },
});
