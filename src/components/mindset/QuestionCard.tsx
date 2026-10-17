import { useCallback, useRef } from "react";
import { wordCount } from "@/lib/assessment/scoring";
import { playGadsClick } from "@/lib/gads/sound";
import {
  LIKERT_LABELS,
  type MindsetAnswerValue,
  type MindsetCandidateQuestion,
} from "@/lib/mindset/types";

// The exam screen is built as two facing surfaces, the way a candidate sits
// a paper exam: the question booklet on the left, the answer sheet on the
// right. QuestionPanel and AnswerPanel are those two surfaces; ExamRunner
// owns the frame around them. Mono is used for every number and label here
// (question numeral, option letters, timer, word count) per the convention
// in styles.css, where --font-mono is reserved for stats and status.

const SECTION_NAMES: Record<MindsetCandidateQuestion["mechanic"], string> = {
  likert: "How much do you agree?",
  mcq: "About you",
  situational: "Situations",
  written: "In your own words",
};

const SECTION_NUMBERS: Record<MindsetCandidateQuestion["mechanic"], string> = {
  likert: "Section 1",
  mcq: "Section 2",
  situational: "Section 3",
  written: "Section 4",
};

export const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

interface QuestionPanelProps {
  question: MindsetCandidateQuestion;
  index: number;
  total: number;
  /** Seconds left on the paper's single clock, used only for the pace read. */
  remainingSeconds: number;
}

/** Left surface: the question booklet. The numeral is set loud because that
 * is how a real question paper is navigated, and it gives the eye a fixed
 * anchor while the text beside it changes every few seconds. */
