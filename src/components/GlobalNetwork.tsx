import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Activity, Radio, TrendingUp, Wrench, Zap } from "lucide-react";
import { Reveal } from "./Reveal";

// ─── Types ────────────────────────────────────────────────────────────────────
type City = {
  name: string;
  lat: number;
  lon: number;
  tier: "primary" | "secondary" | "hub";
  tz: string;
};
type Packet = { route: number; p: number; speed: number; opacity: number; r: number };

// ─── Data ─────────────────────────────────────────────────────────────────────
const CITIES: City[] = [
  { name: "Seattle", lat: 47.6, lon: -122.3, tier: "primary", tz: "America/Los_Angeles" },
  { name: "Utah", lat: 40.76, lon: -111.89, tier: "primary", tz: "America/Denver" },
  { name: "New York", lat: 40.71, lon: -74.0, tier: "primary", tz: "America/New_York" },
  { name: "Canada", lat: 43.65, lon: -79.38, tier: "secondary", tz: "America/Toronto" },
  { name: "United Kingdom", lat: 51.5, lon: -0.12, tier: "secondary", tz: "Europe/London" },
  { name: "India", lat: 12.97, lon: 77.59, tier: "hub", tz: "Asia/Kolkata" },
];

const ROUTES: [string, string][] = [
  ["India", "Seattle"],
  ["India", "Utah"],
  ["India", "New York"],
  ["India", "United Kingdom"],
  ["India", "Canada"],
  ["Seattle", "Utah"],
  ["Seattle", "New York"],
  ["Seattle", "Canada"],
  ["Seattle", "United Kingdom"],
  ["Utah", "New York"],
  ["Utah", "Canada"],
  ["New York", "Canada"],
  ["New York", "United Kingdom"],
  ["Canada", "United Kingdom"],
];

const GHOST_ROUTES: [string, string, number, boolean][] = [
  ["India", "Seattle", 0.8, false],
  ["India", "Seattle", 0.28, true],
  ["India", "New York", 0.74, false],
  ["India", "United Kingdom", 0.64, false],
  ["India", "Canada", 0.84, false],
  ["India", "Utah", 0.72, false],
  ["Seattle", "United Kingdom", 0.7, false],
  ["Seattle", "New York", 0.58, true],
  ["New York", "United Kingdom", 0.62, false],
  ["Canada", "United Kingdom", 0.66, false],
  ["India", "New York", 0.44, true],
  ["India", "Seattle", 0.52, true],
];

const CLOCKS = [
  { label: "India Hub", tz: "Asia/Kolkata" },
  { label: "Seattle", tz: "America/Los_Angeles" },
  { label: "Utah", tz: "America/Denver" },
  { label: "New York", tz: "America/New_York" },
  { label: "Canada", tz: "America/Toronto" },
  { label: "UK", tz: "Europe/London" },
];

const STATUS_CARDS = [
  {
    city: "Seattle",
    icon: Activity,
    label: "Active Projects",
    status: "Online Now",
    tz: "America/Los_Angeles",
    tone: "emerald",
  },
  {
    city: "Utah",
    icon: Wrench,
    label: "Maintenance & Support",
    status: "Available",
    tz: "America/Denver",
    tone: "amber",
  },
  {
    city: "New York",
    icon: TrendingUp,
    label: "Strategy & Growth",
    status: "Responding Fast",
    tz: "America/New_York",
    tone: "emerald",
  },
];

const METRICS = [
  { v: "50+", l: "Projects Delivered" },
  { v: "<1h", l: "Avg. Response Time" },
  { v: "US First", l: "Operations Focus" },
  { v: "24/7", l: "Global Availability" },
];

