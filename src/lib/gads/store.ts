import { randomUUID, createHash } from "node:crypto";
import { getSupabase } from "@/lib/supabase";
import type { GadsAssessmentRow } from "@/lib/gads/types";

// Storage abstraction for the one Google Ads assessment row. Every call
// site (gads-service.ts, api.gads.begin.ts, api.gads.save.ts) goes through
// this instead of talking to Supabase directly, so the whole feature can
// run against an in-memory fallback when SUPABASE_URL isn't configured -
// no migration, no provisioning, works the moment `npm run dev` starts.
// Swap in real Supabase credentials later and nothing else changes.

export interface GadsStore {
  findByTokenHash(hash: string): Promise<GadsAssessmentRow | null>;
  /** Admin lookup. Email is the stable handle a recruiter actually has;
   * the token only ever lives in the candidate's link. */
  findByEmail(email: string): Promise<GadsAssessmentRow | null>;
  getById(id: string): Promise<GadsAssessmentRow | null>;
  insert(row: Partial<GadsAssessmentRow>): Promise<GadsAssessmentRow>;
  /** Applies `patch` only if every key in `where` matches the row's current
   * value (the same optimistic-concurrency guard a SQL `WHERE` clause
   * gives) - returns the updated row, or null if the guard failed. */
  updateIf(
    id: string,
    where: Partial<GadsAssessmentRow>,
    patch: Partial<GadsAssessmentRow>,
  ): Promise<GadsAssessmentRow | null>;
}

const TABLE = "google_ads_assessments";

