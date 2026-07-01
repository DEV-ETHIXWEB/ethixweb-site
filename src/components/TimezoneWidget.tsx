import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Zap } from "lucide-react";
import { useTheme } from "./ThemeProvider";

type Zone = { code: string; country: string; label: string; tz: string };

const ZONES: Zone[] = [
  { code: "IN", country: "IN", label: "India", tz: "Asia/Kolkata" },
  { code: "US-ET", country: "US", label: "US East", tz: "America/New_York" },
  { code: "US-PT", country: "US", label: "US West", tz: "America/Los_Angeles" },
  { code: "UK", country: "UK", label: "United Kingdom", tz: "Europe/London" },
  { code: "AE", country: "AE", label: "UAE", tz: "Asia/Dubai" },
  { code: "AU", country: "AU", label: "Australia (Syd)", tz: "Australia/Sydney" },
  { code: "SG", country: "SG", label: "Singapore", tz: "Asia/Singapore" },
  { code: "DE", country: "DE", label: "Germany", tz: "Europe/Berlin" },
  { code: "CA", country: "CA", label: "Canada (Tor)", tz: "America/Toronto" },
];

// Country-code badge instead of a flag emoji - flag glyphs render inconsistently
// (or fall back to raw letter tiles) across OSes, especially Windows.
function CodeBadge({ code, className = "" }: { code: string; className?: string }) {
  return (
    <span
      className={`inline-flex h-4 min-w-[1.1rem] items-center justify-center rounded-sm bg-primary/15 px-1 text-[9px] font-bold leading-none text-primary ${className}`}
    >
      {code}
    </span>
  );
}

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
  // Starts at null (renders a static placeholder) so the server and the client's
  // first render match exactly; a live Date is only ever read post-mount, since
  // computing "now" during SSR vs. hydration can straddle a minute boundary and
  // produce two different formatted time strings for the same clock.
  const [now, setNow] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  const [localTz, setLocalTz] = useState<string>("UTC");
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const recalcPos = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 12, right: window.innerWidth - rect.right });
  };

  useEffect(() => {
    setMounted(true);
    setLocalTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        ref.current &&
        !ref.current.contains(target) &&
        panelRef.current &&
        !panelRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // The dropdown is portaled to <body> (its trigger sits inside a navbar container
  // with overflow-hidden, which would otherwise silently clip it) so position has
  // to be computed from the trigger's real screen coordinates instead of CSS `absolute`.
  useEffect(() => {
    if (!open) return;
    recalcPos();
    window.addEventListener("resize", recalcPos);
    return () => window.removeEventListener("resize", recalcPos);
  }, [open]);

  const toggleOpen = () => {
    setOpen((v) => {
      const next = !v;
      if (next) recalcPos();
      return next;
    });
  };

  const { theme } = useTheme();
  const india = now ? formatTime(now, INDIA_TZ) : "--:--";
  const local = now ? formatTime(now, localTz) : "--:--";
  const working = now ? isIndiaWorking(now) : false;

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
        };

  return (
    <div className="relative" ref={ref}>
      <button
        ref={buttonRef}
        onClick={toggleOpen}
        className="hidden md:inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-xs text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
        aria-label="Global timezone"
      >
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-70 ${
              working ? "bg-emerald-400 animate-ping" : "bg-amber-400"
            }`}
          />
          <span
            className={`relative inline-flex h-1.5 w-1.5 rounded-full ${working ? "bg-emerald-400" : "bg-amber-400"}`}
          />
        </span>
        <CodeBadge code="IN" />
        <span className="font-medium tabular-nums text-foreground/90">{india}</span>
        <ChevronDown className={`h-3 w-3 text-muted-foreground/50 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {mounted &&
        pos &&
        createPortal(
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
                ref={panelRef}
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="fixed w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-elegant p-4 z-50"
                style={{ ...panelStyle, top: pos.top, right: pos.right }}
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
                      working
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-amber-500/15 text-amber-400"
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
                    <p className="text-[10px] text-muted-foreground">{now && formatLong(now, INDIA_TZ)}</p>
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
                        <CodeBadge code={z.country} />
                        <span className="text-foreground/85">{z.label}</span>
                      </span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {now && formatTime(now, z.tz)}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-3 text-[10px] text-muted-foreground text-center">
                  Quick fixes · global availability · always on partner
                </p>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
