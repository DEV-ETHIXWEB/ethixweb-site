// ClickUp lead capture: every contact-form submission is mirrored as a task
// in the "Leads" list (Team Space > Ethixweb > Leads) so follow-up happens
// where the team already works. Best-effort by design - like the Supabase
// record in leads.ts, a missing token or a ClickUp outage must never take
// down the contact form. Failures are logged, never thrown.

import { SERVICE_LABELS, TIMELINE_LABELS, HEAR_ABOUT_LABELS } from "./email";

// Default follow-up owners for new leads (auto-assignment): Akash + Yash.
// Override with CLICKUP_LEADS_ASSIGNEES (comma-separated ClickUp user ids).
const DEFAULT_ASSIGNEES = [101061628, 101095459];

export interface ClickUpLeadInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string | null;
  timeline?: string | null;
  hearAbout?: string | null;
  message?: string;
}

function assigneesFromEnv(): number[] {
  const raw = process.env.CLICKUP_LEADS_ASSIGNEES;
  if (!raw) return DEFAULT_ASSIGNEES;
  const ids = raw
    .split(",")
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return ids.length > 0 ? ids : DEFAULT_ASSIGNEES;
}

/**
 * Creates a task in the ClickUp Leads list for a new website lead.
 * Returns the created task id, or null if ClickUp isn't configured or the
 * request failed. Never throws; capped at 8s so a slow ClickUp API can't
 * stall the form submission.
 */
export async function createClickUpLeadTask(input: ClickUpLeadInput): Promise<string | null> {
  const token = process.env.CLICKUP_API_TOKEN;
  const listId = process.env.CLICKUP_LEADS_LIST_ID;
  if (!token || !listId) {
    console.warn("[clickup] CLICKUP_API_TOKEN / CLICKUP_LEADS_LIST_ID not set - skipping task");
    return null;
  }

  const serviceLabel = input.service ? (SERVICE_LABELS[input.service] ?? input.service) : null;
  const timelineLabel = input.timeline ? (TIMELINE_LABELS[input.timeline] ?? input.timeline) : null;
  const hearAboutLabel = input.hearAbout
    ? (HEAR_ABOUT_LABELS[input.hearAbout] ?? input.hearAbout)
    : null;

  const lines = [
    "## New website lead",
    "",
    `**Name:** ${input.name}`,
    `**Email:** ${input.email}`,
    input.phone && `**Phone:** ${input.phone}`,
    input.company && `**Company:** ${input.company}`,
    serviceLabel && `**Service interested in:** ${serviceLabel}`,
    timelineLabel && `**Timeline:** ${timelineLabel}`,
    hearAboutLabel && `**How they heard about us:** ${hearAboutLabel}`,
    input.message && `**Message:**\n${input.message}`,
    "",
    "---",
    "**Follow-up checklist**",
    "- [ ] First reply sent (within 1 business day)",
    "- [ ] Discovery call booked",
    "- [ ] Proposal / roadmap sent",
    "- [ ] Outcome recorded (won / lost + reason)",
    "",
    "_Captured automatically from the ethixweb.com contact form._",
  ].filter(Boolean);

  const body = {
    name: serviceLabel ? `New lead: ${input.name} - ${serviceLabel}` : `New lead: ${input.name}`,
    markdown_description: lines.join("\n"),
    assignees: assigneesFromEnv(),
    // ClickUp priorities: 1 urgent, 2 high, 3 normal, 4 low. ASAP timelines
    // surface as high so they sort to the top of the follow-up queue.
    priority: input.timeline === "asap" ? 2 : 3,
  };

  try {
    const res = await fetch(`https://api.clickup.com/api/v2/list/${listId}/task`, {
      method: "POST",
      headers: { Authorization: token, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`[clickup] task create failed (${res.status}):`, text.slice(0, 500));
      return null;
    }

    const data = (await res.json().catch(() => null)) as { id?: string } | null;
    return data?.id ?? null;
  } catch (err) {
    console.error("[clickup] task create threw:", err);
    return null;
  }
}
