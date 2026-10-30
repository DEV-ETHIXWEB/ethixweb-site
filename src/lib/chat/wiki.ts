/** Keyless general-knowledge lookup: the Wikipedia Action API.
 *
 * A model small enough to run in a browser tab has read a lot and remembers
 * little of it precisely - ask a 1.5B model for a date or a founder's name and
 * you get something plausible-shaped. So for anything the site's own corpus
 * cannot answer, we fetch real article intros and make the model answer *from*
 * them. The API is public, needs no key and sends CORS headers when called
 * with origin=*, which is what makes the whole page work without a server.
 *
 * Two calls per question, not one per result: `list=search` ranks articles,
 * then a single `prop=extracts` call pulls every intro at once. That matters -
 * Wikimedia rate-limits anonymous callers per IP and answers 429 for a cooling
 * period once tripped, which is reachable from an office behind one NAT. So
 * repeat questions are served from a session cache, and a throttle or an
 * outage is reported rather than swallowed: an answer built on "no sources
 * found" when the truth is "the lookup was refused" is the worst of both. */

export type WikiSnippet = {
  title: string;
  url: string;
  extract: string;
};

/** Why a lookup came back empty, when it was not simply a miss. */
export type WikiFailure = "rate-limited" | "unavailable";

export type WikiResult = {
  snippets: WikiSnippet[];
  failure?: WikiFailure;
};

class WikiError extends Error {
  constructor(readonly failure: WikiFailure) {
    super(failure);
  }
}

const API = "https://en.wikipedia.org/w/api.php";

/** Long enough to answer from, short enough that three of them plus the site
 * passages still leave the 4k context room to reply in. */
const EXTRACT_CHARS = 850;

function endpoint(params: Record<string, string>): string {
  const query = new URLSearchParams({ format: "json", origin: "*", ...params });
  return `${API}?${query.toString()}`;
}

async function getJson(url: string, signal?: AbortSignal): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  } catch {
    // Offline, DNS, or a blocked request. Indistinguishable from here.
    throw new WikiError("unavailable");
  }
  if (res.status === 429) throw new WikiError("rate-limited");
  if (!res.ok) throw new WikiError("unavailable");
  try {
    return await res.json();
  } catch {
    // A throttle page or captive portal answering with HTML.
    throw new WikiError("unavailable");
  }
}

/** Per-tab memo. Asking the same thing twice, or following up on it, should
 * not spend another pair of requests against the rate limit. */
const cache = new Map<string, WikiSnippet[]>();

/** Turns a natural question into a query Wikipedia's full-text search can
 * rank. This is not cosmetic: `list=search` scores every word, so grammar
 * words drag the ranking onto articles that merely use them a lot. Measured
 * against the live API, "WebGPU differs from WebGL" returns Web storage, Frame
 * (World Wide Web) and Device fingerprint, while "WebGPU WebGL" returns
 * WebGPU, WebGL and WebGPU Shading Language. So the filler comes out and the
 * nouns stay.
 *
 * Stripping can overshoot on short questions, so if fewer than two terms
 * survive we keep the lightly cleaned question instead. */
const FILLER = new Set(
  (
    "a about actually all also am an and any are as at basically be been being between but by can" +
    " compare compared could describe did differ difference differences different differs do does" +
    " exactly explain for from get give had has have how i if in into is it its just like main me" +
    " mean means meaning more most much my of on once only or other our out over please really" +
    " same say should so some such tell than that the their them then there these they this to told" +
    " up us used using versus very vs was were what whats when where which who whom whose why will" +
    " with would you your"
  )
    .split(" ")
    .filter(Boolean),
);

export function toSearchQuery(question: string): string {
  const cleaned = question
    .replace(/[?!.,;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const kept = cleaned.split(" ").filter((w) => w && !FILLER.has(w.toLowerCase()));
  if (kept.length >= 2) return kept.join(" ");
  return cleaned.length >= 3 ? cleaned : question.trim();
}

type SearchResponse = { query?: { search?: Array<{ title?: unknown }> } };
type ExtractResponse = {
  query?: { pages?: Record<string, { title?: unknown; extract?: unknown }> };
};

/** Top Wikipedia article intros for a question. Never throws: a failed lookup
 * comes back as `failure` so the caller can say what went wrong instead of
 * reporting an empty encyclopaedia. */
export async function searchWikipedia(
  question: string,
  limit = 3,
  signal?: AbortSignal,
): Promise<WikiResult> {
  const query = toSearchQuery(question);
  const cacheKey = `${query}::${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return { snippets: cached };

  try {
    const search = (await getJson(
      endpoint({
        action: "query",
        list: "search",
        srsearch: query,
        srlimit: String(limit),
        srnamespace: "0",
        srinfo: "",
        srprop: "",
      }),
      signal,
    )) as SearchResponse;

    const titles = (search.query?.search ?? [])
      .map((r) => (typeof r.title === "string" ? r.title : null))
      .filter((t): t is string => Boolean(t));
    if (titles.length === 0) {
      cache.set(cacheKey, []);
      return { snippets: [] };
    }

    const extracts = (await getJson(
      endpoint({
        action: "query",
        prop: "extracts",
        exintro: "1",
        explaintext: "1",
        redirects: "1",
        titles: titles.join("|"),
      }),
      signal,
    )) as ExtractResponse;

    const byTitle = new Map<string, string>();
    for (const page of Object.values(extracts.query?.pages ?? {})) {
      if (typeof page.title !== "string" || typeof page.extract !== "string") continue;
      const text = page.extract.replace(/\s+/g, " ").trim();
      if (text) byTitle.set(page.title, text);
    }

    // Keep the search ranking rather than the arbitrary order of `pages`.
    const snippets = titles
      .map((title) => {
        const extract = byTitle.get(title);
        if (!extract) return null;
        return {
          title,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
          extract: truncate(extract, EXTRACT_CHARS),
        };
      })
      .filter((s): s is WikiSnippet => s !== null);

    cache.set(cacheKey, snippets);
    return { snippets };
  } catch (err) {
    if (signal?.aborted) return { snippets: [] };
    return { snippets: [], failure: err instanceof WikiError ? err.failure : "unavailable" };
  }
}

/** Cuts at the last sentence boundary inside the budget so the model is never
 * handed half a fact. */
function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const stop = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("? "));
  return stop > max * 0.5 ? slice.slice(0, stop + 1) : `${slice.trimEnd()}...`;
}
