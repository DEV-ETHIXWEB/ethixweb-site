import { useRef, useState } from "react";
import { ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";
import { Turnstile } from "@/components/shared/Turnstile";
import { isValidEmail } from "@/lib/utils";
import type { CampaignConfig } from "@/lib/campaigns/types";
import type { CampaignMeta } from "@/lib/campaigns/tracking";
import { trackCampaignEvent, captureAttribution } from "@/lib/campaigns/tracking";

type SubmitState = "idle" | "submitting" | "success" | "error";

interface FormData {
  businessType: string;
  goal: string;
  businessName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const EMPTY_FORM: FormData = {
  businessType: "",
  goal: "",
  businessName: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

const fieldClass =
  "w-full rounded-xl border border-transparent bg-[#f5efee] px-4 py-3 text-sm font-medium text-[#1a1013] placeholder:text-[#8a7a7c] focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/25 transition";
const selectClass = `${fieldClass} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%231a1013%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:18px] bg-[right_0.75rem_center] bg-no-repeat pr-10`;

/** Single-panel, all-fields-visible hero lead form: every field is visible
 * at once (no multi-step wizard) so paid-ad traffic can convert in one
 * glance, mirroring the "flat-rate quote" form pattern used by home-service
 * lead-gen ads. Lives directly in the hero instead of a dedicated section
 * further down the page. */
export function CampaignHeroForm({ config, meta }: { config: CampaignConfig; meta: CampaignMeta }) {
  const [data, setData] = useState<FormData>(EMPTY_FORM);
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [token, setToken] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const hasTrackedStart = useRef(false);
  const isSubmitting = useRef(false);

  const emailInvalid = emailTouched && data.email.trim() !== "" && !isValidEmail(data.email);

  const markStarted = () => {
    if (hasTrackedStart.current) return;
    hasTrackedStart.current = true;
    trackCampaignEvent("campaign_form_start", meta);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting.current) return;

    if (!data.firstName.trim() || !data.lastName.trim() || !data.email.trim()) {
      setErrorMsg("First name, last name and email are required.");
      setState("error");
      return;
    }
    if (!isValidEmail(data.email.trim())) {
      setErrorMsg("Enter a valid email address.");
      setState("error");
      return;
    }
    isSubmitting.current = true;
    setState("submitting");
    setErrorMsg("");

    try {
      const res = await fetch(config.submitEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          businessName: data.businessName,
          email: data.email,
          phone: data.phone,
          businessType: data.businessType,
          goal: data.goal,
          turnstileToken: token,
          attribution: captureAttribution(),
        }),
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !json?.ok) {
        setErrorMsg(json?.error || "Something went wrong. Please try again.");
        setState("error");
        return;
      }
      setState("success");
      trackCampaignEvent("campaign_form_submit", meta);
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setState("error");
    } finally {
      isSubmitting.current = false;
    }
  };

  if (state === "success") {
    return (
      <div
        id="audit-form"
        className="glass-strong relative scroll-mt-24 overflow-hidden rounded-[1.75rem] p-8 text-center sm:p-10"
      >
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <h3 className="mt-4 font-display text-xl font-semibold">{config.form.successHeadline}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{config.form.successBody}</p>
      </div>
    );
  }

  return (
    <div
      id="audit-form"
      className="relative scroll-mt-24 overflow-hidden rounded-[1.75rem] bg-[linear-gradient(160deg,#3a1216_0%,#26090c_55%,#160608_100%)] p-6 shadow-[0_30px_70px_-25px_rgba(0,0,0,0.65)] ring-1 ring-white/[0.08] sm:p-8"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(255,255,255,0.05),transparent_70%)]"
      />
      <div className="relative">
        <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary-text">
          {config.offer.eyebrow}
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
          {config.offer.headline}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          Get a real look at your website, Google visibility and lead capture, free.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              autoComplete="given-name"
              maxLength={80}
              placeholder="First name*"
              value={data.firstName}
              onChange={(e) => {
                markStarted();
                setData((d) => ({ ...d, firstName: e.target.value }));
              }}
              className={fieldClass}
            />
            <input
              required
              autoComplete="family-name"
              maxLength={80}
              placeholder="Last name*"
              value={data.lastName}
              onChange={(e) => setData((d) => ({ ...d, lastName: e.target.value }))}
              className={fieldClass}
            />
          </div>

          <div>
            <input
              type="email"
              required
              autoComplete="email"
              maxLength={200}
              placeholder="Email*"
              aria-invalid={emailInvalid}
              aria-describedby={emailInvalid ? "hero-email-error" : undefined}
              value={data.email}
              onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
              onBlur={() => setEmailTouched(true)}
              className={fieldClass}
            />
            {emailInvalid && (
              <p id="hero-email-error" role="alert" className="mt-1.5 text-xs text-amber-200">
                Enter a valid email address.
              </p>
            )}
          </div>

          <input
            type="tel"
            autoComplete="tel"
            maxLength={30}
            placeholder="Phone"
            value={data.phone}
            onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
            className={fieldClass}
          />

          <input
            autoComplete="organization"
            maxLength={120}
            placeholder="Business name"
            value={data.businessName}
            onChange={(e) => setData((d) => ({ ...d, businessName: e.target.value }))}
            className={fieldClass}
          />

          <select
            required
            aria-label="Business type"
            value={data.businessType}
            onChange={(e) => setData((d) => ({ ...d, businessType: e.target.value }))}
            className={selectClass}
          >
            <option value="" disabled>
              Business type*
            </option>
            {config.form.businessTypes.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            aria-label="What are you looking to improve"
            value={data.goal}
            onChange={(e) => setData((d) => ({ ...d, goal: e.target.value }))}
            className={selectClass}
          >
            <option value="">What do you want to improve? (optional)</option>
            {config.form.goals.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="flex justify-center pt-1">
            <Turnstile onVerify={setToken} onExpire={() => setToken("")} theme="dark" />
          </div>

          {state === "error" && (
            <p role="alert" className="text-center text-sm font-semibold text-amber-200">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={state === "submitting"}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f5efee] px-6 py-3.5 text-sm font-bold text-[#1a1013] shadow-[0_14px_32px_-12px_rgba(0,0,0,0.5)] transition hover:bg-white disabled:opacity-70"
          >
            {state === "submitting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Sending...
              </>
            ) : (
              <>
                {config.hero.primaryCta} <ArrowUpRight className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="text-center text-[11px] leading-relaxed text-white/55">
            No spam, no fake guarantees. We'll follow up personally with your audit.
          </p>
        </form>
      </div>
    </div>
  );
}
