import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { AlertTriangle, Clock, LogOut, Loader2, Maximize, ShieldAlert, Video } from "lucide-react";
import { useGadsExamGuard } from "@/hooks/useGadsExamGuard";
import { useGadsMediaCapture } from "@/hooks/useGadsMediaCapture";
import { useQuestionTimer } from "@/hooks/useQuestionTimer";
import type { useMediaRecording } from "@/hooks/useMediaRecording";
import { playGadsClick } from "@/lib/gads-sound";
import { GadsQuestionCard } from "./GadsQuestionCard";
import {
  GADS_MAX_MAJOR_VIOLATIONS,
  GADS_OVERALL_WARNING_MINUTES,
  GADS_TIME_LIMITS,
  GADS_VIOLATION_LABELS,
  type GadsAnswerValue,
  type GadsCandidateQuestion,
  type GadsMicSample,
  type GadsSubmitReason,
  type GadsViolation,
} from "@/lib/gads-types";

const SAVE_INTERVAL_MS = 5000;

// A dropped wifi connection or a mobile-data blip must never cost the
// candidate their progress or force an unwanted submit - only the overall
// timer (or the violation ladder) is allowed to end the exam. These two
// helpers retry transient failures with backoff instead of giving up after
// one attempt.

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffDelayMs(attempt: number) {
  return Math.min(15000, 1000 * Math.pow(1.6, attempt));
}

interface PostResult {
  /** True only for a clean 2xx response with a parseable JSON body. */
  ok: boolean;
  data: Record<string, unknown> | null;
  /** True when the failure looks transient (network error, timeout, 5xx) -
   * worth retrying. False for a clean 4xx business response the caller
   * should handle immediately (e.g. a stale index, an email mismatch). */
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

/** Retries only transient failures, with capped exponential backoff, until
 * it gets a definitive answer from the server. `onRetrying` fires (with the
 * attempt count) after the first failed attempt so the UI can show a
 * reconnecting indicator instead of hanging silently. */
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
  questions: GadsCandidateQuestion[];
  initialIndex: number;
  initialDraftAnswer: GadsAnswerValue | null;
  initialRemainingQuestionSeconds: number | undefined;
  expiresAt: string;
  serverNow: string;
  stream: MediaStream | null;
  media: ReturnType<typeof useMediaRecording>;
  onSubmitted: () => void;
}

