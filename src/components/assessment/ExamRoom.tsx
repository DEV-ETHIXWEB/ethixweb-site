import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Loader2,
  Maximize,
  ShieldAlert,
  Video,
} from "lucide-react";
import { useExamGuard } from "@/hooks/useExamGuard";
import { QuestionCard } from "./QuestionCard";
import {
  MAX_MAJOR_VIOLATIONS,
  VIOLATION_LABELS,
  type AnswerMap,
  type AnswerValue,
  type CandidateQuestion,
  type SubmitReason,
  type Violation,
} from "@/lib/assessment/types";

// The live exam. Renders as a full-viewport layer above the site chrome:
// server-authoritative countdown, question palette, per-interaction autosave,
// the proctoring warning ladder (3 warnings, then forced submit), and the
// honest recording indicator. Answer submission happens here; the parent
// page handles the post-submit recording upload and the done screen.

const AUTOSAVE_DEBOUNCE_MS = 900;

interface ExamRoomProps {
  assessmentId: string;
  sessionToken: string;
  roleTitle: string;
  candidateName: string;
  questions: CandidateQuestion[];
  initialAnswers: AnswerMap;
  initialViolations: Violation[];
  /** ISO timestamps from the server - the client clock is never trusted alone. */
  expiresAt: string;
  serverNow: string;
  /** Live webcam stream for the self-view tile. */
  stream: MediaStream | null;
  onSubmitted: (reason: SubmitReason, violations: Violation[]) => void;
}

