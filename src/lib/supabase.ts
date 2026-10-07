import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only client using the service role key - screening data never goes
// through a client-side Supabase call, only through our own API routes. Row
// Level Security is enabled on screening_tests with no anon policies, so
// even a leaked anon key couldn't read candidate results.
let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY " +
        "(see supabase/schema.sql for the table this expects).",
    );
  }
  if (!cached) {
    cached = createClient(url, key, { auth: { persistSession: false } });
  }
  return cached;
}

export type ScreeningStatus =
  "pending" | "in_progress" | "submitted" | "scored" | "approved" | "rejected" | "expired";

export interface ScreeningQuestion {
  id: string;
  type: "scenario" | "critique";
  prompt: string;
  timeLimitSeconds: number;
}

export interface ScreeningAnswer {
  questionId: string;
  answer: string;
}

export interface ScreeningScore {
  questionId: string;
  score: number;
  maxScore: number;
  reasoning: string;
}

export interface ScreeningTestRow {
  id: string;
  role_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string | null;
  resume_url: string | null;
  questions: ScreeningQuestion[];
  answers: ScreeningAnswer[] | null;
  status: ScreeningStatus;
  total_score: number | null;
  max_score: number | null;
  scoring: ScreeningScore[] | null;
  overall_reasoning: string | null;
  tab_switch_count: number;
  blur_count: number;
  reviewer_decision: "approved" | "rejected" | null;
  created_at: string;
  started_at: string | null;
  submitted_at: string | null;
  expires_at: string;
}
