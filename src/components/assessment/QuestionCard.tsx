import { CheckSquare, Square, Circle, CircleDot, ListChecks } from "lucide-react";
import type { AnswerValue, CandidateQuestion } from "@/lib/assessment/types";
import { wordCount } from "@/lib/assessment/scoring";
import { handleRadioGroupKeys } from "@/lib/radio-group-keys";

export const TYPE_LABELS: Record<CandidateQuestion["type"], string> = {
  single: "Multiple Choice",
  multiple: "Multiple Select",
  paragraph: "Written Response",
  logical: "Logical Reasoning",
  aptitude: "Aptitude",
  personality: "Workplace Behaviour",
  situational: "Situational Judgement",
  fun: "Get To Know You",
};

const LETTERS = "ABCDEFGH";

interface QuestionCardProps {
  question: CandidateQuestion;
  index: number;
  total: number;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
}

export function QuestionCard({ question, index, total, value, onChange }: QuestionCardProps) {
  const isMulti = question.type === "multiple";
  const isParagraph = question.type === "paragraph";
  const isFreeText = question.options.length === 0 && !isParagraph; // open "fun" question

  return (
    <div className="premium-card rounded-3xl p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-border px-3 py-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Question {index + 1} of {total}
        </span>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-text">
          {TYPE_LABELS[question.type]}
        </span>
        <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
          {question.topic}
        </span>
      </div>

      {isMulti && (
        <p className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-bold text-amber-500">
          <ListChecks className="h-4 w-4 shrink-0" />
          Select ALL that apply.
        </p>
      )}

      <p className="mt-5 whitespace-pre-wrap text-base leading-relaxed text-foreground/95 sm:text-lg">
        {question.question}
      </p>

      {question.codeSnippet && (
        <pre className="mt-5 overflow-x-auto rounded-xl border border-border bg-black/80 p-4 font-mono text-sm leading-relaxed text-emerald-100/90">
          <code>{question.codeSnippet}</code>
        </pre>
      )}

      {isParagraph && (
        <ParagraphInput value={typeof value === "string" ? value : ""} onChange={onChange} />
      )}

      {isFreeText && (
        <input
          type="text"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          maxLength={300}
          placeholder="Type your answer..."
          className="mt-6 w-full select-text rounded-xl border border-border bg-input/60 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/50 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      )}

      {question.options.length > 0 && (
        <div
          role={isMulti ? "group" : "radiogroup"}
          aria-label={`Options for question ${index + 1}`}
          className="mt-6 space-y-3"
          onKeyDown={isMulti ? undefined : handleRadioGroupKeys}
        >
          {question.options.map((option, i) => {
            const selected = isMulti ? Array.isArray(value) && value.includes(i) : value === i;
            return (
              <button
                key={i}
                type="button"
                role={isMulti ? "checkbox" : "radio"}
                aria-checked={selected}
                tabIndex={isMulti ? undefined : selected || (value == null && i === 0) ? 0 : -1}
                onClick={() => {
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
    </div>
  );
}

function ParagraphInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const words = wordCount(value);
  const status =
    words === 0
      ? { text: "100-300 words required", cls: "text-muted-foreground" }
      : words < 100
        ? { text: `${words} words - aim for at least 100`, cls: "text-amber-500" }
        : words <= 300
          ? { text: `${words} words`, cls: "text-emerald-500" }
          : { text: `${words} words - trim toward 300`, cls: "text-amber-500" };

  return (
    <div className="mt-6">
      <textarea
        rows={10}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={8000}
        placeholder="Write your answer here (100-300 words)..."
        className="w-full select-text resize-none rounded-xl border border-border bg-input/60 px-4 py-3 text-base leading-relaxed text-foreground placeholder:text-muted-foreground/50 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm"
      />
      <p className={`mt-2 text-right text-xs font-bold tabular-nums ${status.cls}`}>
        {status.text}
      </p>
    </div>
  );
}
