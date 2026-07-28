import type { CaseStudyDetail } from "@/data/case-studies/types";

const IMG = "/images/case-studies/preventive-home-solutions";

// Copy is grounded in the provided before/after and mockup screenshots:
// Preventive Home Solutions is a licensed and insured plumbing, heating and
// cooling company in Layton, Northern Utah (Lic. #1428845-5501, Google
// five-star rated). The new site leads with a knight-and-shield brand, a
// "Book Your Inspection" form built into the hero, a chat assistant, an
// accessibility toggle, and clear service/area pages. No invented metrics
// (see the note in portfolio-data.ts).
//
// House style for THIS file: no em dashes anywhere in the visible copy. Use
// commas and periods instead. Standard hyphenated compounds (mobile-first,
// trust-first) are fine.
//
// Caveats:
//   1. The live URL was not provided, so websiteUrl is omitted (hides the
//      "View Website" button). Add it when confirmed.
//   2. The exact platform/host were not provided, so the "Tech stack" section
//      describes evident engineering priorities rather than naming a vendor,
//      and reuses the shared illustrative graphics (Lighthouse score, uptime
//      region map) from the other case studies.
export const PREVENTIVE_HOME_SOLUTIONS: CaseStudyDetail = {
  slug: "preventive-home-solutions",
  status: "Shipped",
  client: {
    name: "Preventive Home Solutions",
    logo: {
      src: `${IMG}/client-logo.webp`,
      alt: "Preventive Home Solutions shield logo",
      width: 420,
      height: 420,
    },
  },
  title: "Preventive Home Solutions",
  summary:
    "A rebuilt website for a Northern Utah plumbing and HVAC company, designed to turn worried homeowners into booked inspections.",
  tags: ["Website Redesign", "Lead Capture", "Mobile-First"],
  // websiteUrl: "https://…", // TODO: add once the live URL is confirmed.
  heroImage: {
    src: `${IMG}/hero.webp`,
    srcSet: `${IMG}/hero-640w.webp 640w, ${IMG}/hero-1024w.webp 1024w, ${IMG}/hero.webp 1553w`,
    alt: "The rebuilt Preventive Home Solutions site shown on a phone held against a purple gradient background",
    width: 1553,
    height: 1013,
  },

  context: {
    intro: {
      eyebrow: "Context",
      title: "The who, what, and how?",
      highlight: "how?",
    },
    cards: [
      {
        logo: {
          src: `${IMG}/client-logo.webp`,
          alt: "Preventive Home Solutions shield logo",
          width: 420,
          height: 420,
        },
        label: "Client",
        title: "Preventive Home Solutions",
        description:
          "A licensed and insured plumbing, heating, and cooling company based in Layton and serving homeowners across Northern Utah.",
      },
      {
        icon: "wrench",
        label: "Industry",
        title: "Plumbing, Heating & Cooling",
        description:
          "A trust-driven home services trade, where people call under stress, a burst pipe or a dead furnace, and hire whoever looks the most reliable.",
      },
      {
        icon: "laptop",
        label: "What we did",
        title: "Website Redesign",
        description:
          "A full redesign built around a single job: make the company easy to trust and make booking an inspection effortless.",
      },
    ],
  },

  beforeAfter: {
    intro: {
      eyebrow: "Before & After",
      title: "From cluttered template to a brand you trust.",
      highlight: "a brand you trust.",
    },
    body: [
      "The old site opened with a flashing deals banner and two crowded rows of navigation wrapped around a plain gray hero. It worked, but it looked like every other template and buried the things that actually build trust.",
      "The rebuild leads with the brand, a licensed and insured badge, real Google reviews, and a booking form built right into the hero. Drag the slider to compare.",
    ],
    beforeImage: {
      src: `${IMG}/before-screenshot.webp`,
      srcSet: `${IMG}/before-screenshot-640w.webp 640w, ${IMG}/before-screenshot-1024w.webp 1024w, ${IMG}/before-screenshot-1600w.webp 1600w, ${IMG}/before-screenshot.webp 1883w`,
      alt: "The old Preventive Home Solutions website, a busy template with a deals banner and two rows of navigation",
      width: 1883,
      height: 985,
    },
    afterImage: {
      src: `${IMG}/after-screenshot.webp`,
      srcSet: `${IMG}/after-screenshot-640w.webp 640w, ${IMG}/after-screenshot-1024w.webp 1024w, ${IMG}/after-screenshot-1600w.webp 1600w, ${IMG}/after-screenshot.webp 1897w`,
      alt: "The rebuilt Preventive Home Solutions website, a branded hero with a knight, shield and a Book Your Inspection form",
      width: 1897,
      height: 980,
    },
  },

  showcaseImage: {
    src: `${IMG}/showcase-devices.webp`,
    srcSet: `${IMG}/showcase-devices-640w.webp 640w, ${IMG}/showcase-devices-1024w.webp 1024w, ${IMG}/showcase-devices.webp 1536w`,
    alt: "The rebuilt Preventive Home Solutions site shown across a laptop, tablet and phone",
    width: 1536,
    height: 1024,
  },

  snapshot: {
    intro: {
      eyebrow: "Snapshot",
      title: "What we did at a glance:",
      highlight: "glance:",
    },
    cards: [
      {
        icon: "layout-grid",
        label: "Major task",
        title: "Full Website Redesign",
        description:
          "A complete rebuild, from a busy template into a branded, trust-first experience that works across phone, tablet and desktop.",
      },
      {
        icon: "shield-check",
        label: "Special attention",
        title: "Trust Built to Convert",
        description:
          "Licensed and insured status, the license number, a Layton address, and Google five-star reviews are surfaced up front, so a first-time visitor believes the company before they call.",
      },
      {
        icon: "message-square",
        label: "Extra features",
        title: "Book or Ask in One Step",
        description:
          "A booking form built into the hero, plus a chat assistant that helps unsure homeowners choose the right service without leaving the page.",
      },
    ],
  },

  designApproach: {
    intro: {
      eyebrow: "Design approach",
      title: "Designed for a homeowner in a hurry.",
      highlight: "in a hurry.",
    },
    items: [
      {
        image: {
          src: `${IMG}/spotlight-1.webp`,
          srcSet: `${IMG}/spotlight-1-640w.webp 640w, ${IMG}/spotlight-1-1024w.webp 1024w, ${IMG}/spotlight-1.webp 1448w`,
          alt: "The Preventive Home Solutions site on a phone, with a Schedule Inspection button and a chat assistant prompt",
          width: 1448,
          height: 1086,
        },
        treatment: "inset",
        focus: "center",
        card: {
          title: "Built to book the job before the visitor leaves.",
          description:
            "Home services searches happen fast and often in a panic, so every screen keeps booking and help within reach instead of making people hunt for the phone number.",
          checklist: [
            "A Book Your Inspection form and a Schedule Inspection button kept close on every screen",
            "A chat assistant that offers to help choose the right service, so unsure homeowners do not bounce",
            "An accessibility toggle and Google five-star reviews sitting within easy reach",
          ],
        },
      },
    ],
  },

  techStack: {
    intro: {
      eyebrow: "Tech stack",
      title: "Built for speed and local search.",
      highlight: "local search.",
    },
    items: [
      {
        title: "Fast on every device",
        description:
          "Homeowners often search on a phone in the middle of a problem, so the site is kept light and quick, because a slow page loses the call.",
        checklist: [
          "Compressed, responsive imagery that stays crisp without slowing the page",
          "A layout that reflows cleanly from phone to tablet to desktop",
          "Booking and calling kept one tap away at every screen size",
        ],
        image: {
          src: `${IMG}/tech-stack-platform.webp`,
          srcSet: `${IMG}/tech-stack-platform-640w.webp 640w, ${IMG}/tech-stack-platform-1024w.webp 1024w, ${IMG}/tech-stack-platform.webp 1254w`,
          alt: "A code editor showing the site source next to a 98 Lighthouse performance score",
          width: 1254,
          height: 1254,
        },
      },
      {
        title: "Structured for the areas they serve",
        description:
          "The business covers multiple Northern Utah cities, so the site is organised around clear service and area pages, and built to stay fast and available when demand spikes with the weather.",
        image: {
          src: `${IMG}/tech-stack-hosting.webp`,
          srcSet: `${IMG}/tech-stack-hosting-640w.webp 640w, ${IMG}/tech-stack-hosting-1024w.webp 1024w, ${IMG}/tech-stack-hosting.webp 1254w`,
          alt: "A hosting dashboard showing a live region map and 99.99% uptime",
          width: 1254,
          height: 1254,
        },
        imageContain: true,
      },
    ],
  },

  closingCta: {
    intro: {
      eyebrow: "Work with us",
      title: "Want to work with us?",
      highlight: "us?",
    },
    description:
      "If your business runs on booked jobs, we will build you a site that earns the trust and books the work. Let's talk about yours.",
    primaryCta: { label: "Start a Project", href: "/contact" },
    secondaryCta: {
      label: "Book a Free Discovery Call",
      href: "https://calendly.com/ethixweb-agency/30min?month=2026-06",
      external: true,
    },
  },
};
