import { useState } from "react";
import { Loader2, Maximize, MonitorX } from "lucide-react";

// The briefing. Rules are presented the way an exam hall notices them:
// a labelled board, each condition stated plainly and once, no persuasion.
// Fullscreen is requested inside the click handler because browsers only
// grant it during a user gesture.
//
// The laptop check is best effort, like every other proctoring signal in
// this app. A determined candidate can defeat it; the point is that an
// honest one is never confused about what is expected.

const RULES = [
  {
    label: "Fullscreen",
    text: "The exam opens in fullscreen and stays there until you submit.",
  },
  {
    label: "Tab switching",
    text: "Leaving fullscreen, switching tabs or moving to another window is recorded.",
  },
  {
    label: "Warnings",
    text: "You get one warning. The next violation submits your exam exactly as it stands.",
  },
  {
    label: "Timing",
    text: "One clock of 15 minutes for the whole paper. Nothing rushes you question by question, but when it reaches zero the exam submits itself.",
  },
  {
    label: "No return",
    text: "Once you leave a question you cannot go back to it.",
  },
  {
    label: "Copy and paste",
    text: "Copying, pasting and right click are disabled for the whole exam.",
  },
] as const;

interface LaunchGateProps {
  candidateName: string;
  /** Called once fullscreen is successfully entered. */
  onReady: () => void;
}

export function LaunchGate({ candidateName, onReady }: LaunchGateProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);

  const isNarrow = typeof window !== "undefined" && window.innerWidth < 1024;
  const isMobileUA =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const unsupported = isNarrow || isMobileUA;

  async function handleBegin() {
    setErrorMsg(null);
    if (!document.fullscreenEnabled) {
      setErrorMsg(
        "This browser will not allow fullscreen. Open the exam in Chrome or Edge on a laptop.",
      );
      return;
    }
    setLaunching(true);
    try {
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    } catch {
      setErrorMsg("Fullscreen was blocked. Allow it for this site and start again.");
      setLaunching(false);
      return;
    }
    onReady();
  }

  if (unsupported) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-error-text">
          <MonitorX className="h-7 w-7" />
        </span>
        <p className="mt-6 font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-error-text">
          Wrong device
        </p>
        <h1 className="mt-3 max-w-[18ch] font-display text-3xl font-bold tracking-tight">
          This exam needs a laptop
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          It runs fullscreen with a locked window, which phones and tablets cannot do. Open this
          same link on a laptop or desktop and you can start straight away.
        </p>
      </div>
    );
  }

  return (
    <div className="grid min-h-dvh grid-cols-1 bg-background lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
      <div className="exam-panel-left flex flex-col justify-center gap-14 px-8 py-14 xl:px-16 xl:gap-16">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-primary-text">
            Before you begin
          </p>
          <h1 className="mt-8 max-w-[12ch] font-display text-5xl font-bold leading-[1.04] tracking-[-0.03em]">
            Read this once, then start.
          </h1>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
              Sitting as
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <p className="mt-4 font-display text-2xl font-bold tracking-tight">{candidateName}</p>
          <p className="mt-3 max-w-[38ch] text-sm leading-relaxed text-muted-foreground">
            If that is not you, close this window. The exam is tied to the email you entered and
            runs once.
          </p>
        </div>
      </div>

      <div className="exam-panel-right flex items-center px-8 py-12 xl:px-14">
        <div className="w-full max-w-xl">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
              Exam conditions
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <dl className="mt-6">
            {RULES.map((rule) => (
              <div
                key={rule.label}
                className="grid grid-cols-[8.5rem_1fr] gap-4 border-b border-border/70 py-4 last:border-b-0"
              >
                <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary-text">
                  {rule.label}
                </dt>
                <dd className="text-sm leading-relaxed text-foreground/85">{rule.text}</dd>
              </div>
            ))}
          </dl>

          {errorMsg && (
            <p
              role="alert"
              className="mt-6 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm leading-relaxed text-error-text"
            >
              {errorMsg}
            </p>
          )}

          <button
            type="button"
            disabled={launching}
            onClick={() => void handleBegin()}
            className="mt-9 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-glow transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40"
          >
            {launching ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <Maximize className="h-4.5 w-4.5" />
            )}
            Enter fullscreen and start the exam
          </button>
          <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
            The clock starts the moment you click
          </p>
        </div>
      </div>
    </div>
  );
}
