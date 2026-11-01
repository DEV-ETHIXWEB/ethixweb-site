import type { Post } from "@/data/posts/types";
import mapPack from "@/data/posts/google-map-pack-for-contractors";
import lsa from "@/data/posts/local-services-ads-vs-google-ads";
import missedCalls from "@/data/posts/missed-calls-ai-receptionist";
import reviews from "@/data/posts/get-more-google-reviews";
import website from "@/data/posts/contractor-website-that-books-jobs";
import seo from "@/data/posts/seo-for-plumbers-and-hvac";
import budget from "@/data/posts/hvac-plumbing-marketing-budget";
import callTracking from "@/data/posts/call-tracking-for-contractors";
import heatPumps from "@/data/posts/heat-pump-marketing-pacific-northwest";

export type { Post, PostBlock } from "@/data/posts/types";

// Published articles, newest first. A post is one data file plus its import
// here; /blog, /blog/$slug and the sitemap (scripts/generate-sitemap.mjs
// reads this folder) pick it up.
export const POSTS: Post[] = [
  mapPack,
  seo,
  lsa,
  heatPumps,
  budget,
  missedCalls,
  reviews,
  website,
  callTracking,
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
