import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
} from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { GlowBlob } from "@/components/shared/GlowBlob";
import { Turnstile } from "@/components/shared/Turnstile";
import { CampaignSection } from "@/components/campaign/CampaignSection";
import { formLabelClass, formInputClass } from "@/lib/form-styles";
import type { CampaignConfig } from "@/lib/campaigns/types";
import type { CampaignMeta } from "@/lib/campaigns/tracking";
import { trackCampaignEvent, captureAttribution } from "@/lib/campaigns/tracking";

type SubmitState = "idle" | "submitting" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormData {
  businessType: string;
  goal: string;
  businessName: string;
  website: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const EMPTY_FORM: FormData = {
  businessType: "",
  goal: "",
  businessName: "",
  website: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
};

const STEP_LABELS = ["Business", "Goal", "About you", "Contact"] as const;
const TOTAL_STEPS = STEP_LABELS.length;

export function CampaignLeadForm({ config, meta }: { config: CampaignConfig; meta: CampaignMeta }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<FormData>(EMPTY_FORM);
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [token, setToken] = useState("");
  const hasTrackedStart = useRef(false);
  // Ref, not state: a rapid double-click/double-tap fires both handlers
  // before React commits the re-render that would update `state` to
  // "submitting", so a `state === "submitting"` check alone can race and
  // let both calls through. Mutating a ref is synchronous and visible to
  // the second call immediately, closing that window.
  const isSubmitting = useRef(false);

  const markStarted = () => {
    if (hasTrackedStart.current) return;
    hasTrackedStart.current = true;
    trackCampaignEvent("campaign_form_start", meta);
  };

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    trackCampaignEvent("campaign_form_step", meta, { step: next });
  };

  const canAdvance = (() => {
    if (step === 1) return !!data.businessType;
    if (step === 2) return !!data.goal;
    if (step === 3) return true; // business name/website optional
    return true;
  })();

  const handleNext = () => {
    if (!canAdvance) return;
    markStarted();
    if (step < TOTAL_STEPS) goTo(step + 1);
  };

  const handleBack = () => {
    if (step > 1) goTo(step - 1);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isSubmitting.current) return;
    // Belt-and-suspenders alongside the ref guard: disable the actual DOM
    // node synchronously, in the same tick as this click, rather than
    // waiting for React's `disabled={state === "submitting"}` to reach the
    // DOM on the next render. A second click dispatched before that render
    // commits (e.g. a rapid double-click/double-tap) would otherwise still
    // hit a technically-enabled button.
    e.currentTarget.disabled = true;

    if (!data.firstName.trim() || !data.lastName.trim() || !data.email.trim()) {
      setErrorMsg("First name, last name and email are required.");
      setState("error");
      return;
    }
    if (!EMAIL_RE.test(data.email.trim())) {
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
          website: data.website,
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

  return (
    <CampaignSection id="audit-form" className="scroll-mt-24" narrow>
      <Reveal>
        <div className="glass-strong relative overflow-hidden rounded-[2rem] p-8 sm:p-10 lg:p-14">
          <GlowBlob size="lg" color="primary" className="-top-24 left-1/2 -translate-x-1/2" />
          <div className="relative mx-auto max-w-2xl text-center">
            <p className="inline-flex items-center gap-1.5 text-sm uppercase tracking-widest text-primary-text">
              <ClipboardCheck className="h-4 w-4" /> {config.offer.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold text-gradient pb-1 sm:text-5xl">
              {config.offer.headline}
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">{config.offer.body}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {config.offer.checks.map((c) => (
                <span
                  key={c.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-muted-foreground"
                >
                  <c.icon className="h-3 w-3 text-primary" />
                  {c.label}
                </span>
              ))}
            </div>
          </div>

          {state === "success" ? (
            <div className="relative mx-auto mt-10 max-w-md text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
              <h3 className="mt-4 font-display text-xl font-semibold">
                {config.form.successHeadline}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{config.form.successBody}</p>
            </div>
          ) : (
            <div className="relative mx-auto mt-10 max-w-xl">
              <StepProgress current={step} />

              <div className="relative mt-8 min-h-[260px] overflow-hidden">
                <AnimatePresence mode="wait" custom={direction} initial={false}>
                  <motion.div
                    key={step}
                    custom={direction}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: direction * 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, x: direction * -24 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {step === 1 && (
                      <StepBusinessType
                        config={config}
                        value={data.businessType}
                        onChange={(v) => {
                          markStarted();
                          setData((d) => ({ ...d, businessType: v }));
                        }}
                      />
                    )}
                    {step === 2 && (
                      <StepGoal
                        config={config}
                        value={data.goal}
                        onChange={(v) => setData((d) => ({ ...d, goal: v }))}
                      />
                    )}
                    {step === 3 && (
                      <StepAboutBusiness
                        data={data}
                        onChange={(patch) => setData((d) => ({ ...d, ...patch }))}
                        websitePlaceholder={config.form.websitePlaceholder}
                      />
                    )}
                    {step === 4 && (
                      <StepContact
                        data={data}
                        onChange={(patch) => setData((d) => ({ ...d, ...patch }))}
                        token={token}
                        setToken={setToken}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {state === "error" && (
                <p role="alert" className="mt-4 text-center text-sm text-error-text">
                  {errorMsg}
                </p>
              )}

              <div className="mt-8 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 1}
                  className="btn-secondary inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold disabled:pointer-events-none disabled:opacity-0"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>

                {step < TOTAL_STEPS ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canAdvance}
                    className="btn-primary shine-cta inline-flex items-center gap-2 rounded-full border border-transparent px-6 py-3 text-sm font-bold disabled:opacity-50"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={state === "submitting"}
                    className="btn-primary shine-cta inline-flex items-center gap-2 rounded-full border border-transparent px-6 py-3 text-sm font-bold disabled:opacity-60"
                  >
                    {state === "submitting" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        {config.offer.headline} <ArrowUpRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                No spam. No fake guarantees. Just an honest look at your setup.
              </p>
            </div>
          )}
        </div>
      </Reveal>
    </CampaignSection>
  );
}

function StepProgress({ current }: { current: number }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={TOTAL_STEPS}
      aria-valuetext={`Step ${current} of ${TOTAL_STEPS}: ${STEP_LABELS[current - 1]}`}
    >
      <div className="flex items-center justify-between">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const active = n === current;
          const done = n < current;
          return (
            <div
              key={label}
              className="relative flex flex-1 flex-col items-center gap-2 last:flex-none"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : active
                      ? "border-primary text-primary"
                      : "border-white/15 text-muted-foreground"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : n}
              </div>
              <span
                className={`hidden text-[10px] font-semibold uppercase tracking-wide sm:block ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
              {i < STEP_LABELS.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`absolute left-[calc(50%+1.25rem)] right-[calc(-50%+1.25rem)] top-4 h-px ${
                    done ? "bg-primary" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OptionGrid<T extends { id: string; label: string }>({
  options,
  value,
  onChange,
  columns = 2,
}: {
  options: readonly T[];
  value: string;
  onChange: (id: string) => void;
  columns?: 2 | 3;
}) {
  return (
    <div
      className={`grid gap-3 ${columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
      role="radiogroup"
    >
      {options.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.id)}
            className={`flex items-center justify-between gap-2 rounded-2xl border px-5 py-4 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
              selected
                ? "option-card-selected border-primary bg-primary/10 text-foreground"
                : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-foreground"
            }`}
          >
            {opt.label}
            {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
          </button>
        );
      })}
    </div>
  );
}

function StepBusinessType({
  config,
  value,
  onChange,
}: {
  config: CampaignConfig;
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div>
      <h3 className="text-center font-display text-xl font-semibold">
        What type of business are you?
      </h3>
      <div className="mt-6">
        <OptionGrid
          options={config.form.businessTypes}
          value={value}
          onChange={onChange}
          columns={3}
        />
      </div>
    </div>
  );
}

function StepGoal({
  config,
  value,
  onChange,
}: {
  config: CampaignConfig;
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div>
      <h3 className="text-center font-display text-xl font-semibold">
        What are you trying to improve?
      </h3>
      <div className="mt-6">
        <OptionGrid options={config.form.goals} value={value} onChange={onChange} columns={3} />
      </div>
    </div>
  );
}

function StepAboutBusiness({
  data,
  onChange,
  websitePlaceholder,
}: {
  data: FormData;
  onChange: (patch: Partial<FormData>) => void;
  websitePlaceholder: string;
}) {
  return (
    <div>
      <h3 className="text-center font-display text-xl font-semibold">
        Tell us about your business
      </h3>
      <div className="mt-6 grid gap-5">
        <div>
          <label htmlFor="businessName" className={formLabelClass}>
            Business name
          </label>
          <input
            id="businessName"
            autoComplete="organization"
            maxLength={120}
            value={data.businessName}
            onChange={(e) => onChange({ businessName: e.target.value })}
            className={formInputClass}
          />
        </div>
        <div>
          <label htmlFor="website" className={formLabelClass}>
            Website (if you have one)
          </label>
          <input
            id="website"
            autoComplete="url"
            maxLength={200}
            placeholder={websitePlaceholder}
            value={data.website}
            onChange={(e) => onChange({ website: e.target.value })}
            className={formInputClass}
          />
        </div>
      </div>
    </div>
  );
}

function StepContact({
  data,
  onChange,
  token,
  setToken,
}: {
  data: FormData;
  onChange: (patch: Partial<FormData>) => void;
  token: string;
  setToken: (t: string) => void;
}) {
  const [emailTouched, setEmailTouched] = useState(false);
  const emailInvalid = emailTouched && data.email.trim() !== "" && !EMAIL_RE.test(data.email);

  return (
    <div>
      <h3 className="text-center font-display text-xl font-semibold">
        Where should we send your audit?
      </h3>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={formLabelClass}>
            First name
          </label>
          <input
            id="firstName"
            required
            autoComplete="given-name"
            maxLength={80}
            value={data.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            className={formInputClass}
          />
        </div>
        <div>
          <label htmlFor="lastName" className={formLabelClass}>
            Last name
          </label>
          <input
            id="lastName"
            required
            autoComplete="family-name"
            maxLength={80}
            value={data.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            className={formInputClass}
          />
        </div>
        <div>
          <label htmlFor="email" className={formLabelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            maxLength={200}
            aria-invalid={emailInvalid}
            aria-describedby={emailInvalid ? "email-error" : undefined}
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            onBlur={() => setEmailTouched(true)}
            className={formInputClass}
          />
          {emailInvalid && (
            <p id="email-error" role="alert" className="mt-1.5 text-xs text-error-text">
              Enter a valid email address.
            </p>
          )}
        </div>
        <div>
          <label htmlFor="phone" className={formLabelClass}>
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            maxLength={30}
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            className={formInputClass}
          />
        </div>
      </div>
      <div className="mt-6 flex justify-center">
        <Turnstile onVerify={setToken} onExpire={() => setToken("")} theme="dark" />
      </div>
      {!token && (
        <p className="sr-only" aria-live="polite">
          Verification widget loading
        </p>
      )}
    </div>
  );
}
