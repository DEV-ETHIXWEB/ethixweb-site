import { wordCount } from "@/lib/assessment/scoring";
import {
  GADS_MAJOR_VIOLATIONS,
  GADS_MAX_MAJOR_VIOLATIONS,
  GADS_WRITTEN_WORD_TARGET,
  type GadsAnswerEntry,
  type GadsAnswerMap,
  type GadsMechanic,
  type GadsPerQuestionResult,
  type GadsQuestion,
  type GadsQuestionOutcome,
  type GadsRecommendation,
  type GadsScores,
  type GadsSectionScore,
  type GadsViolation,
} from "@/lib/gads/types";

// Fully deterministic scoring against the server-held answer key - no AI in
// the loop. Written answers get an indicative heuristic score (length
// compliance + coverage of the generation-time evaluation criteria) and are
// ALWAYS flagged "review" and included in full in the recruiter report; the
// heuristic exists to give a quick read, not to decide.

const DIFFICULTY_POINTS = { Easy: 1, Medium: 2, Hard: 3 } as const;

/** How fully the answer's length lands in the required 50-150 word band. */
function lengthFactor(words: number): number {
  const { min, max } = GADS_WRITTEN_WORD_TARGET;
  if (words === 0) return 0;
  if (words < min * 0.4) return 0.1;
  if (words < min * 0.7) return 0.3;
  if (words < min) return 0.6;
  if (words <= max) return 1;
  if (words <= max * 1.5) return 0.9; // over-long but substantive
  return 0.7; // rambling
}

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "have",
  "will",
  "would",
  "should",
  "could",
  "then",
  "them",
  "they",
  "when",
  "what",
  "which",
  "your",
  "into",
  "over",
  "each",
  "also",
  "been",
  "were",
  "does",
  "how",
  "why",
  "are",
  "was",
  "not",
  "you",
  "can",
  "use",
  "using",
  "any",
  "all",
  "its",
  "our",
  "such",
  "than",
  "these",
  "those",
  "there",
  "their",
  "about",
  "after",
  "before",
  "between",
  "while",
  "where",
  "who",
  "whom",
]);

function significantTerms(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter((t) => t.length > 3 && !STOP_WORDS.has(t));
}

/** A criterion counts as covered when enough of its significant terms show
 * up in the answer. Crude on purpose - an ordering signal for the
 * recruiter, whose report always includes the full answer text alongside
 * it. */
