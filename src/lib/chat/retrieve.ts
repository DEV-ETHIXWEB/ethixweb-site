import {
  LOCAL_HIT_CONFIDENT,
  LOCAL_HIT_FLOOR,
  LOCAL_HIT_MARGIN,
  KNOWLEDGE,
  OVERVIEW_DOCS,
  searchKnowledge,
  tokenize,
} from "@/lib/chat/knowledge";
import { searchWikipedia, type WikiFailure } from "@/lib/chat/wiki";

/** Turns a question into the grounded context the model answers from.
 *
 * Routing is deliberately boring: anything that matches this site's own
 * corpus is answered from the site, anything else goes to Wikipedia, and a
 * question that does both gets both. The model is never asked to answer from
 * memory alone - when retrieval comes back empty it is told to say so. */

export type Source = {
  kind: "site" | "web";
  title: string;
  /** Site path or absolute Wikipedia URL. */
  href?: string;
  text: string;
};

export type Retrieved = {
  sources: Source[];
  /** True when a Wikipedia lookup actually ran, so the UI can say so. */
  usedWeb: boolean;
  /** Set when that lookup was refused rather than simply finding nothing. */
  webFailure?: WikiFailure;
  /** A curated reply that answers the question outright. Set only when a
   * company passage matched confidently: the panel shows it as is, and no
   * model runs. */
  direct?: string;
};

/** Signals the question is about us even when the wording is generic -
 * "do you build chatbots" has no term in common with the corpus title but is
 * plainly a site question. */
const FIRST_PERSON =
  /\b(you|your|yours|ethixweb|ethix\s?web|this (site|company|agency|studio)|we|(my|our) (website|site|business|company|shop|store|brand|leads|ads|seo))\b/i;

/** A follow-up carries its subject in the previous turn, not in itself: "and
 * the second one?" retrieves nothing on its own. When the question is too
 * thin to search with, the previous question is folded into the search text
 * (never into the answer), which is the cheapest useful form of coreference. */
/** Too thin to stand on its own: "and the second one?", "when was she
 * born?", "why?". Shared by retrieval and the panel, which both need the
 * previous question to make sense of it.
 *
 * Shortness alone is not the test. "Who was Ada Lovelace?" has two content
 * words and is completely self contained; treating it as a follow up glued
 * it to the previous question about pricing and answered with our timeline.
 * A follow up either opens like one ("and", "what about") or leans on a
 * reference it cannot resolve itself ("she", "it"), and names nothing of its
 * own: a capitalised name after the first word means it brought its subject. */
export function isFollowUp(question: string): boolean {
  const q = question.trim();
  if (/^(and|also|what about|how about|why|then|so|more|tell me more|go on)\b/i.test(q))
    return true;
  const namesSomething = /\s[A-Z][a-z]/.test(q);
  const leansOnReference = /\b(she|he|they|it|its|them|her|him|his|their|that|those|these)\b/i.test(
    q,
  );
  return leansOnReference && !namesSomething && tokenize(q).length <= 3;
}

function searchText(question: string, previous?: string): string {
  if (!previous) return question;
  return isFollowUp(question) ? `${previous} ${question}` : question;
}

/** Questions recognised by their shape rather than their words.
 *
 * Some of the most valuable things a visitor types are the vaguest: "my site
 * needs work", "I want more customers". Every word in them is common across
 * the corpus, so keyword ranking scatters ("my site needs work" matched the
 * passage about how this assistant works). These are routed explicitly to
 * the passages that answer them, the way a support team keeps answers ready
 * for its top questions. First match wins. */
