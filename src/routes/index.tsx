import { lazy, Suspense, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowUpRight,
  Bot,
  BrainCircuit,
  Cable,
  Code2,
  DollarSign,
  Globe2,
  Layers3,
  LifeBuoy,
  Megaphone,
  Palette,
  PhoneCall,
  Search,
  ShieldCheck,
  TrendingUp,
  Workflow,
} from "lucide-react";

const LIVE_PATHS = new Set(["/", "/contact"]);
import { SiteLayout } from "@/components/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { RotatingText } from "@/components/RotatingText";
import { Testimonials } from "@/components/Testimonials";
import { useTheme } from "@/components/ThemeProvider";
import operatorCharacter from "@/assets/operator-character.webp";
import operatorCharacterSm from "@/assets/operator-character-sm.webp";
import operatorCharacterXs from "@/assets/operator-character-xs.webp";

const GlobalNetwork = lazy(() => import("@/components/GlobalNetwork").then((m) => ({ default: m.GlobalNetwork })));

const SLEEP_SRC = "/Untitled%20design%20(38).webp";
const CLOUD_LIGHT = "/LIGHT%20MODE.svg";

function useIsSleeping() {
  const check = () => {
    // Dev/preview override: ?sleep=1 forces after-hours, ?sleep=0 forces awake
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("sleep");
      if (p === "1") return true;
      if (p === "0") return false;
    }
    const h = new Date().getHours();
    return h >= 17 || h < 8;
  };
  // Initialize to a fixed value so the first client render matches the server-rendered
  // markup exactly (avoids a hydration mismatch); the real value is applied post-mount.
  const [sleeping, setSleeping] = useState(false);
  useEffect(() => {
    setSleeping(check());
    const id = setInterval(() => setSleeping(check()), 60_000);
    return () => clearInterval(id);
  }, []);
  return sleeping;
}

function useIsMobile() {
  // Same reasoning as useIsSleeping: start with the SSR-safe default and correct
  // it in an effect, rather than reading window.innerWidth during the initial render.
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    setMobile(window.innerWidth < 1024);
    let t: ReturnType<typeof setTimeout>;
    const handler = () => {
      clearTimeout(t);
      t = setTimeout(() => setMobile(window.innerWidth < 1024), 150);
    };
    window.addEventListener("resize", handler, { passive: true });
    return () => { window.removeEventListener("resize", handler); clearTimeout(t); };
  }, []);
  return mobile;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ethixweb - We run the tech. You run the business." },
      {
        name: "description",
        content:
          "We manage your digital operation, from AI booking agents and CRM integrations to websites, SEO and ads.",
      },
      { property: "og:title", content: "Ethixweb - Premium Technology Partner" },
      {
        property: "og:description",
        content:
          "AI automation, websites, web applications, CRM integrations, SEO, ads, maintenance, and digital operations.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://ethixweb.com/ethixweb.png" },
      { property: "og:url", content: "https://ethixweb.com/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Ethixweb - We run the tech. You run the business." },
      { name: "twitter:description", content: "We manage your digital operation, from AI booking agents and CRM integrations to websites, SEO and ads." },
      { name: "twitter:image", content: "https://ethixweb.com/ethixweb.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://ethixweb.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          name: "Ethixweb",
          url: "https://ethixweb.com",
          logo: "https://ethixweb.com/ethixweb.png",
          description: "AI automation, websites, CRM integrations, SEO, and digital operations.",
          email: "info@ethixweb.com",
          openingHours: "Mo-Fr 09:00-17:00",
          areaServed: "US",
          sameAs: [
            "https://www.linkedin.com/company/ethixweb/",
            "https://www.instagram.com/ethix.web/",
          ],
        }),
      },
    ],
  }),
  component: Home,
});

