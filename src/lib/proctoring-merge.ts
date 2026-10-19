/**
 * Append-only merge for proctoring evidence.
 *
 * Both exams used to assign the incoming array straight onto the row, which
 * broke in two opposite ways depending on how the client sends it:
 *
 *  - Violations are sent CUMULATIVELY (the client keeps its whole list and
 *    re-sends it), so a request carrying `[]` overwrote everything already
 *    recorded. A candidate could clear their own proctoring log.
 *  - Mic samples are sent INCREMENTALLY (the client drains its buffer), so
 *    assigning meant the row never held more than the most recent batch -
 *    the history was discarded on every autosave.
 *
 * Merging on a stable identity handles both: a re-sent batch cannot
 * duplicate, an incremental batch accumulates, and nothing the client sends
 * can shrink what is already on the row.
 *
 * `cap` keeps the newest N, matching the storage ceiling each exam defines.
 */
export function mergeProctoringEvents<T>(
  existing: readonly T[],
  incoming: readonly T[],
  key: (item: T) => string,
  cap: number,
): T[] | null {
  if (incoming.length === 0) return null;
  const seen = new Set(existing.map(key));
  const added = incoming.filter((item) => {
    const k = key(item);
    if (seen.has(k)) return false;
    // Guard against duplicates within the incoming batch itself, not just
    // against what is already stored.
    seen.add(k);
    return true;
  });
  if (added.length === 0) return null;
  return [...existing, ...added].slice(-cap);
}

/** Identity of a recorded violation. The client clock supplies `at`, which
 * only has to be stable across re-sends to work here. */
export function violationKey(v: { type: string; at: string; detail?: string }): string {
  return `${v.type}|${v.at}|${v.detail ?? ""}`;
}

export function micSampleKey(s: { at: string; level: number; active: boolean }): string {
  return `${s.at}|${s.level}|${s.active}`;
}
