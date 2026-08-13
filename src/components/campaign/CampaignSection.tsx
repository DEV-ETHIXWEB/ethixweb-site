import { ReactNode } from "react";
import { Container } from "@/components/shared/Container";
import { cn } from "@/lib/utils";

// The one grid every campaign section aligns to. Before this existed,
// individual sections mixed Container (max-w-7xl) and Container size="medium"
// (max-w-5xl) at random, so each one's left/right content edge landed at a
// different x position - the page read as independently-built blocks instead
// of one system. Every campaign section now renders through here: the OUTER
// edge is always the same max-w-7xl grid; a section that wants a narrower
// reading measure sets `narrow` to constrain an INNER wrapper instead of
// shrinking the outer Container, so its content still starts flush with
// every other section's edge (see CampaignProblem/CampaignFaq/CampaignLeadForm/
// CampaignCaseStudy/CampaignOwnership/CampaignAccessibility/CampaignLocalMarket
// for the narrow case, CampaignFunnel/CampaignAds/CampaignWebsite/etc. for full-grid).
//
// Vertical rhythm is standardized here too: `band` sections (alternating
// tinted background) get the taller py-16/sm:py-24 beat; plain sections get
// the shorter py-16/sm:py-20 beat used for panel-heavy sections that already
// carry their own internal padding.
const NARROW_WIDTH = "max-w-4xl";

export function CampaignSection({
  children,
  className,
  innerClassName,
  narrow = false,
  band = false,
  compact = false,
  id,
}: {
  children: ReactNode;
  className?: string;
  /** Extra classes on the inner content wrapper - e.g. a two-column grid layout. Composes with `narrow`. */
  innerClassName?: string;
  /** Constrains the inner wrapper to a narrower reading width without moving the section's outer edge. */
  narrow?: boolean;
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
        <div className={cn(narrow && `mx-auto w-full ${NARROW_WIDTH}`, innerClassName)}>
          {children}
        </div>
      </Container>
    </section>
  );
}