export function QuestionPanel({ question, index, total, remainingSeconds }: QuestionPanelProps) {
  return (
    <div className="exam-panel-left flex min-h-0 flex-col overflow-y-auto px-8 py-9 xl:px-14 xl:py-11">
      <div className="flex shrink-0 items-center gap-3">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-primary-text">
          {SECTION_NUMBERS[question.mechanic]}
        </span>
        <span className="h-px w-8 bg-border" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {SECTION_NAMES[question.mechanic]}
        </span>
      </div>

      {/* The question block floats in the middle of whatever space is left,
          so a two-line and a five-line question both sit in a comfortable
          optical position instead of hugging the section label. */}
      <div className="flex flex-1 items-center py-10">
        <div className="flex items-start gap-6 xl:gap-7">
          <div className="shrink-0 pt-1">
            <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              Q
            </span>
            <span className="mt-1.5 block font-mono text-[3.4rem] font-bold leading-[0.9] tabular-nums text-foreground xl:text-[4rem]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="mt-3.5 block h-[2px] w-full bg-primary/70" />
          </div>

          <div className="min-w-0">
            <p className="max-w-[32ch] text-balance font-display text-[1.6rem] font-semibold leading-[1.26] tracking-[-0.018em] text-foreground xl:text-[2.05rem]">
              {question.question}
            </p>
            {question.hint && (
              <p className="mt-4 max-w-[40ch] border-l-2 border-primary/40 pl-3.5 text-sm leading-relaxed text-muted-foreground">
                {question.hint}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0">
        <PaceRead index={index} total={total} remainingSeconds={remainingSeconds} />
      </div>
    </div>
  );
}

/** With one clock for the whole paper, the useful thing to show is not the
 * time itself (that is already large in the header) but whether the pace is
 * sustainable: seconds per question still available. Stays quiet unless the
 * candidate is actually running short, since an alarm on every question
 * would just be noise. */
function PaceRead({
  index,
  total,
  remainingSeconds,
}: {
  index: number;
  total: number;
  remainingSeconds: number;
}) {
  const questionsLeft = Math.max(1, total - index);
  const perQuestion = Math.floor(remainingSeconds / questionsLeft);
  const tight = perQuestion < 12;

  return (
    <div className="flex items-center gap-5 border-t border-border pt-6">
      <div>
        <span
          className={`block font-mono text-[2.6rem] font-bold leading-none tabular-nums ${
            tight ? "text-error-text" : "text-foreground/90"
          }`}
        >
          {perQuestion}
          <span className="ml-1 text-base font-bold">s</span>
        </span>
      </div>
      <div className="max-w-[26ch]">
        <p
          className={`font-mono text-[11px] font-bold uppercase tracking-[0.2em] ${
            tight ? "text-error-text" : "text-muted-foreground"
          }`}
        >
          {tight ? "Pick up the pace" : "Per question from here"}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground/80">
          {questionsLeft} left. Answer at this pace and you finish with time to spare.
        </p>
      </div>
    </div>
  );
}

interface AnswerPanelProps {
  question: MindsetCandidateQuestion;
  value: MindsetAnswerValue | null | undefined;
  onChange: (value: MindsetAnswerValue) => void;
  isLast: boolean;
  onAdvance: () => void;
}

/** Right surface: the answer sheet. One decisive selected state, no hover
 * theatrics, because the candidate is reading fast and needs to see at a
 * glance which slot is filled. */
export function AnswerPanel({ question, value, onChange, isLast, onAdvance }: AnswerPanelProps) {
  const isWritten = question.mechanic === "written";
  const isLikert = question.mechanic === "likert";
  const answered = isWritten
    ? typeof value === "string" && value.trim().length > 0
    : typeof value === "number";

  const heading = isWritten ? "Your answer" : isLikert ? "Drag or click the scale" : "Choose one";
  const keyHint = isLikert ? "Keys 1 to 5" : isWritten ? null : "Keys A to D";

  return (
    <div className="exam-panel-right flex min-h-0 flex-col overflow-y-auto px-8 py-9 xl:px-14 xl:py-11">
      <div className="flex shrink-0 items-baseline justify-between gap-4">
        <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          {heading}
        </h2>
        {keyHint && (
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60 xl:inline">
            {keyHint}
          </span>
        )}
      </div>

      {isWritten ? (
        <div className="flex flex-1 flex-col py-8">
          <WrittenInput value={typeof value === "string" ? value : ""} onChange={onChange} />
        </div>
      ) : isLikert ? (
        <div className="flex flex-1 items-center py-8">
          <AgreementScale value={typeof value === "number" ? value : null} onChange={onChange} />
        </div>
      ) : (
        <div
          role="radiogroup"
          aria-label="Answer options"
          className="flex flex-1 flex-col justify-center gap-3 py-8 xl:gap-3.5"
        >
          {question.options.map((option, i) => {
            const selected = value === i;
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  playGadsClick();
                  onChange(i);
                }}
                className={`option-slot group flex w-full items-center gap-4 rounded-xl border px-4 py-4 text-left transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 xl:px-5 xl:py-[1.15rem] ${
                  selected
                    ? "border-primary/70 bg-primary/[0.09]"
                    : "border-border bg-white/[0.015] hover:border-white/20 hover:bg-white/[0.035]"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border font-mono text-sm font-bold transition duration-150 ${
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-white/15 text-muted-foreground group-hover:border-white/30 group-hover:text-foreground/80"
                  }`}
                >
                  {OPTION_LETTERS[i] ?? i + 1}
                </span>
                <span
                  className={`text-[0.95rem] leading-snug transition-colors duration-150 xl:text-base ${
                    selected ? "text-foreground" : "text-foreground/80"
                  }`}
                >
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex shrink-0 items-center justify-between gap-4 border-t border-border pt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground/70">
          {answered ? "Answer recorded" : "Nothing selected, this will count as skipped"}
        </p>
        <button
          type="button"
          onClick={onAdvance}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-glow transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {isLast ? "Finish exam" : "Next question"}
          <span aria-hidden="true" className="font-mono text-xs">
            &rarr;
          </span>
        </button>
      </div>
    </div>
  );
}

/** The agreement scale. Click a stop, drag the handle, or press 1 to 5
 * (handled by the runner). It deliberately starts with no handle on the
 * track rather than parked at Neutral, because a scale that begins in the
 * middle cannot tell "I am genuinely neutral" apart from "I never touched
 * this", and that difference is the whole point of asking. */
function AgreementScale({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const lastIndexRef = useRef<number | null>(value);
  const lastStop = LIKERT_LABELS.length - 1;

  const setFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0) return;
      const ratio = (clientX - rect.left) / rect.width;
      const next = Math.round(Math.max(0, Math.min(1, ratio)) * lastStop);
      if (next === lastIndexRef.current) return;
      lastIndexRef.current = next;
      playGadsClick();
      onChange(next);
    },
    [lastStop, onChange],
  );

  const pct = value === null ? 0 : (value / lastStop) * 100;

  return (
    <div className="w-full">
      <div
        className="relative px-7 py-8 select-none"
        onPointerDown={(e) => {
          draggingRef.current = true;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          setFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (draggingRef.current) setFromClientX(e.clientX);
        }}
        onPointerUp={() => {
          draggingRef.current = false;
        }}
        onPointerCancel={() => {
          draggingRef.current = false;
        }}
      >
        <div ref={trackRef} className="relative h-[3px] w-full rounded-full bg-white/10">
          {value !== null && (
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-150 ease-out"
              style={{ width: `${pct}%` }}
            />
          )}

          <div role="radiogroup" aria-label="Level of agreement">
            {LIKERT_LABELS.map((label, i) => {
              const selected = value === i;
              const atPct = (i / lastStop) * 100;
              return (
                <button
                  key={label}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={label}
                  onClick={() => {
                    if (value === i) return;
                    lastIndexRef.current = i;
                    playGadsClick();
                    onChange(i);
                  }}
                  className="absolute top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  style={{ left: `${atPct}%` }}
                >
                  <span
                    className={`block rounded-full transition-all duration-150 ${
                      selected
                        ? "h-6 w-6 bg-primary shadow-glow ring-4 ring-primary/20"
                        : value !== null && i < value
                          ? "h-2.5 w-2.5 bg-primary/70"
                          : "h-2.5 w-2.5 bg-white/25"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Capped narrow so the two end labels wrap onto a second line
            instead of running into their neighbours. */}
        <div className="relative mt-7 h-10">
          {LIKERT_LABELS.map((label, i) => {
            const atPct = (i / lastStop) * 100;
            const transform =
              i === 0 ? "translateX(0)" : i === lastStop ? "translateX(-100%)" : "translateX(-50%)";
            return (
              <span
                key={label}
                style={{ left: `${atPct}%`, transform }}
                className={`absolute top-0 w-[5.5rem] font-mono text-[10px] font-bold uppercase leading-[1.5] tracking-[0.1em] transition-colors duration-150 ${
                  value === i ? "text-primary-text" : "text-muted-foreground/60"
                } ${i === 0 ? "text-left" : i === lastStop ? "text-right" : "text-center"}`}
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const WRITTEN_MIN_WORDS = 10;

function WrittenInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const words = wordCount(value);
  const status =
    words === 0
      ? { text: "Write a few sentences", cls: "text-muted-foreground/70" }
      : words < WRITTEN_MIN_WORDS
        ? { text: `${words} words, keep going`, cls: "text-amber-500" }
        : { text: `${words} words`, cls: "text-emerald-500" };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <textarea
        rows={10}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={2000}
        autoFocus
        placeholder="Answer in your own words. There is no right answer here."
        className="w-full flex-1 select-text resize-none rounded-xl border border-border bg-white/[0.02] px-5 py-4 text-base leading-relaxed text-foreground placeholder:text-muted-foreground/45 transition focus:border-primary/60 focus:bg-white/[0.035] focus:outline-none focus:ring-2 focus:ring-primary/25"
      />
      <p
        className={`mt-3 text-right font-mono text-[11px] font-bold uppercase tracking-[0.16em] tabular-nums ${status.cls}`}
      >
        {status.text}
      </p>
    </div>
  );
}
