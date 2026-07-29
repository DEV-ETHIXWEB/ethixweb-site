import { Reveal } from "@/components/shared/Reveal";
import { SpotlightCard } from "@/components/case-study/SpotlightCard";
import { cn } from "@/lib/utils";
import type { SpotlightItem } from "@/data/case-studies/types";

/** One image + floating glass card "spotlight" moment inside Design
 * Approach. `treatment: "bleed"` runs the photo edge-to-edge (breaking out
 * of the page gutters) with the card anchored over its bottom-right corner;
 * `"inset"` keeps the photo inside the page gutters, rounded on both sides,
 * with the card floating beside its right edge, vertically centered -
 * matching the two variants used back-to-back in the reference. Below `sm`
 * both collapse to a plain stacked photo-then-card layout so nothing
 * overlaps awkwardly on narrow screens. */
export function SpotlightBlock({ item }: { item: SpotlightItem }) {
  const isBleed = item.treatment === "bleed";

  // Below sm the card sits flush under the photo as the bottom half of one
  // capsule (square top, rounded bottom); at sm+ it floats over the photo
  // as its own fully-rounded glass panel.
  const card = <SpotlightCard item={item} constrainWidth />;

  return (
    <Reveal>
      <div className={cn(!isBleed && "px-6 sm:px-10 lg:px-[120px]")}>
        <div className={cn("relative mx-auto", !isBleed && "max-w-[1440px]")}>
          <img
            src={item.image.src}
            srcSet={item.image.srcSet}
            sizes="(min-width: 1024px) 1200px, 100vw"
            alt={item.image.alt}
            width={item.image.width}
            height={item.image.height}
            loading="lazy"
            decoding="async"
            className={cn(
              // The spotlight assets are pre-cropped to the reference
              // design's 2:1 framing, so at sm+ the box ratio matches the
              // image exactly and nothing gets trimmed. Below sm the 4:3
              // box trims the sides; `focus` picks which edge to keep.
              "aspect-[4/3] w-full object-cover sm:aspect-[2/1]",
              item.focus === "top" && "object-top",
              item.focus === "left" && "object-left",
              (!item.focus || item.focus === "center") && "object-center",
              // Rounded top on mobile (photo is the top half of the capsule),
              // fully rounded once the card floats over it at sm+.
              !isBleed && "rounded-t-[1.75rem] sm:rounded-[1.75rem]",
            )}
          />
          <div
            className={cn(
              "static flex sm:p-8 lg:p-12",
              "sm:absolute sm:inset-0 sm:justify-end",
              // Inset: card sits flush under the photo on mobile (one
              // capsule). Bleed keeps a gap since its photo has square edges.
              isBleed ? "mt-6 sm:mt-0 sm:items-end" : "mt-0 sm:items-center",
            )}
          >
            {card}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
