import { Resend } from "resend";
import { escapeHtml, emailRow, emailShell, FROM_EMAIL } from "@/lib/email";
import { buildMindsetReportPdf } from "@/lib/mindset/pdf";
import { REASON_LABELS, categoryLabel } from "@/lib/mindset/labels";
import {
  MINDSET_VIOLATION_LABELS,
  type MindsetAssessmentRow,
  type MindsetPerQuestionResult,
  type MindsetScores,
  type MindsetSubmitReason,
} from "@/lib/mindset/types";

// Two Resend sends, both built on the shared email.ts helpers, mirroring
// gads/report.ts. Neither ever throws - a failed send is logged and
// swallowed so it can't take down finalizeMindsetAssessment (answers are
// already durably saved by the time these run); the caller only stamps a
// *_sent_at timestamp when the send actually succeeds.
//
// The recruiter mail carries a full PDF report as an attachment. If the PDF
// fails to render, the mail still goes out without it: a readable summary
// now beats a perfect attachment never.

const FALLBACK_RECRUITER_EMAIL = "info@ethixweb.com";

function formatDuration(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return "Unknown";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export async function sendMindsetCandidateConfirmation(
  row: MindsetAssessmentRow,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      `[mindset-report] RESEND_API_KEY not configured - candidate confirmation not sent (assessment ${row.id})`,
    );
    return false;
  }

  const bodyHtml = `
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1a1a1a;">Hi ${escapeHtml(row.candidate_name)},</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1a1a1a;">Thank you for taking the time to complete the Ethixweb screening assessment. We appreciate your interest in joining our team.</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1a1a1a;">Your responses have been successfully submitted and are currently under review by our hiring team.</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1a1a1a;">If your submission meets the requirements for the next stage of our recruitment process, we will contact you with further details.</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1a1a1a;">Thank you again for your time and effort.</p>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#1a1a1a;">
      Kind regards,<br />
      Ethixweb Hiring Team
    </p>`;

  const resend = new Resend(apiKey);
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: row.candidate_email,
      subject: "Assessment Submitted Successfully - Ethixweb",
      html: emailShell({
        eyebrow: "Mindset & Fit Assessment",
        footerText: "This is an automated confirmation from Ethixweb's recruitment platform.",
        bodyHtml,
      }),
    });
    if (error) {
      console.error("[mindset-report] candidate confirmation Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[mindset-report] candidate confirmation Resend threw:", err);
    return false;
  }
}

export async function sendMindsetRecruiterReport(
  row: MindsetAssessmentRow,
  scores: MindsetScores,
  perQuestion: MindsetPerQuestionResult[],
  reason: MindsetSubmitReason,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      `[mindset-report] RESEND_API_KEY not configured - recruiter report not sent (assessment ${row.id})`,
    );
    return false;
  }

  const majorViolationCount = row.violations.length;
  const violationsHtml =
    row.violations.length === 0
      ? `<p style="margin:0;font-size:14px;color:#1a1a1a;">None recorded.</p>`
      : `<ul style="margin:0;padding-left:18px;font-size:14px;line-height:1.7;color:#1a1a1a;">${row.violations
          .map(
            (v) =>
              `<li>${escapeHtml(MINDSET_VIOLATION_LABELS[v.type])} - ${new Date(v.at).toLocaleString()}</li>`,
          )
          .join("")}</ul>`;

  const categoryRows = Object.entries(scores.byCategory)
    .map(
      ([category, s]) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1a1a1a;">${escapeHtml(
          categoryLabel(category),
        )}</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:700;text-align:right;color:#1a1a1a;">${
          s.percent ?? "-"
        }%</td></tr>`,
    )
    .join("");

  const writtenAnswers = perQuestion.filter((p) => p.mechanic === "written");
  const writtenHtml = writtenAnswers
    .map((p) => {
      const q = row.questions.find((item) => item.id === p.questionId);
      return `
        <div style="margin:0 0 16px;padding:14px 16px;background:#fafafa;border-radius:12px;">
          <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#1a1a1a;">${escapeHtml(q?.question ?? "")}</p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#333;white-space:pre-wrap;">${
            p.answerText ? escapeHtml(p.answerText) : "<em>No answer provided.</em>"
          }</p>
        </div>`;
    })
    .join("");

  const submittedAt = row.submitted_at ? new Date(row.submitted_at).toLocaleString() : "Unknown";

  const bodyHtml = `
    <table role="presentation" width="100%" style="border-collapse:collapse;">
      ${emailRow("Candidate", escapeHtml(row.candidate_name))}
      ${emailRow("Email", escapeHtml(row.candidate_email))}
      ${emailRow("Phone", escapeHtml(row.candidate_phone))}
      ${emailRow("College", escapeHtml(row.candidate_college))}
      ${emailRow("Overall fit score", `${scores.overallPercent}%`)}
      ${emailRow("Submitted at", escapeHtml(submittedAt))}
      ${emailRow("Time taken", formatDuration(row.time_taken_seconds))}
      ${emailRow("How it ended", REASON_LABELS[reason])}
      ${emailRow("Proctoring events", String(majorViolationCount))}
    </table>

    <h3 style="margin:24px 0 10px;font-size:15px;color:#1a1a1a;">Category breakdown</h3>
    <table role="presentation" width="100%" style="border-collapse:collapse;">${categoryRows}</table>

    <h3 style="margin:24px 0 10px;font-size:15px;color:#1a1a1a;">Written answers (for review)</h3>
    ${writtenHtml}

    <h3 style="margin:24px 0 10px;font-size:15px;color:#1a1a1a;">Proctoring log</h3>
    ${violationsHtml}

    <p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">
      The attached PDF has the same summary plus every scored answer in full. Scores are fit
      signals, not right or wrong answers, and half the agreement statements are reverse scored,
      so agreeing with everything lands near 50 percent rather than full marks.
    </p>
  `;

  // A failed render must not cost the whole email - the summary above is
  // already the important part.
  let pdfBuffer: Buffer | null = null;
  try {
    pdfBuffer = await buildMindsetReportPdf(
      row,
      scores,
      perQuestion,
      reason,
      row.time_taken_seconds,
    );
  } catch (err) {
    console.error("[mindset-report] PDF render failed, sending without attachment:", err);
  }

  const safeName = row.candidate_name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  const resend = new Resend(apiKey);
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: process.env.MINDSET_RECRUITER_EMAIL || FALLBACK_RECRUITER_EMAIL,
      subject: `Mindset Assessment - ${row.candidate_name} (${scores.overallPercent}% fit score)`,
      html: emailShell({
        eyebrow: "Mindset & Fit Assessment - Recruiter Report",
        footerText: "This is an automated recruiter report from Ethixweb's recruitment platform.",
        bodyHtml,
      }),
      ...(pdfBuffer
        ? {
            attachments: [
              {
                filename: `mindset-assessment-${safeName || "candidate"}.pdf`,
                content: pdfBuffer,
              },
            ],
          }
        : {}),
    });
    if (error) {
      console.error("[mindset-report] recruiter report Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[mindset-report] recruiter report Resend threw:", err);
    return false;
  }
}
