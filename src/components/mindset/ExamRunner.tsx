import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Loader2, Maximize, ShieldAlert } from "lucide-react";
import { useMindsetExamGuard } from "@/hooks/useMindsetExamGuard";
import { playGadsClick } from "@/lib/gads/sound";
import { AnswerPanel, OPTION_LETTERS, QuestionPanel } from "./QuestionCard";
import {
  LIKERT_POINTS,
  MINDSET_EXAM_DURATION_SECONDS,
  MINDSET_MAX_MAJOR_VIOLATIONS,
  MINDSET_QUESTION_COUNTS,
  MINDSET_VIOLATION_LABELS,
  type MindsetAnswerValue,
  type MindsetCandidateQuestion,
  type MindsetSubmitReason,
  type MindsetViolation,
} from "@/lib/mindset/types";

// The exam frame: a fixed header carrying identity, the one countdown and
// the submit control, a segmented rail showing position across the paper,
// and the two facing panels (see QuestionCard.tsx). Nothing scrolls at the
// page level, each panel scrolls on its own, so the clock and the rail are
// never out of sight.
//
// There is a single clock for the whole paper and no per-question timers:
// the candidate sets their own pace against it. What survives from the
// gads ExamRunner lineage is the rest of the discipline, forward-only
// navigation, reconnect-resilient saves, and a violation ladder that is
// stricter here, one warning then the next major violation submits
// (MINDSET_MAX_MAJOR_VIOLATIONS = 1).

const SAVE_INTERVAL_MS = 5000;
const OVERALL_WARNING_MINUTES = [10, 5, 1] as const;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function backoffDelayMs(attempt: number) {
  return Math.min(15000, 1000 * Math.pow(1.6, attempt));
}

interface PostResult {
  ok: boolean;
  data: Record<string, unknown> | null;
  transient: boolean;
}

async function postJson(url: string, body: unknown): Promise<PostResult> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (data === null) return { ok: false, data: null, transient: true };
    return { ok: res.ok, data, transient: !res.ok && res.status >= 500 };
  } catch {
    return { ok: false, data: null, transient: true };
  }
}

async function postJsonResilient(
  url: string,
  body: unknown,
  onRetrying?: (attempt: number) => void,
): Promise<PostResult> {
  let attempt = 0;
  while (true) {
    const result = await postJson(url, body);
    if (result.ok || !result.transient) return result;
    attempt++;
    onRetrying?.(attempt);
    await sleep(backoffDelayMs(attempt));
  }
}

interface ExamRunnerProps {
  token: string;
  candidateName: string;
  questions: MindsetCandidateQuestion[];
  initialIndex: number;
  initialDraftAnswer: MindsetAnswerValue | null;
  expiresAt: string;
  serverNow: string;
  onSubmitted: () => void;
}

