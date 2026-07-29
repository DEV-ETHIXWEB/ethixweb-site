import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { clientIp } from "@/lib/rate-limit";
import { guardRequest } from "@/lib/api-guard";
import { getGadsStore } from "@/lib/gads/store";
import { loadGadsAssessment, resetGadsRowForRetest } from "@/lib/gads/service";
import { buildGadsExam } from "@/lib/gads/questions";
import { GADS_EXAM_DURATION_SECONDS, sanitizeGadsQuestion } from "@/lib/gads/types";

// The actual access-control gate: pending -> in_progress only fires when the
// typed email matches the invited address exactly. Heavily rate-limited
// since, unlike every other endpoint here, a wrong guess on this one is the
// live attack (someone with the link trying to impersonate the invited
// candidate) rather than just abuse.
//
// GADS_UNLIMITED_TEST_EMAILS (gads-types.ts) is the one exception to
// "single use": a submitted/scored row for one of those addresses is reset
// back to pending here before the normal flow runs, so that link can be
// reused indefinitely for testing. Every other row stays locked once it
// reaches a terminal status.

const bodySchema = z.object({
  token: z
    .string()
    .length(64)
    .regex(/^[0-9a-f]{64}$/),
  candidateName: z.string().trim().min(2).max(120),
  candidateEmail: z.string().trim().email().max(200),
});

export const Route = createFileRoute("/api/gads/begin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const guard = await guardRequest(
          request,
          `gads-begin:${clientIp(request)}`,
          8,
          10 * 60 * 1000,
          "Too many attempts. Please try again later.",
        );
        if (guard) return guard;

        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
        }
        const body = parsed.data;

        let row = await loadGadsAssessment(body.token);
        if (!row || row.status === "expired") {
          return Response.json(
            {
              ok: false,
              error:
                "This assessment link has expired. Please contact EthixWeb if you believe this is an error.",
              status: "expired",
            },
            { status: 410 },
          );
        }

        if (row.status === "submitted" || row.status === "scored") {
          row = (await resetGadsRowForRetest(row)) ?? row;
        }

        if (row.status === "in_progress") {
          return Response.json({ ok: true, alreadyStarted: true });
        }
        if (row.status !== "pending") {
          return Response.json(
            { ok: false, error: "This assessment has already been completed.", status: row.status },
            { status: 409 },
          );
        }

        if (body.candidateEmail.toLowerCase() !== row.candidate_email.trim().toLowerCase()) {
          return Response.json(
            { ok: false, error: "This email does not match our records for this invitation." },
            { status: 403 },
          );
        }

        const questions = buildGadsExam();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + GADS_EXAM_DURATION_SECONDS * 1000);

        const claimed = await getGadsStore().updateIf(
          row.id,
          { status: "pending" },
          {
            candidate_name: body.candidateName,
            questions,
            status: "in_progress",
            started_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
            current_index: 0,
            current_question_started_at: now.toISOString(),
          },
        );

        if (!claimed) {
          // Raced with another begin call (e.g. a double-click) - the exam
          // already started, so just point the client at the resumable state.
          return Response.json({ ok: true, alreadyStarted: true });
        }

        return Response.json({
          ok: true,
          questions: questions.map(sanitizeGadsQuestion),
          currentIndex: 0,
          expiresAt: expiresAt.toISOString(),
          serverNow: new Date().toISOString(),
        });
      },
    },
  },
});
