import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { Resend } from "resend";
import { JOBS } from "@/lib/careers-data";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import {
  NOTICE_PERIOD_LABELS,
  FROM_EMAIL,
  REPLY_TO_INFO,
  escapeHtml,
  emailRow,
  emailShell,
  emailButton,
} from "@/lib/email";

const TO_EMAIL = "info@ethixweb.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/i;

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
        if (!checkRateLimit(`apply:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
          return Response.json(
            { ok: false, error: "Too many applications submitted. Please try again later." },
            { status: 429 },
          );
        }

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
        if (!payload.resumeUrl || !URL_RE.test(payload.resumeUrl)) {
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
          return Response.json(
            { ok: false, error: "Notice period is required" },
            { status: 400 },
          );
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

        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
          console.error("[api/careers/apply] RESEND_API_KEY is not configured");
          return Response.json(
            { ok: false, error: "Email service not configured" },
            { status: 500 },
          );
        }

        const firstName = payload.fullName.split(" ")[0] || payload.fullName;
        const noticeLabel = NOTICE_PERIOD_LABELS[payload.noticePeriod] ?? payload.noticePeriod;

        const summaryRows = [
          emailRow("Position", escapeHtml(payload.jobTitle)),
          emailRow("Name", escapeHtml(payload.fullName)),
          emailRow("Email", `<a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a>`),
          emailRow("Phone", `<a href="tel:${escapeHtml(payload.phone)}">${escapeHtml(payload.phone)}</a>`),
          emailRow("Experience", escapeHtml(payload.experience)),
          payload.currentCompany && emailRow("Current company", escapeHtml(payload.currentCompany)),
          payload.currentCtc && emailRow("Current CTC", escapeHtml(payload.currentCtc)),
          payload.expectedCtc && emailRow("Expected CTC", escapeHtml(payload.expectedCtc)),
          emailRow("Notice period", escapeHtml(noticeLabel)),
          payload.availability && emailRow("Availability", escapeHtml(payload.availability)),
          payload.linkedin &&
            emailRow("LinkedIn", `<a href="${escapeHtml(payload.linkedin)}">${escapeHtml(payload.linkedin)}</a>`),
          payload.portfolio &&
            emailRow("Portfolio", `<a href="${escapeHtml(payload.portfolio)}">${escapeHtml(payload.portfolio)}</a>`),
          payload.github &&
            emailRow("GitHub", `<a href="${escapeHtml(payload.github)}">${escapeHtml(payload.github)}</a>`),
        ]
          .filter(Boolean)
          .join("");

        const summaryTable = `<table role="presentation" width="100%" style="border-collapse:collapse;">${summaryRows}</table>`;
        const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

        const notificationHtml = emailShell({
          eyebrow: `New application - ${payload.jobTitle}`,
          footerText: "Sent automatically from the Ethixweb careers application form &middot; ethixweb.com",
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

        const confirmationHtml = emailShell({
          eyebrow: "Application Received",
          footerText: "This confirms your application to Ethixweb &middot; ethixweb.com",
          bodyHtml: `
            <p style="margin:0 0 8px;font-size:15px;line-height:1.5;color:#1a1a1a;">
              Hi ${escapeHtml(firstName)}, thanks for applying to Ethixweb for the <strong>${escapeHtml(payload.jobTitle)}</strong> role! We've received your details and resume below.
            </p>
            ${summaryTable}
            <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#444;">
              Our team reviews every application and will follow up within a few business days if there's a fit. In the meantime, feel free to reach us at
              <a href="mailto:${REPLY_TO_INFO}" style="color:#c0272d;">${REPLY_TO_INFO}</a>.
            </p>`,
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
        } catch (err) {
          console.error("[api/careers/apply] Resend notification threw:", err);
          return Response.json({ ok: false, error: "Failed to send email" }, { status: 502 });
        }

        try {
          const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: payload.email,
            replyTo: REPLY_TO_INFO,
            subject: "Application Received - Ethixweb",
            html: confirmationHtml,
          });
          if (error) {
            console.error("[api/careers/apply] Resend confirmation error:", error);
          }
        } catch (err) {
          console.error("[api/careers/apply] Resend confirmation threw:", err);
        }

        return Response.json({ ok: true });
      },
    },
  },
});
