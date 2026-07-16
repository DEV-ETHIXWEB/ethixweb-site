import { createFileRoute } from "@tanstack/react-router";
import { jsonLdStringify } from "@/lib/json-ld";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Container } from "@/components/Container";
import { GlowBlob } from "@/components/GlowBlob";
import { useTheme } from "@/components/ThemeProvider";
import { SystemConstellation } from "@/components/SystemConstellation";
import { WebSpotlight } from "@/components/WebSpotlight";
import { trackWebSpotlight } from "@/lib/web-spotlight";
import { formLabelClass, formInputClass } from "@/lib/form-styles";
import {
  Mail,
  MapPin,
  ArrowUpRight,
  Bot,
  Globe2,
  Cable,
  Search,
  Code2,
  MessageSquare,
  Check,
  Building2,
} from "lucide-react";

// ── Data ─────────────────────────────────────────────────────────────────────

const SERVICES = [
  { id: "website", label: "Website", icon: Globe2, desc: "Landing pages & business sites" },
  { id: "ai", label: "AI Automation", icon: Bot, desc: "Chatbots, agents & workflows" },
  { id: "crm", label: "CRM & Integrations", icon: Cable, desc: "HubSpot, GoHighLevel, Zapier" },
  { id: "seo", label: "SEO & Ads", icon: Search, desc: "Organic growth & paid campaigns" },
  { id: "webapp", label: "Web Application", icon: Code2, desc: "Portals, dashboards & tools" },
  { id: "other", label: "Something else", icon: MessageSquare, desc: "Tell us in your own words" },
] as const;

const TIMELINES = [
  { id: "asap", label: "ASAP", sub: "Under 2 weeks" },
  { id: "month", label: "This month", sub: "2–4 weeks" },
  { id: "quarter", label: "This quarter", sub: "1–3 months" },
  { id: "planning", label: "Just planning", sub: "3+ months out" },
] as const;

// Keep ids in sync with HEAR_ABOUT_LABELS in src/lib/email.ts - the id is
// what gets submitted; the server maps it back to a display label.
const HEAR_ABOUT_OPTIONS = [
  { id: "google", label: "Google search" },
  { id: "referral", label: "Referral / word of mouth" },
  { id: "social", label: "Social media" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "repeat", label: "Worked with us before" },
  { id: "other", label: "Other" },
] as const;

// Faint floating accent dots echoing the Hero's starfield - cheap (no canvas/JS),
// purely decorative, and reinforces the same premium atmosphere on this page.
const FLOAT_DOTS = [
  { top: "10%", left: "82%", size: 4, blur: 6 },
  { top: "78%", left: "88%", size: 5, blur: 7 },
  { top: "60%", left: "6%", size: 4, blur: 6 },
  { top: "26%", left: "10%", size: 3, blur: 4 },
] as const;

type ServiceId = (typeof SERVICES)[number]["id"];
type TimelineId = (typeof TIMELINES)[number]["id"];

// ── Variants ─────────────────────────────────────────────────────────────────

const slide = {
  enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
};

// ── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact - Ethixweb" },
      {
        name: "description",
        content:
          "Tell us about your project and get a personalised roadmap within one business day.",
      },
      { property: "og:title", content: "Contact Ethixweb" },
      { property: "og:description", content: "Start a project with our team." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://ethixweb.com/ethixweb.png" },
      { property: "og:url", content: "https://ethixweb.com/contact" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Contact Ethixweb" },
      {
        name: "twitter:description",
        content:
          "Tell us about your project and get a personalised roadmap within one business day.",
      },
      { name: "twitter:image", content: "https://ethixweb.com/ethixweb.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://ethixweb.com/contact" }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLdStringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact Ethixweb",
          url: "https://ethixweb.com/contact",
          description:
            "Tell us about your project and get a personalised roadmap within one business day.",
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

// useTheme() only resolves the real theme for components rendered inside
// SiteLayout's ThemeProvider - this wrapper exists so ContactBody is a true
// descendant of it (SiteLayout renders ThemeProvider around its children).
function Contact() {
  return (
    <SiteLayout>
      <ContactBody />
    </SiteLayout>
  );
}

function ContactBody() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const reduceMotion = useReducedMotion();
  const stepDotBorder = isDark ? "rgba(255,255,255,0.15)" : "rgba(16,15,20,0.18)";
  const stepLineBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(16,15,20,0.1)";

  // Spotlight tracking for the left panel's web: the CSS vars are written
  // directly to the DOM (not React state) so the reveal follows the cursor
  // at 60fps without re-rendering the panel on every mousemove.
  const webPanelRef = useRef<HTMLDivElement>(null);
  const [webHover, setWebHover] = useState(false);

  useEffect(() => {
    const el = webPanelRef.current;
    if (!el || reduceMotion) return;
    let raf = 0;
    let pendingX = 50;
    let pendingY = 50;
    const flush = () => {
      el.style.setProperty("--spot-x", `${pendingX}%`);
      el.style.setProperty("--spot-y", `${pendingY}%`);
      raf = 0;
    };
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      pendingX = ((e.clientX - rect.left) / rect.width) * 100;
      pendingY = ((e.clientY - rect.top) / rect.height) * 100;
      if (!raf) raf = requestAnimationFrame(flush);
    };
    el.addEventListener("mousemove", onMove);
    return () => {
      el.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("preview") === "success") {
      setSent(true);
    }
  }, []);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sel, setSel] = useState<{
    service: ServiceId | null;
    timeline: TimelineId | null;
    other: string;
    dcName: string;
    dcPhone: string;
    dcEmail: string;
  }>({ service: null, timeline: null, other: "", dcName: "", dcPhone: "", dcEmail: "" });

  const isOther = sel.service === "other";
  // Direct-contact path: bottom fields filled, no card selected
  const isDirect = !sel.service && !!(sel.dcName.trim() && sel.dcEmail.trim());

  const stepLabels = isOther
    ? ["What do you need", "Tell us more", "Your details"]
    : ["What do you need", "Your timeline", "Your details"];
  const totalSteps = stepLabels.length;

  const canContinue =
    (step === 1 && (!!sel.service || isDirect)) ||
    (step === 2 && !isOther && !!sel.timeline) ||
    (step === 2 && isOther && !!sel.other.trim()) ||
    step === 3;

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const submitLead = async (payload: {
    service?: string | null;
    timeline?: string | null;
    other?: string;
    name: string;
    phone?: string;
    email: string;
    company?: string;
    hearAbout?: string;
  }) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Request failed");
      }
      setSent(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please email info@ethixweb.com directly.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const advance = () => {
    if (step === 1 && isDirect) {
      go(totalSteps);
      submitLead({ name: sel.dcName, phone: sel.dcPhone, email: sel.dcEmail });
      return;
    }
    go(step + 1);
  };

  // Status label shown at bottom-left
  const status = sent ? "SENT ✓" : canContinue ? "READY TO CONTINUE" : "WAITING FOR YOU";

  return (
    <>
      <PageHero eyebrow="Contact" title="Let's get you more booked jobs.">
        Tell us about your business. We'll reply within one business day with a clear, no jargon
        plan.
      </PageHero>

      <section className="relative overflow-hidden py-16 sm:py-20">
        <GlowBlob size="lg" color="brand" blur={140} className="-left-20 top-0" />
        <GlowBlob size="md" color="primary" blur={120} className="-right-10 bottom-0" />

        <Container>
          <Reveal>
            <div className="relative grid overflow-hidden rounded-[2rem] shadow-elegant lg:grid-cols-[1fr_1.55fr]">
              <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />

              {/* ── Left panel ── */}
              <div
                ref={webPanelRef}
                onMouseEnter={() => setWebHover(true)}
                onMouseLeave={() => setWebHover(false)}
                className="relative flex flex-col justify-between overflow-hidden bg-gradient-hero px-8 py-10 text-foreground sm:px-10 sm:py-12"
              >
                {/* ambient glow */}
                <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-primary/30 blur-[90px]" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-primary/10 blur-[70px]" />
                {/* faint resting web, barely visible */}
                <WebTexture
                  isDark={isDark}
                  className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
                />
                {/* live web that only reveals inside a soft spotlight following
                    the cursor - hidden until the panel is hovered */}
                {!reduceMotion && (
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    animate={{ opacity: webHover ? 1 : 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    style={{
                      WebkitMaskImage:
                        "radial-gradient(circle 170px at var(--spot-x, 50%) var(--spot-y, 50%), black 0%, transparent 100%)",
                      maskImage:
                        "radial-gradient(circle 170px at var(--spot-x, 50%) var(--spot-y, 50%), black 0%, transparent 100%)",
                    }}
                  >
                    <WebTexture isDark={isDark} bright animated className="h-full w-full" />
                  </motion.div>
                )}
                {/* floating particle accents */}
                {FLOAT_DOTS.map((dot, i) => (
                  <span
                    key={i}
                    className="pointer-events-none absolute rounded-full bg-primary"
                    style={{
                      top: dot.top,
                      left: dot.left,
                      width: dot.size,
                      height: dot.size,
                      boxShadow: `0 0 ${dot.blur}px ${dot.blur / 2}px rgba(192,39,45,0.55)`,
                      opacity: 0.55,
                    }}
                  />
                ))}

                <div className="relative z-20">
                  <h2 className="text-4xl font-extrabold leading-tight text-gradient pb-1">
                    Let's build something
                    <br />
                    <span className="text-primary">worth building.</span>
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    Tell us what you need. We'll shape it with you.
                  </p>

                  {/* Vertical step tracker */}
                  <div className="mt-10">
                    {stepLabels.map((label, i) => {
                      const done = i + 1 < step;
                      const active = i + 1 === step;
                      const pending = i + 1 > step;
                      return (
                        <div key={label} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <motion.div
                              animate={{
                                backgroundColor:
                                  done || active ? "var(--color-primary)" : "transparent",
                                borderColor:
                                  done || active ? "var(--color-primary)" : stepDotBorder,
                                boxShadow:
                                  done || active
                                    ? "0 0 14px rgba(192,39,45,0.55)"
                                    : "0 0 0 rgba(0,0,0,0)",
                              }}
                              transition={{ duration: 0.3 }}
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold"
                            >
                              {done ? (
                                <Check className="h-3.5 w-3.5 text-primary-foreground" />
                              ) : (
                                <span
                                  className={
                                    active ? "text-primary-foreground" : "text-muted-foreground"
                                  }
                                >
                                  {i + 1}
                                </span>
                              )}
                            </motion.div>
                            {i < stepLabels.length - 1 && (
                              <motion.div
                                animate={{
                                  backgroundColor: done ? "rgba(192,39,45,0.45)" : stepLineBg,
                                }}
                                transition={{ duration: 0.4 }}
                                className="my-1 w-px"
                                style={{ height: 28 }}
                              />
                            )}
                          </div>
                          <p
                            className={`mb-0 pb-6 pt-0.5 text-sm font-medium transition-all duration-300 leading-none ${
                              active
                                ? "text-foreground"
                                : done
                                  ? "text-muted-foreground"
                                  : pending
                                    ? "text-muted-foreground"
                                    : ""
                            }`}
                          >
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
                      status === "WAITING FOR YOU"
                        ? "text-muted-foreground"
                        : status === "SENT ✓"
                          ? "text-primary"
                          : "text-primary/80"
                    }`}
                  >
                    {status}
                  </motion.p>
                  {/* Border line - behind the system graphic */}
                  <div className="relative z-0 border-t border-border" />
                  <div className="relative z-20 space-y-3 pt-2">
                    {[
                      { i: Mail, v: "info@ethixweb.com" },
                      { i: Building2, v: "Ethixweb USA LLC · Wyoming, US" },
                      { i: MapPin, v: "Mon–Fri · 9 AM – 5 PM" },
                    ].map(({ i: I, v }) => (
                      <div
                        key={v}
                        className="flex items-center gap-2.5 text-xs text-muted-foreground"
                      >
                        <I className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        {v}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Right panel ── */}
              <div className="relative flex flex-col overflow-hidden bg-gradient-hero px-8 py-10 text-foreground sm:px-10 sm:py-12">
                <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
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
                        className="relative z-10 mb-6"
                      >
                        <h3 className="text-xl font-bold">
                          {step === 1 && "What do you need help with?"}
                          {step === 2 && !isOther && "When do you want to start?"}
                          {step === 2 && isOther && "Tell us more about your idea"}
                          {step === 3 && "Almost there: your details"}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Step {step} of {totalSteps} ·{" "}
                          {step === 3 ? "enter your info" : "pick one"}
                        </p>
                      </motion.div>
                    </AnimatePresence>

                    {/* Step body */}
                    <div className="relative z-10 flex-1">
                      <AnimatePresence mode="wait" custom={dir}>
                        {/* Step 1 - service */}
                        {step === 1 && (
                          <motion.div
                            key="s1"
                            custom={dir}
                            variants={slide}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.24, ease: "easeOut" }}
                          >
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                              {SERVICES.map(({ id, label, icon: Icon, desc }, index) => {
                                const active = sel.service === id;
                                return (
                                  <motion.button
                                    key={id}
                                    type="button"
                                    aria-pressed={active}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0, scale: active ? 1.015 : 1 }}
                                    transition={{
                                      opacity: {
                                        duration: 0.24,
                                        delay: index * 0.035,
                                        ease: "easeOut",
                                      },
                                      y: { duration: 0.24, delay: index * 0.035, ease: "easeOut" },
                                      scale: { duration: 0.22, ease: "easeOut" },
                                    }}
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setSel((s) => ({ ...s, service: id }))}
                                    onMouseMove={trackWebSpotlight}
                                    className={`web-card group relative rounded-2xl p-4 text-left transition-all duration-200 premium-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                                      active ? "option-card-selected" : ""
                                    }`}
                                  >
                                    <WebSpotlight />
                                    {active && (
                                      <span
                                        style={{ position: "absolute" }}
                                        className="right-3 top-3 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
                                      >
                                        <Check className="h-3 w-3" strokeWidth={3} />
                                      </span>
                                    )}
                                    <Icon
                                      className={`relative h-5 w-5 mb-2.5 transition-colors ${active ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}
                                      strokeWidth={1.6}
                                    />
                                    <p className="relative font-semibold text-sm leading-snug text-foreground">
                                      {label}
                                    </p>
                                    <p className="relative mt-1 text-xs leading-snug text-muted-foreground">
                                      {desc}
                                    </p>
                                  </motion.button>
                                );
                              })}
                            </div>

                            {/* Direct-contact fallback */}
                            <div
                              className={`glass mt-4 rounded-xl p-4 transition-all duration-200 ${
                                isDirect ? "option-card-selected" : ""
                              }`}
                            >
                              <p className="mb-3 text-sm leading-snug text-muted-foreground">
                                Can't find what you're looking for?{" "}
                                <span className="text-foreground">
                                  Let our team member reach out to you.
                                </span>
                              </p>
                              <div className="grid gap-2 sm:grid-cols-3">
                                {[
                                  {
                                    key: "dcName",
                                    placeholder: "Your name",
                                    type: "text",
                                    label: "Name",
                                  },
                                  {
                                    key: "dcPhone",
                                    placeholder: "Phone number",
                                    type: "tel",
                                    label: "Phone",
                                  },
                                  {
                                    key: "dcEmail",
                                    placeholder: "Email address",
                                    type: "email",
                                    label: "Email",
                                  },
                                ].map(({ key, placeholder, type, label }) => (
                                  <label key={key} className="sr-only-label block">
                                    <span className="sr-only">{label}</span>
                                    <input
                                      type={type}
                                      value={sel[key as "dcName" | "dcPhone" | "dcEmail"]}
                                      onChange={(e) =>
                                        setSel((s) => ({
                                          ...s,
                                          [key]: e.target.value,
                                          service: null,
                                        }))
                                      }
                                      placeholder={placeholder}
                                      aria-label={label}
                                      className="w-full rounded-lg border border-border bg-input/60 px-3 py-2 text-base sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/25 transition"
                                    />
                                  </label>
                                ))}
                              </div>
                              {isDirect && submitError && (
                                <p role="alert" className="mt-3 text-sm text-error-text">
                                  {submitError}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}

                        {/* Step 2 - timeline */}
                        {step === 2 && !isOther && (
                          <motion.div
                            key="s2"
                            custom={dir}
                            variants={slide}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.24, ease: "easeOut" }}
                          >
                            <div className="grid grid-cols-2 gap-3">
                              {TIMELINES.map(({ id, label, sub }, index) => {
                                const active = sel.timeline === id;
                                return (
                                  <motion.button
                                    key={id}
                                    type="button"
                                    aria-pressed={active}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0, scale: active ? 1.015 : 1 }}
                                    transition={{
                                      opacity: {
                                        duration: 0.24,
                                        delay: index * 0.04,
                                        ease: "easeOut",
                                      },
                                      y: { duration: 0.24, delay: index * 0.04, ease: "easeOut" },
                                      scale: { duration: 0.22, ease: "easeOut" },
                                    }}
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setSel((s) => ({ ...s, timeline: id }))}
                                    onMouseMove={trackWebSpotlight}
                                    className={`group premium-card relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                                      active ? "option-card-selected" : ""
                                    }`}
                                  >
                                    <WebSpotlight />
                                    {active && (
                                      <span
                                        style={{ position: "absolute" }}
                                        className="right-3 top-3 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
                                      >
                                        <Check className="h-3 w-3" strokeWidth={3} />
                                      </span>
                                    )}
                                    <p className="font-semibold text-foreground">{label}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
                                  </motion.button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}

                        {/* Step 2 - other textarea */}
                        {step === 2 && isOther && (
                          <motion.div
                            key="s2-other"
                            custom={dir}
                            variants={slide}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.24, ease: "easeOut" }}
                          >
                            <textarea
                              rows={7}
                              value={sel.other}
                              onChange={(e) => setSel((s) => ({ ...s, other: e.target.value }))}
                              placeholder="e.g. We need an internal tool that tracks client jobs and sends automated follow ups..."
                              aria-label="Tell us more about your idea"
                              className="w-full rounded-xl border border-border bg-input/60 px-4 py-3 text-base sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition resize-none"
                            />
                          </motion.div>
                        )}

                        {/* Final step - contact details */}
                        {step === 3 && (
                          <motion.div
                            key="s4"
                            custom={dir}
                            variants={slide}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.24, ease: "easeOut" }}
                          >
                            <p className="mb-5 text-sm text-muted-foreground leading-relaxed">
                              Enter your details and we'll send a personalised plan within one
                              business day.
                            </p>
                            <form
                              id="contact-form"
                              onSubmit={(e) => {
                                e.preventDefault();
                                const data = new FormData(e.currentTarget);
                                submitLead({
                                  service: sel.service,
                                  timeline: sel.timeline,
                                  // "Something else" collects details in step 2;
                                  // every other path via the optional textarea here.
                                  other: sel.other || String(data.get("details") ?? ""),
                                  name: String(data.get("name") ?? ""),
                                  phone: String(data.get("phone") ?? ""),
                                  email: String(data.get("email") ?? ""),
                                  company: String(data.get("company") ?? ""),
                                  hearAbout: String(data.get("hearAbout") ?? ""),
                                });
                              }}
                              className="space-y-4"
                            >
                              <div className="grid sm:grid-cols-2 gap-4">
                                <Field label="Name" name="name" />
                                <Field label="Email" name="email" type="email" />
                              </div>
                              <div className="grid sm:grid-cols-2 gap-4">
                                <Field
                                  label="Phone (optional)"
                                  name="phone"
                                  type="tel"
                                  required={false}
                                />
                                <Field label="Company (optional)" name="company" required={false} />
                              </div>
                              {!isOther && (
                                <div>
                                  <label className={formLabelClass} htmlFor="details">
                                    Project details (optional)
                                  </label>
                                  <textarea
                                    id="details"
                                    name="details"
                                    rows={3}
                                    placeholder="Anything else we should know?"
                                    className={`${formInputClass} resize-none`}
                                  />
                                </div>
                              )}
                              <div>
                                <label className={formLabelClass} htmlFor="hearAbout">
                                  How did you hear about us? (optional)
                                </label>
                                <select
                                  id="hearAbout"
                                  name="hearAbout"
                                  defaultValue=""
                                  className={formInputClass}
                                >
                                  <option value="">Select an option</option>
                                  {HEAR_ABOUT_OPTIONS.map(({ id, label }) => (
                                    <option key={id} value={id}>
                                      {label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              {submitError && (
                                <p role="alert" className="text-sm text-error-text">
                                  {submitError}
                                </p>
                              )}
                            </form>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Bottom action row */}
                    <div className="relative z-10 mt-8 flex items-center justify-between gap-4 border-t border-border pt-6">
                      {step > 1 ? (
                        <button
                          onClick={() => go(step - 1)}
                          className="-ml-2 px-2 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          ← Back
                        </button>
                      ) : (
                        <div />
                      )}

                      {step === 3 ? (
                        <button
                          type="submit"
                          form="contact-form"
                          disabled={submitting}
                          className="shine-cta magnetic group inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3 text-sm font-semibold text-white shadow-glow transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {submitting ? "Sending…" : "Send my roadmap"}
                          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                        </button>
                      ) : (
                        <motion.button
                          whileHover={canContinue && !submitting ? { scale: 1.02 } : {}}
                          whileTap={canContinue && !submitting ? { scale: 0.97 } : {}}
                          onClick={canContinue && !submitting ? advance : undefined}
                          className={`shine-cta inline-flex items-center gap-2 rounded-full border px-7 py-3 text-sm font-bold transition-all duration-300 ${
                            canContinue && !submitting
                              ? "border-primary bg-primary text-primary-foreground shadow-glow hover:bg-primary/90 cursor-pointer"
                              : "border-border bg-foreground/5 text-muted-foreground/60 cursor-not-allowed"
                          }`}
                        >
                          {isDirect ? (submitting ? "Sending…" : "Get a callback") : "Continue"}
                          <ArrowUpRight
                            className={`h-4 w-4 transition-all ${canContinue ? "text-primary-foreground" : "text-muted-foreground/40"}`}
                          />
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
                    className="relative z-10 flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center sm:min-h-100 sm:px-10"
                  >
                    {/* ambient glow centered behind mascot */}
                    <div className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/15 blur-[90px] sm:h-64 sm:w-64 lg:h-72 lg:w-72" />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.25, type: "spring", stiffness: 260, damping: 20 }}
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 shadow-glow"
                    >
                      <Check className="h-6 w-6 text-primary" />
                    </motion.div>
                    <h3
                      className={`text-2xl font-bold text-foreground ${isDark ? "drop-shadow-[0_0_18px_rgba(255,255,255,0.5)]" : "drop-shadow-[0_0_14px_rgba(192,39,45,0.25)]"}`}
                    >
                      You're all set!
                    </h3>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
                      className="max-w-sm text-lg leading-relaxed text-foreground/90"
                    >
                      We've received your details and will send your personalised roadmap within one
                      business day.
                    </motion.p>
                    <SystemConstellation
                      nodes={stepLabels.map((label) => ({ label }))}
                      className="mt-2 h-40 w-40 opacity-80"
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

// Faint decorative node network - pure background texture, no labels or interactivity
const WEB_NODES: [number, number][] = [
  [12, 8],
  [48, 4],
  [82, 14],
  [96, 42],
  [70, 30],
  [30, 34],
  [6, 52],
  [40, 60],
  [76, 58],
  [94, 78],
  [58, 82],
  [20, 86],
  [4, 96],
  [86, 98],
];
const WEB_LINKS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [1, 4],
  [4, 2],
  [0, 5],
  [4, 5],
  [5, 6],
  [5, 7],
  [4, 8],
  [7, 8],
  [3, 9],
  [8, 9],
  [7, 10],
  [6, 11],
  [10, 11],
  [11, 12],
  [9, 13],
  [10, 13],
];

// Every 3rd strand carries a traveling energy pulse instead of all of them,
// so the motion reads as a few live signals rather than a flashing mesh.
const PULSE_LINKS = WEB_LINKS.filter((_, i) => i % 3 === 0);

function WebTexture({
  className = "",
  isDark = true,
  bright = false,
  animated = false,
}: {
  className?: string;
  isDark?: boolean;
  bright?: boolean;
  animated?: boolean;
}) {
  const lineStroke = bright
    ? isDark
      ? "rgba(224,64,72,0.65)"
      : "rgba(192,39,45,0.5)"
    : "var(--border)";
  const nodeOpacity = bright ? 0.9 : 0.55;

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={className} aria-hidden="true">
      {WEB_LINKS.map(([a, b], i) => (
        <line
          key={i}
          x1={WEB_NODES[a][0]}
          y1={WEB_NODES[a][1]}
          x2={WEB_NODES[b][0]}
          y2={WEB_NODES[b][1]}
          stroke={lineStroke}
          strokeWidth={bright ? "0.45" : "0.3"}
        />
      ))}
      {WEB_NODES.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={bright ? 1.1 : 1}
          fill="var(--primary)"
          opacity={animated ? undefined : nodeOpacity}
        >
          {animated && (
            <animate
              attributeName="opacity"
              values="0.4;0.9;0.4"
              dur={`${2.6 + (i % 4) * 0.4}s`}
              begin={`${i * 0.15}s`}
              repeatCount="indefinite"
            />
          )}
        </circle>
      ))}
      {animated &&
        PULSE_LINKS.map(([a, b], i) => {
          const dur = 3 + (i % 3) * 0.7;
          return (
            <circle
              key={`pulse-${i}`}
              r="1.1"
              fill="var(--primary)"
              filter="drop-shadow(0 0 2.5px rgba(224,64,72,0.9))"
            >
              <animateMotion
                dur={`${dur}s`}
                begin={`${i * 0.6}s`}
                repeatCount="indefinite"
                path={`M${WEB_NODES[a][0]},${WEB_NODES[a][1]} L${WEB_NODES[b][0]},${WEB_NODES[b][1]}`}
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                dur={`${dur}s`}
                begin={`${i * 0.6}s`}
                repeatCount="indefinite"
              />
            </circle>
          );
        })}
    </svg>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className={formLabelClass} htmlFor={name}>
        {label}
      </label>
      <input id={name} name={name} type={type} required={required} className={formInputClass} />
    </div>
  );
}
