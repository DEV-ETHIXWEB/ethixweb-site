-- "Let's Get to Know You" candidate questionnaire (/questionnaire).
--
-- One private link per candidate, created by a recruiter at
-- /admin/questionnaire. The link carries a 256-bit bearer token in its URL
-- fragment; only the SHA-256 of that token is stored here. A candidate gets
-- exactly one accepted submission, and that rule lives in this file rather
-- than in the browser or the API routes:
--
--   * questionnaire_candidates_identity_idx: one live invitation per person.
--     A second invite for the same (normalized) email is refused while the
--     first is pending, opened or submitted. Revoked and expired invites
--     don't count, so a recruiter can reissue after either.
--   * questionnaire_responses_one_live_idx: one accepted response per
--     invitation. A reopened submission is kept, marked superseded, so the
--     audit trail survives a correction.
--   * submit_questionnaire(): locks the invitation row, checks its state,
--     inserts the response and flips the status in one transaction. Two
--     simultaneous submits serialize on the row lock and the second sees
--     'submitted'. If the insert fails, nothing is marked used.
--
-- Run once in the Supabase SQL editor after 0001-0010.

create table if not exists questionnaire_candidates (
  id uuid primary key default gen_random_uuid(),

  -- Entered by the recruiter when creating the invite. invited_email is the
  -- address the candidate has to type back on the details step.
  invited_name text not null,
  invited_email text not null,
  -- Mirrors normalizeEmailIdentity() in src/lib/utils.ts (same expression as
  -- 0010_mindset_email_identity.sql). Change one, change the other.
  email_identity text generated always as (
    case
      when split_part(lower(invited_email), '@', 2) in ('gmail.com', 'googlemail.com')
        then replace(split_part(split_part(lower(invited_email), '@', 1), '+', 1), '.', '')
             || '@gmail.com'
      else split_part(split_part(lower(invited_email), '@', 1), '+', 1)
           || '@' || split_part(lower(invited_email), '@', 2)
    end
  ) stored,

  token_hash text not null,

  status text not null default 'pending'
    check (status in ('pending', 'opened', 'submitted', 'expired', 'revoked')),

  -- What the candidate fills in on the details step. Null until then.
  candidate_name text,
  candidate_phone text,
  candidate_email text,
  candidate_college text,
  candidate_linkedin text,
  profile_completed_at timestamptz,

  -- Unsubmitted progress, so a refresh or a closed tab resumes rather than
  -- starting over: { answers: { q1: { choice, other? } ... }, step }.
  draft jsonb,
  draft_updated_at timestamptz,

  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  opened_at timestamptz,
  submitted_at timestamptz,
  revoked_at timestamptz
);

create unique index if not exists questionnaire_candidates_token_idx
  on questionnaire_candidates (token_hash);
create unique index if not exists questionnaire_candidates_identity_idx
  on questionnaire_candidates (email_identity)
  where status in ('pending', 'opened', 'submitted');
create index if not exists questionnaire_candidates_created_idx
  on questionnaire_candidates (created_at desc);

create table if not exists questionnaire_responses (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references questionnaire_candidates (id) on delete cascade,
  -- { q1: { choice: 'a'|'b'|'c'|'d'|'other', other?: text } ... q15 }.
  -- Validated by the API route before it gets here (see
  -- src/lib/questionnaire/types.ts).
  answers jsonb not null,
  form_version int not null,
  user_agent text,
  submitted_at timestamptz not null default now(),
  -- Set when a recruiter reopens the submission for correction. The row is
  -- kept; it just stops being the live answer.
  superseded_at timestamptz
);

create unique index if not exists questionnaire_responses_one_live_idx
  on questionnaire_responses (candidate_id)
  where superseded_at is null;

-- Who did what to an invitation and when. Written by the two functions below
-- and by the admin API.
create table if not exists questionnaire_events (
  id bigint generated always as identity primary key,
  candidate_id uuid not null references questionnaire_candidates (id) on delete cascade,
  action text not null,
  actor text not null check (actor in ('candidate', 'admin', 'system')),
  detail text,
  at timestamptz not null default now()
);

create index if not exists questionnaire_events_candidate_idx
  on questionnaire_events (candidate_id, at);

alter table questionnaire_candidates enable row level security;
alter table questionnaire_responses enable row level security;
alter table questionnaire_events enable row level security;

-- Returns one of: ok, not_found, already_submitted, revoked, expired,
-- no_profile.
create or replace function submit_questionnaire(
  p_token_hash text,
  p_answers jsonb,
  p_form_version int,
  p_user_agent text
)
returns text
language plpgsql
set search_path = public
as $$
declare
  v_row questionnaire_candidates%rowtype;
begin
  select * into v_row
  from questionnaire_candidates
  where token_hash = p_token_hash
  for update;

  if not found then return 'not_found'; end if;
  if v_row.status = 'submitted' then return 'already_submitted'; end if;
  if v_row.status = 'revoked' then return 'revoked'; end if;
  if v_row.status = 'expired' or v_row.expires_at <= now() then return 'expired'; end if;
  if v_row.profile_completed_at is null then return 'no_profile'; end if;

  begin
    insert into questionnaire_responses (candidate_id, answers, form_version, user_agent)
    values (v_row.id, p_answers, p_form_version, left(p_user_agent, 300));
  exception when unique_violation then
    return 'already_submitted';
  end;

  update questionnaire_candidates
  set status = 'submitted', submitted_at = now(), draft = null, draft_updated_at = null
  where id = v_row.id;

  insert into questionnaire_events (candidate_id, action, actor)
  values (v_row.id, 'submitted', 'candidate');

  return 'ok';
end;
$$;

-- Admin-only correction path. Supersedes the live response, puts its answers
-- back in the draft so the candidate edits rather than starts over, and
-- reopens the invitation for at least another seven days. Returns ok,
-- not_found or not_submitted.
create or replace function reopen_questionnaire(p_candidate_id uuid, p_reason text)
returns text
language plpgsql
set search_path = public
as $$
declare
  v_row questionnaire_candidates%rowtype;
  v_answers jsonb;
begin
  select * into v_row
  from questionnaire_candidates
  where id = p_candidate_id
  for update;

  if not found then return 'not_found'; end if;
  if v_row.status <> 'submitted' then return 'not_submitted'; end if;

  update questionnaire_responses
  set superseded_at = now()
  where candidate_id = v_row.id and superseded_at is null
  returning answers into v_answers;

  update questionnaire_candidates
  set status = 'opened',
      submitted_at = null,
      draft = jsonb_build_object('answers', coalesce(v_answers, '{}'::jsonb), 'step', 0),
      draft_updated_at = now(),
      expires_at = greatest(expires_at, now() + interval '7 days')
  where id = v_row.id;

  insert into questionnaire_events (candidate_id, action, actor, detail)
  values (v_row.id, 'reopened', 'admin', left(p_reason, 500));

  return 'ok';
end;
$$;

-- Only the service role (our API routes) may call these.
revoke all on function submit_questionnaire(text, jsonb, int, text) from public, anon, authenticated;
revoke all on function reopen_questionnaire(uuid, text) from public, anon, authenticated;
