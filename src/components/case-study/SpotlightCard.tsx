import { Checklist } from "@/components/case-study/Checklist";
import { cn } from "@/lib/utils";
import type { SpotlightItem } from "@/data/case-studies/types";

/** The title + description + checklist glass card shared by `SpotlightBlock`
 * and `SpotlightCrossfade`. `SpotlightBlock` places the card directly and
 * needs its own width; `SpotlightCrossfade` sizes it via the absolutely
 * positioned wrapper it floats inside instead, so the width class is opt-in. */
export function SpotlightCard({
  item,
  constrainWidth = false,
}: {
  item: SpotlightItem;
  constrainWidth?: boolean;
}) {
  return (
    <div
      className={cn(
        "glass-strong w-full rounded-b-[1.75rem] p-7 sm:rounded-[1.5rem] sm:p-8",
        constrainWidth && "sm:w-[min(90vw,26rem)]",
      )}
    >
      <h3 className="font-display text-2xl font-bold leading-snug text-foreground">
        {item.card.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.card.description}</p>
      {item.card.checklist && <Checklist items={item.card.checklist} className="mt-5" />}
    </div>
  );
}
