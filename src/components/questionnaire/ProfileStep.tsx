import { useState, type FormEvent } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { formInputClass } from "@/lib/form-styles";
import { PROFILE_LIMITS, validateProfile, type CandidateProfile } from "@/lib/questionnaire/types";
import { Eyebrow, GhostButton, PrimaryButton } from "./ui";

// Collected before question 1. The same validateProfile() runs here for
// instant feedback and again on the server, which also checks the email
// against the invitation.

export interface ProfileForm {
  name: string;
  phone: string;
  email: string;
  college: string;
  linkedin: string;
}

type FieldKey = keyof ProfileForm;

const FIELDS: {
  key: FieldKey;
  label: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  optional?: boolean;
  inputMode?: "tel" | "email" | "url" | "text";
}[] = [
  {
    key: "name",
    label: "Full name",
    type: "text",
    autoComplete: "name",
    placeholder: "Your full name",
  },
  {
    key: "phone",
    label: "Phone number",
    type: "tel",
    autoComplete: "tel",
    placeholder: "+91 98765 43210",
    inputMode: "tel",
  },
  {
    key: "email",
    label: "Email address",
    type: "email",
    autoComplete: "email",
    placeholder: "The address this invitation was sent to",
    inputMode: "email",
  },
  {
    key: "college",
    label: "College name",
    type: "text",
    autoComplete: "organization",
    placeholder: "Where you study or studied",
  },
  {
    key: "linkedin",
    label: "LinkedIn profile",
    type: "url",
    autoComplete: "url",
    placeholder: "linkedin.com/in/your-name",
    optional: true,
    inputMode: "url",
  },
];

export function ProfileStep({
  initial,
  onSubmit,
  onBack,
}: {
  initial: ProfileForm;
  onSubmit: (
    form: ProfileForm,
  ) => Promise<{ ok: true } | { ok: false; field?: string; error: string }>;
  onBack: () => void;
}) {
  const [form, setForm] = useState<ProfileForm>(initial);
  const [errors, setErrors] = useState<Partial<Record<FieldKey | "form", string>>>({});
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const local = validateProfile(form);
    if (!local.ok) {
      setErrors({ [local.field]: local.error });
      document.getElementById(`profile-${local.field}`)?.focus();
      return;
    }
    setBusy(true);
    setErrors({});
    const result = await onSubmit(form);
    setBusy(false);
    if (!result.ok) {
      const field = (result.field as FieldKey | undefined) ?? "form";
      setErrors({ [field]: result.error });
      if (field !== "form") document.getElementById(`profile-${field}`)?.focus();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid w-full gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16"
    >
      <div>
        <Eyebrow>Before we start</Eyebrow>
        <h2 className="mt-5 font-display text-foreground text-[clamp(2.2rem,4.5vw,3.6rem)] leading-[1] font-extrabold tracking-[-0.03em]">
          A little about you
        </h2>
        <p className="mt-5 max-w-md text-lg leading-8 text-foreground/80">
          So we know whose answers these are. Your details are only seen by our hiring team.
        </p>
        <p className="mt-6 flex items-center gap-2 text-[13px] text-muted-foreground">
          <ShieldCheck className="h-4 w-4 shrink-0 text-primary-text" />
          This link is personal to you and accepts one submission.
        </p>
      </div>

      <div className="min-w-0">
        <div className="grid gap-5 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2 sm:p-7">
          {FIELDS.map((f) => {
            const error = errors[f.key];
            const id = `profile-${f.key}`;
            return (
              <div
                key={f.key}
                className={f.key === "name" || f.key === "linkedin" ? "sm:col-span-2" : ""}
              >
                <label
                  htmlFor={id}
                  className="flex items-baseline justify-between text-sm font-semibold text-foreground"
                >
                  {f.label}
                  {f.optional ? (
                    <span className="text-xs font-medium text-muted-foreground">Optional</span>
                  ) : null}
                </label>
                <input
                  id={id}
                  name={f.key}
                  type={f.type}
                  inputMode={f.inputMode}
                  autoComplete={f.autoComplete}
                  placeholder={f.placeholder}
                  maxLength={PROFILE_LIMITS[f.key]}
                  required={!f.optional}
                  value={form[f.key]}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm((prev) => ({ ...prev, [f.key]: value }));
                    if (error) setErrors((prev) => ({ ...prev, [f.key]: undefined }));
                  }}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${id}-error` : undefined}
                  className={`${formInputClass} ${error ? "border-error-text focus:border-error-text focus:ring-error-text/20" : ""}`}
                />
                {error && (
                  <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-error-text">
                    {error}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {errors.form && (
          <p role="alert" className="mt-4 text-sm text-error-text">
            {errors.form}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <GhostButton type="button" onClick={onBack}>
            Back
          </GhostButton>
          <PrimaryButton type="submit" loading={busy} disabled={busy}>
            Start the questions
            {!busy && <ArrowRight className="h-4 w-4" />}
          </PrimaryButton>
        </div>
      </div>
    </form>
  );
}

export function profileToForm(profile: Partial<CandidateProfile> | null | undefined): ProfileForm {
  return {
    name: profile?.name ?? "",
    phone: profile?.phone ?? "",
    email: profile?.email ?? "",
    college: profile?.college ?? "",
    linkedin: profile?.linkedin ?? "",
  };
}
