import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ShieldAlert, RotateCcw, Loader2, Search, Ban, Undo2 } from "lucide-react";
import { formLabelClass, formInputClass } from "@/lib/form-styles";

// Internal recruiter tool: everyone who has sat either assessment, and the
// controls to give someone another go. The password is checked server-side
// in /api/admin/assessments against GADS_ADMIN_PASSWORD - nothing here
// validates it locally, so reading this page's source reveals nothing.
// Kept out of the sitemap and marked noindex.

export const Route = createFileRoute("/admin/assessments")({
  head: () => ({
    meta: [
      { title: "Assessment admin - Ethixweb" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AssessmentAdminPage,
});

interface MindsetRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  status: string;
  currentIndex: number;
  percent: number | null;
  startedAt: string | null;
  submittedAt: string | null;
  voidedAt: string | null;
}

interface GadsRow {
  id: string;
  name: string;
  email: string;
  status: string;
  currentIndex: number;
  resumeCount: number;
  percent: number | null;
  startedAt: string | null;
  submittedAt: string | null;
}

interface Payload {
  mindset: { total: number; rows: MindsetRow[] };
  gads: { total: number; maxResumes: number; rows: GadsRow[] };
}

function AssessmentAdminPage() {
  const [password, setPassword] = useState("");
  const [data, setData] = useState<Payload | null>(null);
  const [tab, setTab] = useState<"mindset" | "gads">("mindset");
  const [filter, setFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function call(action: "list" | "reset" | "void", id?: string) {
    setBusy(id ?? action);
    setError(null);
    try {
      const res = await fetch("/api/admin/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, action, id }),
      });
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        setError(json?.error || "Request failed.");
        return;
      }
      setData({ mindset: json.mindset, gads: json.gads });
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(null);
    }
  }

  const q = filter.trim().toLowerCase();
  const mindset = useMemo(
    () =>
      (data?.mindset.rows ?? []).filter(
        (r) =>
          !q ||
          r.email.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          (r.college ?? "").toLowerCase().includes(q),
      ),
    [data, q],
  );
  const gads = useMemo(
    () =>
      (data?.gads.rows ?? []).filter(
        (r) => !q || r.email.toLowerCase().includes(q) || r.name.toLowerCase().includes(q),
      ),
    [data, q],
  );

  if (!data) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-4 text-foreground">
        <form
          className="w-full max-w-sm"
          onSubmit={(e) => {
            e.preventDefault();
            if (password) void call("list");
          }}
        >
          <h1 className="font-display text-2xl font-bold">Assessment admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Everyone who has sat the mindset or Google Ads assessment.
          </p>
          <div className="mt-6">
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
          <button
            type="submit"
            disabled={!password || busy !== null}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Sign in
          </button>
          {error && (
            <p role="alert" className="mt-4 flex items-start gap-2 text-sm text-error-text">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
        </form>
      </main>
    );
  }

  const rows = tab === "mindset" ? mindset : gads;

  return (
    <main className="min-h-dvh bg-background px-4 py-10 text-foreground sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Assessment admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.mindset.rows.length} mindset · {data.gads.rows.length} Google Ads
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-full border border-border p-1">
              {(["mindset", "gads"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                    tab === t
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "mindset" ? "Mindset" : "Google Ads"}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter by name, email, college"
                aria-label="Filter candidates"
                className="w-64 rounded-full border border-border bg-input/60 py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => void call("list")}
              disabled={busy !== null}
              className="rounded-full border border-border px-4 py-2 text-xs font-bold text-muted-foreground transition hover:text-foreground disabled:opacity-60"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-5 flex items-start gap-2 text-sm text-error-text">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[60rem] text-left text-sm">
            <thead className="bg-card text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <Th>Candidate</Th>
                {tab === "mindset" && <Th>College</Th>}
                <Th>Status</Th>
                <Th>Progress</Th>
                <Th>Score</Th>
                <Th>Started</Th>
                <Th>Submitted</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    {q ? "Nobody matches that filter." : "Nobody has sat this assessment yet."}
                  </td>
                </tr>
              )}

              {tab === "mindset" &&
                mindset.map((r) => (
                  <tr key={r.id} className="border-t border-border align-top">
                    <Td>
                      <p className="font-semibold text-foreground">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                      <p className="text-xs text-muted-foreground">{r.phone}</p>
                    </Td>
                    <Td>{r.college}</Td>
                    <Td>
                      <StatusPill status={r.voidedAt ? "voided" : r.status} />
                    </Td>
                    <Td>
                      {r.currentIndex + 1} / {data.mindset.total}
                    </Td>
                    <Td>{r.percent === null ? "-" : `${r.percent}%`}</Td>
                    <Td>{when(r.startedAt)}</Td>
                    <Td>{when(r.submittedAt)}</Td>
                    <Td>
                      <button
                        type="button"
                        onClick={() => void call("void", r.id)}
                        disabled={busy !== null}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold transition hover:border-primary/50 disabled:opacity-60"
                      >
                        {busy === r.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : r.voidedAt ? (
                          <Undo2 className="h-3.5 w-3.5" />
                        ) : (
                          <Ban className="h-3.5 w-3.5" />
                        )}
                        {r.voidedAt ? "Undo void" : "Allow retake"}
                      </button>
                    </Td>
                  </tr>
                ))}

              {tab === "gads" &&
                gads.map((r) => (
                  <tr key={r.id} className="border-t border-border align-top">
                    <Td>
                      <p className="font-semibold text-foreground">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                    </Td>
                    <Td>
                      <StatusPill status={r.status} />
                    </Td>
                    <Td>
                      {r.currentIndex + 1} / {data.gads.total}
                      <span className="block text-xs text-muted-foreground">
                        {r.resumeCount}/{data.gads.maxResumes} reopens
                      </span>
                    </Td>
                    <Td>{r.percent === null ? "-" : `${r.percent}%`}</Td>
                    <Td>{when(r.startedAt)}</Td>
                    <Td>{when(r.submittedAt)}</Td>
                    <Td>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Reset ${r.name}'s assessment? This cannot be undone.`))
                            void call("reset", r.id);
                        }}
                        disabled={busy !== null}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold transition hover:border-primary/50 disabled:opacity-60"
                      >
                        {busy === r.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="h-3.5 w-3.5" />
                        )}
                        Reset
                      </button>
                    </Td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          {tab === "mindset"
            ? "A mindset attempt is one-shot, so a candidate whose exam broke is locked out. Allow retake sets that attempt aside, keeping the record intact, and lets them register again at /assessment/mindset. It is reversible."
            : "Reset wipes the answers, score, recordings and reopen count, and puts the candidate back to the start of the same invite link. It cannot be undone."}
        </p>
      </div>
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 font-bold">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 text-muted-foreground">{children}</td>;
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "voided"
      ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
      : status === "scored" || status === "submitted"
        ? "border-primary/40 bg-primary/10 text-primary-text"
        : status === "in_progress"
          ? "border-border bg-foreground/5 text-foreground"
          : "border-border text-muted-foreground";
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold ${tone}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function when(value: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
}
