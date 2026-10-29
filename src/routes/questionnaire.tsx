import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_PREMIUM } from "@/lib/motion";
import { QUESTIONS, TOTAL_QUESTIONS } from "@/lib/questionnaire/questions";
import type { AnswerMap, AnswerValue, DraftState } from "@/lib/questionnaire/types";
import { Landing } from "@/components/questionnaire/Landing";
import {
  ProfileStep,
  profileToForm,
  type ProfileForm,
} from "@/components/questionnaire/ProfileStep";
import { QuestionStep, answerReady } from "@/components/questionnaire/QuestionStep";
import { WorkTerms } from "@/components/questionnaire/WorkTerms";
import { ReviewStep } from "@/components/questionnaire/ReviewStep";
import { StatusScreen, type StatusKind } from "@/components/questionnaire/StatusScreen";
import { Ambient } from "@/components/questionnaire/ui";
import { Logo } from "@/components/layout/Logo";

// "Let's Get to Know You" candidate questionnaire. Each candidate gets a
// private link, /questionnaire#<token>, created at /admin/questionnaire. The
// token lives in the fragment so it never reaches server logs; this page
// reads it and posts it to /api/questionnaire/*.
//
// The server owns every rule that matters (one submission per invitation,
// expiry, revocation, the email check). This component is the flow around
// it: landing, your details, ten questions, the working terms, five more,
// review, submit. Progress is saved to the server on every step, so a
// refresh or a different device resumes in place.

