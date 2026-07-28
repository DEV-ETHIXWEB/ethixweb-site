import type { CaseStudyDetail } from "@/data/case-studies/types";

const IMG = "/images/case-studies/garys-pipeline";

// Every fact below is sourced from the approved case-study design
// (public/NEW FORMAT/Gary's Pipeline.png) and the live site it documents
// (garyspipelining.com, verified reachable). One spot in that design was an
// explicit placeholder left by the designer - the Hosting tech-stack item
// carried a literal "[Confirm provider with dev team] - flag with Akash
// before final copy lock" note. Rather than invent a specific host/CDN we
// can't verify, that item is generalized to a statement the rest of the page
// already supports (static build, portable to any host). Swap in the real
// specs once confirmed; nothing else about the page needs to change.
export const GARYS_PIPELINE: CaseStudyDetail = {
  slug: "garys-pipeline",
  status: "Shipped",
  client: {
    name: "Gary's Pipelining & Drain Cleaning",
    logo: {
      src: `${IMG}/client-logo.webp`,
      alt: "Gary's Pipelining and Drain Cleaning, LLC logo",
      width: 660,
      height: 220,
    },
  },
  title: "Gary's Pipelining & Drain Cleaning, LLC",
  summary: "A specialist contractor's website, finally built to look - and convert - like one.",
  tags: ["Website Design", "25+ Pages", "SEO & Lead Gen"],
  websiteUrl: "https://garyspipelining.com",
  heroImage: {
    src: `${IMG}/hero.webp`,
    srcSet: `${IMG}/hero-640w.webp 640w, ${IMG}/hero-1024w.webp 1024w, ${IMG}/hero-1600w.webp 1600w, ${IMG}/hero.webp 3470w`,
    alt: "Gary's Pipelining's new site shown on a phone, held up against a red gradient background",
    width: 3470,
    height: 2650,
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
          alt: "Gary's Pipelining and Drain Cleaning, LLC logo",
          width: 660,
          height: 220,
        },
        label: "Client",
        title: "Gary's Pipelining & Drain Cleaning",
        description:
          "A licensed trenchless sewer repair & drain cleaning specialist serving Tukwila and the greater Seattle area - for homeowners and contractor partners alike.",
      },
      {
        icon: "wrench",
        label: "Industry",
        title: "Trenchless Sewer Repair",
        description:
          "A premium specialty trade most general plumbers don't offer. Customers need convincing they're paying for real expertise, not just another plumber.",
      },
      {
        icon: "laptop",
        label: "What we did",
        title: "Full Website Build",
        description:
          "25+ pages, two enquiry paths, and a built-in chat + accessibility toolkit, designed to turn specialist searches into specialist calls.",
      },
    ],
  },

  beforeAfter: {
    intro: {
      eyebrow: "Before & After",
      title: "Same crew, a site that finally earns the call.",
      highlight: "earns the call.",
    },
    body: [
      "The old site crammed a form, a phone number and a wall of buttons above the fold - a dated template that made a licensed, 5-star crew look like every other listing.",
      "The rebuild leads with the promise - no dig, no mess, fixed fast - and backs it with real Puget Sound job-site photos. Drag the slider to see the difference.",
    ],
    beforeImage: {
      src: `${IMG}/before-screenshot.webp`,
      srcSet: `${IMG}/before-screenshot-640w.webp 640w, ${IMG}/before-screenshot-1024w.webp 1024w, ${IMG}/before-screenshot-1600w.webp 1600w, ${IMG}/before-screenshot.webp 1920w`,
      alt: "The old Gary's Pipelining & Drain Cleaning website",
      width: 1920,
      height: 1080,
    },
    afterImage: {
      src: `${IMG}/after-screenshot.webp`,
      srcSet: `${IMG}/after-screenshot-640w.webp 640w, ${IMG}/after-screenshot-1024w.webp 1024w, ${IMG}/after-screenshot-1600w.webp 1600w, ${IMG}/after-screenshot.webp 1920w`,
      alt: "The rebuilt Gary's Pipelining & Drain Cleaning website",
      width: 1920,
      height: 1080,
    },
  },

  showcaseImage: {
    src: `${IMG}/showcase-devices.webp`,
    srcSet: `${IMG}/showcase-devices-640w.webp 640w, ${IMG}/showcase-devices-1024w.webp 1024w, ${IMG}/showcase-devices-1600w.webp 1600w, ${IMG}/showcase-devices.webp 5600w`,
    alt: "The rebuilt Gary's Pipelining site shown on a phone, laptop and tablet",
    width: 5600,
    height: 2830,
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
        title: "New Website Build",
        description:
          "A ground-up build replacing an old, underperforming site - new structure, new copy, one goal: get the enquiry form (or phone) used.",
      },
      {
        icon: "server",
        label: "Tech stack",
        title: "Static, No-CMS Build",
        description:
          "Pre-built, fast pages with no fragile backend - nothing to maintain, break, or get hacked. All site text lives in one central place.",
      },
      {
        icon: "smartphone",
        label: "Special attention",
        title: "Accessibility & Trust",
        description:
          "A built-in accessibility toolkit tested against WCAG 2.1 AA, plus real job photos, reviews, and license numbers throughout.",
      },
    ],
  },

  designApproach: {
    intro: {
      eyebrow: "Design approach",
      title: "Designed to convert two very different customers.",
      highlight: "two very different customers.",
    },
    items: [
      {
        image: {
          src: `${IMG}/spotlight-enquiry-flow.webp`,
          srcSet: `${IMG}/spotlight-enquiry-flow-640w.webp 640w, ${IMG}/spotlight-enquiry-flow-1024w.webp 1024w, ${IMG}/spotlight-enquiry-flow-1600w.webp 1600w, ${IMG}/spotlight-enquiry-flow.webp 2580w`,
          alt: "The homeowner contact panel next to the free-estimate request form",
          width: 2580,
          height: 1290,
        },
        treatment: "inset",
        focus: "center",
        card: {
          title:
            "Built for the homeowner with a flooded yard - and the contractor who needs a subcontractor.",
          description:
            "Gary's serves two audiences that want completely different things from a site visit, so the structure had to work for both without compromise.",
          checklist: [
            'Two separate enquiry forms - a homeowner "free estimate" form and a contractor partnership form with file attachments',
            "A dedicated page for every service and every city, so search traffic lands on exactly what it searched for",
            'A "call us instead" fallback the instant a form fails, so no enquiry is ever silently lost',
          ],
        },
      },
      {
        image: {
          src: `${IMG}/spotlight-chat-assistant.webp`,
          srcSet: `${IMG}/spotlight-chat-assistant-640w.webp 640w, ${IMG}/spotlight-chat-assistant-1024w.webp 1024w, ${IMG}/spotlight-chat-assistant-1600w.webp 1600w, ${IMG}/spotlight-chat-assistant.webp 2500w`,
          alt: "A hand holding a phone showing the new site's homepage, with the chat assistant icon visible",
          width: 2500,
          height: 1250,
        },
        treatment: "inset",
        focus: "left",
        card: {
          title: "An honest chat assistant - not a chatbot pretending to be human.",
          description:
            "The chat bubble on every page answers common questions instantly and always closes the loop with a real person or the emergency line.",
          checklist: [
            "Pre-written, client-approved answers - never guesses, never improvises",
            "Always ends by connecting to a phone number or a person",
            "Backed by structured business data so Google understands every service and city page",
          ],
        },
      },
    ],
  },

  techStack: {
    intro: {
      eyebrow: "Tech stack",
      title: "Built on modern infrastructure, not just modern design.",
      highlight: "modern design.",
    },
    items: [
      {
        title: "Platform: Static Site, No CMS",
        description:
          "Pre-built pages served without a database or backend to patch, hack, or break.",
        checklist: [
          "No plugin bloat - fewer moving parts, fewer things to break",
          "All text lives in one central place, so a price change updates everywhere at once",
          "Automatically generates its own sitemap for Google",
        ],
        image: {
          src: `${IMG}/tech-stack-platform.webp`,
          srcSet: `${IMG}/tech-stack-platform-640w.webp 640w, ${IMG}/tech-stack-platform-1024w.webp 1024w, ${IMG}/tech-stack-platform.webp 1254w`,
          alt: "The static site's source in a code editor, with a 98 Lighthouse performance score",
          width: 1254,
          height: 1254,
        },
      },
      {
        title: "Hosting: Modern, Managed Infrastructure",
        description:
          "Hosting specifics weren't finalized in the source brief - the build ships as a static site, so it's portable to any modern host without changing the underlying pages.",
        image: {
          src: `${IMG}/tech-stack-hosting.webp`,
          srcSet: `${IMG}/tech-stack-hosting-640w.webp 640w, ${IMG}/tech-stack-hosting-1024w.webp 1024w, ${IMG}/tech-stack-hosting.webp 1254w`,
          alt: "A cloud hosting dashboard showing a live region map and 99.99% uptime",
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
      "If All Phase Plumbing can go from invisible to fully booked in 90 days, imagine what we can do for your business.",
    primaryCta: { label: "Start a Project", href: "/contact" },
    secondaryCta: {
      label: "Book a Free Discovery Call",
      href: "https://calendly.com/ethixweb-agency/30min?month=2026-06",
      external: true,
    },
  },
};
