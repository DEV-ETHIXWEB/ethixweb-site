import { Link } from "@tanstack/react-router";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { WebSpotlight } from "@/components/shared/WebSpotlight";
import { trackWebSpotlight } from "@/lib/web-spotlight";
import { cn } from "@/lib/utils";

export type CardGridItem = {
  icon: LucideIcon;
  title: string;
  description: string;
  to?: string;
};

const COLS = {
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const;

// One responsive convention for the icon-card grid pattern repeated across
// services/industries/automation/marketing/web-development pages, which
// previously used several different, inconsistent breakpoint schemes for the
// same layout.
export function CardGrid({
  items,
  cols = 3,
  className,
}: {
  items: CardGridItem[];
  cols?: keyof typeof COLS;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-5", COLS[cols], className)}>
      {items.map((item, i) => (
        <Reveal key={item.title} delay={i * 0.05}>
          <IconCard {...item} />
        </Reveal>
      ))}
    </div>
  );
}

export function IconCard({ icon: Icon, title, description, to }: CardGridItem) {
  // flex-col + mt-auto on the arrow: descriptions vary in length across
  // callers, so without this the arrow lands at a different height in every
  // card and shorter cards leave dead space below it instead of a flush,
  // consistently-aligned row.
  const content = (
    <>
      <Icon className="mb-5 h-9 w-9 text-primary" strokeWidth={1.5} />
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {to && (
        <ArrowUpRight className="mt-auto h-4 w-4 pt-5 text-primary transition group-hover:rotate-45" />
      )}
      <WebSpotlight />
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        onMouseMove={trackWebSpotlight}
        className="glass group relative flex h-full flex-col overflow-hidden rounded-3xl p-7 transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      onMouseMove={trackWebSpotlight}
      className="glass group relative flex h-full flex-col overflow-hidden rounded-3xl p-7"
    >
      {content}
    </div>
  );
}
