import { ArrowRight } from "lucide-react";
import { Eyebrow, PrimaryButton } from "./ui";

// Introduction screen. Left: what this is and the start button. Right: the
// whole journey as a short numbered list, so the candidate knows before
// starting that the second half covers pay and the working arrangement.

const STEPS = [
  { title: "Your details", body: "Name, phone, email, college, and LinkedIn if you'd like." },
  {
    title: "About you",
    body: "10 questions on your interests, goals and how you approach things.",
  },
  { title: "How we work", body: "The working arrangement, Delhi meetings and compensation." },
  { title: "Work expectations", body: "5 questions on whether that arrangement suits you." },
  {
    title: "Review and submit",
    body: "Check your answers before sending. One submission per link.",
  },
];

export function Landing({
  firstName,
  resuming,
  onBegin,
}: {
  firstName: string;
  resuming: boolean;
  onBegin: () => void;
}) {
  return (
    <div className="grid w-full items-start gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
      <div className="lg:pt-6">
        <Eyebrow>Candidate questionnaire</Eyebrow>

        <h1 className="mt-4 font-display text-[clamp(2.5rem,5.4vw,4.25rem)] leading-[1.03] font-extrabold tracking-[-0.03em] text-balance text-foreground">
          Let's Get to Know You.
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-8 text-foreground/80">
          {firstName ? `Hi ${firstName}. ` : ""}A few questions about you, your goals, and how you
          like to work. Partway through, we also set out the current working arrangement and
          compensation, so you can judge whether the role fits you.
        </p>

        <p className="mt-4 text-sm text-muted-foreground">
          15 Questions · Approximately 4–6 Minutes
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
          <PrimaryButton onClick={onBegin} className="min-w-[200px]">
            {resuming ? "Continue where you left off" : "Let's Begin"}
            <ArrowRight className="h-4 w-4" />
          </PrimaryButton>
          <p className="text-sm text-muted-foreground">
            No right or wrong answers. Just be yourself.
          </p>
        </div>
      </div>

      <section
        aria-labelledby="expect-heading"
        className="rounded-2xl border border-border bg-card"
      >
        <h2
          id="expect-heading"
          className="border-b border-border px-6 py-4 text-sm font-semibold text-foreground"
        >
          What to expect
        </h2>
        <ol className="divide-y divide-border">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4 px-6 py-4">
              <span className="w-5 shrink-0 pt-px text-sm font-medium text-muted-foreground tabular-nums">
                {i + 1}
              </span>
              <div>
                <p className="text-[15px] font-semibold text-foreground">{step.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