function criteriaCoverage(answer: string, criteria: string[]): number {
  if (criteria.length === 0) return 0;
  const answerTerms = new Set(significantTerms(answer));
  let covered = 0;
  for (const criterion of criteria) {
    const terms = significantTerms(criterion);
    if (terms.length === 0) continue;
    const hits = terms.filter((t) => answerTerms.has(t)).length;
    if (hits / terms.length >= 0.34) covered += 1;
  }
  return covered / criteria.length;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function scoreQuestion(
  q: GadsQuestion,
  entry: GadsAnswerEntry | undefined,
): { earned: number; max: number; outcome: GadsQuestionOutcome } {
  const max = DIFFICULTY_POINTS[q.difficulty];
  const value = entry?.value ?? null;

  if (q.mechanic === "written") {
    const text = typeof value === "string" ? value.trim() : "";
    if (!text) return { earned: 0, max, outcome: "unanswered" };
    const factor =
      0.4 * lengthFactor(wordCount(text)) + 0.6 * criteriaCoverage(text, q.evaluationCriteria);
    return { earned: round2(max * factor), max, outcome: "review" };
  }

  if (q.mechanic === "multiple") {
    // Score the SET of picked options, not the raw array. A hand-crafted
    // request can repeat one index ([1,1,1,1,1,1]) or name an option the
    // question doesn't have; counting those raw let `hits` exceed
    // correct.size, so `ratio` went above 1 and a 3-point question paid 6.
    // Deduplicating and dropping out-of-range indices caps ratio at 1, so
    // `earned` can never exceed `max`.
    const rawPicked = Array.isArray(value) ? value : null;
    if (!rawPicked || rawPicked.length === 0) return { earned: 0, max, outcome: "unanswered" };
    const picked = [...new Set(rawPicked)].filter((i) => i >= 0 && i < q.options.length);
    if (picked.length === 0) return { earned: 0, max, outcome: "unanswered" };
    const correct = new Set(q.correctAnswers);
    const hits = picked.filter((i) => correct.has(i)).length;
    const misses = picked.length - hits;
    const ratio = Math.max(0, hits - misses) / correct.size;
    const earned = round2(max * ratio);
    const outcome: GadsQuestionOutcome =
      ratio >= 1 ? "correct" : ratio > 0 ? "partial" : "incorrect";
    return { earned, max, outcome };
  }

  // single / scenario
  const picked = typeof value === "number" ? value : null;
  if (picked === null) return { earned: 0, max, outcome: "unanswered" };
  const correct = picked === q.correctAnswers[0];
  return { earned: correct ? max : 0, max, outcome: correct ? "correct" : "incorrect" };
}

export interface GadsScoringResult {
  scores: GadsScores;
  perQuestion: GadsPerQuestionResult[];
}

const MECHANICS: GadsMechanic[] = ["single", "multiple", "scenario", "written"];

/** Overall = point-proportional across all difficulty-weighted questions.
 * Unlike the generic platform's hand-picked section weights, there's no
 * principled reason one of these four roughly-equal mechanics should
 * outweigh another, so each question's natural share of total possible
 * points is the more defensible default. Per-mechanic SectionScores are
 * still computed and reported for diagnostics. */
export function scoreGadsAssessment(
  questions: GadsQuestion[],
  answers: GadsAnswerMap,
): GadsScoringResult {
  const sections: Record<GadsMechanic, { earned: number; max: number }> = {
    single: { earned: 0, max: 0 },
    multiple: { earned: 0, max: 0 },
    scenario: { earned: 0, max: 0 },
    written: { earned: 0, max: 0 },
  };

  let totalEarned = 0;
  let totalMax = 0;

  const perQuestion: GadsPerQuestionResult[] = questions.map((q) => {
    const entry = answers[String(q.id)];
    const { earned, max, outcome } = scoreQuestion(q, entry);
    sections[q.mechanic].earned += earned;
    sections[q.mechanic].max += max;
    totalEarned += earned;
    totalMax += max;
    return {
      questionId: q.id,
      mechanic: q.mechanic,
      topic: q.topic,
      difficulty: q.difficulty,
      elapsedSeconds: entry?.elapsedSeconds ?? 0,
      skipped: entry?.skipped ?? true,
      earned,
      max,
      outcome,
    };
  });

  const bySection = {} as Record<GadsMechanic, GadsSectionScore>;
  for (const m of MECHANICS) {
    const { earned, max } = sections[m];
    bySection[m] = {
      earned: round2(earned),
      max,
      percent: max > 0 ? Math.round((earned / max) * 100) : null,
    };
  }

  return {
    scores: {
      bySection,
      overallPercent: totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0,
    },
    perQuestion,
  };
}

// ---------------------------------------------------------------------------
// Suspicious-activity score + recommendation tier. A fixed, explainable
// lookup table - a high score with severe violations is deliberately capped
// at "Not Recommended," never a black box.

const VIOLATION_WEIGHTS: Partial<Record<GadsViolation["type"], number>> = {
  fullscreen_exit: 3,
  tab_hidden: 3,
  window_blur: 3,
  devtools_suspected: 3,
  refresh_attempt: 3,
  multi_monitor_detected: 2,
  copy_attempt: 1,
  paste_attempt: 1,
  cut_attempt: 1,
  context_menu: 1,
  shortcut_blocked: 1,
  select_all_attempt: 1,
  print_screen_suspected: 1,
  window_resize: 1,
  network_offline: 1,
  network_online: 0,
  multi_monitor_unsupported: 0,
};

export function computeSuspiciousActivityScore(violations: GadsViolation[]): number {
  return violations.reduce((sum, v) => sum + (VIOLATION_WEIGHTS[v.type] ?? 0), 0);
}

type SeverityBand = "none_low" | "medium" | "severe";
type ScoreBand = "excellent" | "good" | "fair" | "weak";

function severityBand(violations: GadsViolation[], activityScore: number): SeverityBand {
  const majorCount = violations.filter((v) => GADS_MAJOR_VIOLATIONS.has(v.type)).length;
  const hasDevtools = violations.some((v) => v.type === "devtools_suspected");
  if (hasDevtools || majorCount >= GADS_MAX_MAJOR_VIOLATIONS || activityScore >= 15)
    return "severe";
  if (activityScore >= 5) return "medium";
  return "none_low";
}

function scoreBand(overallPercent: number): ScoreBand {
  if (overallPercent >= 85) return "excellent";
  if (overallPercent >= 70) return "good";
  if (overallPercent >= 50) return "fair";
  return "weak";
}

const RECOMMENDATION_TABLE: Record<ScoreBand, Record<SeverityBand, GadsRecommendation>> = {
  excellent: { none_low: "highly_recommended", medium: "recommended", severe: "not_recommended" },
  good: { none_low: "recommended", medium: "borderline", severe: "not_recommended" },
  fair: { none_low: "borderline", medium: "not_recommended", severe: "not_recommended" },
  weak: { none_low: "not_recommended", medium: "not_recommended", severe: "not_recommended" },
};

export interface GadsRecommendationResult {
  suspiciousActivityScore: number;
  recommendation: GadsRecommendation;
}

export function recommendGads(
  overallPercent: number,
  violations: GadsViolation[],
): GadsRecommendationResult {
  const suspiciousActivityScore = computeSuspiciousActivityScore(violations);
  const recommendation =
    RECOMMENDATION_TABLE[scoreBand(overallPercent)][
      severityBand(violations, suspiciousActivityScore)
    ];
  return { suspiciousActivityScore, recommendation };
}
