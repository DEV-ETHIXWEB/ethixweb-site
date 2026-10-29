import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { guardRequestByToken } from "@/lib/api-guard";
import { hashInviteToken } from "@/lib/questionnaire/service";
import { sendSubmissionEmail } from "@/lib/questionnaire/email";
import { FORM_VERSION } from "@/lib/questionnaire/questions";
import { getQuestionnaireStore } from "@/lib/questionnaire/store";
import { TOKEN_SCHEMA, validateSubmission } from "@/lib/questionnaire/types";

// The one write that counts. Validation happens here, then the store's
// submit() (submit_questionnaire() in Postgres) locks the invitation, inserts
// the response and marks the invitation submitted in a single transaction.
// A second submit for the same invitation, whether a double-click, a second
// tab or a hand-crafted request, gets "already_submitted" and changes
// nothing. If the insert fails, the invitation is left as it was and the
// candidate can retry.
//
// Once saved, the full submission is emailed to the hiring inbox
// (QUESTIONNAIRE_REPORT_EMAIL, default info@ethixweb.com). The email is a
// copy, not the record: if it fails, the submission still stands and the
// failure lands in the audit trail.

const bodySchema = z.object({ token: TOKEN_SCHEMA, answers: z.unknown() });

const MESSAGES: Record<string, string> = {
  not_found: "This invitation link isn't valid.",
  revoked: "This invitation has been withdrawn.",
  expired: "This invitation has expired.",
  no_profile: "Please fill in your details before submitting.",
};

export const Route = createFileRoute("/api/questionnaire/submit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
        }

        const guard = await guardRequestByToken(
          request,
          "questionnaire-submit",
          parsed.data.token,
          10,
          10 * 60 * 1000,
        );
        if (guard) return guard;

        const checked = validateSubmission(parsed.data.answers);
        if (!checked.ok) {
          return Response.json(
            { ok: false, questionId: checked.questionId, error: checked.error },
            { status: 400 },
          );
        }

        let result;
        try {
          result = await getQuestionnaireStore().submit(
            hashInviteToken(parsed.data.token),
            checked.answers,
            FORM_VERSION,
            request.headers.get("user-agent") ?? "",
          );
        } catch (err) {
          console.error("[api/questionnaire/submit] store error:", err);
          return Response.json(
            {
              ok: false,
              retryable: true,
              error: "We couldn't save your answers just now. Nothing was lost; please try again.",
            },
            { status: 503 },
          );
        }

        if (result === "ok") {
          const store = getQuestionnaireStore();
          const row = await store.findByTokenHash(hashInviteToken(parsed.data.token));
          if (row) {
            const sent = await sendSubmissionEmail(row, checked.answers);
            await store.logEvent({
              candidate_id: row.id,
              action: sent ? "email_sent" : "email_failed",
              actor: "system",
              detail: null,
            });
          }
        }

        if (result === "ok" || result === "already_submitted") {
          // Already-submitted is reported as its own status so the page shows
          // the "already submitted" screen rather than a fresh success.
          return Response.json({ ok: true, status: result === "ok" ? "submitted" : "already" });
        }
        return Response.json(
          { ok: false, status: result, error: MESSAGES[result] ?? "Submission refused." },
          { status: 409 },
        );
      },
    },
  },
});
