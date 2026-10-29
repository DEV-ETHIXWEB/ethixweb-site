import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Ban,
  Check,
  Copy,
  Download,
  Eye,
  Link2,
  Loader2,
  Mail,
  Plus,
  RotateCcw,
  Search,
  ShieldAlert,
  TimerOff,
  X,
} from "lucide-react";
import { formInputClass, formLabelClass } from "@/lib/form-styles";

// Recruiter dashboard for the "Let's Get to Know You" questionnaire: create
// one private link per candidate, follow who has opened and submitted, read
// answers, export CSV. Signs in once with the shared admin password
// (checked server-side in /api/admin/questionnaire) and then works off a
// signed 8-hour session kept only in this tab's memory. Kept out of the
// sitemap and marked noindex.

export const Route = createFileRoute("/admin/questionnaire")({
  head: () => ({
    meta: [
      { title: "Questionnaire admin - Ethixweb" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: QuestionnaireAdminPage,
});

type Status = "pending" | "opened" | "submitted" | "expired" | "revoked";

interface Row {
  id: string;
  invitedName: string;
  invitedEmail: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  college: string | null;
  linkedin: string | null;
  status: Status;
  createdAt: string;
  expiresAt: string;
  openedAt: string | null;
  submittedAt: string | null;
  answeredSoFar: number;
  summary: { compensation: string; intent: string } | null;
}

interface Stats {
  total: number;
  pending: number;
  opened: number;
  submitted: number;
  closed: number;
}

interface Detail {
  candidate: Row;
  answersAreDraft: boolean;
  answers: { id: string; number: number; section: number; question: string; answer: string }[];
  events: { action: string; actor: string; detail: string | null; at: string }[];
}

const STATUS_STYLE: Record<Status, string> = {
  pending: "bg-white/5 text-muted-foreground",
  opened: "bg-sky-500/15 text-sky-300",
  submitted: "bg-emerald-500/15 text-emerald-300",
  expired: "bg-amber-500/15 text-amber-300",
  revoked: "bg-red-500/15 text-red-300",
};

function fmt(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function QuestionnaireAdminPage() {
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [newLink, setNewLink] = useState<{ id: string; link: string } | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);

  async function call(action: string, extra: Record<string, unknown> = {}, busyKey = action) {
    setBusy(busyKey);
    setError(null);
    try {
      const res = await fetch("/api/admin/questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          action === "login" ? { action, password } : { action, session, ...extra },
        ),
      });
      if (action === "export" && res.ok) return res;
      const json = await res.json().catch(() => null);
      if (!json?.ok) {
        if (json?.signedOut) setSession(null);
        setError(json?.error || "Request failed.");
        return null;
      }
      if (json.session) {
        setSession(json.session);
        setPassword("");
      }
      if (json.rows) {
        setRows(json.rows);
        setStats(json.stats);
      }
      if (json.created) setNewLink(json.created);
      return json;
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function exportCsv() {
    const res = (await call("export")) as Response | null;
    if (!res) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `questionnaire-responses-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function openDetail(id: string) {
    const json = await call("detail", { id }, `detail-${id}`);
    if (json) setDetail(json as Detail);
  }

  const q = filter.trim().toLowerCase();
  const visible = useMemo(
    () =>
      rows.filter((r) => {
        if (statusFilter !== "all" && r.status !== statusFilter) return false;
        if (!q) return true;
        return [r.invitedName, r.invitedEmail, r.name, r.email, r.college, r.phone, r.id]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q));
      }),
    [rows, q, statusFilter],
  );

  if (!session) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-4 text-foreground">
        <form
          className="w-full max-w-sm"
          onSubmit={(e) => {
            e.preventDefault();
            if (password) void call("login");
          }}
        >
          <h1 className="font-display text-2xl font-bold">Questionnaire admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Candidate invitations and responses for "Let's Get to Know You".
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
          {error && <ErrorLine>{error}</ErrorLine>}
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background px-4 py-10 text-foreground sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Questionnaire admin</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              One private link per candidate. Each link accepts one submission.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SmallButton onClick={() => void call("list")} disabled={busy !== null}>
              Refresh
            </SmallButton>
            <SmallButton
              onClick={() => void exportCsv()}
              disabled={busy !== null || !stats?.submitted}
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </SmallButton>
          </div>
        </div>

        {stats && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Stat label="Invitations" value={stats.total} />
            <Stat label="Pending" value={stats.pending} />
            <Stat label="Opened" value={stats.opened} />
            <Stat label="Submitted" value={stats.submitted} accent />
            <Stat label="Expired / revoked" value={stats.closed} />
          </div>
        )}

        <CreateInvite busy={busy === "create"} onCreate={(body) => call("create", body)} />

        {newLink && (
          <NewLinkBanner
            link={newLink.link}
            name={rows.find((r) => r.id === newLink.id)?.invitedName ?? ""}
            onClose={() => setNewLink(null)}
          />
        )}

        {error && <ErrorLine>{error}</ErrorLine>}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1 rounded-full border border-border p-1">
            {(["all", "pending", "opened", "submitted", "expired", "revoked"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold capitalize transition ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search name, email, college, ID"
              aria-label="Search candidates"
              className="w-72 max-w-full rounded-full border border-border bg-input/60 py-2 pr-4 pl-9 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[60rem] text-left text-sm">
            <thead className="bg-white/[0.03] text-xs tracking-wider text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Candidate</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Submitted</th>
                <th className="px-4 py-3 font-semibold">Response summary</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    {rows.length === 0
                      ? "No invitations yet. Create one above."
                      : "Nobody matches that filter."}
                  </td>
                </tr>
              )}
              {visible.map((r) => (
                <tr key={r.id} className="border-t border-border align-top">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{r.name ?? r.invitedName}</p>
                    <p className="text-xs text-muted-foreground">{r.email ?? r.invitedEmail}</p>
                    {r.college && <p className="text-xs text-muted-foreground">{r.college}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold capitalize ${STATUS_STYLE[r.status]}`}
                    >
                      {r.status}
                    </span>
                    {r.status === "opened" && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {r.answeredSoFar}/15 answered
                      </p>
                    )}
                    {(r.status === "pending" || r.status === "opened") && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Expires {fmt(r.expiresAt)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{fmt(r.submittedAt) || "-"}</td>
                  <td className="max-w-xs px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                    {r.summary ? (
                      <>
                        <p>
                          <span className="font-semibold text-foreground">Pay:</span>{" "}
                          {r.summary.compensation}
                        </p>
                        <p className="mt-1">
                          <span className="font-semibold text-foreground">Intent:</span>{" "}
                          {r.summary.intent}
                        </p>
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <IconButton
                        label="View answers"
                        onClick={() => void openDetail(r.id)}
                        busy={busy === `detail-${r.id}`}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </IconButton>
                      {(r.status === "pending" || r.status === "opened") && (
                        <>
                          <IconButton
                            label="New link (the old one stops working)"
                            onClick={() => void call("relink", { id: r.id }, `relink-${r.id}`)}
                            busy={busy === `relink-${r.id}`}
                          >
                            <Link2 className="h-3.5 w-3.5" />
                          </IconButton>
                          <IconButton
                            label="Expire now"
                            onClick={() => void call("expire", { id: r.id }, `expire-${r.id}`)}
                            busy={busy === `expire-${r.id}`}
                          >
                            <TimerOff className="h-3.5 w-3.5" />
                          </IconButton>
                          <IconButton
                            label="Revoke"
                            danger
                            onClick={() => void call("revoke", { id: r.id }, `revoke-${r.id}`)}
                            busy={busy === `revoke-${r.id}`}
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </IconButton>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detail && (
        <DetailPanel
          detail={detail}
          busy={busy}
          onClose={() => setDetail(null)}
          onResend={async () => {
            const json = await call("email", { id: detail.candidate.id }, "email");
            if (json) await openDetail(detail.candidate.id);
          }}
          onReopen={async (reason) => {
            const json = await call("reopen", { id: detail.candidate.id, reason }, "reopen");
            if (json) await openDetail(detail.candidate.id);
          }}
        />
      )}
    </main>
  );
}

function CreateInvite({
  busy,
  onCreate,
}: {
  busy: boolean;
  onCreate: (body: { name: string; email: string; expiresInDays: number }) => Promise<unknown>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [days, setDays] = useState(14);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const result = await onCreate({ name, email, expiresInDays: days });
    if (result) {
      setName("");
      setEmail("");
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 rounded-2xl border border-border bg-card/60 p-5">
      <h2 className="text-sm font-bold">Invite a candidate</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_1fr_8rem_auto] sm:items-end">
        <div>
          <label className={formLabelClass} htmlFor="invite-name">
            Name
          </label>
          <input
            id="invite-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={formInputClass}
            required
          />
        </div>
        <div>
          <label className={formLabelClass} htmlFor="invite-email">
            Email
          </label>
          <input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={formInputClass}
            required
          />
        </div>
        <div>
          <label className={formLabelClass} htmlFor="invite-days">
            Valid for
          </label>
          <select
            id="invite-days"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className={formInputClass}
          >
            {[3, 7, 14, 30].map((d) => (
              <option key={d} value={d}>
                {d} days
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={busy || !name || !email}
          className="inline-flex h-[2.9rem] items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Create link
        </button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        The candidate must enter this same email on the form. One live invitation per email.
      </p>
    </form>
  );
}

function NewLinkBanner({
  link,
  name,
  onClose,
}: {
  link: string;
  name: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-semibold text-emerald-200">
          Link ready{name ? ` for ${name}` : ""}. Copy it now: for security it is only shown once.
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-lg bg-black/30 px-3 py-2 text-xs">
          {link}
        </code>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(link).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-black"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

function DetailPanel({
  detail,
  busy,
  onClose,
  onResend,
  onReopen,
}: {
  detail: Detail;
  busy: string | null;
  onClose: () => void;
  onResend: () => Promise<void>;
  onReopen: (reason: string) => Promise<void>;
}) {
  const c = detail.candidate;
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Answers from ${c.name ?? c.invitedName}`}
        onClick={(e) => e.stopPropagation()}
        className="h-full w-full max-w-2xl overflow-y-auto border-l border-border bg-background p-6 sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold">{c.name ?? c.invitedName}</h2>
            <p className="mt-1 text-sm break-words text-muted-foreground">
              {c.email ?? c.invitedEmail}
              {c.phone ? ` · ${c.phone}` : ""}
            </p>
            {c.college && <p className="text-sm text-muted-foreground">{c.college}</p>}
            {c.linkedin && (
              <a
                href={c.linkedin}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-sm break-all text-primary-text underline"
              >
                {c.linkedin}
              </a>
            )}
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">ID {c.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 hover:bg-white/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {detail.answersAreDraft && (
          <p className="mt-5 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Not submitted. Showing progress saved so far.
          </p>
        )}

        {[1, 2].map((section) => (
          <section key={section} className="mt-7">
            <h3 className="font-mono text-[11px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Section {section}
            </h3>
            <ol className="mt-3 space-y-3">
              {detail.answers
                .filter((a) => a.section === section)
                .map((a) => (
                  <li key={a.id} className="rounded-xl border border-border p-4">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono font-bold text-primary-text">Q{a.number}</span>{" "}
                      {a.question}
                    </p>
                    {/* Rendered as text, never HTML: "Other" answers are typed
                        by the candidate. */}
                    <p className="mt-1.5 text-sm font-semibold break-words whitespace-pre-wrap">
                      {a.answer || (
                        <span className="font-normal text-muted-foreground">Not answered</span>
                      )}
                    </p>
                  </li>
                ))}
            </ol>
          </section>
        ))}

        <section className="mt-8">
          <h3 className="font-mono text-[11px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
            Audit trail
          </h3>
          <ul className="mt-3 space-y-1.5 text-sm">
            {detail.events.map((e, i) => (
              <li key={i} className="flex gap-3 text-muted-foreground">
                <span className="w-28 shrink-0 font-mono text-xs">{fmt(e.at)}</span>
                <span>
                  <span className="font-semibold text-foreground">
                    {e.action.replace(/_/g, " ")}
                  </span>{" "}
                  by {e.actor}
                  {e.detail ? `: ${e.detail}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {c.status === "submitted" && (
          <button
            type="button"
            disabled={busy === "email"}
            onClick={() => void onResend()}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-bold transition hover:bg-white/5 disabled:opacity-50"
          >
            {busy === "email" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Mail className="h-3.5 w-3.5" />
            )}
            Email these answers to the hiring inbox again
          </button>
        )}

        {c.status === "submitted" && (
          <section className="mt-8 rounded-xl border border-border p-4">
            <h3 className="text-sm font-bold">Reopen for correction</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Keeps this response in the audit trail, then lets the candidate edit and resubmit on
              their existing link for at least 7 more days.
            </p>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason (required)"
              aria-label="Reason for reopening"
              className={formInputClass}
            />
            <button
              type="button"
              disabled={reason.trim().length < 3 || busy === "reopen"}
              onClick={() => void onReopen(reason)}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-bold transition hover:bg-white/5 disabled:opacity-50"
            >
              {busy === "reopen" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RotateCcw className="h-3.5 w-3.5" />
              )}
              Reopen submission
            </button>
          </section>
        )}
      </aside>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`mt-1 font-mono text-2xl font-bold tabular-nums ${accent ? "text-emerald-300" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function SmallButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-bold text-muted-foreground transition hover:text-foreground disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function IconButton({
  children,
  label,
  onClick,
  busy,
  danger,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  busy?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={busy}
      className={`rounded-full border border-border p-2 transition disabled:opacity-50 ${
        danger
          ? "text-red-300 hover:bg-red-500/10"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
      }`}
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : children}
    </button>
  );
}

function ErrorLine({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="mt-4 flex items-start gap-2 text-sm text-error-text">
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
      {children}
    </p>
  );
}