export function ExamRunner({
  token,
  candidateName,
  questions,
  initialIndex,
  initialDraftAnswer,
  expiresAt,
  serverNow,
  onSubmitted,
}: ExamRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [phase, setPhase] = useState<"exam" | "submitting">("exam");
  const [warning, setWarning] = useState<{ count: number; label: string } | null>(null);
  const [overallWarning, setOverallWarning] = useState<number | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const guard = useMindsetExamGuard(phase === "exam");

  const draftValueRef = useRef<MindsetAnswerValue | null>(initialDraftAnswer);
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;
  const violationsRef = useRef<MindsetViolation[]>(guard.violations);
  violationsRef.current = guard.violations;

  const clockOffsetRef = useRef(new Date(serverNow).getTime() - Date.now());
  const deadlineMs = useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.round((deadlineMs - (Date.now() + clockOffsetRef.current)) / 1000)),
  );
  const warnedMinutesRef = useRef(new Set<number>());

  const submittingRef = useRef(false);
  const doSubmit = useCallback(
    async (reason: MindsetSubmitReason) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setPhase("submitting");

      const result = await postJsonResilient("/api/mindset/submit", { token, reason }, () =>
        setReconnecting(true),
      );
      setReconnecting(false);
      if (!result.ok || !result.data?.ok) return;

      await document.exitFullscreen().catch(() => {});
      onSubmitted();
    },
    [token, onSubmitted],
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      const left = Math.max(
        0,
        Math.round((deadlineMs - (Date.now() + clockOffsetRef.current)) / 1000),
      );
      setRemaining(left);

      for (const m of OVERALL_WARNING_MINUTES) {
        if (left <= m * 60 && left > 0 && !warnedMinutesRef.current.has(m)) {
          warnedMinutesRef.current.add(m);
          setOverallWarning(m);
        }
      }

      if (left <= 0) {
        window.clearInterval(id);
        void doSubmit("timer");
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [deadlineMs, doSubmit]);

  // Strict ladder: one warning, then the next major violation auto-submits.
  useEffect(() => {
    if (!guard.lastMajor) return;
    if (guard.lastMajor.count > MINDSET_MAX_MAJOR_VIOLATIONS) {
      void doSubmit("violations");
    } else {
      setWarning({
        count: guard.lastMajor.count,
        label: MINDSET_VIOLATION_LABELS[guard.lastMajor.type],
      });
    }
  }, [guard.lastMajor, doSubmit]);

  useEffect(() => {
    if (phase !== "exam") return;
    const id = window.setInterval(() => {
      const hasViolations = violationsRef.current.length > 0;
      if (!hasViolations && draftValueRef.current === null) return;
      void fetch("/api/mindset/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          forQuestionIndex: currentIndexRef.current,
          draftAnswer: draftValueRef.current,
          violations: violationsRef.current,
        }),
      }).catch(() => {});
    }, SAVE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [phase, token]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (phase === "exam") e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [phase]);

  const advancingRef = useRef(false);
  const doAdvance = useCallback(
    async (questionIndex: number, value: MindsetAnswerValue | null) => {
      if (advancingRef.current || phase !== "exam") return;
      advancingRef.current = true;
      draftValueRef.current = null;

      const result = await postJsonResilient(
        "/api/mindset/advance",
        { token, questionIndex, value },
        () => setReconnecting(true),
      );
      setReconnecting(false);

      if (!result.ok || !result.data?.ok) {
        const resyncIndex = result.data?.currentIndex;
        if (typeof resyncIndex === "number") setCurrentIndex(resyncIndex);
        advancingRef.current = false;
        return;
      }
      if (result.data.duplicate || result.data.done) {
        void doSubmit("manual");
        return;
      }
      setCurrentIndex(result.data.currentIndex as number);
      advancingRef.current = false;
    },
    [token, phase, doSubmit],
  );

  const handleSubmitNow = useCallback(async () => {
    playGadsClick();
    setShowSubmitConfirm(false);
    const draft = draftValueRef.current;
    if (draft !== null) {
      setReconnecting(true);
      await postJsonResilient("/api/mindset/save", {
        token,
        forQuestionIndex: currentIndexRef.current,
        draftAnswer: draft,
      });
      setReconnecting(false);
    }
    void doSubmit("manual");
  }, [token, doSubmit]);

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timerDanger = remaining <= 5 * 60;

  if (!question) return null;

  const elapsedFraction = Math.max(0, Math.min(1, 1 - remaining / MINDSET_EXAM_DURATION_SECONDS));

  return (
    <div className="exam-root fixed inset-0 z-[80] flex select-none flex-col bg-background text-foreground">
      {/* Time drains along the very top edge, questions fill the rail under
          the header. Two different axes, kept on two different edges so
          neither is mistaken for the other at a glance. */}
      <div className="absolute inset-x-0 top-0 z-10 h-[2px] bg-white/[0.06]" aria-hidden="true">
        <div
          className={`h-full transition-[width] duration-500 ease-linear ${
            timerDanger ? "bg-error-text" : "bg-primary"
          }`}
          style={{ width: `${elapsedFraction * 100}%` }}
        />
      </div>

      <header className="shrink-0 border-b border-border bg-charcoal/70">
        <div className="flex h-[4.5rem] items-center justify-between gap-6 px-6 xl:px-10">
          <div className="flex min-w-0 items-center gap-5">
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-primary-text">
                Ethixweb
              </p>
              <p className="truncate text-sm font-semibold tracking-tight">
                Mindset &amp; Fit Assessment
              </p>
            </div>
            <span className="hidden h-9 w-px bg-border sm:block" />
            <div className="hidden min-w-0 sm:block">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                Candidate
              </p>
              <p className="truncate text-sm font-semibold text-foreground/90">{candidateName}</p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-center">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/70">
              Time remaining
            </span>
            <span
              className={`font-mono text-[2.1rem] font-bold leading-none tabular-nums transition-colors xl:text-[2.4rem] ${
                timerDanger ? "animate-pulse text-error-text" : "text-foreground"
              }`}
              aria-label="Total time remaining"
            >
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-5">
            <div className="hidden text-right lg:block">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                Progress
              </p>
              <p className="font-mono text-sm font-bold tabular-nums text-foreground/90">
                {currentIndex + 1}
                <span className="text-muted-foreground/60"> / {questions.length}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                playGadsClick();
                setShowSubmitConfirm(true);
              }}
              className="rounded-full border border-border px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground transition hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              Submit
            </button>
          </div>
        </div>

        <ProgressRail total={questions.length} currentIndex={currentIndex} />
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)]">
        <QuestionRunner
          key={question.id}
          question={question}
          index={currentIndex}
          total={questions.length}
          remainingSeconds={remaining}
          initialValue={currentIndex === initialIndex ? initialDraftAnswer : null}
          isLast={isLast}
          onDraftChange={(value) => {
            draftValueRef.current = value;
          }}
          onAdvance={(value) => void doAdvance(currentIndex, value)}
        />
      </div>

      {reconnecting && (
        <div className="pointer-events-none fixed inset-x-0 top-28 z-[92] flex justify-center px-4">
          <div className="flex items-center gap-2.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold text-muted-foreground shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin" />
            Reconnecting. Your progress is safe, keep this window open.
          </div>
        </div>
      )}

      {overallWarning !== null && phase === "exam" && (
        <TimeWarningOverlay minutes={overallWarning} onDismiss={() => setOverallWarning(null)} />
      )}

      {warning && !overallWarning && phase === "exam" && (
        <Scrim>
          <div className="w-full max-w-md rounded-2xl border border-amber-500/25 bg-charcoal p-9 text-center shadow-lg">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-500">
              <ShieldAlert className="h-7 w-7" />
            </span>
            <p className="mt-5 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-amber-500">
              Warning 1 of 1
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold">This is your only warning</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Recorded: <strong className="text-foreground">{warning.label}</strong>. One more
              violation submits your exam immediately, exactly as it stands.
            </p>
            <button
              type="button"
              onClick={async () => {
                setWarning(null);
                if (!document.fullscreenElement) {
                  try {
                    await document.documentElement.requestFullscreen({ navigationUI: "hide" });
                  } catch {
                    // Denied re-entry simply registers as the next violation.
                  }
                }
              }}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 font-bold text-primary-foreground shadow-glow transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <Maximize className="h-4 w-4" />
              Return to fullscreen
            </button>
          </div>
        </Scrim>
      )}

      {showSubmitConfirm && phase === "exam" && (
        <Scrim>
          <div className="w-full max-w-md rounded-2xl border border-border bg-charcoal p-9 shadow-lg">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-primary-text">
              Confirm
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold">Submit your exam now?</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              You are on question{" "}
              <strong className="font-mono text-foreground">{currentIndex + 1}</strong> of{" "}
              <strong className="font-mono text-foreground">{questions.length}</strong>. Everything
              after this is marked skipped, and the exam cannot be reopened.
            </p>
            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  playGadsClick();
                  setShowSubmitConfirm(false);
                }}
                className="flex-1 rounded-full border border-border px-5 py-3 text-sm font-bold text-foreground transition hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                Keep going
              </button>
              <button
                type="button"
                onClick={() => void handleSubmitNow()}
                className="flex-1 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                Submit now
              </button>
            </div>
          </div>
        </Scrim>
      )}

      {phase === "submitting" && (
        <div className="fixed inset-0 z-[95] flex flex-col items-center justify-center gap-4 bg-background/96">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="font-display text-lg font-bold">
            {reconnecting ? "Reconnecting to submit your exam" : "Submitting your exam"}
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Do not close this window
          </p>
        </div>
      )}

      {remaining <= 0 && phase === "exam" && (
        <div className="fixed inset-0 z-[95] flex flex-col items-center justify-center gap-4 bg-background/96">
          <AlertTriangle className="h-7 w-7 text-amber-500" />
          <p className="font-display text-lg font-bold">Time is up</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Submitting your answers
          </p>
        </div>
      )}
    </div>
  );
}

