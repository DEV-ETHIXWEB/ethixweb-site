import { useReducedMotion } from "framer-motion";
import { useTheme } from "@/components/layout/ThemeProvider";
import { SpiderwebNetwork } from "@/components/shared/SpiderwebNetwork";

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

/**
 * The spiderweb + emblem hero visual, shared across every page that uses the
 * homepage's hero. It used to track the cursor (a window-wide mousemove and
 * deviceorientation listener feeding motion values) so the hub emblem could
 * tilt toward it. The emblem is still now, so that tracking had nothing left
 * to drive and is gone with it: no listener runs on every mouse move.
 */
export function HeroWebVisual({
  showBadges = true,
  webOpacity = 1,
}: {
  showBadges?: boolean;
  /** Fades the web artwork/strands while keeping the glass emblem at full opacity. */
  webOpacity?: number;
}) {
  const { theme } = useTheme();
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-190">
      <div className="absolute inset-6 rounded-full bg-primary/15 blur-[70px]" />
      <div className="relative h-80 sm:h-115 lg:h-130">
        {/* Interactive spiderweb network: artwork + overlay strands/nodes/pulses, with
         * the glass emblem at the hub and the badges wired into the web */}
        <SpiderwebNetwork
          reduceMotion={!!reduceMotion}
          theme={theme}
          showBadges={showBadges}
          webOpacity={webOpacity}
        />
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
      </div>
    </div>
  );
}
