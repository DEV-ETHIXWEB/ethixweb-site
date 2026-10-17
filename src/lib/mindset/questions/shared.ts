import type { MindsetQuestion } from "@/lib/mindset/types";

/** Authored content omits `id` - ids are assigned sequentially after each
 * section is independently shuffled in ./index.ts, so the source order below
 * carries no information about final position. */
export type AuthoredMindsetQuestion = Omit<MindsetQuestion, "id">;
