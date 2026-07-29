import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { Resend } from "resend";
import { JOBS } from "@/lib/careers-data";
import { clientIp } from "@/lib/rate-limit";
import { recordCareerApplication, markNotificationSent } from "@/lib/leads";
import { guardRequest } from "@/lib/api-guard";
import {
  NOTICE_PERIOD_LABELS,
  FROM_EMAIL,
  escapeHtml,
  emailRow,
  emailShell,
  emailButton,
} from "@/lib/email";

const TO_EMAIL = "info@ethixweb.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/i;
// Vercel Blob's public storage host - resumeUrl must come from our own
// upload endpoint (api.careers.upload.ts), never an arbitrary external URL,
// since it's rendered as a clickable "Download Resume" link in the internal
// notification email.
const RESUME_HOST_RE = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i;

// Generic shape a candidate application is normalized into before it's sent
// anywhere. Swapping the notification step below for a Greenhouse/Lever/
// Ashby/Airtable API call later only means replacing how this object is
// delivered - the validation and shape stay the same.
interface ApplicationPayload {
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  portfolio: string;
  github: string;
  resumeUrl: string;
  resumeName: string;
  coverLetter: string;
  experience: string;
  currentCompany: string;
  currentCtc: string;
  expectedCtc: string;
  noticePeriod: string;
  availability: string;
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export const Route = createFileRoute("/api/careers/apply")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const guard = await guardRequest(
          request,
          `apply:${clientIp(request)}`,
          5,
          10 * 60 * 1000,
          "Too many applications submitted. Please try again later.",
        );
        if (guard) return guard;

        const body = await request.json().catch(() => null);
        if (!body || typeof body !== "object") {
          return Response.json({ ok: false, error: "Invalid request body" }, { status: 400 });
        }

        const data = body as Record<string, unknown>;
        const roleId = str(data.role);
        const job = JOBS.find((j) => j.id === roleId);
        const jobTitle = job?.title ?? (str(data.jobTitle) || "General Application");

        const payload: ApplicationPayload = {
          jobTitle,
          fullName: str(data.fullName),
          email: str(data.email),
          phone: str(data.phone),
          linkedin: str(data.linkedin),
          portfolio: str(data.portfolio),
          github: str(data.github),
          resumeUrl: str(data.resumeUrl),
          resumeName: str(data.resumeName),
          coverLetter: str(data.coverLetter),
          experience: str(data.experience),
          currentCompany: str(data.currentCompany),
          currentCtc: str(data.currentCtc),
          expectedCtc: str(data.expectedCtc),
          noticePeriod: str(data.noticePeriod),
          availability: str(data.availability),
        };

        if (!payload.fullName || !payload.email || !payload.phone) {
          return Response.json(
            { ok: false, error: "Name, email and phone are required" },
            { status: 400 },
          );
        }
        if (!EMAIL_RE.test(payload.email)) {
          return Response.json(
            { ok: false, error: "Please enter a valid email address" },
            { status: 400 },
          );
        }
        if (!payload.resumeUrl || !RESUME_HOST_RE.test(payload.resumeUrl)) {
          return Response.json(
            { ok: false, error: "A resume upload is required" },
            { status: 400 },
          );
        }
        if (!payload.experience) {
          return Response.json(
            { ok: false, error: "Years of experience is required" },
            { status: 400 },
          );
        }
        if (!payload.noticePeriod) {
          return Response.json({ ok: false, error: "Notice period is required" }, { status: 400 });
        }
        for (const [field, value] of [
          ["linkedin", payload.linkedin],
          ["portfolio", payload.portfolio],
          ["github", payload.github],
        ] as const) {
          if (value && !URL_RE.test(value)) {
            return Response.json(
              { ok: false, error: `Please enter a valid URL for ${field}` },
              { status: 400 },
            );
          }
        }

