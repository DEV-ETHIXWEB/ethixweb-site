import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe2, ChevronDown, Zap } from "lucide-react";
import { useTheme } from "./ThemeProvider";

type Zone = { code: string; label: string; tz: string; flag: string };

const ZONES: Zone[] = [
  { code: "IN", label: "India", tz: "Asia/Kolkata", flag: "🇮🇳" },
  { code: "US-ET", label: "US East", tz: "America/New_York", flag: "🇺🇸" },
  { code: "US-PT", label: "US West", tz: "America/Los_Angeles", flag: "🇺🇸" },
  { code: "UK", label: "United Kingdom", tz: "Europe/London", flag: "🇬🇧" },
  { code: "AE", label: "UAE", tz: "Asia/Dubai", flag: "🇦🇪" },
  { code: "AU", label: "Australia (Syd)", tz: "Australia/Sydney", flag: "🇦🇺" },
  { code: "SG", label: "Singapore", tz: "Asia/Singapore", flag: "🇸🇬" },
  { code: "DE", label: "Germany", tz: "Europe/Berlin", flag: "🇩🇪" },
  { code: "CA", label: "Canada (Tor)", tz: "America/Toronto", flag: "🇨🇦" },
];

const INDIA_TZ = "Asia/Kolkata";

function formatTime(date: Date, tz: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: tz,
  }).format(date);
}

function formatLong(date: Date, tz: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: tz,
    timeZoneName: "short",
  }).format(date);
}

function isIndiaWorking(date: Date) {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", { hour: "2-digit", hour12: false, timeZone: INDIA_TZ }).format(
      date,
    ),
  );
  const day = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: INDIA_TZ }).format(
    date,
  );
  const weekday = !["Sat", "Sun"].includes(day);
  return weekday && hour >= 9 && hour < 19;
}

export function TimezoneWidget() {
  const [now, setNow] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [localTz, setLocalTz] = useState<string>("UTC");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const { theme } = useTheme();
  const india = formatTime(now, INDIA_TZ);
  const local = formatTime(now, localTz);
  const working = isIndiaWorking(now);
  const sameAsIndia = localTz === INDIA_TZ;

  const panelStyle =
    theme === "dark"
      ? {
          background: "rgba(14,12,20,0.42)",
          backdropFilter: "blur(64px) saturate(180%)",
          WebkitBackdropFilter: "blur(64px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.08)",
        }
      : {
          background: "rgba(255,253,251,0.5)",
          backdropFilter: "blur(64px) saturate(160%)",
          WebkitBackdropFilter: "blur(64px) saturate(160%)",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="hidden md:inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs hover:bg-foreground/5 transition"
        aria-label="Global timezone"
      >
        <span className="relative flex h-2 w-2">
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-70 ${
              working ? "bg-emerald-400 animate-ping" : "bg-amber-400"
            }`}
          />
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${working ? "bg-emerald-400" : "bg-amber-400"}`}
          />
        </span>
        <Globe2 className="h-3.5 w-3.5 text-primary" />
        <span className="font-medium tabular-nums">🇮🇳 {india}</span>
        {!sameAsIndia && (
          <span className="text-muted-foreground tabular-nums hidden lg:inline">· You {local}</span>
        )}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
        )}
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-3 w-[320px] rounded-2xl shadow-elegant p-4 z-50"
            style={panelStyle}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  Global Desk
                </span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  working ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                }`}
              >
                {working ? "Online · Fast reply" : "After hours"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-foreground/5 p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Ethixweb · India
                </p>
                <p className="mt-1 text-lg font-display font-semibold tabular-nums">{india}</p>
                <p className="text-[10px] text-muted-foreground">{formatLong(now, INDIA_TZ)}</p>
              </div>
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-3">
                <p className="text-[10px] uppercase tracking-widest text-primary/80">
                  Your Local Time
                </p>
                <p className="mt-1 text-lg font-display font-semibold tabular-nums">{local}</p>
                <p className="text-[10px] text-muted-foreground truncate">{localTz}</p>
              </div>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Team check · worldwide
              </p>
              {ZONES.map((z) => (
                <div
                  key={z.code}
                  className="flex items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-foreground/5 transition"
                >
                  <span className="text-xs flex items-center gap-2">
                    <span className="text-base leading-none">{z.flag}</span>
                    <span className="text-foreground/85">{z.label}</span>
                  </span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {formatTime(now, z.tz)}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-3 text-[10px] text-muted-foreground text-center">
              Quick fixes · global availability · always-on partner
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
