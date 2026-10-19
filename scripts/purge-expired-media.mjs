// Deletes proctoring media older than the retention period the privacy
// policy commits to (section 6: assessment recordings and proctoring
// records, up to 6 months).
//
// Nothing deleted this material before. Webcam video, audio and stills of
// job candidates accumulated in the blob store indefinitely, which is both a
// standing privacy exposure and a promise the policy could not keep.
//
// Run on a schedule (a Vercel cron, or by hand monthly):
//   node scripts/purge-expired-media.mjs          # report only
//   node scripts/purge-expired-media.mjs --apply  # actually delete
//
// Needs BLOB_READ_WRITE_TOKEN, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.

import { del, list } from "@vercel/blob";
import { createClient } from "@supabase/supabase-js";

const RETENTION_DAYS = 180;
const PREFIXES = ["gads-recordings/", "gads-snapshots/", "assessment-recordings/"];
const APPLY = process.argv.includes("--apply");

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error("BLOB_READ_WRITE_TOKEN is not set.");
  process.exit(1);
}

const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
const cutoffIso = new Date(cutoff).toISOString().slice(0, 10);
console.log(
  `[purge] retention ${RETENTION_DAYS} days - anything uploaded before ${cutoffIso} is expired.`,
);
if (!APPLY) console.log("[purge] dry run. Pass --apply to delete.\n");

let examined = 0;
const expired = [];

for (const prefix of PREFIXES) {
  let cursor;
  do {
    const page = await list({ prefix, cursor, limit: 1000, token });
    for (const blob of page.blobs) {
      examined++;
      if (new Date(blob.uploadedAt).getTime() < cutoff) expired.push(blob.url);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
}

console.log(`[purge] ${examined} blobs examined, ${expired.length} past retention.`);

if (expired.length > 0 && APPLY) {
  // del() takes up to 1000 urls per call.
  for (let i = 0; i < expired.length; i += 1000) {
    await del(expired.slice(i, i + 1000), { token });
  }
  console.log(`[purge] deleted ${expired.length} blobs.`);

  // Clear the now-dangling references so a recruiter is never shown a link
  // to something that has been purged.
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    for (const table of ["gads_assessments", "assessments"]) {
      const { error } = await supabase
        .from(table)
        .update({ recording_urls: [], camera_snapshots: [] })
        .lt("created_at", new Date(cutoff).toISOString());
      if (error) console.warn(`[purge] could not clear ${table} references: ${error.message}`);
      else console.log(`[purge] cleared expired media references on ${table}.`);
    }
  } else {
    console.warn("[purge] Supabase not configured - blob files deleted, row references left.");
  }
}
