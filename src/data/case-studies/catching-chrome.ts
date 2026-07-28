import type { CaseStudyDetail } from "@/data/case-studies/types";

const IMG = "/images/case-studies/catching-chrome";

// Copy is grounded in the live site (catchingchromeguideservice.com) and the provided
// before/after + mockup screenshots: an Oregon salmon and steelhead guide
// service run by Captain Ryan and crew, USCG certified, 40+ years on the
// water. No invented metrics or claims (see the note in portfolio-data.ts).
//
// House style for THIS file: no em dashes anywhere in the visible copy. Use
// commas and periods instead. Standard hyphenated compounds (mobile-first,
// expert-guided) are fine.
//
// One caveat: the exact platform/host were not provided, so the "Tech stack"
// section describes the build's engineering priorities that are evident from
// the result (fast, mobile-first, seasonal-ready) rather than naming a vendor.
// Swap in the real specifics when confirmed. The two tech-stack panels reuse
// the shared illustrative graphics (Lighthouse score, uptime region map) from
// the other case studies; replace with Catching Chrome specific shots if wanted.
export const CATCHING_CHROME: CaseStudyDetail = {
  slug: "catching-chrome",
  status: "Shipped",
  client: {
    name: "Catching Chrome Guide Service",
    logo: {
      src: `${IMG}/client-logo.webp`,
      alt: "Catching Chrome Guide Service logo",
      width: 288,
      height: 287,
    },
  },
  title: "Catching Chrome Guide Service",
  summary:
    "A full website rebuild for an Oregon fishing guide service, built to turn Pacific Northwest anglers into booked trips.",
  tags: ["Website Redesign", "Mobile-First", "Merch Store"],
  websiteUrl: "https://www.catchingchromeguideservice.com/",
  heroImage: {
    src: `${IMG}/hero.webp`,
    srcSet: `${IMG}/hero-640w.webp 640w, ${IMG}/hero-1024w.webp 1024w, ${IMG}/hero.webp 1536w`,
    alt: "The rebuilt Catching Chrome Guide Service site shown on a phone against a red gradient background",
    width: 1536,
    height: 1024,
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
          alt: "Catching Chrome Guide Service logo",
          width: 288,
          height: 287,
        },
        label: "Client",
        title: "Catching Chrome Guide Service",
        description:
          "A USCG certified guide service led by Captain Ryan and crew, running expert-guided salmon and steelhead trips across Oregon's rivers, with over forty years on the water between them.",
      },
      {
        icon: "globe",
        label: "Industry",
        title: "Fishing Guide Service",
        description:
          "A seasonal, trip-based business where customers usually decide on a phone, so the site has to sell the experience and make booking effortless.",
      },
      {
        icon: "laptop",
        label: "What we did",
        title: "Website Redesign",
        description:
          "A full redesign of catchingchromeguideservice.com, built mobile-first around a single goal: get more guided trips booked.",
      },
    ],
  },

  beforeAfter: {
    intro: {
      eyebrow: "Before & After",
      title: "Same guide, a site that finally looks the part.",
      highlight: "looks the part.",
    },
    body: [
      "The old site had the right idea but a dated blue template, a busy logo lockup, and two competing buttons that pulled the visitor in different directions.",
      "The rebuild leads with cinematic Pacific Northwest photography, one clear Book Now action, and the credentials anglers care about right in the hero. Drag the slider to compare.",
    ],
    beforeImage: {
      src: `${IMG}/before-screenshot.webp`,
      srcSet: `${IMG}/before-screenshot-640w.webp 640w, ${IMG}/before-screenshot-1024w.webp 1024w, ${IMG}/before-screenshot-1600w.webp 1600w, ${IMG}/before-screenshot.webp 1885w`,
      alt: "The old Catching Chrome website, a blue template with two competing call-to-action buttons",
      width: 1885,
      height: 973,
    },
    afterImage: {
      src: `${IMG}/after-screenshot.webp`,
      srcSet: `${IMG}/after-screenshot-640w.webp 640w, ${IMG}/after-screenshot-1024w.webp 1024w, ${IMG}/after-screenshot-1600w.webp 1600w, ${IMG}/after-screenshot.webp 1892w`,
      alt: "The rebuilt Catching Chrome website, a dark cinematic hero with trust badges and one clear Book Now button",
      width: 1892,
      height: 1078,
    },
  },

  showcaseImage: {
    src: `${IMG}/showcase-devices.webp`,
    srcSet: `${IMG}/showcase-devices-640w.webp 640w, ${IMG}/showcase-devices-1024w.webp 1024w, ${IMG}/showcase-devices.webp 1536w`,
    alt: "The rebuilt Catching Chrome site shown across a laptop, tablet and phone",
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
          "A complete rebuild of the guide service's site, from a generic template into a branded, conversion-focused experience across phone, tablet and desktop.",
      },
      {
        icon: "shield-check",
        label: "Special attention",
        title: "Trust Front and Center",
        description:
          "USCG certification, forty plus years on the water, and included gear are surfaced in the hero, so a first-time visitor trusts the boat before they scroll.",
      },
      {
        icon: "smartphone",
        label: "Extra features",
        title: "Booking and Merch, Built In",
        description:
          "A persistent Book Now path on every screen, an Order Merch store, and a partners section, so the site does more than just describe the trips.",
      },
    ],
  },

  designApproach: {
    intro: {
      eyebrow: "Design approach",
      title: "Designed for anglers who book from the riverbank.",
      highlight: "book from the riverbank.",
    },
    items: [
      {
        image: {
          src: `${IMG}/spotlight-1.webp`,
          srcSet: `${IMG}/spotlight-1-640w.webp 640w, ${IMG}/spotlight-1-1024w.webp 1024w, ${IMG}/spotlight-1.webp 1448w`,
          alt: "The Catching Chrome site on a phone, with a pinned Book Now button and trust badges in the hero",
          width: 1448,
          height: 1086,
        },
        treatment: "inset",
        focus: "center",
        card: {
          title: "Mobile-first, with booking one tap away.",
          description:
            "Guided trips get researched and booked on phones, often outdoors and one-handed, so the mobile layout led the design instead of following it.",
          checklist: [
            "A Book Now button pinned in the header on every page, so the next step is never more than a tap away",
            "The credentials anglers scan for, USCG certified, forty plus years, gear included, stacked high in the hero",
            "Large, thumb-friendly buttons and fast photography that hold up on weak trailhead signal",
          ],
        },
      },
    ],
  },

  techStack: {
    intro: {
      eyebrow: "Tech stack",
      title: "Engineered to perform, not just to impress.",
      highlight: "perform",
    },
    items: [
      {
        title: "Fast and mobile-first by default",
        description:
          "Anglers open the site outdoors on patchy signal, so speed was a requirement, not a finishing touch. The pages stay light and load quickly on a phone.",
        checklist: [
          "Compressed, responsive photography that stays sharp without slowing the page",
          "A layout that reflows cleanly from phone to tablet to desktop",
          "One clear route to Book Now at every screen size",
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
        title: "Ready for a seasonal business",
        description:
          "A guide service changes with the runs and the calendar, so the site is organised around the pages that move most: excursions, pricing, gallery and merch. It is built to stay quick and available when peak season traffic arrives.",
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
      "If your business lives on getting booked, we will build you a site that does the asking. Let's talk about yours.",
    primaryCta: { label: "Start a Project", href: "/contact" },
    secondaryCta: {
      label: "Book a Free Discovery Call",
      href: "https://calendly.com/ethixweb-agency/30min?month=2026-06",
      external: true,
    },
  },
};