        // Durable record first - a bounced/filtered notification email must
        // never be the only trace of this application. Best-effort: never
        // throws, and doesn't block the request if Supabase isn't configured.
        const leadId = await recordCareerApplication({
          roleId: roleId || undefined,
          jobTitle: payload.jobTitle,
          fullName: payload.fullName,
          email: payload.email,
          phone: payload.phone,
          linkedin: payload.linkedin,
          portfolio: payload.portfolio,
          github: payload.github,
          resumeUrl: payload.resumeUrl,
          resumeName: payload.resumeName,
          coverLetter: payload.coverLetter,
          experience: payload.experience,
          currentCompany: payload.currentCompany,
          currentCtc: payload.currentCtc,
          expectedCtc: payload.expectedCtc,
          noticePeriod: payload.noticePeriod,
          availability: payload.availability,
        });

        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
          console.error("[api/careers/apply] RESEND_API_KEY is not configured");
          return Response.json(
            { ok: false, error: "Email service not configured" },
            { status: 500 },
          );
        }

        const noticeLabel = NOTICE_PERIOD_LABELS[payload.noticePeriod] ?? payload.noticePeriod;

        const summaryRows = [
          emailRow("Position", escapeHtml(payload.jobTitle)),
          emailRow("Name", escapeHtml(payload.fullName)),
          emailRow(
            "Email",
            `<a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a>`,
          ),
          emailRow(
            "Phone",
            `<a href="tel:${escapeHtml(payload.phone)}">${escapeHtml(payload.phone)}</a>`,
          ),
          emailRow("Experience", escapeHtml(payload.experience)),
          payload.currentCompany && emailRow("Current company", escapeHtml(payload.currentCompany)),
          payload.currentCtc && emailRow("Current CTC", escapeHtml(payload.currentCtc)),
          payload.expectedCtc && emailRow("Expected CTC", escapeHtml(payload.expectedCtc)),
          emailRow("Notice period", escapeHtml(noticeLabel)),
          payload.availability && emailRow("Availability", escapeHtml(payload.availability)),
          payload.linkedin &&
            emailRow(
              "LinkedIn",
              `<a href="${escapeHtml(payload.linkedin)}">${escapeHtml(payload.linkedin)}</a>`,
            ),
          payload.portfolio &&
            emailRow(
              "Portfolio",
              `<a href="${escapeHtml(payload.portfolio)}">${escapeHtml(payload.portfolio)}</a>`,
            ),
          payload.github &&
            emailRow(
              "GitHub",
              `<a href="${escapeHtml(payload.github)}">${escapeHtml(payload.github)}</a>`,
            ),
        ]
          .filter(Boolean)
          .join("");

        const summaryTable = `<table role="presentation" width="100%" style="border-collapse:collapse;">${summaryRows}</table>`;
        const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

        const notificationHtml = emailShell({
          eyebrow: `New application - ${payload.jobTitle}`,
          footerText:
            "Sent automatically from the Ethixweb careers application form &middot; ethixweb.com",
          bodyHtml: `
            <p style="margin:0 0 8px;font-size:15px;line-height:1.5;color:#1a1a1a;">
              <strong>${escapeHtml(payload.fullName)}</strong> just applied for <strong>${escapeHtml(payload.jobTitle)}</strong>. Submitted ${escapeHtml(timestamp)} PT.
            </p>
            ${payload.coverLetter ? `<p style="margin:16px 0;font-size:14px;line-height:1.6;color:#444;white-space:pre-wrap;">${escapeHtml(payload.coverLetter)}</p>` : ""}
            ${summaryTable}
            <div style="margin-top:20px;display:flex;gap:10px;">
              ${emailButton(escapeHtml(payload.resumeUrl), "Download Resume")}
            </div>`,
        });

        const resend = new Resend(apiKey);

        try {
          const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: TO_EMAIL,
            replyTo: payload.email,
            subject: `New application: ${payload.jobTitle} - ${payload.fullName}`,
            html: notificationHtml,
          });
          if (error) {
            console.error("[api/careers/apply] Resend notification error:", error);
            return Response.json({ ok: false, error: "Failed to send email" }, { status: 502 });
          }
          await markNotificationSent("career_applications", leadId);
        } catch (err) {
          console.error("[api/careers/apply] Resend notification threw:", err);
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
