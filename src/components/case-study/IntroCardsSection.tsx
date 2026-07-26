import { CaseStudyContainer } from "@/components/case-study/CaseStudyContainer";
import { SectionHeading } from "@/components/case-study/SectionHeading";
import { InfoCardGrid } from "@/components/case-study/InfoCardGrid";
import type { InfoCard, SectionIntro } from "@/data/case-studies/types";

/** Heading + 3-card grid, the shell shared by Context and Snapshot - the
 * only two sections in the reference that are structurally identical. */
export function IntroCardsSection({
  intro,
  cards,
  glowLines = false,
}: {
  intro: SectionIntro;
  cards: readonly InfoCard[];
  glowLines?: boolean;
}) {
  return (
    <section className="py-10 sm:py-14">
      <CaseStudyContainer>
        <SectionHeading intro={intro} />
        <InfoCardGrid cards={cards} glowLines={glowLines} />
      </CaseStudyContainer>
    </section>
  );
}
