import { getMindsetStore } from "@/lib/mindset/store";
import { createSessionToken, hashSessionToken } from "@/lib/assessment/session";
import { scoreMindsetAssessment } from "@/lib/mindset/scoring";
import { sendMindsetCandidateConfirmation, sendMindsetRecruiterReport } from "@/lib/mindset/report";
import { appendMindsetSheetRow } from "@/lib/mindset/sheet";
import { buildMindsetExam } from "@/lib/mindset/questions";
import {
  MINDSET_EXAM_DURATION_SECONDS,
  MINDSET_TOTAL_QUESTIONS,
  type MindsetAnswerMap,
  type MindsetAnswerValue,
  type MindsetAssessmentRow,
  type MindsetSubmitReason,
} from "@/lib/mindset/types";

// Orchestration for the self-serve, single-attempt mindset sitting. Every
// function here guards on status/current_index with atomic, WHERE-guarded
// updates (via getMindsetStore()'s updateIf) so a double-click, a retry, or
// two tabs on the same session can't corrupt state or grant extra time -
// same discipline as gads/service.ts.

/** ~30s of slack past the sitting's own deadline before an in-flight
 * advance/submit is treated as arriving too late to honor. */
const MINDSET_EXAM_GRACE_SECONDS = 30;

/** How many recent attempts to look at for an email for the "one attempt
 * ever" check - generous enough that a retried/duplicate insert can never
 * hide an existing terminal row. */
const DEDUP_LOOKBACK = 5;

export async function findMindsetByToken(token: string): Promise<MindsetAssessmentRow | null> {
  const hash = hashSessionToken(token);
  return getMindsetStore().findByTokenHash(hash);
}

function isPastGrace(row: Pick<MindsetAssessmentRow, "expires_at">): boolean {
  return Date.now() > new Date(row.expires_at).getTime() + MINDSET_EXAM_GRACE_SECONDS * 1000;
}

/** Resolves the one row by token and lazily applies any expiry that's
 * lapsed since it was last touched - an in-progress sitting whose window
 * lapsed gets finalized on the spot. No cron needed. */
export async function loadMindsetAssessment(token: string): Promise<MindsetAssessmentRow | null> {
  const row = await findMindsetByToken(token);
  if (!row) return null;

  if (row.status === "in_progress" && isPastGrace(row)) {
    try {
      await finalizeMindsetAssessment({ row, reason: "auto_expired" });
    } catch (err) {
      console.error("[mindset] lazy expiry finalize failed:", err);
    }
    const fresh = await findMindsetByToken(token);
    return fresh ?? row;
  }

  return row;
}

export interface BeginInput {
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  candidateCollege: string;
}

export type BeginResult =
  | { ok: true; token: string; row: MindsetAssessmentRow }
  | { ok: false; reason: "already_completed" | "in_progress_elsewhere" };

/**
 * Fresh start only - there is no resume-via-email, since the server never
 * re-exposes a raw token once issued (only its hash is stored). A refresh
 * on the same browser resumes by reading the token straight out of
 * localStorage and calling /api/mindset/state directly - see
 * assessment.mindset.tsx. This function enforces "one attempt ever":
 * a submitted/scored row for the email blocks permanently (no retake
 * window, stricter than the generic assessment's 30 days); an in-progress,
 * unexpired row blocks with a "go back to where you started it" message,
 * matching api.assessment.start.ts's behavior.
 */
export async function beginMindsetAssessment(input: BeginInput): Promise<BeginResult> {
  const email = input.candidateEmail.trim().toLowerCase();
  const prior = await getMindsetStore().findByEmail(email, DEDUP_LOOKBACK);

  for (const row of prior) {
    if (row.status === "submitted" || row.status === "scored" || row.status === "expired") {
      return { ok: false, reason: "already_completed" };
    }
    if (row.status !== "in_progress") continue;

    if (Date.now() < new Date(row.expires_at).getTime()) {
      return { ok: false, reason: "in_progress_elsewhere" };
    }

    // The clock ran out on an attempt nobody finished. Starting over would
    // hand them a second sitting having already read all 35 questions, which
    // is exactly what "one attempt" is supposed to prevent. Finalize what
    // they did answer instead, so the attempt is scored and reported like
    // any other, then refuse the retry. Without this an abandoned exam would
    // also never reach the recruiter at all: nothing else finalizes a row
    // whose candidate simply closed the tab.
    try {
      await finalizeMindsetAssessment({ row, reason: "auto_expired" });
    } catch (err) {
      console.error("[mindset] finalizing an abandoned attempt failed:", err);
    }
    return { ok: false, reason: "already_completed" };
  }

  const questions = buildMindsetExam();
  const { token, hash } = createSessionToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + MINDSET_EXAM_DURATION_SECONDS * 1000);

  const row = await getMindsetStore().insert({
    candidate_name: input.candidateName.trim(),
    candidate_email: email,
    candidate_phone: input.candidatePhone.trim(),
    candidate_college: input.candidateCollege.trim(),
    session_token_hash: hash,
    questions,
    answers: {},
    draft_answer: null,
    current_index: 0,
    current_question_started_at: now.toISOString(),
    violations: [],
    status: "in_progress",
    scores: null,
    per_question: null,
    overall_percent: null,
    submit_reason: null,
    candidate_confirmation_sent_at: null,
    recruiter_report_sent_at: null,
    created_at: now.toISOString(),
    started_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    submitted_at: null,
  });

  return { ok: true, token, row };
}

