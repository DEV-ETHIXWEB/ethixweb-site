import { z } from "zod";
import { GADS_TOTAL_QUESTIONS } from "@/lib/gads/types";

// Request schemas shared by the gads API routes. Kept out of types.ts so zod
// never reaches the client bundle (types.ts is imported by the exam UI for
// sanitizeGadsQuestion), and kept in one place so /advance and /save can't
// drift apart on what a valid answer looks like - they commit to the same
// `answers` map, so a value one accepts and the other rejects is a bug.

/** The widest option list in the bank is 6, so an index above 5 is never
 * real; the ceiling stays at 9 to leave room for a longer question without
 * a schema change, and scoring range-checks against the actual question. */
const OPTION_INDEX = z.number().int().min(0).max(9);

/** Multi-select picks. Unique by construction: repeated indices used to let
 * `hits` exceed the number of correct answers in scoreQuestion, paying out
 * more than a question's max. The scorer now dedupes too - this just
 * rejects the malformed request outright instead of quietly repairing it. */
const OPTION_INDEX_SET = z
  .array(OPTION_INDEX)
  .max(6)
  .refine((picks) => new Set(picks).size === picks.length, {
    message: "Options must not repeat",
  });

/** A single question's answer: one option, a set of options, or written text. */
export const gadsAnswerValueSchema = z.union([
  OPTION_INDEX,
  OPTION_INDEX_SET,
  z.string().max(4000),
]);

/** The 64-hex exam token that stands in for a candidate's identity. */
export const gadsTokenSchema = z
  .string()
  .length(64)
  .regex(/^[0-9a-f]{64}$/);

export const gadsQuestionIndexSchema = z
  .number()
  .int()
  .min(0)
  .max(GADS_TOTAL_QUESTIONS - 1);
