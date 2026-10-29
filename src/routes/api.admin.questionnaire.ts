import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { clientIp } from "@/lib/rate-limit";
import { guardRequest } from "@/lib/api-guard";
import {
  adminPasswordMatches,
  adminSessionValid,
  isAdminConfigured,
  issueAdminSession,
} from "@/lib/admin-auth";
import { FIELD_LIMITS, cleanField, isValidEmail } from "@/lib/utils";
import {
  adminRow,
  inviteLink,
  newInviteToken,
  readableAnswer,
  responsesCsv,
} from "@/lib/questionnaire/service";
import { QUESTIONS, isAsked } from "@/lib/questionnaire/questions";
import { sendSubmissionEmail } from "@/lib/questionnaire/email";
import { getQuestionnaireStore } from "@/lib/questionnaire/store";
import { effectiveStatus, type QuestionnaireResponseRow } from "@/lib/questionnaire/types";

// Recruiter controls for the candidate questionnaire: create and manage
// invitations, read responses, export CSV. Same password and the same
// refuse-when-unset rule as /api/admin/assessments (see src/lib/admin-auth.ts).
//
// "login" takes the password and returns a signed 8-hour session; every
// other action takes that session. Everything is POST with the credential in
// the body, so nothing sensitive sits in a URL, and the CSV comes back as the
// response body rather than a link anyone could reuse.

const MAX_ROWS = 500;

const bodySchema = z.object({
  password: z.string().min(1).max(200).optional(),
  session: z.string().max(200).optional(),
  action: z.enum([
    "login",
    "list",
    "detail",
    "create",
    "revoke",
    "expire",
    "reopen",
    "relink",
    "email",
    "export",
  ]),
  id: z.string().uuid().optional(),
  name: z.string().max(200).optional(),
  email: z.string().max(300).optional(),
  expiresInDays: z.number().int().min(1).max(60).optional(),
  reason: z.string().max(500).optional(),
});

function fail(error: string, status = 400) {
  return Response.json({ ok: false, error }, { status });
}

async function listPayload() {
  const store = getQuestionnaireStore();
  const rows = await store.listAll(MAX_ROWS);
  const responses = await store.liveResponses(
    rows.filter((r) => r.status === "submitted").map((r) => r.id),
  );
  const byCandidate = new Map(responses.map((r) => [r.candidate_id, r]));
  const out = rows.map((r) => adminRow(r, byCandidate.get(r.id)));

  const stats = { total: out.length, pending: 0, opened: 0, submitted: 0, closed: 0 };
  for (const r of out) {
    if (r.status === "pending") stats.pending++;
    else if (r.status === "opened") stats.opened++;
    else if (r.status === "submitted") stats.submitted++;
    else stats.closed++;
  }
  return { ok: true, stats, rows: out };
}