function isAnswerEmpty(value: MindsetAnswerValue | null | undefined): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  return false;
}

export type AdvanceResult =
  | { ok: true; currentIndex: number; currentQuestionStartedAt: string }
  | { ok: false; reason: "not_in_progress" }
  | { ok: false; reason: "stale_index"; currentIndex: number };

/**
 * Atomically commits the candidate's answer for `questionIndex` and moves
 * current_index forward by one. The updateIf `where` guard makes a
 * stale/replayed call a no-op instead of an overwrite, so once the server
 * has moved past a question nothing can commit an answer to it again.
 *
 * There is no per-question deadline any more, only the paper's own clock,
 * so nothing here can arrive "too late": an answer is honored right up
 * until the overall timer runs out and finalize claims the row.
 * current_question_started_at survives purely as a stopwatch, because how
 * long someone sat on "are you willing to relocate" is worth showing the
 * recruiter even though it no longer gates anything.
 */
export async function advanceMindsetQuestion(
  row: MindsetAssessmentRow,
  questionIndex: number,
  clientValue: MindsetAnswerValue | null,
): Promise<AdvanceResult> {
  if (row.status !== "in_progress") return { ok: false, reason: "not_in_progress" };
  if (questionIndex !== row.current_index) {
    return { ok: false, reason: "stale_index", currentIndex: row.current_index };
  }

  const question = row.questions[questionIndex];
  const startedAt = row.current_question_started_at
    ? new Date(row.current_question_started_at).getTime()
    : Date.now();
  const now = Date.now();
  const elapsedSeconds = Math.max(0, Math.round((now - startedAt) / 1000));
  const skipped = isAnswerEmpty(clientValue);

  const nextAnswers: MindsetAnswerMap = {
    ...row.answers,
    [String(question.id)]: { value: skipped ? null : clientValue, elapsedSeconds, skipped },
  };
  const nextIndex = questionIndex + 1;
  const nowIso = new Date(now).toISOString();

  const updated = await getMindsetStore().updateIf(
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
    const fresh = await getMindsetStore().getById(row.id);
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
  row: MindsetAssessmentRow;
  reason: MindsetSubmitReason;
}
export type FinalizeResult = { ok: true } | { ok: false; alreadyDone: true };

/**
 * Terminal finalize: natural completion after the last question, or forced
 * by overall-timer expiry / the (strict, 1-warning) violation ladder at any
 * index. Any question(s) never reached get backfilled as skipped so the
 * per-question report always has a row for all 64.
 */
export async function finalizeMindsetAssessment({
  row,
  reason,
}: FinalizeInput): Promise<FinalizeResult> {
  if (row.status !== "in_progress") return { ok: false, alreadyDone: true };

  const finalAnswers: MindsetAnswerMap = { ...row.answers };
  if (row.current_index < row.questions.length) {
    const current = row.questions[row.current_index];
    const startedAt = row.current_question_started_at
      ? new Date(row.current_question_started_at).getTime()
      : Date.now();
    const elapsedSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
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
  const store = getMindsetStore();
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

  const { scores, perQuestion } = scoreMindsetAssessment(row.questions, finalAnswers);

  // Capped at the paper's own deadline so a sitting that lapsed overnight
  // before lazy expiry caught it reports 15 minutes, not 9 hours.
  const startedMs = new Date(row.started_at).getTime();
  const cappedEnd = Math.min(submittedAt.getTime(), new Date(row.expires_at).getTime());
  const timeTakenSeconds = Math.max(0, Math.round((cappedEnd - startedMs) / 1000));

  await store.updateIf(
    row.id,
    {},
    {
      status: "scored",
      scores,
      per_question: perQuestion,
      overall_percent: scores.overallPercent,
      time_taken_seconds: timeTakenSeconds,
    },
  );

  const finalRow: MindsetAssessmentRow = {
    ...row,
    answers: finalAnswers,
    submit_reason: reason,
    submitted_at: submittedAt.toISOString(),
    time_taken_seconds: timeTakenSeconds,
  };

  const confirmationSent = await sendMindsetCandidateConfirmation(finalRow);
  if (confirmationSent) {
    await store.updateIf(row.id, {}, { candidate_confirmation_sent_at: new Date().toISOString() });
  }

  const reportSent = await sendMindsetRecruiterReport(finalRow, scores, perQuestion, reason);
  if (reportSent) {
    await store.updateIf(row.id, {}, { recruiter_report_sent_at: new Date().toISOString() });
  }

  // Best effort, never blocks or throws: the answers are already durably
  // saved and both emails have gone by this point. Mirrors how the contact
  // form treats its ClickUp push.
  await appendMindsetSheetRow(finalRow, scores, perQuestion, reason, timeTakenSeconds);

  return { ok: true };
}

/** The client accumulates violations in its own state (same convention as
 * useGadsExamGuard) and sends the full array on every debounced save - this
 * cap is the server-side backstop against a runaway or malicious client
 * bloating the row. */
export const MINDSET_MAX_VIOLATIONS = 500;

export { MINDSET_TOTAL_QUESTIONS };
