import { ArrowLeft, PencilLine, Send } from "lucide-react";
import { QUESTIONS, SECTIONS, isAsked, optionLabel } from "@/lib/questionnaire/questions";
import type { AnswerMap } from "@/lib/questionnaire/types";
import type { ProfileForm } from "./ProfileStep";
import { Eyebrow, GhostButton, PrimaryButton, focusRing } from "./ui";

export function ReviewStep({
  profile,
  answers,
  submitting,
  error,
  onEditQuestion,
  onEditProfile,
  onPrev,
  onSubmit,
}: {
  profile: ProfileForm;
  answers: AnswerMap;
  submitting: boolean;
  error: string | null;
  onEditQuestion: (questionId: string) => void;
  onEditProfile: () => void;
  onPrev: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="w-full">
      <Eyebrow>Almost done</Eyebrow>
      <h2 className="mt-4 font-display text-foreground text-[clamp(2.2rem,4.5vw,3.6rem)] leading-[1] font-extrabold tracking-[-0.03em]">
        Review your answers
      </h2>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        Take a quick look. You can change anything before you submit. Once submitted, your answers
        are final.
      </p>

      <section className="border border-border bg-card mt-8 rounded-2xl p-5 lg:max-w-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-bold text-foreground">{profile.name}</p>
            <p className="mt-1 text-sm break-words text-muted-foreground">
              {profile.email} · {profile.phone}
            </p>
            <p className="text-sm break-words text-muted-foreground">
              {profile.college}
              {profile.linkedin ? ` · ${profile.linkedin}` : ""}
            </p>
          </div>
          <EditButton label="Edit your details" onClick={onEditProfile} />
        </div>
      </section>

      <div className="grid gap-x-8 lg:grid-cols-2">
        {([1, 2] as const).map((section) => (
          <section key={section} className="mt-8">
            <h3 className="text-sm font-semibold text-primary-text">
              Section {section} · {SECTIONS[section].name}
            </h3>
            <ol className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card">
              {QUESTIONS.filter((q) => q.section === section && isAsked(q, answers)).map((q) => {
                const a = answers[q.id];
                return (
                  <li key={q.id} className="flex items-start gap-4 px-5 py-4">
                    <span className="w-5 shrink-0 pt-px text-sm font-medium text-muted-foreground tabular-nums">
                      {q.label}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug text-muted-foreground">{q.text}</p>
                      <p className="mt-1.5 font-semibold break-words text-foreground">
                        {a
                          ? a.choice === "other"
                            ? `Other: ${a.other ?? ""}`
                            : optionLabel(q, a.choice)
                          : "Not answered"}
                      </p>
                    </div>
                    <EditButton
                      label={`Change answer to question ${q.label}`}
                      onClick={() => onEditQuestion(q.id)}
                    />
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>

      <div aria-live="assertive" className="mt-6 min-h-6">
        {error && (
          <p className="rounded-xl border border-error-text/30 bg-error-text/10 px-4 py-3 text-sm font-medium text-error-text">
            {error}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <GhostButton type="button" onClick={onPrev} disabled={submitting}>
          <ArrowLeft className="h-4 w-4" />
          Previous
        </GhostButton>
        <PrimaryButton type="button" onClick={onSubmit} loading={submitting} disabled={submitting}>
          {submitting ? "Submitting…" : error ? "Try again" : "Submit my answers"}
          {!submitting && <Send className="h-4 w-4" />}
        </PrimaryButton>
      </div>
    </div>
  );
}

function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`shrink-0 rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-primary ${focusRing}`}
    >
      <PencilLine className="h-4 w-4" />
    </button>
  );
}