export const Route = createFileRoute("/api/admin/questionnaire")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return fail("Invalid request");
        const { password, session, action, id } = parsed.data;

        // Password attempts get the same tight ceiling as /admin/assessments,
        // because brute force is the threat there. Session calls get room for
        // a working session: sign in, a few dozen invites and lookups.
        const guard = await guardRequest(
          request,
          action === "login"
            ? `admin-login:${clientIp(request)}`
            : `admin-questionnaire:${clientIp(request)}`,
          action === "login" ? 12 : 300,
          10 * 60 * 1000,
        );
        if (guard) return guard;

        if (!isAdminConfigured()) {
          console.error("[api/admin/questionnaire] GADS_ADMIN_PASSWORD is not configured");
          return fail("Admin access is not configured on this environment.", 503);
        }

        if (action === "login") {
          if (!password || !adminPasswordMatches(password)) {
            console.warn(`[admin] failed questionnaire sign-in from ${clientIp(request)}`);
            return fail("Incorrect password.", 403);
          }
          return Response.json({ ...(await listPayload()), session: issueAdminSession() });
        }
        if (!session || !adminSessionValid(session)) {
          return Response.json(
            { ok: false, signedOut: true, error: "Your session has ended. Sign in again." },
            { status: 401 },
          );
        }

        const store = getQuestionnaireStore();

        if (action === "list") return Response.json(await listPayload());

        if (action === "export") {
          const rows = (await store.listAll(MAX_ROWS)).filter((r) => r.status === "submitted");
          const responses = await store.liveResponses(rows.map((r) => r.id));
          const csv = responsesCsv(rows, new Map(responses.map((r) => [r.candidate_id, r])));
          console.warn(`[admin] exported ${responses.length} questionnaire responses`);
          return new Response(csv, {
            headers: {
              "Content-Type": "text/csv; charset=utf-8",
              "Content-Disposition": 'attachment; filename="questionnaire-responses.csv"',
              "Cache-Control": "no-store",
            },
          });
        }

        if (action === "create") {
          const name = cleanField(parsed.data.name, FIELD_LIMITS.name);
          const email = cleanField(parsed.data.email, FIELD_LIMITS.email).toLowerCase();
          if (name.length < 2) return fail("Enter the candidate's name.");
          if (!isValidEmail(email)) return fail("Enter a valid email address.");

          // An expired-but-never-swept invite would otherwise still count as
          // live for the unique index.
          await store.expireStale(email);

          const days = parsed.data.expiresInDays ?? 14;
          const { token, hash } = newInviteToken();
          const row = await store.createInvite({
            invited_name: name,
            invited_email: email,
            token_hash: hash,
            expires_at: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
          });
          if (!row) {
            return fail(
              "This candidate already has an invitation that is pending, opened or submitted. " +
                "Revoke or expire it first if you need to send a new one.",
              409,
            );
          }
          await store.logEvent({
            candidate_id: row.id,
            action: "invited",
            actor: "admin",
            detail: `expires in ${days} days`,
          });
          return Response.json({
            ...(await listPayload()),
            created: { id: row.id, link: inviteLink(new URL(request.url).origin, token) },
          });
        }

        if (!id) return fail("Missing id.");
        const row = await store.getById(id);
        if (!row) return fail("Candidate not found.", 404);
        const status = effectiveStatus(row);

        if (action === "detail") {
          const [responses, events] = await Promise.all([
            store.liveResponses([row.id]),
            store.events(row.id),
          ]);
          const response: QuestionnaireResponseRow | undefined = responses[0];
          const answers = response?.answers ?? row.draft?.answers ?? {};
          return Response.json({
            ok: true,
            candidate: adminRow(row, response),
            answersAreDraft: !response,
            answers: QUESTIONS.map((q) => ({
              id: q.id,
              number: q.label,
              section: q.section,
              question: q.text,
              answer: isAsked(q, answers)
                ? readableAnswer(answers, q.id)
                : "Not asked (only shown after a yes to question 13)",
            })),
            events,
          });
        }

        if (action === "revoke" || action === "expire") {
          if (status !== "pending" && status !== "opened") {
            return fail(`Only pending or opened invitations can be ${action}d.`, 409);
          }
          const now = new Date().toISOString();
          const updated = await store.updateIf(
            row.id,
            { status: row.status },
            action === "revoke"
              ? { status: "revoked", revoked_at: now }
              : { status: "expired", expires_at: now },
          );
          if (!updated) return fail("The invitation changed. Refresh and try again.", 409);
          await store.logEvent({
            candidate_id: row.id,
            action: action === "revoke" ? "revoked" : "expired",
            actor: "admin",
            detail: null,
          });
        }

        if (action === "relink") {
          if (status !== "pending" && status !== "opened") {
            return fail("Only pending or opened invitations can get a new link.", 409);
          }
          const { token, hash } = newInviteToken();
          const updated = await store.updateIf(
            row.id,
            { status: row.status, token_hash: row.token_hash },
            { token_hash: hash },
          );
          if (!updated) return fail("The invitation changed. Refresh and try again.", 409);
          await store.logEvent({
            candidate_id: row.id,
            action: "link_regenerated",
            actor: "admin",
            detail: "previous link stopped working",
          });
          return Response.json({
            ...(await listPayload()),
            created: { id: row.id, link: inviteLink(new URL(request.url).origin, token) },
          });
        }

        if (action === "email") {
          const [response] = await store.liveResponses([row.id]);
          if (!response) return fail("Only submitted responses can be emailed.", 409);
          const sent = await sendSubmissionEmail(row, response.answers);
          await store.logEvent({
            candidate_id: row.id,
            action: sent ? "email_sent" : "email_failed",
            actor: "admin",
            detail: "resent from dashboard",
          });
          if (!sent)
            return fail("The email didn't send. Check RESEND_API_KEY and the server logs.", 502);
          return Response.json({ ...(await listPayload()), emailed: true });
        }

        if (action === "reopen") {
          const reason = cleanField(parsed.data.reason, 500);
          if (reason.length < 3) return fail("Say why the submission is being reopened.");
          const result = await store.reopen(row.id, reason);
          if (result !== "ok") return fail("Only submitted responses can be reopened.", 409);
          console.warn(`[admin] reopened questionnaire ${row.id}`);
        }

        return Response.json(await listPayload());
      },
    },
  },
});
