import { randomUUID } from "node:crypto";
import { getSupabase } from "@/lib/supabase";
import { normalizeEmailIdentity } from "@/lib/utils";
import type {
  AnswerMap,
  QuestionnaireCandidateRow,
  QuestionnaireEventRow,
  QuestionnaireResponseRow,
} from "./types";

// Storage for the candidate questionnaire. Same shape as the other exam
// stores (src/lib/mindset/store.ts): Supabase when it's configured, an
// in-memory stand-in for local `npm run dev` otherwise, and a hard refusal to
// use the in-memory one on a real deployment.
//
// The two operations that decide "one submission per candidate" (submit and
// reopen) are Postgres functions in 0011_candidate_questionnaire.sql, so the
// lock, the insert and the status change happen in one transaction. The
// in-memory versions below do the same work with no `await` in between, which
// is atomic within the single Node process they run in.

export type SubmitResult =
  "ok" | "not_found" | "already_submitted" | "revoked" | "expired" | "no_profile";
export type ReopenResult = "ok" | "not_found" | "not_submitted";

export interface NewInvite {
  invited_name: string;
  invited_email: string;
  token_hash: string;
  expires_at: string;
}

export interface QuestionnaireStore {
  findByTokenHash(hash: string): Promise<QuestionnaireCandidateRow | null>;
  getById(id: string): Promise<QuestionnaireCandidateRow | null>;
  listAll(limit: number): Promise<QuestionnaireCandidateRow[]>;
  /** Returns null when the person already has a live invitation (the
   * partial unique index refused it). */
  createInvite(invite: NewInvite): Promise<QuestionnaireCandidateRow | null>;
  /** Flips this person's pending/opened invitations that are past their
   * deadline to 'expired', so they stop blocking a fresh invite. */
  expireStale(email: string): Promise<void>;
  updateIf(
    id: string,
    where: Partial<QuestionnaireCandidateRow>,
    patch: Partial<QuestionnaireCandidateRow>,
  ): Promise<QuestionnaireCandidateRow | null>;
  submit(
    tokenHash: string,
    answers: AnswerMap,
    formVersion: number,
    userAgent: string,
  ): Promise<SubmitResult>;
  reopen(id: string, reason: string): Promise<ReopenResult>;
  /** Live (not superseded) responses for these candidates. */
  liveResponses(candidateIds: string[]): Promise<QuestionnaireResponseRow[]>;
  events(candidateId: string): Promise<QuestionnaireEventRow[]>;
  logEvent(event: Omit<QuestionnaireEventRow, "at">): Promise<void>;
}

const CANDIDATES = "questionnaire_candidates";
const RESPONSES = "questionnaire_responses";
const EVENTS = "questionnaire_events";

