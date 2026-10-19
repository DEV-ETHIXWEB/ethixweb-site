import { useState } from "react";
import { Loader2 } from "lucide-react";
import { formInputClass, formLabelClass } from "@/lib/form-styles";
import { isValidEmail, isValidPhone } from "@/lib/utils";
import {
  MINDSET_EXAM_DURATION_SECONDS,
  MINDSET_QUESTION_COUNTS,
  MINDSET_SECTION_ORDER,
  MINDSET_TOTAL_QUESTIONS,
  type MindsetMechanic,
} from "@/lib/mindset/types";

// Check-in. Same two-surface split as the exam itself, so the candidate
// meets the layout here and recognises it the moment the paper starts:
// what the exam is on the left, who is sitting it on the right. The
// structure table is generated from the real constants, never retyped, so
// the briefing cannot drift from what the exam actually does.

/** How each section is described to the candidate. Typed against
 * MindsetMechanic, so a new mechanic cannot be added to the exam without
 * also being given a row here - the compiler refuses otherwise. */
const SECTION_COPY: Record<MindsetMechanic, { name: string; how: string }> = {
  likert: { name: "Agreement statements", how: "Slide the scale" },
  mcq: { name: "Direct questions", how: "Pick one option" },
  situational: { name: "Situational judgment", how: "Pick one option" },
  written: { name: "Open response", how: "Type your answer" },
};

// Built from the exam's own section order rather than a hand-written list.
// The hand-written one had drifted: it omitted the mcq section, so it
// described 25 questions on a page that also printed the real total of 35.
const SECTIONS = MINDSET_SECTION_ORDER.map((mechanic, i) => ({
  label: `Section ${i + 1}`,
  name: SECTION_COPY[mechanic].name,
  how: SECTION_COPY[mechanic].how,
  count: MINDSET_QUESTION_COUNTS[mechanic],
}));

interface MindsetGateProps {
  onSubmit: (details: {
    name: string;
    email: string;
    phone: string;
    college: string;
  }) => Promise<void>;
  error: string | null;
}

export function MindsetGate({ onSubmit, error }: MindsetGateProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    name.trim().length > 1 &&
    isValidEmail(email.trim()) &&
    isValidPhone(phone.trim()) &&
    college.trim().length > 1;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        college: college.trim(),
      });
    } finally {
      setSubmitting(false);
    }
  }

  const totalMinutes = Math.round(MINDSET_EXAM_DURATION_SECONDS / 60);

  return (
    <div className="grid min-h-dvh grid-cols-1 bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
      <div className="exam-panel-left flex flex-col justify-center gap-14 px-8 py-14 xl:px-16 xl:gap-16">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-primary-text">
            Ethixweb
          </p>
          <h1 className="mt-8 max-w-[14ch] font-display text-5xl font-bold leading-[1.02] tracking-[-0.03em] xl:text-6xl">
            Mindset &amp; Fit Assessment
          </h1>
          <p className="mt-6 max-w-[42ch] text-base leading-relaxed text-muted-foreground">
            A timed, proctored exam for the Full-Stack Developer role. There are no trick questions
            and nothing to revise for. Answer honestly and at pace.
          </p>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
              Paper structure
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <table className="mt-5 w-full max-w-lg border-collapse text-left">
            <tbody>
              {SECTIONS.map((section) => (
                <tr key={section.name} className="border-b border-border/70 last:border-b-0">
                  <td className="w-24 py-3.5 align-top font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary-text">
                    {section.label}
                  </td>
                  <td className="py-3.5 pr-4 align-top text-sm font-semibold text-foreground/90">
                    {section.name}
                  </td>
                  <td className="w-36 py-3.5 pr-4 align-top text-sm text-muted-foreground">
                    {section.how}
                  </td>
                  <td className="w-20 py-3.5 text-right align-top font-mono text-sm tabular-nums text-muted-foreground">
                    {section.count} Q
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground/80">
            {MINDSET_TOTAL_QUESTIONS} questions
            <span className="px-2 text-muted-foreground/40">/</span>
            <span className="text-primary-text">{totalMinutes} minutes on one clock</span>
            <span className="px-2 text-muted-foreground/40">/</span>
            one attempt
          </p>
        </div>
      </div>

      <div className="exam-panel-right flex items-center justify-center px-8 py-12 xl:px-14">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
              Candidate details
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Use the email you applied with. Your exam is tied to it, and it can only be taken once.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm leading-relaxed text-error-text"
            >
              {error}
            </p>
          )}

          <div className="mt-7 space-y-5">
            <Field
              id="mindset-name"
              label="Full name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={setName}
            />
            <Field
              id="mindset-phone"
              label="Phone number"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={setPhone}
            />
            <Field
              id="mindset-email"
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={setEmail}
            />
            <Field
              id="mindset-college"
              label="College name"
              type="text"
              autoComplete="organization"
              value={college}
              onChange={setCollege}
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="mt-9 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 font-bold text-primary-foreground shadow-glow transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Continue to briefing
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  type,
  autoComplete,
  value,
  onChange,
}: {
  id: string;
  label: string;
  type: string;
  autoComplete: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={formLabelClass}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className={`${formInputClass} exam-field`}
        required
      />
    </div>
  );
}
