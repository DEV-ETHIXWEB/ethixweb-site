import { Resend } from "resend";
import { FROM_EMAIL, escapeHtml, emailRow, emailShell, emailButton } from "@/lib/email";
import { clientIp } from "@/lib/rate-limit";
import { recordContactSubmission, markNotificationSent, markClickUpTaskLinked } from "@/lib/leads";
import { createClickUpLeadTask } from "@/lib/clickup";
import { guardRequest } from "@/lib/api-guard";
import { verifyTurnstile } from "@/lib/turnstile";
import { isValidEmail } from "@/lib/utils";

// Shared POST handler for every campaign landing page's lead-submit endpoint
// (src/routes/api.landing.*.ts). One implementation, driven by per-campaign
// labels, so adding a new campaign never means re-copying this ~150 line
// validate -> Turnstile -> Supabase -> ClickUp -> Resend pipeline. Mirrors
// the same posture as /api/contact: durable record first, ClickUp/Resend
// best-effort or hard-failed exactly like the original route did.

const TO_EMAIL = "info@ethixweb.com";

const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
] as const;

function formatAttribution(raw: unknown): string {
  if (!raw || typeof raw !== "object") return "";
  const record = raw as Record<string, unknown>;
  const lines = ATTRIBUTION_KEYS.map((key) => {
    const value = record[key];
    return typeof value === "string" && value.trim()
      ? `${key}: ${value.trim().slice(0, 200)}`
      : null;
  }).filter((v): v is string => v !== null);
  return lines.join("\n");
}

export interface CampaignLeadHandlerConfig {
  /** Rate-limit bucket key prefix and log-line tag, e.g. "landing-fishing-seattle". */
  routeId: string;
  /** Human label used in the ClickUp task title/Resend subject, e.g. "Seattle Fishing Marketing Landing Page". */
  sourceLabel: string;
  /** Shown in the internal notification email footer, e.g. "the Seattle fishing/marine landing page". */
  emailFooterSource: string;
  businessTypeLabels: Record<string, string>;
  goalLabels: Record<string, string>;
}

