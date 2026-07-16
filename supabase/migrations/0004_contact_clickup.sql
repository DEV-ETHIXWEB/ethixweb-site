-- Contact form ClickUp lead capture: two new visitor-facing fields (company,
-- how-did-you-hear-about-us) plus a link to the ClickUp task each submission
-- is mirrored into (Team Space > Ethixweb > Leads). See src/lib/clickup.ts.
-- Columns are nullable: older rows and the direct-contact ("get a callback")
-- path don't have these values.

alter table contact_submissions add column if not exists company text;
alter table contact_submissions add column if not exists hear_about text;
alter table contact_submissions add column if not exists clickup_task_id text;
