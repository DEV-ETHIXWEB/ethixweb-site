import type { AuthoredMindsetQuestion } from "@/lib/mindset/questions/shared";

// Section 1 - Agreement statements, answered on a five point slider.
//
// Written to be read once, at speed, by someone whose English may be their
// second language: short sentences, everyday words, no idioms, one idea per
// statement. The `hint` under each one restates the situation concretely,
// because a candidate who has to re-read a question is spending their clock
// on comprehension rather than on an honest answer.
//
// Mixed direction on purpose. Six statements score well when you agree,
// seven when you disagree, so sliding everything to "Strongly agree"
// without reading lands near the middle instead of near full marks.
// Straight-lining therefore shows up as a flat, average result.

/** Agreeing is the strong fit signal. */
const AGREE_GOOD = [0, 1, 2, 3, 4];
/** Reverse scored: agreeing is the weak fit signal. */
const AGREE_BAD = [4, 3, 2, 1, 0];

function statement(
  category: string,
  question: string,
  hint: string,
  weights: number[],
): AuthoredMindsetQuestion {
  return { mechanic: "likert", category, question, hint, options: [], weights };
}

export const LIKERT_QUESTIONS: AuthoredMindsetQuestion[] = [
  statement(
    "money_vs_mission",
    "A bigger salary matters more to me than the kind of work I do.",
    "Example: a boring job that pays more, or an interesting one that pays less.",
    AGREE_BAD,
  ),

  statement(
    "ownership_followthrough",
    "If I promise to finish something by a certain time, I finish it, even when nobody checks.",
    "Nobody is watching and nobody would know. Do you still finish it?",
    AGREE_GOOD,
  ),
  statement(
    "ownership_followthrough",
    "When a task becomes boring, I slow down and lose interest.",
    "Think about what actually happens to you halfway through dull work.",
    AGREE_BAD,
  ),

  statement(
    "relocation_delhi",
    "I am ready to move to Delhi for the right job.",
    "This job is based in Delhi.",
    AGREE_GOOD,
  ),
  statement(
    "relocation_delhi",
    "I would avoid moving to another city for a job.",
    "Leaving your current city, family and friends for work.",
    AGREE_BAD,
  ),

  statement(
    "openness_other_roles",
    "I would take a different role from the one I applied for, if it was a real way to get started.",
    "Example: starting in testing or support instead of coding.",
    AGREE_GOOD,
  ),
  statement(
    "openness_other_roles",
    "I would rather wait for the exact job title I want than start in a similar role.",
    "Would you say no to a close-enough job to hold out for the perfect one?",
    AGREE_BAD,
  ),

  statement(
    "curiosity_self_learning",
    "I often learn new technical things on my own, without being asked.",
    "Tutorials, side projects, or reading documentation in your own time.",
    AGREE_GOOD,
  ),

  statement(
    "deadline_procrastination",
    "When I am running late on work, I tell someone early instead of quietly hoping to catch up.",
    "You know on Tuesday that Friday is at risk. Do you say so on Tuesday?",
    AGREE_GOOD,
  ),
  statement(
    "deadline_procrastination",
    "Work left over at the end of the day can usually wait until I feel like doing it.",
    "It is 6pm and something is unfinished. Does it wait?",
    AGREE_BAD,
  ),

  statement(
    "honesty_self_awareness",
    "I say when I do not know something, straight away.",
    "In a meeting, someone asks you something you genuinely do not know.",
    AGREE_GOOD,
  ),
  statement(
    "long_term_commitment",
    "I would leave a job quickly if I got a slightly better offer.",
    "A small pay rise somewhere else, three months in. Do you go?",
    AGREE_BAD,
  ),
  statement(
    "team_vs_solo",
    "I would rather work alone than work closely with other people.",
    "Your honest preference, not what sounds good in an interview.",
    AGREE_BAD,
  ),
];
