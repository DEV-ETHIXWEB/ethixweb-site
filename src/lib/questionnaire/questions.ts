// The 15 questions, in order. Shared by the candidate UI, the server-side
// validator, the admin dashboard and the CSV export, so the wording a
// candidate saw and the wording a recruiter reads can't drift apart.
//
// Option ids are stored in the database, not the labels. Reword a label
// freely; never reuse an id for a different meaning. If the set of questions
// or ids changes, bump FORM_VERSION so old responses stay readable.
// Version 2 added q13_meet, the in-person meet follow-up to question 13.

export const FORM_VERSION = 2;

export type OptionId = "a" | "b" | "c" | "d" | "other";

export interface QuestionOption {
  id: OptionId;
  label: string;
}

export interface Question {
  id: string;
  number: number;
  /** What the candidate and recruiters see: "13", or "13a" for a follow-up. */
  label: string;
  /** A follow-up: only asked, and only required, when the named question was
   * answered with one of these choices. Checked on the server too. */
  showIf?: { questionId: string; choices: OptionId[] };
  section: 1 | 2;
  text: string;
  /** Short name for admin tables and CSV headers. */
  short: string;
  options: QuestionOption[];
  otherPlaceholder: string;
}

export const OTHER_MAX_LENGTH = 500;

export const SECTIONS = {
  1: {
    name: "Get to Know You",
    intro:
      "There are no right or wrong answers here. We simply want to understand your interests, goals, and the way you approach different situations. Choose the option that feels closest to you.",
  },
  2: {
    name: "Organization & Work Expectations",
    intro:
      "These questions are about the current working arrangement and compensation. Answer honestly; it helps us both decide whether this is the right fit.",
  },
} as const;

function q(
  number: number,
  short: string,
  text: string,
  labels: [string, string, string, string],
  otherPlaceholder: string,
): Question {
  return {
    id: `q${number}`,
    number,
    label: String(number),
    section: number <= 10 ? 1 : 2,
    text,
    short,
    otherPlaceholder,
    options: [
      { id: "a", label: labels[0] },
      { id: "b", label: labels[1] },
      { id: "c", label: labels[2] },
      { id: "d", label: labels[3] },
      { id: "other", label: "Other (please specify)" },
    ],
  };
}

