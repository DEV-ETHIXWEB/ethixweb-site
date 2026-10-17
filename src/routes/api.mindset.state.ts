import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { clientIp } from "@/lib/rate-limit";
import { guardRequest } from "@/lib/api-guard";
import { loadMindsetAssessment } from "@/lib/mindset/service";
import { sanitizeMindsetQuestion } from "@/lib/mindset/types";

// Resolves the candidate's own session on load/refresh, via the token kept
// in their browser's localStorage (see assessment.mindset.tsx) -
// there is no URL token param, unlike the gads flow.

const bodySchema = z.object({
  token: z
    .string()
    .length(64)
    .regex(/^[0-9a-f]{64}$/),
});

export const Route = createFileRoute("/api/mindset/state")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const guard = await guardRequest(
          request,
          `mindset-state:${clientIp(request)}`,
          60,
          10 * 60 * 1000,
        );
        if (guard) return guard;

        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ ok: true, status: "expired" });
        }

        const row = await loadMindsetAssessment(parsed.data.token);
        if (!row) {
          return Response.json({ ok: true, status: "expired" });
        }

        if (row.status !== "in_progress") {
          return Response.json({ ok: true, status: row.status });
        }

        return Response.json({
          ok: true,
          status: "in_progress",
          candidateName: row.candidate_name,
          questions: row.questions.map(sanitizeMindsetQuestion),
          draftAnswer: row.draft_answer,
          currentIndex: row.current_index,
          expiresAt: row.expires_at,
          serverNow: new Date().toISOString(),
        });
      },
    },
  },
});
