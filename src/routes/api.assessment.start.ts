import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { clientIp } from "@/lib/rate-limit";
import { guardRequest } from "@/lib/api-guard";
import { getSupabase } from "@/lib/supabase";
import { getJob } from "@/lib/careers-data";
import {
  buildCandidateProfile,
  fetchResumePdfBase64,
  generateAssessment,
} from "@/lib/assessment/gemini";
import { createSessionToken } from "@/lib/assessment/session";
import { EXAM_DURATION_MINUTES, sanitizeQuestion } from "@/lib/assessment/types";

const RESUME_HOST_RE = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i;
const RETAKE_WINDOW_DAYS = 30;

const bodySchema = z.object({
  roleId: z.string().min(1).max(60),
  candidateName: z.string().trim().min(2).max(120),
  candidateEmail: z.string().trim().email().max(200),
  candidatePhone: z.string().trim().max(30).optional().default(""),
  resumeUrl: z.string().url().regex(RESUME_HOST_RE, "Resume must come from our upload"),
  experienceYears: z.string().trim().min(1).max(20),
});

export const Route = createFileRoute("/api/assessment/start")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Each start is an expensive multi-call Gemini generation - keep the
        // per-IP budget tight. Legit candidates only ever need one.
        const guard = await guardRequest(
          request,
          `assessment-start:${clientIp(request)}`,
          3,
          10 * 60 * 1000,
        );
        if (guard) return guard;

        const raw = await request.json().catch(() => null);
        const parsed = bodySchema.safeParse(raw);
        if (!parsed.success) {
          return Response.json(
            { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request" },
            { status: 400 },
          );
        }
        const body = parsed.data;

        const job = getJob(body.roleId);
        if (!job) {
          return Response.json(
            { ok: false, error: "This role is not accepting assessments" },
            { status: 400 },
          );
        }

        const supabase = getSupabase();

        // One attempt per candidate per role: a finished assessment inside the
        // retake window blocks a fresh one, and a live in-progress session must
        // be resumed (from the device it started on), never regenerated -
        // otherwise refreshing after seeing the questions would deal a new set.
        const windowStart = new Date(
          Date.now() - RETAKE_WINDOW_DAYS * 24 * 60 * 60 * 1000,
        ).toISOString();
        const { data: existing, error: existingError } = await supabase
          .from("assessments")
          .select("id, status, expires_at")
          .eq("candidate_email", body.candidateEmail.toLowerCase())
          .eq("role_id", body.roleId)
          .gte("created_at", windowStart)
          .order("created_at", { ascending: false })
          .limit(5);

        if (existingError) {
          console.error("[api/assessment/start] duplicate check failed:", existingError);
          return Response.json(
            { ok: false, error: "Could not start the assessment. Please try again shortly." },
            { status: 502 },
          );
        }

        for (const prior of existing ?? []) {
          if (prior.status === "submitted" || prior.status === "scored") {
            return Response.json(
              {
                ok: false,
                error:
                  "You've already completed this assessment. Our team will be in touch about next steps.",
              },
              { status: 409 },
            );
          }
          if (prior.status === "in_progress" && Date.now() < new Date(prior.expires_at).getTime()) {
            return Response.json(
              {
                ok: false,
                error:
                  "An assessment is already in progress for this email. Return to the browser where you started it, or try again after it expires.",
              },
              { status: 409 },
            );
          }
        }

        let questions;
        try {
          const resumePdf = await fetchResumePdfBase64(body.resumeUrl);
          const profile = buildCandidateProfile(job, body.experienceYears, resumePdf);
          questions = await generateAssessment(profile);
        } catch (err) {
          console.error("[api/assessment/start] generation failed:", err);
          return Response.json(
            {
              ok: false,
              error: "Could not generate your assessment. Please try again in a minute.",
            },
            { status: 502 },
          );
        }

        const { token, hash } = createSessionToken();
        const now = Date.now();
        const expiresAt = new Date(now + EXAM_DURATION_MINUTES * 60 * 1000).toISOString();

        const { data: inserted, error: insertError } = await supabase
          .from("assessments")
          .insert({
            role_id: body.roleId,
            candidate_name: body.candidateName,
            candidate_email: body.candidateEmail.toLowerCase(),
            candidate_phone: body.candidatePhone || null,
            resume_url: body.resumeUrl,
            experience_years: body.experienceYears,
            session_token_hash: hash,
            questions,
            started_at: new Date(now).toISOString(),
            expires_at: expiresAt,
          })
          .select("id")
          .single();

        if (insertError || !inserted) {
          console.error("[api/assessment/start] insert failed:", insertError);
          return Response.json(
            { ok: false, error: "Could not start the assessment. Please try again shortly." },
            { status: 502 },
          );
        }

        return Response.json(
          {
            ok: true,
            assessmentId: inserted.id,
            sessionToken: token,
            expiresAt,
            serverNow: new Date().toISOString(),
            questions: questions.map(sanitizeQuestion),
          },
          { status: 201 },
        );
      },
    },
  },
});
