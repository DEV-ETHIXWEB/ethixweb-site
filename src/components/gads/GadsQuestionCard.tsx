import { CheckSquare, Square, Circle, CircleDot, ListChecks } from "lucide-react";
import type { GadsAnswerValue, GadsCandidateQuestion } from "@/lib/gads-types";
import { wordCount } from "@/lib/assessment-scoring";
import { playGadsClick } from "@/lib/gads-sound";

export const MECHANIC_LABELS: Record<GadsCandidateQuestion["mechanic"], string> = {
  single: "Single Correct",
  multiple: "Multiple Correct - select ALL that apply",
  scenario: "Scenario",
  written: "Short Written Answer",
};

const LETTERS = "ABCDEFGH";
const WRITTEN_WORD_TARGET = { min: 50, max: 150 };

interface GadsQuestionCardProps {
  question: GadsCandidateQuestion;
  index: number;
  total: number;
  value: GadsAnswerValue | null | undefined;
  onChange: (value: GadsAnswerValue) => void;
}

export function GadsQuestionCard({
  question,
  index,
  total,
  value,
  onChange,
}: GadsQuestionCardProps) {
  const isMulti = question.mechanic === "multiple";
  const isWritten = question.mechanic === "written";

  return (
    <div className="premium-card rounded-3xl p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-border px-3 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Question {index + 1} of {total}
        </span>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-text">
          {MECHANIC_LABELS[question.mechanic]}
        </span>
        <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
          {question.topic}
        </span>
      </div>

      <p className="mt-5 whitespace-pre-wrap text-base leading-relaxed text-foreground/95 sm:text-lg">
        {question.question}
      </p>

      {isWritten && (
        <WrittenInput value={typeof value === "string" ? value : ""} onChange={onChange} />
      )}

      {!isWritten && question.options.length > 0 && (
        <div
          role={isMulti ? "group" : "radiogroup"}
          aria-label={`Options for question ${index + 1}`}
          className="mt-6 space-y-3"
        >
          {question.options.map((option, i) => {
            const selected = isMulti ? Array.isArray(value) && value.includes(i) : value === i;
            return (
              <button
                key={i}
                type="button"
                role={isMulti ? "checkbox" : "radio"}
                aria-checked={selected}
                onClick={() => {
                  playGadsClick();
                  if (isMulti) {
                    const current = Array.isArray(value) ? value : [];
                    onChange(
                      current.includes(i)
                        ? current.filter((v) => v !== i)
                        : [...current, i].sort((a, b) => a - b),
                    );
                  } else {
                    onChange(i);
                  }
                }}
                className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition ${
                  selected
                    ? "border-primary bg-primary/10 shadow-glow"
                    : "border-border bg-input/40 hover:border-primary/40 hover:bg-input/70"
                }`}
              >
                <span
                  className={`mt-0.5 shrink-0 ${selected ? "text-primary-text" : "text-muted-foreground/60"}`}
                >
                  {isMulti ? (
                    selected ? (
                      <CheckSquare className="h-5 w-5" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )
                  ) : selected ? (
                    <CircleDot className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </span>
                <span className="min-w-0">
                  <span
                    className={`mr-2 font-mono text-xs font-bold ${selected ? "text-primary-text" : "text-muted-foreground/60"}`}
                  >
                    {LETTERS[i] ?? i + 1}
                  </span>
                  <span
                    className={`whitespace-pre-wrap text-sm leading-relaxed sm:text-base ${
                      selected ? "text-foreground" : "text-foreground/85"
                    }`}
                  >
                    {option}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {isMulti && (
        <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <ListChecks className="h-3.5 w-3.5 shrink-0" />
          More than one option may be correct.
        </p>
      )}
    </div>
  );
}

function WrittenInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const words = wordCount(value);
  const { min, max } = WRITTEN_WORD_TARGET;
  const status =
    words === 0
      ? { text: `${min}-${max} words expected`, cls: "text-muted-foreground" }
      : words < min
        ? { text: `${words} words - aim for at least ${min}`, cls: "text-amber-500" }
        : words <= max
          ? { text: `${words} words`, cls: "text-emerald-500" }
          : { text: `${words} words - keep it concise`, cls: "text-amber-500" };

  return (
    <div className="mt-6">
      <textarea
        rows={8}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={4000}
        placeholder={`Write your answer here (${min}-${max} words)...`}
        className="w-full select-text resize-none rounded-xl border border-border bg-input/60 px-4 py-3 text-base leading-relaxed text-foreground placeholder:text-muted-foreground/50 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm"
      />
      <p className={`mt-2 text-right text-xs font-bold tabular-nums ${status.cls}`}>
        {status.text}
      </p>
    </div>
  );
}