// ─── Continent polygons for land detection ────────────────────────────────────
// [lat, lon][] - equirectangular, used to fill an offscreen canvas once
const CONTINENT_POLYS: [number, number][][] = [
  // North America
  [
    [72, -141],
    [72, -68],
    [58, -62],
    [50, -55],
    [44, -66],
    [42, -70],
    [36, -76],
    [28, -80],
    [24, -81],
    [20, -87],
    [15, -83],
    [8, -77],
    [9, -79],
    [9, -83],
    [15, -88],
    [16, -90],
    [18, -100],
    [22, -106],
    [30, -115],
    [32, -117],
    [38, -122],
    [48, -124],
    [58, -136],
    [60, -163],
    [64, -168],
    [70, -163],
    [72, -152],
    [72, -141],
  ],
  // South America
  [
    [12, -72],
    [10, -63],
    [8, -60],
    [4, -52],
    [2, -50],
    [-4, -36],
    [-10, -37],
    [-23, -43],
    [-30, -50],
    [-34, -53],
    [-40, -62],
    [-52, -68],
    [-55, -67],
    [-50, -73],
    [-42, -74],
    [-28, -71],
    [-18, -70],
    [-5, -80],
    [0, -80],
    [8, -77],
    [12, -72],
  ],
  // Greenland
  [
    [76, -70],
    [76, -22],
    [70, -22],
    [60, -44],
    [60, -48],
    [62, -50],
    [64, -52],
    [68, -54],
    [72, -56],
    [76, -70],
  ],
  // Eurasia (Europe + Russia + mainland Asia)
  [
    [72, -22],
    [72, 28],
    [72, 70],
    [72, 142],
    [72, 180],
    [60, 162],
    [50, 142],
    [42, 132],
    [36, 122],
    [22, 114],
    [10, 104],
    [1, 104],
    [1, 100],
    [6, 100],
    [14, 100],
    [18, 94],
    [22, 92],
    [20, 88],
    [8, 78],
    [8, 76],
    [10, 76],
    [18, 74],
    [22, 68],
    [24, 66],
    [30, 62],
    [38, 52],
    [41, 48],
    [41, 40],
    [37, 36],
    [36, 28],
    [44, 28],
    [50, 20],
    [55, 22],
    [60, 28],
    [70, 28],
    [72, -22],
  ],
  // Africa
  [
    [37, 10],
    [37, 37],
    [30, 34],
    [22, 38],
    [12, 44],
    [4, 44],
    [0, 42],
    [-10, 40],
    [-20, 35],
    [-26, 33],
    [-35, 26],
    [-34, 18],
    [-30, 16],
    [-18, 12],
    [-4, 12],
    [2, 10],
    [8, 4],
    [16, -17],
    [20, -17],
    [30, -10],
    [37, 10],
  ],
  // Western & Southern Europe (France, Iberia, Italy, Scandinavia)
  [
    [71, 5],
    [71, 30],
    [60, 30],
    [45, 20],
    [36, 15],
    [36, -6],
    [43, -9],
    [48, -5],
    [51, 4],
    [58, 6],
    [63, 5],
    [71, 5],
  ],
  // Arabian Peninsula
  [
    [30, 35],
    [22, 39],
    [16, 43],
    [12, 44],
    [16, 53],
    [23, 58],
    [27, 51],
    [30, 48],
    [33, 46],
    [33, 38],
    [30, 35],
  ],
  // India
  [
    [24, 68],
    [29, 71],
    [31, 77],
    [28, 88],
    [22, 91],
    [16, 82],
    [11, 79],
    [8, 77],
    [12, 75],
    [16, 73],
    [21, 70],
    [24, 68],
  ],
  // Indonesia / Southeast Asia islands
  [
    [6, 95],
    [-6, 106],
    [-8, 114],
    [-9, 120],
    [-2, 134],
    [-9, 142],
    [0, 130],
    [5, 125],
    [14, 121],
    [10, 109],
    [6, 95],
  ],
  // Australia
  [
    [-15, 130],
    [-12, 136],
    [-16, 140],
    [-20, 148],
    [-28, 153],
    [-38, 146],
    [-38, 140],
    [-32, 116],
    [-22, 114],
    [-16, 122],
    [-14, 127],
    [-15, 130],
  ],
  // Japan (simplified)
  [
    [40, 140],
    [35, 135],
    [33, 130],
    [34, 131],
    [36, 136],
    [38, 141],
    [40, 140],
  ],
  // Great Britain
  [
    [58, -5],
    [60, -2],
    [58, 0],
    [52, 2],
    [50, -1],
    [50, -5],
    [52, -5],
    [54, -4],
    [58, -5],
  ],
  // Iceland
  [
    [66, -24],
    [66, -13],
    [63, -14],
    [62, -20],
    [64, -24],
    [66, -24],
  ],
  // New Zealand (South)
  [
    [-40, 172],
    [-46, 168],
    [-46, 171],
    [-43, 173],
    [-40, 172],
  ],
  // Madagascar
  [
    [-12, 49],
    [-26, 44],
    [-26, 47],
    [-15, 50],
    [-12, 49],
  ],
  // Ireland
  [
    [55, -6],
    [52, -10],
    [52, -6],
    [54, -6],
    [55, -6],
  ],
];

// Build a 360×180 land bitmap from continent polygons (run once on mount)
let _landMap: Uint8Array | null = null;
function getLandMap(): Uint8Array {
  if (_landMap) return _landMap;
  const W = 360,
    H = 180;
  const cnv = document.createElement("canvas");
  cnv.width = W;
  cnv.height = H;
  const ctx = cnv.getContext("2d")!;
  ctx.fillStyle = "#fff";
  for (const poly of CONTINENT_POLYS) {
    ctx.beginPath();
    for (let i = 0; i < poly.length; i++) {
      const [lat, lon] = poly[i];
      const x = ((lon + 180) / 360) * W;
      const y = ((90 - lat) / 180) * H;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }
  const raw = ctx.getImageData(0, 0, W, H).data;
  _landMap = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) _landMap[i] = raw[i * 4] > 128 ? 1 : 0;
  return _landMap;
}