const services = [
  {
    icon: Bot,
    title: "AI Receptionists",
    desc: "Voice and chat agents that answer, qualify, route, and book leads while your team stays focused.",
    to: "/ai-automation",
  },
  {
    icon: BrainCircuit,
    title: "AI Automation",
    desc: "Workflow automation, internal copilots, data syncs, and operational systems built for real teams.",
    to: "/ai-automation",
  },
  {
    icon: Globe2,
    title: "Websites",
    desc: "Fast, premium websites with sharp positioning, conversion paths, analytics, and SEO foundations.",
    to: "/web-development",
  },
  {
    icon: Code2,
    title: "Web Applications",
    desc: "Custom portals, dashboards, booking flows, and software tools engineered for daily operations.",
    to: "/web-development",
  },
  {
    icon: Cable,
    title: "CRM Integrations",
    desc: "HubSpot, GoHighLevel, Zapier, forms, calls, calendars, and pipelines connected into one system.",
    to: "/services",
  },
  {
    icon: Search,
    title: "SEO",
    desc: "Technical SEO, local SEO, content systems, and measurement that compound into durable demand.",
    to: "/services",
  },
  {
    icon: LifeBuoy,
    title: "Maintenance & Support",
    desc: "Fast fixes, uptime care, site updates, reporting, and a responsive team when something needs attention.",
    to: "/services",
  },
  {
    icon: Workflow,
    title: "Digital Operations",
    desc: "A senior tech team for your digital stack, from strategy through launch, support, and optimization.",
    to: "/services",
  },
];

const metrics = [
  { value: "24/7", label: "global coverage" },
  { value: "<1h", label: "support response" },
  { value: "US", label: "operations focus" },
  { value: "AI", label: "automation ready" },
];

const stack = ["AI agents", "CRM", "Websites", "SEO", "Ads", "Analytics", "Automations", "Support"];

function Home() {
  return (
    <SiteLayout>
      <Hero />
      <SignalStrip />
      <Services />
      <Suspense fallback={null}>
        <GlobalNetwork />
      </Suspense>
      <Testimonials />
      <OperatingSystem />
      <Proof />
      <CTA />
    </SiteLayout>
  );
}

function Hero() {
  return (
    <section className="relative -mt-24 overflow-hidden bg-gradient-hero px-6 pb-4 pt-20 sm:pb-28 sm:pt-36 lg:pt-40">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute left-1/2 top-0 h-136 w-136 -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
      <div className="absolute bottom-0 right-0 h-120 w-120 rounded-full bg-primary/15 blur-[100px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 pt-4 sm:pt-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_18px_rgba(138,24,28,0.9)]" />
              Premium digital operations team
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-7 max-w-5xl pb-2 text-[clamp(2.61rem,6.34vw,6.16rem)] font-extrabold leading-[0.9] text-gradient">
              We run the{" "}
              <span className="tech-3d relative inline-block" data-text="tech.">
                tech.
              </span>
              <br />
              You run the{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, #D13A40 0%, #B32228 50%, #8A181C 100%)",
                }}
              >
                business.
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-7 max-w-2xl text-lg font-medium leading-8 text-foreground/75 sm:text-xl">
              We manage your digital operation, from AI booking agents and CRM integrations to
              websites, SEO and ads.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/contact"
                className="magnetic group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-bold text-primary-foreground shadow-glow"
              >
                Start a project
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
              </Link>
              <div
                aria-disabled="true"
                title="Coming soon"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4.5 px-7 py-3.5 font-bold text-foreground/40 backdrop-blur-xl cursor-not-allowed select-none"
              >
                See our work
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.18}>
          <div className="-translate-y-5">
            <OperationsVisual />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const STARFIELD_DOTS = [
  { top: "8%", left: "12%", color: "#3b82f6", size: 5, blur: 6 },
  { top: "18%", left: "78%", color: "#ef4444", size: 4, blur: 5 },
  { top: "30%", left: "88%", color: "#3b82f6", size: 6, blur: 8 },
  { top: "42%", left: "70%", color: "#ef4444", size: 3, blur: 4 },
  { top: "55%", left: "82%", color: "#3b82f6", size: 5, blur: 7 },
  { top: "65%", left: "15%", color: "#ef4444", size: 4, blur: 5 },
  { top: "72%", left: "60%", color: "#3b82f6", size: 7, blur: 10 },
  { top: "25%", left: "22%", color: "#3b82f6", size: 3, blur: 4 },
  { top: "50%", left: "30%", color: "#ef4444", size: 5, blur: 6 },
  { top: "80%", left: "40%", color: "#3b82f6", size: 4, blur: 5 },
  { top: "10%", left: "55%", color: "#ef4444", size: 3, blur: 4 },
  { top: "38%", left: "8%", color: "#3b82f6", size: 6, blur: 8 },
  { top: "60%", left: "92%", color: "#ef4444", size: 4, blur: 6 },
  { top: "85%", left: "72%", color: "#3b82f6", size: 5, blur: 7 },
  { top: "15%", left: "40%", color: "#ef4444", size: 3, blur: 4 },
] as const;

