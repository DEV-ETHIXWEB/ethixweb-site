import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { guardRequestByToken } from "@/lib/api-guard";
import { loadByToken } from "@/lib/questionnaire/service";
import { getQuestionnaireStore } from "@/lib/questionnaire/store";
import {
  TOKEN_SCHEMA,
  cleanAnswerMap,
  draftSchema,
  effectiveStatus,
  type AnswerMap,
} from "@/lib/questionnaire/types";

// Saves unsubmitted progress on every Continue, so a refresh, a closed tab or
// a switch from phone to laptop picks up where the candidate stopped. This
// only ever writes the draft column on the invitation; it never creates a
// response and never touches the status, so it can't consume the invite.

const bodySchema = z.object({ token: TOKEN_SCHEMA, draft: draftSchema });

export const Route = createFileRoute("/api/questionnaire/save")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
        }

        const guard = await guardRequestByToken(
          request,
          "questionnaire-save",
          parsed.data.token,
          150,
          10 * 60 * 1000,
        );
        if (guard) return guard;

        const row = await loadByToken(parsed.data.token);
        if (!row) return Response.json({ ok: false, status: "invalid" }, { status: 404 });
        const status = effectiveStatus(row);
        if (status !== "opened") return Response.json({ ok: false, status }, { status: 409 });

        const updated = await getQuestionnaireStore().updateIf(
          row.id,
          { status: "opened" },
          {
            draft: {
              answers: cleanAnswerMap(parsed.data.draft.answers as AnswerMap),
              step: parsed.data.draft.step,
            },
            draft_updated_at: new Date().toISOString(),
          },
        );
        if (!updated) return Response.json({ ok: false, error: "Not saved." }, { status: 409 });
        return Response.json({ ok: true });
      },
    },
  },
});
