import { createFileRoute } from "@tanstack/react-router";
import { jsonLdStringify } from "@/lib/json-ld";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/shared/PageHero";
import { Reveal } from "@/components/shared/Reveal";
import { Container } from "@/components/shared/Container";
import { GlowBlob } from "@/components/shared/GlowBlob";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Turnstile } from "@/components/shared/Turnstile";
import { formLabelClass, formInputClass } from "@/lib/form-styles";
import { trackLeadFormConversion } from "@/lib/gtag";
import { isValidPhone, normalizeWebsiteUrl } from "@/lib/utils";
import { Mail, MapPin, ArrowUpRight, Check, Building2 } from "lucide-react";

// ── Data ─────────────────────────────────────────────────────────────────────

// Amar's three qualifying details are all this form asks for, so the left
// panel explains the process instead of tracking wizard steps.
const NEXT_STEPS = [
  {
    title: "You share three details",
    body: "Your name, your phone number and your website. Nothing else.",
  },
  {
    title: "We study your site",
    body: "How it ranks, how it loads and where it loses people, before we speak.",
  },
  {
    title: "We call you",
    body: "A short call to work out whether we are the right fit for each other.",
  },
] as const;

// Faint floating accent dots echoing the Hero's starfield - cheap (no canvas/JS),
// purely decorative, and reinforces the same premium atmosphere on this page.
const FLOAT_DOTS = [
  { top: "10%", left: "82%", size: 4, blur: 6 },
  { top: "78%", left: "88%", size: 5, blur: 7 },
  { top: "60%", left: "6%", size: 4, blur: 6 },
  { top: "26%", left: "10%", size: 3, blur: 4 },
] as const;

// ── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact - Ethixweb" },
      {
        name: "description",
        content:
          "Share your name, phone number and website, and we'll call you within one business day.",
      },
      { property: "og:title", content: "Contact Ethixweb" },
      { property: "og:description", content: "Start a project with our team." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.ethixweb.com/ethixweb.png" },
      { property: "og:url", content: "https://www.ethixweb.com/contact" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Contact Ethixweb" },
      {
        name: "twitter:description",
        content:
          "Share your name, phone number and website, and we'll call you within one business day.",
      },
      { name: "twitter:image", content: "https://www.ethixweb.com/ethixweb.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://www.ethixweb.com/contact" }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLdStringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact Ethixweb",
          url: "https://www.ethixweb.com/contact",
          description:
            "Share your name, phone number and website, and we'll call you within one business day.",
          mainEntity: {
            "@type": "Organization",
            name: "Ethixweb",
            email: "akash@ethixweb.com",
            url: "https://www.ethixweb.com",
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

  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("preview") === "success") {
      setSent(true);
    }
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRequired = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);

  // The three details that qualify a lead. Everything else about the project
  // is worked out on the call, so nothing else belongs in this form.
  const [form, setForm] = useState({ name: "", phone: "", website: "" });
  const setField = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));
  const ready = Boolean(form.name.trim() && form.phone.trim() && form.website.trim());

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    if (turnstileRequired && !turnstileToken) {
      setSubmitError("Please complete the verification check.");
      return;
    }

    const name = form.name.trim();
    if (!name) {
      setSubmitError("Please enter your name.");
      return;
    }
    // Phone is required on every lead form - it's how we follow up.
    const phone = form.phone.trim();
    if (!isValidPhone(phone)) {
      setSubmitError("Please enter a valid phone number.");
      return;
    }
    // Normalise here as well as on the server so "acme.com" and
    // "https://acme.com" are accepted without the round trip to find out.
    const website = normalizeWebsiteUrl(form.website);
    if (!website) {
      setSubmitError("Please enter a valid website address, like yourbusiness.com.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, website, turnstileToken }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Request failed");
      }
      setSent(true);
      trackLeadFormConversion();
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please email info@ethixweb.com directly.",
      );
      // Turnstile tokens are single-use - clear it so the widget can be
      // reset/re-verified before the user retries.
      setTurnstileToken(null);
    } finally {
      setSubmitting(false);
    }
  };

  // Status label shown at bottom-left
  const status = sent ? "SENT ✓" : ready ? "READY TO SEND" : "WAITING FOR YOU";

  return (
    <>
      <PageHero eyebrow="Contact" title="Let's get you more booked jobs.">
        Three details is all we need to get started. We'll look at your website and call you within
        one business day.
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
                    Three details now. The real conversation happens on the call.
                  </p>

                  {/* What happens next */}
                  <div className="mt-10">
                    {NEXT_STEPS.map((item, i) => (
                      <div key={item.title} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary text-xs font-bold text-primary-foreground"
                            style={{ boxShadow: "0 0 14px rgba(192,39,45,0.55)" }}
                          >
                            {i + 1}
                          </div>
                          {i < NEXT_STEPS.length - 1 && (
                            <div
                              className="my-1 w-px"
                              style={{ height: 40, background: "rgba(192,39,45,0.45)" }}
                            />
                          )}
                        </div>
                        <div className="mb-0 pb-6 pt-0.5">
                          <p className="text-sm font-medium leading-none text-foreground">
                            {item.title}
                          </p>
                          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                            {item.body}
                          </p>
                        </div>
                      </div>
                    ))}
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
                      { i: MapPin, v: "Mon-Fri · 9 AM - 5 PM" },
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
                    {/* Form header */}
                    <div className="relative z-10 mb-6">
                      <h3 className="text-xl font-bold">Tell us where to call you.</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Three details &middot; about 20 seconds
                      </p>
                    </div>

                    {/* Form body */}
                    <div className="relative z-10 flex-1">
                      <form id="contact-form" onSubmit={onSubmit} className="space-y-4">
                        <Field
                          label="Name"
                          name="name"
                          autoComplete="name"
                          placeholder="Jane Smith"
                          value={form.name}
                          onChange={(v) => setField("name", v)}
                        />
                        <Field
                          label="Phone"
                          name="phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="+1 555 123 4567"
                          value={form.phone}
                          onChange={(v) => setField("phone", v)}
                        />
                        <Field
                          label="Website"
                          name="website"
                          inputMode="url"
                          autoComplete="url"
                          placeholder="yourbusiness.com"
                          value={form.website}
                          onChange={(v) => setField("website", v)}
                        />
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          We go through your website before the call, so the first conversation
                          starts with what's actually costing you jobs.
                        </p>
                        {turnstileRequired && (
                          <Turnstile
                            theme={isDark ? "dark" : "light"}
                            onVerify={setTurnstileToken}
                            onExpire={() => setTurnstileToken(null)}
                          />
                        )}
                        {submitError && (
                          <p id="submit-error" role="alert" className="text-sm text-error-text">
                            {submitError}
                          </p>
                        )}
                      </form>
                    </div>

                    {/* Bottom action row */}
                    <div className="relative z-10 mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
                      <p className="text-xs text-muted-foreground">
                        One call. No drip sequence, no spam.
                      </p>
                      <button
                        type="submit"
                        form="contact-form"
                        disabled={submitting || (turnstileRequired && !turnstileToken)}
                        aria-busy={submitting}
                        aria-describedby={submitError ? "submit-error" : undefined}
                        className="shine-cta magnetic group inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-brand px-7 py-3 text-sm font-semibold text-white shadow-glow transition disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <span aria-live="polite">{submitting ? "Sending…" : "Book my call"}</span>
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                      </button>
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
                      We've got your details and we're already looking at your website. Expect a
                      call within one business day.
                    </motion.p>
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
  inputMode,
  autoComplete,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  inputMode?: "tel" | "url";
  autoComplete?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className={formLabelClass} htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={formInputClass}
      />
    </div>
  );
}
