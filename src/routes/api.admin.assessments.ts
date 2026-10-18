import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { timingSafeEqual } from "node:crypto";
import { clientIp } from "@/lib/rate-limit";
import { guardRequest } from "@/lib/api-guard";
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
// The password lives in GADS_ADMIN_PASSWORD and is compared only here. It is
// never a constant in the repo and never reaches the browser. With the
// variable unset every request is refused rather than falling back to a
// default, so a misconfigured deploy cannot leave this open.

const MAX_ROWS = 300;

const bodySchema = z.object({
  password: z.string().min(1).max(200),
  action: z.enum(["list", "reset", "void"]),
  /** Required by reset (gads) and void (mindset). */
  id: z.string().uuid().optional(),
});

function passwordMatches(supplied: string): boolean {
  const expected = process.env.GADS_ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const Route = createFileRoute("/api/admin/assessments")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Tight limit: this is a password endpoint, so brute force is the
        // threat that matters, not throughput.
        const guard = await guardRequest(
          request,
          `admin-assessments:${clientIp(request)}`,
          40,
          10 * 60 * 1000,
        );
        if (guard) return guard;

        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
        }
        const { password, action, id } = parsed.data;

        if (!process.env.GADS_ADMIN_PASSWORD) {
          console.error("[api/admin/assessments] GADS_ADMIN_PASSWORD is not configured");
          return Response.json(
            { ok: false, error: "Admin access is not configured on this environment." },
            { status: 503 },
          );
        }
        if (!passwordMatches(password)) {
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
          const voidedAt = row.voided_at ? null : new Date().toISOString();
          const updated = await getMindsetStore().updateIf(row.id, {}, { voided_at: voidedAt });
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
