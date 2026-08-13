import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { formInputClass, formLabelClass } from "@/lib/form-styles";
import { isValidEmail } from "@/lib/utils";

interface NameEmailGateProps {
  onSubmit: (name: string, email: string) => Promise<void>;
  error: string | null;
}

/** The one-time invite's identity check: only a name and an email, per the
 * assessment brief. The email must match the invited address exactly - a
 * mismatch is rejected server-side (see /api/gads/begin), this is just the
 * form shell. */
export function NameEmailGate({ onSubmit, error }: NameEmailGateProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name.trim().length > 1 && isValidEmail(email.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(name.trim(), email.trim());
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <Reveal>
        <div className="premium-card w-full max-w-md rounded-3xl p-6 sm:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary-text">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <h1 className="mt-4 font-display text-xl font-bold">Google Ads Assessment</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This is a one-time invitation for a single candidate. Enter your full name and the email
            address this invitation was sent to.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-error-text"
            >
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="gads-name" className={formLabelClass}>
                Full name
              </label>
              <input
                id="gads-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className={formInputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="gads-email" className={formLabelClass}>
                Email
              </label>
              <input
                id="gads-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className={formInputClass}
                required
              />
            </div>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="magnetic inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 font-bold text-primary-foreground shadow-glow disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Continue
            </button>
          </form>
        </div>
      </Reveal>
    </div>
  );
}
