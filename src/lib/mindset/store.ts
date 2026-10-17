import { randomUUID } from "node:crypto";
import { getSupabase } from "@/lib/supabase";
import type { MindsetAssessmentRow } from "@/lib/mindset/types";

// Storage abstraction for mindset assessment rows. Every call site
// (mindset/service.ts, the api.mindset.* routes) goes through this instead
// of talking to Supabase directly, so the whole feature can run against an
// in-memory fallback when SUPABASE_URL isn't configured - no migration, no
// provisioning, works the moment `npm run dev` starts. Swap in real
// Supabase credentials later and nothing else changes. Mirrors gads/store.ts.

export interface MindsetStore {
  findByTokenHash(hash: string): Promise<MindsetAssessmentRow | null>;
  getById(id: string): Promise<MindsetAssessmentRow | null>;
  /** Most recent rows for this email, newest first - used by /api/mindset/begin
   * to enforce "one attempt ever". */
  findByEmail(email: string, limit: number): Promise<MindsetAssessmentRow[]>;
  insert(row: Partial<MindsetAssessmentRow>): Promise<MindsetAssessmentRow>;
  /** Applies `patch` only if every key in `where` matches the row's current
   * value - returns the updated row, or null if the guard failed. */
  updateIf(
    id: string,
    where: Partial<MindsetAssessmentRow>,
    patch: Partial<MindsetAssessmentRow>,
  ): Promise<MindsetAssessmentRow | null>;
}

const TABLE = "mindset_assessments";

const supabaseStore: MindsetStore = {
  async findByTokenHash(hash) {
    const { data, error } = await getSupabase()
      .from(TABLE)
      .select("*")
      .eq("session_token_hash", hash)
      .maybeSingle<MindsetAssessmentRow>();
    if (error) {
      console.error("[mindset-store] findByTokenHash error:", error);
      return null;
    }
    return data;
  },
  async getById(id) {
    const { data, error } = await getSupabase()
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle<MindsetAssessmentRow>();
    if (error) {
      console.error("[mindset-store] getById error:", error);
      return null;
    }
    return data;
  },
  async findByEmail(email, limit) {
    const { data, error } = await getSupabase()
      .from(TABLE)
      .select("*")
      .eq("candidate_email", email)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      console.error("[mindset-store] findByEmail error:", error);
      return [];
    }
    return (data ?? []) as MindsetAssessmentRow[];
  },
  async insert(row) {
    const { data, error } = await getSupabase().from(TABLE).insert(row).select("*").single();
    if (error) throw error;
    return data as MindsetAssessmentRow;
  },
  async updateIf(id, where, patch) {
    let query = getSupabase().from(TABLE).update(patch).eq("id", id);
    for (const [key, value] of Object.entries(where)) {
      query = query.eq(key, value as never);
    }
    const { data, error } = await query.select("*").maybeSingle<MindsetAssessmentRow>();
    if (error) {
      console.error("[mindset-store] updateIf error:", error);
      return null;
    }
    return data;
  },
};

// ---------------------------------------------------------------------------
// In-memory fallback - single Node process only, resets on every restart,
// not shared across serverless instances. Fine for local `npm run dev`
// testing; never used once SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY are set.

const memoryRows = new Map<string, MindsetAssessmentRow>();

function matchesWhere(row: MindsetAssessmentRow, where: Partial<MindsetAssessmentRow>): boolean {
  return (Object.keys(where) as Array<keyof MindsetAssessmentRow>).every(
    (key) => row[key] === where[key],
  );
}

const inMemoryStore: MindsetStore = {
  async findByTokenHash(hash) {
    for (const row of memoryRows.values()) {
      if (row.session_token_hash === hash) return row;
    }
    return null;
  },
  async getById(id) {
    return memoryRows.get(id) ?? null;
  },
  async findByEmail(email, limit) {
    return [...memoryRows.values()]
      .filter((r) => r.candidate_email === email)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  },
  async insert(row) {
    const id = row.id ?? randomUUID();
    const full = { ...row, id } as MindsetAssessmentRow;
    memoryRows.set(id, full);
    return full;
  },
  async updateIf(id, where, patch) {
    const row = memoryRows.get(id);
    if (!row || !matchesWhere(row, where)) return null;
    const updated: MindsetAssessmentRow = { ...row, ...patch };
    memoryRows.set(id, updated);
    return updated;
  },
};

let usingMemoryStore = false;
let warnedOnce = false;

export function getMindsetStore(): MindsetStore {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return supabaseStore;
  }

  // On a serverless host the in-memory store is not a degraded mode, it is
  // silent data loss: each request can land on a different instance, so a
  // candidate's exam vanishes partway through and the row that should have
  // been emailed and scored never existed. Worse, it looks fine until
  // someone is 30 questions deep. Fail loudly at the first call instead.
  // VERCEL_ENV is "production" or "preview" on a real deployment and
  // "development" under local `vercel dev`, which is the one case where the
  // in-memory store is the point rather than a hazard.
  const deployed = process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview";
  if (deployed) {
    throw new Error(
      "[mindset-store] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not set on this " +
        "deployment. Refusing to run the assessment on the in-memory store, which loses " +
        "candidate answers between requests. Set both in the Vercel project's environment " +
        "variables and redeploy.",
    );
  }

  usingMemoryStore = true;
  if (!warnedOnce) {
    warnedOnce = true;
    console.warn(
      "[mindset-store] SUPABASE_URL is not configured - running the mindset assessment on an " +
        "in-memory store (resets on every restart, local development only).",
    );
  }
  return inMemoryStore;
}

export function isUsingInMemoryMindsetStore(): boolean {
  return usingMemoryStore;
}
