import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { clientIp } from "@/lib/rate-limit";
import { guardRequest } from "@/lib/api-guard";
import { adminPasswordMatches, isAdminConfigured } from "@/lib/admin-auth";
import { adminResetGadsRow } from "@/lib/gads/service";
import { getGadsStore } from "@/lib/gads/store";
import { GADS_MAX_RESUMES, GADS_TOTAL_QUESTIONS } from "@/lib/gads/types";
import { getMindsetStore } from "@/lib/mindset/store";
import { MINDSET_TOTAL_QUESTIONS } from "@/lib/mindset/types";

// Recruiter-only controls for both assessments: list everyone who has sat
// one, and give an individual another go.
//
// The two exams need different remedies. A Google Ads invite is a durable
// per-candidate link, so resetting puts the run back to the start and they
// reuse the same link. A mindset attempt is one-shot and self-serve, with no
// link to return to, so the fix is to void the blocking attempt - the row is
// kept exactly as it is, it just stops counting as a prior attempt, and the
// candidate registers again at /assessment/mindset.
//
// The password lives in GADS_ADMIN_PASSWORD and is compared only on the
// server (src/lib/admin-auth.ts). It is never a constant in the repo and never
// reaches the browser. With the variable unset every request is refused rather
// than falling back to a default, so a misconfigured deploy cannot leave this
// open.

const MAX_ROWS = 300;

const bodySchema = z.object({
  password: z.string().min(1).max(200),
  action: z.enum(["list", "reset", "void"]),
  /** Required by reset (gads) and void (mindset). */
  id: z.string().uuid().optional(),
});

export const Route = createFileRoute("/api/admin/assessments")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Tight limit: this is a password endpoint, so brute force is the
        // threat that matters, not throughput. 40 per ten minutes was ~5,700
        // guesses a day against a human-chosen password; the page itself
        // only needs a handful of calls per session (one to sign in, one per
        // reset or void), so a much lower ceiling costs the recruiter
        // nothing and removes most of the headroom.
        const guard = await guardRequest(
          request,
          `admin-assessments:${clientIp(request)}`,
          12,
          10 * 60 * 1000,
        );
        if (guard) return guard;

        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
        }
        const { password, action, id } = parsed.data;

        if (!isAdminConfigured()) {
          console.error("[api/admin/assessments] GADS_ADMIN_PASSWORD is not configured");
          return Response.json(
            { ok: false, error: "Admin access is not configured on this environment." },
            { status: 503 },
          );
        }
        if (!adminPasswordMatches(password)) {
          // Only successful resets and voids were ever logged, so a run of
          // failed guesses against this endpoint left no trace at all -
          // nothing to notice, and nothing to go back to afterwards. The
          // password itself is never logged, only that an attempt failed and
          // where it came from.
          console.warn(
            `[admin] failed password attempt from ${clientIp(request)} (action: ${action})`,
          );
          return Response.json({ ok: false, error: "Incorrect password." }, { status: 403 });
        }

        if (action === "reset") {
          if (!id) {
            return Response.json({ ok: false, error: "Missing id." }, { status: 400 });
          }
          const row = await getGadsStore().getById(id);
          if (!row) {
            return Response.json({ ok: false, error: "Assessment not found." }, { status: 404 });
          }
          const reset = await adminResetGadsRow(row);
          if (!reset) {
            return Response.json({ ok: false, error: "Reset failed. Try again." }, { status: 500 });
          }
          console.warn(`[admin] reset google ads assessment for ${row.candidate_email}`);
        }

        if (action === "void") {
          if (!id) {
            return Response.json({ ok: false, error: "Missing id." }, { status: 400 });
          }
          const row = await getMindsetStore().getById(id);
          if (!row) {
            return Response.json({ ok: false, error: "Attempt not found." }, { status: 404 });
          }
          // Toggle: voiding is reversible, so a mis-click costs nothing.
          // Guarded on the value we read, so two recruiters clicking at once
          // can't have the second silently undo the first - the loser gets
          // "Update failed. Try again." and sees the refreshed state.
          const voidedAt = row.voided_at ? null : new Date().toISOString();
          const updated = await getMindsetStore().updateIf(
            row.id,
            { voided_at: row.voided_at ?? null },
            { voided_at: voidedAt },
          );
          if (!updated) {
            return Response.json(
              { ok: false, error: "Update failed. Try again." },
              { status: 500 },
            );
          }
          console.warn(
            `[admin] ${voidedAt ? "voided" : "restored"} mindset attempt for ${row.candidate_email}`,
          );
        }

        // Every path ends by returning the current picture, so the page never
        // has to guess what changed.
        const [mindsetRows, gadsRows] = await Promise.all([
          getMindsetStore().listAll(MAX_ROWS),
          getGadsStore().listAll(MAX_ROWS),
        ]);

        return Response.json({
          ok: true,
          mindset: {
            total: MINDSET_TOTAL_QUESTIONS,
            rows: mindsetRows.map((r) => ({
              id: r.id,
              name: r.candidate_name,
              email: r.candidate_email,
              phone: r.candidate_phone,
              college: r.candidate_college,
              status: r.status,
              currentIndex: r.current_index,
              percent: r.overall_percent,
              startedAt: r.started_at,
              submittedAt: r.submitted_at,
              voidedAt: r.voided_at ?? null,
            })),
          },
          gads: {
            total: GADS_TOTAL_QUESTIONS,
            maxResumes: GADS_MAX_RESUMES,
            rows: gadsRows.map((r) => ({
              id: r.id,
              name: r.candidate_name,
              email: r.candidate_email,
              status: r.status,
              currentIndex: r.current_index,
              resumeCount: r.resume_count ?? 0,
              percent: r.overall_percent,
              startedAt: r.started_at,
              submittedAt: r.submitted_at,
            })),
          },
        });
      },
    },
  },
});
