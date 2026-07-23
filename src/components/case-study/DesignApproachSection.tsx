import { CaseStudyContainer } from "@/components/case-study/CaseStudyContainer";
import { SectionHeading } from "@/components/case-study/SectionHeading";
import { SpotlightBlock } from "@/components/case-study/SpotlightBlock";
import { SpotlightCrossfade } from "@/components/case-study/SpotlightCrossfade";
import type { SectionIntro, SpotlightItem } from "@/data/case-studies/types";

export function DesignApproachSection({
  intro,
  items,
}: {
  intro: SectionIntro;
  items: SpotlightItem[];
}) {
  return (
    <section className="py-10 sm:py-14">
      <CaseStudyContainer>
        <SectionHeading intro={intro} />
      </CaseStudyContainer>
      <div className="mt-10">
        {items.length > 1 ? (
          // Multiple spotlights share one crossfading window.
          <SpotlightCrossfade items={items} />
        ) : (
          <SpotlightBlock item={items[0]} />
        )}
      </div>
    </section>
  );
}