const INTENT_ROUTES: Array<{ test: (q: string) => boolean; docs: string[]; answer?: string }> = [
  {
    // The company as a whole: "what is this company", "tell me about you guys".
    test: (q) =>
      /\b((what|who) (is|are) (this|your|the) (company|agency|business|studio|firm|team)|what is ethixweb|who is ethixweb|tell me about (ethixweb|your company|yourselves|you guys|the company)|who are you guys|about ethixweb|what do you guys do|what does (your|this) (company|agency) do)\b/i.test(
        q,
      ),
    docs: ["about"],
  },
  {
    // A problem with their own site.
    test: (q) =>
      /\b(my|our) (website|site|web site|homepage)\b/i.test(q) &&
      /\b(help|fix|improve|redo|redesign|update|rebuild|refresh|work|problem|issue|broken|slow|old|outdated|ugly|need|needs|bad|not working|convert)\b/i.test(
        q,
      ),
    docs: ["service-website", "service-support"],
    answer:
      "Yes, we can help with that. Most website work we do falls into four areas: a redesign built around how your business sells, landing pages that turn ad traffic into leads, speed and security fixes, and ongoing maintenance after launch. The quickest way to know what yours needs is a free call. The team looks at your site first and calls you within one business day.",
  },
  {
    // What we charge. Only when the question is about our work: "how much
    // does a heat pump cost" is a general question and must not get our
    // pricing answer.
    test: (q) =>
      /\b(cost|costs|price|prices|pricing|how much|charge|charges|rates?|budget|quote|fees?)\b/i.test(
        q,
      ) &&
      (FIRST_PERSON.test(q) ||
        /\b(project|website|site|ads|seo|marketing|build|package|plan|receptionist|chatbot|ethixweb)\b/i.test(
          q,
        )),
    docs: ["pricing"],
  },
  {
    // Wanting more business, in any words.
    test: (q) =>
      /\b(more|get|grow|increase|boost|need|want|getting)\b/i.test(q) &&
      /\b(customers|clients|leads|calls|bookings|sales|traffic|jobs|revenue|business|enquiries|inquiries)\b/i.test(
        q,
      ) &&
      !/\b(career|careers|job openings|hiring|apply)\b/i.test(q),
    docs: ["service-growth"],
  },
];

export async function retrieve(
  question: string,
  options: { previousQuestion?: string; signal?: AbortSignal } = {},
): Promise<Retrieved> {
  const { previousQuestion, signal } = options;

  const route = INTENT_ROUTES.find((r) => r.test(question));
  if (route) {
    const docs = route.docs
      .map((id) => KNOWLEDGE.find((d) => d.id === id))
      .filter((d): d is (typeof KNOWLEDGE)[number] => Boolean(d));
    return {
      sources: docs.map((d) => ({
        kind: "site" as const,
        title: d.title,
        href: d.path,
        text: d.text,
      })),
      usedWeb: false,
      direct: route.answer ?? docs.map((d) => d.answer).join("\n\n"),
    };
  }

  const query = searchText(question, previousQuestion);
  const local = searchKnowledge(query, 3);
  const best = local[0]?.score ?? 0;
  const aboutUs = FIRST_PERSON.test(query) || best >= LOCAL_HIT_FLOOR;

  const siteSources: Source[] = (aboutUs ? local : local.filter((h) => h.score >= LOCAL_HIT_FLOOR))
    .slice(0, aboutUs ? 3 : 1)
    .map((hit) => ({ kind: "site" as const, title: hit.title, href: hit.path, text: hit.text }));

  // Plainly about us, but phrased in words no passage happens to carry
  // ("so what is this company?"). The overview answers that correctly, where
  // an encyclopaedia lookup would answer something else entirely.
  if (aboutUs && best < LOCAL_HIT_FLOOR) {
    const overview = OVERVIEW_DOCS[0];
    return {
      sources: [{ kind: "site", title: overview.title, href: overview.path, text: overview.text }],
      usedWeb: false,
      direct: overview.answer,
    };
  }

  // Confident enough to answer from the curated text alone. A second passage
  // joins only when it is nearly as strong, which is what a two part question
  // ("how long does it take and how is it priced") looks like; a distant
  // runner up is just a passage sharing a word.
  const second = local[1]?.score ?? 0;
  const clearWinner =
    FIRST_PERSON.test(query) && best >= LOCAL_HIT_FLOOR && best >= second * LOCAL_HIT_MARGIN;
  // One rare word is not evidence. "Who was Ada Lovelace?" scored as a
  // confident match for the accessibility passage on "ada" alone, and would
  // have been answered with our accessibility services. A curated answer
  // needs a question addressed to us, or two terms in common.
  const corroborated = FIRST_PERSON.test(query) || (local[0]?.matched ?? 0) >= 2;
  // Our prices answer questions about our work only. "How much does a heat
  // pump cost" shares "how much" and "cost" with the pricing passage but is a
  // general question; the pricing intent route above catches the real ones.
  const pricingOffTopic = local[0]?.id === "pricing" && !FIRST_PERSON.test(query);
  if (
    (best >= LOCAL_HIT_CONFIDENT || clearWinner) &&
    corroborated &&
    !pricingOffTopic &&
    local[0].answer
  ) {
    const used = local
      .filter(
        (h, i) => h.answer && (i === 0 || h.score >= Math.max(LOCAL_HIT_CONFIDENT, best * 0.6)),
      )
      .slice(0, 2);
    return {
      sources: used.map((h) => ({
        kind: "site" as const,
        title: h.title,
        href: h.path,
        text: h.text,
      })),
      usedWeb: false,
      direct: used.map((h) => h.answer).join("\n\n"),
    };
  }

  // A confident site match needs no encyclopaedia. Everything else does,
  // including the questions that only weakly brushed the corpus - a general
  // question that happens to share a word with a site passage still gets the
  // encyclopaedia, or it would be answered out of the wrong source.
  const settled =
    best >= LOCAL_HIT_CONFIDENT || (FIRST_PERSON.test(query) && best >= LOCAL_HIT_FLOOR);
  if (settled) {
    return { sources: siteSources, usedWeb: false };
  }

  const wiki = await searchWikipedia(query, 3, signal);
  return {
    sources: [
      ...siteSources,
      ...wiki.snippets.map((s) => ({
        kind: "web" as const,
        title: s.title,
        href: s.url,
        text: s.extract,
      })),
    ],
    usedWeb: true,
    webFailure: wiki.failure,
  };
}

