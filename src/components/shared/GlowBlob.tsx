import { cn } from "@/lib/utils";

const SIZES = {
  sm: "h-[clamp(10rem,22vw,16rem)] w-[clamp(10rem,22vw,16rem)]",
  md: "h-[clamp(14rem,30vw,22rem)] w-[clamp(14rem,30vw,22rem)]",
  lg: "h-[clamp(16rem,32vw,28rem)] w-[clamp(22rem,52vw,40rem)]",
} as const;

const COLORS = {
  primary: "bg-primary/30",
  brand: "bg-primary/20",
} as const;

// Ambient background glow. Soft-edged with a radial mask, not filter: blur
// (see .glow-soft in styles.css for why). Sized with clamp() (not fixed px) so it
// scales with the viewport instead of looking either cramped on narrow
// phones or comically small against a 1920px+ container.
export function GlowBlob({
  size = "md",
  color = "primary",
  className,
}: {
  size?: keyof typeof SIZES;
  color?: keyof typeof COLORS;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "glow-soft pointer-events-none absolute rounded-full",
        SIZES[size],
        COLORS[color],
        className,
      )}
    />
  );
}
