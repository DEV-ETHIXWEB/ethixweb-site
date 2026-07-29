import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { Resend } from "resend";
import { z } from "zod";
import { clientIp } from "@/lib/rate-limit";
import { getSupabase, type ScreeningTestRow } from "@/lib/supabase";
import { scoreScreeningTest } from "@/lib/screening/anthropic";
import { getScreeningConfig } from "@/lib/screening/rubrics";
import { signDecisionToken } from "@/lib/screening/tokens";
import { escapeHtml, emailRow, emailShell, emailButton, FROM_EMAIL, APP_URL } from "@/lib/email";
import { guardRequest } from "@/lib/api-guard";

const bodySchema = z.object({
  testId: z.string().min(1),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      answer: z.string().max(8000),
    }),
  ),
  // .catch(0) rather than .optional().default(0): these are informational
  // proctoring counters, not security- or scoring-critical, so a malformed
  // value from a client-side bug should fall back to 0, not fail the whole
  // submission and strand a candidate who just finished a timed exam.
  tabSwitchCount: z.number().nonnegative().catch(0),
  blurCount: z.number().nonnegative().catch(0),
});

export const Route = createFileRoute("/api/screening/submit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const guard = await guardRequest(
          request,
          `screening-submit:${clientIp(request)}`,
          10,
          10 * 60 * 1000,
        );
        if (guard) return guard;

        const raw = await request.json().catch(() => null);
        const parsed = bodySchema.safeParse(raw);
        if (!parsed.success) {
          return Response.json(
            { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid submission" },
            { status: 400 },
          );
        }
        const { testId, answers, tabSwitchCount, blurCount } = parsed.data;

        const supabase = getSupabase();
        const { data: test, error: fetchError } = await supabase
          .from("screening_tests")
          .select("*")
          .eq("id", testId)
          .single<ScreeningTestRow>();

        if (fetchError || !test) {
          return Response.json({ ok: false, error: "Test not found" }, { status: 404 });
        }
        if (test.status !== "in_progress" && test.status !== "pending") {
          return Response.json(
            { ok: false, error: "This test has already been submitted" },
            { status: 409 },
          );
        }
        if (new Date(test.expires_at).getTime() < Date.now()) {
          await supabase.from("screening_tests").update({ status: "expired" }).eq("id", testId);
          return Response.json({ ok: false, error: "This test has expired" }, { status: 410 });
        }

        const config = getScreeningConfig(test.role_id);
        if (!config) {
          return Response.json({ ok: false, error: "Unknown role for this test" }, { status: 400 });
        }

        // Atomically claim the test before paying for an LLM scoring call.
        // The WHERE clause only matches rows still in a claimable state, so
        // under concurrent duplicate requests exactly one succeeds - the
        // other gets zero rows back and bails out before ever calling
        // scoreScreeningTest, instead of both scoring (and paying for) the
        // same test.
        const { data: claimed, error: claimError } = await supabase
          .from("screening_tests")
          .update({ status: "submitted", submitted_at: new Date().toISOString() })
          .eq("id", testId)
          .in("status", ["pending", "in_progress"])
          .select("id")
          .maybeSingle();

        if (claimError) {
          console.error("[api/screening/submit] Supabase claim error:", claimError);
          return Response.json({ ok: false, error: "Could not save the result" }, { status: 502 });
        }
        if (!claimed) {
          return Response.json(
            { ok: false, error: "This test has already been submitted" },
            { status: 409 },
          );
        }

        let scoring;
        try {
          scoring = await scoreScreeningTest(config, test.questions, answers);
        } catch (err) {
          console.error("[api/screening/submit] scoreScreeningTest threw:", err);
          return Response.json(
            {
              ok: false,
              error: "Could not score the test. Please contact us and we'll follow up.",
            },
            { status: 502 },
          );
        }

        const { error: updateError } = await supabase
          .from("screening_tests")
          .update({
            answers,
            status: "scored",
            total_score: scoring.totalScore,
            max_score: scoring.maxScore,
            scoring: scoring.perQuestion,
            overall_reasoning: scoring.overallReasoning,
            tab_switch_count: tabSwitchCount,
            blur_count: blurCount,
          })
          .eq("id", testId);

        if (updateError) {
          console.error("[api/screening/submit] Supabase update error:", updateError);
          return Response.json({ ok: false, error: "Could not save the result" }, { status: 502 });
        }

        await notifyReviewer(test, scoring);

        return Response.json({ ok: true });
      },
    },
  },
});

