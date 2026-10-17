import type { AuthoredMindsetQuestion } from "@/lib/mindset/questions/shared";

// Section 2 - Situational Judgment. Twelve single-select workplace
// scenarios. Each option carries a 0-3 fit-signal weight, authored in
// ascending order for readability; shuffleOptions() in ./index.ts
// re-randomizes the on-screen order, so position carries no signal.
//
// Deliberately broader than the agreement statements in likert.ts: those
// ask what someone believes about themselves, these ask what they would
// actually do. Where the two disagree, the recruiter report shows both.

export const SITUATIONAL_QUESTIONS: AuthoredMindsetQuestion[] = [
  // --- Conflicting priorities ---------------------------------------------
  {
    mechanic: "situational",
    category: "conflicting_priorities",
    question:
      "Your manager tells you the client wants a feature built one way, which contradicts what the client told you directly yesterday. What do you do?",
    options: [
      "Silently implement the manager's version",
      "Silently implement what the client said",
      "Flag the contradiction to the manager before building anything",
      "Flag it, and also propose a way to reconcile both asks",
    ],
    weights: [0, 1, 2, 3],
  },
  {
    mechanic: "situational",
    category: "conflicting_priorities",
    question:
      "You have two tasks due today from two different people, and doing both well isn't realistic in the time left. What do you do?",
    options: [
      "Quietly do what feels urgent and say nothing",
      "Pick one and hope the other isn't missed",
      "Tell both people and let them decide the order",
      "Tell both people, suggest a reasonable order, and confirm before proceeding",
    ],
    weights: [0, 1, 2, 3],
  },

  // --- Client pushback ------------------------------------------------------
  {
    mechanic: "situational",
    category: "client_pushback",
    question:
      "A client is unhappy with a feature that was built exactly to the agreed spec. How do you respond?",
    options: [
      "Quietly rebuild it their way without discussion",
      "Explain it was built to spec and leave it there",
      "Explain it was built to spec, then discuss what's actually wrong",
      "Explain it was built to spec, then work with them to find a solution that fits both",
    ],
    weights: [0, 1, 2, 3],
  },
  {
    mechanic: "situational",
    category: "client_pushback",
    question:
      "A client asks for a change that you're confident will cause problems down the line. What do you do?",
    options: [
      "Just make the change, it's their call",
      "Make the change without saying anything",
      "Raise the concern once, then proceed either way",
      "Clearly explain the risk and propose an alternative before proceeding",
    ],
    weights: [0, 1, 2, 3],
  },

  // --- Ambiguous instructions -------------------------------------------------
  {
    mechanic: "situational",
    category: "ambiguous_instructions",
    question:
      'A ticket just says "fix the login issue" with no other detail. What\'s your first move?',
    options: [
      "Guess what's wrong and start fixing",
      "Start fixing and ask questions only if stuck",
      "Ask a clarifying question before starting",
      "Try to reproduce the issue yourself first, then ask a sharper question if still unclear",
    ],
    weights: [0, 1, 2, 3],
  },
  {
    mechanic: "situational",
    category: "ambiguous_instructions",
    question:
      "Requirements change halfway through a sprint with no clear new spec. What's your approach?",
    options: [
      "Keep building the old version since that's what you were told first",
      "Pause and wait for someone else to sort it out",
      "Ask what specifically changed and adjust",
      "Ask what changed, confirm the new scope, and flag any impact on the timeline",
    ],
    weights: [0, 1, 2, 3],
  },

  // --- Asking for help ---------------------------------------------------------
  {
    mechanic: "situational",
    category: "asking_for_help",
    question:
      "You've been stuck on the same problem for two hours with no progress. What do you do?",
    options: [
      "Keep trying the exact same approach",
      "Keep trying different approaches alone",
      "Ask for help after trying a reasonable amount on your own",
      "Ask for help, having first written down what you've already tried",
    ],
    weights: [0, 1, 2, 3],
  },

  // --- Feedback reception -------------------------------------------------------
  {
    mechanic: "situational",
    category: "feedback_reception",
    question:
      "During a 1:1, your manager says your pace has been slower than expected. How do you respond?",
    options: [
      "Get defensive and explain why it's not your fault",
      "Agree quietly and say nothing else",
      "Ask what specifically is slow and acknowledge it",
      "Ask what specifically is slow and propose how you'll address it",
    ],
    weights: [0, 1, 2, 3],
  },

  // --- Deadline aftermath -------------------------------------------------------
  {
    mechanic: "situational",
    category: "deadline_aftermath",
    question: "You missed a deadline you had committed to. What do you do immediately after?",
    options: [
      "Say nothing unless asked",
      "Mention it only if it comes up naturally",
      "Proactively tell the relevant person what happened",
      "Proactively tell them, explain why, and share a revised plan",
    ],
    weights: [0, 1, 2, 3],
  },

  // --- Role flexibility -----------------------------------------------------
  {
    mechanic: "situational",
    category: "role_flexibility",
    question:
      "Midway through onboarding, you're told your day-to-day will lean more toward QA and testing than coding at first. How do you react?",
    options: [
      "Push back, that's not what I signed up for",
      "Go along with it reluctantly",
      "Accept it and do it well",
      "Accept it, do it well, and use it to learn the codebase faster",
    ],
    weights: [0, 1, 2, 3],
  },
  {
    mechanic: "situational",
    category: "role_flexibility",
    question:
      "You're asked to help on a project outside your usual stack because the team is short-handed. What do you do?",
    options: [
      "Say it's not my area and decline",
      "Help only with the bare minimum",
      "Help and do your best with what you know",
      "Help, and use it as a chance to pick up a new skill",
    ],
    weights: [0, 1, 2, 3],
  },

  // --- Team conflict ------------------------------------------------------------
  {
    mechanic: "situational",
    category: "team_conflict",
    question:
      "You and a teammate disagree on the right technical approach, and it's starting to slow the project down. What do you do?",
    options: [
      "Keep insisting on your own approach",
      "Give in immediately just to end the disagreement",
      "Discuss the tradeoffs and try to agree on one approach",
      "Discuss the tradeoffs, and if still stuck, bring in a third opinion to decide",
    ],
    weights: [0, 1, 2, 3],
  },
];
