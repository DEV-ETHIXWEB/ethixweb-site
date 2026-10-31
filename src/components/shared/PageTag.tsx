import { Fragment, type ReactNode } from "react";
import { Flame, Snowflake, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** The label above every page's headline.
 *
 * A service tag rather than the stock glowing-dot pill the site used to
 * repeat on every hero (a rounded capsule with a glowing dot is the default
 * look of template and AI-generated sites). A solid crimson block carries the
 * page's mark, joined to a ruled label; segments are separated by thin rules
 * instead of dashes. The default mark is the heating-and-cooling pair the
 * homepage leads with, which is the brand's tie to home services. */
export function PageTag({
  items,
  icon: Icon,
  className,
}: {
  /** One or more label segments, e.g. ["Journal", "12 essays in the queue"]. */
  items: ReactNode[];
  /** The page's mark. Omitted, it is the flame and snowflake pair. */
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-stretch overflow-hidden rounded-md border border-primary/35 text-[11px] font-bold uppercase tracking-[0.16em]",
        className,
      )}
    >
      <span className="flex items-center gap-1 bg-primary px-2.5 py-1.5 text-primary-foreground">
        {Icon ? (
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <>
            <Flame className="h-3.5 w-3.5" aria-hidden="true" />
            <Snowflake className="h-3.5 w-3.5" aria-hidden="true" />
          </>
        )}
      </span>
      <span className="flex items-center gap-2.5 bg-primary/[0.07] px-3 py-1.5 text-left text-foreground/85">
        {items.map((item, i) => (
          <Fragment key={i}>
            {i > 0 && <span aria-hidden="true" className="h-3 w-px shrink-0 bg-primary/45" />}
            <span>{item}</span>
          </Fragment>
        ))}
      </span>
    </div>
  );
}
