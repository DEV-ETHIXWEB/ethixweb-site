import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { Resend } from "resend";
import {
  SERVICE_LABELS,
  TIMELINE_LABELS,
  FROM_EMAIL,
  REPLY_TO_INFO,
  escapeHtml,
  emailRow,
  emailShell,
  emailButton,
} from "@/lib/email";

const TO_EMAIL = "info@ethixweb.com";

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => null);
        if (!body || typeof body !== "object") {
          return Response.json({ ok: false, error: "Invalid request body" }, { status: 400 });
        }

        const { service, timeline, other, name, phone, email } = body as Record<string, unknown>;

        const cleanName = typeof name === "string" ? name.trim() : "";
        const cleanEmail = typeof email === "string" ? email.trim() : "";
        const cleanPhone = typeof phone === "string" ? phone.trim() : "";
        const cleanOther = typeof other === "string" ? other.trim() : "";

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
        const firstName = cleanName.split(" ")[0] || cleanName;

        const summaryRows = [
          serviceLabel && emailRow("Service", escapeHtml(serviceLabel)),
          cleanOther && emailRow("Project details", escapeHtml(cleanOther)),
          timelineLabel && emailRow("Timeline", escapeHtml(timelineLabel)),
          emailRow("Name", escapeHtml(cleanName)),
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

        // ── Confirmation email (sent to the person who submitted the form) ──
        const confirmationHtml = emailShell({
          eyebrow: "We've got your message",
          footerText: "This confirms your submission to Ethixweb &middot; ethixweb.com",
          bodyHtml: `
            <p style="margin:0 0 8px;font-size:15px;line-height:1.5;color:#1a1a1a;">
              Hi ${escapeHtml(firstName)}, thanks for reaching out to Ethixweb! We've received your details below and our team will follow up within one business day with a clear, no jargon plan.
            </p>
            ${summaryTable}
            <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#9aa0a6;">
              Didn't submit this? You can safely ignore this email, or let us know at
              <a href="mailto:${REPLY_TO_INFO}" style="color:#c0272d;">${REPLY_TO_INFO}</a>.
            </p>`,
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
        } catch (err) {
          console.error("[api/contact] Resend notification threw:", err);
          return Response.json({ ok: false, error: "Failed to send email" }, { status: 502 });
        }

        // Confirmation to the user is best-effort - log failures but don't
        // fail the request, since the lead has already been captured.
        try {
          const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: cleanEmail,
            replyTo: REPLY_TO_INFO,
            subject: "We've received your message - Ethixweb",
            html: confirmationHtml,
          });

          if (error) {
            console.error("[api/contact] Resend confirmation error:", error);
          }
        } catch (err) {
          console.error("[api/contact] Resend confirmation threw:", err);
        }

        return Response.json({ ok: true });
      },
    },
  },
});
