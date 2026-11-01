import type { Solution } from "@/data/solutions/types";
import hvacSeo from "@/data/solutions/hvac-seo";
import plumberSeo from "@/data/solutions/plumber-seo";
import hvacWebsite from "@/data/solutions/hvac-website-design";
import plumbingWebsite from "@/data/solutions/plumbing-website-design";
import answering from "@/data/solutions/answering-service-for-contractors";

export type { Solution } from "@/data/solutions/types";

// Keyword landing pages. Each also needs a route file at
// src/routes/<slug>.tsx (three lines, see hvac-seo.tsx); the sitemap
// script reads this folder.
export const SOLUTIONS: Solution[] = [hvacSeo, plumberSeo, hvacWebsite, plumbingWebsite, answering];
