import type { AuthoredMindsetQuestion } from "@/lib/mindset/questions/shared";

// Section 2 - Direct questions. Ten single-answer questions about how the
// candidate actually works, as opposed to the longer workplace scenarios in
// situational.ts.
//
// These ask about the person; the situational ones ask what they would do.
// Asking both ways is the point: someone can describe themselves as
// organised and still pick the avoidant option when a concrete situation is
// put in front of them, and the recruiter report shows both.
//
// Options are authored worst to best for readability. shuffleOptions() in
// ./index.ts re-randomizes the on-screen order, so position carries no
// signal. Plain words, short options, one idea each.

export const MCQ_QUESTIONS: AuthoredMindsetQuestion[] = [
  {
    mechanic: "mcq",
    category: "money_vs_mission",
    question: "Why are you applying for this job?",
    hint: "Be honest. Every answer here is a normal reason to apply.",
    options: [
      "I need a job right now, any job",
      "I heard the pay here is good",
      "It matches my skills and pays fairly",
      "I want to build real software and grow here",
    ],
    weights: [0, 1, 2, 3],
  },
  {
    mechanic: "mcq",
    category: "ownership_followthrough",
    question:
      "Something you built stops working after you have gone home for the day. What is your instinct?",
    hint: "It is 9pm. You get a message that it is broken.",
    options: [
      "It is not my shift, someone else will handle it",
      "I will look at it tomorrow morning",
      "I check what is wrong and help if I can",
      "I start working on it until it is stable again",
    ],
    weights: [0, 1, 2, 3],
  },
  {
    mechanic: "mcq",
    category: "deadline_procrastination",
    question: "You still have unfinished work at the end of the day. What do you actually do?",
    hint: "Nobody has asked about it yet.",
    options: [
      "Leave it, I will deal with it whenever",
      "Plan to catch up later in the week",
      "Come in early the next day to finish it first",
      "Stay a little longer and finish it today",
    ],
    weights: [0, 1, 2, 3],
  },
  {
    mechanic: "mcq",
    category: "curiosity_self_learning",
    question: "You need to do something you have never done before. What is your first step?",
    hint: "Example: a tool or library you have never used.",
    options: [
      "Wait for someone to explain it to me",
      "Search for code I can copy and paste quickly",
      "Search for it, then read enough to understand it before using it",
      "Try a few approaches myself so I remember it next time",
    ],
    weights: [0, 1, 2, 3],
  },
  {
    mechanic: "mcq",
    category: "failure_feedback",
    question:
      "A senior developer rejects your code with blunt feedback. What is your honest first reaction?",
    hint: "The feedback is fair, but it is not gently worded.",
    options: [
      "Annoyed, they do not understand my approach",
      "Discouraged, I go quiet for a while",
      "I note it down and fix it",
      "I ask questions to understand why, then fix it",
    ],
    weights: [0, 1, 2, 3],
  },
  {
    mechanic: "mcq",
    category: "team_vs_solo",
    question: "You have been stuck on the same bug for an hour. What do you do?",
    hint: "Nothing you have tried so far has worked.",
    options: [
      "Keep working on it alone, however long it takes",
      "Keep trying alone and ask only as a last resort",
      "Ask a teammate once I have tried the obvious things",
      "Tell the team early so it does not block them, and keep trying",
    ],
    weights: [0, 1, 2, 3],
  },
  {
    mechanic: "mcq",
    category: "honesty_self_awareness",
    question: "You do not fully understand a task before starting it. What do you do?",
    hint: "The instructions are not clear to you.",
    options: [
      "Guess and start building anyway",
      "Start building and ask only if something breaks",
      "Ask one quick question before starting",
      "Ask questions and repeat back what I understood before starting",
    ],
    weights: [0, 1, 2, 3],
  },
  {
    mechanic: "mcq",
    category: "openness_other_roles",
    question:
      "If we offered you an internship first, to prove yourself, instead of the full role, what is your honest reaction?",
    hint: "Lower pay and a shorter commitment at the start.",
    options: [
      "That is a step down, I am not interested",
      "Disappointing, but I would think about it",
      "Reasonable, I would take it seriously",
      "Happy to take it, it is a fair way to earn the full role",
    ],
    weights: [0, 1, 2, 3],
  },
  {
    mechanic: "mcq",
    category: "relocation_delhi",
    question: "How ready are you to move to Delhi right now?",
    hint: "If you were offered this job this week.",
    options: [
      "Not ready, and not planning to be",
      "Not ready, I would need a long time to decide",
      "Not yet, but I could be ready quickly",
      "Already ready, or happy to move immediately",
    ],
    weights: [0, 1, 2, 3],
  },
  {
    mechanic: "mcq",
    category: "long_term_commitment",
    question: "If things go well, how long would you want to stay in your next job?",
    hint: "Assume you are learning and the team is good.",
    options: [
      "Less than a year, I like to move around",
      "About a year",
      "A few years, as long as I keep growing",
      "Several years, I want to build something here",
    ],
    weights: [0, 1, 2, 3],
  },
];