export function createCampaignLeadHandler(cfg: CampaignLeadHandlerConfig) {
  return async ({ request }: { request: Request }) => {
    const guard = await guardRequest(
      request,
      `${cfg.routeId}:${clientIp(request)}`,
      5,
      10 * 60 * 1000,
    );
    if (guard) return guard;

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return Response.json({ ok: false, error: "Invalid request body" }, { status: 400 });
    }

    const {
      firstName,
      lastName,
      businessName,
      email,
      phone,
      website,
      businessType,
      goal,
      turnstileToken,
      attribution,
    } = body as Record<string, unknown>;

    const turnstile = await verifyTurnstile(turnstileToken, request);
    if (!turnstile.ok) {
      if (turnstile.reason === "not_configured") {
        console.error(`[api/${cfg.routeId}] rejecting submission: Turnstile not configured`);
        return Response.json(
          { ok: false, error: "Submissions are temporarily unavailable. Please try again later." },
          { status: 503 },
        );
      }
      return Response.json(
        { ok: false, error: "Verification failed. Please try again." },
        { status: 403 },
      );
    }

    const cleanFirst = typeof firstName === "string" ? firstName.trim() : "";
    const cleanLast = typeof lastName === "string" ? lastName.trim() : "";
    const cleanBusiness = typeof businessName === "string" ? businessName.trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim() : "";
    const cleanPhone = typeof phone === "string" ? phone.trim() : "";
    const cleanWebsite = typeof website === "string" ? website.trim() : "";
    const cleanBusinessType = typeof businessType === "string" ? businessType.trim() : "";
    const cleanGoal = typeof goal === "string" ? goal.trim() : "";

    const cleanName = [cleanFirst, cleanLast].filter(Boolean).join(" ");

    if (!cleanFirst || !cleanLast || !cleanEmail) {
      return Response.json(
        { ok: false, error: "First name, last name and email are required" },
        { status: 400 },
      );
    }

    if (!isValidEmail(cleanEmail)) {
      return Response.json(
        { ok: false, error: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    const businessTypeLabel = cleanBusinessType
      ? (cfg.businessTypeLabels[cleanBusinessType] ?? cleanBusinessType)
      : null;
    const goalLabel = cleanGoal ? (cfg.goalLabels[cleanGoal] ?? cleanGoal) : null;

    const attributionText = formatAttribution(attribution);

    const detailLines = [
      businessTypeLabel && `Business type: ${businessTypeLabel}`,
      goalLabel && `Primary goal: ${goalLabel}`,
      cleanWebsite && `Current website: ${cleanWebsite}`,
      attributionText && `Attribution:\n${attributionText}`,
    ].filter(Boolean);
    const projectDetails = detailLines.join("\n");

    const leadId = await recordContactSubmission({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      company: cleanBusiness,
      service: cfg.routeId,
      timeline: cleanGoal || null,
      hearAbout: cfg.routeId,
      projectDetails,
    });

    const clickUpTaskId = await createClickUpLeadTask({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      company: cleanBusiness,
      service: cfg.sourceLabel,
      timeline: cleanGoal || null,
      hearAbout: cfg.sourceLabel,
      message: projectDetails,
    });
    await markClickUpTaskLinked(leadId, clickUpTaskId);

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error(`[api/${cfg.routeId}] RESEND_API_KEY is not configured`);
      return Response.json({ ok: false, error: "Email service not configured" }, { status: 500 });
    }

    const summaryRows = [
      emailRow("Name", escapeHtml(cleanName)),
      cleanBusiness && emailRow("Business", escapeHtml(cleanBusiness)),
      businessTypeLabel && emailRow("Business type", escapeHtml(businessTypeLabel)),
      goalLabel && emailRow("Primary goal", escapeHtml(goalLabel)),
      cleanWebsite && emailRow("Current website", escapeHtml(cleanWebsite)),
      cleanPhone &&
        emailRow("Phone", `<a href="tel:${escapeHtml(cleanPhone)}">${escapeHtml(cleanPhone)}</a>`),
      emailRow("Email", `<a href="mailto:${escapeHtml(cleanEmail)}">${escapeHtml(cleanEmail)}</a>`),
    ]
      .filter(Boolean)
      .join("");

    const summaryTable = `<table role="presentation" width="100%" style="border-collapse:collapse;">${summaryRows}</table>`;

    const notificationHtml = emailShell({
      eyebrow: `${cfg.sourceLabel} growth audit request`,
      footerText: `Sent automatically from ${cfg.emailFooterSource} &middot; ethixweb.com`,
      bodyHtml: `
        <p style="margin:0 0 8px;font-size:15px;line-height:1.5;color:#1a1a1a;">
          <strong>${escapeHtml(cleanName)}</strong> requested a free growth audit from ${escapeHtml(cfg.emailFooterSource)}. Here's what they shared:
        </p>
        ${summaryTable}
        <div style="margin-top:20px;">
          ${emailButton(`mailto:${escapeHtml(cleanEmail)}`, `Reply to ${escapeHtml(cleanFirst)}`)}
        </div>`,
    });

    const resend = new Resend(apiKey);

    try {
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        replyTo: cleanEmail,
        subject: `Growth audit request: ${cleanBusiness || cleanName} (${cfg.sourceLabel})`,
        html: notificationHtml,
      });

      if (error) {
        console.error(`[api/${cfg.routeId}] Resend notification error:`, error);
        return Response.json({ ok: false, error: "Failed to send email" }, { status: 502 });
      }
      await markNotificationSent("contact_submissions", leadId);
    } catch (err) {
      console.error(`[api/${cfg.routeId}] Resend notification threw:`, err);
      return Response.json({ ok: false, error: "Failed to send email" }, { status: 502 });
    }

    return Response.json({ ok: true }, { status: 201 });
  };
}
