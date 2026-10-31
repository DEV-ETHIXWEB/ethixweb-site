import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { DollarSign, MapPin, PhoneCall, PhoneMissed, Star } from "lucide-react";
import spiderweb from "@/assets/spiderweb.svg";
import spiderwebLight from "@/assets/spiderweb-light.svg";
// A single frame of the real 3D model (the Three.js scene that used to spin
// here live), captured straight on with a transparent background. It keeps the
// glass material and highlight of the live render at none of the cost: 12KB,
// painted once. 404x420.
import emblemHero from "@/assets/emblem-hero-3d.webp";
import { usePauseOffscreen } from "@/hooks/usePauseOffscreen";

/* ── Geometry ─────────────────────────────────────────────────────────────────
 * Everything lives in the artwork's own coordinate space (viewBox 1234x772) so
 * the interactive overlay, the emblem, and the badges stay perfectly registered
 * with the drawn web at every viewport size. The hub of the drawn web sits at
 * 55.3% / 45.7% of the image. */
const VB_W = 1234;
const VB_H = 772;
const HUB = { x: 682, y: 353 };
/** The light-mode artwork (spiderweb-light.svg) is a redraw of the same web on a
 * taller 1234x884 canvas, with its web drawn 57 units lower than the dark
 * artwork draws it in the 1234x772 canvas (both numbers measured by
 * cross-correlating rasterizations of the two files: horizontal offset is 0 at
 * identical width, vertical hub-hole alignment peaks at +57). Rendering the
 * light file at the same width inside the same 772-tall box, shifted up by
 * these 57 units with the overflow clipped, lands its hub exactly on HUB - so
 * the emblem, overlay strands, nodes and badges all stay registered without
 * touching any of that geometry. */
const LIGHT_VB_H = 884;
const LIGHT_SHIFT_Y = 57;
/** Vertical squash of the web's ellipse (the artwork is wider than tall). */
const EY = 0.64;

/** Overlay spokes: angle (deg, screen coords) + tip radius. Interleaved with the
 * artwork's own strands to add density without hiding the original drawing. */
const SPOKES: { angle: number; r: number }[] = [
  { angle: -160, r: 640 },
  { angle: -127, r: 600 },
  { angle: -95, r: 560 },
  { angle: -70, r: 545 },
  { angle: -49, r: 590 },
  { angle: -20, r: 630 },
  { angle: 19, r: 610 },
  { angle: 50, r: 575 },
  { angle: 85, r: 545 },
  { angle: 118, r: 520 },
  { angle: 145, r: 545 },
  { angle: 162, r: 525 },
];
const RING_FRACTIONS = [0.24, 0.42, 0.62, 0.85];

function spokePoint(spoke: { angle: number; r: number }, f: number) {
  const a = (spoke.angle * Math.PI) / 180;
  return {
    x: HUB.x + Math.cos(a) * spoke.r * f,
    y: HUB.y + Math.sin(a) * spoke.r * f * EY,
  };
}

const SPOKE_PATHS = SPOKES.map((s) => {
  const tip = spokePoint(s, 1);
  return `M${HUB.x},${HUB.y} L${tip.x.toFixed(1)},${tip.y.toFixed(1)}`;
});