function isLand(lat: number, lon: number, map: Uint8Array): boolean {
  const col = Math.min(359, Math.max(0, Math.round(((lon + 180) / 360) * 360)));
  const row = Math.min(179, Math.max(0, Math.round(((90 - lat) / 180) * 180)));
  return map[row * 360 + col] === 1;
}

// ─── Math helpers ─────────────────────────────────────────────────────────────
function project(lat: number, lon: number, rotY: number, rotX: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + rotY) * (Math.PI / 180);
  const x = Math.sin(phi) * Math.cos(theta);
  const y = Math.cos(phi);
  const z = Math.sin(phi) * Math.sin(theta);
  const cx = Math.cos((rotX * Math.PI) / 180);
  const sx = Math.sin((rotX * Math.PI) / 180);
  return { x, y: y * cx - z * sx, z: y * sx + z * cx };
}

// Shared tick - one setInterval drives all clocks
const _clockSubs = new Set<() => void>();
let _clockTimer: ReturnType<typeof setInterval> | null = null;
function _startClock() {
  if (_clockTimer) return;
  _clockTimer = setInterval(() => _clockSubs.forEach((fn) => fn()), 1000);
}
function _stopClock() {
  if (_clockSubs.size === 0 && _clockTimer) {
    clearInterval(_clockTimer);
    _clockTimer = null;
  }
}

function makeFmt(tz: string) {
  return (d: Date) =>
    new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: tz,
    }).format(d);
}

function useClock(tz: string) {
  const fmt = makeFmt(tz);
  const [time, setTime] = useState(() => fmt(new Date()));
  useEffect(() => {
    const f = makeFmt(tz);
    const tick = () => setTime(f(new Date()));
    _clockSubs.add(tick);
    _startClock();
    return () => {
      _clockSubs.delete(tick);
      _stopClock();
    };
  }, [tz]);
  return time;
}

export type GlobeStageHandle = { focusOn: (cityName: string) => void };

type FocusState = {
  active: boolean;
  phase: "spinY" | "spinX" | "hold";
  city: string;
  phaseT0: number;
  fromY: number;
  fromX: number;
  toY: number;
  toX: number;
  holdUntil: number;
};