const supabaseStore: QuestionnaireStore = {
  async findByTokenHash(hash) {
    const { data, error } = await getSupabase()
      .from(CANDIDATES)
      .select("*")
      .eq("token_hash", hash)
      .maybeSingle<QuestionnaireCandidateRow>();
    if (error) {
      console.error("[questionnaire-store] findByTokenHash error:", error);
      return null;
    }
    return data;
  },
  async getById(id) {
    const { data, error } = await getSupabase()
      .from(CANDIDATES)
      .select("*")
      .eq("id", id)
      .maybeSingle<QuestionnaireCandidateRow>();
    if (error) {
      console.error("[questionnaire-store] getById error:", error);
      return null;
    }
    return data;
  },
  async listAll(limit) {
    const { data, error } = await getSupabase()
      .from(CANDIDATES)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      console.error("[questionnaire-store] listAll error:", error);
      return [];
    }
    return (data ?? []) as QuestionnaireCandidateRow[];
  },
  async createInvite(invite) {
    const { data, error } = await getSupabase()
      .from(CANDIDATES)
      .insert({ ...invite, status: "pending" })
      .select("*")
      .single();
    if (error) {
      // 23505 = unique_violation: questionnaire_candidates_identity_idx.
      if (error.code === "23505") return null;
      throw error;
    }
    return data as QuestionnaireCandidateRow;
  },
  async expireStale(email) {
    const { error } = await getSupabase()
      .from(CANDIDATES)
      .update({ status: "expired" })
      .eq("email_identity", normalizeEmailIdentity(email))
      .in("status", ["pending", "opened"])
      .lte("expires_at", new Date().toISOString());
    if (error) console.error("[questionnaire-store] expireStale error:", error);
  },
  async updateIf(id, where, patch) {
    let query = getSupabase().from(CANDIDATES).update(patch).eq("id", id);
    for (const [key, value] of Object.entries(where)) {
      query = value === null ? query.is(key, null) : query.eq(key, value as never);
    }
    const { data, error } = await query.select("*").maybeSingle<QuestionnaireCandidateRow>();
    if (error) {
      console.error("[questionnaire-store] updateIf error:", error);
      return null;
    }
    return data;
  },
  async submit(tokenHash, answers, formVersion, userAgent) {
    const { data, error } = await getSupabase().rpc("submit_questionnaire", {
      p_token_hash: tokenHash,
      p_answers: answers,
      p_form_version: formVersion,
      p_user_agent: userAgent,
    });
    if (error) throw error;
    return data as SubmitResult;
  },
  async reopen(id, reason) {
    const { data, error } = await getSupabase().rpc("reopen_questionnaire", {
      p_candidate_id: id,
      p_reason: reason,
    });
    if (error) throw error;
    return data as ReopenResult;
  },
  async liveResponses(candidateIds) {
    if (candidateIds.length === 0) return [];
    const { data, error } = await getSupabase()
      .from(RESPONSES)
      .select("*")
      .in("candidate_id", candidateIds)
      .is("superseded_at", null);
    if (error) {
      console.error("[questionnaire-store] liveResponses error:", error);
      return [];
    }
    return (data ?? []) as QuestionnaireResponseRow[];
  },
  async events(candidateId) {
    const { data, error } = await getSupabase()
      .from(EVENTS)
      .select("candidate_id, action, actor, detail, at")
      .eq("candidate_id", candidateId)
      .order("at", { ascending: true });
    if (error) {
      console.error("[questionnaire-store] events error:", error);
      return [];
    }
    return (data ?? []) as QuestionnaireEventRow[];
  },
  async logEvent(event) {
    const { error } = await getSupabase().from(EVENTS).insert(event);
    if (error) console.error("[questionnaire-store] logEvent error:", error);
  },
};

// ---------------------------------------------------------------------------
// In-memory fallback - single Node process only, resets on every restart.

const memCandidates = new Map<string, QuestionnaireCandidateRow>();
const memResponses: QuestionnaireResponseRow[] = [];
const memEvents: QuestionnaireEventRow[] = [];

function isLive(row: QuestionnaireCandidateRow) {
  return row.status === "pending" || row.status === "opened" || row.status === "submitted";
}

function memLog(event: Omit<QuestionnaireEventRow, "at">) {
  memEvents.push({ ...event, at: new Date().toISOString() });
}

