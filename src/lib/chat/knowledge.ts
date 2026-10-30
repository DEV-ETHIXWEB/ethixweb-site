import { SERVICE_CATALOG } from "@/lib/services-catalog";
import { CASE_STUDY_DETAILS } from "@/data/case-studies";

/** The chat's own knowledge base, plus the retriever that searches it.
 *
 * A model small enough to run in a browser tab knows nothing about Ethixweb
 * and half-remembers most facts about everything else. So every answer is
 * grounded: this module finds the passages that bear on the question and they
 * are pasted into the prompt. Nothing is embedded and nothing is sent
 * anywhere - it is a BM25 keyword search over a few dozen short documents,
 * which is instant and needs no key.
 *
 * Service and case study passages are generated from the same data the pages
 * render, so the chat can never quote a service we stopped selling or a
 * project that changed. Hand written passages carry only what is already
 * public on the site: no pricing, no addresses, nothing a visitor could not
 * read elsewhere on it. */

export type KnowledgeDoc = {
  id: string;
  title: string;
  /** Site-relative path, surfaced to the visitor as a source link. */
  path?: string;
  text: string;
  /** Extra search terms, indexed with the weight of a title but never shown
   * to the model or the visitor.
   *
   * Real questions rarely use the words a passage happens to contain. "Do you
   * work with plumbers" misses a passage that says "plumbing", "where are you
   * based" misses one that says "remote first", and "what is your process"
   * missed the process passage entirely because the word process was not in
   * it. Rather than stem more aggressively, which creates false matches, each
   * passage carries the vocabulary people actually type. */
  aliases?: string;
  /** What the visitor sees when this passage answers the question outright:
   * plain words, second person, no dashes. Written by hand for the company
   * facts and composed from data for services and case studies.
   *
   * Exists because a 1.5B model is not reliable enough to paraphrase these.
   * Asked "what does Ethixweb do?" it answered with a side detail about team
   * structure; asked four company questions in a row it returned nothing for
   * all four. A question about us that matches a passage confidently is now
   * answered with this text, instantly, with no model involved at all. */
  answer?: string;
  /** Multiplies this passage's score. Case studies use it: their tags repeat
   * every service word ("Website Design, SEO & Lead Gen"), so at full weight
   * a project blurb beat the service itself for "do you build websites". A
   * question that names the project still scores them far above anything. */
  weight?: number;
};

/** Company facts that live nowhere else in code. Every line here is taken
 * from a page on this site, so the chat and the site cannot drift apart. */
