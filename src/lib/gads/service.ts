import { getGadsStore } from "@/lib/gads/store";
import { hashSessionToken } from "@/lib/assessment/session";
import { scoreGadsAssessment, recommendGads } from "@/lib/gads/scoring";
import { sendGadsCandidateConfirmation, sendGadsRecruiterReport } from "@/lib/gads/report";
import {
  GADS_MAX_RESUMES,
  GADS_QUESTION_GRACE_SECONDS,
  GADS_TIME_LIMITS,
  isUnlimitedTestEmail,
  type GadsAnswerMap,
  type GadsAnswerValue,
  type GadsAssessmentRow,
  type GadsSubmitReason,
} from "@/lib/gads/types";

// Orchestration for the standalone, single-candidate, single-use exam.
// Every function here still guards on status/current_index with atomic,
// WHERE-guarded updates (via getGadsStore()'s updateIf) so a double-click, a
// retry, or two tabs open on the same link can't corrupt state or grant
// extra time - the same discipline assessment-service.ts uses for the
// generic platform (see isPastGrace / finalizeAssessment there). The store
// itself may be Supabase or an in-memory fallback (see gads-store.ts) -
// this file doesn't know or care which.

/** ~30s of slack past the exam's own deadline before an in-flight
 * advance/submit is treated as arriving too late to honor - covers network
 * latency on the very last call, not extra thinking time. */
const GADS_EXAM_GRACE_SECONDS = 30;

export async function findGadsByToken(token: string): Promise<GadsAssessmentRow | null> {
  const hash = hashSessionToken(token);
  return getGadsStore().findByTokenHash(hash);
}

function isLinkExpired(row: Pick<GadsAssessmentRow, "link_expires_at">): boolean {
  return Date.now() > new Date(row.link_expires_at).getTime();
}

function isExamPastGrace(row: Pick<GadsAssessmentRow, "expires_at">): boolean {
  if (!row.expires_at) return false;
  return Date.now() > new Date(row.expires_at).getTime() + GADS_EXAM_GRACE_SECONDS * 1000;
}

/** Resolves the one row by token and lazily applies any expiry that's
 * lapsed since it was last touched - an unopened invite past midnight
 * becomes 'expired', an in-progress exam whose window lapsed gets
 * finalized on the spot. No cron needed, same pattern as loadAssessment(). */
export async function loadGadsAssessment(token: string): Promise<GadsAssessmentRow | null> {
  const row = await findGadsByToken(token);
  if (!row) return null;

  if (row.status === "pending" && isLinkExpired(row)) {
    const updated = await getGadsStore().updateIf(
      row.id,
      { status: "pending" },
      { status: "expired" },
    );
    return updated ?? { ...row, status: "expired" };
  }

  if (row.status === "in_progress" && isExamPastGrace(row)) {
    try {
      await finalizeGadsAssessment({ row, reason: "auto_expired" });
    } catch (err) {
      console.error("[gads] lazy expiry finalize failed:", err);
    }
    const fresh = await findGadsByToken(token);
    return fresh ?? row;
  }

  return row;
}

/**
 * GADS_UNLIMITED_TEST_EMAILS (see gads-types.ts) can retake the exam
 * indefinitely: a submitted/scored row for one of those addresses is wiped
 * back to a fresh 'pending' attempt here, called from /api/gads/begin
 * before the normal pending -> in_progress transition. Every other
 * candidate's row is left untouched once it reaches a terminal status - it
 * stays locked, which is the whole point of the single-use link.
 */
export async function resetGadsRowForRetest(
  row: GadsAssessmentRow,
): Promise<GadsAssessmentRow | null> {
  if (!isUnlimitedTestEmail(row.candidate_email)) return row;
  if (row.status !== "submitted" && row.status !== "scored") return row;

  return getGadsStore().updateIf(
    row.id,
    {},
    {
      status: "pending",
      questions: null,
      answers: {},
      draft_answer: null,
      current_index: 0,
      current_question_started_at: null,
      violations: [],
      mic_activity: [],
      camera_snapshots: [],
      recording_urls: [],
      scores: null,
      per_question: null,
      overall_percent: null,
      recommendation: null,
      suspicious_activity_score: null,
      time_taken_seconds: null,
      submit_reason: null,
      candidate_confirmation_sent_at: null,
      recruiter_report_sent_at: null,
      started_at: null,
      expires_at: null,
      submitted_at: null,
    },
  );
}