const supabaseStore: GadsStore = {
  async findByTokenHash(hash) {
    const { data, error } = await getSupabase()
      .from(TABLE)
      .select("*")
      .eq("session_token_hash", hash)
      .maybeSingle<GadsAssessmentRow>();
    if (error) {
      console.error("[gads-store] findByTokenHash error:", error);
      return null;
    }
    return data;
  },
  async getById(id) {
    const { data, error } = await getSupabase()
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle<GadsAssessmentRow>();
    if (error) {
      console.error("[gads-store] getById error:", error);
      return null;
    }
    return data;
  },
  async insert(row) {
    const { data, error } = await getSupabase().from(TABLE).insert(row).select("*").single();
    if (error) throw error;
    return data as GadsAssessmentRow;
  },
  async findByEmail(email) {
    const { data, error } = await getSupabase()
      .from(TABLE)
      .select("*")
      .ilike("candidate_email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<GadsAssessmentRow>();
    if (error) {
      console.error("[gads-store] findByEmail error:", error);
      return null;
    }
    return data;
  },
  async updateIf(id, where, patch) {
    let query = getSupabase().from(TABLE).update(patch).eq("id", id);
    for (const [key, value] of Object.entries(where)) {
      query = query.eq(key, value as never);
    }
    const { data, error } = await query.select("*").maybeSingle<GadsAssessmentRow>();
    if (error) {
      console.error("[gads-store] updateIf error:", error);
      return null;
    }
    return data;
  },
};

// ---------------------------------------------------------------------------
// In-memory fallback - single Node process only, resets on every restart,
// not shared across serverless instances. Fine for local `npm run dev`
// testing; never used once SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY are set.

const memoryRows = new Map<string, GadsAssessmentRow>();

const ROW_DEFAULTS = {
  candidate_name: "",
  candidate_email: "",
  session_token_hash: "",
  link_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  questions: null,
  answers: {},
  draft_answer: null,
  current_index: 0,
  resume_count: 0,
  current_question_started_at: null,
  violations: [],
  mic_activity: [],
  camera_snapshots: [],
  recording_urls: [],
  status: "pending",
  scores: null,
  per_question: null,
  overall_percent: null,
  recommendation: null,
  suspicious_activity_score: null,
  time_taken_seconds: null,
  submit_reason: null,
  candidate_confirmation_sent_at: null,
  recruiter_report_sent_at: null,
  created_at: new Date().toISOString(),
  started_at: null,
  expires_at: null,
  submitted_at: null,
} satisfies Omit<GadsAssessmentRow, "id">;

function matchesWhere(row: GadsAssessmentRow, where: Partial<GadsAssessmentRow>): boolean {
  return (Object.keys(where) as Array<keyof GadsAssessmentRow>).every(
    (key) => row[key] === where[key],
  );
}

const inMemoryStore: GadsStore = {
  async findByTokenHash(hash) {
    for (const row of memoryRows.values()) {
      if (row.session_token_hash === hash) return row;
    }
    return null;
  },
  async findByEmail(email) {
    const wanted = email.trim().toLowerCase();
    for (const row of memoryRows.values()) {
      if (row.candidate_email.trim().toLowerCase() === wanted) return row;
    }
    return null;
  },
  async getById(id) {
    return memoryRows.get(id) ?? null;
  },
  async insert(row) {
    const id = row.id ?? randomUUID();
    const full: GadsAssessmentRow = { ...ROW_DEFAULTS, ...row, id };
    memoryRows.set(id, full);
    return full;
  },
  async updateIf(id, where, patch) {
    const row = memoryRows.get(id);
    if (!row || !matchesWhere(row, where)) return null;
    const updated: GadsAssessmentRow = { ...row, ...patch };
    memoryRows.set(id, updated);
    return updated;
  },
};

/** Fixed, memorable 64-hex-char tokens so local testing needs zero setup:
 * start `npm run dev`, open /assessment/google-ads/<DEV_TOKEN>. Only ever
 * seeded when running on the in-memory store - meaningless once Supabase is
 * configured, since these rows are never created there (use
 * scripts/create-gads-invite.mjs for real invites instead). */
export const DEV_TOKEN = "d".repeat(64);
const DEV_CANDIDATE_NAME = "Aayushi";
const DEV_CANDIDATE_EMAIL = "aayushi.official06@gmail.com";

/** Akash's own always-available testing row - GADS_UNLIMITED_TEST_EMAILS
 * (see gads-types.ts) lets this one reset and restart after every
 * submission instead of locking after one attempt. */
export const AKASH_DEV_TOKEN = "a".repeat(64);
const AKASH_CANDIDATE_NAME = "Akash";
const AKASH_CANDIDATE_EMAIL = "akash@ethixweb.com";

let usingMemoryStore = false;

function seedRow(id: string, token: string, name: string, email: string) {
  const hash = createHash("sha256").update(token).digest("hex");
  memoryRows.set(id, {
    ...ROW_DEFAULTS,
    id,
    candidate_name: name,
    candidate_email: email,
    session_token_hash: hash,
  });
}

function seedDevRows() {
  seedRow(randomUUID(), DEV_TOKEN, DEV_CANDIDATE_NAME, DEV_CANDIDATE_EMAIL);
  seedRow(randomUUID(), AKASH_DEV_TOKEN, AKASH_CANDIDATE_NAME, AKASH_CANDIDATE_EMAIL);
  console.warn(
    "\n[gads-store] SUPABASE_URL is not configured - running the Google Ads assessment on an " +
      "in-memory store (hardcoded candidates, resets on every restart, not for real use).\n" +
      `[gads-store] Candidate link:  http://localhost:3000/assessment/google-ads/${DEV_TOKEN}\n` +
      `[gads-store]   gate expects: "${DEV_CANDIDATE_NAME}" / ${DEV_CANDIDATE_EMAIL}\n` +
      `[gads-store] Akash's link (unlimited attempts): http://localhost:3000/assessment/google-ads/${AKASH_DEV_TOKEN}\n` +
      `[gads-store]   gate expects: "${AKASH_CANDIDATE_NAME}" / ${AKASH_CANDIDATE_EMAIL}\n`,
  );
}

let cachedStore: GadsStore | null = null;

export function getGadsStore(): GadsStore {
  if (cachedStore) return cachedStore;
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    cachedStore = supabaseStore;
  } else {
    // Never on a deployed host. Two reasons, either of them sufficient: the
    // in-memory store loses a candidate's exam between requests because each
    // one can hit a different instance, and seedDevRows() would publish the
    // fixed DEV_TOKEN/AKASH_DEV_TOKEN links as live, working exams that
    // anyone could guess. VERCEL_ENV is "production"/"preview" on a real
    // deployment and "development" under local `vercel dev`.
    const deployed =
      process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview";
    if (deployed) {
      throw new Error(
        "[gads-store] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not set on this " +
          "deployment. Refusing to fall back to the in-memory store, which would lose exam " +
          "answers between requests and expose the hardcoded dev tokens as live links. Set " +
          "both in the Vercel project's environment variables and redeploy.",
      );
    }
    usingMemoryStore = true;
    seedDevRows();
    cachedStore = inMemoryStore;
  }
  return cachedStore;
}

export function isUsingInMemoryGadsStore(): boolean {
  return usingMemoryStore;
}
