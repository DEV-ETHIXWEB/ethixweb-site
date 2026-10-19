import { Resend } from "resend";
import { escapeHtml, emailRow, emailShell, FROM_EMAIL } from "@/lib/email";
import { wordCount } from "@/lib/assessment/scoring";
import { buildGadsReportPdf } from "@/lib/gads/pdf";
import {
  GADS_MAJOR_VIOLATIONS,
  GADS_RECOMMENDATION_LABELS,
  GADS_VIOLATION_LABELS,
  type GadsAssessmentRow,
  type GadsPerQuestionResult,
  type GadsRecommendation,
  type GadsScores,
  type GadsSubmitReason,
} from "@/lib/gads/types";

// Two Resend sends, both built on the shared email.ts helpers. Neither ever
// throws - a failed send is logged and swallowed so it can't take down
// finalizeGadsAssessment (answers are already durably saved by the time
// these run); the caller only stamps a *_sent_at timestamp when the send
// actually succeeds.

const FALLBACK_RECRUITER_EMAIL = "info@ethixweb.com";

/** Exact required copy - only the emailShell wrapper is templated, the
 * wording itself is verbatim. */
export async function sendGadsCandidateConfirmation(row: GadsAssessmentRow): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      `[gads-report] RESEND_API_KEY not configured - candidate confirmation not sent (assessment ${row.id})`,
    );
    return false;
  }

  const bodyHtml = `
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1a1a1a;">Hi ${escapeHtml(row.candidate_name)},</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1a1a1a;">Thank you for taking the time to complete the Google Ads Assessment for Ethixweb. We appreciate your interest in joining our team.</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1a1a1a;">Your responses have been successfully submitted and are currently under review by our hiring team.</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1a1a1a;">If your assessment meets the requirements for the next stage of our recruitment process, we will contact you with further details.</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#1a1a1a;">Thank you again for your time and effort.</p>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#1a1a1a;">
      Kind regards,<br />
      Akash Lakhwan<br />
      Senior Developer<br />
      Ethixweb
    </p>`;

  const resend = new Resend(apiKey);
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: row.candidate_email,
      subject: "Assessment Submitted Successfully - Ethixweb",
      html: emailShell({
        eyebrow: "Google Ads Assessment",
        footerText: "This is an automated confirmation from Ethixweb's recruitment platform.",
        bodyHtml,
      }),
    });
    if (error) {
      console.error("[gads-report] candidate confirmation Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[gads-report] candidate confirmation Resend threw:", err);
    return false;
  }
}

const REASON_LABELS: Record<GadsSubmitReason, string> = {
  manual: "Submitted by candidate",
  timer: "Auto-submitted when the overall timer expired",
  violations: "Auto-submitted after repeated proctoring violations",
  auto_expired: "Expired without an explicit submit - scored from what was auto-saved",
};

const OUTCOME_COLORS: Record<GadsPerQuestionResult["outcome"], string> = {
  correct: "#15803d",
  partial: "#b45309",
  incorrect: "#b91c1c",
  unanswered: "#6b7280",
  review: "#1d4ed8",
};

const RECOMMENDATION_COLORS: Record<GadsRecommendation, string> = {
  highly_recommended: "#15803d",
  recommended: "#1d4ed8",
  borderline: "#b45309",
  not_recommended: "#b91c1c",
};

