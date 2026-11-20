import { useEffect, useRef, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Blocks,
  Check,
  Handshake,
  Layers,
  ShieldCheck,
  Send,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { jsonLdStringify } from "@/lib/json-ld";
import { OG_IMAGE, SITE_URL, siteUrl } from "@/lib/site";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useTheme } from "@/components/layout/ThemeProvider";
import { PageHero } from "@/components/shared/PageHero";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { EditorialHeader } from "@/components/shared/EditorialHeader";
import { FaqList, faqSchema, type Faq } from "@/components/shared/FaqList";
import { Turnstile, type TurnstileHandle } from "@/components/shared/Turnstile";
import { formInputClass, formLabelClass } from "@/lib/form-styles";
import { isValidEmail, isValidPhone, normalizeWebsiteUrl } from "@/lib/utils";
import { trackLeadFormConversion } from "@/lib/gtag";

const URL = siteUrl("/partners");
const TITLE = "Partner Program: Refer or Work With Ethixweb | Ethixweb";
const DESCRIPTION =
  "Refer a contractor, or partner with Ethixweb to deliver websites, ads and AI answering for your clients. Leave your details and we'll talk it through.";

type PartnerType = "referral" | "agency" | "other";

const PATHS: {
  type: PartnerType;
  icon: LucideIcon;
  title: string;
  who: string;
  body: string;
  points: string[];
}[] = [
  {
    type: "referral",
    icon: UserPlus,
    title: "Refer a business",
    who: "Customers, suppliers, accountants, friends in the trades",
    body: "Know an HVAC, plumbing or home service business that keeps missing calls or needs more booked jobs? Introduce them and we take it from there.",
    points: ["Nothing to sell, no forms to chase", "We reach out only the way you agree", "A thank-you when they become a client"],
  },
  {
    type: "agency",
    icon: Layers,
    title: "Agencies & freelancers",
    who: "Marketing agencies, web designers, consultants",
    body: "Need a team behind you? We can deliver websites, ads, SEO and AI answering for your clients, under your brand or alongside you.",
    points: ["White-label or co-branded", "Scope agreed per project, in writing", "Your client relationship stays yours"],
  },
  {
    type: "other",
    icon: Blocks,
    title: "Software & industry",
    who: "Field software, suppliers, trade groups",
    body: "You serve the same contractors we do. Let's find ways to help them together, from joint guides to introductions both ways.",
    points: ["Joint guides, events or offers", "Introductions in both directions", "Shaped around what fits your customers"],
  },
];

const STEPS = [
  { title: "Tell us about you", body: "Leave your details below. It takes about a minute." },
  { title: "A short intro call", body: "We learn how you work and who you serve, and answer your questions." },
  { title: "Agree it in writing", body: "How introductions work, what we deliver and how partners are rewarded." },
  { title: "Start working together", body: "Introduce a business or bring us a project. We keep you posted throughout." },
];

const PROMISES: { title: string; body: string }[] = [
  { title: "You hear how it goes", body: "We keep you posted on every introduction, so you're never left wondering." },
  { title: "Your name is safe with us", body: "We never use your name or brand without your say-so." },
  { title: "No pressure on your contacts", body: "One honest conversation about what would help. No hard sell, no drip emails." },
  { title: "A senior team on every job", body: "The people you meet on the first call are the people doing the work." },
];

