import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldAlert, RotateCcw, Search, Loader2, CheckCircle2 } from "lucide-react";
import { formLabelClass, formInputClass } from "@/lib/form-styles";

// Internal tool for giving a candidate another run at the Google Ads
// assessment. The password is checked server-side in /api/gads/admin against
// GADS_ADMIN_PASSWORD; nothing here validates it locally, so reading this
// page's source tells an attacker nothing. Kept out of the sitemap and
// marked noindex: it is not secret, but it has no business in search.

export const Route = createFileRoute("/admin/assessments")({
  head: () => ({
    meta: [
      { title: "Assessment admin - Ethixweb" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AssessmentAdminPage,
});

interface Summary {
  candidateName: string;
  candidateEmail: string;
  status: string;
  currentIndex: number;
  resumeCount: number;
  maxResumes: number;
  startedAt: string | null;
  submittedAt: string | null;
  overallPercent: number | null;
}

function AssessmentAdminPage() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState<null | "lookup" | "reset">(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  async function call(action: "lookup" | "reset") {
    setBusy(action);
    setError(null);
    if (action === "lookup") setNotice(null);
    try {
      const res = await fetch("/api/gads/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, action, email: email.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!data?.ok) {
        setError(data?.error || "Request failed.");
        if (action === "lookup") setSummary(null);
        return;
      }
      setSummary(data.assessment as Summary);
      if (action === "reset") {
        setNotice(
          `${(data.assessment as Summary).candidateName} can take the assessment again on the same link.`,
        );
      }
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(null);
      setConfirmReset(false);
    }
  }

  const canSubmit = password.length > 0 && email.trim().length > 0 && busy === null;

  return (
    <main className="flex min-h-dvh items-start justify-center bg-background px-4 py-12 text-foreground sm:py-20">
      <div className="w-full max-w-lg">
        <h1 className="font-display text-2xl font-bold">Assessment admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Look up a Google Ads assessment by the candidate&apos;s email, and reset it so they can
          sit it again on the same link.
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) void call("lookup");
          }}
        >
          <div>
            <label className={formLabelClass} htmlFor="admin-password">
              Admin password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={formInputClass}
            />
          </div>
          <div>
            <label className={formLabelClass} htmlFor="admin-email">
              Candidate email
            </label>
            <input
              id="admin-email"
              type="email"
              placeholder="candidate@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={formInputClass}
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "lookup" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Look up
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-6 flex items-start gap-2 text-sm text-error-text">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        {notice && (
          <p className="mt-6 flex items-start gap-2 rounded-xl border border-border bg-card p-4 text-sm font-semibold text-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {notice}
          </p>
        )}

        {summary && (
          <div className="mt-6 rounded-2xl border border-border bg-card p-5">
            <p className="text-base font-bold">{summary.candidateName}</p>
            <p className="text-sm text-muted-foreground">{summary.candidateEmail}</p>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Row label="Status" value={summary.status} />
              <Row label="Question" value={`${summary.currentIndex + 1} of 40`} />
              <Row label="Reopens used" value={`${summary.resumeCount} of ${summary.maxResumes}`} />
              <Row
                label="Score"
                value={
                  summary.overallPercent === null ? "Not scored" : `${summary.overallPercent}%`
                }
              />
              <Row label="Started" value={formatWhen(summary.startedAt)} />
              <Row label="Submitted" value={formatWhen(summary.submittedAt)} />
            </dl>

            <div className="mt-5 border-t border-border pt-5">
              {confirmReset ? (
                <div>
                  <p className="text-sm text-foreground">
                    This wipes their answers, score, recordings and reopen count, and puts the link
                    back to the start. It cannot be undone.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={() => void call("reset")}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                    >
                      {busy === "reset" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}
                      Yes, reset it
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="rounded-full border border-border px-5 py-2 text-sm font-bold text-muted-foreground transition hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm font-bold text-foreground transition hover:border-primary/50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset this assessment
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function formatWhen(value: string | null): string {
  if (!value) return "Not yet";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "Unknown" : d.toLocaleString();
}