function Scrim({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm">
      {children}
    </div>
  );
}

/** One tick per question, with a heavier divider where a section ends, so
 * the candidate can see both how far along they are and how much of the
 * current section is left. Section lengths come from the question counts
 * rather than being hardcoded here. */
function ProgressRail({ total, currentIndex }: { total: number; currentIndex: number }) {
  const sectionBoundaries = useMemo(() => {
    const likertEnd = MINDSET_QUESTION_COUNTS.likert;
    const situationalEnd = likertEnd + MINDSET_QUESTION_COUNTS.situational;
    return new Set([likertEnd, situationalEnd]);
  }, []);

  return (
    <div
      className="flex w-full items-end gap-px px-6 pb-3 xl:px-10"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={currentIndex + 1}
      aria-label="Exam progress"
    >
      {Array.from({ length: total }, (_, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <span
            key={i}
            className={`flex-1 rounded-[1px] transition-all duration-300 ${
              active
                ? "h-[7px] bg-primary-text"
                : done
                  ? "h-[5px] bg-primary/55"
                  : "h-[3px] bg-white/[0.09]"
            } ${sectionBoundaries.has(i) ? "ml-2.5" : ""}`}
          />
        );
      })}
    </div>
  );
}

function TimeWarningOverlay({ minutes, onDismiss }: { minutes: number; onDismiss: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(id);
  }, [onDismiss]);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-28 z-[92] flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-full border border-amber-500/40 bg-amber-500/15 px-6 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-amber-500 shadow-lg">
        {minutes} minute{minutes === 1 ? "" : "s"} remaining
      </div>
    </div>
  );
}

