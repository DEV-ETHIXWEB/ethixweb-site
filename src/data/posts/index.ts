import type { Post } from "@/data/posts/types";
import mapPack from "@/data/posts/google-map-pack-for-contractors";
import lsa from "@/data/posts/local-services-ads-vs-google-ads";
import missedCalls from "@/data/posts/missed-calls-ai-receptionist";

export type { Post, PostBlock } from "@/data/posts/types";

// Published articles, newest first. A post is one data file plus its import
// here; /blog, /blog/$slug and the sitemap (scripts/generate-sitemap.mjs
// reads this folder) pick it up.
export const POSTS: Post[] = [mapPack, lsa, missedCalls];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
