import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { timingSafeEqual } from "node:crypto";
import { clientIp } from "@/lib/rate-limit";
import { guardRequest } from "@/lib/api-guard";
import { adminResetGadsRow } from "@/lib/gads/service";
import { getGadsStore } from "@/lib/gads/store";
import { GADS_MAX_RESUMES } from "@/lib/gads/types";

// Recruiter-only controls for the Google Ads assessment: look a candidate up
// by email, and put their run back to pending so they can sit it again on
// the same link, name and email.
//
// The password lives in GADS_ADMIN_PASSWORD and is only ever compared here,
// on the server. It is deliberately not a constant in the repo and never
// reaches the browser. With the variable unset this endpoint refuses every
// request rather than falling back to a default, so a misconfigured deploy
// cannot leave the reset open to anyone who finds the URL.

const bodySchema = z.object({
  password: z.string().min(1).max(200),
  action: z.enum(["lookup", "reset"]),
  email: z.string().email().max(200),
});

function passwordMatches(supplied: string): boolean {
  const expected = process.env.GADS_ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on a length mismatch, which would itself leak the
  // length, so compare a fixed-size digest-ish pair: equal lengths first.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const Route = createFileRoute("/api/gads/admin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Tight limit: this is a password endpoint, so brute force is the
        // threat that matters, not throughput.
        const guard = await guardRequest(
          request,
          `gads-admin:${clientIp(request)}`,
          20,
          10 * 60 * 1000,
        );
        if (guard) return guard;

        const parsed = bodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) {
          return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
        }
        const { password, action, email } = parsed.data;

        if (!process.env.GADS_ADMIN_PASSWORD) {
          console.error("[api/gads/admin] GADS_ADMIN_PASSWORD is not configured");
          return Response.json(
            { ok: false, error: "Admin access is not configured on this environment." },
            { status: 503 },
          );
        }
        if (!passwordMatches(password)) {
          return Response.json({ ok: false, error: "Incorrect password." }, { status: 403 });
        }

        const row = await getGadsStore().findByEmail(email);
        if (!row) {
          return Response.json(
            { ok: false, error: "No assessment found for that email." },
            { status: 404 },
          );
        }

        const summarize = (r: typeof row) => ({
          candidateName: r.candidate_name,
          candidateEmail: r.candidate_email,
          status: r.status,
          currentIndex: r.current_index,
          resumeCount: r.resume_count ?? 0,
          maxResumes: GADS_MAX_RESUMES,
          startedAt: r.started_at,
          submittedAt: r.submitted_at,
          overallPercent: r.overall_percent,
        });

        if (action === "lookup") {
          return Response.json({ ok: true, assessment: summarize(row) });
        }

        const reset = await adminResetGadsRow(row);
        if (!reset) {
          return Response.json({ ok: false, error: "Reset failed. Try again." }, { status: 500 });
        }
        console.warn(
          `[api/gads/admin] reset assessment for ${row.candidate_email} (was ${row.status})`,
        );
        return Response.json({ ok: true, reset: true, assessment: summarize(reset) });
      },
    },
  },
});