const SITE_FACTS: KnowledgeDoc[] = [
  {
    id: "about",
    title: "About Ethixweb",
    path: "/about",
    text: "Ethixweb is a digital marketing and web development agency. It builds websites, AI automation and growth programmes for businesses, handling design, engineering, paid media, SEO and AI agents in one place so a client does not have to coordinate three vendors. The team is senior led and remote first, works with clients across the United States, and the people on your kickoff call are the people who do the work. There are no account managers in between.",
    aliases:
      "what does ethixweb do company agency studio overview business about us who you are what you do digital marketing web development firm",
  },
  {
    id: "mission",
    title: "Mission",
    path: "/about",
    text: "The Ethixweb mission is to turn marketing spend into measurable revenue. Every project is judged the same way: did it move the needle on bookings, leads and revenue. The team builds websites and systems that earn their place in a client's budget rather than work that only looks good in a portfolio.",
    aliases: "mission purpose goal why exist what drives you",
  },
  {
    id: "vision",
    title: "Vision",
    path: "/about",
    text: "The Ethixweb vision is to be the senior team contractors call first. The company is being built into the go to growth partner for home service businesses, known for senior craftsmanship, straight talk, and results a client can point to.",
    aliases: "vision future ambition long term goal where headed",
  },
  {
    id: "values",
    title: "What makes Ethixweb different",
    path: "/about",
    text: "Ethixweb gives clients direct access to senior developers and strategists, transparent pricing with no hidden retainers, decisions backed by data rather than guesswork, fast turnarounds without cutting corners, ongoing support after launch, and United States focused communication and operations. Compared with a typical agency: the senior team on your kickoff call does the work instead of juniors behind an account manager, scope is fixed and agreed in writing upfront instead of open ended retainers and surprise invoices, reporting covers calls, bookings and revenue instead of impressions and vanity dashboards, launch takes two to four weeks instead of a quarter of discovery, and clients get a direct line to the people building instead of ticket queues.",
    aliases:
      "why choose you different better than other agencies competitors advantage benefits why work with you who does the actual work account manager juniors transparent",
  },
  {
    id: "process",
    title: "How a project runs, step by step",
    path: "/about",
    text: "Ethixweb runs a project in four steps. One, discover and strategize: dig into the business, its customers and competitors to build a plan focused on revenue rather than vanity metrics. Two, design and build: senior designers and developers create a fast, conversion focused site or system, built right the first time. Three, launch and optimize: ship in weeks rather than months, then track real data to refine messaging, design and performance. Four, grow and scale: once the foundation works, double down on what is driving results and scale it across channels. Work is reviewed in stages on a staging URL rather than revealed at the end.",
    aliases:
      "process steps how you work workflow methodology approach stages what happens first kickoff onboarding project run",
  },
  {
    id: "timeline",
    title: "How long a project takes",
    path: "/about",
    text: "Typical time to launch is two to four weeks. Delivery is one hundred percent senior led, the team is available around the clock across time zones, and the average client rating is 4.0. A bigger build with many pages or custom integrations takes longer, and the timeline is agreed in the proposal before work starts rather than estimated afterwards.",
    aliases:
      "how long time taken duration speed fast deadline weeks delivery turnaround when ready launch date",
  },
  {
    id: "pricing",
    title: "Pricing and quotes",
    path: "/contact",
    text: "Ethixweb does not publish a rate card, because price depends on scope. What is fixed is how pricing works: scope is agreed in writing upfront, pricing is transparent, and there are no hidden retainers or surprise invoices. Retainers for maintenance and ongoing growth work are optional and separate from a build. To get a number, send a short brief through the contact page at /contact and the team will scope it on a call.",
    aliases:
      "price cost costs how much budget quote estimate rates fees charge expensive cheap affordable payment invoice retainer packages",
  },
  {
    id: "contact",
    title: "How to get in touch",
    path: "/contact",
    text: "There are three ways to reach the team. Ask for a call right here in this chat and leave a name, phone number and website. Use the contact page at /contact, which takes the same three details. Or email info@ethixweb.com. The team looks at the website before calling and calls back within one business day. Ethixweb does not publish a street address on the site. The honest first step for a quote or a new project is a short call about what the business sells and where its leads come from today.",
    aliases:
      "contact reach email phone enquiry inquiry get in touch talk hire start project brief book call",
  },
  {
    id: "industries",
    title: "Industries Ethixweb works with",
    path: "/industries",
    text: "Ethixweb works with home service businesses such as HVAC, plumbing and contractors, with marine and fishing charter and guide services, and with local service businesses, restaurants and retailers competing in local search. For home services the team manages CRM and field service software including ServiceTitan, Jobber and Housecall Pro, runs an AI receptionist that texts and books customers when a call is missed, keeps the Google Business Profile updated weekly with automated review harvesting for Map Pack visibility, and sets up secure business email and field team communication. For fishing and marine the team manages booking engines including FareHarbor, Peek Pro and Bokun so there are no overbookings, runs a managed Shopify merch store, turns catch reports and fishing logs into local SEO, and handles business email and on boat tech support.",
    aliases:
      "industries niches sectors verticals clients types plumber plumbers hvac heating cooling contractor contractors roofer electrician home services trades restaurant restaurants retail fishing charter charters guide boat marine servicetitan jobber housecall shopify fareharbor peek bokun missed calls miss call phone answering help my business",
  },
  {
    id: "locations",
    title: "Where Ethixweb works",
    path: "/locations/kent-wa",
    text: "Ethixweb is remote first and works with clients across the United States, with a local page for Kent, Washington, covering home service businesses, restaurants, contractors and local companies in that area. Communication and operations are United States focused and the team is available around the clock.",
    aliases:
      "where based located location office city country usa united states america remote timezone kent washington seattle wa near me local",
  },
  {
    id: "work",
    title: "Case studies and past work",
    path: "/our-work",
    text: "Published case studies live at /our-work, one page per project, describing the problem, what was built and what changed afterwards. The projects on the site cover plumbing and trenchless sewer specialists, a fishing guide service, and home services, each with the live website linked from its case study.",
    aliases:
      "work portfolio projects case studies examples past clients samples showcase proof results built",
  },
  {
    id: "tech",
    title: "How Ethixweb builds",
    path: "/web-development",
    text: "Builds favour speed and durability: static sites with no CMS where a CMS would only add attack surface, headless architecture when a project needs flexibility, accessibility and trust signals designed in rather than bolted on, and Core Web Vitals treated as a requirement rather than a nice to have. Sites are portable and are not locked to one host. Maintenance covers updates, monitoring and security patching after launch.",
    aliases:
      "technology stack tech tools platform cms wordpress static headless speed performance core web vitals accessibility hosting security build",
  },
  {
    id: "reviews",
    title: "Reviews and reputation",
    text: "Ethixweb holds a 4.0 rating on Trustpilot. That score is weighted by Trustpilot's own model, which accounts for review age and volume, so it is not the plain average of the individual reviews shown on the site.",
    aliases: "reviews rating ratings trustpilot reputation testimonials stars feedback",
  },
  {
    id: "careers",
    title: "Careers and hiring",
    path: "/not-hiring",
    text: "Ethixweb is not currently hiring and has no open positions at this time. The careers page at /careers says so and asks people to check back in the future for new opportunities. When roles do open, applications go through a short written application, a screening questionnaire and a skills assessment, each by private link.",
    aliases:
      "careers jobs hiring job vacancy vacancies apply application role roles internship work with you employment recruit openings position",
  },
  {
    id: "policies",
    title: "Policies",
    path: "/policies/privacy",
    text: "The privacy policy is at /policies/privacy, the terms are at /policies/terms, and the refund policy is at /policies/refunds. The site asks before setting any advertising measurement cookie, and it works without one.",
    aliases: "policy policies privacy terms conditions refund refunds cookies legal gdpr data",
  },
  {
    id: "chatbot-service",
    title: "Chatbots and AI Ethixweb builds for clients",
    path: "/ai-automation",
    text: "Ethixweb builds two kinds of chatbot for clients. A knowledge chatbot answers from a fixed script or FAQ library, which is cheap and predictable. An LLM chatbot reasons over the client's real knowledge base in the client's own voice and hands off to a human when a conversation needs one. There is also an AI receptionist that answers inquiries and books jobs around the clock, including texting back a customer whose call was missed. All of it can be deployed on a website or alongside a phone line.",
    aliases:
      "chatbot chatbots bot bots ai automation receptionist assistant agent llm answering service missed call texting",
  },
  {
    id: "this-chat",
    title: "How this assistant works",
    text: "This assistant runs an open weight language model entirely inside the visitor's browser using WebGPU. There is no API key and no inference server. The model weights download once from a public CDN, are cached by the browser, and every word is generated on the visitor's own device. Questions about Ethixweb are answered from passages taken from this site. General questions pull live summaries from the Wikipedia API, which needs no key either. Questions typed here are never sent to Ethixweb or to any third party, and the conversation is cleared when the tab closes. The only thing that reaches the team is a call request, and only if the visitor chooses to send one. A model this small can still be wrong, so anything that matters is worth checking against the linked sources.",
    aliases:
      "how this chat works api key webgpu browser local model privacy private data offline wikipedia you are built",
  },
];

