import type { AuthoredMindsetQuestion } from "@/lib/mindset/questions/shared";

// Section 3 - Open response. Three free-text prompts, no options, no
// weights. These are never auto-scored; they go to the recruiter verbatim
// (see scoring.ts, outcome "review").
//
// Three rather than more because typed answers are the expensive part of a
// fifteen minute paper: these cost roughly as much time as the twenty
// agreement statements put together. They earn it by being the only part
// of the exam a candidate cannot answer by picking the obviously correct
// looking option, which is exactly what makes them worth reading.
//
// Each one carries its own category rather than a shared "written". The
// prompts are shuffled within the section like every other question, so a
// spreadsheet column cannot identify an answer by its position: the
// category is what keeps "free time" under the free time heading. Adding a
// prompt here means adding its category to labels.ts.

export const WRITTEN_QUESTIONS: AuthoredMindsetQuestion[] = [
  {
    mechanic: "written",
    category: "written_free_time",
    question: "What do you usually do when you have free time?",
    options: [],
    weights: [],
  },
  {
    mechanic: "written",
    category: "written_pending_work",
    question:
      "Describe a real time you had work left pending at the end of a day. What did you do about it?",
    options: [],
    weights: [],
  },
  {
    mechanic: "written",
    category: "written_role_fit",
    question:
      "If we don't move forward with you for Full-Stack Developer but think you'd be a fit for a different role here, including an internship, would you be open to that? Why or why not?",
    options: [],
    weights: [],
  },
];