const PERSONA =
  "You are the Ethixweb assistant, a helpful assistant on the Ethixweb website, running inside the visitor's own browser.";

/** House style, held apart from the reference material so it reads as rules
 * rather than as something to answer from. Short on purpose: a 1.5B model
 * follows four rules and ignores twelve, and every token spent here is a
 * token of retrieved context the 4k window cannot hold. */
const RULES = [
  "Answer only from the reference material below. If it does not contain the answer, say so plainly and point the visitor to /contact. Never invent a fact, date, number, price or client name.",
  "Mark each claim with the number of the material it came from, like [1].",
  "Two to four sentences unless more is asked for. Plain, everyday words.",
  "Never use an em dash or an en dash. Use a comma, a full stop, or the word 'to' in a range.",
].join("\n");

/** The system prompt. */
export function systemPrompt(sources: Source[]): string {
  if (sources.length === 0) {
    return `${PERSONA} You have no reference material for this question. Say plainly that you do not have a source for it and suggest the visitor ask something else or contact the team at /contact. Do not guess at facts, dates or numbers. Never use an em dash or an en dash.`;
  }

  const blocks = sources
    .map((s, i) => `[${i + 1}] ${s.title}${s.href ? ` (${s.href})` : ""}\n${s.text}`)
    .join("\n\n");

  return `${PERSONA}

RULES
${RULES}

REFERENCE MATERIAL
${blocks}`;
}

/** Normalises what reaches the visitor.
 *
 * The dash rule is a house style the site holds everywhere, and a prompt rule
 * alone does not hold it: a small model copies the punctuation of whatever it
 * was handed, and Wikipedia extracts are full of en dashes in date ranges. So
 * the rule is enforced here as well as asked for. Runs on every streamed
 * update, so it stays a few cheap regexes. */
export function cleanAnswer(text: string): string {
  return (
    text
      .replace(/\s*[\u2014\u2013]\s*/g, ", ")
      // A hyphen with spaces either side is a dash in disguise ("built to look
      // - and convert - like one"). Spaces and tabs only, never a newline, so
      // a "- item" bullet at the start of a line is left alone.
      .replace(/[ \t]+-[ \t]+/g, ", ")
      // Small models sometimes open with a bare citation ("[2] The team..."),
      // which reads as a glitch. The marker belongs after the claim.
      .replace(/^\s*\[\d+\]\s*/, "")
      .replace(/\s+,/g, ",")
      .replace(/,\s*,/g, ",")
      .replace(/,\s*\./g, ".")
  );
}

/** What to say when retrieval itself failed, so neither the model nor reader
 * mode has to pretend the encyclopaedia was simply empty. */
export function failureMessage(failure: WikiFailure): string {
  return failure === "rate-limited"
    ? "Wikipedia is rate limiting this network right now, so I could not look that up. It clears on its own after a few minutes. Questions about Ethixweb still work, because those are answered from this site."
    : "I could not reach Wikipedia just now, so I have no source for that. Questions about Ethixweb still work, because those are answered from this site.";
}

/** Reader-mode answer for browsers without WebGPU, where there is no model to
 * generate with. It quotes the retrieved passages instead of paraphrasing
 * them, which is honest about what it is: search results, not an answer. */
export function extractiveAnswer(sources: Source[]): string {
  if (sources.length === 0) {
    return `I could not find anything on that in this site's content or on Wikipedia. Try rephrasing it, or reach the team at /contact.`;
  }
  const lead =
    sources[0].kind === "site"
      ? "Here is what this site says about that:"
      : "Here is what the sources say:";
  const body = sources
    .slice(0, 2)
    .map((s, i) => `[${i + 1}] ${s.title}: ${s.text}`)
    .join("\n\n");
  return `${lead}\n\n${body}`;
}