/** One sagging arc per ring fraction, threaded through every spoke (closed loop). */
const RING_PATHS = RING_FRACTIONS.map((f) => {
  const pts = SPOKES.map((s) => spokePoint(s, f));
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 1; i <= pts.length; i++) {
    const p = pts[i % pts.length];
    const prev = pts[i - 1];
    const mid = { x: (p.x + prev.x) / 2, y: (p.y + prev.y) / 2 };
    const ctrl = {
      x: mid.x + (HUB.x - mid.x) * 0.13,
      y: mid.y + (HUB.y - mid.y) * 0.13,
    };
    d += ` Q${ctrl.x.toFixed(1)},${ctrl.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }
  return d;
});

const NODES = SPOKES.flatMap((s, si) =>
  RING_FRACTIONS.map((f, ri) => {
    const p = spokePoint(s, f);
    return { x: p.x, y: p.y, spoke: si, ring: ri };
  }),
);

/* ── Badges ───────────────────────────────────────────────────────────────────
 * Positions are the artwork-space equivalents of the reference layout (measured
 * against the reference hero at the lg design size). `spoke`/`attach` pick the
 * overlay node the badge's connection line grows from; `xSm` pulls the two
 * right-side badges inboard below lg so they stay on-screen. */
const BADGES = [
  { label: "More booked jobs", icon: PhoneCall, x: 470, y: 68, spoke: 1, attach: 0.85 },
  { label: "5-star reviews", icon: Star, x: 932, y: 67, xSm: 888, spoke: 4, attach: 0.85 },
  { label: "Missed calls answered", icon: PhoneMissed, x: 405, y: 443, spoke: 11, attach: 0.42 },
  { label: "Revenue tracked", icon: DollarSign, x: 961, y: 447, xSm: 913, spoke: 6, attach: 0.62 },
  { label: "Map Pack ranking", icon: MapPin, x: 504, y: 692, spoke: 9, attach: 0.85 },
] as const;

const BADGE_GEO = BADGES.map((b) => {
  const node = spokePoint(SPOKES[b.spoke], b.attach);
  return {
    node,
    line: `M${node.x.toFixed(1)},${node.y.toFixed(1)} L${b.x},${b.y}`,
    pulse: `M${HUB.x},${HUB.y} L${node.x.toFixed(1)},${node.y.toFixed(1)} L${b.x},${b.y}`,
  };
});

/** Distance in artwork units under which hovering a web node highlights its badge. */
const NODE_HOVER_RADIUS = 70;
const SPOKE_HOVER_DEG = 9;
const SPOKE_COOLDOWN_MS = 1400;

const SMALL_QUERY = "(max-width: 1023px)";

function subscribeIsSmall(callback: () => void) {
  const mq = window.matchMedia(SMALL_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

/** Was useState(false) + useEffect: that always painted one frame assuming
 * "not small" (desktop) before correcting itself post-mount, which is exactly
 * what a real Lighthouse mobile run caught as this component's CLS culprit -
 * the correction re-positioned/re-sized the artwork after first paint.
 * useSyncExternalStore reads the real matchMedia result synchronously before
 * the browser paints, so mobile never renders the wrong layout to begin with,
 * while still matching the server-rendered "not small" markup during
 * hydration (no hydration-mismatch warning). */
function useIsSmall() {
  return useSyncExternalStore(
    subscribeIsSmall,
    () => window.matchMedia(SMALL_QUERY).matches,
    () => false,
  );
}

/** The "E" at the spiderweb's hub. Deliberately still.
 *
 * It used to be a live Three.js scene in an iframe (public/emblem-3d.html,
 * 567KB) auto-spinning on desktop, with a CSS preserve-3d spin, a float
 * animation and a pointer-tracking spring layered over it, and a separate
 * two-face CSS version for phones. Between them that cost 1.3s of script
 * evaluation (more than the whole app bundle), a 1s frozen frame on the first
 * scroll, a second rendering engine running every frame while the hero was
 * on screen, and a long tail of bugs: white flashes, clipped edges, halos,
 * moire, and a flat grey render on phones.
 *
 * It is now one frame of that same 3D model, captured straight on: the glass
 * and size of the live render, painted once, on every device. The letter is drawn at 1.35x the
 * hub box, which is how large the live render appeared (its scene was
 * oversized into the box to crop its halo); the flat artwork at 1x read as
 * small and sticker-like by comparison. */
function GlassEmblem({ theme }: { theme: string }) {
  return (
    <div
      className="pointer-events-none absolute aspect-[397/406] w-[5.6%] -translate-x-1/2 -translate-y-1/2 select-none"
      style={{ left: "calc(53.8% - 5px)", top: "45.7%" }}
    >
      {/* Soft crimson backlight bleeding into the web behind the letter. A
          gradient alone, no blur filter, so it costs nothing to composite. */}
      <div
        aria-hidden="true"
        className="absolute -inset-[55%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(229,29,37,0.2) 0%, rgba(229,29,37,0.08) 42%, transparent 70%)",
        }}
      />
      <img
        src={emblemHero}
        alt=""
        aria-hidden="true"
        width={404}
        height={420}
        draggable={false}
        decoding="async"
        className="absolute left-1/2 top-1/2 h-[135%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2"
        style={{
          // A soft lift off the web and a faint crimson bloom, both static.
          // Light mode gets a tighter crimson-tinted shadow instead: a black
          // one turned into a grey smudge on the pale background, and the
          // pale glass needs a little more saturation to hold its edges.
          filter:
            theme === "light"
              ? "saturate(1.25) contrast(1.06) drop-shadow(0 5px 8px rgba(120,20,25,0.22))"
              : "drop-shadow(0 8px 14px rgba(0,0,0,0.45)) drop-shadow(0 0 16px rgba(229,29,37,0.28))",
        }}
      />
    </div>
  );
}

function HeroBadge({
  badge,
  x,
  active,
  highlighted,
  reduceMotion,
  theme,
  onHover,
}: {
  badge: (typeof BADGES)[number];
  x: number;
  active: boolean;
  highlighted: boolean;
  reduceMotion: boolean;
  theme: string;
  onHover: (hovering: boolean) => void;
}) {
  const Icon = badge.icon;
  const lift = !reduceMotion && (active || highlighted);
  return (
    <motion.div
      className="glass absolute z-20 flex h-7 cursor-default items-center justify-center gap-1 whitespace-nowrap rounded-full px-2 sm:h-auto sm:gap-2.5 sm:px-5 sm:py-3"
      style={{
        left: `${(x / VB_W) * 100}%`,
        top: `${(badge.y / VB_H) * 100}%`,
        translateX: "-50%",
        translateY: "-50%",
      }}
      animate={{
        y: lift ? -10 : 0,
        scale: active ? 1.05 : lift ? 1.02 : 1,
        boxShadow: lift
          ? "0 8px 28px rgba(229,29,37,0.35), 0 0 0 1px rgba(255,120,128,0.45)"
          : "0 0 0 rgba(229,29,37,0), 0 0 0 0px rgba(255,120,128,0)",
      }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      onHoverStart={() => onHover(true)}
      onHoverEnd={() => onHover(false)}
    >
      <Icon
        className="h-3 w-3 shrink-0 sm:h-4 sm:w-4"
        style={{ color: theme === "light" ? "rgba(192,39,45,0.9)" : "rgba(225,110,118,0.85)" }}
      />
      <span
        className="hidden text-[11px] font-medium min-[375px]:inline sm:text-sm"
        style={{ color: theme === "light" ? "rgba(20,16,15,0.88)" : "rgba(255,255,255,0.85)" }}
      >
        {badge.label}
      </span>
    </motion.div>
  );
}

/** The hero's spiderweb: the drawn artwork as the base layer, plus an interactive
 * overlay network (extra strands, rings, nodes, hover energy pulses and badge
 * connection lines) rendered in the same coordinate space. */
export function SpiderwebNetwork({
  reduceMotion,
  theme,
  showBadges = true,
  webOpacity = 1,
}: {
  reduceMotion: boolean;
  theme: string;
  /** Hide the value-prop badges (e.g. "More booked jobs") for pages where that copy doesn't apply - the web and emblem stay. */
  showBadges?: boolean;
  /** Fades just the web artwork/strands/nodes, independent of the glass emblem
   * (which stays fully opaque) - for placements where the web should read as
   * a quiet background texture instead of the homepage's full-strength hero. */
  webOpacity?: number;
}) {
  const overlayRef = usePauseOffscreen<SVGSVGElement>();
  const wrapRef = useRef<HTMLDivElement>(null);
  const spokeGroupRefs = useRef<(SVGGElement | null)[]>([]);
  const spokeAnimRefs = useRef<(SVGAnimationElement | null)[]>([]);
  const spokeFadeRefs = useRef<(SVGAnimationElement | null)[]>([]);
  const connectorAnimRefs = useRef<(SVGAnimationElement | null)[]>([]);
  const connectorFadeRefs = useRef<(SVGAnimationElement | null)[]>([]);
  const cooldownRef = useRef<number[]>(SPOKES.map(() => 0));
  const rafRef = useRef(0);
  const [hoveredBadge, setHoveredBadge] = useState(-1);
  const [nearBadge, setNearBadge] = useState(-1);
  const isSmall = useIsSmall();

  const fireSpoke = (si: number) => {
    const now = performance.now();
    if (now - cooldownRef.current[si] < SPOKE_COOLDOWN_MS) return;
    cooldownRef.current[si] = now;
    const group = spokeGroupRefs.current[si];
    if (group) {
      group.classList.remove("spoke-active");
      // Force a reflow so re-adding the class restarts the node flash animation
      void group.getBoundingClientRect();
      group.classList.add("spoke-active");
      window.setTimeout(() => group.classList.remove("spoke-active"), 1100);
    }
    spokeAnimRefs.current[si]?.beginElement();
    spokeFadeRefs.current[si]?.beginElement();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (reduceMotion || e.pointerType !== "mouse") return;
    if (rafRef.current) return;
    const { clientX, clientY } = e;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const u = ((clientX - rect.left) / rect.width) * VB_W;
      const v = ((clientY - rect.top) / rect.height) * VB_H;
      const dx = u - HUB.x;
      const dy = (v - HUB.y) / EY;
      const radius = Math.hypot(dx, dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      // Nearest spoke by angle -> energy pulse along it
      let best = -1;
      let bestDiff = SPOKE_HOVER_DEG;
      SPOKES.forEach((s, i) => {
        let diff = Math.abs(angle - s.angle);
        if (diff > 180) diff = 360 - diff;
        if (diff < bestDiff && radius < s.r * 1.02 && radius > 40) {
          best = i;
          bestDiff = diff;
        }
      });
      if (best >= 0) fireSpoke(best);

      // Near a badge's attachment node -> surface that badge
      let near = -1;
      BADGE_GEO.forEach((g, i) => {
        if (Math.hypot(u - g.node.x, v - g.node.y) < NODE_HOVER_RADIUS) near = i;
      });
      setNearBadge(near);
    });
  };

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const onBadgeHover = (i: number) => (hovering: boolean) => {
    setHoveredBadge(hovering ? i : -1);
    if (hovering && !reduceMotion) {
      connectorAnimRefs.current[i]?.beginElement();
      connectorFadeRefs.current[i]?.beginElement();
    }
  };

  return (
    <div
      ref={wrapRef}
      className="absolute w-[170%]"
      style={{
        left: "55.6%",
        top: "37.1%",
        transform: "translate(-55.3%, -45.7%) perspective(1400px) rotateX(4deg) rotateY(-6deg)",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setNearBadge(-1)}
    >
      <div style={{ opacity: webOpacity }}>
        {theme === "light" ? (
          /* Same-size box as the dark artwork's natural render (w-full at the
           * 1234:772 aspect), so the wrapper's height - and every %-positioned
           * element registered to it - is identical in both themes. The
           * taller light file is aligned inside it per LIGHT_SHIFT_Y. */
          <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: `${VB_W} / ${VB_H}` }}
          >
            <img
              src={spiderwebLight}
              alt=""
              aria-hidden="true"
              width={VB_W}
              height={LIGHT_VB_H}
              className="absolute left-0 h-auto w-full select-none"
              draggable={false}
              style={{
                top: `${(-LIGHT_SHIFT_Y / VB_H) * 100}%`,
                opacity: 0.95,
                // The artwork's palette is baked a rich crimson for light mode
                // (radially graded: deepest at the hub, lightening and fading
                // toward the rim), so no brightness/saturate grade - and the
                // bloom is ~75% weaker than dark mode's and toned to match: a
                // strong bright-red halo reads cheap on a light background.
                filter:
                  "drop-shadow(0 0 4px rgba(192,36,42,0.22)) drop-shadow(0 0 18px rgba(192,36,42,0.12))",
              }}
            />
          </div>
        ) : (
          <img
            src={spiderweb}
            alt=""
            aria-hidden="true"
            width={VB_W}
            height={VB_H}
            fetchPriority="high"
            decoding="async"
            className="h-auto w-full select-none"
            draggable={false}
            style={{
              opacity: 0.95,
              // SVG-sourced <img> elements don't reliably get the browser's
              // automatic aspect-ratio-from-attributes reservation the way
              // raster images do (confirmed via Lighthouse: "Media element
              // lacking an explicit size" on this exact element, causing a
              // 0.284 CLS once the file loads and the browser recalculates).
              // The light-theme sibling doesn't need this - its wrapper div
              // already sets aspect-ratio and this element is absolutely
              // positioned inside it, so it can't affect the box size.
              aspectRatio: `${VB_W} / ${VB_H}`,
              filter:
                "brightness(0.82) saturate(0.9) drop-shadow(0 0 5px rgba(229,29,37,0.55)) drop-shadow(0 0 26px rgba(229,29,37,0.32))",
            }}
          />
        )}

        {/* Interactive overlay network - same coordinate space as the artwork */}
        {/* will-change keeps this overlay on its own layer, so a hover flash
            repaints only the overlay and never the drop-shadow-filtered
            artwork underneath. usePauseOffscreen freezes anything in flight
            once the hero is scrolled past. */}
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className={`absolute inset-0 h-full w-full will-change-transform ${reduceMotion ? "web-static" : ""}`}
          ref={overlayRef}
          aria-hidden="true"
        >
          {/* Density strands + rings, faint so the drawn web stays the star */}
          {SPOKE_PATHS.map((d, i) => (
            <path key={`s${i}`} d={d} className="web-strand" fill="none" />
          ))}
          {RING_PATHS.map((d, i) => (
            <path key={`r${i}`} d={d} className="web-ring" fill="none" />
          ))}

          {/* Badge connection lines */}
          {showBadges &&
            BADGE_GEO.map((g, i) => (
              <path
                key={`c${i}`}
                d={g.line}
                fill="none"
                className={`web-connector ${hoveredBadge === i || nearBadge === i ? "is-active" : ""}`}
              />
            ))}

          {/* Nodes, grouped per spoke so an energy pulse can flash them in order */}
          {SPOKES.map((_, si) => (
            <g
              key={`g${si}`}
              ref={(el) => {
                spokeGroupRefs.current[si] = el;
              }}
            >
              {NODES.filter((n) => n.spoke === si).map((n, ni) => (
                <circle
                  key={ni}
                  cx={n.x.toFixed(1)}
                  cy={n.y.toFixed(1)}
                  r={2.4}
                  className="web-node"
                  // Only the ring index: the hover flash staggers outward
                  // from it. An inline animationDelay used to sit here for the
                  // idle pulse, and since inline style beats the stylesheet it
                  // also overrode the flash's own delay, so most hover flashes
                  // started already finished and never showed.
                  style={{ "--ni": n.ring } as React.CSSProperties}
                />
              ))}
            </g>
          ))}

          {/* Energy pulse dots - one per spoke, driven by SMIL, begun from JS on hover */}
          {SPOKE_PATHS.map((d, i) => (
            <circle key={`p${i}`} r={3.4} fill="#ffb4b8" opacity="0" className="web-pulse-dot">
              <animateMotion
                ref={(el: SVGAnimationElement | null) => {
                  spokeAnimRefs.current[i] = el;
                }}
                dur="0.8s"
                begin="indefinite"
                path={d}
                keyPoints="0;1"
                keyTimes="0;1"
                calcMode="linear"
              />
              <animate
                ref={(el: SVGAnimationElement | null) => {
                  spokeFadeRefs.current[i] = el;
                }}
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.12;0.75;1"
                dur="0.8s"
                begin="indefinite"
              />
            </circle>
          ))}

          {/* Energy pulses that run hub -> node -> badge when a badge is hovered */}
          {showBadges &&
            BADGE_GEO.map((g, i) => (
              <circle key={`bp${i}`} r={3.2} fill="#ffc2c6" opacity="0" className="web-pulse-dot">
                <animateMotion
                  ref={(el: SVGAnimationElement | null) => {
                    connectorAnimRefs.current[i] = el;
                  }}
                  dur="0.7s"
                  begin="indefinite"
                  path={g.pulse}
                  keyPoints="0;1"
                  keyTimes="0;1"
                  calcMode="linear"
                />
                <animate
                  ref={(el: SVGAnimationElement | null) => {
                    connectorFadeRefs.current[i] = el;
                  }}
                  attributeName="opacity"
                  values="0;1;1;0"
                  keyTimes="0;0.15;0.8;1"
                  dur="0.7s"
                  begin="indefinite"
                />
              </circle>
            ))}
        </svg>
      </div>

      <GlassEmblem theme={theme} />

      {showBadges &&
        BADGES.map((badge, i) => (
          <HeroBadge
            key={badge.label}
            badge={badge}
            x={isSmall && "xSm" in badge && badge.xSm ? badge.xSm : badge.x}
            active={hoveredBadge === i}
            highlighted={nearBadge === i}
            reduceMotion={reduceMotion}
            theme={theme}
            onHover={onBadgeHover(i)}
          />
        ))}
    </div>
  );
}