function isAnswered(value: AnswerValue | undefined): boolean {
  if (value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function ExamRoom({
  assessmentId,
  sessionToken,
  roleTitle,
  candidateName,
  questions,
  initialAnswers,
  initialViolations,
  expiresAt,
  serverNow,
  stream,
  onSubmitted,
}: ExamRoomProps) {
  const [answers, setAnswers] = useState<AnswerMap>(initialAnswers);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [current, setCurrent] = useState(0);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [warning, setWarning] = useState<{ count: number; label: string } | null>(null);
  const [phase, setPhase] = useState<"exam" | "submitting">("exam");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const guard = useExamGuard(phase === "exam");
  const { hydrate } = guard;
  useEffect(() => {
    if (initialViolations.length) hydrate(initialViolations);
  }, [hydrate, initialViolations]);

  // --- Server-authoritative countdown -------------------------------------
  const clockOffsetRef = useRef(new Date(serverNow).getTime() - Date.now());
  const deadlineMs = useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.round((deadlineMs - (Date.now() + clockOffsetRef.current)) / 1000)),
  );

  const answersRef = useRef(answers);
  answersRef.current = answers;
  const violationsRef = useRef(guard.violations);
  violationsRef.current = guard.violations;

  const submittingRef = useRef(false);
  const doSubmit = useCallback(
    async (reason: SubmitReason & ("manual" | "timer" | "violations")) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setPhase("submitting");
      setSubmitError(null);
      try {
        const res = await fetch("/api/assessment/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assessmentId,
            sessionToken,
            reason,
            answers: answersRef.current,
            violations: violationsRef.current,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error(data.error || "Could not submit");
        onSubmitted(reason, violationsRef.current);
      } catch (err) {
        submittingRef.current = false;
        setPhase("exam");
        setSubmitError(err instanceof Error ? err.message : "Could not submit. Please try again.");
      }
    },
    [assessmentId, sessionToken, onSubmitted],
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      const left = Math.max(
        0,
        Math.round((deadlineMs - (Date.now() + clockOffsetRef.current)) / 1000),
      );
      setRemaining(left);
      if (left <= 0) {
        window.clearInterval(id);
        void doSubmit("timer");
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [deadlineMs, doSubmit]);

  // --- Autosave after every interaction ------------------------------------
  const skippedFirstSave = useRef(false);
  useEffect(() => {
    if (!skippedFirstSave.current) {
      skippedFirstSave.current = true;
      return;
    }
    if (phase !== "exam") return;
    setSaveState("saving");
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/assessment/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assessmentId,
            sessionToken,
            answers: answersRef.current,
            violations: violationsRef.current,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.status === 409 && data.status && data.status !== "in_progress") {
          // Finalized elsewhere (expiry raced us) - submit is idempotent and
          // will report duplicate:true, moving the candidate to the done screen.
          void doSubmit("timer");
          return;
        }
        setSaveState(res.ok ? "saved" : "error");
        // The server's remaining-time answer corrects local clock drift.
        if (res.ok && typeof data.serverNow === "string") {
          clockOffsetRef.current = new Date(data.serverNow).getTime() - Date.now();
        }
      } catch {
        setSaveState("error");
      }
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [answers, guard.violations, phase, assessmentId, sessionToken, doSubmit]);

  // --- Violation warning ladder --------------------------------------------
  useEffect(() => {
    if (!guard.lastMajor) return;
    if (guard.lastMajor.count > MAX_MAJOR_VIOLATIONS) {
      void doSubmit("violations");
    } else {
      setWarning({
        count: guard.lastMajor.count,
        label: VIOLATION_LABELS[guard.lastMajor.type],
      });
    }
  }, [guard.lastMajor, doSubmit]);

  // --- Self-view video ------------------------------------------------------
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  // Leaving mid-exam loses unsaved work + the recording - make it deliberate.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (phase === "exam") e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [phase]);

  const question = questions[current];
  const answeredCount = questions.filter((q) => isAnswered(answers[String(q.id)])).length;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timerDanger = remaining <= 5 * 60;

  const setAnswer = (value: AnswerValue) =>
    setAnswers((prev) => ({ ...prev, [String(question.id)]: value }));

  const toggleFlag = () =>
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(question.id)) next.delete(question.id);
      else next.add(question.id);
      return next;
    });

  return (
    <div className="fixed inset-0 z-[80] flex select-none flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-card/60 px-4 backdrop-blur sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Ethixweb Assessment
          </p>
          <p className="truncate text-sm font-semibold">{roleTitle}</p>
        </div>

        <div
          className={`flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-base font-bold tabular-nums ${
            timerDanger
              ? "animate-pulse border-red-500/50 bg-red-500/10 text-error-text"
              : "border-border text-foreground"
          }`}
          aria-label="Time remaining"
        >
          <Clock className="h-4 w-4" />
          {minutes}:{seconds.toString().padStart(2, "0")}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-error-text sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            REC
          </span>
          <span className="hidden text-xs text-muted-foreground md:block" aria-live="polite">
            {saveState === "saving"
              ? "Saving..."
              : saveState === "saved"
                ? "All answers saved"
                : saveState === "error"
                  ? "Save failed - retrying"
                  : ""}
          </span>
          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-glow transition hover:bg-primary/90"
          >
            Submit
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Question palette */}
        <aside className="hidden w-60 shrink-0 flex-col gap-4 overflow-y-auto border-r border-border bg-card/40 p-4 lg:flex">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Questions · {answeredCount}/{questions.length} answered
          </p>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, i) => {
              const answered = isAnswered(answers[String(q.id)]);
              const isCurrent = i === current;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to question ${i + 1}, ${answered ? "answered" : "not answered"}${flagged.has(q.id) ? ", flagged for review" : ""}`}
                  aria-current={isCurrent ? "true" : undefined}
                  className={`relative flex h-9 items-center justify-center rounded-lg border text-xs font-bold tabular-nums transition ${
                    isCurrent
                      ? "border-primary bg-primary text-primary-foreground shadow-glow"
                      : answered
                        ? "border-primary/40 bg-primary/15 text-primary-text"
                        : "border-border bg-input/40 text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {i + 1}
                  {flagged.has(q.id) && (
                    <span
                      aria-hidden="true"
                      className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500"
                    />
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-auto space-y-1.5 text-[11px] text-muted-foreground">
            <p className="flex items-center gap-2">
              <span className="h-3 w-3 rounded border border-primary/40 bg-primary/15" /> Answered
            </p>
            <p className="flex items-center gap-2">
              <span className="h-3 w-3 rounded border border-border bg-input/40" /> Not answered
            </p>
            <p className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-500" /> Flagged for review
            </p>
          </div>
        </aside>

        {/* Question area */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-8 sm:py-10">
            <QuestionCard
              key={question.id}
              question={question}
              index={current}
              total={questions.length}
              value={answers[String(question.id)]}
              onChange={setAnswer}
            />

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={current === 0}
                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-2.5 text-sm font-bold text-foreground transition hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>

              <button
                type="button"
                onClick={toggleFlag}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-bold transition ${
                  flagged.has(question.id)
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-500"
                    : "border-border text-muted-foreground hover:border-amber-500/40"
                }`}
              >
                <Flag className="h-4 w-4" />
                {flagged.has(question.id) ? "Flagged" : "Flag for review"}
              </button>

              {current < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow transition hover:bg-primary/90"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow transition hover:bg-primary/90"
                >
                  Review & submit
                </button>
              )}
            </div>

            {/* Mobile palette */}
            <div className="mt-8 grid grid-cols-8 gap-2 lg:hidden">
              {questions.map((q, i) => {
                const mobileAnswered = isAnswered(answers[String(q.id)]);
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrent(i)}
                    aria-label={`Go to question ${i + 1}, ${mobileAnswered ? "answered" : "not answered"}${flagged.has(q.id) ? ", flagged for review" : ""}`}
                    aria-current={i === current ? "true" : undefined}
                    className={`relative flex h-9 items-center justify-center rounded-lg border text-xs font-bold tabular-nums ${
                      i === current
                        ? "border-primary bg-primary text-primary-foreground"
                        : mobileAnswered
                          ? "border-primary/40 bg-primary/15 text-primary-text"
                          : "border-border bg-input/40 text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                    {flagged.has(q.id) && (
                      <span
                        aria-hidden="true"
                        className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-amber-500"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* Self view + truthful recording notice */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[85] w-36 sm:w-44">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="aspect-[4/3] w-full rounded-xl border border-border bg-black object-cover shadow-lg"
        />
        <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold leading-tight text-muted-foreground">
          <Video className="h-3 w-3 shrink-0 text-error-text" />
          Camera and microphone recording is active.
        </p>
      </div>

      {/* Warning overlay */}
      {warning && phase === "exam" && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
          <div className="premium-card w-full max-w-md rounded-3xl p-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-500">
              <ShieldAlert className="h-7 w-7" />
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold">
              {warning.count >= MAX_MAJOR_VIOLATIONS
                ? "Final warning"
                : `Warning ${warning.count} of ${MAX_MAJOR_VIOLATIONS}`}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Detected: <strong className="text-foreground">{warning.label}</strong>. This has been
              recorded.{" "}
              {warning.count >= MAX_MAJOR_VIOLATIONS
                ? "One more violation and your assessment will be submitted automatically."
                : "Stay in fullscreen and keep this window focused for the rest of the assessment."}
            </p>
            <button
              type="button"
              onClick={async () => {
                setWarning(null);
                if (!document.fullscreenElement) {
                  try {
                    await document.documentElement.requestFullscreen({ navigationUI: "hide" });
                  } catch {
                    // Denied fullscreen re-entry will simply register as the
                    // next violation - nothing more to do here.
                  }
                }
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 font-bold text-primary-foreground shadow-glow"
            >
              <Maximize className="h-4 w-4" />
              Return to fullscreen & continue
            </button>
          </div>
        </div>
      )}

      {/* Submit confirmation */}
      {showSubmitModal && phase === "exam" && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
          <div className="premium-card w-full max-w-md rounded-3xl p-8">
            <h2 className="font-display text-2xl font-bold">Submit assessment?</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {candidateName.split(" ")[0]}, you've answered{" "}
              <strong className="text-foreground">
                {answeredCount} of {questions.length}
              </strong>{" "}
              questions
              {flagged.size > 0 && (
                <>
                  {" "}
                  with <strong className="text-foreground">{flagged.size} flagged</strong> for
                  review
                </>
              )}
              . Once submitted, your answers are final and cannot be changed.
            </p>
            {submitError && (
              <p
                role="alert"
                className="mt-3 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-error-text"
              >
                {submitError}
              </p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 rounded-full border border-border px-5 py-3 text-sm font-bold text-foreground transition hover:border-primary/50"
              >
                Keep working
              </button>
              <button
                type="button"
                onClick={() => void doSubmit("manual")}
                className="flex-1 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow"
              >
                Submit now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submitting overlay */}
      {phase === "submitting" && (
        <div className="fixed inset-0 z-[95] flex flex-col items-center justify-center gap-3 bg-background/95 backdrop-blur">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="font-semibold">Submitting your assessment...</p>
          <p className="text-sm text-muted-foreground">Please don't close this window.</p>
        </div>
      )}

      {/* Timer expired flash (shown briefly while the timer submit runs) */}
      {remaining <= 0 && phase === "exam" && (
        <div className="fixed inset-0 z-[95] flex flex-col items-center justify-center gap-3 bg-background/95 backdrop-blur">
          <AlertTriangle className="h-7 w-7 text-amber-500" />
          <p className="font-semibold">Time's up - submitting your answers...</p>
        </div>
      )}
    </div>
  );
}
