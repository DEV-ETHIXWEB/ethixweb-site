import { useRef, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, PhoneCall } from "lucide-react";
import { Turnstile, type TurnstileHandle } from "@/components/shared/Turnstile";
import { useTheme } from "@/components/layout/ThemeProvider";
import { isValidPhone, normalizeWebsiteUrl } from "@/lib/utils";
import { trackLeadFormConversion } from "@/lib/gtag";

/** The call request card the assistant offers inside the conversation.
 *
 * It is the contact page's form, not a second lead pipeline: the same three
 * details, the same validation, the same Turnstile check, posted to the same
 * /api/contact endpoint. So a lead from the chat lands in Supabase, ClickUp
 * and the team inbox exactly like one from /contact, and nothing downstream
 * has to know the chat exists. Only the conversion event is tagged "chat",
 * so the source is visible in reporting. */

export function LeadForm({ onSent }: { onSent: (firstName: string, websiteHost: string) => void }) {
  const { theme } = useTheme();
  const [form, setForm] = useState({ name: "", phone: "", website: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string | null>(null);
  const turnstile = useRef<TurnstileHandle | null>(null);
  const turnstileRequired = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));
  const ready = Boolean(form.name.trim() && form.phone.trim() && form.website.trim());

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    if (turnstileRequired && !token) {
      setError("Please complete the verification check.");
      return;
    }
    const name = form.name.trim();
    if (!name) {
      setError("Please enter your name.");
      return;
    }
    const phone = form.phone.trim();
    if (!isValidPhone(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }
    const website = normalizeWebsiteUrl(form.website);
    if (!website) {
      setError("Please enter a valid website address, like yourbusiness.com.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, website, turnstileToken: token }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Request failed");
      }
      trackLeadFormConversion("chat");
      onSent(name.split(" ")[0] || name, new URL(website).hostname.replace(/^www\./, ""));
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message}. You can also email info@ethixweb.com.`
          : "Something went wrong. Please email info@ethixweb.com directly.",
      );
      // Tokens are single use: a retry with the spent one is rejected every
      // time, so the widget has to issue a fresh one before the next attempt.
      setToken(null);
      turnstile.current?.reset();
    } finally {
      setSubmitting(false);
    }
  }

  const field =
    "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50";

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-primary/30 bg-primary/[0.06] p-3.5"
      aria-label="Request a call from the Ethixweb team"
    >
      <p className="flex items-center gap-2 text-sm font-bold">
        <PhoneCall className="h-4 w-4 text-primary" /> Book a free call
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
        The team looks at your website first, then calls within one business day.
      </p>
      <div className="mt-3 space-y-2">
        <input
          className={field}
          placeholder="Your name"
          aria-label="Your name"
          autoComplete="name"
          maxLength={100}
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />
        <input
          className={field}
          placeholder="Phone number"
          aria-label="Phone number"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          maxLength={40}
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
        <input
          className={field}
          placeholder="Your website, like yourbusiness.com"
          aria-label="Your website"
          autoComplete="url"
          inputMode="url"
          maxLength={200}
          value={form.website}
          onChange={(e) => set("website", e.target.value)}
        />
      </div>
      {turnstileRequired && (
        <div className="mt-2.5">
          <Turnstile
            handleRef={turnstile}
            theme={theme === "dark" ? "dark" : "light"}
            onVerify={(t) => {
              setToken(t);
              setBlocked(null);
            }}
            onExpire={() => setToken(null)}
            onUnavailable={setBlocked}
          />
        </div>
      )}
      {(blocked || error) && (
        <p role="alert" className="mt-2 text-[11px] leading-relaxed text-error-text">
          {blocked || error}
        </p>
      )}
      <button
        type="submit"
        disabled={!ready || submitting || (turnstileRequired && !token)}
        className="btn-primary mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending
          </>
        ) : (
          "Request my call"
        )}
      </button>
      <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
        Only these three details are sent to the team. Your chat questions stay on your device.
      </p>
    </form>
  );
}

/** The card a sent request turns into, so a returning visitor (the transcript
 * survives navigation) sees it went through rather than an empty form. */
export function LeadSent() {
  return (
    <p className="flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-3.5 py-2.5 text-xs font-semibold">
      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> Call request sent to the team.
    </p>
  );
}
