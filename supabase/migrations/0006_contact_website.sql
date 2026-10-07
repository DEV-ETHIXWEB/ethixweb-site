-- The contact form is now a three-field qualifier: name, phone and the
-- prospect's website URL. Email is no longer asked for there (the team calls
-- the number instead), so it can't stay NOT NULL - but the campaign landing
-- forms in src/lib/campaigns/lead-handler.ts still collect it, which is why
-- the column stays rather than being dropped.

alter table contact_submissions alter column email drop not null;
alter table contact_submissions add column if not exists website text;
