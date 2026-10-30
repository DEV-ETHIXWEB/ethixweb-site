/** Instant answers for the turns that are not really questions.
 *
 * "hi", "thanks", "are you a bot" and the rest make up a large share of what
 * anyone types into a chat bubble, and they are exactly the turns a small
 * model handles worst: it will happily invent a backstory, or answer a
 * greeting with a paragraph about plumbing because that is what retrieval
 * handed it. Worse, routing "hi" through the model means a first time
 * visitor waits on a multi hundred megabyte download to be told hello.
 *
 * So these are answered from written copy, instantly, with no retrieval and
 * no model. Every reply ends somewhere useful: a chip the visitor can tap, or
 * the contact page when a human is what they actually want. */

export type SmallTalk = {
  reply: string;
  /** Follow up questions offered as tappable chips under the reply. */
  chips?: string[];
  /** Open the call request form under the reply. */
  offerLead?: boolean;
};

/** The chip that opens the call request form instead of asking a question.
 * One constant so the panel can tell it apart from an ordinary follow up. */
export const LEAD_CHIP = "Book a free call";

const STARTERS = [
  "What does Ethixweb do?",
  "What does a project cost?",
  "How long does a build take?",
  LEAD_CHIP,
];

/** Someone ready to buy, or to talk to a person. These get the call request
 * form, because answering "I want a website" with a paragraph about the
 * website service is a conversation that ends without a lead. Exported so a
 * longer question with the same intent gets the form offered after its
 * answer, too. */
export const LEAD_INTENT =
  /\b(get a quote|free quote|quote for|book a call|schedule a call|set up a call|call me|call back|callback|hire (you|ethixweb)|work with (you|ethixweb)|start a project|new project|need a (website|site|new website)|want a (website|site|new website)|build (me|my) a|get started|sign up|interested in (working|your services|a website))\b/;

/** Matched against the message with punctuation and extra spaces removed.
 * Order matters: the first rule that matches wins, so narrow patterns such
 * as "who are you" come before the broad greeting. */
const RULES: Array<{ test: RegExp; answer: (raw: string) => SmallTalk }> = [
  {
    // Identity, before anything else: "hey, are you a real person" opens with
    // a greeting but is not one.
    test: /\b(who are (you|u)|what are (you|u)|are (you|u) (a )?(bot|robot|ai|real|human|person)|your name|am i (talking|speaking) to a (bot|human|person)|is this a (bot|human|person))\b/,
    answer: () => ({
      reply:
        "I am the Ethixweb assistant, and I am software, not a person. I run inside your browser, I answer questions about Ethixweb from this site's own pages, and I look up general questions on Wikipedia. Your questions are not sent to Ethixweb. If you would rather talk to a person on the team, I can pass them your details right here.",
      chips: ["What does Ethixweb do?", "How does this chat work?", LEAD_CHIP],
    }),
  },
  {
    test: /^(how are (you|u)( doing)?|how'?s it going|hows it going|what'?s up|whats up|wassup|how do you do)$/,
    answer: () => ({
      reply: "Running well, thanks for asking. What can I help you with?",
      chips: STARTERS,
    }),
  },
  {
    test: /\b(talk|speak|chat) to (a |an )?(human|person|someone|rep|agent|team|sales)\b|\b(human|real person) please\b|\bcontact (you|the team|ethixweb)\b|\bhow (do|can) i (contact|reach) (you|the team)\b/,
    answer: () => ({
      reply:
        "Happy to hand you over. Leave your name, phone and website below and a person on the team will look at your site and call you within one business day. If you prefer email, it is info@ethixweb.com.",
      offerLead: true,
    }),
  },
  {
    test: LEAD_INTENT,
    answer: () => ({
      reply:
        "Great, let's get you a real answer. Every project is scoped and priced in writing upfront, and most launch in two to four weeks. Leave your name, phone and website below and the team will look at your site and call you within one business day.",
      offerLead: true,
    }),
  },
  {
    test: /^(thanks?|thank (you|u)( so much| very much)?|ty|tysm|much appreciated|appreciate it|cheers)[\s!.]*$/,
    answer: () => ({
      reply: "Glad it helped. Ask me anything else whenever you need to.",
    }),
  },
  {
    test: /^(bye|goodbye|good bye|see (you|ya)( later)?|cya|later|take care|gtg|good night|goodnight)[\s!.]*$/,
    answer: () => ({
      reply:
        "Take care. If you want the team to look at your project, the contact page at /contact is the fastest way in.",
    }),
  },
  {
    // Anchored: only a bare request for help. "Can you help me get more
    // leads?" is a question about our growth services, not about the bot.
    test: /^(help|help me|help please|i need help|need help|can (you|u) help( me)?|how can (you|u) help( me)?|what can (you|u) do|what do (you|u) know|how do (you|u) work|what are (you|u) for|what can i ask( you)?)$/,
    answer: () => ({
      reply:
        "Three things. One, anything about Ethixweb: services, pricing, process, timelines, industries, past projects, careers. Those are answered from this site's own pages and I link the page each answer came from. Two, general questions, which I answer from live Wikipedia summaries. Three, if you want to talk to the team, I can book you a free call right here.",
      chips: STARTERS,
    }),
  },
  {
    test: /^(ok(ay)?|k|kk|cool|nice|great|awesome|got it|understood|sure|alright|right|fine|perfect|sounds good|yep|yeah|yes|no|nope|hmm+|lol|haha|ha)[\s!.]*$/,
    answer: () => ({
      reply: "Noted. Anything else you want to know?",
      chips: STARTERS,
    }),
  },
  {
    // The broad greeting, last among the conversational rules.
    test: /^(hi+|hey+|hello+|helo|hiya|yo+|sup|howdy|hola|namaste|salam|greetings|good (morning|afternoon|evening|day)|hi there|hey there|hello there|anyone there|anybody there)[\s!.]*$/,
    answer: () => ({
      reply:
        "Hello. I am the Ethixweb assistant. Ask me about what Ethixweb does, what a project costs, how long a build takes, or anything else at all. Here are a few people usually start with:",
      chips: STARTERS,
    }),
  },
];

/** Long messages are real questions even when they open with "hi", so only
 * short turns are considered. Six words is enough for "hey there, are you a
 * real person" and short of anything with substance in it. */
const MAX_WORDS = 8;

export function matchSmallTalk(message: string): SmallTalk | null {
  const raw = message.trim();
  if (!raw) return null;

  const normalized = raw
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (normalized.split(" ").length > MAX_WORDS) return null;

  for (const rule of RULES) {
    if (rule.test.test(normalized)) return rule.answer(raw);
  }
  return null;
}
