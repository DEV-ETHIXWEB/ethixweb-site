import { useState, type ComponentType } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Cable,
  CheckCircle2,
  Code2,
  Megaphone,
  PhoneCall,
  Search,
} from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";
import emblem from "@/assets/emblem-transparent.webp";

type ShiftItem = {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  before: string;
  after: string;
  x: number;
  y: number;
};

const HUB = { x: 50, y: 50 };

// The source art (@/assets/emblem-transparent.webp) is now a pre-rendered
// crimson-glass "E" - already the right color, so no recolor filter is
// needed here. Kept as a named constant (rather than inlining "none") so the
// active/dark swap to EMBLEM_WHITE_FILTER below reads the same as before.
const EMBLEM_CRIMSON_FILTER = "none";
const EMBLEM_WHITE_FILTER = "brightness(0) invert(1)";

// 5 points on a regular pentagon around the hub - equal radius (37.5, a 25%
// increase over the original 30), 72° apart, starting straight up - so every
// node sits the exact same distance from center and every connecting line is
// the same length.
const SHIFT_ITEMS: ShiftItem[] = [
  { icon: PhoneCall, before: "Missed calls", after: "Every call answered", x: 50, y: 12.5 },
  { icon: Search, before: "Invisible on Google", after: "Ranking on Google", x: 85.67, y: 38.41 },
  { icon: Cable, before: "Disconnected tools", after: "Connected stack", x: 72.04, y: 80.34 },
  { icon: Code2, before: "Slow, dated site", after: "Fast, modern site", x: 27.96, y: 80.34 },
  { icon: Megaphone, before: "Wasted ad spend", after: "ROI-positive ads", x: 14.33, y: 38.41 },
];

/**
 * The right-hand storytelling element of the closing CTA: a floating glass
 * network that resolves from "scattered problems" to "one connected system"
 * on hover - dim red/muted at rest, bright white-and-red "powered on" when
 * active. Kept strictly to the site's red/white/black palette (no green),
 * echoing the Hero's SpiderwebNetwork energy-flow language.
 */
