// Seasonal promotion band for the homepage (Black Friday 2026).
//
// Driven by dates rather than a hand-flipped boolean, for one reason: the
// thing that makes a sale look cheap is finding it still on the site in
// December. This knows its own window and retires itself.
//
// Phases:
//   before  -> teaser, counting down to the open.
//   live    -> the offer is on, counting down to the close.
//   after   -> nothing renders. No edit, no deploy, no stale banner.
//
// Deliberately NO numbers anywhere in this file. Not a percentage, not an
// "up to", not a struck-through price. Every figure on a page is a promise
// someone can hold you to, and the discount is settled per client on the
// call. The copy commits to SCOPE - every service, every package - which is
// the part that is true for everyone and costs nothing to honour.

export type PromoPhase = "before" | "live" | "after";

export const PROMO = {
  /** Master switch. Set false to pull the band regardless of date. */
  enabled: true,

  /** When the teaser starts showing. Set to today so it is live the moment
   * this deploys; push to Date.UTC(2026, 9, 23) to hold it until Friday. */
  teaserFrom: Date.UTC(2026, 9, 19, 0, 0),
  /** Offer opens: 27 Nov 2026, 00:00 Pacific (08:00 UTC). */
  startsAt: Date.UTC(2026, 10, 27, 8, 0),
  /** Offer closes: 30 Nov 2026, 23:59 Pacific (07:59 UTC on 1 Dec). The
   * audience is US home service businesses, so a deadline that lapsed at
   * midnight GMT would expire mid-afternoon for a contractor in Seattle. */
  endsAt: Date.UTC(2026, 11, 1, 7, 59),

  startLabel: "27 November",
  windowLabel: "27 to 30 November",

  eyebrow: "Black Friday 2026",

  headline: "Every service. One week.",
  headlineAccent: "Once a year.",

  teaserBody:
    "On 27 November we open the only discount we run all year, and it covers everything we do. Every service, every package, nothing held back. Start the build in November and you launch before the January rush instead of during it.",

  liveBody:
    "Our only discount of the year is open, and it covers everything we do. Every service, every package, nothing held back. Start the build now and you launch before the January rush instead of during it.",

  /** The four things the offer covers. `detail` is about what the client
   * gets, never an amount. */
  services: [
    { name: "Websites", detail: "Redesign, landing pages, maintenance" },
    { name: "AI automation", detail: "Receptionist, chatbot, human handoff" },
    { name: "SEO", detail: "Technical, content, local authority" },
    { name: "Google & Meta ads", detail: "Build, tracking, weekly optimisation" },
  ],

  /** The line beside the CTA. Scope, not amount - and the same promise in
   * both phases, because the scope does not change when the clock starts. */
  scopeNote: "Every service we offer is included. No exceptions.",

  ctaTeaser: "Get on the early list",
  ctaLive: "Claim your offer",
} as const;

export function promoPhase(now: number = Date.now()): PromoPhase {
  if (now < PROMO.startsAt) return "before";
  if (now <= PROMO.endsAt) return "live";
  return "after";
}

/** Whether the band should render at all. */
export function promoVisible(now: number = Date.now()): boolean {
  if (!PROMO.enabled) return false;
  if (now < PROMO.teaserFrom) return false;
  return promoPhase(now) !== "after";
}

export interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

/** Time left until the offer opens (before) or closes (live). */
export function promoRemaining(now: number = Date.now()): Remaining {
  const target = now < PROMO.startsAt ? PROMO.startsAt : PROMO.endsAt;
  const total = Math.max(0, target - now);
  return {
    days: Math.floor(total / 86_400_000),
    hours: Math.floor(total / 3_600_000) % 24,
    minutes: Math.floor(total / 60_000) % 60,
    seconds: Math.floor(total / 1000) % 60,
    total,
  };
}