async function notifyReviewer(
  test: ScreeningTestRow,
  scoring: Awaited<ReturnType<typeof scoreScreeningTest>>,
) {
  const apiKey = process.env.RESEND_API_KEY;
  const reviewerEmail = process.env.SCREENING_REVIEWER_EMAIL;
  if (!apiKey || !reviewerEmail) {
    console.error(
      "[api/screening/submit] RESEND_API_KEY or SCREENING_REVIEWER_EMAIL not configured - " +
        "score was saved but no reviewer notification was sent.",
    );
    return;
  }

  const approve = signDecisionToken(test.id, "approved");
  const reject = signDecisionToken(test.id, "rejected");
  const approveUrl = `${APP_URL}/api/screening/decision?id=${test.id}&decision=approved&token=${approve.token}&exp=${approve.exp}`;
  const rejectUrl = `${APP_URL}/api/screening/decision?id=${test.id}&decision=rejected&token=${reject.token}&exp=${reject.exp}`;

  const perQuestionHtml = scoring.perQuestion
    .map(
      (q) =>
        `<div style="margin:0 0 14px;padding:12px 14px;background:#fafafa;border-radius:10px;">
          <div style="font-size:12px;font-weight:700;color:#c0272d;margin-bottom:4px;">${escapeHtml(q.questionId)} - ${q.score}/${q.maxScore}</div>
          <div style="font-size:13px;color:#333;">${escapeHtml(q.reasoning)}</div>
        </div>`,
    )
    .join("");

  const flagsHtml =
    test.tab_switch_count > 2 || test.blur_count > 2
      ? emailRow(
          "Proctoring signal",
          `${test.tab_switch_count} tab switches, ${test.blur_count} window blurs. Use judgment, not an automatic red flag.`,
        )
      : "";

  const bodyHtml = `
    <p style="margin:0 0 8px;font-size:15px;line-height:1.5;color:#1a1a1a;">
      <strong>${escapeHtml(test.candidate_name)}</strong> completed the screening test for
      <strong>${escapeHtml(test.role_id)}</strong>.
    </p>
    <table role="presentation" width="100%" style="border-collapse:collapse;margin:12px 0;">
      ${emailRow("Score", `${scoring.totalScore} / ${scoring.maxScore}`)}
      ${emailRow("Email", escapeHtml(test.candidate_email))}
      ${flagsHtml}
    </table>
    <p style="margin:16px 0 8px;font-size:13px;font-weight:700;color:#1a1a1a;">Overall reasoning</p>
    <p style="margin:0 0 16px;font-size:14px;color:#333;">${escapeHtml(scoring.overallReasoning)}</p>
    <p style="margin:16px 0 8px;font-size:13px;font-weight:700;color:#1a1a1a;">Per-question breakdown</p>
    ${perQuestionHtml}
    <div style="margin-top:24px;display:flex;gap:10px;">
      ${emailButton(approveUrl, "Approve → interview")}
      &nbsp;&nbsp;
      <a href="${rejectUrl}" style="display:inline-block;background:#fff;color:#c0272d;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:999px;border:1px solid #c0272d;">Reject</a>
    </div>`;

  const resend = new Resend(apiKey);
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: reviewerEmail,
      subject: `Screening result: ${test.candidate_name} (${scoring.totalScore}/${scoring.maxScore}) · ${test.role_id}`,
      html: emailShell({
        eyebrow: "Candidate screening result",
        footerText: "Nothing is auto-rejected. This is for your review only.",
        bodyHtml,
      }),
    });
    if (error) console.error("[api/screening/submit] Resend error:", error);
  } catch (err) {
    console.error("[api/screening/submit] Resend threw:", err);
  }
}
