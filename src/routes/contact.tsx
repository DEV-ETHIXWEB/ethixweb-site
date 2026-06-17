import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import {
  Mail, MapPin, ArrowUpRight,
  Bot, Globe2, Cable, Search, Code2, MessageSquare, Check,
} from "lucide-react";

// ── Data ─────────────────────────────────────────────────────────────────────

const SERVICES = [
  { id: "website", label: "Website",           icon: Globe2,        desc: "Landing pages & business sites" },
  { id: "ai",      label: "AI Automation",     icon: Bot,           desc: "Chatbots, agents & workflows" },
  { id: "crm",     label: "CRM & Integrations",icon: Cable,         desc: "HubSpot, GoHighLevel, Zapier" },
  { id: "seo",     label: "SEO & Ads",         icon: Search,        desc: "Organic growth & paid campaigns" },
  { id: "webapp",  label: "Web Application",   icon: Code2,         desc: "Portals, dashboards & tools" },
  { id: "other",   label: "Something else",    icon: MessageSquare, desc: "Tell us in your own words" },
] as const;

const TIMELINES = [
  { id: "asap",     label: "ASAP",          sub: "Under 2 weeks" },
  { id: "month",    label: "This month",    sub: "2–4 weeks" },
  { id: "quarter",  label: "This quarter",  sub: "1–3 months" },
  { id: "planning", label: "Just planning", sub: "3+ months out" },
] as const;

type ServiceId  = typeof SERVICES[number]["id"];
type TimelineId = typeof TIMELINES[number]["id"];

// ── Variants ─────────────────────────────────────────────────────────────────

const slide = {
  enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
};

// ── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact - Ethixweb" },
      { name: "description", content: "Tell us about your project and get a personalised roadmap within one business day." },
      { property: "og:title",       content: "Contact Ethixweb" },
      { property: "og:description", content: "Start a project with our team." },
      { property: "og:type",        content: "website" },
      { property: "og:image",       content: "https://ethixweb.com/ethixweb.png" },
      { property: "og:url",         content: "https://ethixweb.com/contact" },
      { name: "twitter:card",        content: "summary_large_image" },
      { name: "twitter:title",       content: "Contact Ethixweb" },
      { name: "twitter:description", content: "Tell us about your project and get a personalised roadmap within one business day." },
      { name: "twitter:image",       content: "https://ethixweb.com/ethixweb.png" },
      { name: "robots",              content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://ethixweb.com/contact" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact Ethixweb",
          url: "https://ethixweb.com/contact",
          description: "Tell us about your project and get a personalised roadmap within one business day.",
          mainEntity: {
            "@type": "Organization",
            name: "Ethixweb",
            email: "akash@ethixweb.com",
            url: "https://ethixweb.com",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Kent",
              addressRegion: "WA",
              addressCountry: "US",
            },
          },
        }),
      },
    ],
  }),
  component: Contact,
});

// ── Component ────────────────────────────────────────────────────────────────

