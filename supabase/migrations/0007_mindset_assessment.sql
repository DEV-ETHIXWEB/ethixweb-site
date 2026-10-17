-- Standalone mindset & situational-judgment screener for Full-Stack Developer
-- candidates. Self-serve like `assessments` (0003): the candidate fills in
-- their own details at /api/mindset/begin, there is no admin invite step.
-- Forward-only navigation like `google_ads_assessments` (0005), but a single
-- 15 minute clock for the whole paper rather than per-question timers. One
-- continuous sitting, three sequential sections (agreement statements, then
-- situational judgment, then open response), one violation ladder, one
-- attempt ever per email (no retake window, unlike 0003's 30 days).
--
-- Security model: `questions` holds the full weighted answer key and is only
-- ever read by the server through the service role - API routes strip
-- `weights` before anything reaches the browser (see sanitizeMindsetQuestion
-- in src/lib/mindset/types.ts). `session_token_hash` is the SHA-256 of the
-- bearer token the browser keeps in localStorage; the raw token is never
-- stored.

create table if not exists mindset_assessments (
  id uuid primary key default gen_random_uuid(),

  candidate_name text not null,
  candidate_email text not null,
  candidate_phone text not null,
  candidate_college text not null,

  session_token_hash text not null,

  -- Full 35-question set INCLUDING weights, assembled once at begin (each
  -- section's question order, and a situational question's own option order,
  -- shuffled independently - see buildMindsetExam in
  -- src/lib/mindset/questions/index.ts). Server-only.
  questions jsonb not null,

  -- Committed answers: { "<questionId>": { value, elapsedSeconds, skipped } }.
  -- Written when the candidate advances past that question, or backfilled as
  -- skipped at finalize for anything never reached.
  answers jsonb not null default '{}'::jsonb,
  -- The current question's not-yet-committed pick, restored on a mid-
  -- question refresh without resetting current_index.
  draft_answer jsonb,

  -- Server-authoritative position in the forward-only sequence across all
  -- three sections. Every advance/submit call must match this exactly.
  current_index int not null default 0,
  -- Stamped every time current_index moves forward. Purely a stopwatch now
  -- that nothing is timed per question: it is what lets the recruiter report
  -- show how long a candidate sat on any single question.
  current_question_started_at timestamptz,

  -- Every proctoring event: [{ type, at, detail? }].
  violations jsonb not null default '[]'::jsonb,

  status text not null default 'in_progress'
    check (status in ('in_progress', 'submitted', 'scored', 'expired')),

  scores jsonb,          -- { overallPercent, byCategory: { [category]: SectionScore } }
  per_question jsonb,    -- [{ questionId, mechanic, category, elapsedSeconds, skipped, earned, max, outcome }]
  overall_percent numeric,
  time_taken_seconds int,
  submit_reason text
    check (submit_reason in ('manual', 'timer', 'violations', 'auto_expired')),

  candidate_confirmation_sent_at timestamptz,
  recruiter_report_sent_at timestamptz,

  created_at timestamptz not null default now(),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null, -- the whole sitting's ~30-minute hard ceiling, set at begin
  submitted_at timestamptz
);

create unique index if not exists mindset_token_hash_idx on mindset_assessments (session_token_hash);
-- Enforces "one attempt ever" - /api/mindset/begin checks this before
-- inserting a new row for an email that already has a submitted/scored one.
create index if not exists mindset_email_idx on mindset_assessments (candidate_email);
create index if not exists mindset_status_idx on mindset_assessments (status);

-- Server-only access (service role). No anon policies on purpose: the
-- candidate only ever goes through the API routes.
alter table mindset_assessments enable row level security;
