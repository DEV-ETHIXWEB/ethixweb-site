import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Instagram,
  Linkedin,
  Facebook,
  Lock,
  Unlock,
  ShieldCheck,
  ArrowUpRight,
  MessageCircle,
  QrCode,
  Copy,
  Check,
  ChevronDown,
  ScanLine,
  X as XCloseIcon,
} from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { GlowBlob } from "@/components/shared/GlowBlob";
import { hackathonConfig } from "@/lib/hackathon-config";
import { jsonLdStringify } from "@/lib/json-ld";
import { cn } from "@/lib/utils";

// X (formerly Twitter)'s wordmark isn't in lucide-react - a minimal inline
// glyph matching the other platform icons' stroke weight.
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const STORAGE_KEY = "hackathon-unlock-proof";
const HACKATHON_URL = "https://www.ethixweb.com/hackathon";
const QR_SRC = "/qr/hackathon.png";

const SOCIALS = [
  {
    key: "instagram",
    label: "Instagram",
    Icon: Instagram,
    desc: "Design, builds & behind the scenes.",
    qrSrc: "/qr/instagram.png",
    ...hackathonConfig.socialLinks.instagram,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    Icon: Linkedin,
    desc: "Company updates & insights.",
    qrSrc: "/qr/linkedin.png",
    ...hackathonConfig.socialLinks.linkedin,
  },
  {
    key: "facebook",
    label: "Facebook",
    Icon: Facebook,
    desc: "Updates & announcements.",
    qrSrc: "/qr/facebook.png",
    ...hackathonConfig.socialLinks.facebook,
  },
  {
    key: "x",
    label: "X",
    Icon: XIcon,
    desc: "Thoughts, tech & real-time updates.",
    qrSrc: "/qr/x.png",
    ...hackathonConfig.socialLinks.x,
  },
] as const;

type UnlockState = "locked" | "checking" | "error" | "verifying" | "unlocked";

function loadStoredProof(): { token: string; exp: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.token === "string" && typeof parsed?.exp === "number") return parsed;
    return null;
  } catch {
    return null;
  }
}

// Shared page rhythm: every section's content sits inside the same max-width
// + horizontal padding via <Container>, and this wrapper adds the vertical
// spacing scale so no section is left to invent its own py-* value.
function Section({
  id,
  className,
  bleed,
  children,
}: {
  id?: string;
  className?: string;
  bleed?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("relative py-16 sm:py-24", className)}>
      {bleed}
      <Container className="relative">{children}</Container>
    </section>
  );
}

function MissionLabel({ step, children }: { step: string; children: ReactNode }) {
  return (
    <p className="mission-label justify-center">
      Mission {step} &middot; {children}
    </p>
  );
}

const LOG_LINES = [
  "> initializing hackathon.hunt...",
  "> connecting to social channels [4/4]",
  "> instagram :: scanned",
  "> linkedin :: scanned",
  "> facebook :: scanned",
  "> x :: scanned",
  "> hidden code :: location unknown",
  "> awaiting input_",
];

// Types the log out line-by-line, character-by-character, then holds - a
// self-contained effect so it doesn't fight the shared Reveal observer.
// Once unlocked it prints one final confirmation line instead of looping.
function TerminalLog({ unlocked }: { unlocked: boolean }) {
  const reduceMotion = useReducedMotion();
  const [printed, setPrinted] = useState<string[]>(reduceMotion ? LOG_LINES : []);
  const [confirmLine, setConfirmLine] = useState("");

  useEffect(() => {
    if (reduceMotion) return;
    let cancelled = false;
    let lineIndex = 0;
    let charIndex = 0;
    let timer: ReturnType<typeof setTimeout>;

    function tick() {
      if (cancelled || lineIndex >= LOG_LINES.length) return;
      const line = LOG_LINES[lineIndex];
      charIndex += 1;
      setPrinted((prev) => {
        const next = prev.slice(0, lineIndex);
        next[lineIndex] = line.slice(0, charIndex);
        return next;
      });
      if (charIndex >= line.length) {
        lineIndex += 1;
        charIndex = 0;
        timer = setTimeout(tick, 220);
      } else {
        timer = setTimeout(tick, 18);
      }
    }
    timer = setTimeout(tick, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (!unlocked) return;
    const full = "> access granted :: registration unlocked";
    if (reduceMotion) {
      setConfirmLine(full);
      return;
    }
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setConfirmLine(full.slice(0, i));
      if (i >= full.length) clearInterval(timer);
    }, 18);
    return () => clearInterval(timer);
  }, [unlocked, reduceMotion]);

  return (
    <div
      className="font-mono text-[13px] leading-relaxed text-muted-foreground sm:text-sm"
      aria-hidden="true"
    >
      <p className="mission-label mb-5 justify-start">
        <QrCode className="h-3 w-3" aria-hidden="true" />
        mission_03/unlock_access.log
      </p>
      {printed.map((line, i) => (
        <p key={i} className={cn(i === LOG_LINES.length - 1 && !unlocked && "console-cursor")}>
          {line}
        </p>
      ))}
      {unlocked && confirmLine && (
        <p className="console-cursor mt-1 text-primary-text">{confirmLine}</p>
      )}
    </div>
  );
}