/** The blank slate a row returns to, shared by the test-email retest path
 * and the admin reset. Keeps the two from drifting apart and leaving stale
 * scores or recordings attached to a fresh attempt. */
const GADS_RESET_PATCH: Partial<GadsAssessmentRow> = {
  status: "pending",
  questions: null,
  answers: {},
  draft_answer: null,
  current_index: 0,
  current_question_started_at: null,
  resume_count: 0,
  violations: [],
  mic_activity: [],
  camera_snapshots: [],
  recording_urls: [],
  scores: null,
  per_question: null,
  overall_percent: null,
  recommendation: null,
  suspicious_activity_score: null,
  time_taken_seconds: null,
  submit_reason: null,
  candidate_confirmation_sent_at: null,
  recruiter_report_sent_at: null,
  started_at: null,
  expires_at: null,
  submitted_at: null,
};

/** Counts one reopen of an already in-progress run and reports whether the
 * candidate has any left. Never throws and never blocks the resume itself -
 * if the write fails the candidate still gets back into their exam, because
 * losing their run to a bookkeeping error would be far worse than an
 * undercounted reopen. */
export async function registerGadsResume(
  row: GadsAssessmentRow,
): Promise<{ resumeCount: number; limitReached: boolean }> {
  const next = (row.resume_count ?? 0) + 1;
  try {
    await getGadsStore().updateIf(row.id, { status: "in_progress" }, { resume_count: next });
  } catch (err) {
    console.error("[gads] resume_count update failed:", err);
  }
  return { resumeCount: next, limitReached: next > GADS_MAX_RESUMES };
}

/** Admin override: puts a row back to pending so the same candidate can sit
 * the exam again on the same link, name and email. Unlike
 * resetGadsRowForRetest this is not limited to the test address and works
 * from any status, so the caller MUST have checked the admin password
 * first - see /api/gads/admin. */
export async function adminResetGadsRow(row: GadsAssessmentRow): Promise<GadsAssessmentRow | null> {
  return getGadsStore().updateIf(row.id, {}, { ...GADS_RESET_PATCH });
}

function isAnswerEmpty(value: GadsAnswerValue | null | undefined): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export type AdvanceResult =
  | { ok: true; currentIndex: number; currentQuestionStartedAt: string }
  | { ok: false; reason: "not_in_progress" }
  | { ok: false; reason: "stale_index"; currentIndex: number };

/**
 * Atomically commits the candidate's answer for `questionIndex` (the
 * server's own clock decides elapsed time and lateness, never the client's)
 * and moves current_index forward by one. The updateIf `where` guard makes
 * a stale/replayed call a no-op instead of an overwrite - once the server
 * has moved past a question, nothing can commit an answer to it again,
 * closing the "no going back" requirement against a scripted client, not
 * just an honest browser.
 */
export async function advanceGadsQuestion(
  row: GadsAssessmentRow,
  questionIndex: number,
  clientValue: GadsAnswerValue | null,
): Promise<AdvanceResult> {
  if (row.status !== "in_progress" || !row.questions)
    return { ok: false, reason: "not_in_progress" };
  if (questionIndex !== row.current_index) {
    return { ok: false, reason: "stale_index", currentIndex: row.current_index };
  }

  const question = row.questions[questionIndex];
  const limit = GADS_TIME_LIMITS[question.mechanic];
  const startedAt = row.current_question_started_at
    ? new Date(row.current_question_started_at).getTime()
    : Date.now();
  const now = Date.now();
  const rawElapsed = Math.max(0, Math.round((now - startedAt) / 1000));
  const pastGrace = rawElapsed > limit + GADS_QUESTION_GRACE_SECONDS;
  const elapsedSeconds = Math.min(rawElapsed, limit);
  const value = pastGrace ? null : clientValue;
  const skipped = isAnswerEmpty(value);

  const nextAnswers: GadsAnswerMap = {
    ...row.answers,
    [String(question.id)]: { value: skipped ? null : value, elapsedSeconds, skipped },
  };
  const nextIndex = questionIndex + 1;
  const nowIso = new Date(now).toISOString();

  const updated = await getGadsStore().updateIf(
    row.id,
    { status: "in_progress", current_index: questionIndex },
    {
      answers: nextAnswers,
      current_index: nextIndex,
      current_question_started_at: nowIso,
      draft_answer: null,
    },
  );

  if (!updated) {
    const fresh = await getGadsStore().getById(row.id);
    return {
      ok: false,
      reason: "stale_index",
      currentIndex: fresh?.current_index ?? row.current_index,
    };
  }
  return {
    ok: true,
    currentIndex: updated.current_index,
    currentQuestionStartedAt: updated.current_question_started_at ?? nowIso,
  };
}

