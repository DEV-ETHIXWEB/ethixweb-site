import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { Resend } from "resend";
import {
  SERVICE_LABELS,
  TIMELINE_LABELS,
  HEAR_ABOUT_LABELS,
  FROM_EMAIL,
  escapeHtml,
  emailRow,
  emailShell,
  emailButton,
} from "@/lib/email";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { recordContactSubmission, markNotificationSent, markClickUpTaskLinked } from "@/lib/leads";
import { createClickUpLeadTask } from "@/lib/clickup";
import { isSameOriginRequest } from "@/lib/origin-check";

const TO_EMAIL = "info@ethixweb.com";

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isSameOriginRequest(request)) {
          return Response.json({ ok: false, error: "Invalid request origin" }, { status: 403 });
        }

        if (!checkRateLimit(`contact:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
          return Response.json(
            { ok: false, error: "Too many requests. Please try again later." },
            { status: 429 },
          );
        }

        const body = await request.json().catch(() => null);
        if (!body || typeof body !== "object") {
          return Response.json({ ok: false, error: "Invalid request body" }, { status: 400 });
        }

        const { service, timeline, other, name, phone, email, company, hearAbout } =
          body as Record<string, unknown>;

        const cleanName = typeof name === "string" ? name.trim() : "";
        const cleanEmail = typeof email === "string" ? email.trim() : "";
        const cleanPhone = typeof phone === "string" ? phone.trim() : "";
        const cleanOther = typeof other === "string" ? other.trim() : "";
        const cleanCompany = typeof company === "string" ? company.trim() : "";
        const cleanHearAbout = typeof hearAbout === "string" ? hearAbout.trim() : "";

        if (!cleanName || !cleanEmail) {
          return Response.json(
            { ok: false, error: "Name and email are required" },
            { status: 400 },
          );
        }

        const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!EMAIL_RE.test(cleanEmail)) {
          return Response.json(
            { ok: false, error: "Please enter a valid email address" },
            { status: 400 },
          );
        }

        // Durable record first - a bounced/filtered notification email must
        // never be the only trace of this lead. Best-effort: never throws,
        // and doesn't block the request if Supabase isn't configured.
        const leadId = await recordContactSubmission({
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          company: cleanCompany,
          service: typeof service === "string" ? service : null,
          timeline: typeof timeline === "string" ? timeline : null,
          hearAbout: cleanHearAbout || null,
          projectDetails: cleanOther,
        });

        // Mirror the lead into ClickUp (Team Space > Ethixweb > Leads) so it
        // lands in the team's follow-up queue as an assigned task. Best-effort
        // like the Supabase record - never blocks or fails the submission.
        const clickUpTaskId = await createClickUpLeadTask({
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          company: cleanCompany,
          service: typeof service === "string" ? service : null,
          timeline: typeof timeline === "string" ? timeline : null,
          hearAbout: cleanHearAbout || null,
          message: cleanOther,
        });
        await markClickUpTaskLinked(leadId, clickUpTaskId);

        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
          console.error("[api/contact] RESEND_API_KEY is not configured");
          return Response.json(
            { ok: false, error: "Email service not configured" },
            { status: 500 },
          );
        }

        const serviceLabel =
          typeof service === "string" ? (SERVICE_LABELS[service] ?? service) : null;
        const timelineLabel =
          typeof timeline === "string" ? (TIMELINE_LABELS[timeline] ?? timeline) : null;
        const hearAboutLabel = cleanHearAbout
          ? (HEAR_ABOUT_LABELS[cleanHearAbout] ?? cleanHearAbout)
          : null;
        const firstName = cleanName.split(" ")[0] || cleanName;

        const summaryRows = [
          serviceLabel && emailRow("Service", escapeHtml(serviceLabel)),
          cleanOther && emailRow("Project details", escapeHtml(cleanOther)),
          timelineLabel && emailRow("Timeline", escapeHtml(timelineLabel)),
          emailRow("Name", escapeHtml(cleanName)),
          cleanCompany && emailRow("Company", escapeHtml(cleanCompany)),
          hearAboutLabel && emailRow("How they heard about us", escapeHtml(hearAboutLabel)),
          cleanPhone &&
            emailRow(
              "Phone",
              `<a href="tel:${escapeHtml(cleanPhone)}">${escapeHtml(cleanPhone)}</a>`,
            ),
          emailRow(
            "Email",
            `<a href="mailto:${escapeHtml(cleanEmail)}">${escapeHtml(cleanEmail)}</a>`,
          ),
        ]
          .filter(Boolean)
          .join("");

        const summaryTable = `<table role="presentation" width="100%" style="border-collapse:collapse;">${summaryRows}</table>`;

        // ── Internal notification (sent to the Ethixweb team) ──────────────
        const notificationHtml = emailShell({
          eyebrow: "New project inquiry",
          footerText: "Sent automatically from the Ethixweb contact form &middot; ethixweb.com",
          bodyHtml: `
            <p style="margin:0 0 8px;font-size:15px;line-height:1.5;color:#1a1a1a;">
              <strong>${escapeHtml(cleanName)}</strong> just submitted the contact form on the website. Here's what they shared:
            </p>
            ${summaryTable}
            <div style="margin-top:20px;">
              ${emailButton(`mailto:${escapeHtml(cleanEmail)}`, `Reply to ${escapeHtml(firstName)}`)}
            </div>`,
        });

        const resend = new Resend(apiKey);

        // Notification to the Ethixweb team is the critical send - the lead
        // is only considered captured if this succeeds.
        try {
          const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: TO_EMAIL,
            replyTo: cleanEmail,
            subject: `New project inquiry from ${cleanName}`,
            html: notificationHtml,
          });

          if (error) {
            console.error("[api/contact] Resend notification error:", error);
            return Response.json({ ok: false, error: "Failed to send email" }, { status: 502 });
          }
          await markNotificationSent("contact_submissions", leadId);
        } catch (err) {
          console.error("[api/contact] Resend notification threw:", err);
          return Response.json({ ok: false, error: "Failed to send email" }, { status: 502 });
        }

        // No confirmation email is sent to the submitted address: doing so
        // would let anyone use this endpoint to relay a branded email to an
        // arbitrary inbox with no ownership check. The in-app success state
        // already confirms receipt; the team reply (above) is the only
        // outbound email tied to the submitted address.
        return Response.json({ ok: true }, { status: 201 });
      },
    },
  },
});