function formatDuration(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return "Unknown";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function scoreBar(label: string, percent: number | null): string {
  const pct = percent ?? 0;
  const color = pct >= 70 ? "#15803d" : pct >= 45 ? "#b45309" : "#b91c1c";
  return `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
        <div style="font-size:12px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">
          ${escapeHtml(label)} - ${percent === null ? "n/a" : `${pct}%`}
        </div>
        <div style="background:#f0f0f0;border-radius:99px;height:8px;overflow:hidden;">
          <div style="background:${color};height:8px;width:${Math.max(2, Math.min(100, pct))}%;border-radius:99px;"></div>
        </div>
      </td>
    </tr>`;
}

export async function sendGadsRecruiterReport(
  row: GadsAssessmentRow,
  scores: GadsScores,
  perQuestion: GadsPerQuestionResult[],
  recommendation: GadsRecommendation,
  suspiciousActivityScore: number,
  reason: GadsSubmitReason,
  timeTakenSeconds: number | null,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      `[gads-report] RESEND_API_KEY not configured - recruiter report not sent (assessment ${row.id})`,
    );
    return false;
  }
  const to = process.env.GADS_RECRUITER_EMAIL || FALLBACK_RECRUITER_EMAIL;

  const majorViolations = row.violations.filter((v) => GADS_MAJOR_VIOLATIONS.has(v.type));
  const violationCounts = new Map<string, number>();
  for (const v of row.violations)
    violationCounts.set(v.type, (violationCounts.get(v.type) ?? 0) + 1);

  const detailRows = [
    emailRow("Candidate", escapeHtml(row.candidate_name)),
    emailRow(
      "Email",
      `<a href="mailto:${escapeHtml(row.candidate_email)}">${escapeHtml(row.candidate_email)}</a>`,
    ),
    emailRow("Completion", escapeHtml(REASON_LABELS[reason])),
    emailRow("Time taken", escapeHtml(formatDuration(timeTakenSeconds))),
    emailRow(
      "Recommendation",
      `<span style="color:${RECOMMENDATION_COLORS[recommendation]};font-weight:700;">${escapeHtml(GADS_RECOMMENDATION_LABELS[recommendation])}</span>`,
    ),
    emailRow("Suspicious activity score", String(suspiciousActivityScore)),
    emailRow("Total violations", String(row.violations.length)),
  ].join("");

  const scoresHtml = `
    <table role="presentation" width="100%" style="border-collapse:collapse;margin:8px 0 4px;">
      ${scoreBar("Overall", scores.overallPercent)}
      ${scoreBar("Single Correct MCQ", scores.bySection.single.percent)}
      ${scoreBar("Multiple Correct MCQ", scores.bySection.multiple.percent)}
      ${scoreBar("Scenario-Based", scores.bySection.scenario.percent)}
      ${scoreBar("Written (indicative - read answers below)", scores.bySection.written.percent)}
    </table>`;

  const questionRows = perQuestion
    .map(
      (q) =>
        `<tr>
          <td style="padding:5px 8px 5px 0;font-size:12px;color:#6b7280;white-space:nowrap;">Q${q.questionId}</td>
          <td style="padding:5px 8px 5px 0;font-size:12px;color:#1a1a1a;">${escapeHtml(q.topic)}</td>
          <td style="padding:5px 8px 5px 0;font-size:12px;color:#6b7280;white-space:nowrap;">${escapeHtml(q.mechanic)} · ${escapeHtml(q.difficulty)}</td>
          <td style="padding:5px 8px 5px 0;font-size:12px;color:#1a1a1a;white-space:nowrap;">${q.elapsedSeconds}s</td>
          <td style="padding:5px 8px 5px 0;font-size:12px;color:#1a1a1a;white-space:nowrap;">${q.max > 0 ? `${q.earned}/${q.max}` : "-"}</td>
          <td style="padding:5px 0;font-size:12px;font-weight:700;color:${OUTCOME_COLORS[q.outcome]};white-space:nowrap;">${q.skipped ? "Skipped" : escapeHtml(q.outcome)}</td>
        </tr>`,
    )
    .join("");

  const writtenAnswers = (row.questions ?? [])
    .filter((q) => q.mechanic === "written")
    .map((q) => {
      const entry = row.answers[String(q.id)];
      const text = typeof entry?.value === "string" ? entry.value.trim() : "";
      return `
        <div style="margin:0 0 14px;padding:12px 14px;background:#fafafa;border-radius:10px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#c0272d;margin-bottom:4px;">
            Q${q.id} · ${escapeHtml(q.topic)}
          </div>
          <div style="font-size:13px;font-weight:600;color:#1a1a1a;margin-bottom:8px;">${escapeHtml(q.question)}</div>
          ${
            text
              ? `<div style="font-size:13px;color:#333;white-space:pre-wrap;">${escapeHtml(text)}</div>
                 <div style="margin-top:6px;font-size:11px;color:#9aa0a6;">${wordCount(text)} words (50-150 target)</div>`
              : `<div style="font-size:13px;color:#b91c1c;">No answer submitted</div>`
          }
        </div>`;
    })
    .join("");

  const violationsHtml =
    row.violations.length === 0
      ? `<p style="margin:0;font-size:13px;color:#15803d;font-weight:600;">No violations recorded.</p>`
      : `<p style="margin:0 0 8px;font-size:13px;color:#333;">
           <strong>${majorViolations.length}</strong> major, <strong>${row.violations.length}</strong> total.
         </p>` +
        Array.from(violationCounts.entries())
          .map(
            ([type, count]) =>
              `<div style="font-size:12px;color:#6b7280;padding:2px 0;">
                ${escapeHtml(GADS_VIOLATION_LABELS[type as keyof typeof GADS_VIOLATION_LABELS] ?? type)}: <strong>${count}</strong>
              </div>`,
          )
          .join("");

  const cameraMicHtml = `
    <p style="margin:0;font-size:13px;color:#333;">
      Camera snapshots captured: <strong>${row.camera_snapshots.length}</strong>.
      Mic activity samples: <strong>${row.mic_activity.length}</strong>.
      Recording segments: <strong>${row.recording_urls.length}</strong>.
    </p>`;

  const sectionTitle = (label: string) =>
    `<p style="margin:22px 0 8px;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#1a1a1a;">${label}</p>`;

  const bodyHtml = `
    <p style="margin:0 0 8px;font-size:15px;line-height:1.5;color:#1a1a1a;">
      <strong>${escapeHtml(row.candidate_name)}</strong> completed the Google Ads assessment -
      overall <strong>${scores.overallPercent}%</strong>.
    </p>
    <table role="presentation" width="100%" style="border-collapse:collapse;margin:12px 0;">${detailRows}</table>
    ${sectionTitle("Scores")}
    ${scoresHtml}
    ${sectionTitle("Written answers")}
    ${writtenAnswers || `<p style="margin:0;font-size:13px;color:#9aa0a6;">None.</p>`}
    ${sectionTitle("Proctoring")}
    ${violationsHtml}
    ${sectionTitle("Camera / microphone")}
    ${cameraMicHtml}
    ${sectionTitle("Per-question breakdown")}
    <table role="presentation" width="100%" style="border-collapse:collapse;">${questionRows}</table>
    <p style="margin:18px 0 0;font-size:12px;color:#9aa0a6;">Full report attached as PDF.</p>`;

  let pdfBuffer: Buffer | null = null;
  try {
    pdfBuffer = await buildGadsReportPdf(
      row,
      scores,
      perQuestion,
      recommendation,
      suspiciousActivityScore,
      timeTakenSeconds,
    );
  } catch (err) {
    console.error("[gads-report] PDF generation failed (sending email without attachment):", err);
  }

  const resend = new Resend(apiKey);
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: row.candidate_email,
      subject: `Google Ads Assessment: ${row.candidate_name} - ${scores.overallPercent}% · ${GADS_RECOMMENDATION_LABELS[recommendation]}`,
      html: emailShell({
        eyebrow: "Google Ads assessment report",
        footerText:
          "Written answers need a human read before deciding. Full data is stored in Supabase (google_ads_assessments table).",
        bodyHtml,
      }),
      ...(pdfBuffer
        ? {
            attachments: [
              {
                filename: `${row.candidate_name.replace(/\s+/g, "-")}-gads-report.pdf`,
                content: pdfBuffer,
              },
            ],
          }
        : {}),
    });
    if (error) {
      console.error("[gads-report] recruiter report Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[gads-report] recruiter report Resend threw:", err);
    return false;
  }
}