const FAQS: Faq[] = [
  {
    q: "How are partners rewarded?",
    a: "It depends on the type of partnership and the work involved, so we don't publish a rate card. We agree it with each partner directly, in writing, before you introduce anyone. Leave your details and we'll walk you through it on a short call.",
  },
  {
    q: "Do I need to be an Ethixweb client to refer someone?",
    a: "No. Customers, suppliers, accountants, other trades and friends of the business are all welcome.",
  },
  {
    q: "Who makes a good introduction?",
    a: "HVAC, plumbing, electrical and other home service businesses in the US that want more booked jobs, fewer missed calls or a website that actually brings in work.",
  },
  {
    q: "Will you contact someone I mention without asking me first?",
    a: "No. We agree with you how each introduction is made, whether that's a warm email from you, a three-way call or a simple heads-up.",
  },
  {
    q: "Can you deliver work under my agency's brand?",
    a: "Yes. We can work white-label or co-branded. The scope, timelines and who talks to the client are agreed in writing for each project.",
  },
  {
    q: "Is there any cost or commitment to join?",
    a: "No cost to join and no commitment. Introduce one business or many, whenever it makes sense for you.",
  },
];

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLdStringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${URL}#webpage`,
          name: "Ethixweb Partner Program",
          description: DESCRIPTION,
          url: URL,
          isPartOf: { "@id": `${SITE_URL}/#website` },
          about: { "@id": `${SITE_URL}/#organization` },
        }),
      },
      faqSchema(FAQS),
    ],
  }),
  component: Partners,
});

function Partners() {
  return (
    <SiteLayout>
      <PartnersBody />
    </SiteLayout>
  );
}

