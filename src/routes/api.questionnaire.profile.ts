import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { guardRequestByToken } from "@/lib/api-guard";
import { normalizeEmailIdentity } from "@/lib/utils";
import { loadByToken, markOpened } from "@/lib/questionnaire/service";
import { getQuestionnaireStore } from "@/lib/questionnaire/store";
import { TOKEN_SCHEMA, effectiveStatus, validateProfile } from "@/lib/questionnaire/types";

// The "About you" step before question 1: name, phone, email, college and an
// optional LinkedIn. The email has to be the one the invitation was created
// for, which is what stops a forwarded link being filled in by someone else.
// Can be resubmitted (to fix a typo) until the questionnaire is submitted.

const bodySchema = z.object({
  token: TOKEN_SCHEMA,
  profile: z.record(z.unknown()),
});

export const Route = createFileRoute("/api/questionnaire/profile")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
        }

        // Low ceiling: this is the one step where the candidate types the
        // invited email, so it's the one worth guessing at.
        const guard = await guardRequestByToken(
          request,
          "questionnaire-profile",
          parsed.data.token,
          12,
          10 * 60 * 1000,
        );
        if (guard) return guard;

        const found = await loadByToken(parsed.data.token);
        if (!found) return Response.json({ ok: false, status: "invalid" }, { status: 404 });
        const status = effectiveStatus(found);
        if (status !== "pending" && status !== "opened") {
          return Response.json({ ok: false, status }, { status: 409 });
        }

        const result = validateProfile(parsed.data.profile);
        if (!result.ok) {
          return Response.json(
            { ok: false, field: result.field, error: result.error },
            { status: 400 },
          );
        }
        const { profile } = result;

        if (normalizeEmailIdentity(profile.email) !== found.email_identity) {
          return Response.json(
            {
              ok: false,
              field: "email",
              error:
                "This email doesn't match the one this invitation was sent to. Please use that address.",
            },
            { status: 400 },
          );
        }

        const row = await markOpened(found);
        const updated = await getQuestionnaireStore().updateIf(
          row.id,
          { status: "opened" },
          {
            candidate_name: profile.name,
            candidate_phone: profile.phone,
            candidate_email: profile.email,
            candidate_college: profile.college,
            candidate_linkedin: profile.linkedin,
            profile_completed_at: row.profile_completed_at ?? new Date().toISOString(),
          },
        );
        if (!updated) {
          return Response.json(
            { ok: false, error: "Could not save your details. Please try again." },
            { status: 409 },
          );
        }
        if (!row.profile_completed_at) {
          await getQuestionnaireStore().logEvent({
            candidate_id: row.id,
            action: "profile_completed",
            actor: "candidate",
            detail: null,
          });
        }

        return Response.json({
          ok: true,
          profile: { ...profile, linkedin: profile.linkedin ?? "" },
        });
      },
    },
  },
});