export interface FinalizeInput {
  row: GadsAssessmentRow;
  reason: GadsSubmitReason;
}
export type FinalizeResult = { ok: true } | { ok: false; alreadyDone: true };

/**
 * Terminal finalize: natural completion after the last question, or forced
 * by overall-timer expiry / the violation ladder at any index. Any
 * question(s) never reached get backfilled as skipped so the per-question
 * report always has a row for all 40 - the direct analog of how the
 * generic platform's isPastGrace treats whatever wasn't auto-saved as
 * simply unanswered. The atomic status claim makes a timer-fire, a
 * violation-fire, and a manual click all resolve to exactly one finalize.
 */
export async function finalizeGadsAssessment({
  row,
  reason,
}: FinalizeInput): Promise<FinalizeResult> {
  if (row.status !== "in_progress" || !row.questions) return { ok: false, alreadyDone: true };

  const finalAnswers: GadsAnswerMap = { ...row.answers };
  if (row.current_index < row.questions.length) {
    const current = row.questions[row.current_index];
    const limit = GADS_TIME_LIMITS[current.mechanic];
    const startedAt = row.current_question_started_at
      ? new Date(row.current_question_started_at).getTime()
      : Date.now();
    const elapsedSeconds = Math.min(
      limit,
      Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
    );
    const draftSkipped = isAnswerEmpty(row.draft_answer);
    finalAnswers[String(current.id)] = {
      value: draftSkipped ? null : row.draft_answer,
      elapsedSeconds,
      skipped: draftSkipped,
    };
    for (let i = row.current_index + 1; i < row.questions.length; i++) {
      finalAnswers[String(row.questions[i].id)] = { value: null, elapsedSeconds: 0, skipped: true };
    }
  }

  const submittedAt = new Date();
  const store = getGadsStore();
  const claimed = await store.updateIf(
    row.id,
    { status: "in_progress" },
    {
      status: "submitted",
      answers: finalAnswers,
      draft_answer: null,
      submit_reason: reason,
      submitted_at: submittedAt.toISOString(),
    },
  );

  if (!claimed) return { ok: false, alreadyDone: true };

  const { scores, perQuestion } = scoreGadsAssessment(row.questions, finalAnswers);
  const { suspiciousActivityScore, recommendation } = recommendGads(
    scores.overallPercent,
    row.violations,
  );

  const startedMs = row.started_at ? new Date(row.started_at).getTime() : submittedAt.getTime();
  const cappedEnd = row.expires_at
    ? Math.min(submittedAt.getTime(), new Date(row.expires_at).getTime())
    : submittedAt.getTime();
  const timeTakenSeconds = Math.max(0, Math.round((cappedEnd - startedMs) / 1000));

  await store.updateIf(
    row.id,
    {},
    {
      status: "scored",
      scores,
      per_question: perQuestion,
      overall_percent: scores.overallPercent,
      recommendation,
      suspicious_activity_score: suspiciousActivityScore,
      time_taken_seconds: timeTakenSeconds,
    },
  );

  const finalRow: GadsAssessmentRow = { ...row, answers: finalAnswers, submit_reason: reason };

  const confirmationSent = await sendGadsCandidateConfirmation(finalRow);
  if (confirmationSent) {
    await store.updateIf(row.id, {}, { candidate_confirmation_sent_at: new Date().toISOString() });
  }

  const reportSent = await sendGadsRecruiterReport(
    finalRow,
    scores,
    perQuestion,
    recommendation,
    suspiciousActivityScore,
    reason,
    timeTakenSeconds,
  );
  if (reportSent) {
    await store.updateIf(row.id, {}, { recruiter_report_sent_at: new Date().toISOString() });
  }

  return { ok: true };
}

/** The client accumulates violations/mic-activity/camera-snapshots in its
 * own state (same convention as useExamGuard) and sends the full array on
 * every debounced save - these caps are the server-side backstop against a
 * runaway or malicious client bloating the row. */
export const GADS_MAX_VIOLATIONS = 500;
export const GADS_MAX_MIC_SAMPLES = 600;
export const GADS_MAX_CAMERA_SNAPSHOTS = 60;
