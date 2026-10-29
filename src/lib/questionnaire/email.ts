import { Resend } from "resend";
import { FROM_EMAIL, emailRow, emailShell, escapeHtml } from "@/lib/email";
import { QUESTIONS, SECTIONS } from "./questions";
import { readableAnswer } from "./service";
import type { AnswerMap, QuestionnaireCandidateRow } from "./types";

// Emails every accepted submission, in full, to the hiring inbox. The
// database row is the record of truth; this is the copy people actually
// read. A failed send never undoes or blocks the submission. It's written
// to the audit trail instead, so the admin dashboard shows which candidates'
// emails didn't go out, and the answers are still there and in the CSV.

const FALLBACK_TO = "info@ethixweb.com";

export async function sendSubmissionEmail(
  row: QuestionnaireCandidateRow,
  answers: AnswerMap,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[questionnaire-email] RESEND_API_KEY is not set; submission email skipped");
    return false;
  }

  const name = row.candidate_name ?? row.invited_name;
  const details = [
    emailRow("Name", escapeHtml(name)),
    emailRow("Email", escapeHtml(row.candidate_email ?? row.invited_email)),
    emailRow("Phone", escapeHtml(row.candidate_phone ?? "")),
    emailRow("College", escapeHtml(row.candidate_college ?? "")),
    emailRow(
      "LinkedIn",
      row.candidate_linkedin ? escapeHtml(row.candidate_linkedin) : "Not provided",
    ),
    emailRow("Candidate ID", escapeHtml(row.id)),
  ].join("");

  const sections = ([1, 2] as const)
    .map((section) => {
      const items = QUESTIONS.filter((q) => q.section === section)
        .map(
          (q) => `
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;">
              <div style="font-size:12px;color:#6b7076;margin-bottom:4px;"><strong>Q${q.number}.</strong> ${escapeHtml(q.text)}</div>
              <div style="font-size:15px;font-weight:600;color:#1a1a1a;white-space:pre-wrap;">${escapeHtml(readableAnswer(answers, q.id))}</div>
            </td>
          </tr>`,
        )
        .join("");
      return `
        <h3 style="margin:28px 0 4px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#9aa0a6;">Section ${section} · ${escapeHtml(SECTIONS[section].name)}</h3>
        <table role="presentation" width="100%">${items}</table>`;
    })
    .join("");

  const bodyHtml = `
    <h2 style="margin:0 0 6px;font-size:20px;color:#1a1a1a;">${escapeHtml(name)} completed the questionnaire</h2>
    <p style="margin:0 0 8px;font-size:13px;color:#6b7076;">Submitted ${escapeHtml(new Date().toUTCString())}</p>
    <table role="presentation" width="100%">${details}</table>
    ${sections}`;

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: FROM_EMAIL,
      to: process.env.QUESTIONNAIRE_REPORT_EMAIL || FALLBACK_TO,
      // Replies go straight to the candidate.
      replyTo: row.candidate_email ?? row.invited_email,
      // The name is candidate-typed; strip anything that could break a header.
      subject: `Candidate questionnaire - ${name.replace(/[\r\n]+/g, " ")}`,
      html: emailShell({
        eyebrow: "Candidate Questionnaire",
        footerText:
          "Automated copy of a candidate submission. Also stored in /admin/questionnaire.",
        bodyHtml,
      }),
    });
    if (error) {
      console.error("[questionnaire-email] Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[questionnaire-email] Resend threw:", err);
    return false;
  }
}
