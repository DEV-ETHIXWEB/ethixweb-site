// Shared types for the standalone Google Ads assessment. Same security
// posture as assessment-types.ts: the full GadsQuestion (with
// correctAnswers/explanation/evaluationCriteria) exists only server-side and
// in the database. sanitizeGadsQuestion() is the single choke point between
// that and what the browser is allowed to see, so the answer key can never
// leak through a new endpoint by accident. Independent from
// assessment-types.ts on purpose - this is a different exam with different
// mechanics (forced per-question timers, no back navigation), not a mode of
// the generic platform.

export type GadsMechanic = "single" | "multiple" | "scenario" | "written";
export type GadsDifficulty = "Easy" | "Medium" | "Hard";

/** These addresses can retake the exam an unlimited number of times for
 * testing - a submitted/scored row for one of them is reset back to a fresh
 * attempt on the next /api/gads/begin instead of being rejected as
 * already-completed. Every other candidate gets exactly one attempt. */
export const GADS_UNLIMITED_TEST_EMAILS: ReadonlySet<string> = new Set(["akash@ethixweb.com"]);

export function isUnlimitedTestEmail(email: string): boolean {
  return GADS_UNLIMITED_TEST_EMAILS.has(email.trim().toLowerCase());
}

/** Seconds allotted per mechanic - fixed, not authored per-question, so
 * timing can never drift between two questions of the same type. */
export const GADS_TIME_LIMITS: Record<GadsMechanic, number> = {
  single: 30,
  multiple: 30,
  scenario: 60,
  written: 240,
};

/** Exact composition of the one fixed exam. 12+8+16+4 = 40. */
export const GADS_QUESTION_COUNTS: Record<GadsMechanic, number> = {
  single: 12,
  multiple: 8,
  scenario: 16,
  written: 4,
};

export const GADS_TOTAL_QUESTIONS = Object.values(GADS_QUESTION_COUNTS).reduce((a, b) => a + b, 0);

/** Sum of every question's max timer - the true ceiling if every timer runs
 * out (nobody manually advances). 12*30 + 8*30 + 16*60 + 4*240 = 2520s. */
const GADS_TIMER_CEILING_SECONDS = (Object.keys(GADS_TIME_LIMITS) as GadsMechanic[]).reduce(
  (sum, m) => sum + GADS_TIME_LIMITS[m] * GADS_QUESTION_COUNTS[m],
  0,
);

/** Small per-question overhead allowance (network latency on the advance
 * call, render time) so a fully-compliant candidate who uses every second of
 * every timer is never cut off by the overall clock racing the per-question
 * one. Not meant to be usable as extra thinking time - see
 * GADS_QUESTION_GRACE_SECONDS below for that boundary instead. */
const GADS_OVERALL_BUFFER_SECONDS = 120;

/** The always-visible overall countdown. Realistic completion is ~35-40 min
 * (most MCQs get answered well under 30s); this is the hard ceiling. */
export const GADS_EXAM_DURATION_SECONDS = GADS_TIMER_CEILING_SECONDS + GADS_OVERALL_BUFFER_SECONDS;

/** Server-side slack past a question's own deadline before an advance is
 * treated as "arrived too late" (elapsed capped, marked skipped) rather than
 * honored - covers network latency on the timer-driven auto-advance, not
 * extra thinking time. Mirrors EXAM_GRACE_SECONDS in assessment-types.ts. */
export const GADS_QUESTION_GRACE_SECONDS = 5;

/** How long an unstarted invite link stays valid before /begin refuses it,
 * independent of the exam's own countdown once started. */
export const GADS_OVERALL_WARNING_MINUTES = [10, 5, 1] as const;

export const GADS_WRITTEN_WORD_TARGET = { min: 50, max: 150 } as const;

export interface GadsQuestion {
  id: number;
  mechanic: GadsMechanic;
  /** One of the spec's topic list (Search Campaigns, PMax, Quality Score, ...) - informational grouping only, not separately scored. */
  topic: string;
  difficulty: GadsDifficulty;
  question: string;
  /** Zero-based option list. Empty for "written". */
  options: string[];
  /** Zero-based indices into options. Empty for "written". */
  correctAnswers: number[];
  /** Reviewer-only note on why the correct answer is correct. Never sent to the browser. */
  explanation: string;
  /** "written" only: 3-5 concrete points a strong answer covers. */
  evaluationCriteria: string[];
}

/** What the browser receives - no answer key, no explanation, no difficulty. */
export interface GadsCandidateQuestion {
  id: number;
  mechanic: GadsMechanic;
  topic: string;
  question: string;
  options: string[];
}

export function sanitizeGadsQuestion(q: GadsQuestion): GadsCandidateQuestion {
  return {
    id: q.id,
    mechanic: q.mechanic,
    topic: q.topic,
    question: q.question,
    options: q.options,
  };
}

/** single -> option index; multiple -> option indices; written -> free text. */
export type GadsAnswerValue = number | number[] | string;

