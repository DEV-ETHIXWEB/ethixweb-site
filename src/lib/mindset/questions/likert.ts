import type { AuthoredMindsetQuestion } from "@/lib/mindset/questions/shared";

// Section 1 - Agreement statements, answered on a five point scale. Twenty
// statements, two per trait category.
//
// Every category carries one statement where agreeing is the strong signal
// and one where agreeing is the weak one. That is deliberate: a candidate
// who slides everything to "Strongly agree" without reading scores around
// the middle rather than perfectly, so straight-lining shows up as a flat
// middling result instead of a great one. It also keeps the scale honest
// for people who genuinely do agree with most of it.
//
// AGREE_GOOD / AGREE_BAD are the two weight runs, mapped against
// LIKERT_LABELS (Strongly disagree first, Strongly agree last).

/** Agreeing is the strong fit signal. */
const AGREE_GOOD = [0, 1, 2, 3, 4];
/** Reverse scored: agreeing is the weak fit signal. */
const AGREE_BAD = [4, 3, 2, 1, 0];

function statement(category: string, question: string, weights: number[]): AuthoredMindsetQuestion {
  return { mechanic: "likert", category, question, options: [], weights };
}

export const LIKERT_QUESTIONS: AuthoredMindsetQuestion[] = [
  statement(
    "money_vs_mission",
    "A bigger paycheck matters more to me than what I actually work on.",
    AGREE_BAD,
  ),
  statement(
    "money_vs_mission",
    "I would pick work I find genuinely interesting over an easier job that paid the same.",
    AGREE_GOOD,
  ),

  statement(
    "ownership_followthrough",
    "If I say I will finish something by a certain time, I finish it, even when nobody is checking.",
    AGREE_GOOD,
  ),
  statement(
    "ownership_followthrough",
    "When a task turns out to be boring, I tend to lose momentum on it.",
    AGREE_BAD,
  ),

  statement(
    "openness_other_roles",
    "I would take a different role than the one I applied for if it was a genuine way in.",
    AGREE_GOOD,
  ),
  statement(
    "openness_other_roles",
    "I would rather wait for the exact job title I want than start somewhere close to it.",
    AGREE_BAD,
  ),

  statement("relocation_delhi", "I am ready to relocate to Delhi for the right role.", AGREE_GOOD),
  statement(
    "relocation_delhi",
    "Moving to another city for a job is something I would avoid.",
    AGREE_BAD,
  ),

  statement(
    "curiosity_self_learning",
    "I regularly learn technical things on my own, without being told to.",
    AGREE_GOOD,
  ),
  statement(
    "curiosity_self_learning",
    "When something unfamiliar comes up, I would rather have it explained to me than work it out myself.",
    AGREE_BAD,
  ),

  statement(
    "failure_feedback",
    "When my work is criticised, I want to understand exactly why before I change it.",
    AGREE_GOOD,
  ),
  statement("failure_feedback", "Blunt feedback on my work puts me off for a while.", AGREE_BAD),

  statement(
    "deadline_procrastination",
    "When I am running behind, I say so early rather than hoping to quietly catch up.",
    AGREE_GOOD,
  ),
  statement(
    "deadline_procrastination",
    "Work left over at the end of the day can usually wait until I feel like doing it.",
    AGREE_BAD,
  ),

  statement(
    "team_vs_solo",
    "I ask for help once I have genuinely tried, rather than staying stuck on my own.",
    AGREE_GOOD,
  ),
  statement(
    "team_vs_solo",
    "I would rather work alone than have to coordinate with other people.",
    AGREE_BAD,
  ),

  statement(
    "long_term_commitment",
    "I am looking for somewhere to build a career, not just the next job.",
    AGREE_GOOD,
  ),
  statement(
    "long_term_commitment",
    "I would leave a job quickly if a slightly better offer appeared.",
    AGREE_BAD,
  ),

  statement(
    "honesty_self_awareness",
    "I say when I do not know something, straight away.",
    AGREE_GOOD,
  ),
  statement(
    "honesty_self_awareness",
    "If I made a mistake that nobody would ever notice, I would keep it to myself.",
    AGREE_BAD,
  ),
];
