import type { CaseStudyDetail } from "@/data/case-studies/types";

const IMG = "/images/case-studies/all-phase-plumbing";

// Every fact below (client, industry, the WordPress -> custom-build move, the
// Google Cloud hosting) is real, sourced from the approved case-study
// design. Two spots in that design left bracketed placeholders the designer
// never filled in (a "[Insert name] + [Insert name] + [Insert name]" stack
// list and an "[X]s to [X]s" load-time claim) - rather than invent specific
// framework names or numbers we can't verify, those were generalized to
// statements the surrounding copy already supports. Swap in the real specs
// here once they're confirmed; nothing else about the page needs to change.
export const ALL_PHASE_PLUMBING: CaseStudyDetail = {
  slug: "all-phase-plumbing",
  status: "Shipped",
  client: {
    name: "All Phase Plumbing",
    logo: { src: `${IMG}/app-logo-outlined.webp`, alt: "All Phase Plumbing logo", width: 900, height: 408 },
  },
  title: "All Phase Plumbing",
  summary:
    "A 35-year-old Seattle plumbing company got a site that finally matches how good they actually are.",
  tags: ["Website Migration Project", "Web Design & Development", "SEO & Lead Gen"],
  websiteUrl: "https://allphaseplumbing.com",
  heroImage: {
    src: `${IMG}/hero.webp`,
    alt: "All Phase Plumbing's new site shown on a phone, held up against a purple gradient background",
    width: 2000,
    height: 1500,
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
          src: `${IMG}/app-logo-outlined.webp`,
          alt: "All Phase Plumbing logo",
          width: 900,
          height: 408,
        },
        label: "Client",
        title: "All Phase Plumbing",
        description:
          "A family-run plumbing company serving Tukwila and Greater Seattle. Known locally for honest pricing and fast response.",
      },
      {
        icon: "wrench",
        label: "Industry",
        title: "Local Home Services",
        description:
          "A high-intent search market. Customers decide in seconds - whoever looks trustworthy and ranks well gets the call.",
      },
      {
        icon: "laptop",
        label: "What we did",
        title: "Full digital rebuild",
        description:
          "Website redesign, on-page SEO, Google Business Profile cleanup, and a content refresh built to convert visitors into calls.",
      },
    ],
  },

  beforeAfter: {
    intro: {
      eyebrow: "Before & After",
      title: "Same business, finally recognisable online.",
      highlight: "finally recognisable online.",
    },
    body: [
      "The old site buried a 35-year reputation under a dated template - slow, hard to read on a phone, and easy to scroll past. Nothing about it said “trust us with your emergency.”",
      "The rebuild leads with the phone number, the license, and the reviews. Drag the slider to see the difference a purpose-built site makes.",
    ],
    beforeImage: {
      src: `${IMG}/before-screenshot.webp`,
      alt: "The old All Phase Plumbing website",
      width: 1800,
      height: 1012,
    },
    afterImage: {
      src: `${IMG}/after-screenshot.webp`,
      alt: "The rebuilt All Phase Plumbing website",
      width: 1800,
      height: 1012,
    },
  },

  showcaseImage: {
    // Background-removed cutout (cream backdrop stripped to transparency and
    // cropped to the devices) so it sits cleanly on the dark page.
    src: `${IMG}/devices-mockup-cutout.webp`,
    alt: "The rebuilt All Phase Plumbing site shown on a laptop, tablet and phone",
    width: 4922,
    height: 2631,
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
        title: "Website Redesign",
        description:
          "A full rebuild from the ground up - new structure, new copy, one goal: get the phone to ring.",
      },
      {
        icon: "server",
        label: "Tech stack",
        title: "WordPress → Custom Build",
        description:
          "Moved from a generic WordPress theme to a custom-built stack designed to load faster and scale cleanly.",
      },
      {
        icon: "smartphone",
        label: "Special attention",
        title: "Mobile Optimised",
        description:
          "Most searches happen mid-emergency, on a phone. Every page loads fast and gets to the call button in seconds.",
      },
    ],
  },

  designApproach: {
    intro: {
      eyebrow: "Design approach",
      title: "Designed to convert, not just impress.",
      highlight: "not just impress.",
    },
    items: [
      {
        image: {
          // Pre-cropped from spotlight-homeowner.jpg to the reference
          // design's 2:1 framing (phone large, anchored left).
          src: `${IMG}/spotlight-homeowner-framed.webp`,
          alt: "A phone showing the new site's homepage, resting on a stone surface",
          width: 1472,
          height: 736,
        },
        treatment: "inset",
        focus: "left",
        card: {
          title: "Designed for the stressed homeowner at 11pm.",
          description:
            "Someone with a burst pipe isn't browsing - they're scanning for the phone number and the “Book Now” button. Every pixel earns its place.",
          checklist: [
            "Mobile number persistent in the header on mobile",
            "Primary CTA visible within 2 seconds of landing",
            "Service areas are scannable at a glance",
          ],
        },
      },
      {
        image: {
          // Pre-cropped from spotlight-intentional.jpg to the reference
          // design's 2:1 framing (phone large, anchored left).
          src: `${IMG}/spotlight-intentional-framed.webp`,
          alt: "A hand holding a phone showing the new site's homepage",
          width: 1470,
          height: 735,
        },
        treatment: "inset",
        focus: "left",
        card: {
          title: "Every decision is intentional",
          description:
            "Nothing on the page competes with itself. The most important action always sits above the fold.",
          checklist: [
            "Header states the outcome: fast, honest plumbing in Tukwila",
            "Trust signals (ratings, licenses) sit right under the headline",
            "Sticky header includes the ‘Book Now’ CTA so it's always accessible",
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
        title: "Platform: Custom Build",
        description:
          "Migrated off legacy WordPress to a faster, more reliable stack - built to stay up, load fast, and scale without breaking.",
        checklist: [
          "No plugin bloat - fewer moving parts, fewer things to break",
          "Built to handle traffic spikes without slowing down",
          "Faster page loads than the legacy WordPress site",
        ],
      },
      {
        title: "Hosting: Google Cloud",
        description:
          "Hosted on the same infrastructure Google runs its own products on - not shared WordPress hosting split across hundreds of other sites.",
        checklist: [
          "Less downtime, even during high-traffic days",
          "Automatic backups, so nothing gets lost",
          "Built-in security that updates itself",
        ],
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