interface QuestionRunnerProps {
  question: MindsetCandidateQuestion;
  index: number;
  total: number;
  remainingSeconds: number;
  initialValue: MindsetAnswerValue | null;
  isLast: boolean;
  onDraftChange: (value: MindsetAnswerValue | null) => void;
  onAdvance: (value: MindsetAnswerValue | null) => void;
}

/** Holds the in-flight answer for one question. Remounted by the
 * `key={question.id}` in the parent on every question change, so the local
 * value never leaks from one question into the next. */
function QuestionRunner({
  question,
  index,
  total,
  remainingSeconds,
  initialValue,
  isLast,
  onDraftChange,
  onAdvance,
}: QuestionRunnerProps) {
  const [value, setValue] = useState<MindsetAnswerValue | null>(initialValue);
  const valueRef = useRef(value);
  valueRef.current = value;
  const firedRef = useRef(false);

  const handleChange = useCallback(
    (v: MindsetAnswerValue) => {
      setValue(v);
      onDraftChange(v);
    },
    [onDraftChange],
  );

  const handleAdvanceClick = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    playGadsClick();
    onAdvance(valueRef.current);
  }, [onAdvance]);

  // Keyboard control, the way real exam software works: 1 to 5 on the
  // agreement scale, A to D on a scenario, Enter to move on. Arrow keys
  // nudge along the scale, which is what anyone who has used a slider
  // expects. Skipped entirely on written questions, where every one of
  // those keys belongs to the textarea.
  useEffect(() => {
    if (question.mechanic === "written") return;
    const isLikert = question.mechanic === "likert";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT")) return;

      if (e.key === "Enter") {
        e.preventDefault();
        handleAdvanceClick();
        return;
      }

      if (isLikert) {
        const digit = Number.parseInt(e.key, 10);
        if (digit >= 1 && digit <= LIKERT_POINTS) {
          e.preventDefault();
          playGadsClick();
          handleChange(digit - 1);
          return;
        }
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          const current = typeof valueRef.current === "number" ? valueRef.current : null;
          const step = e.key === "ArrowRight" ? 1 : -1;
          // From untouched, an arrow enters the scale at its nearest end
          // rather than silently assuming the middle.
          const next =
            current === null
              ? step === 1
                ? 0
                : LIKERT_POINTS - 1
              : Math.max(0, Math.min(LIKERT_POINTS - 1, current + step));
          if (next !== current) {
            playGadsClick();
            handleChange(next);
          }
        }
        return;
      }

      const letterIndex = OPTION_LETTERS.indexOf(
        e.key.toUpperCase() as (typeof OPTION_LETTERS)[number],
      );
      if (letterIndex >= 0 && letterIndex < question.options.length) {
        e.preventDefault();
        playGadsClick();
        handleChange(letterIndex);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [question.mechanic, question.options.length, handleChange, handleAdvanceClick]);

  return (
    <>
      <QuestionPanel
        question={question}
        index={index}
        total={total}
        remainingSeconds={remainingSeconds}
      />
      <AnswerPanel
        question={question}
        value={value}
        onChange={handleChange}
        isLast={isLast}
        onAdvance={handleAdvanceClick}
      />
    </>
  );
}