export interface GadsAnswerEntry {
  value: GadsAnswerValue | null;
  elapsedSeconds: number;
  skipped: boolean;
}

/** Keyed by String(question.id). Only ever contains COMMITTED (timed-out or
 * manually-advanced-past) answers - the in-flight pick lives in
 * draft_answer instead, see gads-service.ts. */
export type GadsAnswerMap = Record<string, GadsAnswerEntry>;

export type GadsViolationType =
  | "fullscreen_exit"
  | "tab_hidden"
  | "window_blur"
  | "devtools_suspected"
  | "copy_attempt"
  | "paste_attempt"
  | "cut_attempt"
  | "select_all_attempt"
  | "context_menu"
  | "shortcut_blocked"
  | "print_screen_suspected"
  | "network_offline"
  | "network_online"
  | "window_resize"
  | "refresh_attempt"
  | "multi_monitor_detected"
  | "multi_monitor_unsupported";

/** Violations that count toward the warning ladder / auto-submit. */
export const GADS_MAJOR_VIOLATIONS: ReadonlySet<GadsViolationType> = new Set([
  "fullscreen_exit",
  "tab_hidden",
  "window_blur",
  "devtools_suspected",
  "refresh_attempt",
]);

export const GADS_MAX_MAJOR_VIOLATIONS = 3;

export interface GadsViolation {
  type: GadsViolationType;
  /** ISO timestamp, client clock - indicative, not forensic. */
  at: string;
  detail?: string;
}

export const GADS_VIOLATION_LABELS: Record<GadsViolationType, string> = {
  fullscreen_exit: "Exited fullscreen",
  tab_hidden: "Switched tab / minimized window",
  window_blur: "Window lost focus",
  devtools_suspected: "Developer tools suspected",
  copy_attempt: "Copy attempt",
  paste_attempt: "Paste attempt",
  cut_attempt: "Cut attempt",
  select_all_attempt: "Select-all attempt",
  context_menu: "Right-click attempt",
  shortcut_blocked: "Blocked keyboard shortcut",
  print_screen_suspected: "Print Screen suspected",
  network_offline: "Network disconnected",
  network_online: "Network reconnected",
  window_resize: "Browser window resized",
  refresh_attempt: "Page refresh attempted",
  multi_monitor_detected: "Multiple monitors detected",
  multi_monitor_unsupported: "Multiple-monitor check unsupported by browser",
};

export interface GadsMicSample {
  at: string;
  /** 0-1 RMS level, coarse - a signal, not a recording. */
  level: number;
  active: boolean;
}

export interface GadsCameraSnapshot {
  url: string;
  at: string;
}

export type GadsQuestionOutcome = "correct" | "partial" | "incorrect" | "unanswered" | "review";

export interface GadsPerQuestionResult {
  questionId: number;
  mechanic: GadsMechanic;
  topic: string;
  difficulty: GadsDifficulty;
  elapsedSeconds: number;
  skipped: boolean;
  earned: number;
  max: number;
  outcome: GadsQuestionOutcome;
}

export interface GadsSectionScore {
  earned: number;
  max: number;
  /** 0-100, or null when the section had no scoreable questions. */
  percent: number | null;
}

export interface GadsScores {
  bySection: Record<GadsMechanic, GadsSectionScore>;
  overallPercent: number;
}

export type GadsStatus = "pending" | "in_progress" | "submitted" | "scored" | "expired";
export type GadsSubmitReason = "manual" | "timer" | "violations" | "auto_expired";
export type GadsRecommendation =
  "highly_recommended" | "recommended" | "borderline" | "not_recommended";

export const GADS_RECOMMENDATION_LABELS: Record<GadsRecommendation, string> = {
  highly_recommended: "Highly Recommended",
  recommended: "Recommended",
  borderline: "Borderline",
  not_recommended: "Not Recommended",
};

export interface GadsAssessmentRow {
  id: string;
  candidate_name: string;
  candidate_email: string;
  session_token_hash: string;
  link_expires_at: string;
  questions: GadsQuestion[] | null;
  answers: GadsAnswerMap;
  draft_answer: GadsAnswerValue | null;
  current_index: number;
  current_question_started_at: string | null;
  violations: GadsViolation[];
  mic_activity: GadsMicSample[];
  camera_snapshots: GadsCameraSnapshot[];
  recording_urls: string[];
  status: GadsStatus;
  scores: GadsScores | null;
  per_question: GadsPerQuestionResult[] | null;
  overall_percent: number | null;
  recommendation: GadsRecommendation | null;
  suspicious_activity_score: number | null;
  time_taken_seconds: number | null;
  submit_reason: GadsSubmitReason | null;
  candidate_confirmation_sent_at: string | null;
  recruiter_report_sent_at: string | null;
  created_at: string;
  started_at: string | null;
  expires_at: string | null;
  submitted_at: string | null;
}
