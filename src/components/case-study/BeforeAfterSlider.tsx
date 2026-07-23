import { useState } from "react";
import { ChevronsLeftRight } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { CaseStudyContainer } from "@/components/case-study/CaseStudyContainer";
import { SectionHeading } from "@/components/case-study/SectionHeading";
import type { Image, SectionIntro } from "@/data/case-studies/types";

/** Draggable before/after comparison. A native `<input type="range">` owns
 * the interaction (free keyboard + touch + screen-reader support) and stays
 * visually transparent; the divider line, handle and image clip-path are
 * purely cosmetic layers driven by its value.
 *
 * Copy (if any) sits above; the slider then runs the full width of the
 * standard case-study gutters below it - so it lines up with every other
 * section's margin instead of breaking out wider. */
export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  intro,
  body,
}: {
  beforeImage: Image;
  afterImage: Image;
  intro?: SectionIntro;
  body?: string[];
}) {
  const [percent, setPercent] = useState(50);
  const hasCopy = Boolean(intro || body?.length);

  return (
    <section className="py-10 sm:py-14">
      <CaseStudyContainer>
        {hasCopy && (
          <div className="mb-8">
            {intro && <SectionHeading intro={intro} />}
            {body?.map((paragraph, i) => (
              <Reveal key={i} delay={0.12 + i * 0.06}>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>
        )}

        {/* Full-width within the gutters - lines up with the cards above. */}
        <Reveal>
          <div className="group/ba relative aspect-video select-none overflow-hidden rounded-2xl border border-border bg-muted shadow-lg ring-1 ring-black/5">
            <img
              src={afterImage.src}
              alt={afterImage.alt}
              width={afterImage.width}
              height={afterImage.height}
              loading="lazy"
              decoding="async"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            />
            <div
              className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}
            >
              <img
                src={beforeImage.src}
                alt={beforeImage.alt}
                width={beforeImage.width}
                height={beforeImage.height}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Corner labels - which side is which */}
            <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
              Before
            </span>
            <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
              After
            </span>

            {/* Divider line + handle - cosmetic only, positioned from the input's value */}
            <div
              className="pointer-events-none absolute inset-y-0 w-[3px] bg-white/95 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]"
              style={{ left: `${percent}%`, transform: "translateX(-50%)" }}
            />
            <div
              className="pointer-events-none absolute top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg"
              style={{ left: `${percent}%` }}
            >
              <ChevronsLeftRight className="h-5 w-5 text-neutral-600" aria-hidden />
            </div>

            <input
              type="range"
              min={0}
              max={100}
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
              aria-label="Drag to compare the before and after site"
              className="absolute inset-0 h-full w-full cursor-col-resize appearance-none bg-transparent opacity-0"
            />
          </div>
        </Reveal>
        <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <ChevronsLeftRight className="h-3.5 w-3.5" aria-hidden />
          Drag to compare
        </p>
      </CaseStudyContainer>
    </section>
  );
}