/** Curated replies for the company facts, keyed by passage id. Kept apart
 * from SITE_FACTS so the passages stay reference text for the model and
 * these stay conversational. Every claim here is in that passage too. */
const ANSWERS: Record<string, string> = {
  about:
    "Ethixweb is a digital marketing and web development agency. We build fast websites, set up AI tools like chatbots and AI receptionists, and run growth work such as SEO, Google and Meta ads, social media and email. We also do brand design, reporting dashboards, accessibility work and ongoing support. One senior team does all of it, so you never juggle separate vendors, and we judge every project by the leads, bookings and revenue it brings in.",
  mission:
    "Our mission is to turn marketing spend into measurable revenue. Every project is judged the same way: did it bring in more bookings, leads and revenue? If something does not earn its place in your budget, we do not think it is worth building.",
  vision:
    "Our vision is to be the senior team contractors call first. We are building Ethixweb into the go to growth partner for home service businesses, known for senior craftsmanship, straight talk, and results you can point to.",
  values:
    "Five things set us apart:\n1. The senior people on your kickoff call are the ones who do the work. No account managers in between.\n2. Scope and price are agreed in writing upfront, so there are no surprise invoices.\n3. We report on calls, bookings and revenue, not vanity numbers like impressions.\n4. Most projects launch in two to four weeks, and you get a direct line to the people building.\n5. We stay on after launch with ongoing support, updates and security.",
  process:
    "Every project runs in four steps:\n1. **Discover and plan.** We learn your business, your customers and your competitors, and plan around revenue.\n2. **Design and build.** Senior designers and developers build a fast site or system made to convert.\n3. **Launch and improve.** We ship in weeks, then use real data to sharpen it.\n4. **Grow.** We double down on what works and scale it across channels.\n\nYou review progress on a preview link the whole way, so there is no big reveal at the end.",
  timeline:
    "Most projects launch in two to four weeks. Bigger builds with many pages or custom integrations take longer, and the exact timeline is agreed in your proposal before any work starts, so you know the date upfront.",
  pricing:
    "Pricing depends on what you need, so we do not publish a fixed rate card. What we do promise: scope and price are agreed in writing before work starts, there are no hidden retainers, and there are no surprise invoices. Ongoing support or growth retainers are optional. The quickest way to a real number is a free call, where the team scopes it with you.",
  contact:
    "You can reach the team three ways: book a free call right here in this chat, use the contact page at /contact, or email info@ethixweb.com. The team looks at your website before calling and gets back to you within one business day.",
  industries:
    "We mainly work with home service businesses like plumbers, HVAC companies and contractors, plus fishing and marine charters, restaurants and other local businesses.\n\nFor home services, that includes an AI receptionist that texts back and books customers when you miss a call, managing tools like ServiceTitan, Jobber and Housecall Pro, and getting you into the Google Map Pack with weekly profile updates and automatic review requests. For charters, we manage booking systems like FareHarbor, Peek Pro and Bokun, plus Shopify merch stores and local SEO.",
  locations:
    "We are a remote first team working with clients across the United States, with a local focus on Kent, Washington. Communication and operations are US focused, and the team is available around the clock.",
  tech: "We build for speed and reliability: fast static sites where a content system is not needed, headless setups when you need flexibility, accessibility built in from the start, and strong Core Web Vitals scores. Your site is not locked to one host, and after launch we handle updates, monitoring and security patches.",
  reviews:
    "Ethixweb has a 4.0 rating on Trustpilot. Trustpilot weights that score itself, based on how recent the reviews are and how many there are, so it is not a simple average of the reviews shown on our site.",
  careers:
    "We are not hiring right now and have no open positions at the moment. New roles will be posted on the careers page when they open, so please check back in the future.",
  policies:
    "Our privacy policy is at /policies/privacy, the terms are at /policies/terms, and the refund policy is at /policies/refunds. The site only sets advertising cookies if you say yes, and everything works without them.",
  "chatbot-service":
    "Yes, we build chatbots and AI tools for businesses. A knowledge chatbot answers from a set script or FAQ, which keeps it simple and predictable. An AI chatbot understands your real business information, talks in your brand's voice, and hands over to a person when needed. We also set up AI receptionists that answer inquiries and book jobs around the clock, including texting back customers whose calls you missed.",
  "this-chat":
    "I run fully inside your browser, so there is no API key and no server behind me. I answer questions about Ethixweb from this website's own pages, and general questions from live Wikipedia summaries. Your questions are not sent to Ethixweb or anyone else. The only thing that ever reaches the team is a call request, and only if you choose to send one.",
};