const inMemoryStore: QuestionnaireStore = {
  async findByTokenHash(hash) {
    for (const row of memCandidates.values()) if (row.token_hash === hash) return { ...row };
    return null;
  },
  async getById(id) {
    const row = memCandidates.get(id);
    return row ? { ...row } : null;
  },
  async listAll(limit) {
    return [...memCandidates.values()]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit)
      .map((r) => ({ ...r }));
  },
  async createInvite(invite) {
    const identity = normalizeEmailIdentity(invite.invited_email);
    for (const row of memCandidates.values()) {
      if (row.email_identity === identity && isLive(row)) return null;
    }
    const row: QuestionnaireCandidateRow = {
      id: randomUUID(),
      ...invite,
      email_identity: identity,
      status: "pending",
      candidate_name: null,
      candidate_phone: null,
      candidate_email: null,
      candidate_college: null,
      candidate_linkedin: null,
      profile_completed_at: null,
      draft: null,
      draft_updated_at: null,
      created_at: new Date().toISOString(),
      opened_at: null,
      submitted_at: null,
      revoked_at: null,
    };
    memCandidates.set(row.id, row);
    return { ...row };
  },
  async expireStale(email) {
    const identity = normalizeEmailIdentity(email);
    for (const row of memCandidates.values()) {
      if (
        row.email_identity === identity &&
        (row.status === "pending" || row.status === "opened") &&
        new Date(row.expires_at).getTime() <= Date.now()
      ) {
        row.status = "expired";
      }
    }
  },
  async updateIf(id, where, patch) {
    const row = memCandidates.get(id);
    if (!row) return null;
    for (const [key, value] of Object.entries(where)) {
      if (row[key as keyof QuestionnaireCandidateRow] !== value) return null;
    }
    Object.assign(row, patch);
    return { ...row };
  },
  async submit(tokenHash, answers, formVersion, userAgent) {
    const row = [...memCandidates.values()].find((r) => r.token_hash === tokenHash);
    if (!row) return "not_found";
    if (row.status === "submitted") return "already_submitted";
    if (row.status === "revoked") return "revoked";
    if (row.status === "expired" || new Date(row.expires_at).getTime() <= Date.now()) {
      return "expired";
    }
    if (!row.profile_completed_at) return "no_profile";
    if (memResponses.some((r) => r.candidate_id === row.id && !r.superseded_at)) {
      return "already_submitted";
    }
    const now = new Date().toISOString();
    memResponses.push({
      id: randomUUID(),
      candidate_id: row.id,
      answers,
      form_version: formVersion,
      user_agent: userAgent.slice(0, 300),
      submitted_at: now,
      superseded_at: null,
    });
    Object.assign(row, {
      status: "submitted",
      submitted_at: now,
      draft: null,
      draft_updated_at: null,
    });
    memLog({ candidate_id: row.id, action: "submitted", actor: "candidate", detail: null });
    return "ok";
  },
  async reopen(id, reason) {
    const row = memCandidates.get(id);
    if (!row) return "not_found";
    if (row.status !== "submitted") return "not_submitted";
    const live = memResponses.find((r) => r.candidate_id === id && !r.superseded_at);
    const now = new Date();
    if (live) live.superseded_at = now.toISOString();
    const weekOut = now.getTime() + 7 * 24 * 60 * 60 * 1000;
    Object.assign(row, {
      status: "opened",
      submitted_at: null,
      draft: { answers: live?.answers ?? {}, step: 0 },
      draft_updated_at: now.toISOString(),
      expires_at: new Date(Math.max(new Date(row.expires_at).getTime(), weekOut)).toISOString(),
    });
    memLog({ candidate_id: id, action: "reopened", actor: "admin", detail: reason.slice(0, 500) });
    return "ok";
  },
  async liveResponses(candidateIds) {
    const ids = new Set(candidateIds);
    return memResponses.filter((r) => ids.has(r.candidate_id) && !r.superseded_at);
  },
  async events(candidateId) {
    return memEvents.filter((e) => e.candidate_id === candidateId);
  },
  async logEvent(event) {
    memLog(event);
  },
};

let warnedOnce = false;

export function getQuestionnaireStore(): QuestionnaireStore {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return supabaseStore;
  }

  // Same reasoning as getMindsetStore(): on a serverless deploy, memory is
  // per-instance, so "one submission per candidate" would quietly stop being
  // true. Refuse rather than degrade.
  const deployed = process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview";
  if (deployed) {
    throw new Error(
      "[questionnaire-store] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not set on this " +
        "deployment. Refusing to run the questionnaire on the in-memory store. Set both in " +
        "the Vercel project's environment variables and redeploy.",
    );
  }

  if (!warnedOnce) {
    warnedOnce = true;
    console.warn(
      "[questionnaire-store] SUPABASE_URL is not configured - running the questionnaire on an " +
        "in-memory store (resets on every restart, local development only).",
    );
  }
  return inMemoryStore;
}