function Contact() {
  const [step, setStep] = useState(1);
  const [dir,  setDir]  = useState(1);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("preview") === "success") {
      setSent(true);
    }
  }, []);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sel,  setSel]  = useState<{
    service:  ServiceId  | null;
    timeline: TimelineId | null;
    other:    string;
    dcName:   string;
    dcPhone:  string;
    dcEmail:  string;
  }>({ service: null, timeline: null, other: "", dcName: "", dcPhone: "", dcEmail: "" });

  const isOther    = sel.service === "other";
  // Direct-contact path: bottom fields filled, no card selected
  const isDirect   = !sel.service && !!(sel.dcName.trim() && sel.dcEmail.trim());

  const stepLabels = isOther
    ? ["What do you need", "Tell us more",  "Your details"]
    : ["What do you need", "Your timeline", "Your details"];
  const totalSteps = stepLabels.length;

  const canContinue =
    (step === 1 && (!!sel.service || isDirect)) ||
    (step === 2 && !isOther && !!sel.timeline) ||
    (step === 2 &&  isOther && !!sel.other.trim()) ||
    (step === 3);

  const go = (next: number) => { setDir(next > step ? 1 : -1); setStep(next); };

  const submitLead = async (payload: {
    service?: string | null;
    timeline?: string | null;
    other?: string;
    name: string;
    phone?: string;
    email: string;
  }) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      setSent(true);
    } catch {
      setSubmitError("Something went wrong. Please email info@ethixweb.com directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const advance = () => {
    if (step === 1 && isDirect) {
      submitLead({ name: sel.dcName, phone: sel.dcPhone, email: sel.dcEmail });
      return;
    }
    go(step + 1);
  };

  // Status label shown at bottom-left
  const status = sent
    ? "SENT ✓"
    : canContinue
    ? "READY TO CONTINUE"
    : "WAITING FOR YOU";

  return (
    <SiteLayout>
      <PageHero eyebrow="Contact" title="Let's get you more booked jobs.">
        Tell us about your business. We'll reply within one business day with a clear, no-jargon plan.
      </PageHero>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="relative grid lg:grid-cols-[1fr_1.55fr] gap-0 overflow-hidden rounded-3xl shadow-elegant text-white">

              {/* ── Left panel ── */}
              <div className="relative flex flex-col justify-between overflow-hidden bg-[#0e0c14] px-8 py-10">
                {/* Left panel mascot - hidden on success */}
                <AnimatePresence>
                  {!sent && (
                    <motion.img
                      src="/Ethan%20view%202.webp"
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-25 -right-25 z-10 w-auto object-contain object-bottom"
                      style={{ height: "600px" }}
                      loading="lazy"
                      decoding="async"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  )}
                </AnimatePresence>
                {/* ambient glow */}
                <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-primary/30 blur-[90px]" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-primary/10 blur-[70px]" />

                <div className="relative z-20">
                  <h2 className="text-3xl font-extrabold leading-tight lg:text-4xl">
                    Let's build something<br />
                    <span className="text-primary">worth building.</span>
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-white/55">
                    Tell us what you need. We'll shape it with you.
                  </p>

                  {/* Vertical step tracker */}
                  <div className="mt-10">
                    {stepLabels.map((label, i) => {
                      const done    = i + 1 < step;
                      const active  = i + 1 === step;
                      const pending = i + 1 > step;
                      return (
                        <div key={label} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <motion.div
                              animate={{
                                backgroundColor: done || active ? "var(--color-primary)" : "transparent",
                                borderColor: done || active ? "var(--color-primary)" : "rgba(255,255,255,0.15)",
                              }}
                              transition={{ duration: 0.3 }}
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold"
                            >
                              {done
                                ? <Check className="h-3.5 w-3.5 text-primary-foreground" />
                                : <span className={active ? "text-primary-foreground" : "text-white/30"}>{i + 1}</span>
                              }
                            </motion.div>
                            {i < stepLabels.length - 1 && (
                              <motion.div
                                animate={{ backgroundColor: done ? "rgba(192,39,45,0.45)" : "rgba(255,255,255,0.08)" }}
                                transition={{ duration: 0.4 }}
                                className="my-1 w-px"
                                style={{ height: 28 }}
                              />
                            )}
                          </div>
                          <p className={`mb-0 pb-6 pt-0.5 text-sm font-medium transition-all duration-300 leading-none ${
                            active ? "text-white" : done ? "text-white/40" : pending ? "text-white/25" : ""
                          }`}>
                            {label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom status + contact info */}
                <div className="relative mt-8 space-y-5">
                  <motion.p
                    key={status}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`relative z-20 text-xs font-bold uppercase tracking-[0.22em] ${
                      status === "WAITING FOR YOU" ? "text-white/25"
                      : status === "SENT ✓"        ? "text-primary"
                      :                              "text-primary/80"
                    }`}
                  >
                    {status}
                  </motion.p>
                  {/* Border line - behind mascot */}
                  <div className="relative z-0 border-t border-white/8" />
                  <div className="relative z-20 space-y-3 pt-2">
                    {[
                      { i: Mail,   v: "info@ethixweb.com" },
                      { i: MapPin, v: "Mon–Fri · 9 AM – 5 PM" },
                    ].map(({ i: I, v }) => (
                      <div key={v} className="flex items-center gap-2.5 text-xs text-white/35">
                        <I className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        {v}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Right panel ── */}
              <div className="relative flex flex-col bg-[#0c0b12] px-8 py-10 overflow-hidden">
                {!sent ? (
                  <>
                    {/* Step header */}
                    <AnimatePresence mode="wait" custom={dir}>
                      <motion.div
                        key={`h-${step}`}
                        custom={dir}
                        variants={slide}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.24, ease: "easeOut" }}
                        className="mb-6"
                      >
                        <h3 className="text-xl font-bold">
                          {step === 1 && "What do you need help with?"}
                          {step === 2 && !isOther && "When do you want to start?"}
                          {step === 2 &&  isOther && "Tell us more about your idea"}
                          {step === 3 && "Almost there - your details"}
                        </h3>
                        <p className="mt-1 text-sm text-white/50">
                          Step {step} of {totalSteps} -{" "}
                          {step === 3 ? "enter your info" : "pick one"}
                        </p>
                      </motion.div>
                    </AnimatePresence>

                    {/* Step body */}
                    <div className="flex-1">
                      <AnimatePresence mode="wait" custom={dir}>

                        {/* Step 1 - service */}
                        {step === 1 && (
                          <motion.div key="s1" custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.24, ease: "easeOut" }}>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                              {SERVICES.map(({ id, label, icon: Icon, desc }) => {
                                const active = sel.service === id;
                                return (
                                  <motion.button
                                    key={id}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setSel(s => ({ ...s, service: id }))}
                                    className={`group relative rounded-2xl border p-4 text-left transition-all duration-200 ${
                                      active
                                        ? "border-primary/60 bg-primary/12"
                                        : "border-white/8 bg-white/3 hover:border-primary/30 hover:bg-white/5"
                                    }`}
                                  >
                                    {active && (
                                      <motion.div
                                        layoutId="sel-ring"
                                        className="absolute inset-0 rounded-2xl border-2 border-primary/60"
                                        transition={{ type: "spring", stiffness: 340, damping: 28 }}
                                      />
                                    )}
                                    <Icon className={`h-5 w-5 mb-2.5 transition-colors ${active ? "text-primary" : "text-white/40 group-hover:text-primary"}`} strokeWidth={1.6} />
                                    <p className="font-semibold text-sm leading-snug text-white">{label}</p>
                                    <p className="mt-1 text-xs leading-snug text-white/45">{desc}</p>
                                  </motion.button>
                                );
                              })}
                            </div>

                            {/* Direct-contact fallback */}
                            <div className={`mt-4 rounded-xl border p-4 transition-all duration-200 ${
                              isDirect ? "border-primary/30 bg-primary/6" : "border-white/8 bg-white/3"
                            }`}>
                              <p className="mb-3 text-sm text-white/60 leading-snug">
                                Can't find what you're looking for?{" "}
                                <span className="text-white/85">Let our team member reach out to you.</span>
                              </p>
                              <div className="grid gap-2 sm:grid-cols-3">
                                {[
                                  { key: "dcName",  placeholder: "Your name",      type: "text",  label: "Name"  },
                                  { key: "dcPhone", placeholder: "Phone number",   type: "tel",   label: "Phone" },
                                  { key: "dcEmail", placeholder: "Email address",  type: "email", label: "Email" },
                                ].map(({ key, placeholder, type, label }) => (
                                  <label key={key} className="sr-only-label block">
                                    <span className="sr-only">{label}</span>
                                    <input
                                      type={type}
                                      value={sel[key as "dcName" | "dcPhone" | "dcEmail"]}
                                      onChange={e => setSel(s => ({ ...s, [key]: e.target.value, service: null }))}
                                      placeholder={placeholder}
                                      aria-label={label}
                                      className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none transition"
                                    />
                                  </label>
                                ))}
                              </div>
                              {isDirect && submitError && (
                                <p className="mt-3 text-sm text-red-400">{submitError}</p>
                              )}
                            </div>
                          </motion.div>
                        )}

                        {/* Step 2 - timeline */}
                        {step === 2 && !isOther && (
                          <motion.div key="s2" custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.24, ease: "easeOut" }}>
                            <div className="grid grid-cols-2 gap-3">
                              {TIMELINES.map(({ id, label, sub }) => {
                                const active = sel.timeline === id;
                                return (
                                  <motion.button
                                    key={id}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setSel(s => ({ ...s, timeline: id }))}
                                    className={`relative rounded-2xl border p-5 text-left transition-all duration-200 ${
                                      active
                                        ? "border-primary/60 bg-primary/12"
                                        : "border-white/8 bg-white/3 hover:border-primary/30 hover:bg-white/5"
                                    }`}
                                  >
                                    {active && (
                                      <motion.div layoutId="sel-ring-2" className="absolute inset-0 rounded-2xl border-2 border-primary/60" transition={{ type: "spring", stiffness: 340, damping: 28 }} />
                                    )}
                                    <p className="font-semibold text-white">{label}</p>
                                    <p className="mt-1 text-xs text-white/45">{sub}</p>
                                  </motion.button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}

                        {/* Step 2 - other textarea */}
                        {step === 2 && isOther && (
                          <motion.div key="s2-other" custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.24, ease: "easeOut" }}>
                            <textarea
                              rows={7}
                              value={sel.other}
                              onChange={e => setSel(s => ({ ...s, other: e.target.value }))}
                              placeholder="e.g. We need an internal tool that tracks client jobs and sends automated follow-ups..."
                              className="w-full rounded-xl bg-white/4 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition resize-none"
                            />
                          </motion.div>
                        )}

                        {/* Final step - contact details */}
                        {step === 3 && (
                          <motion.div key="s4" custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.24, ease: "easeOut" }}>
                            <p className="mb-5 text-sm text-white/50 leading-relaxed">
                              Enter your details and we'll send a personalised plan within one business day.
                            </p>
                            <form
                              id="contact-form"
                              onSubmit={(e) => {
                                e.preventDefault();
                                const data = new FormData(e.currentTarget);
                                submitLead({
                                  service:  sel.service,
                                  timeline: sel.timeline,
                                  other:    sel.other,
                                  name:  String(data.get("name")  ?? ""),
                                  phone: String(data.get("phone") ?? ""),
                                  email: String(data.get("email") ?? ""),
                                });
                              }}
                              className="space-y-4"
                            >
                              <div className="grid sm:grid-cols-2 gap-4">
                                <Field label="Name"  name="name" />
                                <Field label="Email" name="email" type="email" />
                              </div>
                              <Field label="Phone (optional)" name="phone" type="tel" required={false} />
                              {submitError && (
                                <p className="text-sm text-red-400">{submitError}</p>
                              )}
                            </form>
                          </motion.div>
                        )}

                      </AnimatePresence>
                    </div>

                    {/* Bottom action row */}
                    <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/6 pt-6">
                      {step > 1 ? (
                        <button
                          onClick={() => go(step - 1)}
                          className="text-sm text-white/40 hover:text-white transition-colors"
                        >
                          ← Back
                        </button>
                      ) : <div />}

                      {step === 3 ? (
                        <button
                          type="submit"
                          form="contact-form"
                          disabled={submitting}
                          className="group inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3 text-sm font-semibold text-white shadow-glow transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {submitting ? "Sending…" : "Send my roadmap"}
                          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                        </button>
                      ) : (
                        <motion.button
                          whileHover={canContinue && !submitting ? { scale: 1.02 } : {}}
                          whileTap={canContinue && !submitting  ? { scale: 0.97 } : {}}
                          onClick={canContinue && !submitting ? advance : undefined}
                          className={`inline-flex items-center gap-2 rounded-full border px-7 py-3 text-sm font-semibold transition-all duration-300 ${
                            canContinue && !submitting
                              ? "border-primary/50 bg-primary/10 text-white hover:bg-primary/18 cursor-pointer"
                              : "border-white/10 bg-white/4 text-white/35 cursor-not-allowed"
                          }`}
                        >
                          {isDirect ? (submitting ? "Sending…" : "Get a callback") : "Continue"}
                          <ArrowUpRight className={`h-4 w-4 transition-all ${canContinue ? "text-primary" : "text-white/20"}`} />
                        </motion.button>
                      )}
                    </div>
                  </>
                ) : (
                  /* Success */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="relative flex-1 min-h-120 overflow-visible sm:min-h-136"
                  >
                    {/* Mascot - behind text */}
                    <motion.img
                      src="/Ethan%20view%203.webp"
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-24.75 left-1/2 -translate-x-1/2 z-0 h-[40.824rem] w-auto object-contain object-bottom sm:left-auto sm:translate-x-0 sm:right-0 sm:h-[46.656rem]"
                      loading="lazy"
                      decoding="async"
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.65, delay: 0.5, ease: "easeOut" }}
                    />

                    {/* Check + "You're all set!" - right side near thumb */}
                    <motion.div
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                      className="absolute top-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 text-center sm:left-auto sm:translate-x-0 sm:right-6"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.25, type: "spring", stiffness: 260, damping: 20 }}
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15"
                      >
                        <Check className="h-6 w-6 text-primary" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.5)]">
                        You're all set!
                      </h3>
                    </motion.div>

                    {/* Paragraph - bottom center, under the mascot */}
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
                      className="absolute -bottom-1.5 left-0 right-0 z-10 text-center text-white/90 text-lg leading-relaxed px-8"
                    >
                      We've received your details and will send your personalised roadmap within one business day.
                    </motion.p>
                  </motion.div>
                )}
              </div>

            </div>
          </Reveal>
        </div>

      </section>
    </SiteLayout>
  );
}

function Field({ label, name, type = "text", required = true }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-white/50" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
      />
    </div>
  );
}