// Horizontal (longitude) spin runs first, then vertical (latitude) tilt - two
// distinct stages so the motion reads as "spin around, then tip up/down" -
// totals 1.8s, inside the 1.5-2s premium-transition window.
const FOCUS_SPIN_Y_MS = 1000;
const FOCUS_SPIN_X_MS = 800;
const FOCUS_HOLD_MS = 3000;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ─── Globe stage ──────────────────────────────────────────────────────────────
const GlobeStage = forwardRef<GlobeStageHandle>(function GlobeStage(_props, ref) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState(608);
  const [overlayTick, setOverlayTick] = useState(0);
  const [focusedCity, setFocusedCity] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const rotYRef = useRef(20);
  const rotXRef = useRef(-13);
  const velYRef = useRef(0.022);
  const velXRef = useRef(0);
  const draggingRef = useRef(false);
  const lastInteractRef = useRef(0);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const packetsRef = useRef<Packet[]>([]);
  const ghostPacketsRef = useRef<Packet[]>([]);
  const landMapRef = useRef<Uint8Array | null>(null);
  const focusRef = useRef<FocusState | null>(null);

  const focusOn = useCallback((cityName: string) => {
    if (focusRef.current?.active || draggingRef.current) return; // ignore mid-animation/drag clicks
    const city = CITIES.find((c) => c.name === cityName);
    if (!city) return;

    velYRef.current = 0;
    velXRef.current = 0;

    const fromY = rotYRef.current;
    const fromX = rotXRef.current;
    const rawToY = 90 - city.lon;
    // shortest angular path, no long way around
    const delta = ((((rawToY - fromY) % 360) + 540) % 360) - 180;
    // with rotY landing the city's meridian dead-center (x=0, z=1 facing the
    // camera), rotX = lat puts it at the vertical center too - exact middle
    const toX = Math.max(-55, Math.min(55, city.lat));

    focusRef.current = {
      active: true,
      phase: "spinY",
      city: cityName,
      phaseT0: performance.now(),
      fromY,
      fromX,
      toY: fromY + delta,
      toX,
      holdUntil: 0,
    };
    setFocusedCity(cityName);
  }, []);

  useImperativeHandle(ref, () => ({ focusOn }), [focusOn]);

  // Pre-generate Fibonacci sphere points with land tag
  const spherePointsRef = useRef<{ lat: number; lon: number; land: boolean }[]>([]);
  // Pre-sampled ocean indices - computed once, avoids Math.random() every frame
  const oceanSetRef = useRef<Set<number>>(new Set());
  const visibleRef = useRef(false);

  useEffect(() => {
    landMapRef.current = getLandMap();
    const map = landMapRef.current;
    const count = 7200;
    const golden = Math.PI * (Math.sqrt(5) - 1);
    const pts: { lat: number; lon: number; land: boolean }[] = [];
    const oceanSet = new Set<number>();
    for (let i = 0; i < count; i++) {
      const yv = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - yv * yv);
      const th = golden * i;
      const lat = Math.asin(yv) * (180 / Math.PI);
      const lon = Math.atan2(Math.sin(th) * r, Math.cos(th) * r) * (180 / Math.PI);
      const land = isLand(lat, lon, map);
      pts.push({ lat, lon, land });
      // Pre-sample 12% of ocean dots - no Math.random() per frame
      if (!land && Math.random() < 0.12) oceanSet.add(i);
    }
    spherePointsRef.current = pts;
    oceanSetRef.current = oceanSet;
  }, []);

  useEffect(() => {
    const update = () => {
      if (!wrapRef.current) return;
      const w = wrapRef.current.clientWidth;
      const h = wrapRef.current.clientHeight || w;
      setSize(Math.max(280, Math.min(w, h, 760)));
    };
    update();
    const ro = new ResizeObserver(update);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener("resize", update);
    // Pause rAF when globe is off-screen - biggest perf win on scroll
    const io = new IntersectionObserver(
      ([entry]) => { visibleRef.current = entry.isIntersecting; },
      { threshold: 0.05 },
    );
    if (wrapRef.current) io.observe(wrapRef.current);
    return () => {
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    packetsRef.current = ROUTES.flatMap((_, route) =>
      [0, 0.34, 0.67].map((offset, i) => ({
        route,
        p: (Math.random() * 0.28 + offset) % 1,
        speed: 0.0008 + Math.random() * 0.0011,
        opacity: i === 0 ? 1 : 0.6,
        r: i === 0 ? 2.0 : 1.3,
      })),
    );
    ghostPacketsRef.current = GHOST_ROUTES.map((_, route) => ({
      route,
      p: Math.random(),
      speed: 0.0005 + Math.random() * 0.0006,
      opacity: 0.4,
      r: 1.2,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let raf = 0;
    let last = performance.now();
    let overlayElapsed = 0;

    const loop = (now: number) => {
      if (!visibleRef.current) {
        last = now;
        raf = requestAnimationFrame(loop);
        return;
      }
      const dt = Math.min(64, now - last);
      last = now;

      const focus = focusRef.current;
      if (focus?.active) {
        if (focus.phase === "spinY") {
          // stage 1: horizontal spin only - tilt stays put
          const t = Math.min(1, (now - focus.phaseT0) / FOCUS_SPIN_Y_MS);
          const e = easeInOutCubic(t);
          rotYRef.current = focus.fromY + (focus.toY - focus.fromY) * e;
          rotXRef.current = focus.fromX;
          if (t >= 1) {
            focus.phase = "spinX";
            focus.phaseT0 = now;
          }
        } else if (focus.phase === "spinX") {
          // stage 2: vertical tilt only - horizontal stays locked on target
          const t = Math.min(1, (now - focus.phaseT0) / FOCUS_SPIN_X_MS);
          const e = easeInOutCubic(t);
          rotYRef.current = focus.toY;
          rotXRef.current = focus.fromX + (focus.toX - focus.fromX) * e;
          if (t >= 1) {
            focus.phase = "hold";
            focus.holdUntil = now + FOCUS_HOLD_MS;
          }
        } else {
          rotYRef.current = focus.toY;
          rotXRef.current = focus.toX;
          if (now >= focus.holdUntil) {
            focusRef.current = null;
            setFocusedCity(null);
            lastInteractRef.current = 0; // idle becomes true immediately - smooth auto-spin ramp-back
          }
        }
      } else {
        const idle = now - lastInteractRef.current > 1200 && !draggingRef.current;
        if (idle) velYRef.current += (0.022 - velYRef.current) * 0.016;
        if (!draggingRef.current) {
          rotYRef.current += velYRef.current * dt;
          rotXRef.current += velXRef.current * dt;
          velYRef.current *= 0.966;
          velXRef.current *= 0.92;
        }
      }
      rotXRef.current = Math.max(-55, Math.min(55, rotXRef.current));

      const cx = size / 2;
      const cy = size / 2;
      const radius = size * 0.455;

      ctx.clearRect(0, 0, size, size);

      // ── Outer atmospheric halo
      // ── Sphere dark base - fade to transparent at edge so no harsh ring
      const sphere = ctx.createRadialGradient(
        cx - radius * 0.3,
        cy - radius * 0.35,
        0,
        cx,
        cy,
        radius,
      );
      sphere.addColorStop(0, "rgba(80, 30, 38, 0.65)");
      sphere.addColorStop(0.55, "rgba(18, 14, 26, 0.70)");
      sphere.addColorStop(0.88, "rgba(10, 10, 18, 0.55)");
      sphere.addColorStop(1, "rgba(10, 10, 18, 0)"); // transparent edge - kills harsh ring
      ctx.fillStyle = sphere;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // ── Thin directional rim light - thick→smooth from top-left fading to nothing
      ctx.save();
      // Clip to a narrow annular ring at the edge
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 1, 0, Math.PI * 2);
      ctx.arc(cx, cy, radius - 3, 0, Math.PI * 2, true);
      ctx.clip();
      const rim = ctx.createLinearGradient(
        cx - radius,
        cy - radius,
        cx + radius * 0.6,
        cy + radius * 0.6,
      );
      rim.addColorStop(0, "rgba(210, 60, 65, 0.75)");
      rim.addColorStop(0.4, "rgba(160, 30, 35, 0.35)");
      rim.addColorStop(1, "rgba(12,  13, 16, 0)");
      ctx.fillStyle = rim;
      ctx.fillRect(cx - radius - 4, cy - radius - 4, (radius + 4) * 2, (radius + 4) * 2);
      ctx.restore();

      // ── World-map dots
      const oceanSet = oceanSetRef.current;
      const pts = spherePointsRef.current;
      for (let pi = 0; pi < pts.length; pi++) {
        const pt = pts[pi];
        // Skip ocean dots not in pre-sampled set (no Math.random per frame)
        if (!pt.land && !oceanSet.has(pi)) continue;
        const v = project(pt.lat, pt.lon, rotYRef.current, rotXRef.current);
        if (v.z < -0.02) continue;
        const depth = (v.z + 1) / 2;
        const light = Math.max(0, v.x * -0.3 + v.y * 0.4 + v.z * 0.6);

        if (pt.land) {
          // Land: bright warm dots - create continent shapes
          const alpha = 0.25 + depth * 0.65 + light * 0.12;
          const r = 180 + Math.floor(depth * 62);
          const g = 52 + Math.floor(depth * 30);
          const b = 58 + Math.floor(depth * 28);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.beginPath();
          ctx.arc(cx + v.x * radius, cy - v.y * radius, 0.55 + depth * 0.9, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Ocean: pre-sampled 12% subset - no per-frame Math.random()
          const alpha = 0.03 + depth * 0.09;
          ctx.fillStyle = `rgba(80,90,130,${alpha})`;
          ctx.beginPath();
          ctx.arc(cx + v.x * radius, cy - v.y * radius, 0.18 + depth * 0.32, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── Specular highlight
      const spec = ctx.createRadialGradient(
        cx - radius * 0.42,
        cy - radius * 0.48,
        0,
        cx - radius * 0.42,
        cy - radius * 0.48,
        radius * 0.5,
      );
      spec.addColorStop(0, "rgba(255, 220, 225, 0.12)");
      spec.addColorStop(1, "rgba(255, 220, 225, 0)");
      ctx.fillStyle = spec;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Advance packets
      for (const pkt of packetsRef.current) {
        pkt.p += pkt.speed * dt;
        if (pkt.p >= 1) pkt.p = 0;
      }
      for (const pkt of ghostPacketsRef.current) {
        pkt.p += pkt.speed * dt;
        if (pkt.p >= 1) pkt.p = 0;
      }

      overlayElapsed += dt;
      const overlayInterval = draggingRef.current ? 0 : 33;
      if (overlayElapsed > overlayInterval) {
        overlayElapsed = 0;
        setOverlayTick((t) => (t + 1) % 100000);
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [size]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onDown = (e: PointerEvent) => {
      if (focusRef.current?.active) return; // don't let drag interrupt the focus sequence
      draggingRef.current = true;
      lastInteractRef.current = performance.now();
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      velYRef.current = 0;
      velXRef.current = 0;
      el.setPointerCapture?.(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      rotYRef.current -= dx * 0.4;
      rotXRef.current += dy * 0.4;
      velYRef.current = -dx * 0.4 * 0.18;
      velXRef.current = dy * 0.4 * 0.18;
      lastInteractRef.current = performance.now();
    };
    const onUp = (e: PointerEvent) => {
      draggingRef.current = false;
      lastInteractRef.current = performance.now();
      el.releasePointerCapture?.(e.pointerId);
      el.style.cursor = "grab";
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointerleave", onUp);
    el.style.cursor = "grab";
    el.style.touchAction = "none";
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerleave", onUp);
    };
  }, []);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.455;

  const projected = useMemo(() => {
    void overlayTick;
    return CITIES.map((city) => {
      const v = project(city.lat, city.lon, rotYRef.current, rotXRef.current);
      return { city, x: cx + v.x * radius, y: cy - v.y * radius, z: v.z, visible: v.z > -0.05 };
    });
  }, [cx, cy, radius, overlayTick]);

  const byName = Object.fromEntries(projected.map((p) => [p.city.name, p]));

  const arcCP = (
    a: { x: number; y: number },
    b: { x: number; y: number },
    liftFactor = 0.46,
    reverse = false,
  ) => {
    const mx = (a.x + b.x) / 2,
      my = (a.y + b.y) / 2;
    const dx = b.x - a.x,
      dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const lift = Math.min(dist * liftFactor, radius * 0.72);
    const cd = Math.hypot(cx - mx, cy - my) || 1;
    const dir = reverse ? -1 : 1;
    return {
      x: mx + ((cx - mx) / cd) * lift * dir - dy * 0.12 * dir,
      y: my + ((cy - my) / cd) * lift * dir + dx * 0.12 * dir,
    };
  };

  const onQuad = (
    a: { x: number; y: number },
    c: { x: number; y: number },
    b: { x: number; y: number },
    t: number,
  ) => {
    const it = 1 - t;
    return {
      x: it * it * a.x + 2 * it * t * c.x + t * t * b.x,
      y: it * it * a.y + 2 * it * t * c.y + t * t * b.y,
    };
  };

  return (
    <div
      ref={wrapRef}
      className="globe-orb relative mx-auto aspect-square w-full select-none"
      style={{ maxWidth: 760 }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 m-auto"
        style={{ willChange: "transform" }}
      />

      <svg
        width={size}
        height={size}
        className="absolute inset-0 m-auto overflow-visible pointer-events-none"
      >
        <defs>
          <linearGradient id="arc-grad" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.90" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ghost-grad" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="pkt-grad">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="35%" stopColor="var(--primary)" stopOpacity="0.88" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
          <filter id="hub-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="route-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="node-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ghost infrastructure trails */}
        {GHOST_ROUTES.map(([fr, to, lf, rev], i) => {
          const a = byName[fr],
            b = byName[to];
          if (!a || !b || (a.z + b.z) / 2 < -0.18) return null;
          const c = arcCP(a, b, lf, rev);
          const op = Math.max(0.04, Math.min(0.14, ((a.z + b.z) / 2 + 0.4) * 0.2));
          return (
            <path
              key={`g${i}`}
              d={`M ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`}
              fill="none"
              stroke="url(#ghost-grad)"
              strokeWidth="0.65"
              opacity={op}
            />
          );
        })}

        {/* Active routes */}
        {ROUTES.map(([fr, to], i) => {
          const a = byName[fr],
            b = byName[to];
          if (!a || !b || (a.z + b.z) / 2 < -0.15) return null;
          const c = arcCP(a, b, 0.46);
          const op = Math.max(0.2, Math.min(0.95, ((a.z + b.z) / 2 + 0.42) * 1.1));
          const hub = fr === "India" || to === "India";
          const isFocusedRoute = !!focusedCity && (fr === focusedCity || to === focusedCity);
          return (
            <path
              key={`r${i}`}
              d={`M ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`}
              fill="none"
              stroke="url(#arc-grad)"
              strokeWidth={isFocusedRoute ? (hub ? 2.6 : 1.8) : hub ? 1.6 : 0.8}
              opacity={isFocusedRoute ? 1 : op}
              filter="url(#route-glow)"
              style={{ transition: "stroke-width 0.3s ease, opacity 0.3s ease" }}
            />
          );
        })}

        {/* Ghost packets */}
        {ghostPacketsRef.current.map((pkt, i) => {
          const [fr, to, lf, rev] = GHOST_ROUTES[pkt.route];
          const a = byName[fr],
            b = byName[to];
          if (!a || !b || (a.z + b.z) / 2 < -0.12) return null;
          const pos = onQuad(a, arcCP(a, b, lf, rev), b, pkt.p);
          return (
            <circle
              key={`gp${i}`}
              cx={pos.x}
              cy={pos.y}
              r={4.5}
              fill="url(#pkt-grad)"
              opacity={0.3}
            />
          );
        })}

        {/* Primary packets */}
        {packetsRef.current.map((pkt, i) => {
          const [fr, to] = ROUTES[pkt.route];
          const a = byName[fr],
            b = byName[to];
          if (!a || !b || (a.z + b.z) / 2 < -0.1) return null;
          const pos = onQuad(a, arcCP(a, b, 0.46), b, pkt.p);
          return (
            <g key={`pk${i}`}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={6}
                fill="url(#pkt-grad)"
                opacity={pkt.opacity * 0.55}
              />
              <circle cx={pos.x} cy={pos.y} r={pkt.r} fill="#fff" opacity={pkt.opacity} />
            </g>
          );
        })}

        {/* Nodes & labels */}
        {projected.map((pt) => {
          if (!pt.visible) return null;
          const hub = pt.city.tier === "hub";
          const primary = pt.city.tier === "primary";
          const isFocused = pt.city.name === focusedCity;
          const base = hub ? 20 : primary ? 11 : 6.5;
          const coreR = (hub ? 5.8 : primary ? 4.0 : 2.6) * (isFocused ? 1.4 : 1);
          const lop = isFocused ? 1 : Math.max(0, Math.min(1, (pt.z + 0.1) * 2));
          const lo = hub ? 18 : 14;

          return (
            <g key={pt.city.name}>
              {/* Focus selection ring */}
              {isFocused && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={base * 1.5}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.4"
                  opacity="0.75"
                  filter="url(#hub-glow)"
                >
                  {!reduceMotion && (
                    <>
                      <animate
                        attributeName="r"
                        values={`${base * 1.1};${base * 1.9};${base * 1.1}`}
                        dur="1.4s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.85;0.35;0.85"
                        dur="1.4s"
                        repeatCount="indefinite"
                      />
                    </>
                  )}
                </circle>
              )}

              {/* Outer pulse ring */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={base}
                fill="var(--primary)"
                fillOpacity={isFocused ? 0.2 : 0.1}
              >
                {!reduceMotion && (
                  <>
                    <animate
                      attributeName="r"
                      values={`${base * 0.5};${base * 2.3};${base * 0.5}`}
                      dur={hub ? "3.5s" : "5.2s"}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.55;0;0.55"
                      dur={hub ? "3.5s" : "5.2s"}
                      repeatCount="indefinite"
                    />
                  </>
                )}
              </circle>

              {/* Hub: inner ring + ambient circles */}
              {hub && (
                <>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={base * 0.6}
                    fill="var(--primary)"
                    fillOpacity="0.22"
                    filter="url(#hub-glow)"
                  >
                    {!reduceMotion && (
                      <>
                        <animate
                          attributeName="r"
                          values={`${base * 0.3};${base * 1.1};${base * 0.3}`}
                          dur="2.1s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.5;0;0.5"
                          dur="2.1s"
                          repeatCount="indefinite"
                        />
                      </>
                    )}
                  </circle>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={base * 1.9}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="0.55"
                    opacity="0.18"
                  />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={base * 3.0}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="0.30"
                    opacity="0.09"
                  />
                </>
              )}

              {/* Node dot */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={coreR}
                fill={hub || isFocused ? "#fff" : "var(--primary)"}
                stroke="var(--primary)"
                strokeWidth={hub ? 2.2 : isFocused ? 1.6 : 0}
                strokeOpacity={hub ? 0.6 : isFocused ? 0.9 : 0}
                filter={hub || isFocused ? "url(#hub-glow)" : "url(#node-glow)"}
                style={{ transition: "r 0.3s ease" }}
              />

              {/* Label */}
              {lop > 0.05 && (
                <g opacity={lop} style={{ transition: "opacity 0.3s ease" }}>
                  <line
                    x1={pt.x}
                    y1={pt.y}
                    x2={pt.x + lo}
                    y2={pt.y - lo}
                    stroke="var(--primary)"
                    strokeOpacity={isFocused ? 0.8 : 0.36}
                    strokeWidth={isFocused ? 1 : 0.6}
                  />
                  <rect
                    x={pt.x + lo}
                    y={pt.y - (lo + 24)}
                    width={(pt.city.name.length + (hub ? 4 : 0)) * 10.6 + 14}
                    height="24"
                    rx="6"
                    fill={isFocused ? "rgba(120,20,28,0.92)" : "rgba(8,8,16,0.86)"}
                    stroke="var(--primary)"
                    strokeOpacity={isFocused ? 0.8 : 0.26}
                    strokeWidth={isFocused ? 1.2 : 0.65}
                  />
                  <text
                    x={pt.x + lo + 7}
                    y={pt.y - lo - 5}
                    fill={hub ? "#ffffff" : "rgba(232,232,244,0.92)"}
                    fontSize={hub ? "16.5" : "15.5"}
                    fontWeight={hub ? "700" : "600"}
                    fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
                    letterSpacing="0.025em"
                  >
                    {hub ? `Hub ${pt.city.name}` : pt.city.name}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
});

// ─── Side panels ──────────────────────────────────────────────────────────────
function StatusCard({
  data,
  idx,
  onFocus,
}: {
  data: (typeof STATUS_CARDS)[number];
  idx: number;
  onFocus?: (city: string) => void;
}) {
  const time = useClock(data.tz);
  const dot = data.tone === "emerald" ? "bg-emerald-400" : "bg-amber-400";
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: idx * 0.1 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onFocus?.(data.city)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onFocus?.(data.city);
      }}
      className="premium-card cursor-pointer rounded-2xl p-5 transition-colors hover:border-primary/35"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${dot}`}
            />
            <span className={`relative inline-flex h-2 w-2 rounded-full ${dot}`} />
          </span>
          <span className="text-base font-bold">{data.city}</span>
        </div>
        <data.icon className="h-4 w-4 text-primary" />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{data.label}</p>
      <div className="mt-4 flex items-end justify-between">
        <span className="text-[11px] uppercase tracking-widest text-primary">{data.status}</span>
        <span className="font-mono text-sm tabular-nums text-foreground/90">{time}</span>
      </div>
    </motion.div>
  );
}

function ClockChip({ c }: { c: { label: string; tz: string } }) {
  const time = useClock(c.tz);
  return (
    <div className="flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
      <Zap className="h-3 w-3 text-primary" />
      <span className="text-muted-foreground">{c.label}</span>
      <span className="font-mono tabular-nums">{time}</span>
    </div>
  );
}

function ActivityTicker({ onFocus }: { onFocus?: (city: string) => void }) {
  const items = [
    { t: "Deployment shipped", l: "New York" },
    { t: "AI agent reply", l: "Utah" },
    { t: "Client onboarding", l: "Seattle" },
    { t: "Support resolved", l: "United Kingdom" },
    { t: "Code review", l: "India" },
    { t: "Push to prod", l: "Canada" },
  ];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setIndex((c) => (c + 1) % items.length), 3600);
    return () => window.clearInterval(id);
  }, [items.length]);
  return (
    <div
      className="premium-card cursor-pointer overflow-hidden rounded-2xl p-4 transition-colors hover:border-primary/35"
      onClick={() => onFocus?.(items[index].l)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onFocus?.(items[index].l);
      }}
    >
      <div className="mb-2 flex items-center gap-2">
        <Radio className="h-3.5 w-3.5 animate-pulse text-primary" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Live Network Activity
        </span>
      </div>
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex items-center justify-between gap-3"
      >
        <span className="text-sm text-foreground/90">{items[index].t}</span>
        <span className="text-xs font-bold text-primary">{items[index].l}</span>
      </motion.div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export function GlobalNetwork() {
  const globeRef = useRef<GlobeStageHandle>(null);
  const focusOnCity = useCallback((city: string) => globeRef.current?.focusOn(city), []);

  return (
    <section className="relative overflow-hidden px-6 py-12 sm:py-28 lg:py-32">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="absolute left-1/2 top-1/3 h-216 w-216 -translate-x-1/2 rounded-full bg-primary/14 blur-[180px] pointer-events-none" />
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-primary">
                Global Operations Network
              </p>
              <h2 className="pb-1 text-4xl font-extrabold leading-[1.05] text-gradient lg:text-6xl">
                Built for fast moving teams across time zones.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Seattle, Utah, New York, Canada, the United Kingdom, and India stay connected
                through one responsive digital operations layer.
              </p>
            </div>
          </Reveal>

          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {CLOCKS.map((c) => (
              <ClockChip key={c.label} c={c} />
            ))}
          </div>

          <div className="mt-12 grid items-center gap-10 lg:grid-cols-[2.2fr_0.9fr]">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              <GlobeStage ref={globeRef} />
              <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground/70">
                Drag to rotate · auto-spins when idle
              </p>
            </motion.div>

            <div className="flex flex-col gap-4">
              {STATUS_CARDS.map((s, i) => (
                <StatusCard key={s.city} data={s} idx={i} onFocus={focusOnCity} />
              ))}
              <ActivityTicker onFocus={focusOnCity} />
            </div>
          </div>

          <div className="mt-20 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {METRICS.map((m, i) => (
              <Reveal key={m.l} delay={i * 0.08}>
                <div className="premium-card rounded-2xl p-4 sm:p-6 text-center transition hover:bg-white/6">
                  <div className="text-xl sm:text-4xl font-extrabold text-gradient-brand whitespace-nowrap">{m.v}</div>
                  <div className="mt-2 text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">
                    {m.l}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
  );
}
