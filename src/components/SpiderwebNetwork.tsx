import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { DollarSign, Layers3, Palette, PhoneCall, TrendingUp } from "lucide-react";
import spiderweb from "@/assets/spiderweb.svg";
import emblem from "@/assets/emblem-transparent.webp";

/** Bump this whenever public/emblem-3d.html's content changes - it has no
 * content hash (it's a static public file, not a bundled/imported asset), so
 * without a cache-busting query param, browsers can keep serving a stale
 * cached copy across edits (this bit us: a real clear-color bugfix in that
 * file didn't show up in the browser until this was added). */
const EMBLEM_3D_VERSION = 5;

/** Root-cause fix for the clip-vs-halo conflict (rather than trading one off
 * against the other): a rotation-angle sweep proved the letter's own worst-case
 * bbox reached 96.7% of the raw render's frame at near-edge-on angles, with
 * the soft "halo" (transmission-material edge glow) starting only ~2px further
 * out - too close for any fixed crop to clear the halo without clipping the
 * letter at that same angle. Fixed by moving the scene's own camera back
 * (`public/emblem-3d.html`'s `ri.position.set(...)`, 1.5x its original
 * distance) so the model occupies far less of the raw frame at every angle
 * (worst case dropped to 61.0% of frame) - the crop's safety margin no longer
 * has to be fought for pixel-by-pixel. `EMBLEM_3D_BASE_SCALE` is then scaled
 * up by the resulting shrink (measured via a front-on bbox before/after the
 * dolly: 1129px -> 727px tall on a 1400px test canvas, ~1.553x) so the
 * letter's on-screen size is unchanged from before the dolly. */
const EMBLEM_3D_BASE_SCALE = 2.485;

/** Now does double duty: still the visible "transparent window" size (kept
 * enlarged per the earlier +15% request, folded into this bigger value), and
 * - more importantly post-dolly - the thing that sets the crop's safety
 * margin. crop fraction shown = EMBLEM_3D_WINDOW_GROWTH / EMBLEM_3D_BASE_SCALE
 * (derivation: EMBLEM_3D_SCALE = BASE_SCALE / WINDOW_GROWTH is how oversized
 * the iframe is vs. the fixed-size crop window, so 1 / EMBLEM_3D_SCALE is the
 * fraction of the raw render that stays visible). At 2.2 / 2.485 = 88.5% of
 * frame shown vs. a 61.0% worst-case letter bbox, that's a ~27-point margin -
 * comfortable, vs. the ~0.1-point margin that made clipping unavoidable
 * before the dolly. Raising WINDOW_GROWTH alone (no change to BASE_SCALE)
 * only grows the crop margin - it cancels out of the letter's own on-screen
 * size (stageScale, measured off this box's real on-page width, grows by the
 * same factor SCALE shrinks by), so this is the correct lever if more margin
 * is ever needed again without touching the letter's visible size. */
const EMBLEM_3D_WINDOW_GROWTH = 2.2;
const EMBLEM_3D_SCALE = EMBLEM_3D_BASE_SCALE / EMBLEM_3D_WINDOW_GROWTH;

/** The emblem's on-page box is tiny (~20-60px depending on device) and that
 * tiny box's exact pixel size differs between mobile and desktop. Sizing the
 * iframe directly off that box (percentage-based) meant the 3D tool's own
 * internal camera/resize logic was rendering at a different, inconsistent
 * absolute resolution on each device - which is what actually caused the crop
 * to look right in testing but wrong (letter cut off on one device, still
 * haloed on the other) once real devices were involved. Fix: always render
 * the 3D scene at this fixed, generous resolution regardless of device, then
 * measure the real on-page box (via ResizeObserver) and CSS-`transform:
 * scale()` the whole (already-cropped) stage down to fit it. This decouples
 * "what the 3D tool thinks it's rendering" from "how big it visually ends up"
 * - the tool always sees the same consistent canvas size, only the final
 * compositing shrinks it. */
const EMBLEM_3D_STAGE_PX = 320;

/* ── Geometry ─────────────────────────────────────────────────────────────────
 * Everything lives in the artwork's own coordinate space (viewBox 1234x772) so
 * the interactive overlay, the emblem, and the badges stay perfectly registered
 * with the drawn web at every viewport size. The hub of the drawn web sits at
 * 55.3% / 45.7% of the image. */
const VB_W = 1234;
const VB_H = 772;
const HUB = { x: 682, y: 353 };
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
  { label: "More conversions", icon: TrendingUp, x: 932, y: 67, xSm: 888, spoke: 4, attach: 0.85 },
  { label: "UI/UX Systems", icon: Layers3, x: 405, y: 443, spoke: 11, attach: 0.42 },
  { label: "Revenue tracked", icon: DollarSign, x: 961, y: 447, xSm: 913, spoke: 6, attach: 0.62 },
  { label: "Design that converts", icon: Palette, x: 504, y: 692, spoke: 9, attach: 0.85 },
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

