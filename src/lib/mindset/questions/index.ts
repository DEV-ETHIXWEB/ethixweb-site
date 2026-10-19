import { randomInt } from "node:crypto";
import {
  LIKERT_POINTS,
  MINDSET_QUESTION_COUNTS,
  MINDSET_SECTION_ORDER,
  MINDSET_TOTAL_QUESTIONS,
  type MindsetMechanic,
  type MindsetQuestion,
} from "@/lib/mindset/types";
import type { AuthoredMindsetQuestion } from "@/lib/mindset/questions/shared";
import { LIKERT_QUESTIONS } from "@/lib/mindset/questions/likert";
import { MCQ_QUESTIONS } from "@/lib/mindset/questions/mcq";
import { SITUATIONAL_QUESTIONS } from "@/lib/mindset/questions/situational";
import { WRITTEN_QUESTIONS } from "@/lib/mindset/questions/written";

// The one fixed sitting. Not a reusable pool: every one of these is used on
// every attempt, since there is only ever one attempt per candidate. The
// four sections stay in a fixed order so the paper reads the way it was
// briefed (fast statements, then direct questions, then scenarios, then
// writing). Only the order WITHIN a section, and a situational question's
// own option order, is shuffled per attempt.
//
// Likert options are never shuffled: the agreement scale has to run from
// disagree to agree every time or the slider would be unreadable.

const QUESTIONS_BY_MECHANIC: Record<MindsetMechanic, AuthoredMindsetQuestion[]> = {
  likert: LIKERT_QUESTIONS,
  mcq: MCQ_QUESTIONS,
  situational: SITUATIONAL_QUESTIONS,
  written: WRITTEN_QUESTIONS,
};

// Driven by the shared order so the paper and the candidate's briefing table
// in MindsetGate are assembled from the same list and cannot disagree.
const SECTIONS: AuthoredMindsetQuestion[][] = MINDSET_SECTION_ORDER.map(
  (mechanic) => QUESTIONS_BY_MECHANIC[mechanic],
);

// Self-check at module load, not request time - the data is static, so a
// structural mistake should fail the build/boot, not a candidate's exam.
function validate() {
  const all = SECTIONS.flat();
  if (all.length !== MINDSET_TOTAL_QUESTIONS) {
    throw new Error(
      `mindset-questions: expected ${MINDSET_TOTAL_QUESTIONS} questions total, found ${all.length}`,
    );
  }

  const counts: Record<string, number> = {};
  for (const q of all) counts[q.mechanic] = (counts[q.mechanic] ?? 0) + 1;
  for (const [mechanic, expected] of Object.entries(MINDSET_QUESTION_COUNTS)) {
    const got = counts[mechanic] ?? 0;
    if (got !== expected) {
      throw new Error(
        `mindset-questions: expected exactly ${expected} "${mechanic}" questions, found ${got}`,
      );
    }
  }

  for (const q of all) {
    const label = `"${q.question.slice(0, 50)}..." (${q.mechanic}/${q.category})`;

    if (q.mechanic === "written") {
      if (q.options.length !== 0 || q.weights.length !== 0) {
        throw new Error(`mindset-questions: ${label} is written but has options/weights`);
      }
      continue;
    }

    if (q.mechanic === "likert") {
      if (q.options.length !== 0) {
        throw new Error(`mindset-questions: ${label} is likert and must not carry its own options`);
      }
      if (q.weights.length !== LIKERT_POINTS) {
        throw new Error(
          `mindset-questions: ${label} needs ${LIKERT_POINTS} weights, one per scale point`,
        );
      }
      continue;
    }

    if (q.options.length !== 4) {
      throw new Error(
        `mindset-questions: ${label} needs exactly 4 options, found ${q.options.length}`,
      );
    }
    if (q.weights.length !== q.options.length) {
      throw new Error(`mindset-questions: ${label} weights/options length mismatch`);
    }
  }

  for (const q of all) {
    if (!q.hint || q.hint.trim().length === 0) {
      throw new Error(`mindset-questions: "${q.question.slice(0, 40)}..." is missing its hint`);
    }
    if (q.weights.some((w) => w < 0 || !Number.isFinite(w))) {
      throw new Error(`mindset-questions: "${q.question.slice(0, 40)}..." has an invalid weight`);
    }
  }
}
validate();

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Shuffles the option order of a choice question and remaps its weights to
 * follow. Likert and written questions are returned untouched: the agreement
 * scale must stay in order, and written questions have no options. */
function shuffleOptions(
  q: AuthoredMindsetQuestion,
): Pick<AuthoredMindsetQuestion, "options" | "weights"> {
  if ((q.mechanic !== "situational" && q.mechanic !== "mcq") || q.options.length === 0) {
    return { options: q.options, weights: q.weights };
  }
  const order = shuffle(q.options.map((_, i) => i));
  return {
    options: order.map((oldIndex) => q.options[oldIndex]),
    weights: order.map((oldIndex) => q.weights[oldIndex]),
  };
}

/**
 * Assembles the one candidate's sitting: each section's question order
 * shuffled fresh, sections kept in their fixed order, then sequential ids
 * assigned across the whole paper. Returns the FULL questions including
 * weights - the caller stores these server-side and must send only
 * sanitizeMindsetQuestion() output to the browser.
 */
export function buildMindsetExam(): MindsetQuestion[] {
  const ordered = SECTIONS.flatMap((section) => shuffle(section));
  return ordered.map((q, index): MindsetQuestion => {
    const { options, weights } = shuffleOptions(q);
    return { ...q, id: index + 1, options, weights };
  });
}
