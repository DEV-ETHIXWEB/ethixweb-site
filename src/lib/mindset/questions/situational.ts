import type { AuthoredMindsetQuestion } from "@/lib/mindset/questions/shared";

// Section 3 - Situations. Ten short workplace scenarios, one answer each.
//
// Where mcq.ts asks what someone is like, these ask what they would do.
// The gap between the two answers is often the most useful thing in the
// report: plenty of people describe themselves as communicative and then
// pick the quiet option when a real situation is in front of them.
//
// Plain words, short options. Authored worst to best for readability;
// shuffleOptions() in ./index.ts re-randomizes the on-screen order, so
// position carries no signal.

export const SITUATIONAL_QUESTIONS: AuthoredMindsetQuestion[] = [
  {
    mechanic: "situational",
    category: "conflicting_priorities",
    question:
      "Your manager says the client wants a feature built one way. But the client told you something different yesterday. What do you do?",
    hint: "Two people have told you two different things.",
    options: [
      "Build the manager's version and say nothing",
      "Build what the client said and say nothing",
      "Tell the manager about the difference before building anything",
      "Tell the manager, and suggest a way to satisfy both",
    ],
    weights: [0, 1, 2, 3],
  },
  {
    mechanic: "situational",
    category: "conflicting_priorities",
    question:
      "Two different people each give you a task due today. You cannot do both well in the time you have. What do you do?",
    hint: "There is not enough time for both.",
    options: [
      "Quietly do whichever feels urgent and say nothing",
      "Pick one and hope nobody notices the other",
      "Tell both people and let them decide the order",
      "Tell both people, suggest an order, and confirm before starting",
    ],
    weights: [0, 1, 2, 3],
  },
  {
    mechanic: "situational",
    category: "client_pushback",
    question:
      "A client is unhappy with a feature, even though it was built exactly as agreed. How do you respond?",
    hint: "You did what was agreed, but they are still not happy.",
    options: [
      "Quietly rebuild it their way without discussing it",
      "Explain it was built as agreed and leave it there",
      "Explain it was built as agreed, then ask what is actually wrong",
      "Explain it was built as agreed, then work with them on a fix that suits both",
    ],
    weights: [0, 1, 2, 3],
  },
  {
    mechanic: "situational",
    category: "client_pushback",
    question:
      "A client asks for a change that you are sure will cause problems later. What do you do?",
    hint: "They want it. You think it is a mistake.",
    options: [
      "Just make the change, it is their decision",
      "Make the change and say nothing",
      "Mention the risk once, then do it either way",
      "Explain the risk clearly and suggest another option before doing it",
    ],
    weights: [0, 1, 2, 3],
  },
  {
    mechanic: "situational",
    category: "ambiguous_instructions",
    question: 'A task just says "fix the login issue" and nothing else. What is your first step?',
    hint: "You do not know what is actually broken.",
    options: [
      "Guess what is wrong and start fixing",
      "Start fixing and ask only if I get stuck",
      "Ask what exactly is broken before starting",
      "Try to reproduce the problem myself first, then ask a specific question",
    ],
    weights: [0, 1, 2, 3],
  },
  {
    mechanic: "situational",
    category: "ambiguous_instructions",
    question:
      "The requirements change in the middle of a project, and nobody has written down the new plan. What do you do?",
    hint: "The goal moved, but nothing is documented.",
    options: [
      "Keep building the old version, that is what I was told first",
      "Stop and wait for someone else to sort it out",
      "Ask what exactly changed and adjust",
      "Ask what changed, confirm the new plan, and say how it affects the timeline",
    ],
    weights: [0, 1, 2, 3],
  },
  {
    mechanic: "situational",
    category: "feedback_reception",
    question:
      "In a one-to-one meeting, your manager says you have been working slower than expected. How do you respond?",
    hint: "This is the first time you are hearing it.",
    options: [
      "Get defensive and explain why it is not my fault",
      "Agree quietly and say nothing else",
      "Ask what exactly seems slow and accept the point",
      "Ask what exactly seems slow, and say how I will fix it",
    ],
    weights: [0, 1, 2, 3],
  },
  {
    mechanic: "situational",
    category: "deadline_aftermath",
    question: "You missed a deadline you had promised. What do you do right after?",
    hint: "The deadline has already passed.",
    options: [
      "Say nothing unless someone asks",
      "Mention it only if it comes up",
      "Tell the right person straight away what happened",
      "Tell them, explain why, and give a new realistic date",
    ],
    weights: [0, 1, 2, 3],
  },
  {
    mechanic: "situational",
    category: "role_flexibility",
    question:
      "In your first weeks, you are told your work will be mostly testing rather than coding at the start. How do you react?",
    hint: "Not what you expected when you joined.",
    options: [
      "Push back, this is not what I signed up for",
      "Go along with it, but unhappily",
      "Accept it and do it well",
      "Accept it, do it well, and use it to learn the codebase faster",
    ],
    weights: [0, 1, 2, 3],
  },
  {
    mechanic: "situational",
    category: "team_conflict",
    question:
      "You and a teammate disagree about the right technical approach, and it is slowing the project down. What do you do?",
    hint: "Neither of you is changing your mind.",
    options: [
      "Keep pushing for my own approach",
      "Give in immediately just to end the argument",
      "Talk through the pros and cons and try to agree",
      "Talk it through, and if we are still stuck, ask a third person to decide",
    ],
    weights: [0, 1, 2, 3],
  },
];
