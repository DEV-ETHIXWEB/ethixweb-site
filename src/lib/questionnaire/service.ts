import { createHash, randomBytes } from "node:crypto";
import { QUESTIONS, optionLabel } from "./questions";
import { getQuestionnaireStore } from "./store";
import {
  effectiveStatus,
  type AnswerMap,
  type QuestionnaireCandidateRow,
  type QuestionnaireResponseRow,
} from "./types";

// Server-side helpers shared by the candidate and admin API routes.

/** 256 bits from the OS CSPRNG. The raw token only ever exists in the link
 * the recruiter copies; the database keeps its SHA-256. */
export function newInviteToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("hex");
  return { token, hash: hashInviteToken(token) };
}

export function hashInviteToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** The token goes in the URL fragment, not the path or query. Browsers never
 * send the fragment to the server, so it stays out of Vercel's request logs,
 * analytics and Referer headers; the page reads it from location.hash and
 * posts it in a request body. */
export function inviteLink(origin: string, token: string): string {
  return `${origin.replace(/\/$/, "")}/questionnaire#${token}`;
}

export async function loadByToken(token: string): Promise<QuestionnaireCandidateRow | null> {
  return getQuestionnaireStore().findByTokenHash(hashInviteToken(token));
}

/** First time the link is loaded: pending -> opened. Guarded on the status we
 * read, so two tabs opening at once record it once. */
export async function markOpened(
  row: QuestionnaireCandidateRow,
): Promise<QuestionnaireCandidateRow> {
  if (row.status !== "pending") return row;
  const updated = await getQuestionnaireStore().updateIf(
    row.id,
    { status: "pending" },
    { status: "opened", opened_at: new Date().toISOString() },
  );
  if (updated) {
    await getQuestionnaireStore().logEvent({
      candidate_id: row.id,
      action: "opened",
      actor: "candidate",
      detail: null,
    });
  }
  return updated ?? (await getQuestionnaireStore().getById(row.id)) ?? row;
}

/** One answer as a recruiter reads it: the option text, or the candidate's
 * own words for "other". */
export function readableAnswer(answers: AnswerMap, questionId: string): string {
  const question = QUESTIONS.find((q) => q.id === questionId);
  const value = answers[questionId];
  if (!question || !value) return "";
  if (value.choice === "other") return `Other: ${value.other ?? ""}`;
  return optionLabel(question, value.choice);
}

export function adminRow(row: QuestionnaireCandidateRow, response?: QuestionnaireResponseRow) {
  return {
    id: row.id,
    invitedName: row.invited_name,
    invitedEmail: row.invited_email,
    name: row.candidate_name,
    phone: row.candidate_phone,
    email: row.candidate_email,
    college: row.candidate_college,
    linkedin: row.candidate_linkedin,
    status: effectiveStatus(row),
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    openedAt: row.opened_at,
    submittedAt: row.submitted_at,
    revokedAt: row.revoked_at,
    // How far an unsubmitted candidate has got, for the "opened" rows.
    answeredSoFar: row.draft ? Object.keys(row.draft.answers ?? {}).length : 0,
    // The two answers a recruiter scans first: pay, and how serious they are.
    summary: response
      ? {
          compensation: readableAnswer(response.answers, "q13"),
          intent: readableAnswer(response.answers, "q15"),
        }
      : null,
  };
}

/** Spreadsheet apps execute a cell that starts with = + - @ (or a tab/CR
 * followed by one) as a formula, and the "other" answers are free text a
 * candidate typed. Prefix those with a quote so they open as text. */
function csvCell(value: string | number | null | undefined): string {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function responsesCsv(
  rows: QuestionnaireCandidateRow[],
  responses: Map<string, QuestionnaireResponseRow>,
): string {
  const header = [
    "Candidate ID",
    "Name",
    "Email",
    "Phone",
    "College",
    "LinkedIn",
    "Submitted at",
    ...QUESTIONS.flatMap((q) => [`Q${q.number} ${q.short}`, `Q${q.number} other`]),
  ];
  const lines = [header.map(csvCell).join(",")];
  for (const row of rows) {
    const response = responses.get(row.id);
    if (!response) continue;
    lines.push(
      [
        row.id,
        row.candidate_name ?? row.invited_name,
        row.candidate_email ?? row.invited_email,
        row.candidate_phone,
        row.candidate_college,
        row.candidate_linkedin,
        response.submitted_at,
        ...QUESTIONS.flatMap((q) => {
          const value = response.answers[q.id];
          return [
            value ? (value.choice === "other" ? "Other" : optionLabel(q, value.choice)) : "",
            value?.choice === "other" ? (value.other ?? "") : "",
          ];
        }),
      ]
        .map(csvCell)
        .join(","),
    );
  }
  // BOM so Excel reads the ₹ and any non-ASCII names as UTF-8.
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}
