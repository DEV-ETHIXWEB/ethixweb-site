import { useId } from "react";
import { usePauseOffscreen } from "@/hooks/usePauseOffscreen";

const NODES = [
  { x: 18, y: 132 },
  { x: 68, y: 92 },
  { x: 54, y: 42 },
  { x: 128, y: 22 },
];

function buildPath(nodes: { x: number; y: number }[]) {
  return nodes.map((n, i) => (i === 0 ? `M ${n.x} ${n.y}` : `L ${n.x} ${n.y}`)).join(" ");
}

/** Small animated signal-line-and-node motif, used everywhere a mascot cutout used to sit.
 * Pure SVG/CSS (no WebGL context) since these slots are small and numerous. */
export function SignalTrace({ className = "" }: { className?: string }) {
  const gid = useId();
  const path = buildPath(NODES);
  // Lives in the footer on every page, so it is off-screen almost always - and its
  // blur-filtered SVG repaints every frame while animating.
  const ref = usePauseOffscreen<SVGSVGElement>();

  return (
    <svg
      ref={ref}
      viewBox="0 0 160 160"
      className={`signal-trace pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <filter id={`signal-glow-${gid}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={path}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="signal-trace-line"
        filter={`url(#signal-glow-${gid})`}
      />
      {NODES.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={i === NODES.length - 1 ? 3.2 : 2.2}
          fill="var(--primary)"
          className="signal-trace-node"
          style={{ animationDelay: `${i * 0.4}s` }}
          filter={`url(#signal-glow-${gid})`}
        />
      ))}
    </svg>
  );
}