const ZZZ_PARTICLES = [
  { delay: "0s", dur: "6.2s", size: "1.05rem", weight: 600, opacity: 0.42, left: "0px", bottom: "0px", glow: "red" },
  { delay: "1.3s", dur: "6.8s", size: "0.82rem", weight: 500, opacity: 0.32, left: "17px", bottom: "26px", glow: "blue" },
  { delay: "2.6s", dur: "7.1s", size: "0.7rem", weight: 500, opacity: 0.26, left: "-11px", bottom: "32px", glow: "red" },
  { delay: "3.9s", dur: "7.6s", size: "0.58rem", weight: 500, opacity: 0.2, left: "25px", bottom: "56px", glow: "blue" },
  { delay: "5.2s", dur: "8s", size: "0.5rem", weight: 500, opacity: 0.16, left: "5px", bottom: "62px", glow: "red" },
] as const;

const CLOUD_FILL = "linear-gradient(150deg, rgba(40,24,30,0.7), rgba(18,16,24,0.66))";

const heroBadges = [
  { label: "More booked jobs", style: { top: "2%", left: "2%" }, icon: PhoneCall, radius: "42% 58% 53% 47% / 48% 42% 58% 52%" },
  { label: "More conversions", style: { top: "6%", right: "2%" }, icon: TrendingUp, radius: "55% 45% 48% 52% / 44% 56% 44% 56%" },
  { label: "UI/UX Systems", style: { top: "47%", left: "2%" }, icon: Layers3, radius: "48% 52% 56% 44% / 52% 48% 52% 48%" },
  { label: "Revenue tracked", style: { top: "58%", right: "1%" }, icon: DollarSign, radius: "52% 48% 44% 56% / 48% 56% 44% 52%" },
  { label: "Design that converts", style: { top: "70%", left: "2%" }, icon: Palette, radius: "46% 54% 58% 42% / 56% 44% 56% 44%" },
];

// Mobile (<640px): compact pills tuned to the mascot's actual silhouette at narrow widths -
// the raised arm/wave reaches far right near the top, so the right-side badge sits lower.
const heroBadgesMobile = [
  { label: "More booked jobs", style: { top: "1%", left: "3%" }, icon: PhoneCall },
  { label: "More conversions", style: { top: "36%", right: "3%" }, icon: TrendingUp },
  { label: "UI/UX Systems", style: { top: "48%", left: "3%" }, icon: Layers3 },
  { label: "Revenue tracked", style: { top: "60%", right: "3%" }, icon: DollarSign },
  { label: "Design that converts", style: { top: "76%", left: "1%" }, icon: Palette },
];

