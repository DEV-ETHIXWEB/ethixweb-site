import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { MindsetGate } from "@/components/mindset/MindsetGate";
import { LaunchGate } from "@/components/mindset/LaunchGate";
import { ExamRunner } from "@/components/mindset/ExamRunner";
import type { MindsetAnswerValue, MindsetCandidateQuestion } from "@/lib/mindset/types";

// Standalone, self-serve, single-attempt mindset & fit screener. Lives
// outside /careers/* on purpose - careers.tsx's beforeLoad redirects every
// /careers/* URL to /not-hiring while Ethixweb isn't hiring, the same
// reason the Google Ads assessment lives at /assessment/google-ads/$token
// instead of under /careers/. No admin dashboard, no login - the candidate
// fills in their own details, and a bearer token (kept in localStorage,
// same pattern as careers.assessment.tsx) is the only session credential.
// Every state transition is enforced server-side; this component is purely
// a phase-driven shell around that server state machine.

export const Route = createFileRoute("/assessment/mindset")({
  head: () => ({
    meta: [
      { title: "Mindset & Fit Assessment - Ethixweb" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MindsetAssessmentPage,
});

const STORAGE_KEY = "ethixweb-mindset-session";

type Phase = "loading" | "gate" | "launch" | "exam" | "done" | "error";

interface ExamStartData {
  token: string;
  candidateName: string;
  questions: MindsetCandidateQuestion[];
  draftAnswer: MindsetAnswerValue | null;
  currentIndex: number;
  expiresAt: string;
  serverNow: string;
}

function readStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return typeof raw === "string" && raw.length > 0 ? raw : null;
  } catch {
    return null;
  }
}

function MindsetAssessmentPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [examData, setExamData] = useState<ExamStartData | null>(null);
  const [gateError, setGateError] = useState<string | null>(null);

  useEffect(() => {
    const token = readStoredToken();
    if (!token) {
      setPhase("gate");
      return;
    }
    void (async () => {
      try {
        const res = await fetch("/api/mindset/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => ({}));
        if (!data.ok || data.status === "expired") {
          localStorage.removeItem(STORAGE_KEY);
          setPhase("gate");
          return;
        }
        if (data.status === "in_progress") {
          setExamData({
            token,
            candidateName: data.candidateName,
            questions: data.questions,
            draftAnswer: data.draftAnswer,
            currentIndex: data.currentIndex,
            expiresAt: data.expiresAt,
            serverNow: data.serverNow,
          });
          setPhase("launch");
          return;
        }
        // submitted / scored - already finished.
        localStorage.removeItem(STORAGE_KEY);
        setPhase("done");
      } catch {
        setPhase("gate");
      }
    })();
  }, []);

  async function handleGateSubmit(details: {
    name: string;
    email: string;
    phone: string;
    college: string;
  }) {
    setGateError(null);
    try {
      const res = await fetch("/api/mindset/begin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName: details.name,
          candidateEmail: details.email,
          candidatePhone: details.phone,
          candidateCollege: details.college,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!data.ok) {
        setGateError(data.error || "Could not start the assessment.");
        return;
      }
      localStorage.setItem(STORAGE_KEY, data.sessionToken);
      setExamData({
        token: data.sessionToken,
        candidateName: details.name,
        questions: data.questions,
        draftAnswer: null,
        currentIndex: data.currentIndex,
        expiresAt: data.expiresAt,
        serverNow: data.serverNow,
      });
      setPhase("launch");
    } catch {
      setGateError("Could not start the assessment. Please check your connection and try again.");
    }
  }

  function handleSubmitted() {
    localStorage.removeItem(STORAGE_KEY);
    setPhase("done");
  }

  if (phase === "loading") {
    return (
      <StatusScreen eyebrow="Mindset & Fit Assessment" title="Checking your session">
        <Loader2 className="h-5 w-5 animate-spin text-primary-text" />
      </StatusScreen>
    );
  }

  if (phase === "error") {
    return (
      <StatusScreen eyebrow="Session error" title="We could not load your exam" tone="error">
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Refresh this page to try again. If it keeps happening, email info@ethixweb.com and we will
          reset your attempt.
        </p>
      </StatusScreen>
    );
  }

  if (phase === "done") {
    return (
      <StatusScreen eyebrow="Submitted" title="Your exam is in" tone="success">
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Your answers are recorded and with the Ethixweb hiring team. A confirmation is on its way
          to your email. You can close this window now.
        </p>
      </StatusScreen>
    );
  }

  if (phase === "gate") {
    return <MindsetGate onSubmit={handleGateSubmit} error={gateError} />;
  }

  if (phase === "launch" && examData) {
    return <LaunchGate candidateName={examData.candidateName} onReady={() => setPhase("exam")} />;
  }

  if (phase === "exam" && examData) {
    return (
      <ExamRunner
        token={examData.token}
        candidateName={examData.candidateName}
        questions={examData.questions}
        initialIndex={examData.currentIndex}
        initialDraftAnswer={examData.draftAnswer}
        expiresAt={examData.expiresAt}
        serverNow={examData.serverNow}
        onSubmitted={handleSubmitted}
      />
    );
  }

  return null;
}

/** Shared frame for the three terminal states, so a finished exam, a failed
 * load and a session check all read as the same instrument rather than
 * three unrelated screens. */
function StatusScreen({
  eyebrow,
  title,
  tone = "neutral",
  children,
}: {
  eyebrow: string;
  title: string;
  tone?: "neutral" | "success" | "error";
  children: React.ReactNode;
}) {
  const accent =
    tone === "success"
      ? "text-emerald-400"
      : tone === "error"
        ? "text-error-text"
        : "text-primary-text";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
      <span className="h-px w-16 bg-primary/50" />
      <p className={`mt-7 font-mono text-[11px] font-bold uppercase tracking-[0.26em] ${accent}`}>
        {eyebrow}
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">{title}</h1>
      <div className="mt-5 flex flex-col items-center gap-3">{children}</div>
    </div>
  );
}
