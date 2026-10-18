-- A mindset attempt is one-shot: a submitted, scored or expired row for an
-- email blocks that person from ever starting again, and an abandoned run
-- gets finalized on their next try and then refused. That is the right
-- default against retakes, but it also means anyone whose exam broke under
-- them is locked out permanently with a part-finished score.
--
-- voided_at lets a recruiter set a single attempt aside so the candidate can
-- sit the paper again. The row is kept exactly as it was - nothing is
-- deleted or rewritten - it just stops counting as a prior attempt in
-- beginMindsetAssessment. Null for every existing row, so behaviour is
-- unchanged until someone deliberately voids something.

alter table mindset_assessments add column if not exists voided_at timestamptz;

create index if not exists mindset_voided_idx on mindset_assessments (voided_at);