function OperationsVisual() {
  const sleeping = useIsSleeping();
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();

  // While sleeping, cycle through the services inside the single dream cloud
  const [dreamIndex, setDreamIndex] = useState(0);
  useEffect(() => {
    if (!sleeping) return;
    const id = setInterval(() => setDreamIndex((n) => (n + 1) % heroBadges.length), 2600);
    return () => clearInterval(id);
  }, [sleeping]);

  // Motion values driven by window-level cursor (not container-bound)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-1, 1], [5, -5]), { stiffness: 100, damping: 28 });
  const rotateY = useSpring(useTransform(mx, [-1, 1], [-5, 5]), { stiffness: 100, damping: 28 });
  const charX = useSpring(useTransform(mx, [-1, 1], [-20, 20]), { stiffness: 70, damping: 20 });
  const charY = useSpring(useTransform(my, [-1, 1], [-12, 12]), { stiffness: 70, damping: 20 });

  useEffect(() => {
    if (sleeping || reduceMotion) return;
    let raf = 0;
    let idleTimer: ReturnType<typeof setTimeout>;
    let pendingX = 0;
    let pendingY = 0;

    const flush = () => {
      mx.set(pendingX);
      my.set(pendingY);
      raf = 0;
    };
    const onMove = (e: MouseEvent) => {
      pendingX = (e.clientX / window.innerWidth - 0.5) * 2;
      pendingY = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(flush);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { mx.set(0); my.set(0); }, 3500);
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null) pendingX = Math.max(-1, Math.min(1, e.gamma / 25));
      if (e.beta !== null) pendingY = Math.max(-1, Math.min(1, (e.beta - 45) / 25));
      if (!raf) raf = requestAnimationFrame(flush);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("deviceorientation", onOrient, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("deviceorientation", onOrient);
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(idleTimer);
    };
  }, [sleeping, reduceMotion, mx, my]);

  return (
    <motion.div className="relative mx-auto w-full max-w-130" style={{ perspective: "900px" }}>
      <div className="absolute inset-6 rounded-full bg-primary/15 blur-[70px]" />
      <motion.div
        className="relative h-72 sm:h-155 lg:h-170"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {/* starfield dots */}
        {STARFIELD_DOTS.map((dot, i) => (
          <span
            key={i}
            className="pointer-events-none absolute rounded-full"
            style={{
              top: dot.top,
              left: dot.left,
              width: dot.size,
              height: dot.size,
              background: dot.color,
              boxShadow: `0 0 ${dot.blur}px ${dot.blur / 2}px ${dot.color}`,
              opacity: 0.7,
            }}
          />
        ))}
        <motion.div
          className={`absolute -bottom-10 sm:bottom-0 left-1/2 z-10 -translate-x-1/2 ${sleeping ? "w-full sm:w-auto" : ""}`}
          style={sleeping ? {} : { x: charX, y: charY }}
        >
          {sleeping && (
            <>
              {/* Ambient glow - dark: red, light: soft neutral */}
              <div
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                  background:
                    theme === "dark"
                      ? "radial-gradient(ellipse 65% 55% at 50% 72%, rgba(138,24,28,0.14), transparent 68%)"
                      : "radial-gradient(ellipse 65% 55% at 50% 72%, rgba(180,160,160,0.16), transparent 68%)",
                  filter: "blur(18px)",
                }}
              />

              {/* Laptop screen glow - soft blue-white pulse */}
              <div
                className="laptop-screen-glow pointer-events-none absolute z-20"
                style={{
                  width: "90px",
                  height: "56px",
                  left: "18%",
                  bottom: "32%",
                  background: "radial-gradient(ellipse, rgba(140,175,230,0.55), transparent 68%)",
                  filter: "blur(14px)",
                  borderRadius: "40%",
                }}
              />
            </>
          )}

          <motion.img
            key={sleeping ? "sleep" : "active"}
            src={sleeping ? SLEEP_SRC : operatorCharacter}
            srcSet={sleeping ? undefined : `${operatorCharacterXs} 560w, ${operatorCharacterSm} 820w, ${operatorCharacter} 1024w`}
            sizes={sleeping ? undefined : "(max-width: 639px) 271px, (max-width: 1023px) 387px, 427px"}
            alt="Ethixweb mascot"
            width={sleeping ? 1920 : 1024}
            height={sleeping ? 1080 : 1536}
            className={sleeping
              ? "w-full h-auto scale-[1.68] origin-bottom sm:scale-100 sm:w-auto sm:max-w-none sm:h-145 object-contain mascot-breathe"
              : "h-101.5 sm:h-145 lg:h-160 max-w-none object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
            }
            initial={sleeping ? { opacity: 0 } : false}
            animate={sleeping ? { opacity: 1 } : { opacity: 1, y: reduceMotion ? 0 : [0, -12, 0] }}
            transition={
              sleeping
                ? { opacity: { duration: 1.0, ease: "easeOut" } }
                : {
                    opacity: { duration: 0.6, ease: "easeOut" },
                    y: reduceMotion
                      ? { duration: 0 }
                      : { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  }
            }
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </motion.div>
        {/* Awake (9 AM–5 PM): five floating pill badges */}
        {!sleeping &&
          heroBadges.map((badge, i) => (
            <motion.div
              key={badge.label}
              className="glass absolute z-20 hidden h-8 min-w-28 cursor-default items-center justify-center gap-1.5 rounded-full px-2.5 py-1.5 sm:flex sm:h-auto sm:min-w-0 sm:gap-2.5 sm:px-5 sm:py-3 lg:hidden xl:flex"
              style={badge.style}
              initial={{ opacity: 0, scale: 0.88, y: 8 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              whileHover={{ scale: 1.06, y: -4 }}
              viewport={{ once: true }}
              animate={{ y: reduceMotion ? 0 : [0, -7, 0] }}
              transition={{
                opacity: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
                scale: { delay: i * 0.1, type: "spring", stiffness: 280, damping: 22 },
                y: reduceMotion
                  ? { duration: 0 }
                  : { duration: 5 + i * 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 },
              }}
            >
              <badge.icon
                className="h-3 w-3 shrink-0 sm:h-4 sm:w-4"
                style={{ color: theme === "light" ? "rgba(192,39,45,0.9)" : "rgba(225,110,118,0.85)" }}
              />
              <span
                className="whitespace-nowrap text-[11px] font-medium sm:text-sm"
                style={{ color: theme === "light" ? "rgba(20,16,15,0.88)" : "rgba(255,255,255,0.85)" }}
              >
                {badge.label}
              </span>
            </motion.div>
          ))}

        {/* Mobile (<640px): compact pills around the mascot, sized/positioned to clear his silhouette on narrow screens */}
        {!sleeping &&
          heroBadgesMobile.map((badge, i) => (
            <motion.div
              key={badge.label}
              className="glass absolute z-20 flex h-7 cursor-default items-center justify-center gap-1 rounded-full px-2 sm:hidden"
              style={badge.style}
              initial={{ opacity: 0, scale: 0.88 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              animate={{ y: reduceMotion ? 0 : [0, -6, 0] }}
              transition={{
                opacity: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
                scale: { delay: i * 0.1, type: "spring", stiffness: 280, damping: 22 },
                y: reduceMotion
                  ? { duration: 0 }
                  : { duration: 5 + i * 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 },
              }}
            >
              <badge.icon
                className="h-3 w-3 shrink-0"
                style={{ color: theme === "light" ? "rgba(192,39,45,0.9)" : "rgba(225,110,118,0.85)" }}
              />
              <span
                className="hidden whitespace-nowrap text-[9px] font-medium leading-none min-[375px]:inline"
                style={{ color: theme === "light" ? "rgba(20,16,15,0.88)" : "rgba(255,255,255,0.85)" }}
              >
                {badge.label}
              </span>
            </motion.div>
          ))}

        {/* After hours: one big dream cloud - mascot dreams the services, popping in sequence */}
        {sleeping &&
          (() => {
            const cloudSrc = CLOUD_LIGHT; // solid silhouette - fills interior fully (DARK MODE.svg is hollow/outline)
            // Subtle dark glass, same family as the awake floating badges
            const fill = CLOUD_FILL;
            const dream = heroBadges[dreamIndex];
            const DreamIcon = dream.icon;
            return (
              <motion.div
                className="pointer-events-none absolute z-20 flex items-center justify-center"
                style={isMobile
                  ? { top: "calc(41% - 110px)", left: "calc(6% - 5px)", width: "160px", height: "110px" }
                  : { top: "calc(22% - 10px)", left: "12%", width: "220px", height: "158px" }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: isMobile ? 0.65 : 0.88,
                  scale: 1,
                  y: reduceMotion ? 0 : isMobile ? [0, -5, 0] : [0, -6, 0],
                }}
                transition={{
                  opacity: { duration: 0.8, ease: "easeOut" },
                  scale: { type: "spring", stiffness: 240, damping: 22 },
                  y: reduceMotion ? { duration: 0 } : { duration: 6, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                {/* Cloud silhouette - tail points toward laptop screen below */}
                <div
                  className="absolute inset-0 backdrop-blur-lg"
                  style={{
                    background: fill,
                    WebkitMaskImage: `url(${cloudSrc})`,
                    maskImage: `url(${cloudSrc})`,
                    WebkitMaskSize: "100% 100%",
                    maskSize: "100% 100%",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                    transform: "scaleX(-1)",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.22), 0 2px 6px rgba(180,40,50,0.06)",
                  }}
                />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={dream.label}
                    className="relative flex flex-col items-center gap-1 px-4 text-center"
                    style={{ marginBottom: "26px" }}
                    initial={{ opacity: 0, scale: 0.45, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.45, y: -6 }}
                    transition={{ type: "spring", stiffness: 340, damping: 20 }}
                  >
                    <DreamIcon
                      className="shrink-0"
                      strokeWidth={2}
                      style={{ width: isMobile ? "13px" : "18px", height: isMobile ? "13px" : "18px", color: isMobile ? "rgba(225,110,118,0.75)" : "rgba(225,110,118,0.95)" }}
                    />
                    <span
                      className={isMobile ? "text-[10px] font-medium leading-tight text-center max-w-16" : "text-xs font-medium leading-tight text-center max-w-20"}
                      style={{ color: isMobile ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.95)" }}
                    >
                      {dream.label}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            );
          })()}

        {/* Zzz particles - top layer (above the dream bubble too), drifting up above & around the head.
            Parent is preserve-3d, so z-index is ignored - translateZ pushes these toward the camera. */}
        {sleeping && (
          <div
            className="pointer-events-none absolute z-40"
            style={{ top: isMobile ? "140px" : "248px", right: isMobile ? "28px" : "68px", transform: "translateZ(60px)" }}
          >
            {ZZZ_PARTICLES.map((z, i) => (
              <span
                key={i}
                className="zzz-particle absolute select-none"
                style={{
                  left: z.left,
                  bottom: z.bottom,
                  fontSize: z.size,
                  fontWeight: z.weight,
                  fontStyle: "italic",
                  letterSpacing: "0.04em",
                  opacity: z.opacity,
                  color: theme === "dark" ? "rgba(255,255,255,0.9)" : "rgba(30,20,24,0.72)",
                  textShadow:
                    z.glow === "red"
                      ? "0 0 8px rgba(225,70,80,0.55), 0 0 18px rgba(225,70,80,0.3)"
                      : "0 0 8px rgba(90,140,235,0.5), 0 0 18px rgba(90,140,235,0.28)",
                  animationDelay: z.delay,
                  animationDuration: z.dur,
                }}
              >
                z
              </span>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function SignalStrip() {
  return (
    <div className="signal-strip overflow-hidden border-y py-7">
      <div className="flex gap-14 whitespace-nowrap animate-marquee">
        {[...stack, ...stack, ...stack].map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex items-center gap-14 text-xl font-extrabold uppercase tracking-[0.32em] text-muted-foreground/70"
          >
            {item}
            <span className="h-2 w-2 rounded-full bg-primary" />
          </span>
        ))}
      </div>
    </div>
  );
}

function Services() {
  return (
    <section className="relative overflow-hidden px-6 py-24">
      <div className="absolute left-0 top-1/4 h-112 w-md rounded-full bg-primary/10 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl">
        <Reveal>
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-primary">
              Robust Solutions
            </p>
            <h2 className="pb-1 text-4xl font-extrabold leading-tight text-gradient lg:text-6xl">
              Senior operators for the systems that grow the{" "}
              <RotatingText
                texts={["business.", "growth.", "revenue.", "pipeline."]}
                mainClassName="align-bottom"
                elementLevelClassName="text-primary"
                staggerFrom="last"
                staggerDuration={0.02}
                rotationInterval={3500}
                transition={{ type: "spring", damping: 28, stiffness: 380 }}
              />
            </h2>
          </div>
        </Reveal>
        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service, index) => (
            <Reveal key={service.title} delay={index * 0.04}>
              <div className="relative h-full">
                {index === 0 && (
                  <img
                    src="/SIT.webp"
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute block lg:hidden w-auto object-contain z-20"
                    style={{ height: "208px", right: "0px", bottom: "calc(100% - 86px)" }}
                    width="150"
                    height="208"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                {index === 3 && (
                  <img
                    src="/Ethan%20view%202.webp"
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute hidden xl:block w-auto object-contain"
                    style={{ height: "1000px", right: "-130px", bottom: "calc(100% - 980px)", transformOrigin: "bottom right", transform: "scale(2.1)" }}
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div className="premium-card relative h-full overflow-hidden rounded-2xl p-6 cursor-default">
                  <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-primary/0 blur-3xl" />
                  <service.icon className="h-7 w-7 text-primary/60" strokeWidth={1.7} />
                  <h3 className="mt-7 text-xl font-bold text-foreground">{service.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-foreground/75">{service.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const OS_ROWS = [
  {
    icon: ShieldCheck,
    title: "Trustworthy systems",
    desc: "Clean architecture, secure defaults, and reliable handoff across your stack.",
  },
  {
    icon: Layers3,
    title: "Layered execution",
    desc: "Strategy, design, development, automation, launch, and support under one roof.",
  },
  {
    icon: Megaphone,
    title: "Growth connected",
    desc: "SEO, ads, analytics, forms, calls, and CRM data aligned around revenue.",
  },
];

function OperatingSystem() {
  const rows = OS_ROWS;

  return (
    <section className="px-6 py-12 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <Reveal>
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-primary">
              Operating model
            </p>
            <h2 className="pb-1 text-4xl font-extrabold leading-tight text-gradient lg:text-6xl">
              Built like an internal technology team.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Ethixweb brings software, automation, marketing operations, and support into one
              disciplined delivery system.
            </p>
          </div>
        </Reveal>
        <div className="grid gap-4">
          {rows.map((row, index) => (
            <Reveal key={row.title} delay={index * 0.08}>
              <div className="premium-card flex gap-5 rounded-2xl p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <row.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{row.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{row.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Proof() {
  return (
    <section className="px-6 py-10 sm:py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 lg:grid-cols-4 items-stretch">
        {metrics.map((metric, index) => (
          <Reveal key={metric.label} delay={index * 0.05} className="h-full">
            <div className="premium-card rounded-2xl p-7 text-center h-full flex flex-col items-center justify-center">
              <div className="text-5xl font-extrabold text-gradient-brand">{metric.value}</div>
              <div className="mt-3 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                {metric.label}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="px-6 py-12 sm:py-24">
      <Reveal>
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-4xl bg-card shadow-lg lg:aspect-25/12">
          <div className="grid grid-cols-1 items-center gap-8 px-8 py-14 sm:px-12 sm:py-16 lg:h-full lg:grid-cols-[1.13fr_1fr] lg:items-stretch lg:gap-2 lg:px-0 lg:py-0">
            <div className="relative z-10 flex flex-col justify-center text-center lg:pl-20 lg:pr-6 lg:text-left">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-primary sm:text-sm">
                Robust Solutions
              </p>
              <h2 className="mt-4 font-display text-[2.75rem] font-extrabold leading-[1.05] tracking-tight text-card-foreground sm:text-6xl lg:text-[5rem]">
                Want to work
                <br />
                with <span className="text-primary">us?</span>
              </h2>
              <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl lg:text-xl lg:mx-0">
                Tired of being account #200 at a big agency? Work with a senior team that knows your business by name.
              </p>
              <Link
                to="/contact"
                className="mt-9 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
              >
                Get in touch <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative mx-auto h-[300px] w-full max-w-[340px] overflow-hidden sm:h-[380px] sm:max-w-[400px] lg:h-full lg:max-w-none">
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-[60%] h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(192,39,45,0.32),transparent_72%)] blur-2xl"
              />
              <div
                aria-hidden="true"
                className="bg-dot-grid absolute right-0 top-0 h-[55%] w-[65%] text-primary/35"
                style={{
                  WebkitMaskImage: "radial-gradient(circle at top right, black 30%, transparent 72%)",
                  maskImage: "radial-gradient(circle at top right, black 30%, transparent 72%)",
                }}
              />
              <img
                src="/ethan-cta.webp"
                alt="Ethixweb mascot Ethan"
                className="absolute bottom-0 left-1/2 z-10 h-[94%] w-auto -translate-x-1/2 object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
