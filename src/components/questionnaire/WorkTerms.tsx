import { ArrowLeft, ArrowRight } from "lucide-react";
import { Eyebrow, GhostButton, PrimaryButton } from "./ui";

// Shown between question 10 and question 11: the section break and the
// working terms on one screen, so the candidate reads the arrangement right
// before the questions that ask about it. Laid out like the terms summary of
// an offer letter (label on the left, terms on the right, ruled rows) because
// that's what it is, and because candidates should be able to scan it.

const TERMS: { label: string; figure?: string; lines: string[] }[] = [
  {
    label: "Work arrangement",
    lines: [
      "The current plan is to offer a work-from-home arrangement until December 2026.",
      "A transition to hybrid work may follow, depending on organizational requirements.",
    ],
  },
  {
    label: "Delhi meetings",
    lines: [
      "Occasional in-person meetings in Delhi may be required.",
      "The expected frequency and dates will be communicated in advance. Please review your ability to travel before confirming.",
    ],
  },
  {
    label: "Compensation",
    figure: "₹15,000 to ₹20,000 per month",
    lines: [
      "Proposed for the initial six-month period, depending on the final agreed offer.",
      "After the initial six months, compensation will be reviewed based on performance and organizational evaluation. The future package will be decided based on that evaluation and is not guaranteed to increase by a specific amount.",
    ],
  },
];

export function WorkTerms({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  return (
    <div className="grid w-full gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
      <div className="lg:sticky lg:top-28 lg:self-start">
        <Eyebrow>Section 2 of 2 · Organization & Work Expectations</Eyebrow>
        <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3rem)] leading-[1.08] font-extrabold tracking-[-0.025em] text-balance text-foreground">
          Now, let's talk about how we work.
        </h2>
        <p className="mt-5 max-w-md text-base leading-7 text-foreground/80 sm:text-lg sm:leading-8">
          Before you continue, we'll share the current working arrangement and compensation
          expectations so you can decide whether this opportunity fits you.
        </p>
      </div>

      <div className="min-w-0">
        <section
          aria-labelledby="terms-heading"
          className="rounded-2xl border border-border bg-card"
        >
          <h3
            id="terms-heading"
            className="border-b border-border px-6 py-4 text-sm font-semibold text-foreground"
          >
            Please read the current working arrangement carefully.
          </h3>
          <dl className="divide-y divide-border">
            {TERMS.map((t) => (
              <div key={t.label} className="grid gap-2 px-6 py-5 sm:grid-cols-[10rem_1fr] sm:gap-6">
                <dt className="text-sm font-semibold text-primary-text">{t.label}</dt>
                <dd className="space-y-2 text-[15px] leading-relaxed text-foreground/85">
                  {t.figure && (
                    <p className="text-lg font-bold tracking-tight text-foreground">{t.figure}</p>
                  )}
                  {t.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-8 flex items-center justify-between gap-3">
          <GhostButton type="button" onClick={onPrev}>
            <ArrowLeft className="h-4 w-4" />
            Previous
          </GhostButton>
          <PrimaryButton type="button" onClick={onNext}>
            I've read this, continue
            <ArrowRight className="h-4 w-4" />
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
