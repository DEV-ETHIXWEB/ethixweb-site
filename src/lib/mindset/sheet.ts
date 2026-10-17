import {
  MINDSET_VIOLATION_LABELS,
  type MindsetAssessmentRow,
  type MindsetPerQuestionResult,
  type MindsetScores,
  type MindsetSubmitReason,
  type MindsetViolationType,
} from "@/lib/mindset/types";
import {
  CATEGORY_COLUMN_ORDER,
  REASON_LABELS,
  WRITTEN_COLUMN_ORDER,
  categoryLabel,
} from "@/lib/mindset/labels";

// Mirrors every finished sitting into a Google Sheet, so the hiring team has
// one living table of candidates instead of a folder of emails.
//
// Deliberately a webhook to a Google Apps Script rather than the Sheets API:
// Apps Script needs no Google Cloud project, no service account, no new npm
// dependency, and the sheet stays entirely in the team's own Drive. The
// setup is in supabase/README or the deploy notes; all this file needs is
// MINDSET_SHEET_WEBHOOK_URL.
//
// Best effort by design, exactly like the contact form's ClickUp mirror:
// the answers are already durably in Postgres and both emails have gone out
// by the time this runs, so a failure here is logged and swallowed rather
// than being allowed to fail a candidate's submission.

const TIMEOUT_MS = 8000;

/** Columns, in order. The Apps Script appends values positionally, so this
 * is a contract with the sheet: append new columns at the end, never
 * reorder or remove, or historical rows stop lining up with their headers. */
export const SHEET_COLUMNS: readonly string[] = [
  "Submitted at",
  "Name",
  "Email",
  "Phone",
  "College",
  "Overall fit %",
  "Time taken",
  "How it ended",
  "Questions skipped",
  "Tab switches",
  "Fullscreen exits",
  "Total proctoring events",
  "Proctoring detail",
  ...CATEGORY_COLUMN_ORDER.map((c) => `${categoryLabel(c)} %`),
  ...WRITTEN_COLUMN_ORDER.map((c) => `Written: ${categoryLabel(c)}`),
];

function formatDuration(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function countViolations(row: MindsetAssessmentRow, type: MindsetViolationType): number {
  return row.violations.filter((v) => v.type === type).length;
}

/** One line per distinct event type with a count, rather than every raw
 * timestamp: a spreadsheet cell holding 40 ISO strings is unreadable, and
 * the full log is already in the PDF and the database. */
function proctoringDetail(row: MindsetAssessmentRow): string {
  if (row.violations.length === 0) return "Clean";
  const counts = new Map<MindsetViolationType, number>();
  for (const v of row.violations) counts.set(v.type, (counts.get(v.type) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([type, count]) => `${MINDSET_VIOLATION_LABELS[type]} x${count}`)
    .join(", ");
}

/** Keyed by category, never by position: the open response prompts are
 * shuffled within their section, so reading them in order would file a
 * candidate's answer under the wrong heading. */
function writtenAnswersByCategory(row: MindsetAssessmentRow): Record<string, string> {
  const out: Record<string, string> = {};
  for (const q of row.questions) {
    if (q.mechanic !== "written") continue;
    const entry = row.answers[String(q.id)];
    out[q.category] = typeof entry?.value === "string" ? entry.value.trim() : "";
  }
  return out;
}

export function buildMindsetSheetRow(
  row: MindsetAssessmentRow,
  scores: MindsetScores,
  perQuestion: MindsetPerQuestionResult[],
  reason: MindsetSubmitReason,
  timeTakenSeconds: number | null,
): (string | number)[] {
  const scored = perQuestion.filter((p) => p.mechanic !== "written");
  const written = writtenAnswersByCategory(row);

  return [
    row.submitted_at ?? new Date().toISOString(),
    row.candidate_name,
    row.candidate_email,
    row.candidate_phone,
    row.candidate_college,
    scores.overallPercent,
    formatDuration(timeTakenSeconds),
    REASON_LABELS[reason],
    `${scored.filter((p) => p.skipped).length} of ${scored.length}`,
    countViolations(row, "tab_hidden"),
    countViolations(row, "fullscreen_exit"),
    row.violations.length,
    proctoringDetail(row),
    ...CATEGORY_COLUMN_ORDER.map((category) => scores.byCategory[category]?.percent ?? ""),
    ...WRITTEN_COLUMN_ORDER.map((category) => written[category] ?? ""),
  ];
}

export async function appendMindsetSheetRow(
  row: MindsetAssessmentRow,
  scores: MindsetScores,
  perQuestion: MindsetPerQuestionResult[],
  reason: MindsetSubmitReason,
  timeTakenSeconds: number | null,
): Promise<boolean> {
  const url = process.env.MINDSET_SHEET_WEBHOOK_URL;
  if (!url) {
    // Not configured is a normal state, not a failure: the feature works
    // without a sheet, so this is a debug line rather than an error.
    console.info(
      `[mindset-sheet] MINDSET_SHEET_WEBHOOK_URL not set, skipping sheet append (assessment ${row.id})`,
    );
    return false;
  }

  const payload = {
    columns: SHEET_COLUMNS,
    values: buildMindsetSheetRow(row, scores, perQuestion, reason, timeTakenSeconds),
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`[mindset-sheet] webhook returned ${res.status} (assessment ${row.id})`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[mindset-sheet] webhook failed:", err);
    return false;
  }
}
