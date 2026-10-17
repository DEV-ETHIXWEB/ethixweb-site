import type { AuthoredMindsetQuestion } from "@/lib/mindset/questions/shared";

// Section 4 - Open response. Two free-text questions, never auto-scored:
// they go to the recruiter word for word (see scoring.ts, outcome
// "review").
//
// Two, because typed answers are the expensive part of a fifteen minute
// paper. They earn their place by being the only part of the exam that
// cannot be answered by picking whichever option looks best, which is also
// what makes them the most revealing thing in the report.
//
// Each carries its own category rather than a shared "written", because the
// questions are shuffled and a spreadsheet column cannot identify an answer
// by its position.

export const WRITTEN_QUESTIONS: AuthoredMindsetQuestion[] = [
  {
    mechanic: "written",
    category: "written_free_time",
    question: "What do you usually do when you have free time?",
    hint: "Anything is fine: sport, games, cooking, side projects, time with family.",
    options: [],
    weights: [],
  },
  {
    mechanic: "written",
    category: "written_role_fit",
    question:
      "If we do not select you for the Full-Stack Developer role, but think you would fit a different role here, would you be open to it? Why or why not?",
    hint: "For example QA, support, or an internship. There is no right answer here.",
    options: [],
    weights: [],
  },
];