export const QUESTIONS: Question[] = [
  q(
    1,
    "Favourite content",
    "What kind of movies, series, or online videos do you enjoy the most?",
    [
      "Thrillers, mysteries, and suspense.",
      "Comedy, entertainment, and memes.",
      "Technology, science, and futuristic ideas.",
      "Documentaries, real-life stories, and psychology.",
    ],
    "Tell us what you enjoy watching.",
  ),
  q(
    2,
    "Free time",
    "When you have free time and nobody expects anything from you, what do you usually enjoy doing?",
    [
      "Exploring something new that catches my attention.",
      "Watching content, gaming, or enjoying entertainment.",
      "Meeting friends, talking, or going somewhere.",
      "Working on a personal project, hobby, or goal.",
    ],
    "What do you usually enjoy doing?",
  ),
  q(
    3,
    "Why they learn",
    "Think about something you recently learned simply because you wanted to. Why did you explore it?",
    [
      "I wanted to understand how or why it works.",
      "I wanted to use it for something practical.",
      "I thought it could help my career or earning potential.",
      "Someone introduced me to it, and I became interested.",
    ],
    "What did you learn, and what interested you about it?",
  ),
  q(
    4,
    "2–3 year goal",
    "What is your biggest goal for the next two to three years?",
    [
      "Become highly skilled in my field.",
      "Get a good-paying job and become financially independent.",
      "Explore different opportunities and discover my interests.",
      "Build something of my own, such as a product or business.",
    ],
    "Tell us about your goal.",
  ),
  q(
    5,
    "Preferred opportunity",
    "If you had to choose between these opportunities, which would you prefer?",
    [
      "A better-paying role where I already know most of the work.",
      "A role with more learning opportunities and a lower starting salary.",
      "A role where I have more freedom and responsibility.",
      "A role with interesting projects and people I can learn from.",
    ],
    "What kind of opportunity would suit you best?",
  ),
  q(
    6,
    "When stuck",
    "Think about the last time you got stuck while doing something. What would you usually try first in that situation?",
    [
      "Search online and try to solve it myself.",
      "Ask someone who might know the answer.",
      "Try different approaches and learn through experimentation.",
      "Step back, think about the problem, and plan my next move.",
    ],
    "What would you normally do first?",
  ),
  q(
    7,
    "A satisfying day",
    "Which situation would make you feel most satisfied at the end of a normal day?",
    [
      "Discovering or understanding something new.",
      "Finishing something I had been struggling with.",
      "Making visible progress toward my goals.",
      "Having a good interaction or helping someone.",
    ],
    "What makes a day feel good to you?",
  ),
  q(
    8,
    "Handling disagreement",
    "When someone disagrees with your opinion or points out a mistake, what is closest to your usual reaction?",
    [
      "I try to understand their reasoning before responding.",
      "I explain why I thought differently and discuss it.",
      "I reflect on it privately before deciding what to change.",
      "I may react initially, but reconsider it after thinking about it.",
    ],
    "How do you usually react?",
  ),
  q(
    9,
    "Team role",
    "In a group project or team activity, which role do you usually take?",
    [
      "Organizing the work and keeping everyone on track.",
      "Coming up with ideas and exploring alternatives.",
      "Taking responsibility for completing specific tasks.",
      "Listening to people and helping the team work together.",
    ],
    "What role do you usually end up in?",
  ),
  q(
    10,
    "Decision driver",
    "Think about a recent decision that mattered to you. What usually influenced your final choice the most?",
    [
      "What I felt genuinely interested in.",
      "What seemed most practical and beneficial.",
      "What would help me grow in the long run.",
      "What felt right after considering the people and circumstances involved.",
    ],
    "What influenced your decision?",
  ),
  q(
    11,
    "Independent remote work",
    "How do you feel about working from home, where you need to stay curious, learn new things, manage your own time, and take responsibility for your work without someone constantly guiding you?",
    [
      "I'm excited about it because I enjoy learning and figuring things out independently.",
      "I'm comfortable with it and can stay productive with clear goals and deadlines.",
      "I can manage my work independently but would appreciate regular guidance and feedback.",
      "I prefer an office environment where I can learn directly from people around me.",
    ],
    "How do you feel about working this way?",
  ),
  q(
    12,
    "Delhi meetings",
    "If an in-person meeting is required in Delhi, potentially weekly or monthly depending on business needs, would you be willing and able to attend?",
    [
      "Yes, I can attend with reasonable advance notice.",
      "Yes, but I would need sufficient notice to arrange travel.",
      "I may be able to attend depending on the date and circumstances.",
      "Regular travel to Delhi would not be feasible for me.",
    ],
    "Tell us about your situation.",
  ),
  q(
    13,
    "Compensation ₹15k–₹20k",
    "Are you comfortable with the proposed monthly compensation of ₹15,000–₹20,000 during the initial six-month period?",
    [
      "Yes, the proposed range works for me.",
      "Yes, depending on the final salary offered within this range.",
      "I would like to discuss the compensation before confirming.",
      "No, my minimum expected compensation is higher.",
    ],
    "Share your thoughts on the compensation.",
  ),
  {
    ...q(
      13,
      "In-person meet 30–31 Oct",
      "Since the compensation works for you: we're planning an offline, in-person meet in Delhi on 30–31 October. Would you be able to attend?",
      [
        "Yes, I can attend on both days.",
        "Yes, but I can only attend one of the two days.",
        "I'd like to attend, but I need the details first (time, venue, travel).",
        "No, I can't make it on these dates.",
      ],
      "Tell us about your availability.",
    ),
    id: "q13_meet",
    label: "13a",
    showIf: { questionId: "q13", choices: ["a", "b"] },
  },
  q(
    14,
    "Performance review",
    "After the initial six months, compensation will be reviewed based on performance and organizational evaluation. How do you feel about this arrangement?",
    [
      "I am comfortable with a performance-based review.",
      "I would like to understand the evaluation criteria beforehand.",
      "I would prefer a clearly defined salary progression.",
      "I would need more clarity about the review and revision process.",
    ],
    "How do you feel about the review?",
  ),
  q(
    15,
    "How serious",
    "Considering the working arrangement, compensation, and possibility of hybrid work, how seriously are you considering this opportunity?",
    [
      "I am interested and ready to proceed if the final terms are agreed.",
      "I am interested but would like to clarify a few details first.",
      "I am exploring multiple opportunities before deciding.",
      "I do not think the current arrangement matches my expectations.",
    ],
    "Tell us where you stand.",
  ),
];

/** The headline count ("15 questions"). Follow-ups ride along with the
 * question they follow and don't add to it. */
export const TOTAL_QUESTIONS = QUESTIONS.filter((q) => !q.showIf).length;

/** Whether this question applies, given the answers so far. */
export function isAsked(
  question: Question,
  answers: Partial<Record<string, { choice: OptionId }>>,
): boolean {
  if (!question.showIf) return true;
  const choice = answers[question.showIf.questionId]?.choice;
  return choice !== undefined && question.showIf.choices.includes(choice);
}

export function optionLabel(question: Question, choice: string | undefined): string {
  return question.options.find((o) => o.id === choice)?.label ?? "";
}
