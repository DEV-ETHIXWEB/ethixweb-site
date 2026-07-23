// Shared shape for every case study detail page. Every visual section on
// /portfolio/$slug reads from one of these fields - the route and its
// components never hardcode copy, images, or section content. A section
// simply doesn't render when its data is omitted (see each field's docs),
// so a future case study can skip e.g. `mobileFirst` or add extra
// `techStack.items` without touching any component.
//
// Kept as plain, JSON-serializable data (no JSX) so this can move to a CMS
// or markdown/frontmatter source later without reshaping - icons are looked
// up from string keys (see `icon-map.tsx`), and headline "highlight" words
// are plain substrings the renderer colors, not inline markup.

export type Image = {
  src: string;
  alt: string;
  /** Natural width/height, used to reserve layout space and avoid CLS. */
  width: number;
  height: number;
};

/** A short bullet list with a check icon, reused by spotlight and tech-stack cards. */
export type Checklist = string[];

/** Eyebrow + title(with one highlighted phrase) + optional supporting copy -
 * the header pattern repeated before Context, Snapshot, Design approach,
 * Mobile-first and Tech stack. */
export type SectionIntro = {
  eyebrow: string;
  /** Full heading text, e.g. "The who, what, and how?" */
  title: string;
  /** Exact substring of `title` to render in the accent color, e.g. "how?".
   * Omit to render the whole title in the default ink color. */
  highlight?: string;
  sub?: string;
};

/** One of the 3-up icon/logo cards used by both the Context and Snapshot
 * sections (identical visual treatment, different content). */
export type InfoCard = {
  /** Key into ICON_MAP (case-study/icon-map.tsx), e.g. "wrench". Ignored if `logo` is set. */
  icon?: string;
  /** Small logo image shown instead of an icon (used for the "Client" card). */
  logo?: Image;
  label: string;
  title: string;
  description: string;
};

/** One image + glass card "spotlight" moment inside the Design Approach section. */
export type SpotlightItem = {
  image: Image;
  /** "bleed" = full viewport-width photo, no side margins.
   * "inset" = contained photo with a visible rounded edge inside the page gutters. */
  treatment: "bleed" | "inset";
  /** Which part of the photo to keep when the rendered box's ratio doesn't
   * match the image and object-cover trims it (e.g. the narrower mobile
   * box trimming a wide 2:1 asset): "left"/"top" anchor the crop to that
   * edge, "center" (default) trims both sides evenly. */
  focus?: "center" | "left" | "top";
  card: {
    title: string;
    description: string;
    checklist?: Checklist;
  };
};

/** One row of the alternating Tech Stack list (Platform, Hosting, etc.). */
export type TechStackItem = {
  title: string;
  description: string;
  checklist?: Checklist;
  /** Optional supporting screenshot/photo. Renders a branded placeholder panel when omitted. */
  image?: Image;
};

export type CtaLink = { label: string; href: string; external?: boolean };

export interface CaseStudyDetail {
  slug: string;
  /** Status badge in the hero, e.g. "Shipped", "In progress". */
  status: string;
  client: {
    name: string;
    logo: Image;
  };
  /** Hero H1. Defaults to the client name on most case studies. */
  title: string;
  /** Hero paragraph under the title. */
  summary: string;
  /** Pill tags under the summary, e.g. "Web Design & Development". */
  tags: string[];
  /** "View Website" button target - omitted hides the button everywhere it would appear. */
  websiteUrl?: string;
  heroImage: Image;

  context: {
    intro: SectionIntro;
    cards: [InfoCard, InfoCard, InfoCard];
  };

  /** Interactive before/after comparison slider. Omit to skip the section entirely. */
  beforeAfter?: {
    beforeImage: Image;
    afterImage: Image;
    /** Optional copy shown beside the slider (slider left, this text right on
     * desktop). Omit both to render the slider on its own. */
    intro?: SectionIntro;
    /** One or more paragraphs rendered under `intro`, beside the slider. */
    body?: string[];
  };

  /** Plain framed photo with no overlay copy (the "laptop in hand" showcase moment). */
  showcaseImage?: Image;

  snapshot: {
    intro: SectionIntro;
    cards: [InfoCard, InfoCard, InfoCard];
  };

  designApproach?: {
    intro: SectionIntro;
    items: SpotlightItem[];
  };

  mobileFirst?: {
    intro: SectionIntro;
    image: Image;
  };

  techStack: {
    intro: SectionIntro;
    items: TechStackItem[];
  };

  closingCta: {
    intro: SectionIntro;
    description: string;
    primaryCta: CtaLink;
    secondaryCta: CtaLink;
  };
}
