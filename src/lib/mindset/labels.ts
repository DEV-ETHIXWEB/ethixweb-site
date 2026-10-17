import type { MindsetSubmitReason } from "@/lib/mindset/types";

// Human-readable names for the machine-readable keys, shared by the three
// places a candidate's result is presented: the recruiter email, the PDF
// attachment, and the spreadsheet row. Kept in one file so a category can
// never be called two different things in two different reports.

export const CATEGORY_LABELS: Record<string, string> = {
  // Trait categories, from the agreement statements.
  money_vs_mission: "Money vs. Mission",
  ownership_followthrough: "Ownership & Follow-Through",
  openness_other_roles: "Openness to Other Roles",
  relocation_delhi: "Relocation (Delhi)",
  curiosity_self_learning: "Curiosity & Self-Learning",
  failure_feedback: "Handling Failure / Feedback",
  deadline_procrastination: "Deadline / Procrastination",
  team_vs_solo: "Team vs. Solo Collaboration",
  long_term_commitment: "Long-Term Commitment",
  honesty_self_awareness: "Honesty & Self-Awareness",
  // Situational sub-topics.
  conflicting_priorities: "Conflicting Priorities",
  client_pushback: "Client Pushback",
  ambiguous_instructions: "Ambiguous Instructions",
  asking_for_help: "Asking for Help",
  feedback_reception: "Feedback Reception",
  deadline_aftermath: "Deadline Aftermath",
  role_flexibility: "Role Flexibility",
  team_conflict: "Team Conflict",
  // Open response prompts. One category each, because the prompts shuffle
  // and a spreadsheet column cannot identify an answer by position.
  written_free_time: "Free time",
  written_role_fit: "Open to another role",
};

/** The open response prompts, in the order their columns appear in the
 * sheet. Same contract as CATEGORY_COLUMN_ORDER: append, never reorder. */
export const WRITTEN_COLUMN_ORDER: readonly string[] = ["written_free_time", "written_role_fit"];

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

/** Fixed order for the spreadsheet's per-category columns. A sheet's columns
 * cannot shift between rows, so this list is the contract: append new
 * categories at the end, never reorder. */
export const CATEGORY_COLUMN_ORDER: readonly string[] = [
  "money_vs_mission",
  "ownership_followthrough",
  "openness_other_roles",
  "relocation_delhi",
  "curiosity_self_learning",
  "failure_feedback",
  "deadline_procrastination",
  "team_vs_solo",
  "long_term_commitment",
  "honesty_self_awareness",
  "conflicting_priorities",
  "client_pushback",
  "ambiguous_instructions",
  "asking_for_help",
  "feedback_reception",
  "deadline_aftermath",
  "role_flexibility",
  "team_conflict",
];

export const REASON_LABELS: Record<MindsetSubmitReason, string> = {
  manual: "Submitted by candidate",
  timer: "Auto-submitted when the 15 minute clock ran out",
  violations: "Auto-submitted after a proctoring violation",
  auto_expired: "Expired without an explicit submit, scored from what was saved",
};