function useIsSmall() {
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setSmall(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return small;
}

/** Object depth, front face at FRONT_Z down to the back face at BACK_Z. Was
 * 2/-14 (16-unit gap): fine when ~80 rim layers filled the space between, but
 * with just two faces left (see the comment below), CSS perspective parallax
 * makes them visibly split apart into two separate panels near edge-on
 * rotation angles (~90/270deg) - a real regression once the rim stack was
 * removed. Shrinking the gap (paired with a longer `perspective` on the
 * wrapper, below) reduces that parallax split to where it's no longer
 * noticeable at this element's small on-screen size. */
const FRONT_Z = 0.4;
const BACK_Z = -1.4;

/** Shared treatment for both the front and back faces: the source art is already
 * crimson glass, so this is just a thin polished-silver border plus a soft crimson
 * bloom - no color recolor needed. */
const EMBLEM_FACE_FILTER =
  "drop-shadow(0.6px 0 0 #e7ebf2) drop-shadow(-0.6px 0 0 #e7ebf2) " +
  "drop-shadow(0 0.6px 0 #e7ebf2) drop-shadow(0 -0.6px 0 #e7ebf2) " +
  "drop-shadow(0 0 2px rgba(235,240,248,0.35)) " +
  "drop-shadow(0 0 8px rgba(229,29,37,0.4)) drop-shadow(0 0 18px rgba(229,29,37,0.2))";
// The old flat, low-contrast "frosted white" source needed a translateZ stack of
// ~80 semi-transparent copies (a metal "rim") between the front/back faces to
// fake volume, since a single flat image read as paper-thin on its own. The
// current source (@/assets/emblem-transparent.webp) is a real 3D render with its
// own baked-in bevels/shading, so that stack is no longer needed for the shape to
// read as solid - and at this element's tiny on-screen size (~5.6% of the hero),
// stacking that many near-identical, differently-blurred copies of a
// high-contrast image produced a visible moire/banding artifact (the old source's
// flat, low-contrast art never showed this). Front + back face alone is enough.

/** The "E" emblem at the spiderweb's hub - the same live 3D model on every
 * device (desktop and mobile both), only skipped for `prefers-reduced-motion`.
 * An iframe embed of the same Three.js scene in HERO/ethixweb-logo-3d.html
 * (copied to public/emblem-3d.html with its demo checkerboard/UI stripped for
 * production). The source tool defaults to static (drag-to-rotate,
 * OrbitControls.autoRotate off) with free rotation on any axis; for the
 * embedded badge that's flipped to `autoRotate: true` (a plain
 * property-default edit in the public copy, not a rewrite of the bundle) so it
 * spins on its own, and the iframe is `pointer-events: none` so nothing but
 * that automatic spin ever moves it - OrbitControls.autoRotate only ever
 * orbits horizontally (around the up axis), so this gives exactly "automated,
 * horizontal-only" rotation with no drag/zoom possible. It's unmounted
 * entirely (not just paused) whenever scrolled out of view - see `inView`
 * below - so it isn't still costing GPU/battery long after the user has
 * scrolled past the hero, which matters more on mobile than desktop. This was
 * previously desktop-only (mobile got a lightweight CSS front+back-face image
 * instead) to protect mobile scroll performance; switched to live-3D
 * everywhere on request after the CSS version's thin/edge-on look wasn't good
 * enough. The CSS version (see the comment above `FRONT_Z`) still exists as
 * the fallback for reduced-motion users. */
function GlassEmblem({ mx, reduceMotion }: { mx: MotionValue<number>; reduceMotion: boolean }) {
  // Horizontal-only: rotateY (spin around the vertical axis) is the sole rotation -
  // no rotateX, so the object never tilts up/down, only turns left/right.
  const rotateY = useSpring(useTransform(mx, [-1, 1], reduceMotion ? [4, 4] : [1, 7]), {
    stiffness: 70,
    damping: 26,
  });

  // Pause the spin/float once scrolled out of view, so the animation isn't
  // still costing paint/composite time long after the user has scrolled past
  // the hero.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.01,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const animate = !reduceMotion && inView;
  // Live 3D stays desktop/tablet-only for now: on narrow layouts the embedded
  // scene loses its environment-map color and renders as a flat gray
  // silhouette (root cause not yet found - not a CSS/opacity/DPR issue, see
  // ethixweb_emblem_asset_pipeline memory). Falling back to the known-good
  // CSS front+back-face version there until that's diagnosed.
  const isSmall = useIsSmall();
  const showLive3D = !reduceMotion && !isSmall;

  // Measures the real on-page box (which differs between mobile and desktop)
  // so the fixed-resolution stage can be scaled down to fit it exactly - see
  // EMBLEM_3D_STAGE_PX above for why this exists. Default guess (~0.13, a
  // plausible desktop-ish fraction) only matters for one frame before the
  // observer reports the real size.
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const [stageScale, setStageScale] = useState(0.13);
  useEffect(() => {
    const el = stageWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setStageScale(w / EMBLEM_3D_STAGE_PX);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const stageHeightPx = EMBLEM_3D_STAGE_PX * (406 / 397);
  const iframePx = EMBLEM_3D_STAGE_PX * EMBLEM_3D_SCALE;
  const iframeHeightPx = stageHeightPx * EMBLEM_3D_SCALE;

  return (
    <div
      ref={wrapRef}
      className={`absolute aspect-[397/406] w-[5.6%] -translate-x-1/2 -translate-y-1/2 ${
        animate ? "animate-emblem-float" : ""
      }`}
      style={{
        left: "calc(53.8% - 5px)",
        top: "45.7%",
        // Only the CSS-fallback path (translateZ front/back faces) needs a 3D
        // rendering context - `perspective` must live on this wrapper (the
        // transformed element's parent) for that illusion to work. The live
        // iframe path is a flat 2D image of an already-3D render, so it has no
        // use for one - and forcing every browser into a preserve-3d/perspective
        // context anyway made this wrapper's descendant `transform: scale()`
        // (the stage's device-fit downscale) get composited through an
        // intermediate texture, which visibly blurred/haloed the letter's edge
        // once scaled down. Scoping this to the fallback path only removed it.
        ...(!showLive3D
          ? {
              perspective: "2400px",
              perspectiveOrigin: "50% 50%",
              transformStyle: "preserve-3d" as const,
            }
          : {}),
      }}
    >
      {showLive3D ? (
        <div
          ref={stageWrapRef}
          className="absolute aspect-[397/406] overflow-hidden"
          style={{
            // 10% bigger "window" than the shared outer wrapper (left/top -5%
            // centers it, since this sizes off the parent, not itself) - the
            // outer wrapper (used by the CSS-fallback path too) is untouched;
            // EMBLEM_3D_SCALE above compensates so the letter's own on-screen
            // size doesn't change, only the visible stage around it.
            width: `${EMBLEM_3D_WINDOW_GROWTH * 100}%`,
            left: `${((1 - EMBLEM_3D_WINDOW_GROWTH) / 2) * 100}%`,
            top: `${((1 - EMBLEM_3D_WINDOW_GROWTH) / 2) * 100}%`,
          }}
        >
          {/* Fixed-resolution stage (see EMBLEM_3D_STAGE_PX): the 3D tool always
           * renders at this same size, then gets scaled down via the measured
           * stageScale to fit whatever this box's real on-page size turns out
           * to be. Always mounted AND always visible - no unmount-on-scroll,
           * no display:none toggle, no visibility toggle, nothing that hides
           * or removes it. Two different "pause it off-screen" attempts each
           * reintroduced the same white-flash bug (unmounting reloads the
           * iframe, which briefly shows its nested document's default white
           * background before its own transparent CSS applies; `display:none`
           * risks the browser discarding/resetting the iframe's WebGL
           * compositing layer, which showed the same white flash again on
           * scroll-back). The only way to guarantee this can never happen
           * again is to never toggle its rendering state at all - this is a
           * tiny canvas, the always-on GPU cost is not worth reintroducing a
           * visible bug for. */}
          <div
            className="pointer-events-none absolute left-0 top-0 select-none overflow-hidden"
            style={{
              width: EMBLEM_3D_STAGE_PX,
              height: stageHeightPx,
              transform: `scale(${stageScale})`,
              transformOrigin: "top left",
            }}
          >
            {/* Oversized + centered within the stage (see EMBLEM_3D_SCALE) to
             * crop the transmission-pass halo out via the stage's overflow:hidden. */}
            <iframe
              src={`/emblem-3d.html?v=${EMBLEM_3D_VERSION}`}
              title="Ethixweb"
              loading="lazy"
              className="pointer-events-none absolute select-none"
              style={{
                border: 0,
                background: "transparent",
                width: iframePx,
                height: iframeHeightPx,
                left: (EMBLEM_3D_STAGE_PX - iframePx) / 2,
                top: (stageHeightPx - iframeHeightPx) / 2,
              }}
            />
          </div>
        </div>
      ) : (
        <motion.div
          style={{
            rotateY,
            transformStyle: "preserve-3d",
            transformOrigin: "50% 50%",
            willChange: "transform",
          }}
          whileHover={{ scale: 1.04 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div
            className={`relative aspect-[397/406] w-full ${animate ? "animate-emblem-spin" : ""}`}
            style={{
              transform: !animate ? "rotateY(4deg)" : undefined,
              transformOrigin: "50% 50%",
            }}
          >
            {/* Soft ambient backlight bleeding into the web behind the object - kept
             * subtle so it reads as ambience, not a wash over the letterform. */}
            <div
              className="absolute rounded-full"
              style={{
                left: "16%",
                top: "16%",
                width: "68%",
                height: "68%",
                background:
                  "radial-gradient(circle, rgba(229,29,37,0.16) 0%, rgba(229,29,37,0.08) 45%, transparent 72%)",
                filter: "blur(8px)",
              }}
            />

            {/* Back face - a mirror of the front face's crimson glass at the far end of
             * the depth, so the second half of the spin shows the same red material
             * instead of trailing off into bare chrome. Rendered first (furthest back). */}
            <img
              src={emblem}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="absolute inset-0 h-full w-full select-none"
              style={{ transform: `translateZ(${BACK_Z}px)`, filter: EMBLEM_FACE_FILTER }}
            />

            {/* Soft crimson core fill at the midpoint depth - not a repeated copy of
             * the image (that's what caused the moire artifact - see the comment
             * above FRONT_Z), just a plain blurred glow, so the gap between the two
             * faces reads as "solid glass" instead of empty space when the spin
             * carries the object edge-on. */}
            <div
              className="absolute inset-[6%] rounded-2xl"
              style={{
                background: "rgba(178, 60, 64, 0.55)",
                filter: "blur(6px)",
                transform: `translateZ(${(FRONT_Z + BACK_Z) / 2}px)`,
              }}
            />

            {/* Front face - the uploaded PNG, geometry and color untouched (already
             * crimson glass). A thin polished-silver border and soft crimson bloom are
             * chained on as drop-shadows, which - unlike the mask-based layers this
             * replaced - follow the image's own alpha reliably in every browser. */}
            <img
              src={emblem}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full select-none"
              style={{ transform: `translateZ(${FRONT_Z}px)`, filter: EMBLEM_FACE_FILTER }}
            />
            {/* Small glossy point-light reflection, centered on the object and kept small
             * and restrained so it reads as a highlight, not a wash over the letterform. */}
            <div
              className="absolute rounded-full"
              style={{
                left: "46.5%",
                top: "46.5%",
                width: "7%",
                height: "7%",
                background: "radial-gradient(circle, rgba(255,255,255,0.7), transparent 70%)",
                filter: "blur(1px)",
                transform: "translateZ(2.5px)",
              }}
            />
          </div>
        </motion.div>
      )}
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
 * overlay network (extra strands, rings, pulsing nodes, energy pulses and badge
 * connection lines) rendered in the same coordinate space. */
export function SpiderwebNetwork({
  mx,
  // Accepted for API symmetry with the mouse-tracking `mx`/`my` pair used
  // elsewhere (see HeroWebVisual), but this overlay only reacts to
  // horizontal position - vertical tracking isn't wired in on purpose.
  my: _my,
  reduceMotion,
  theme,
  showBadges = true,
  webOpacity = 1,
}: {
  mx: MotionValue<number>;
  my: MotionValue<number>;
  reduceMotion: boolean;
  theme: string;
  /** Hide the value-prop badges (e.g. "More booked jobs") for pages where that copy doesn't apply - the web and emblem stay. */
  showBadges?: boolean;
  /** Fades just the web artwork/strands/nodes, independent of the glass emblem
   * (which stays fully opaque) - for placements where the web should read as
   * a quiet background texture instead of the homepage's full-strength hero. */
  webOpacity?: number;
}) {
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
        <img
          src={spiderweb}
          alt=""
          aria-hidden="true"
          width={1234}
          height={772}
          className="h-auto w-full select-none"
          draggable={false}
          style={{
            opacity: 0.95,
            filter:
              "brightness(0.82) saturate(0.9) drop-shadow(0 0 5px rgba(229,29,37,0.55)) drop-shadow(0 0 26px rgba(229,29,37,0.32))",
          }}
        />

        {/* Interactive overlay network - same coordinate space as the artwork */}
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className={`absolute inset-0 h-full w-full ${reduceMotion ? "web-static" : ""}`}
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

          {/* Pulsing nodes, grouped per spoke so an energy pulse can flash them in order */}
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
                  cx={n.x}
                  cy={n.y}
                  r={2.4}
                  className="web-node"
                  style={
                    {
                      "--ni": n.ring,
                      animationDelay: `${((si * 211 + n.ring * 617) % 3000) - 3000}ms`,
                    } as React.CSSProperties
                  }
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

      <GlassEmblem mx={mx} reduceMotion={reduceMotion} />

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
