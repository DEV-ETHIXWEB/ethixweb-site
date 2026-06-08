import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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
import { SiteLayout } from "@/components/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { GlobalNetwork } from "@/components/GlobalNetwork";
import { Testimonials } from "@/components/Testimonials";
import { useTheme } from "@/components/ThemeProvider";
import operatorCharacter from "@/assets/operator-character.png";

const SLEEP_SRC = "/Untitled%20design%20(38).png";
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
  const [sleeping, setSleeping] = useState(check);
  useEffect(() => {
    const id = setInterval(() => setSleeping(check()), 60_000);
    return () => clearInterval(id);
  }, []);
  return sleeping;
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
      <GlobalNetwork />
      <Testimonials />
      <OperatingSystem />
      <Proof />
      <CTA />
    </SiteLayout>
  );
}

function Hero() {
  return (
    <section className="relative -mt-24 overflow-hidden bg-gradient-hero px-6 pb-24 pt-36 sm:pb-28 lg:pt-40">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute left-1/2 top-0 h-136 w-136 -translate-x-1/2 rounded-full bg-primary/25 blur-[150px] animate-pulse-glow" />
      <div className="absolute bottom-0 right-0 h-120 w-120 rounded-full bg-primary/20 blur-[160px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 pt-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_18px_rgba(138,24,28,0.9)]" />
              Premium digital operations team
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-7 max-w-5xl text-[clamp(2.61rem,6.34vw,6.16rem)] font-extrabold leading-[0.9] text-gradient">
              We run the tech.
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
            <p className="mt-7 max-w-2xl text-lg font-medium leading-8 text-muted-foreground sm:text-xl">
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
              <Link
                to="/portfolio"
                className="magnetic inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4.5 px-7 py-3.5 font-bold text-foreground backdrop-blur-xl hover:border-primary/40 hover:bg-primary/10"
              >
                See our work
              </Link>
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

const heroBadges = [
  { label: "More booked jobs", style: { top: "5%", left: "1%" }, icon: PhoneCall, radius: "42% 58% 53% 47% / 48% 42% 58% 52%" },
  { label: "More conversions", style: { top: "10%", right: "-1%" }, icon: TrendingUp, radius: "55% 45% 48% 52% / 44% 56% 44% 56%" },
  { label: "UI/UX Systems", style: { top: "44%", left: "-3%" }, icon: Layers3, radius: "48% 52% 56% 44% / 52% 48% 52% 48%" },
  { label: "Revenue tracked", style: { bottom: "20%", right: "-2%" }, icon: DollarSign, radius: "52% 48% 44% 56% / 48% 56% 44% 52%" },
  { label: "Design that converts", style: { bottom: "1%", left: "10%" }, icon: Palette, radius: "46% 54% 58% 42% / 56% 44% 56% 44%" },
];

function OperationsVisual() {
  const sleeping = useIsSleeping();
  const { theme } = useTheme();

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
    if (sleeping) return; // no cursor tracking when sleeping
    let idleTimer: ReturnType<typeof setTimeout>;

    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 2);
      my.set((e.clientY / window.innerHeight - 0.5) * 2);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        mx.set(0);
        my.set(0);
      }, 3500);
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null) mx.set(Math.max(-1, Math.min(1, e.gamma / 25)));
      if (e.beta !== null) my.set(Math.max(-1, Math.min(1, (e.beta - 45) / 25)));
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("deviceorientation", onOrient, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("deviceorientation", onOrient);
      clearTimeout(idleTimer);
    };
  }, [sleeping, mx, my]);

  const sleepSrc = SLEEP_SRC;

  return (
    <motion.div className="relative mx-auto w-full max-w-130" style={{ perspective: "900px" }}>
      <div className="absolute inset-6 rounded-full bg-primary/20 blur-[110px]" />
      <motion.div
        className="relative h-155 sm:h-170"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {/* starfield dots */}
        {[
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
        ].map((dot, i) => (
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
          className={`absolute bottom-0 left-1/2 z-10 -translate-x-1/2 ${sleeping ? "w-90 sm:w-auto" : ""}`}
          style={sleeping ? {} : { x: charX, y: charY }}
        >
          {sleeping && (
            <>
              {/* Ambient glow — dark: red, light: soft neutral */}
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

              {/* Laptop screen glow — soft blue-white pulse */}
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
            src={sleeping ? sleepSrc : operatorCharacter}
            alt="Ethixweb mascot"
            className={sleeping
              ? "w-full max-w-full h-auto sm:w-auto sm:max-w-none sm:h-145 object-contain mascot-breathe"
              : "h-145 sm:h-160 max-w-none object-contain drop-shadow-[0_34px_90px_rgba(0,0,0,0.72)]"
            }
            initial={{ opacity: 0 }}
            animate={sleeping ? { opacity: 1 } : { opacity: 1, y: [0, -12, 0] }}
            transition={
              sleeping
                ? { opacity: { duration: 1.0, ease: "easeOut" } }
                : {
                    opacity: { duration: 0.6, ease: "easeOut" },
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
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
              className="absolute z-20 flex cursor-default items-center gap-2.5 rounded-full px-5 py-3 backdrop-blur-xl"
              style={{
                ...badge.style,
                border: "1px solid rgba(220,80,90,0.16)",
                background: "linear-gradient(150deg, rgba(40,24,30,0.88), rgba(18,16,24,0.86))",
                boxShadow: "0 12px 36px rgba(0,0,0,0.36), 0 2px 10px rgba(180,40,50,0.1)",
              }}
              initial={{ opacity: 0, scale: 0.88, y: 8 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              whileHover={{ scale: 1.06, y: -4 }}
              viewport={{ once: true }}
              animate={{ y: [0, -7, 0] }}
              transition={{
                opacity: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
                scale: { delay: i * 0.1, type: "spring", stiffness: 280, damping: 22 },
                y: { duration: 5 + i * 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 },
              }}
            >
              <badge.icon className="h-4 w-4 shrink-0" style={{ color: "rgba(225,110,118,0.85)" }} />
              <span className="whitespace-nowrap text-sm font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>
                {badge.label}
              </span>
            </motion.div>
          ))}

        {/* After hours: one big dream cloud — mascot dreams the services, popping in sequence */}
        {sleeping &&
          (() => {
            const cloudSrc = CLOUD_LIGHT; // solid silhouette — fills interior fully (DARK MODE.svg is hollow/outline)
            // Subtle dark glass, same family as the awake floating badges
            const fill = "linear-gradient(150deg, rgba(40,24,30,0.7), rgba(18,16,24,0.66))";
            const dream = heroBadges[dreamIndex];
            const DreamIcon = dream.icon;
            return (
              <motion.div
                className="pointer-events-none absolute z-20 flex items-center justify-center"
                style={{ top: "calc(14% - 75px)", right: "calc(-12% + 75px)", width: "282px", height: "203px" }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1, y: [0, -9, 0] }}
                transition={{
                  opacity: { duration: 0.8, ease: "easeOut" },
                  scale: { type: "spring", stiffness: 240, damping: 22 },
                  y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                {/* Cloud silhouette recolored via mask — subtle glass fill, matches awake badge style */}
                <div
                  className="absolute inset-0 backdrop-blur-xl"
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
                    transform: "scaleX(-1)", // flip bubble + tail (text/animation stay upright)
                    boxShadow: "0 12px 30px rgba(0,0,0,0.28), 0 2px 8px rgba(180,40,50,0.08)",
                  }}
                />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={dream.label}
                    className="relative flex flex-col items-center gap-1.5 px-10 text-center"
                    style={{ marginBottom: "16px" }} // shifts content up in the centered bubble; bubble unchanged
                    initial={{ opacity: 0, scale: 0.45, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.45, y: -8 }}
                    transition={{ type: "spring", stiffness: 340, damping: 20 }}
                  >
                    <DreamIcon
                      className="shrink-0"
                      strokeWidth={2}
                      style={{ width: "26px", height: "26px", color: "rgba(225,110,118,0.85)" }}
                    />
                    <span
                      className="whitespace-nowrap text-sm font-medium leading-tight"
                      style={{ color: "rgba(255,255,255,0.85)" }}
                    >
                      {dream.label}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            );
          })()}

        {/* Zzz particles — top layer (above the dream bubble too), drifting up above & around the head.
            Parent is preserve-3d, so z-index is ignored — translateZ pushes these toward the camera. */}
        {sleeping && (
          <div
            className="pointer-events-none absolute z-40"
            style={{ top: "248px", right: "68px", transform: "translateZ(60px)" }}
          >
            {[
              { delay: "0s", dur: "6.2s", size: "1.05rem", weight: 600, opacity: 0.42, left: "0px", bottom: "0px", glow: "red" },
              { delay: "1.3s", dur: "6.8s", size: "0.82rem", weight: 500, opacity: 0.32, left: "17px", bottom: "26px", glow: "blue" },
              { delay: "2.6s", dur: "7.1s", size: "0.7rem", weight: 500, opacity: 0.26, left: "-11px", bottom: "32px", glow: "red" },
              { delay: "3.9s", dur: "7.6s", size: "0.58rem", weight: 500, opacity: 0.2, left: "25px", bottom: "56px", glow: "blue" },
              { delay: "5.2s", dur: "8s", size: "0.5rem", weight: 500, opacity: 0.16, left: "5px", bottom: "62px", glow: "red" },
            ].map((z, i) => (
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
              Solutions
            </p>
            <h2 className="text-4xl font-extrabold leading-tight text-gradient lg:text-6xl">
              Senior operators for the systems that grow the business.
            </h2>
          </div>
        </Reveal>
        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service, index) => (
            <Reveal key={service.title} delay={index * 0.04}>
              <Link
                to={service.to}
                className="premium-card group relative block h-full overflow-hidden rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/35"
              >
                <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-primary/0 blur-3xl transition group-hover:bg-primary/25" />
                <service.icon className="h-7 w-7 text-primary" strokeWidth={1.7} />
                <h3 className="mt-7 text-xl font-bold">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{service.desc}</p>
                <div className="mt-7 inline-flex items-center gap-1 text-sm font-bold text-primary">
                  Explore
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function OperatingSystem() {
  const rows = [
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

  return (
    <section className="px-6 py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <Reveal>
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-primary">
              Operating model
            </p>
            <h2 className="text-4xl font-extrabold leading-tight text-gradient lg:text-6xl">
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
    <section className="px-6 py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Reveal key={metric.label} delay={index * 0.05}>
            <div className="premium-card rounded-2xl p-7 text-center">
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
    <section className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="premium-card relative overflow-hidden rounded-4xl px-6 py-16 text-center sm:px-12 lg:py-24">
          <div className="absolute inset-0 ambient-red opacity-80" />
          <div className="absolute inset-0 grid-bg opacity-30" />
          <Reveal>
            <div className="relative mx-auto max-w-3xl">
              <h2 className="text-4xl font-extrabold leading-tight text-gradient lg:text-7xl">
                Ready for a sharper digital operation?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Bring us the messy stack, missed leads, slow site, or stalled automation. We will
                turn it into a system.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link
                  to="/contact"
                  className="magnetic group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-bold text-primary-foreground shadow-glow"
                >
                  Start a project
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                </Link>
                <Link
                  to="/portfolio"
                  className="magnetic inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4.5 px-7 py-3.5 font-bold text-foreground hover:border-primary/40 hover:bg-primary/10"
                >
                  See our work
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