type SocialEntry = (typeof SOCIALS)[number];

// Front face: platform info + Visit CTA. Back face: QR to scan the same
// destination from another phone. Flip state is a plain boolean toggled by
// click/tap/Enter/Space - deliberately not CSS :hover - so mouse, touch and
// keyboard all drive the exact same interaction instead of mobile needing a
// separate code path.
function SocialFlipCard({ social, delay }: { social: SocialEntry; delay: number }) {
  const { label, Icon, desc, handle, url, qrSrc } = social;
  const [flipped, setFlipped] = useState(false);
  const disabled = !url;
  const scanBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  function openQr() {
    if (disabled) return;
    setFlipped(true);
    // Move focus onto the now-visible back face so Tab continues in visual
    // order instead of landing on the front face's Visit link, which is
    // still in the DOM but rotated out of view underneath.
    requestAnimationFrame(() => closeBtnRef.current?.focus());
  }

  function closeQr() {
    setFlipped(false);
    requestAnimationFrame(() => scanBtnRef.current?.focus());
  }

  return (
    <Reveal delay={delay}>
      <div
        className={cn("flip-card h-full", disabled && "opacity-70")}
        role="group"
        aria-label={`${label} - ${flipped ? "showing QR code" : "showing profile"}`}
      >
        <div
          className="flip-card-inner"
          style={{ transform: flipped ? "rotateY(180deg)" : undefined }}
        >
          {/* Front */}
          <div className="flip-card-face" aria-hidden={flipped}>
            <div className="premium-card web-card group flex h-full flex-col rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <Icon
                  className={cn(
                    "h-7 w-7 transition-transform duration-300",
                    disabled ? "text-muted-foreground" : "text-primary group-hover:scale-110",
                  )}
                />
                {!disabled && (
                  <button
                    ref={scanBtnRef}
                    type="button"
                    onClick={openQr}
                    tabIndex={flipped ? -1 : 0}
                    aria-label={`Show QR code to scan and open ${label}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <ScanLine className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
              <p className="mt-4 font-display text-lg font-bold text-foreground">{label}</p>
              <p
                className={cn(
                  "mt-1 text-sm font-medium",
                  disabled ? "text-muted-foreground" : "text-primary-text",
                )}
              >
                {handle}
              </p>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{desc}</p>
              {disabled ? (
                <span className="mission-label mt-5 justify-start text-muted-foreground/70">
                  Coming soon
                </span>
              ) : (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  tabIndex={flipped ? -1 : 0}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-primary-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  Visit
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              )}
            </div>
          </div>

          {/* Back: QR */}
          {!disabled && (
            <div className="flip-card-back flip-card-face" aria-hidden={!flipped}>
              <div className="premium-card relative flex h-full flex-col items-center justify-center rounded-2xl p-6 text-center">
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={closeQr}
                  tabIndex={flipped ? 0 : -1}
                  aria-label={`Back to ${label} details`}
                  className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <XCloseIcon className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <p className="mission-label justify-center">Scan to visit</p>
                <div className="mt-4 w-full max-w-[132px] rounded-xl border border-primary/25 bg-white p-2 shadow-[0_0_30px_rgba(192,39,45,0.16)]">
                  <img
                    src={qrSrc}
                    alt={`QR code linking to Ethixweb's ${label} page`}
                    width={600}
                    height={600}
                    className="h-full w-full rounded-md"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <p className="mt-4 text-xs text-muted-foreground">Scan to open our {label}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}

function HackathonPage() {
  const reduceMotion = useReducedMotion();
  const [state, setState] = useState<UnlockState>("locked");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [checkingStoredProof, setCheckingStoredProof] = useState(true);
  const [copied, setCopied] = useState(false);
  const registrationRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Restore a prior unlock (this session/device) by re-confirming the
  // stored proof token server-side, rather than trusting localStorage alone.
  useEffect(() => {
    const stored = loadStoredProof();
    if (!stored) {
      setCheckingStoredProof(false);
      return;
    }
    fetch("/api/hackathon/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stored),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) setState("unlocked");
        else window.localStorage.removeItem(STORAGE_KEY);
      })
      .catch(() => {})
      .finally(() => setCheckingStoredProof(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!code.trim() || state === "checking" || state === "verifying") return;
    setState("checking");
    setError(null);

    try {
      const res = await fetch("/api/hackathon/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.ok) {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ token: data.token, exp: data.exp }),
        );
        // Brief "verifying" beat before the unlocked state lands - the whole
        // sequence (lock -> verify -> unlocked) stays under ~900ms so it
        // reads as a reward, not a loading spinner.
        setState("verifying");
        setTimeout(
          () => {
            setState("unlocked");
            setTimeout(
              () => {
                registrationRef.current?.scrollIntoView({
                  behavior: reduceMotion ? "auto" : "smooth",
                  block: "start",
                });
              },
              reduceMotion ? 0 : 500,
            );
          },
          reduceMotion ? 0 : 420,
        );
      } else {
        setState("error");
        setError(data?.error ?? "That code isn't valid. Try again.");
        setShake(true);
        setTimeout(() => setShake(false), 450);
        inputRef.current?.focus();
      }
    } catch {
      setState("error");
      setError("Something went wrong. Try again.");
      setShake(true);
      setTimeout(() => setShake(false), 450);
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(HACKATHON_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (older browser / no permission) - the URL
      // is already visible as text next to the button, so no fallback needed.
    }
  }

  const unlocked = state === "unlocked";
  const busy = state === "checking" || state === "verifying" || checkingStoredProof;

  return (
    <SiteLayout>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative -mt-24 overflow-hidden bg-gradient-hero pb-20 pt-36 sm:pb-28 sm:pt-44">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <GlowBlob
          size="lg"
          color="primary"
          className="drift-slow top-[-4rem] left-1/2 -translate-x-1/2"
        />
        <Container className="relative text-center">
          <Reveal>
            <p className="mission-label justify-center">Ethixweb Hackathon</p>
            <h1 className="mt-6 font-display text-6xl font-bold uppercase leading-[1.05] text-gradient pb-1 sm:text-8xl">
              Code.
              <br />
              Find.
              <br />
              Unlock.
            </h1>
            <p className="mx-auto mt-7 max-w-xl text-base text-muted-foreground sm:text-lg">
              Something is waiting to be found. Explore Ethixweb across our social channels,
              discover the hidden code, and unlock your path to the Hackathon.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
              <span>{hackathonConfig.date}</span>
              <span className="h-1 w-1 rounded-full bg-primary" />
              <span>Register by {hackathonConfig.registrationDeadline}</span>
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mx-auto mt-14 flex max-w-xs flex-col items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground/70">
              <span className="rounded-full border border-border px-4 py-1.5">Find the code</span>
              <span className="mission-thread h-6" aria-hidden="true" />
              <span className="rounded-full border border-primary/40 px-4 py-1.5 text-primary-text">
                Unlock registration
              </span>
              <motion.a
                href="#mission"
                aria-label="Scroll to start the hunt"
                className="mt-5 flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary-text"
                animate={reduceMotion ? undefined : { y: [0, 5, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.a>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── QR / mission entry ───────────────────────────────────────────── */}
      <Section
        id="mission"
        className="border-t border-border/60"
        bleed={
          <>
            <div className="absolute inset-0 grid-bg opacity-20" />
            <GlowBlob size="md" color="primary" className="top-1/2 right-[8%] -translate-y-1/2" />
          </>
        }
      >
        <Reveal>
          <MissionLabel step="01">Scan to start the hunt</MissionLabel>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <Reveal>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              One scan. One page.
              <br />
              The whole hunt starts here.
            </h2>
            <p className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
              Scan this page to begin your Ethixweb Hackathon journey, or share the link directly.
              Everything you need &mdash; the channels to explore, the code to find, and
              registration itself &mdash; lives on this one page.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-border bg-input/40 px-4 py-2 font-mono text-xs text-muted-foreground sm:text-sm">
                <QrCode className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {HACKATHON_URL.replace("https://", "")}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="btn-secondary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy link
                  </>
                )}
              </button>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="premium-card web-card-feature mx-auto max-w-xs rounded-3xl p-7 text-center sm:p-8">
              <div className="web-corner" aria-hidden="true" />
              <p className="mission-label justify-center">Mission access</p>
              <div className="qr-frame mx-auto mt-5 w-full max-w-[220px] rounded-2xl border border-primary/25 bg-white p-3 shadow-[0_0_50px_rgba(192,39,45,0.18)]">
                <img
                  src={QR_SRC}
                  alt={`QR code linking to the Ethixweb Hackathon page at ${HACKATHON_URL}`}
                  width={600}
                  height={600}
                  className="h-full w-full rounded-lg"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground/70">
                Scan to enter
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ── Social discovery ─────────────────────────────────────────────── */}
      <Section
        className="border-t border-border/60"
        bleed={<div className="absolute inset-0 bg-charcoal/40" />}
      >
        <Reveal>
          <div className="text-center">
            <MissionLabel step="02">Social discovery</MissionLabel>
            <h2 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Find Ethixweb online.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
              Explore our channels and find the hidden code. Tap the scan icon on any card to pull
              up its QR and open it from another phone.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
          {SOCIALS.map((social, i) => (
            <SocialFlipCard key={social.key} social={social} delay={i * 0.06} />
          ))}
        </div>
      </Section>

      {/* ── Clue transition ──────────────────────────────────────────────── */}
      <div className="relative py-6 text-center sm:py-10">
        <Reveal>
          <p className="mx-auto max-w-sm font-display text-xl font-semibold text-foreground sm:text-2xl">
            The clue is out there.
            <br />
            <span className="text-muted-foreground">Look closer.</span>
          </p>
        </Reveal>
      </div>

      {/* ── Mission console: code entry + registration, one wide panel ──────── */}
      <Section
        className="border-t border-border/60"
        bleed={
          <>
            <div className="absolute inset-0 grid-bg opacity-30" />
            <GlowBlob
              size="lg"
              color="primary"
              className={cn(
                "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700",
                unlocked && "opacity-80",
              )}
            />
          </>
        }
      >
        <Reveal>
          <MissionLabel step="03">Unlock access</MissionLabel>
        </Reveal>

        <div
          ref={registrationRef}
          className="relative mt-8 grid grid-cols-1 overflow-hidden rounded-3xl border border-border/70 bg-charcoal/60 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.6)] scroll-mt-24 md:grid-cols-2"
        >
          <div className="console-scanline" aria-hidden="true" />

          {/* Left: ambient terminal log - fills the width with real narrative
              content instead of empty space, and doubles as a visual recap
              of the hunt so far. */}
          <div className="relative border-b border-border/60 p-8 sm:p-10 md:border-b-0 md:border-r md:border-border/60">
            <TerminalLog unlocked={unlocked} />
          </div>

          {/* Right: the actual interactive surface - code form, then morphs
              into the unlocked reward state in place (no separate card). */}
          <div className="relative flex flex-col justify-center p-8 text-center sm:p-10">
            <AnimatePresence mode="wait">
              {!unlocked ? (
                <motion.div
                  key="locked"
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <AnimatePresence mode="wait">
                    {state === "verifying" ? (
                      <motion.div
                        key="verifying"
                        initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25 }}
                      >
                        <ShieldCheck
                          className="mx-auto h-8 w-8 animate-pulse text-primary"
                          aria-hidden="true"
                        />
                        <p className="mt-4 font-mono text-xs uppercase tracking-[0.3em] text-primary-text">
                          Verifying...
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="form"
                        initial={reduceMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25 }}
                      >
                        <Lock className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
                        <h2 className="mt-4 font-display text-2xl font-bold uppercase text-foreground sm:text-3xl">
                          Found the code?
                        </h2>
                        <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground sm:text-base">
                          Somewhere across our social channels, we've hidden a code. Find it. Enter
                          it. Unlock what comes next.
                        </p>

                        <form
                          onSubmit={handleSubmit}
                          className={cn(
                            "mx-auto mt-8 flex max-w-sm flex-col items-stretch gap-3",
                            shake && "code-input-shake",
                          )}
                        >
                          <label htmlFor="hackathon-code" className="sr-only">
                            Enter your code
                          </label>
                          <input
                            ref={inputRef}
                            id="hackathon-code"
                            type="text"
                            inputMode="text"
                            autoComplete="off"
                            autoCapitalize="characters"
                            spellCheck={false}
                            placeholder="Enter your code"
                            value={code}
                            disabled={busy}
                            onChange={(e) => {
                              setCode(e.target.value);
                              if (state === "error") setState("locked");
                            }}
                            aria-invalid={state === "error"}
                            aria-describedby={
                              state === "error" ? "hackathon-code-error" : undefined
                            }
                            className="w-full rounded-xl border border-border bg-input/60 px-4 py-3.5 text-center text-lg uppercase tracking-[0.25em] text-foreground placeholder:text-muted-foreground/60 placeholder:normal-case placeholder:text-sm placeholder:tracking-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                          />
                          <button
                            type="submit"
                            disabled={busy || !code.trim()}
                            className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-bold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {state === "checking" ? "Checking..." : "Unlock registration"}
                          </button>
                        </form>

                        <div aria-live="polite" className="mt-3 min-h-[1.25rem]">
                          {state === "error" && error && (
                            <p
                              id="hackathon-code-error"
                              className="text-sm font-medium text-error-text"
                            >
                              {error}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="unlocked"
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div
                    initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 shadow-[0_0_40px_rgba(192,39,45,0.35)]"
                  >
                    <Unlock className="h-7 w-7 text-primary" aria-hidden="true" />
                  </motion.div>
                  <p className="mission-label mt-4 justify-center">Registration unlocked</p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
                    You're in.
                  </h2>
                  <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground sm:text-base">
                    Prizes: {hackathonConfig.prizes}
                  </p>
                  <a
                    href={hackathonConfig.registrationUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn-primary mt-7 inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 font-bold"
                  >
                    Register now
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Section>

      {/* ── WhatsApp community ───────────────────────────────────────────── */}
      {unlocked && hackathonConfig.whatsappUrl && (
        <Section className="border-t border-border/60 pb-24 sm:pb-32">
          <div className="mx-auto max-w-xl">
            <Reveal>
              <div className="premium-card flex flex-col items-center gap-4 rounded-3xl p-8 text-center sm:p-10">
                <MessageCircle className="h-7 w-7 text-primary" aria-hidden="true" />
                <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                  Stay in the loop.
                </h2>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Join the Ethixweb Hackathon community for announcements, updates, clues and
                  important information.
                </p>
                <a
                  href={hackathonConfig.whatsappUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn-secondary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-bold"
                >
                  Join WhatsApp community
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </Reveal>
          </div>
        </Section>
      )}
    </SiteLayout>
  );
}

export const Route = createFileRoute("/hackathon")({
  component: HackathonPage,
  head: () => ({
    meta: [
      { title: "Ethixweb Hackathon | Code. Find. Unlock." },
      {
        name: "description",
        content:
          "A code is hidden across Ethixweb's social channels. Find it, enter it, and unlock registration for the Ethixweb Hackathon.",
      },
      { property: "og:title", content: "Ethixweb Hackathon | Code. Find. Unlock." },
      {
        property: "og:description",
        content: "Explore Ethixweb's social channels, find the hidden code, unlock registration.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://www.ethixweb.com/ethixweb.png" },
      { property: "og:url", content: "https://www.ethixweb.com/hackathon" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Ethixweb Hackathon | Code. Find. Unlock." },
      {
        name: "twitter:description",
        content: "Explore Ethixweb's social channels, find the hidden code, unlock registration.",
      },
      { name: "twitter:image", content: "https://www.ethixweb.com/ethixweb.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://www.ethixweb.com/hackathon" }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLdStringify({
          "@context": "https://schema.org",
          "@type": "Event",
          name: hackathonConfig.hackathonName,
          description:
            "A code is hidden across Ethixweb's social channels. Find it, enter it, and unlock registration for the Ethixweb Hackathon.",
          url: "https://www.ethixweb.com/hackathon",
          organizer: {
            "@type": "Organization",
            name: "Ethixweb",
            url: "https://www.ethixweb.com",
          },
        }),
      },
    ],
  }),
});
