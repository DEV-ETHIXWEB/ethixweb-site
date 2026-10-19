-- One attempt per PERSON, not per spelling of an address.
--
-- mindset_assessments enforced "one attempt ever per email" against the raw
-- candidate_email. The address is self-declared and never verified, and the
-- paper is a fixed question bank rather than a pool, so sub-addressing
-- ("me+1@gmail.com", "me+2@gmail.com") or Gmail's ignored dots
-- ("m.e@gmail.com") bought unlimited sittings of a paper the candidate had
-- already read.
--
-- candidate_email_identity collapses those spellings. candidate_email still
-- holds exactly what the candidate typed, because that is the address we
-- have to write to.
--
-- Mirrors normalizeEmailIdentity() in src/lib/utils.ts - if you change one,
-- change the other.

alter table mindset_assessments
  add column if not exists candidate_email_identity text
  generated always as (
    case
      -- Gmail: drop a "+tag" and every dot in the local part, and fold
      -- googlemail.com onto gmail.com.
      when split_part(lower(candidate_email), '@', 2) in ('gmail.com', 'googlemail.com')
        then replace(split_part(split_part(lower(candidate_email), '@', 1), '+', 1), '.', '')
             || '@gmail.com'
      -- Everyone else: drop a "+tag" only. Dots are significant.
      else split_part(split_part(lower(candidate_email), '@', 1), '+', 1)
           || '@' || split_part(lower(candidate_email), '@', 2)
    end
  ) stored;

create index if not exists mindset_email_identity_idx
  on mindset_assessments (candidate_email_identity);
