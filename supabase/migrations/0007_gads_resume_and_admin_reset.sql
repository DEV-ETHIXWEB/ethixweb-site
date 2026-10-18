-- Candidates were getting stranded mid-exam with no way back in, so a
-- reopened link now resumes the run instead of being a dead end. Closing the
-- tab was never an auto-submit (see ExamRunner's beforeunload, which only
-- prompts), but nothing counted or limited reopens either.
--
-- resume_count: incremented by /api/gads/state every time an already
-- in_progress run is loaded fresh. Capped at GADS_MAX_RESUMES in
-- src/lib/gads/types.ts. The count is also surfaced in the recruiter report
-- so an unusual number of reopens is visible rather than silent.

alter table google_ads_assessments add column if not exists resume_count int not null default 0;