export function SystemShift() {
  const [active, setActive] = useState(false);
  const reduceMotion = useReducedMotion();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={active}
      aria-label="Preview how Ethixweb resolves common operational problems"
      // Scaled down as a whole (not resized piece by piece) so every
      // proportion tuned above - radius, card spacing, uniform sizing -
      // stays exactly intact. transform doesn't affect layout, so the
      // parent's reserved space (sized with clipping headroom) is
      // unchanged; the widget just renders smaller, centered within it.
      className="relative h-full w-full origin-center scale-95 cursor-pointer select-none rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 lg:scale-[0.85]"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onClick={() => setActive((a) => !a)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setActive((a) => !a);
        }
      }}
    >
      {/* Ambient light */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[85%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-[background] duration-700 ease-out"
        style={{
          background: active
            ? isDark
              ? "radial-gradient(circle, rgba(255,255,255,0.1), rgba(192,39,45,0.26) 45%, transparent 72%)"
              : "radial-gradient(circle, rgba(192,39,45,0.08), rgba(192,39,45,0.15) 45%, transparent 72%)"
            : isDark
              ? "radial-gradient(circle, rgba(192,39,45,0.28), transparent 72%)"
              : "radial-gradient(circle, rgba(192,39,45,0.1), transparent 72%)",
        }}
      />
      <div
        aria-hidden="true"
        className="bg-dot-grid absolute right-0 top-0 h-[55%] w-[65%] text-primary/25 transition-opacity duration-700"
        style={{
          WebkitMaskImage: "radial-gradient(circle at top right, black 30%, transparent 72%)",
          maskImage: "radial-gradient(circle at top right, black 30%, transparent 72%)",
          opacity: active ? 0.45 : 1,
        }}
      />

      {/* Connector lines + energy pulses */}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        {SHIFT_ITEMS.map((item, i) => (
          <g key={item.before}>
            <line
              x1={HUB.x}
              y1={HUB.y}
              x2={item.x}
              y2={item.y}
              vectorEffect="non-scaling-stroke"
              className={`shift-line ${active ? "is-active" : ""}`}
            />
            {active && !reduceMotion && (
              <circle r="0.8" className="shift-pulse-dot">
                <animateMotion
                  dur="1.7s"
                  begin={`${i * 0.16}s`}
                  repeatCount="indefinite"
                  path={`M${HUB.x},${HUB.y} L${item.x},${item.y}`}
                />
              </circle>
            )}
          </g>
        ))}
      </svg>

      {/* Hub */}
      <div
        className="absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-md transition-[border-color,box-shadow,background] duration-500 ease-out sm:h-16 sm:w-16"
        style={{
          left: `${HUB.x}%`,
          top: `${HUB.y}%`,
          borderColor: active
            ? isDark
              ? "rgba(255,255,255,0.55)"
              : "rgba(192,39,45,0.45)"
            : isDark
              ? "rgba(192,39,45,0.4)"
              : "rgba(192,39,45,0.25)",
          background: active
            ? isDark
              ? "radial-gradient(circle, rgba(255,255,255,0.16), rgba(20,10,11,0.7))"
              : "radial-gradient(circle, rgba(255,255,255,0.95), rgba(254,244,244,0.9))"
            : isDark
              ? "radial-gradient(circle, rgba(192,39,45,0.2), rgba(20,10,11,0.7))"
              : "radial-gradient(circle, rgba(255,255,255,0.9), rgba(250,242,240,0.85))",
          boxShadow: active
            ? isDark
              ? "0 0 0 1px rgba(255,255,255,0.08) inset, 0 0 34px rgba(224,64,72,0.55)"
              : "0 0 0 1px rgba(255,255,255,0.5) inset, 0 8px 24px rgba(192,39,45,0.18)"
            : isDark
              ? "0 0 22px rgba(192,39,45,0.22)"
              : "0 4px 12px rgba(22,16,15,0.06)",
        }}
      >
        <img
          src={emblem}
          alt="Ethixweb"
          draggable={false}
          className="h-6 w-6 select-none object-contain transition-[filter] duration-500"
          style={{ filter: active && isDark ? EMBLEM_WHITE_FILTER : EMBLEM_CRIMSON_FILTER }}
        />
      </div>

      {/* Chips */}
      {SHIFT_ITEMS.map((item) => (
        <div
          key={item.before}
          // The 5 chips sit at fixed % positions on a tight pentagon around
          // the hub, so their center-to-center spacing shrinks and grows
          // with the widget's own container (only ~224px wide at a 320px
          // viewport). A wide icon-beside-text chip has no room to grow
          // before adjacent chips collide - so text stacks under the icon
          // instead of beside it, letting each chip stay narrow (avoiding
          // collisions with its neighbors) while still giving labels the
          // full chip width per line (avoiding the overflow that same
          // narrowness used to cause back when the icon ate into that width).
          className="absolute w-[60px] -translate-x-1/2 -translate-y-1/2 min-[360px]:w-[72px] sm:w-28"
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
        >
          <div
            // Fixed per-tier so all 5 cards render at identical height
            // regardless of how many lines their own label wraps to
            // (measured empirically: tallest label needs 101px/87px/99px at
            // the 60px/72px/112px chip-width tiers respectively).
            className="flex min-h-[104px] w-full flex-col items-center gap-1 rounded-xl border px-2 py-2 text-center backdrop-blur-md transition-[border-color,box-shadow,background] duration-500 ease-out min-[360px]:min-h-[90px] sm:min-h-[100px] sm:gap-1.5 sm:px-3 sm:py-3"
            style={{
              borderColor: active
                ? isDark
                  ? "rgba(224,64,72,0.5)"
                  : "rgba(192,39,45,0.35)"
                : isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.08)",
              background: active
                ? isDark
                  ? "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(12,7,7,0.94))"
                  : "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,248,248,0.95))"
                : isDark
                  ? "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(12,7,7,0.9))"
                  : "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(253,248,247,0.85))",
              boxShadow: active
                ? isDark
                  ? "0 10px 30px rgba(0,0,0,0.45), 0 0 20px rgba(224,64,72,0.3)"
                  : "0 8px 20px -4px rgba(22,16,15,0.08), 0 4px 12px -2px rgba(192,39,45,0.06)"
                : isDark
                  ? "0 4px 14px rgba(0,0,0,0.35)"
                  : "0 4px 12px rgba(22,16,15,0.05)",
            }}
          >
            <span
              className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8 ${
                isDark ? "bg-white/5" : "bg-foreground/5"
              }`}
            >
              <item.icon
                className={`h-3 w-3 transition-colors duration-500 sm:h-4 sm:w-4 ${
                  active
                    ? isDark
                      ? "text-white"
                      : "text-primary"
                    : isDark
                      ? "text-muted-foreground/60"
                      : "text-muted-foreground/80"
                }`}
                strokeWidth={1.8}
              />
              <AnimatePresence initial={false}>
                <motion.span
                  key={active ? "on" : "off"}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.5, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, scale: 0.5, rotate: 45 }}
                  transition={{ duration: 0.35 }}
                  className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                    isDark ? "border-[#0c0707]" : "border-white"
                  } ${active ? "bg-primary" : isDark ? "bg-black/70" : "bg-primary/10"}`}
                >
                  {active ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" strokeWidth={2.2} />
                  ) : (
                    <AlertTriangle className="h-2.5 w-2.5 text-primary" strokeWidth={2.4} />
                  )}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="relative w-full min-w-0">
              {/* Invisible spacer holding the taller of the two strings' box size,
                  so the cross-fading text below never causes a layout jump. */}
              <span
                aria-hidden="true"
                className="invisible block break-words text-[11px] font-semibold leading-tight sm:text-sm"
              >
                {item.before.length > item.after.length ? item.before : item.after}
              </span>
              <AnimatePresence initial={false}>
                <motion.span
                  key={active ? item.after : item.before}
                  initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute inset-0 break-words text-[11px] font-semibold leading-tight sm:text-sm ${
                    isDark ? "text-white/90" : "text-[#16100f]"
                  }`}
                >
                  {active ? item.after : item.before}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>
        </div>
      ))}

      <p className="sr-only" role="status" aria-live="polite">
        {active
          ? "Now showing: how operations run with Ethixweb, fully connected."
          : "Now showing: common issues most businesses face before Ethixweb."}
      </p>
    </div>
  );
}
