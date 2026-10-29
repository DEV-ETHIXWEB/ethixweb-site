import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { handleRadioGroupKeys } from "@/lib/radio-group-keys";
import { EASE_PREMIUM } from "@/lib/motion";
import { cn } from "@/lib/utils";

import {
  OTHER_MAX_LENGTH,
  SECTIONS,
  TOTAL_QUESTIONS,
  type Question,
} from "@/lib/questionnaire/questions";
import type { AnswerValue } from "@/lib/questionnaire/types";
import { Eyebrow, GhostButton, PrimaryButton, focusRing } from "./ui";

const LETTERS = ["A", "B", "C", "D", "E"];

/** True when the answer is complete enough to move on. */
export function answerReady(value: AnswerValue | undefined): boolean {
  if (!value) return false;
  return value.choice !== "other" || (value.other ?? "").trim().length > 0;
}

export function QuestionStep({
  question,
  value,
  onChange,
  onNext,
  onPrev,
  nextLabel = "Continue",
  serverError,
}: {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  onNext: () => void;
  onPrev: () => void;
  nextLabel?: string;
  serverError?: string | null;
}) {
  const reduce = useReducedMotion();
  const [tried, setTried] = useState(false);
  const otherRef = useRef<HTMLTextAreaElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const ready = answerReady(value);
  const isOther = value?.choice === "other";
  const headingId = `${question.id}-heading`;

  // Put focus where the keyboard user needs it: the selected card (or the
  // first) on arrival, so arrows work immediately without a Tab.
  useEffect(() => {
    const target =
      groupRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]') ??
      groupRef.current?.querySelector<HTMLButtonElement>('[role="radio"]');
    target?.focus({ preventScroll: true });
  }, [question.id]);

  function attemptNext() {
    if (!ready) {
      setTried(true);
      if (isOther) otherRef.current?.focus();
      return;
    }
    onNext();
  }

  // Enter continues, and 1-5 pick an option, unless the candidate is typing.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (
        e.key === "Enter" &&
        !(e.target instanceof HTMLButtonElement && e.target.getAttribute("role") !== "radio")
      ) {
        e.preventDefault();
        attemptNext();
      }
      const n = Number(e.key);
      if (n >= 1 && n <= question.options.length) {
        e.preventDefault();
        select(question.options[n - 1].id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /** focusOther: jump into the text box. Yes for a pointer click or a number
   * key; no when arrowing through the group, or arrows would get stuck in
   * the textarea. */
  function select(choice: AnswerValue["choice"], focusOther = true) {
    setTried(false);
    if (choice === "other") {
      onChange({ choice, other: value?.choice === "other" ? (value.other ?? "") : "" });
      if (focusOther) requestAnimationFrame(() => otherRef.current?.focus());
    } else {
      onChange({ choice });
    }
  }

  const error =
    serverError ??
    (tried
      ? isOther
        ? "Tell us your answer in a few words, or pick one of the options."
        : "Pick the option that feels closest to you."
      : null);

  return (
    <div className="grid w-full gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <Eyebrow>
          Section {question.section} of 2 · {SECTIONS[question.section].name}
        </Eyebrow>
        <p className="mt-6 text-sm font-medium text-muted-foreground tabular-nums">
          Question {question.number} of {TOTAL_QUESTIONS}
        </p>
        <h2
          id={headingId}
          className="mt-2 font-display text-[1.55rem] leading-[1.25] font-bold tracking-[-0.02em] text-balance text-foreground sm:text-[2rem]"
        >
          {question.text}
        </h2>
      </div>

      <div className="min-w-0">
        <div
          ref={groupRef}
          role="radiogroup"
          aria-labelledby={headingId}
          aria-describedby={error ? `${question.id}-error` : undefined}
          onKeyDown={handleRadioGroupKeys}
          className="grid gap-3"
        >
          {question.options.map((opt, i) => {
            const selected = value?.choice === opt.id;
            const tabbable = selected || (!value && i === 0);
            return (
              <motion.button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={tabbable ? 0 : -1}
                // handleRadioGroupKeys moves selection with a synthetic .click(),
                // which has detail 0; a real pointer click has detail >= 1.
                onClick={(e) => select(opt.id, e.detail > 0)}

                whileTap={reduce ? undefined : { scale: 0.985 }}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.25,
                  delay: reduce ? 0 : i * 0.03,
                  ease: EASE_PREMIUM,
                }}
                className={cn(
                  "group relative flex min-h-[3.75rem] w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-colors duration-150 sm:px-5",
                  selected
                    ? "border-primary bg-primary/[0.08]"
                    : "border-border bg-card hover:border-foreground/25 hover:bg-white/[0.03]",
                  focusRing,
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold transition-colors duration-200",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground group-hover:text-foreground",
                  )}
                >
                  {selected ? <Check className="h-4 w-4" strokeWidth={3} /> : LETTERS[i]}
                </span>
                <span
                  className={cn(
                    "text-[15px] leading-snug sm:text-base",
                    selected ? "font-semibold text-foreground" : "font-medium text-foreground/85",
                  )}
                >
                  {opt.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence initial={false}>
          {isOther && (
            <motion.div
              key="other"
              initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: EASE_PREMIUM }}
              className="overflow-hidden"
            >
              <label htmlFor={`${question.id}-other`} className="sr-only">
                Your answer
              </label>
              <textarea
                ref={otherRef}
                id={`${question.id}-other`}
                rows={3}
                maxLength={OTHER_MAX_LENGTH}
                placeholder={question.otherPlaceholder}
                value={value?.other ?? ""}
                onChange={(e) => {
                  setTried(false);
                  onChange({ choice: "other", other: e.target.value });
                }}
                onKeyDown={(e) => {
                  // Cmd/Ctrl+Enter continues from inside the box; plain Enter
                  // stays a newline.
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    attemptNext();
                  }
                }}
                className="mt-3 w-full resize-none rounded-xl border border-primary/50 bg-card px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
              />
              <p className="mt-1 text-right text-xs text-muted-foreground tabular-nums">
                {(value?.other ?? "").length}/{OTHER_MAX_LENGTH}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="min-h-6 pt-3" aria-live="polite">
          {error && (
            <p id={`${question.id}-error`} className="text-sm font-medium text-error-text">
              {error}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <GhostButton type="button" onClick={onPrev}>
            <ArrowLeft className="h-4 w-4" />
            Previous
          </GhostButton>
          <PrimaryButton
            type="button"
            onClick={attemptNext}
            aria-disabled={!ready}
            className={ready ? "" : "opacity-50 hover:transform-none"}
          >
            {nextLabel}
            <ArrowRight className="h-4 w-4" />
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
