import { ReactNode } from "react";
import { Container } from "@/components/shared/Container";
import { cn } from "@/lib/utils";

// The one grid every campaign section aligns to. Before this existed,
// individual sections mixed Container (max-w-7xl) and Container size="medium"
// (max-w-5xl) at random, so each one's left/right content edge landed at a
// different x position - the page read as independently-built blocks instead
// of one system. Every campaign section now renders through here and uses the
// full max-w-7xl grid, so no section leaves wide empty gutters on desktop.
//
// Vertical rhythm is standardized here too: `band` sections (alternating
// tinted background) get the taller py-16/sm:py-24 beat; plain sections get
// the shorter py-16/sm:py-20 beat used for panel-heavy sections that already
// carry their own internal padding.
export function CampaignSection({
  children,
  className,
  innerClassName,
  band = false,
  compact = false,
  id,
}: {
  children: ReactNode;
  className?: string;
  /** Extra classes on the inner content wrapper - e.g. a two-column grid layout. */
  innerClassName?: string;
  /** Alternating tinted/bordered background band, used to separate major beats in the page. */
  band?: boolean;
  /** Shorter vertical beat (py-16/sm:py-20) for panel-heavy sections that already carry their own internal padding. */
  compact?: boolean;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        compact ? "py-16 sm:py-20" : "py-16 sm:py-24",
        band &&
          "border-y border-white/5 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent",
        className,
      )}
    >
      <Container>
        <div className={innerClassName}>{children}</div>
      </Container>
    </section>
  );
}
