import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { checkRateLimitDurable, clientIp } from "@/lib/rate-limit";
import { getSupabase } from "@/lib/supabase";
import { generateScreeningTest } from "@/lib/screening/anthropic";
import { getScreeningConfig } from "@/lib/screening/rubrics";
import { isSameOriginRequest } from "@/lib/origin-check";

const RESUME_HOST_RE = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i;

const bodySchema = z.object({
  roleId: z.string().min(1).max(60),
  candidateName: z.string().trim().min(2).max(120),
  candidateEmail: z.string().trim().email().max(200),
  candidatePhone: z.string().trim().max(30).optional().default(""),
  resumeUrl: z
    .string()
    .url()
    .regex(RESUME_HOST_RE, "Resume must come from our upload")
    .nullable()
    .optional(),
});

export const Route = createFileRoute("/api/screening/start")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isSameOriginRequest(request)) {
          return Response.json({ ok: false, error: "Invalid request origin" }, { status: 403 });
        }

        if (
          !(await checkRateLimitDurable(`screening-start:${clientIp(request)}`, 5, 10 * 60 * 1000))
        ) {
          return Response.json(
            { ok: false, error: "Too many requests. Please try again later." },
            { status: 429 },
          );
        }

        const raw = await request.json().catch(() => null);
        const parsed = bodySchema.safeParse(raw);
        if (!parsed.success) {
          return Response.json(
            { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request" },
            { status: 400 },
          );
        }
        const { roleId: role, candidateName: name, candidateEmail: email, resumeUrl } = parsed.data;

        const config = getScreeningConfig(role);
        if (!config) {
          return Response.json(
            { ok: false, error: "Screening is not enabled for this role yet" },
            { status: 400 },
          );
        }

        let questions;
        try {
          questions = await generateScreeningTest(config);
        } catch (err) {
          console.error("[api/screening/start] generateScreeningTest threw:", err);
          return Response.json(
            {
              ok: false,
              error: "Could not generate the screening test. Please try again shortly.",
            },
            { status: 502 },
          );
        }

        const supabase = getSupabase();
        const { data, error } = await supabase
          .from("screening_tests")
          .insert({
            role_id: role,
            candidate_name: name,
            candidate_email: email,
            candidate_phone: parsed.data.candidatePhone || null,
            resume_url: resumeUrl ?? null,
            questions,
            status: "in_progress",
            started_at: new Date().toISOString(),
          })
          .select("id, expires_at")
          .single();

        if (error || !data) {
          console.error("[api/screening/start] Supabase insert error:", error);
          return Response.json(
            { ok: false, error: "Could not start the screening test. Please try again shortly." },
            { status: 502 },
          );
        }

        return Response.json(
          {
            ok: true,
            testId: data.id,
            expiresAt: data.expires_at,
            questions,
          },
          { status: 201 },
        );
      },
    },
  },
});