function PartnersBody() {
  const [type, setType] = useState<PartnerType | null>(null);

  return (
    <>
      <PageHero icon={Handshake} eyebrow="Partner program" title="Send work our way. We'll take it from there.">
        <p>
          Know a contractor who keeps missing calls? Run an agency that needs a senior team behind it? There's a
          way to partner with Ethixweb that fits. Tell us a little about you and we'll talk it through.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#apply"
            className="btn-primary group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
          >
            Become a partner
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          <a
            href="#how"
            className="btn-secondary inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
          >
            How it works
          </a>
        </div>
      </PageHero>

      <Container>
        <Breadcrumbs items={[{ label: "Partner program" }]} />
      </Container>

      {/* Paths */}
      <section className="py-16">
        <Container>
          <EditorialHeader
            className="mb-12"
            index="01"
            eyebrow="Ways to partner"
            title="Three ways in. Pick the one that sounds like you."
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {PATHS.map((p, i) => (
              <Reveal key={p.type} delay={0.05 * i} className="h-full">
                <article className="glass group relative flex h-full flex-col overflow-hidden rounded-3xl p-7 transition-colors hover:border-primary/40">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                  />
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                      <p.icon className="h-5 w-5 text-primary-text" aria-hidden="true" />
                    </span>
                    <span className="font-display text-sm font-bold tabular-nums text-muted-foreground/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-semibold">{p.title}</h3>
                  <p className="mt-1.5 text-xs uppercase tracking-widest text-primary-text lg:min-h-[2.6em]">{p.who}</p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                  <ul className="mt-5 space-y-2.5">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2.5 text-sm text-foreground/90">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-text" aria-hidden="true" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#apply"
                    onClick={() => setType(p.type)}
                    className="mt-auto inline-flex items-center gap-1.5 self-start pt-7 text-sm font-semibold text-foreground transition-colors hover:text-primary-text focus-visible:outline-none focus-visible:underline"
                  >
                    This is me
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-28 py-16">
        <Container>
          <EditorialHeader className="mb-12" index="02" eyebrow="How it works" title="Four steps, and nothing hidden." />
          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} as="li" delay={0.04 * i}>
                <div className="h-full rounded-3xl border border-border p-6">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* Rewards + promises */}
      <section className="py-16">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-brand p-8 sm:p-12">
              <div className="absolute inset-0 grid-bg opacity-30" aria-hidden="true" />
              <div className="relative grid gap-10 lg:grid-cols-[1fr_1.15fr]">
                <div>
                  <p className="text-sm uppercase tracking-widest text-primary-foreground/70">Partner rewards</p>
                  <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-primary-foreground sm:text-4xl">
                    Every partnership is different. So is the thank-you.
                  </h2>
                  <p className="mt-4 leading-relaxed text-primary-foreground/80">
                    We don't publish a rate card. How partners are rewarded depends on the kind of partnership
                    and the work involved, and we agree it with you, in writing, before you introduce anyone.
                  </p>
                  <a
                    href="#apply"
                    className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary-foreground px-6 py-3 text-sm font-semibold text-[#16100f] transition-transform hover:-translate-y-0.5"
                  >
                    Ask how it works for you
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
                <ul className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
                  {PROMISES.map((p) => (
                    <li key={p.title} className="bg-[#1a0f12]/80 p-6">
                      <ShieldCheck className="h-5 w-5 text-[#f0a3a6]" aria-hidden="true" />
                      <h3 className="mt-3 font-display text-base font-semibold text-primary-foreground">{p.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-primary-foreground/75">{p.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Form */}
      <section id="apply" className="scroll-mt-28 py-16">
        <Container>
          <EditorialHeader
            className="mb-12"
            index="03"
            eyebrow="Become a partner"
            title="Tell us a little about you."
            sub="No cost, no commitment. We'll reply within one business day to set up a short call."
          />
          <PartnerForm type={type} setType={setType} />
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <Container>
          <EditorialHeader className="mb-10" index="04" eyebrow="Questions" title="Before you partner with us." />
          <FaqList faqs={FAQS} />
        </Container>
      </section>
    </>
  );
}

const TYPE_LABELS: Record<PartnerType, string> = {
  referral: "Refer a business",
  agency: "Agency or freelancer",
  other: "Software, supplier or other",
};

function PartnerForm({ type, setType }: { type: PartnerType | null; setType: (t: PartnerType) => void }) {
  const { theme } = useTheme();
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", website: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileBlocked, setTurnstileBlocked] = useState<string | null>(null);
  const turnstile = useRef<TurnstileHandle | null>(null);
  const turnstileRequired = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sent) successRef.current?.focus();
  }, [sent]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    if (!type) return setError("Please choose how you'd like to partner.");
    if (!form.name.trim()) return setError("Please enter your name.");
    const email = form.email.trim();
    if (!isValidEmail(email)) return setError("Please enter a valid email address.");
    const phone = form.phone.trim();
    if (phone && !isValidPhone(phone)) return setError("Please enter a valid phone number, or leave it blank.");
    const website = form.website.trim() ? normalizeWebsiteUrl(form.website) : "";
    if (form.website.trim() && !website) return setError("Please enter a valid website, like yourcompany.com.");
    if (turnstileRequired && !turnstileToken) return setError("Please complete the verification check.");

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: form.name.trim(),
          email,
          phone,
          company: form.company.trim(),
          website,
          message: form.message.trim(),
          turnstileToken,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Request failed");
      }
      setSent(true);
      trackLeadFormConversion("partners");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please email info@ethixweb.com directly.");
      setTurnstileToken(null);
      turnstile.current?.reset();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Reveal>
      <div className="relative grid overflow-hidden rounded-[2rem] border border-border shadow-elegant lg:grid-cols-[1fr_1.55fr]">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" aria-hidden="true" />

        {/* Left: what happens next */}
        <div className="relative border-b border-border bg-card/60 p-8 sm:p-10 lg:border-b-0 lg:border-r">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
            <Handshake className="h-5 w-5 text-primary-text" aria-hidden="true" />
          </span>
          <h3 className="mt-6 font-display text-2xl font-bold">What happens next</h3>
          <ol className="mt-6 space-y-5">
            {[
              "We read your details and look at who you work with.",
              "We reply within one business day to book a short call.",
              "If it's a fit, we agree everything in writing before anything starts.",
            ].map((t, i) => (
              <li key={t} className="flex gap-3.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/40 text-xs font-bold text-primary-text">
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground">{t}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
            Prefer email? Write to{" "}
            <a href="mailto:info@ethixweb.com" className="font-semibold text-foreground hover:text-primary-text">
              info@ethixweb.com
            </a>{" "}
            with "Partner" in the subject.
          </div>
        </div>

        {/* Right: form */}
        <div className="relative bg-gradient-hero p-8 sm:p-10">
          {!sent ? (
            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              <fieldset>
                <legend className={formLabelClass}>How would you like to partner?</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {(Object.keys(TYPE_LABELS) as PartnerType[]).map((t) => {
                    const active = type === t;
                    return (
                      <label
                        key={t}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40 ${
                          active
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-input/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={t}
                          checked={active}
                          onChange={() => setType(t)}
                          className="sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                            active ? "border-primary bg-primary" : "border-muted-foreground/50"
                          }`}
                        >
                          {active && <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                        </span>
                        <span className="leading-tight">{TYPE_LABELS[t]}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="p-name" label="Name" required autoComplete="name" placeholder="Jane Smith" maxLength={120} value={form.name} onChange={(v) => set("name", v)} />
                <Field id="p-email" label="Email" required type="email" autoComplete="email" placeholder="jane@company.com" maxLength={254} value={form.email} onChange={(v) => set("email", v)} />
                <Field id="p-phone" label="Phone" type="tel" autoComplete="tel" placeholder="+1 555 123 4567" maxLength={30} value={form.phone} onChange={(v) => set("phone", v)} />
                <Field id="p-company" label="Company" autoComplete="organization" placeholder="Your business" maxLength={160} value={form.company} onChange={(v) => set("company", v)} />
              </div>
              <Field id="p-website" label="Website" autoComplete="url" placeholder="yourcompany.com" maxLength={200} value={form.website} onChange={(v) => set("website", v)} />
              <div>
                <label htmlFor="p-message" className={formLabelClass}>
                  Who would you introduce, or how would you like to work together?{" "}
                  <span className="normal-case tracking-normal text-muted-foreground/60">(optional)</span>
                </label>
                <textarea
                  id="p-message"
                  rows={4}
                  maxLength={4000}
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder="A plumber I know in Tacoma is missing after-hours calls…"
                  className={`${formInputClass} resize-y`}
                />
              </div>

              {turnstileRequired && (
                <Turnstile
                  handleRef={turnstile}
                  theme={theme === "dark" ? "dark" : "light"}
                  onVerify={(t) => {
                    setTurnstileToken(t);
                    setTurnstileBlocked(null);
                  }}
                  onExpire={() => setTurnstileToken(null)}
                  onUnavailable={setTurnstileBlocked}
                />
              )}
              {turnstileBlocked && (
                <p role="alert" className="text-sm text-error-text">
                  {turnstileBlocked}
                </p>
              )}
              {error && (
                <p role="alert" className="text-sm text-error-text">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
                <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
                  We only use your details to talk about partnering. See our{" "}
                  <Link to="/policies/privacy" className="text-primary-text hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
                <button
                  type="submit"
                  disabled={submitting || (turnstileRequired && !turnstileToken)}
                  aria-busy={submitting}
                  className="shine-cta group inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-brand px-7 py-3 text-sm font-semibold text-white shadow-glow transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span aria-live="polite">{submitting ? "Sending…" : "Send my details"}</span>
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </form>
          ) : (
            <div
              ref={successRef}
              tabIndex={-1}
              role="status"
              className="flex min-h-[26rem] flex-col items-center justify-center text-center focus:outline-none"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 shadow-glow">
                <Check className="h-6 w-6 text-primary" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold">Thanks, {form.name.trim().split(" ")[0]}.</h3>
              <p className="mt-3 max-w-sm leading-relaxed text-muted-foreground">
                We've got your details. Expect an email within one business day to set up a short call.
              </p>
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}

function Field({
  id,
  label,
  required = false,
  type = "text",
  autoComplete,
  placeholder,
  maxLength,
  value,
  onChange,
}: {
  id: string;
  label: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={formLabelClass}>
        {label}
        {!required && <span className="ml-1 normal-case tracking-normal text-muted-foreground/60">(optional)</span>}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={formInputClass}
      />
    </div>
  );
}
