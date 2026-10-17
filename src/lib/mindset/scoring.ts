import {
  type MindsetAnswerEntry,
  type MindsetAnswerMap,
  type MindsetCategoryScore,
  type MindsetPerQuestionResult,
  type MindsetQuestion,
  type MindsetQuestionOutcome,
  type MindsetScores,
} from "@/lib/mindset/types";

// Fit-signal scoring, not correct/incorrect. Every answerable question
// carries a weight per choice (see questions/shared.ts); "earned" is the
// weight of what the candidate picked and "max" is the best weight that
// question had on offer.
//
// Max is read off the question's own weights rather than a shared
// constant, because the two mechanics use different scales: a situational
// question has four options worth 0 to 3, a likert statement has five scale
// points worth 0 to 4. Deriving it per question means a reverse-scored
// statement (weights running 4 down to 0) is worth exactly as much as a
// forward one, with no special case.
//
// Written answers are never folded into the numeric score. They go to the
// recruiter verbatim (outcome "review"), the same philosophy as gads's
// written mechanic, since there is no principled way to auto-score a
// personal free-text answer.

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function scoreQuestion(
  q: MindsetQuestion,
  entry: MindsetAnswerEntry | undefined,
): { earned: number; max: number; outcome: MindsetQuestionOutcome; answerText?: string } {
  if (q.mechanic === "written") {
    const text = typeof entry?.value === "string" ? entry.value.trim() : "";
    return { earned: 0, max: 0, outcome: "review", answerText: text };
  }

  const max = q.weights.length > 0 ? Math.max(...q.weights) : 0;
  const picked = typeof entry?.value === "number" ? entry.value : null;
  if (picked === null || picked < 0 || picked >= q.weights.length) {
    return { earned: 0, max, outcome: "unanswered" };
  }
  return { earned: q.weights[picked], max, outcome: "scored" };
}

export interface MindsetScoringResult {
  scores: MindsetScores;
  perQuestion: MindsetPerQuestionResult[];
}

/** Overall = total earned fit-signal points over total possible, across
 * every scoreable (likert + situational) question - a plain percentage,
 * reported alongside the per-category breakdown. Never used to auto-reject;
 * this is a signal report for a human, not a hire/no-hire gate. */
export function scoreMindsetAssessment(
  questions: MindsetQuestion[],
  answers: MindsetAnswerMap,
): MindsetScoringResult {
  const byCategory: Record<string, { earned: number; max: number }> = {};
  let totalEarned = 0;
  let totalMax = 0;

  const perQuestion: MindsetPerQuestionResult[] = questions.map((q) => {
    const entry = answers[String(q.id)];
    const { earned, max, outcome, answerText } = scoreQuestion(q, entry);

    if (q.mechanic !== "written") {
      const bucket = byCategory[q.category] ?? { earned: 0, max: 0 };
      bucket.earned += earned;
      bucket.max += max;
      byCategory[q.category] = bucket;
      totalEarned += earned;
      totalMax += max;
    }

    return {
      questionId: q.id,
      mechanic: q.mechanic,
      category: q.category,
      elapsedSeconds: entry?.elapsedSeconds ?? 0,
      skipped: entry?.skipped ?? true,
      earned,
      max,
      outcome,
      ...(answerText !== undefined ? { answerText } : {}),
    };
  });

  const categoryScores: Record<string, MindsetCategoryScore> = {};
  for (const [category, { earned, max }] of Object.entries(byCategory)) {
    categoryScores[category] = {
      earned: round2(earned),
      max,
      percent: max > 0 ? Math.round((earned / max) * 100) : null,
    };
  }

  return {
    scores: {
      byCategory: categoryScores,
      overallPercent: totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0,
    },
    perQuestion,
  };
}