/** The words people use for each service category, which the catalog's own
 * titles rarely are. Nobody asks for "Headless Architecture"; they ask
 * whether you can redesign their site. "Can you make my site accessible"
 * missed the accessibility passage entirely, because "accessible" and
 * "accessibility" share no stem. */
const CATEGORY_ALIASES: Record<string, string> = {
  Website:
    "website websites site sites web design development developer redesign new build landing page pages wordpress maintenance hosting speed fast after launch",
  AI: "ai artificial intelligence chatbot chatbots bot receptionist csr automation automate assistant answering missed calls handoff",
  Growth:
    "seo search engine google ads ppc paid meta facebook instagram social media email marketing newsletter lead leads more customers clients calls bookings booked jobs traffic visibility get found ranking rank grow growth advertising",
  Design:
    "design designer logo logos brand branding identity graphic graphics print collateral flyer business card guidelines",
  Data: "data dashboard dashboards analytics reporting report reports metrics tracking ga4 numbers",
  Accessibility:
    "accessible accessibility ada wcag disability screen reader compliance compliant audit",
  Support:
    "support help maintenance content updates api ongoing after launch technical issue fix bug",
};

/** One passage per service category, built from the catalog the service
 * pages render. */
function serviceDocs(): KnowledgeDoc[] {
  return SERVICE_CATALOG.map((cat) => ({
    id: `service-${cat.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    title: `${cat.title} services`,
    path: cat.to,
    aliases: `${cat.title} ${cat.items.map((i) => i.title).join(" ")} ${CATEGORY_ALIASES[cat.title] ?? ""} services offer provide`,
    answer: `Yes. Our ${cat.title.toLowerCase()} services cover:\n${cat.items
      .map((i) => `- **${i.title}**: ${i.description}`)
      .join(
        "\n",
      )}\n\n${cat.to && cat.to !== "/contact" ? `More detail is on ${cat.to}.` : "Ask for a free call and the team will scope it with you."}`,
    text: `${cat.title}: ${cat.teaser} Ethixweb offers ${cat.items
      .map((i) => `${i.title} (${i.description.replace(/\.$/, "")})`)
      .join(", ")}.`,
  }));
}

/** One passage per published case study, from the same data the case study
 * pages render, so a project's facts cannot drift out of the chat. */
function caseStudyDocs(): KnowledgeDoc[] {
  return CASE_STUDY_DETAILS.map((study) => {
    const highlights = study.snapshot?.cards
      ?.map((c) => `${c.title} (${c.description.replace(/\.$/, "")})`)
      .join(", ");
    const name = study.client?.name ?? study.title;
    return {
      id: `case-${study.slug}`,
      weight: 0.55,
      answer: [
        `${name} is one of our ${study.status.toLowerCase()} projects: ${study.summary.charAt(0).toLowerCase()}${study.summary.slice(1)}`,
        study.tags?.length ? `The work covered ${study.tags.join(", ")}.` : "",
        `You can read the full case study at /our-work/${study.slug}${
          study.websiteUrl ? ` and see the live site at ${study.websiteUrl}` : ""
        }.`,
      ]
        .filter(Boolean)
        .join(" "),
      title: `Case study: ${study.client?.name ?? study.title}`,
      path: `/our-work/${study.slug}`,
      aliases: `${study.client?.name ?? ""} ${study.tags?.join(" ") ?? ""} case study project example past work portfolio client`,
      text: [
        `${study.title} is an Ethixweb project, status ${study.status.toLowerCase()}.`,
        study.summary,
        study.tags?.length ? `Scope: ${study.tags.join(", ")}.` : "",
        highlights ? `What the build included: ${highlights}.` : "",
        study.websiteUrl ? `The live site is ${study.websiteUrl}.` : "",
      ]
        .filter(Boolean)
        .join(" "),
    };
  });
}

ANSWERS.work = `Our published case studies are at /our-work. Each one shows the problem, what we built and what changed. They include ${(() => {
  const names = CASE_STUDY_DETAILS.map((c) => c.client?.name ?? c.title);
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names.join("");
})()}. Ask me about any of them for the details.`;

export const KNOWLEDGE: KnowledgeDoc[] = [
  ...SITE_FACTS.map((d) => ({ ...d, answer: d.answer ?? ANSWERS[d.id] })),
  ...serviceDocs(),
  ...caseStudyDocs(),
];

/** Passages to fall back on when someone clearly asks about the company but
 * phrases it in a way no passage matches ("so what is this?"). Better a
 * correct overview than a Wikipedia article about something else. */
export const OVERVIEW_DOCS: KnowledgeDoc[] = KNOWLEDGE.filter((d) =>
  ["about", "values", "contact"].includes(d.id),
);

/** Words that carry no retrieval signal. Question words are in here on
 * purpose: "what", "how" and "tell" match every document equally, so leaving
 * them in would flatten the ranking of every question asked in full
 * sentences. */
const STOPWORDS = new Set(
  (
    "a an and are as at be but by can could do does for from had has have how i if in into is it its" +
    " me my of on or our so tell than that the their them then there these they this to was we were" +
    " what when where which who whom why will with would you your about am also any been being just" +
    " like more most no not now only other over same some such through up very"
  )
    .split(" ")
    .filter(Boolean),
);

export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map(stem);
}

/** Light suffix stemmer, enough to tie "chatbots" to "chatbot" without a
 * stemming dependency. The plural rules are the ones that matter: stripping
 * "es" from every word turned "websites" into "websit", which never matched
 * "website", and "do you build websites" was answered with the mission
 * statement. "es" now only comes off after s, x, z, ch or sh (classes,
 * boxes, churches); everywhere else just the "s" goes. */
function stem(term: string): string {
  if (term.length <= 3) return term;
  if (term.endsWith("ies") && term.length > 4) return `${term.slice(0, -3)}y`;
  if (term.endsWith("sses")) return term.slice(0, -2);
  if (term.endsWith("es") && /(s|x|z|ch|sh)es$/.test(term)) return term.slice(0, -2);
  if (term.endsWith("s") && !term.endsWith("ss") && !term.endsWith("us")) return term.slice(0, -1);
  if (term.length > 5 && term.endsWith("ing")) return term.slice(0, -3);
  if (term.length > 4 && term.endsWith("ed")) return term.slice(0, -2);
  return term;
}

type IndexedDoc = KnowledgeDoc & { terms: Map<string, number>; length: number };

let index: IndexedDoc[] | null = null;
let idf: Map<string, number> | null = null;
let avgLength = 0;

function build() {
  if (index && idf) return { index, idf };
  const docs: IndexedDoc[] = KNOWLEDGE.map((doc) => {
    const terms = new Map<string, number>();
    // The title is worth repeating: a three word heading that matches the
    // question is a stronger signal than one mention in a long paragraph.
    for (const t of [
      ...tokenize(doc.title),
      ...tokenize(doc.title),
      ...tokenize(doc.aliases ?? ""),
      ...tokenize(doc.aliases ?? ""),
      ...tokenize(doc.text),
    ]) {
      terms.set(t, (terms.get(t) ?? 0) + 1);
    }
    let length = 0;
    for (const n of terms.values()) length += n;
    return { ...doc, terms, length };
  });

  const df = new Map<string, number>();
  for (const doc of docs) for (const t of doc.terms.keys()) df.set(t, (df.get(t) ?? 0) + 1);

  const map = new Map<string, number>();
  for (const [term, count] of df) {
    map.set(term, Math.log(1 + (docs.length - count + 0.5) / (count + 0.5)));
  }

  avgLength = docs.reduce((sum, d) => sum + d.length, 0) / Math.max(docs.length, 1);
  index = docs;
  idf = map;
  return { index: docs, idf: map };
}

export type KnowledgeHit = KnowledgeDoc & {
  score: number;
  /** How many distinct query terms this passage contains. */
  matched: number;
};

const K1 = 1.4;
// Length normalisation, kept light. At 0.72 the long industries passage lost
// "we are a plumbing company and miss calls" to a short case study that
// merely mentioned plumbing once.
const B = 0.45;

/** BM25 over the local corpus. Scores are not normalised, so compare them
 * against each other and against the thresholds below, never against 1. */
export function searchKnowledge(query: string, limit = 3): KnowledgeHit[] {
  const { index: docs, idf: weights } = build();
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const unique = [...new Set(terms)];
  const scored = docs.map((doc) => {
    let score = 0;
    let matched = 0;
    for (const term of unique) {
      const tf = doc.terms.get(term);
      if (!tf) continue;
      matched += 1;
      const weight = weights.get(term) ?? 0;
      score += (weight * (tf * (K1 + 1))) / (tf + K1 * (1 - B + (B * doc.length) / avgLength));
    }
    return { ...doc, score: score * (doc.weight ?? 1), matched };
  });

  return scored
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Below this, a match is one incidental word and the passage would only
 * mislead the model. */
export const LOCAL_HIT_FLOOR = 1.6;

/** A site match this strong answers the question on its own, so the
 * Wikipedia round trip can be skipped. It has to sit well above the floor:
 * "how does WebGPU differ from WebGL" brushes the passage about this
 * assistant at around 1.9, and answering that from the site alone would be
 * wrong. Real site questions score 3.5 and up. */
export const LOCAL_HIT_CONFIDENT = 3.4;

/** A plainly first person question whose best passage wins by this factor is
 * as settled as a confident one: "do you do SEO" scores modestly because SEO
 * appears in several passages, but one of them is clearly the answer. */
export const LOCAL_HIT_MARGIN = 1.4;
