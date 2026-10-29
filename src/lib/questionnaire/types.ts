import { z } from "zod";
import {
  FIELD_LIMITS,
  cleanField,
  cleanMultiline,
  isValidEmail,
  isValidPhone,
  normalizeWebsiteUrl,
} from "@/lib/utils";
import { OTHER_MAX_LENGTH, QUESTIONS, isAsked, type OptionId } from "./questions";

export type InviteStatus = "pending" | "opened" | "submitted" | "expired" | "revoked";

export interface AnswerValue {
  choice: OptionId;
  /** Only present (and required) when choice is "other". */
  other?: string;
}

export type AnswerMap = Partial<Record<string, AnswerValue>>;

export interface DraftState {
  answers: AnswerMap;
  /** Index into the client's step list. Advisory only; clamped on load. */
  step: number;
}

export interface CandidateProfile {
  name: string;
  phone: string;
  email: string;
  college: string;
  linkedin: string | null;
}

export interface QuestionnaireCandidateRow {
  id: string;
  invited_name: string;
  invited_email: string;
  email_identity: string;
  token_hash: string;
  status: InviteStatus;
  candidate_name: string | null;
  candidate_phone: string | null;
  candidate_email: string | null;
  candidate_college: string | null;
  candidate_linkedin: string | null;
  profile_completed_at: string | null;
  draft: DraftState | null;
  draft_updated_at: string | null;
  created_at: string;
  expires_at: string;
  opened_at: string | null;
  submitted_at: string | null;
  revoked_at: string | null;
}

export interface QuestionnaireResponseRow {
  id: string;
  candidate_id: string;
  answers: AnswerMap;
  form_version: number;
  user_agent: string | null;
  submitted_at: string;
  superseded_at: string | null;
}

export interface QuestionnaireEventRow {
  candidate_id: string;
  action: string;
  actor: "candidate" | "admin" | "system";
  detail: string | null;
  at: string;
}

export const TOKEN_SCHEMA = z
  .string()
  .length(64)
  .regex(/^[0-9a-f]{64}$/);

const answerSchema = z.object({
  choice: z.enum(["a", "b", "c", "d", "other"]),
  other: z
    .string()
    .max(OTHER_MAX_LENGTH * 2)
    .optional(),
});

const answerMapShape = Object.fromEntries(QUESTIONS.map((q) => [q.id, answerSchema.optional()]));

/** A draft can be partial: anything not yet answered is simply absent. */
export const draftSchema = z.object({
  answers: z.object(answerMapShape).strict(),
  step: z.number().int().min(0).max(50),
});

/**
 * Cleans one answer off the wire. A non-"other" choice drops any stray text
 * so a crafted request can't smuggle a note onto option B; an "other" choice
 * keeps its text with control characters stripped and the length capped.
 */
function cleanAnswer(value: AnswerValue): AnswerValue {
  if (value.choice !== "other") return { choice: value.choice };
  return { choice: "other", other: cleanMultiline(value.other ?? "", OTHER_MAX_LENGTH) };
}

export function cleanAnswerMap(answers: AnswerMap): AnswerMap {
  const out: AnswerMap = {};
  for (const q of QUESTIONS) {
    const value = answers[q.id];
    if (value) out[q.id] = cleanAnswer(value);
  }
  return out;
}

/**
 * Full submission check: every question that applies is answered, and every
 * "other" carries text. A follow-up that doesn't apply (q13_meet when the
 * pay question wasn't a yes) is dropped rather than stored, so a stale
 * answer from before the candidate changed their mind can't survive.
 * Returns the cleaned map, or the first problem in question order so the
 * client can send the candidate straight to it.
 */
export function validateSubmission(
  raw: unknown,
): { ok: true; answers: AnswerMap } | { ok: false; questionId: string; error: string } {
  const parsed = z.object(answerMapShape).strict().safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      questionId: QUESTIONS[0].id,
      error: "Answers were not in the right shape.",
    };
  }
  const answers = cleanAnswerMap(parsed.data as AnswerMap);
  for (const q of QUESTIONS) {
    if (!isAsked(q, answers)) {
      delete answers[q.id];
      continue;
    }
    const value = answers[q.id];
    if (!value) {
      return { ok: false, questionId: q.id, error: `Question ${q.label} needs an answer.` };
    }
    if (value.choice === "other" && !value.other) {
      return {
        ok: false,
        questionId: q.id,
        error: `Question ${q.label}: please tell us your answer in the text box.`,
      };
    }
  }
  return { ok: true, answers };
}

export const PROFILE_LIMITS = {
  name: FIELD_LIMITS.name,
  phone: FIELD_LIMITS.phone,
  email: FIELD_LIMITS.email,
  college: 160,
  linkedin: 200,
} as const;

/** LinkedIn is optional, but if it's given it has to be a LinkedIn URL. People
 * paste it every way ("linkedin.com/in/x", "www.linkedin.com/in/x/", full
 * https), so normalize first and then check the host. */
export function normalizeLinkedIn(raw: string): string | null {
  const url = normalizeWebsiteUrl(raw);
  if (!url) return null;
  const host = new URL(url).hostname.toLowerCase();
  if (host !== "linkedin.com" && !host.endsWith(".linkedin.com")) return null;
  return url;
}

export function validateProfile(
  raw: unknown,
): { ok: true; profile: CandidateProfile } | { ok: false; field: string; error: string } {
  const body = (raw ?? {}) as Record<string, unknown>;
  const name = cleanField(body.name, PROFILE_LIMITS.name);
  const phone = cleanField(body.phone, PROFILE_LIMITS.phone);
  const email = cleanField(body.email, PROFILE_LIMITS.email).toLowerCase();
  const college = cleanField(body.college, PROFILE_LIMITS.college);
  const linkedinRaw = cleanField(body.linkedin, PROFILE_LIMITS.linkedin);

  if (name.length < 2) return { ok: false, field: "name", error: "Please enter your full name." };
  if (!isValidPhone(phone)) {
    return { ok: false, field: "phone", error: "Please enter a valid phone number." };
  }
  if (!isValidEmail(email)) {
    return { ok: false, field: "email", error: "Please enter a valid email address." };
  }
  if (college.length < 2) {
    return { ok: false, field: "college", error: "Please enter your college name." };
  }
  let linkedin: string | null = null;
  if (linkedinRaw) {
    linkedin = normalizeLinkedIn(linkedinRaw);
    if (!linkedin) {
      return {
        ok: false,
        field: "linkedin",
        error: "That doesn't look like a LinkedIn profile link. Leave it blank if you'd rather.",
      };
    }
  }
  return { ok: true, profile: { name, phone, email, college, linkedin } };
}

/** pending/opened past their deadline read as expired everywhere, without a
 * cron job having to sweep them. */
export function effectiveStatus(
  row: Pick<QuestionnaireCandidateRow, "status" | "expires_at">,
): InviteStatus {
  if (
    (row.status === "pending" || row.status === "opened") &&
    new Date(row.expires_at).getTime() <= Date.now()
  ) {
    return "expired";
  }
  return row.status;
}