export const Route = createFileRoute("/questionnaire")({
  head: () => ({
    meta: [
      { title: "Let's Get to Know You - Ethixweb" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: QuestionnairePage,
});

type Step = { kind: "question"; questionId: string } | { kind: "terms" } | { kind: "review" };

const STEPS: Step[] = [
  ...QUESTIONS.filter((q) => q.section === 1).map((q) => ({
    kind: "question" as const,
    questionId: q.id,
  })),
  { kind: "terms" },
  ...QUESTIONS.filter((q) => q.section === 2).map((q) => ({
    kind: "question" as const,
    questionId: q.id,
  })),
  { kind: "review" },
];

const REVIEW_INDEX = STEPS.length - 1;

function stepIndexOf(questionId: string) {
  return STEPS.findIndex((s) => s.kind === "question" && s.questionId === questionId);
}

/** Questions fully behind the candidate at this step, for the progress bar. */
function questionsBefore(index: number) {
  return STEPS.slice(0, index).filter((s) => s.kind === "question").length;
}

type Phase = "status" | "landing" | "profile" | "flow" | "done";

async function post(path: string, body: unknown) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function readToken(): string | null {
  const raw = window.location.hash.replace(/^#/, "").trim().toLowerCase();
  return /^[0-9a-f]{64}$/.test(raw) ? raw : null;
}

function QuestionnairePage() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("status");
  const [statusKind, setStatusKind] = useState<StatusKind>("loading");
  const [token, setToken] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [profile, setProfile] = useState<ProfileForm | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [returnToReview, setReturnToReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [questionError, setQuestionError] = useState<{ id: string; error: string } | null>(null);
  const hasDraft = useRef(false);

  const showStatus = useCallback((kind: StatusKind) => {
    setStatusKind(kind);
    setPhase("status");
  }, []);

  /** Any endpoint can report that the invitation stopped being usable
   * (revoked or expired by a recruiter mid-way, submitted from another tab). */
  const handleClosed = useCallback(
    (status: unknown) => {
      if (status === "submitted" || status === "already") showStatus("submitted");
      else if (status === "expired" || status === "revoked" || status === "invalid")
        showStatus(status);
      else return false;
      return true;
    },
    [showStatus],
  );

  const load = useCallback(async () => {
    const t = readToken();
    setToken(t);
    if (!t) {
      showStatus("invalid");
      return;
    }
    showStatus("loading");
    try {
      const { data } = await post("/api/questionnaire/state", { token: t });
      if (!data.ok) return showStatus("error");
      if (data.status !== "open") {
        if (!handleClosed(data.status)) showStatus("error");
        return;
      }
      setFirstName(data.invitedFirstName ?? "");
      if (data.profile) setProfile(profileToForm(data.profile));
      const draft = data.draft as DraftState | null;
      if (draft) {
        hasDraft.current = Object.keys(draft.answers ?? {}).length > 0;
        setAnswers(draft.answers ?? {});
        setIndex(Math.min(Math.max(0, draft.step ?? 0), REVIEW_INDEX));
      }
      setPhase("landing");
    } catch {
      showStatus("error");
    }
  }, [handleClosed, showStatus]);

  useEffect(() => {
    void load();
    // Someone pasting a second link into the same tab only changes the hash.
    const onHash = () => void load();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [load]);

  // A fresh screen should start at the top, especially on a phone where the
  // previous question's Continue button left the page scrolled down.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [index, phase, reduce]);

  // Fire-and-forget: a failed save costs at most the last step's progress,
  // and the final submit sends every answer anyway.
  const saveDraft = useCallback(
    (nextAnswers: AnswerMap, step: number) => {
      if (!token) return;
      void post("/api/questionnaire/save", { token, draft: { answers: nextAnswers, step } })
        .then(({ data }) => {
          if (!data.ok) handleClosed(data.status);
        })
        .catch(() => {});
    },
    [token, handleClosed],
  );

  function go(to: number) {
    setDirection(to >= index ? 1 : -1);
    setQuestionError(null);
    setIndex(to);
    saveDraft(answers, to);
  }

  function next() {
    if (returnToReview) {
      setReturnToReview(false);
      go(REVIEW_INDEX);
      return;
    }
    go(Math.min(index + 1, REVIEW_INDEX));
  }

  function prev() {
    if (index === 0) {
      setDirection(-1);
      setPhase("profile");
      return;
    }
    go(index - 1);
  }

  function setAnswer(questionId: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (questionError?.id === questionId) setQuestionError(null);
  }

  function begin() {
    setDirection(1);
    setPhase(profile ? "flow" : "profile");
  }

  async function submitProfile(form: ProfileForm) {
    if (!token) return { ok: false as const, error: "This link isn't valid." };
    try {
      const { data } = await post("/api/questionnaire/profile", { token, profile: form });
      if (!data.ok) {
        if (handleClosed(data.status)) return { ok: true as const };
        return {
          ok: false as const,
          field: data.field,
          error: data.error ?? "Please check your details.",
        };
      }
      setProfile(profileToForm(data.profile));
      setDirection(1);
      if (returnToReview) {
        setReturnToReview(false);
        setIndex(REVIEW_INDEX);
      }
      setPhase("flow");
      return { ok: true as const };
    } catch {
      return {
        ok: false as const,
        error: "Couldn't reach the server. Check your connection and try again.",
      };
    }
  }

  async function submit() {
    if (!token || submitting) return;
    const missing = QUESTIONS.find((q) => !answerReady(answers[q.id]));
    if (missing) {
      setQuestionError({ id: missing.id, error: "This one still needs an answer." });
      setDirection(-1);
      setIndex(stepIndexOf(missing.id));
      setReturnToReview(true);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { data } = await post("/api/questionnaire/submit", { token, answers });
      if (data.ok) {
        if (data.status === "already") showStatus("submitted");
        else setPhase("done");
        return;
      }
      if (handleClosed(data.status)) return;
      if (data.status === "no_profile") {
        setReturnToReview(true);
        setPhase("profile");
        return;
      }
      if (data.questionId) {
        setQuestionError({ id: data.questionId, error: data.error });
        setDirection(-1);
        setIndex(stepIndexOf(data.questionId));
        setReturnToReview(true);
        return;
      }
      setSubmitError(data.error ?? "We couldn't submit your answers. Please try again.");
    } catch {
      setSubmitError("Couldn't reach the server. Your answers are still here; please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const step = STEPS[index];
  const screenKey =
    phase === "flow" ? `step-${index}` : phase === "status" ? `status-${statusKind}` : phase;
  const variants = reduce
    ? { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        enter: (d: number) => ({ opacity: 0, x: d * 20 }),
        center: { opacity: 1, x: 0 },
        exit: (d: number) => ({ opacity: 0, x: d * -20 }),
      };

  const showProgress = phase === "flow";
  const done = step?.kind === "review" ? TOTAL_QUESTIONS : questionsBefore(index);
  const counter =
    step?.kind === "question"
      ? `${QUESTIONS.find((q) => q.id === step.questionId)?.number ?? 0} of ${TOTAL_QUESTIONS}`
      : step?.kind === "terms"
        ? "Section 2"
        : "Review";

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background font-sans text-foreground antialiased">
      <Ambient />

      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 xs:px-6 lg:px-8">
          <Logo className="shrink-0 [&_img]:h-6 sm:[&_img]:h-7" />
          {showProgress && (
            <div className="flex min-w-0 flex-1 items-center justify-end gap-3 sm:max-w-sm">
              <div
                role="progressbar"
                aria-label="Questionnaire progress"
                aria-valuemin={0}
                aria-valuemax={TOTAL_QUESTIONS}
                aria-valuenow={done}
                aria-valuetext={`${done} of ${TOTAL_QUESTIONS} questions answered`}
                className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.07]"
              >
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={false}
                  animate={{ width: `${Math.max(3, (done / TOTAL_QUESTIONS) * 100)}%` }}
                  transition={{ duration: reduce ? 0 : 0.5, ease: EASE_PREMIUM }}
                />
              </div>
              <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
                {counter}
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-4.5rem)] max-w-7xl items-center px-4 pt-6 pb-16 xs:px-6 sm:pt-10 lg:px-8">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={screenKey}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduce ? 0.15 : 0.22, ease: EASE_PREMIUM }}
            className="w-full"
          >
            {phase === "status" && <StatusScreen kind={statusKind} onRetry={() => void load()} />}
            {phase === "done" && <StatusScreen kind="done" />}
            {phase === "landing" && (
              <Landing firstName={firstName} resuming={hasDraft.current} onBegin={begin} />
            )}
            {phase === "profile" && (
              <ProfileStep
                initial={profile ?? profileToForm(null)}
                onSubmit={submitProfile}
                onBack={() => {
                  setDirection(-1);
                  setPhase(returnToReview ? "flow" : "landing");
                  setReturnToReview(false);
                }}
              />
            )}
            {phase === "flow" && step?.kind === "question" && (
              <QuestionStep
                question={QUESTIONS.find((q) => q.id === step.questionId)!}
                value={answers[step.questionId]}
                onChange={(v) => setAnswer(step.questionId, v)}
                onNext={next}
                onPrev={prev}
                nextLabel={returnToReview ? "Back to review" : "Continue"}
                serverError={questionError?.id === step.questionId ? questionError.error : null}
              />
            )}
            {phase === "flow" && step?.kind === "terms" && (
              <WorkTerms onNext={next} onPrev={prev} />
            )}
            {phase === "flow" && step?.kind === "review" && profile && (
              <ReviewStep
                profile={profile}
                answers={answers}
                submitting={submitting}
                error={submitError}
                onPrev={prev}
                onSubmit={() => void submit()}
                onEditProfile={() => {
                  setReturnToReview(true);
                  setDirection(-1);
                  setPhase("profile");
                }}
                onEditQuestion={(id) => {
                  setReturnToReview(true);
                  go(stepIndexOf(id));
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
