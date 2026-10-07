import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { Resend } from "resend";
import { FROM_EMAIL, escapeHtml, emailRow, emailShell, emailButton } from "@/lib/email";
import { clientIp } from "@/lib/rate-limit";
import { recordContactSubmission, markNotificationSent, markClickUpTaskLinked } from "@/lib/leads";
import { createClickUpLeadTask } from "@/lib/clickup";
import { guardRequest } from "@/lib/api-guard";
import { verifyTurnstile } from "@/lib/turnstile";
import { isValidPhone, normalizeWebsiteUrl } from "@/lib/utils";

const TO_EMAIL = "info@ethixweb.com";

// The contact form is a qualifier, not an intake questionnaire: it collects
// the three things needed to open a conversation (name, phone, website) and
// the rest is established on the call. Deliberately no email field - the
// follow-up is a phone call, so the number is what has to be right.
export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const guard = await guardRequest(
          request,
          `contact:${clientIp(request)}`,
          5,
          10 * 60 * 1000,
        );
        if (guard) return guard;

        const body = await request.json().catch(() => null);
        if (!body || typeof body !== "object") {
          return Response.json({ ok: false, error: "Invalid request body" }, { status: 400 });
        }

        const { name, phone, website, turnstileToken } = body as Record<string, unknown>;

        const turnstile = await verifyTurnstile(turnstileToken, request);
        if (!turnstile.ok) {
          if (turnstile.reason === "not_configured") {
            console.error("[api/contact] rejecting submission: Turnstile not configured");
            return Response.json(
              {
                ok: false,
                error: "Submissions are temporarily unavailable. Please try again later.",
              },
              { status: 503 },
            );
          }
          return Response.json(
            { ok: false, error: "Verification failed. Please try again." },
            { status: 403 },
          );
        }

        const cleanName = typeof name === "string" ? name.trim() : "";
        const cleanPhone = typeof phone === "string" ? phone.trim() : "";
        const rawWebsite = typeof website === "string" ? website.trim() : "";

        if (!cleanName || !cleanPhone || !rawWebsite) {
          return Response.json(
            { ok: false, error: "Name, phone and website are required" },
            { status: 400 },
          );
        }

        if (!isValidPhone(cleanPhone)) {
          return Response.json(
            { ok: false, error: "Please enter a valid phone number" },
            { status: 400 },
          );
        }

        const cleanWebsite = normalizeWebsiteUrl(rawWebsite);
        if (!cleanWebsite) {
          return Response.json(
            { ok: false, error: "Please enter a valid website address" },
            { status: 400 },
          );
        }

        // Durable record first - a bounced/filtered notification email must
        // never be the only trace of this lead. Best-effort: never throws,
        // and doesn't block the request if Supabase isn't configured.
        const leadId = await recordContactSubmission({
          name: cleanName,
          phone: cleanPhone,
          website: cleanWebsite,
        });

        // Mirror the lead into ClickUp (Team Space > Ethixweb > Leads) so it
        // lands in the team's follow-up queue as an assigned task. Best-effort
        // like the Supabase record - never blocks or fails the submission.
        const clickUpTaskId = await createClickUpLeadTask({
          name: cleanName,
          phone: cleanPhone,
          website: cleanWebsite,
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

        const firstName = cleanName.split(" ")[0] || cleanName;
        const websiteHost = new URL(cleanWebsite).hostname.replace(/^www\./, "");
        // Everything a dialler won't accept has to go, but a leading + is part
        // of the number for anyone outside the US.
        const dialable = cleanPhone.replace(/[^\d+]/g, "");

        const summaryRows = [
          emailRow("Name", escapeHtml(cleanName)),
          emailRow("Phone", `<a href="tel:${escapeHtml(dialable)}">${escapeHtml(cleanPhone)}</a>`),
          emailRow(
            "Website",
            `<a href="${escapeHtml(cleanWebsite)}">${escapeHtml(websiteHost)}</a>`,
          ),
        ].join("");

        const summaryTable = `<table role="presentation" width="100%" style="border-collapse:collapse;">${summaryRows}</table>`;

        // ── Internal notification (sent to the Ethixweb team) ──────────────
        const notificationHtml = emailShell({
          eyebrow: "New lead to qualify",
          footerText: "Sent automatically from the Ethixweb contact form &middot; ethixweb.com",
          bodyHtml: `
            <p style="margin:0 0 8px;font-size:15px;line-height:1.5;color:#1a1a1a;">
              <strong>${escapeHtml(cleanName)}</strong> just submitted the contact form. Give their site a look, then call to qualify:
            </p>
            ${summaryTable}
            <div style="margin-top:20px;">
              ${emailButton(`tel:${escapeHtml(dialable)}`, `Call ${escapeHtml(firstName)}`)}
            </div>`,
        });

        const resend = new Resend(apiKey);

        // Notification to the Ethixweb team is the critical send - the lead
        // is only considered captured if this succeeds. No reply-to: the form
        // no longer collects an email address, and the follow-up is a call.
        try {
          const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: TO_EMAIL,
            subject: `New lead: ${cleanName} (${websiteHost})`,
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

        return Response.json({ ok: true }, { status: 201 });
      },
    },
  },
});
