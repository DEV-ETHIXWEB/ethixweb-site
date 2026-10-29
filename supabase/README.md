# Database

Migrations live in `supabase/migrations/`, applied in filename order. For a new
Supabase project, run each file once in the SQL editor (or via `supabase db push`
if you use the Supabase CLI), then set `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` in your environment (see `.env.example`).

Every table is written only by server-side API routes using the service role
key - Row Level Security is enabled on all of them with no anon/authenticated
policies, so RLS default-denies direct browser access regardless.

| Migration                          | Table(s)                                                                                                                           | Purpose                                                                                                                                                                                                                                                                                           |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0001_screening_tests.sql`         | `screening_tests`                                                                                                                  | AI candidate screening flow (start/submit/decision)                                                                                                                                                                                                                                               |
| `0002_leads.sql`                   | `contact_submissions`, `career_applications`, `rate_limits` + `check_rate_limit()`                                                 | Durable record of every contact/application submission (independent of whether the notification email is delivered), plus a shared, cross-instance rate limiter for the screening endpoints                                                                                                       |
| `0003_assessments.sql`             | `assessments`                                                                                                                      | AI assessment platform (`/careers/assessment`): 40 Gemini-generated questions with the server-only answer key, auto-saved answers, proctoring violations, deterministic scores, and webcam recording URLs                                                                                         |
| `0004_contact_clickup.sql`         | `contact_submissions` (alter)                                                                                                      | Adds `company`/`hear_about` fields and a `clickup_task_id` link for the ClickUp lead-capture mirror                                                                                                                                                                                               |
| `0005_google_ads_assessment.sql`   | `google_ads_assessments`                                                                                                           | Standalone, single-candidate, single-use Google Ads proctored exam - no admin system, exactly one row inserted via `scripts/create-gads-invite.mjs` before the link is sent                                                                                                                       |
| `0011_candidate_questionnaire.sql` | `questionnaire_candidates`, `questionnaire_responses`, `questionnaire_events` + `submit_questionnaire()`, `reopen_questionnaire()` | "Let's Get to Know You" questionnaire: one private invitation per candidate (token stored as SHA-256 only), one accepted response per invitation enforced by partial unique indexes and an atomic row-locking submit function, and an audit trail of every invite, open, submit, reopen and email |

When the schema needs to change, add a new numbered file rather than editing
an existing one - this keeps prod/staging in sync and gives every change a
rollback point.
