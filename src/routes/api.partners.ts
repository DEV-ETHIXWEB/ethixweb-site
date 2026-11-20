import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { Resend } from "resend";
import { FROM_EMAIL, escapeHtml, emailRow, emailShell, emailButton } from "@/lib/email";
import { clientIp } from "@/lib/rate-limit";
import { createClickUpLeadTask } from "@/lib/clickup";
import { guardRequest } from "@/lib/api-guard";
import { verifyTurnstile } from "@/lib/turnstile";
import {
  FIELD_LIMITS,
  cleanField,
  cleanMultiline,
  isValidEmail,
  isValidPhone,
  normalizeWebsiteUrl,
} from "@/lib/utils";

const TO_EMAIL = "info@ethixweb.com";

const PARTNER_TYPES = {
  referral: "Refer a business",
  agency: "Agency or freelancer",
  other: "Software, supplier or other",
} as const;

// Partner program enquiries. Unlike the contact form this is a conversation
// with someone who isn't buying, so email is the required way back and phone
// is optional. Recorded as a ClickUp task (durable trace) and emailed to the
// team; rewards are deliberately never quoted here, they're agreed on a call.
export const Route = createFileRoute("/api/partners")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const guard = await guardRequest(request, `partners:${clientIp(request)}`, 5, 10 * 60 * 1000);
        if (guard) return guard;

        const body = await request.json().catch(() => null);
        if (!body || typeof body !== "object") {
          return Response.json({ ok: false, error: "Invalid request body" }, { status: 400 });
        }
        const { type, name, email, phone, company, website, message, turnstileToken } = body as Record<
          string,
          unknown
        >;

        const turnstile = await verifyTurnstile(turnstileToken, request);
        if (!turnstile.ok) {
          if (turnstile.reason === "not_configured") {
            console.error("[api/partners] rejecting submission: Turnstile not configured");
            return Response.json(
              { ok: false, error: "Submissions are temporarily unavailable. Please try again later." },
              { status: 503 },
            );
          }
          return Response.json({ ok: false, error: "Verification failed. Please try again." }, { status: 403 });
        }

        const partnerType = typeof type === "string" && type in PARTNER_TYPES ? (type as keyof typeof PARTNER_TYPES) : null;
        const cleanName = cleanField(name, FIELD_LIMITS.name);
        const cleanEmail = cleanField(email, FIELD_LIMITS.email).toLowerCase();
        const cleanPhone = cleanField(phone, FIELD_LIMITS.phone);
        const cleanCompany = cleanField(company, FIELD_LIMITS.company);
        const rawWebsite = cleanField(website, FIELD_LIMITS.website);
        const cleanMessage = cleanMultiline(message, FIELD_LIMITS.message);

        if (!partnerType || !cleanName || !cleanEmail) {
          return Response.json(
            { ok: false, error: "Please choose a partnership type and add your name and email" },
            { status: 400 },
          );
        }
        if (!isValidEmail(cleanEmail)) {
          return Response.json({ ok: false, error: "Please enter a valid email address" }, { status: 400 });
        }
        if (cleanPhone && !isValidPhone(cleanPhone)) {
          return Response.json({ ok: false, error: "Please enter a valid phone number" }, { status: 400 });
        }
        const cleanWebsite = rawWebsite ? normalizeWebsiteUrl(rawWebsite) : "";
        if (rawWebsite && !cleanWebsite) {
          return Response.json({ ok: false, error: "Please enter a valid website address" }, { status: 400 });
        }

        const typeLabel = PARTNER_TYPES[partnerType];

        await createClickUpLeadTask({
          title: `New partner (${typeLabel})`,
          source: "partner program form",
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone || undefined,
          company: cleanCompany || undefined,
          website: cleanWebsite || undefined,
          message: cleanMessage || undefined,
        });

        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
          console.error("[api/partners] RESEND_API_KEY is not configured");
          return Response.json({ ok: false, error: "Email service not configured" }, { status: 500 });
        }

        const rows = [
          emailRow("Partnership", escapeHtml(typeLabel)),
          emailRow("Name", escapeHtml(cleanName)),
          emailRow("Email", `<a href="mailto:${escapeHtml(cleanEmail)}">${escapeHtml(cleanEmail)}</a>`),
          cleanPhone && emailRow("Phone", escapeHtml(cleanPhone)),
          cleanCompany && emailRow("Company", escapeHtml(cleanCompany)),
          cleanWebsite && emailRow("Website", `<a href="${escapeHtml(cleanWebsite)}">${escapeHtml(cleanWebsite)}</a>`),
          cleanMessage && emailRow("Message", escapeHtml(cleanMessage).replace(/\n/g, "<br>")),
        ]
          .filter(Boolean)
          .join("");

        const html = emailShell({
          eyebrow: "New partner enquiry",
          footerText: "Sent automatically from the Ethixweb partner program form &middot; ethixweb.com/partners",
          bodyHtml: `
            <p style="margin:0 0 8px;font-size:15px;line-height:1.5;color:#1a1a1a;">
              <strong>${escapeHtml(cleanName)}</strong> wants to talk about partnering (${escapeHtml(typeLabel)}). Reply to set up a call:
            </p>
            <table role="presentation" width="100%" style="border-collapse:collapse;">${rows}</table>
            <div style="margin-top:20px;">
              ${emailButton(`mailto:${escapeHtml(cleanEmail)}`, `Email ${escapeHtml(cleanName.split(" ")[0] || cleanName)}`)}
            </div>`,
        });

        try {
          const { error } = await new Resend(apiKey).emails.send({
            from: FROM_EMAIL,
            to: TO_EMAIL,
            replyTo: cleanEmail,
            subject: `New partner: ${cleanName} (${typeLabel})`,
            html,
          });
          if (error) {
            console.error("[api/partners] Resend error:", error);
            return Response.json({ ok: false, error: "Failed to send email" }, { status: 502 });
          }
        } catch (err) {
          console.error("[api/partners] Resend threw:", err);
          return Response.json({ ok: false, error: "Failed to send email" }, { status: 502 });
        }

        return Response.json({ ok: true }, { status: 201 });
      },
    },
  },
});
