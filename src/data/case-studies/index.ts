import type { CaseStudyDetail } from "@/data/case-studies/types";
import { ALL_PHASE_PLUMBING } from "@/data/case-studies/all-phase-plumbing";
import { GARYS_PIPELINE } from "@/data/case-studies/garys-pipeline";
import { CATCHING_CHROME } from "@/data/case-studies/catching-chrome";
import { PREVENTIVE_HOME_SOLUTIONS } from "@/data/case-studies/preventive-home-solutions";

export type { CaseStudyDetail } from "@/data/case-studies/types";

// Registry of every case study that has a full /our-work/$slug detail page.
// To add the next one: write a new `src/data/case-studies/<slug>.ts` file
// shaped like `all-phase-plumbing.ts` and add it to this array - the route,
// the prev/next nav, and the "View case study" link on /portfolio all pick
// it up automatically. Nothing else changes.
export const CASE_STUDY_DETAILS: CaseStudyDetail[] = [
  ALL_PHASE_PLUMBING,
  GARYS_PIPELINE,
  CATCHING_CHROME,
  PREVENTIVE_HOME_SOLUTIONS,
];

export function getCaseStudyDetail(slug: string): CaseStudyDetail | undefined {
  return CASE_STUDY_DETAILS.find((s) => s.slug === slug);
}

export function hasCaseStudyDetail(slug: string): boolean {
  return CASE_STUDY_DETAILS.some((s) => s.slug === slug);
}

/** Next case study in the registry, wrapping around - powers the "Next case
 * study" link in the closing CTA. Returns undefined once there's only one. */
export function getNextCaseStudy(slug: string): CaseStudyDetail | undefined {
  if (CASE_STUDY_DETAILS.length < 2) return undefined;
  const i = CASE_STUDY_DETAILS.findIndex((s) => s.slug === slug);
  if (i === -1) return undefined;
  return CASE_STUDY_DETAILS[(i + 1) % CASE_STUDY_DETAILS.length];
}
