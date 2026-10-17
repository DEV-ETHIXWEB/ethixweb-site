// Shared types for the mindset & situational-judgment screener. Same
// security posture as gads/types.ts: the full MindsetQuestion (with
// `weights`, the hidden fit-signal key) exists only server-side and in the
// database. sanitizeMindsetQuestion() is the single choke point between
// that and what the browser is allowed to see.
//
// Unlike gads and the generic assessment, there is no "correct" answer here
// - every option carries a 0-3 fit-signal weight instead of a right/wrong
// key, since a personality/situational screener scores fit signals, not
// correctness. See src/lib/mindset/scoring.ts.

export type MindsetMechanic = "likert" | "mcq" | "situational" | "written";

/** One clock for the whole paper, 15 minutes, and no per-question timers.
 * The candidate controls their own pace; the only deadline is this one.
 * Realistic completion is around 12 minutes (see MindsetGate's structure
 * table for the per-section budget that number comes from), so the window
 * is deliberately tight rather than cruel. */
export const MINDSET_EXAM_DURATION_SECONDS = 15 * 60;

/** Exact composition of the one fixed sitting. Sections run fastest first:
 * 15 quick agreement statements, then 10 direct questions, then 10 longer
 * situations. At a realistic pace that is around 10 minutes of the 15. */
export const MINDSET_QUESTION_COUNTS: Record<MindsetMechanic, number> = {
  likert: 13,
  mcq: 10,
  situational: 10,
  written: 2,
};

export const MINDSET_TOTAL_QUESTIONS = Object.values(MINDSET_QUESTION_COUNTS).reduce(
  (a, b) => a + b,
  0,
);

/** The five points of the agreement scale, in order. A likert question's
 * `weights` array is always this long, and which end scores well depends on
 * how the statement is phrased - see questions/likert.ts. */
export const LIKERT_LABELS = [
  "Strongly disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly agree",
] as const;

export const LIKERT_POINTS = LIKERT_LABELS.length;

/** Full question as authored + stored. NEVER send this shape to the client. */
export interface MindsetQuestion {
  id: number;
  mechanic: MindsetMechanic;
  /** Grouping used for the per-category score breakdown and the recruiter
   * report - one of the ten trait categories, a situational sub-topic, or
   * "written". */
  category: string;
  question: string;
  /** One short line under the question, in plainer words than the question
   * itself: a concrete example, or the situation restated. Candidates are
   * answering against a clock in what is often their second language, so a
   * question they have to read twice costs them real time. Not secret, it
   * goes to the browser with the question. */
  hint: string;
  /** Zero-based option list. Empty for "likert" (the scale supplies its own
   * labels) and for "written". */
  options: string[];
  /** Each choice's fit-signal weight, best choice highest. Parallel to
   * `options` for "situational", and to LIKERT_LABELS for "likert", where a
   * reverse-scored statement simply runs high to low. Empty for "written".
   * A question's maximum is the largest weight in its own array, so the two
   * mechanics can use different scales without a shared constant to keep in
   * sync. Never sent to the browser. */
  weights: number[];
}

/** What the browser receives - no weights, no scoring key. */
export interface MindsetCandidateQuestion {
  id: number;
  mechanic: MindsetMechanic;
  category: string;
  question: string;
  hint: string;
  options: string[];
}

export function sanitizeMindsetQuestion(q: MindsetQuestion): MindsetCandidateQuestion {
  return {
    id: q.id,
    mechanic: q.mechanic,
    category: q.category,
    question: q.question,
    hint: q.hint,
    options: q.options,
  };
}

/** likert -> scale point index (0 to 4); situational -> option index;
 * written -> free text. */
export type MindsetAnswerValue = number | string;

export interface MindsetAnswerEntry {
  value: MindsetAnswerValue | null;
  elapsedSeconds: number;
  skipped: boolean;
}

/** Keyed by String(question.id). Only ever contains COMMITTED (timed-out or
 * manually-advanced-past) answers - the in-flight pick lives in
 * draft_answer instead, see mindset/service.ts. */
export type MindsetAnswerMap = Record<string, MindsetAnswerEntry>;

export type MindsetViolationType =
  | "fullscreen_exit"
  | "tab_hidden"
  | "window_blur"
  | "devtools_suspected"
  | "copy_attempt"
  | "paste_attempt"
  | "cut_attempt"
  | "context_menu"
  | "shortcut_blocked"
  | "refresh_attempt";

/** Violations that count toward the warning ladder / auto-submit. */
export const MINDSET_MAJOR_VIOLATIONS: ReadonlySet<MindsetViolationType> = new Set([
  "fullscreen_exit",
  "tab_hidden",
  "window_blur",
  "devtools_suspected",
  "refresh_attempt",
]);

/** Deliberately strict - 1 (not gads'/the generic exam's 3): the 1st major
 * violation shows one warning, the 2nd auto-submits. Matches "only one more
 * warning and the next warning it will auto-submit." */
export const MINDSET_MAX_MAJOR_VIOLATIONS = 1;

export interface MindsetViolation {
  type: MindsetViolationType;
  /** ISO timestamp, client clock - indicative, not forensic. */
  at: string;
  detail?: string;
}

export const MINDSET_VIOLATION_LABELS: Record<MindsetViolationType, string> = {
  fullscreen_exit: "Exited fullscreen",
  tab_hidden: "Switched tab / minimized window",
  window_blur: "Window lost focus",
  devtools_suspected: "Developer tools suspected",
  copy_attempt: "Copy attempt",
  paste_attempt: "Paste attempt",
  cut_attempt: "Cut attempt",
  context_menu: "Right-click attempt",
  shortcut_blocked: "Blocked keyboard shortcut",
  refresh_attempt: "Page refresh attempted",
};

export type MindsetQuestionOutcome = "scored" | "unanswered" | "review";

export interface MindsetPerQuestionResult {
  questionId: number;
  mechanic: MindsetMechanic;
  category: string;
  elapsedSeconds: number;
  skipped: boolean;
  earned: number;
  max: number;
  outcome: MindsetQuestionOutcome;
  /** written only - the full free-text answer, for the recruiter report. */
  answerText?: string;
}

export interface MindsetCategoryScore {
  earned: number;
  max: number;
  /** 0-100, or null when the category has no scoreable questions. */
  percent: number | null;
}

export interface MindsetScores {
  byCategory: Record<string, MindsetCategoryScore>;
  /** 0-100 across every scoreable (likert + situational) question. Written
   * answers are never folded into this - they're reported verbatim instead. */
  overallPercent: number;
}

export type MindsetStatus = "in_progress" | "submitted" | "scored" | "expired";
export type MindsetSubmitReason = "manual" | "timer" | "violations" | "auto_expired";

export interface MindsetAssessmentRow {
  id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  candidate_college: string;
  session_token_hash: string;
  questions: MindsetQuestion[];
  answers: MindsetAnswerMap;
  draft_answer: MindsetAnswerValue | null;
  current_index: number;
  current_question_started_at: string | null;
  violations: MindsetViolation[];
  status: MindsetStatus;
  scores: MindsetScores | null;
  per_question: MindsetPerQuestionResult[] | null;
  overall_percent: number | null;
  /** Wall-clock seconds from started_at to submit, capped at the paper's own
   * deadline so an auto-expired sitting never reports more than 15 minutes. */
  time_taken_seconds: number | null;
  submit_reason: MindsetSubmitReason | null;
  candidate_confirmation_sent_at: string | null;
  recruiter_report_sent_at: string | null;
  created_at: string;
  started_at: string;
  expires_at: string;
  submitted_at: string | null;
}
