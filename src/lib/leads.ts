import { getSupabase } from "./supabase";

export interface ContactSubmissionInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string | null;
  timeline?: string | null;
  hearAbout?: string | null;
  projectDetails?: string;
}

export interface CareerApplicationInput {
  roleId?: string;
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string;
  linkedin?: string;
  portfolio?: string;
  github?: string;
  resumeUrl?: string;
  resumeName?: string;
  coverLetter?: string;
  experience?: string;
  currentCompany?: string;
  currentCtc?: string;
  expectedCtc?: string;
  noticePeriod?: string;
  availability?: string;
}

type LeadTable = "contact_submissions" | "career_applications";

/**
 * Durable record of a submission, written independently of whether the
 * notification email succeeds - a bounced/filtered/deleted email must never
 * mean a lost lead. Never throws: a missing/misconfigured Supabase project
 * must not take down the contact/apply forms, which have to keep working
 * without it. Failures are logged so they're visible in server logs.
 * Returns the inserted row id, or null if the write failed.
 */
async function insertLead(table: LeadTable, row: Record<string, unknown>): Promise<string | null> {
  try {
    const { data, error } = await getSupabase().from(table).insert(row).select("id").single();
    if (error) {
      console.error(`[leads] ${table} insert failed:`, error);
      return null;
    }
    return (data as { id: string } | null)?.id ?? null;
  } catch (err) {
    console.error(`[leads] ${table} insert threw:`, err);
    return null;
  }
}

/** Best-effort flag update once the notification email has been sent. */
export async function markNotificationSent(table: LeadTable, id: string | null): Promise<void> {
  if (!id) return;
  try {
    const { error } = await getSupabase()
      .from(table)
      .update({ notification_sent: true })
      .eq("id", id);
    if (error) console.error(`[leads] ${table} notification_sent update failed:`, error);
  } catch (err) {
    console.error(`[leads] ${table} notification_sent update threw:`, err);
  }
}

export function recordContactSubmission(input: ContactSubmissionInput): Promise<string | null> {
  return insertLead("contact_submissions", {
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    company: input.company || null,
    service: input.service || null,
    timeline: input.timeline || null,
    hear_about: input.hearAbout || null,
    project_details: input.projectDetails || null,
  });
}

/** Best-effort link between the Supabase lead row and its ClickUp task. */
export async function markClickUpTaskLinked(
  id: string | null,
  taskId: string | null,
): Promise<void> {
  if (!id || !taskId) return;
  try {
    const { error } = await getSupabase()
      .from("contact_submissions")
      .update({ clickup_task_id: taskId })
      .eq("id", id);
    if (error) console.error("[leads] clickup_task_id update failed:", error);
  } catch (err) {
    console.error("[leads] clickup_task_id update threw:", err);
  }
}

export function recordCareerApplication(input: CareerApplicationInput): Promise<string | null> {
  return insertLead("career_applications", {
    role_id: input.roleId || null,
    job_title: input.jobTitle,
    full_name: input.fullName,
    email: input.email,
    phone: input.phone,
    linkedin: input.linkedin || null,
    portfolio: input.portfolio || null,
    github: input.github || null,
    resume_url: input.resumeUrl || null,
    resume_name: input.resumeName || null,
    cover_letter: input.coverLetter || null,
    experience: input.experience || null,
    current_company: input.currentCompany || null,
    current_ctc: input.currentCtc || null,
    expected_ctc: input.expectedCtc || null,
    notice_period: input.noticePeriod || null,
    availability: input.availability || null,
  });
}
