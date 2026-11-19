import type { Post } from "./types";

const IMG = "/images/blog/winter-emergency-plumbing-hvac";

const post: Post = {
  slug: "winter-emergency-plumbing-hvac",
  title: "Winter Emergency Calls Are Coming. Is Your Business Ready?",
  metaTitle: "Winter Emergency Calls: Is Your HVAC or Plumbing Shop Ready?",
  metaDescription:
    "Frozen pipes and dead furnaces don't wait for office hours. See how HVAC and plumbing companies keep the winter emergency rush from going to a competitor.",
  category: "Growth",
  readMinutes: 6,
  published: "2026-11-19",
  excerpt:
    "The first hard freeze brings a short, sharp spike in no heat and burst pipe calls. How to answer, route and advertise for that week before it arrives, so the work does not go to whoever picks up first.",
  heroImage: {
    src: `${IMG}/hero.webp`,
    srcSet: `${IMG}/hero-640w.webp 640w, ${IMG}/hero-1024w.webp 1024w, ${IMG}/hero.webp 1512w`,
    width: 1512,
    height: 794,
    alt: "Overnight call log during the first hard freeze showing two missed emergency calls and one answered, with a note that two of the three callers hired someone else by 7am",
  },
  socialImage: `${IMG}/og.png`,
  body: [
    {
      p: "Winter's first real freeze does not wait for a slow Tuesday. Furnaces that limped through November quit all at once, pipes in an exterior wall split overnight, and the phone starts ringing with the kind of emergency call that cannot wait until Monday.",
    },
    {
      p: "HVAC and plumbing businesses that plan for that week capture most of the winter emergency rush. Businesses that react once the calls start usually watch a good share of it go to whoever answers first, whether that is a competitor down the road or a voicemail box the caller never checks again.",
    },
    { h2: "Why one cold snap can double your call volume overnight" },
    {
      p: "A hard freeze does not raise call volume evenly. It spikes it. During the severe winter storm that hit Texas in February 2021, one Texas HVAC contractor told ACHR News that call volume \"shot up over 200% from what is considered normal.\" Few areas will see anything that extreme, but the shape of the spike is the same everywhere a hard freeze hits: a short, sharp surge that overwhelms whatever capacity felt normal the week before.",
    },
    {
      figure: {
        src: `${IMG}/cold-snap-surge.webp`,
        srcSet: `${IMG}/cold-snap-surge-640w.webp 640w, ${IMG}/cold-snap-surge-1024w.webp 1024w, ${IMG}/cold-snap-surge.webp 1440w`,
        width: 1440,
        height: 840,
        alt: "Chart comparing a typical week of call volume with a freeze week, next to the order calls arrive in: no heat first, burst pipes a day or two later, new customer calls climbing throughout",
        caption: "The spike does not arrive evenly. Knowing which calls land first is what lets you staff for it.",
      },
    },
    {
      p: "Pipes do not usually burst from the ice itself. According to the Insurance Institute for Business & Home Safety, once a pipe freezes solid between a closed faucet and the blockage, continued freezing builds pressure in that trapped section, and the pipe fails at its weakest point, often somewhere the ice has not even reached. That is part of why burst pipes are a leading cause of property damage from winter weather: the failure can show up anywhere in a home's plumbing, not just at the coldest spot.",
    },
    { p: "A few patterns tend to repeat during that first hard freeze each year:" },
    {
      ul: [
        "**No heat calls arrive first,** often from furnaces or heat pumps that were already overdue for maintenance.",
        "**Burst pipe calls follow a day or two behind,** once trapped water pressure finally finds a weak joint.",
        "**New customer calls climb fastest of all,** since homeowners with no existing contractor are the ones searching Google at 11pm.",
      ],
    },
    { h2: "A missed call during a freeze is rarely a delayed job. It's a lost one." },
    {
      p: "A homeowner with no heat on a freezing night does not leave a voicemail and wait. They call the next number on the page. Ethixweb's [missed-call calculator](/tools/missed-call-calculator) shows what that costs: one example built from typical missed-call and close rates shows a contractor losing roughly $93,600 a year, or 208 first-time jobs, to calls that simply went unanswered. During a freeze week, that number does not shrink. It is usually the week it gets worse.",
    },
    { h2: "What answering the phone has to look like during the surge" },
    {
      p: "A standard after-hours answering service that only takes a message does not solve a freeze week problem. The homeowner still waits until morning, and by morning they have usually called someone else. What works instead:",
    },
    {
      ul: [
        "**Route real emergencies immediately.** No heat, no cooling during a heat wave, and active leaks go straight to the on-call technician, by call or text.",
        "**Book the routine work.** Anything that is not an emergency gets scheduled directly into the field software already in use, whether that is ServiceTitan, Jobber or Housecall Pro.",
        "**Text the caller who hangs up.** A homeowner who calls three contractors in five minutes and gets through to none of them rarely waits for a callback. A text sent the moment they hang up keeps that job in play.",
      ],
    },
    {
      figure: {
        src: `${IMG}/freeze-week-routing.webp`,
        srcSet: `${IMG}/freeze-week-routing-640w.webp 640w, ${IMG}/freeze-week-routing-1024w.webp 1024w, ${IMG}/freeze-week-routing.webp 1440w`,
        width: 1440,
        height: 840,
        alt: "Call routing diagram showing a 2am inbound call splitting into three outcomes: real emergencies to the on-call technician, routine work booked into field software, and a text sent to callers who hang up",
        caption: "Every call goes somewhere in seconds, decided on the call itself.",
      },
    },
    {
      p: "Ethixweb's [AI receptionist for contractors](/answering-service-for-contractors) is built around exactly that pattern. The setup runs in four steps before a freeze ever hits: map current call volume and the kinds of requests that come in, set the rules for what counts as an emergency and who gets forwarded, connect it to the phone line and field software and test it with real calls, then review and tune it once it is live. Doing that work in October costs nothing when the week finally comes. Our guide to [missed calls and the AI receptionist fix](/blog/missed-calls-ai-receptionist) goes deeper.",
    },
    { h2: "Decide emergency ad spend before the forecast changes, not after" },
    {
      p: "Most HVAC and plumbing companies set one [marketing budget](/hvac-plumbing-marketing) and leave it alone for months. A forecast freeze is one of the few moments worth breaking that rule. Raising Google Ads or Local Services Ads spend for emergency service keywords in the days before a hard freeze puts a business in front of homeowners exactly when they start searching, instead of a day behind every competitor who already raised their own budget.",
    },
    {
      p: "This only works when the groundwork is already done. Ad copy, landing pages and the phone answering setup above all need to exist before the freeze shows up in the ten-day forecast, not get built while the calls are already coming in.",
    },
    {
      figure: {
        src: `${IMG}/freeze-readiness-timeline.webp`,
        srcSet: `${IMG}/freeze-readiness-timeline-640w.webp 640w, ${IMG}/freeze-readiness-timeline-1024w.webp 1024w, ${IMG}/freeze-readiness-timeline.webp 1512w`,
        width: 1512,
        height: 794,
        alt: "Four step readiness timeline running from off season setup, through connecting and testing the call flow, raising emergency ad spend three to seven days before a freeze, and capturing calls during freeze week",
        caption: "The work that pays off happens before the forecast changes.",
      },
    },
    { h2: "Make sure the website can actually take the call" },
    {
      p: "None of the above matters if a homeowner reaches your site on a phone, in a hurry, and cannot find a way to make contact within a couple of taps. A site built for a desktop visitor who has time to browse works against the business the one week a visitor has neither.",
    },
    {
      p: "This is a short list to check, not a redesign: a tappable phone number or contact option visible on every page without scrolling, a contact form short enough to fill out one-handed, and a page that still loads quickly on a weak signal in a basement or a crawl space.",
    },
    {
      note: "Ethixweb builds the phone answering setup, the ad timing and the website fixes above for HVAC and plumbing companies in Seattle, the Puget Sound area and across the US. Start with the free [missed-call calculator](/tools/missed-call-calculator), then [book a free call](/contact) to get ready before the next freeze hits.",
    },
  ],
  faqs: [
    {
      q: "How early should emergency ad spend go up before a freeze?",
      a: "As soon as a hard freeze shows up in the forecast, generally three to seven days out, rather than waiting for the first cold morning. Searches for emergency repairs tend to climb before the temperature actually drops, as homeowners check their systems ahead of the cold.",
    },
    {
      q: "What's the real difference between a traditional answering service and an AI receptionist?",
      a: "A traditional answering service takes a message and passes it along later. An AI receptionist for contractors answers immediately, books routine work into the field software already in use, and forwards anything that qualifies as a genuine emergency straight to the on-call technician, day or night.",
    },
    {
      q: "Does this kind of setup work with the field software already in use?",
      a: "It can, when it is built to. Ethixweb's setup connects with ServiceTitan, Jobber and Housecall Pro, so bookings land where the team already works instead of a separate inbox someone has to check.",
    },
    {
      q: "What counts as an emergency that should go straight to an on-call tech?",
      a: "Typically a complete loss of heat, a loss of cooling during a heat wave, and active water leaks. Routine maintenance and non-urgent repair requests can safely wait for a scheduled callback the next business day.",
    },
  ],
  related: [
    { label: "AI answering for contractors", to: "/answering-service-for-contractors" },
    { label: "Missed-call calculator", to: "/tools/missed-call-calculator" },
    { label: "HVAC & plumbing marketing", to: "/hvac-plumbing-marketing" },
  ],
};

export default post;