function isAnswerEmpty(value: GadsAnswerValue | null | undefined): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export function ExamRunner({
  token,
  questions,
  initialIndex,
  initialDraftAnswer,
  initialRemainingQuestionSeconds,
  expiresAt,
  serverNow,
  stream,
  media,
  onSubmitted,
}: ExamRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [phase, setPhase] = useState<"exam" | "submitting">("exam");
  const [warning, setWarning] = useState<{ count: number; label: string } | null>(null);
  const [overallWarning, setOverallWarning] = useState<number | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const firstQuestionSecondsRef = useRef(
    initialRemainingQuestionSeconds ??
      GADS_TIME_LIMITS[questions[initialIndex]?.mechanic ?? "single"],
  );

  const guard = useGadsExamGuard(phase === "exam");

  const draftValueRef = useRef<GadsAnswerValue | null>(initialDraftAnswer);
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;
  const violationsRef = useRef<GadsViolation[]>(guard.violations);
  violationsRef.current = guard.violations;

  // --- Server-authoritative overall countdown -------------------------------
  const clockOffsetRef = useRef(new Date(serverNow).getTime() - Date.now());
  const deadlineMs = useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.round((deadlineMs - (Date.now() + clockOffsetRef.current)) / 1000)),
  );
  const warnedMinutesRef = useRef(new Set<number>());

  // Once the exam has genuinely ended (last question answered, overall
  // timer hit zero, or the violation ladder tripped), submission is the
  // only outcome - a dropped connection just delays it. postJsonResilient
  // keeps retrying with backoff rather than ever reverting to a broken
  // "exam" view with no current question left to show.
  const submittingRef = useRef(false);
  const doSubmit = useCallback(
    async (reason: GadsSubmitReason) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setPhase("submitting");

      const result = await postJsonResilient("/api/gads/submit", { token, reason }, () =>
        setReconnecting(true),
      );
      setReconnecting(false);
      if (!result.ok || !result.data?.ok) {
        // A definitive (non-transient) rejection at this stage means the
        // token/row itself is invalid - nothing left to retry productively.
        // The candidate still sees "submitting" rather than a blank/broken
        // screen; a manual refresh will resolve to the row's real status.
        return;
      }

      const blob = await media.stopRecording();
      media.releaseStream();
      await document.exitFullscreen().catch(() => {});

      if (blob) {
        try {
          const ext = media.getMimeType().includes("mp4") ? "mp4" : "webm";
          const uploaded = await upload(`gads-recordings/${token}.${ext}`, blob, {
            access: "public",
            handleUploadUrl: "/api/gads/media-upload",
            clientPayload: JSON.stringify({ token }),
            multipart: blob.size > 20 * 1024 * 1024,
            contentType: blob.type || `video/${ext}`,
          });
          await fetch("/api/gads/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, recordingUrl: uploaded.url }),
          });
        } catch (err) {
          console.error("[gads] recording upload failed:", err);
        }
      }

      onSubmitted();
    },
    [token, media, onSubmitted],
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      const left = Math.max(
        0,
        Math.round((deadlineMs - (Date.now() + clockOffsetRef.current)) / 1000),
      );
      setRemaining(left);

      for (const m of GADS_OVERALL_WARNING_MINUTES) {
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

  // --- Violation warning ladder ----------------------------------------------
  useEffect(() => {
    if (!guard.lastMajor) return;
    if (guard.lastMajor.count > GADS_MAX_MAJOR_VIOLATIONS) {
      void doSubmit("violations");
    } else {
      setWarning({
        count: guard.lastMajor.count,
        label: GADS_VIOLATION_LABELS[guard.lastMajor.type],
      });
    }
  }, [guard.lastMajor, doSubmit]);

  // --- Camera snapshots + mic activity ---------------------------------------
  const handleSnapshot = useCallback(
    async (blob: Blob) => {
      try {
        const uploaded = await upload(`gads-snapshots/${token}-${Date.now()}.jpg`, blob, {
          access: "public",
          handleUploadUrl: "/api/gads/media-upload",
          clientPayload: JSON.stringify({ token }),
          contentType: "image/jpeg",
        });
        await fetch("/api/gads/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, cameraSnapshotUrl: uploaded.url }),
        });
      } catch (err) {
        console.error("[gads] snapshot upload failed:", err);
      }
    },
    [token],
  );
  const { drainMicSamples } = useGadsMediaCapture(stream, phase === "exam", handleSnapshot);

  // --- Periodic batched flush: draft answer + violations + mic samples -------
  useEffect(() => {
    if (phase !== "exam") return;
    const id = window.setInterval(() => {
      const micActivity: GadsMicSample[] = drainMicSamples();
      const hasViolations = violationsRef.current.length > 0;
      if (!hasViolations && micActivity.length === 0 && draftValueRef.current === null) return;
      void fetch("/api/gads/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          forQuestionIndex: currentIndexRef.current,
          draftAnswer: draftValueRef.current,
          violations: violationsRef.current,
          micActivity,
        }),
      }).catch(() => {});
    }, SAVE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [phase, token, drainMicSamples]);

  // --- Self-view video --------------------------------------------------------
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (phase === "exam") e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [phase]);

  // --- Forced advance ----------------------------------------------------------
  // A network blip here must never strand the candidate or cost them their
  // pick - postJsonResilient keeps retrying until the server actually
  // confirms the commit. Only a definitive business response (stale index,
  // row no longer in progress) short-circuits the retry loop.
  const advancingRef = useRef(false);
  const doAdvance = useCallback(
    async (questionIndex: number, value: GadsAnswerValue | null) => {
      if (advancingRef.current || phase !== "exam") return;
      advancingRef.current = true;
      draftValueRef.current = null;

      const result = await postJsonResilient(
        "/api/gads/advance",
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

  // --- Voluntary early submit ---------------------------------------------
  // The candidate can end the exam whenever they want, not just after the
  // last question - flushes whatever's currently picked (so a last-second
  // choice isn't lost to the periodic autosave's up-to-5s lag) before
  // finalizing. Any question never reached gets backfilled as skipped
  // server-side, same as a timer-driven forced submit.
  const handleSubmitNow = useCallback(async () => {
    playGadsClick();
    setShowSubmitConfirm(false);
    const draft = draftValueRef.current;
    if (draft !== null) {
      setReconnecting(true);
      await postJsonResilient("/api/gads/save", {
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

  return (
    <div className="fixed inset-0 z-[80] flex select-none flex-col bg-background text-foreground">
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-card/60 px-4 backdrop-blur sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold uppercase tracking-widest text-muted-foreground">
            EthixWeb Assessment
          </p>
          <p className="truncate text-sm font-semibold">Google Ads Assessment</p>
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

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-error-text sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            REC
          </span>
          <button
            type="button"
            onClick={() => {
              playGadsClick();
              setShowSubmitConfirm(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            Submit
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 items-start justify-center overflow-y-auto">
        <div className="w-full max-w-3xl px-4 py-6 sm:px-8 sm:py-10">
          <GadsQuestionRunner
            key={question.id}
            question={question}
            index={currentIndex}
            total={questions.length}
            secondsForThisQuestion={
              currentIndex === initialIndex
                ? firstQuestionSecondsRef.current
                : GADS_TIME_LIMITS[question.mechanic]
            }
            initialValue={currentIndex === initialIndex ? initialDraftAnswer : null}
            isLast={isLast}
            onDraftChange={(value) => {
              draftValueRef.current = value;
            }}
            onExpire={(value) => void doAdvance(currentIndex, value)}
            onAdvance={(value) => void doAdvance(currentIndex, value)}
          />
        </div>
      </div>

      {reconnecting && (
        <div className="pointer-events-none fixed inset-x-0 top-20 z-[92] flex justify-center px-4">
          <div className="flex items-center gap-2.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-bold text-muted-foreground shadow-lg backdrop-blur">
            <Loader2 className="h-4 w-4 animate-spin" />
            Reconnecting - your progress is safe, please keep this window open...
          </div>
        </div>
      )}

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

      {overallWarning !== null && phase === "exam" && (
        <TimeWarningOverlay minutes={overallWarning} onDismiss={() => setOverallWarning(null)} />
      )}

      {warning && !overallWarning && phase === "exam" && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
          <div className="premium-card w-full max-w-md rounded-3xl p-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-500">
              <ShieldAlert className="h-7 w-7" />
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold">
              {warning.count >= GADS_MAX_MAJOR_VIOLATIONS
                ? "Final warning"
                : `Warning ${warning.count} of ${GADS_MAX_MAJOR_VIOLATIONS}`}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Detected: <strong className="text-foreground">{warning.label}</strong>. This has been
              recorded.{" "}
              {warning.count >= GADS_MAX_MAJOR_VIOLATIONS
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
                    // Denied re-entry simply registers as the next violation.
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

      {showSubmitConfirm && phase === "exam" && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
          <div className="premium-card w-full max-w-md rounded-3xl p-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary-text">
              <LogOut className="h-7 w-7" />
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold">Submit assessment now?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You're on question <strong className="text-foreground">{currentIndex + 1}</strong> of{" "}
              <strong className="text-foreground">{questions.length}</strong>. Any remaining
              questions will be marked as skipped, and you won't be able to answer them afterward.
              This can't be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  playGadsClick();
                  setShowSubmitConfirm(false);
                }}
                className="flex-1 rounded-full border border-border px-5 py-3 text-sm font-bold text-foreground transition hover:border-primary/50"
              >
                Keep going
              </button>
              <button
                type="button"
                onClick={() => void handleSubmitNow()}
                className="flex-1 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-glow"
              >
                Submit now
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === "submitting" && (
        <div className="fixed inset-0 z-[95] flex flex-col items-center justify-center gap-3 bg-background/95 backdrop-blur">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="font-semibold">
            {reconnecting
              ? "Reconnecting to submit your assessment..."
              : "Submitting your assessment..."}
          </p>
          <p className="text-sm text-muted-foreground">Please don't close this window.</p>
        </div>
      )}

      {remaining <= 0 && phase === "exam" && (
        <div className="fixed inset-0 z-[95] flex flex-col items-center justify-center gap-3 bg-background/95 backdrop-blur">
          <AlertTriangle className="h-7 w-7 text-amber-500" />
          <p className="font-semibold">Time's up - submitting your answers...</p>
        </div>
      )}
    </div>
  );
}

function TimeWarningOverlay({ minutes, onDismiss }: { minutes: number; onDismiss: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(id);
  }, [onDismiss]);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[92] flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-5 py-2.5 text-sm font-bold text-amber-600 shadow-lg backdrop-blur">
        <Clock className="h-4 w-4" />
        {minutes} minute{minutes === 1 ? "" : "s"} remaining
      </div>
    </div>
  );
}

interface GadsQuestionRunnerProps {
  question: GadsCandidateQuestion;
  index: number;
  total: number;
  secondsForThisQuestion: number;
  initialValue: GadsAnswerValue | null;
  isLast: boolean;
  onDraftChange: (value: GadsAnswerValue | null) => void;
  onExpire: (value: GadsAnswerValue | null) => void;
  onAdvance: (value: GadsAnswerValue | null) => void;
}

/** Owns one question's countdown via useQuestionTimer - remounted (via the
 * `key={question.id}` in the parent) on every question change, which is
 * what actually resets the timer between questions of the same mechanic
 * (useQuestionTimer only restarts when its `seconds` prop changes value). */
function GadsQuestionRunner({
  question,
  index,
  total,
  secondsForThisQuestion,
  initialValue,
  isLast,
  onDraftChange,
  onExpire,
  onAdvance,
}: GadsQuestionRunnerProps) {
  const [value, setValue] = useState<GadsAnswerValue | null>(initialValue);
  const valueRef = useRef(value);
  valueRef.current = value;
  const firedRef = useRef(false);

  const secondsLeft = useQuestionTimer(secondsForThisQuestion, () => {
    if (firedRef.current) return;
    firedRef.current = true;
    onExpire(valueRef.current);
  });

  function handleChange(v: GadsAnswerValue) {
    setValue(v);
    onDraftChange(v);
  }

  function handleAdvanceClick() {
    if (firedRef.current) return;
    firedRef.current = true;
    playGadsClick();
    onAdvance(valueRef.current);
  }

  const answered = !isAnswerEmpty(value);
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const danger = secondsLeft <= Math.max(5, Math.ceil(secondsForThisQuestion * 0.2));

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <span
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-sm font-bold tabular-nums ${
            danger
              ? "animate-pulse border-red-500/50 bg-red-500/10 text-error-text"
              : "border-border text-muted-foreground"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          {minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, "0")}` : `${seconds}s`}
        </span>
      </div>

      <GadsQuestionCard
        question={question}
        index={index}
        total={total}
        value={value}
        onChange={handleChange}
      />

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleAdvanceClick}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-glow transition hover:bg-primary/90"
        >
          {isLast ? "Submit assessment" : "Next question"}
        </button>
      </div>
      {!answered && (
        <p className="mt-2 text-right text-xs text-muted-foreground">
          No answer selected - moving on will mark this question as skipped.
        </p>
      )}
    </div>
  );
}
