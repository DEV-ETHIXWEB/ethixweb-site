import { Server } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { CaseStudyContainer } from "@/components/case-study/CaseStudyContainer";
import { SectionHeading } from "@/components/case-study/SectionHeading";
import { Checklist } from "@/components/case-study/Checklist";
import { cn } from "@/lib/utils";
import type { SectionIntro, TechStackItem } from "@/data/case-studies/types";

/** Alternating image/text rows, one per infrastructure fact (Platform,
 * Hosting, ...). Every row lives inside one rounded card with the photo
 * flush to one edge - rows without a supplied `image` fall back to a
 * branded gradient panel instead of leaving a blank hole, so a future case
 * study can list a tech-stack fact before a screenshot exists for it. */
export function TechStackSection({
  intro,
  items,
}: {
  intro: SectionIntro;
  items: TechStackItem[];
}) {
  return (
    <section className="py-14 sm:py-20">
      <CaseStudyContainer>
        <SectionHeading intro={intro} />

        <div className="mt-10 space-y-6">
          {items.map((item, i) => {
            const imageFirst = i % 2 === 0;
            return (
              <Reveal key={item.title} delay={i * 0.06}>
                <div className="grid overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm sm:grid-cols-2">
                  <div
                    className={cn(
                      "min-h-[16rem] sm:min-h-[37rem]",
                      imageFirst ? "sm:order-1" : "sm:order-2",
                      item.imageContain && "bg-black",
                    )}
                  >
                    {item.image ? (
                      <img
                        src={item.image.src}
                        srcSet={item.image.srcSet}
                        sizes="(min-width: 640px) 50vw, 100vw"
                        alt={item.image.alt}
                        width={item.image.width}
                        height={item.image.height}
                        loading="lazy"
                        decoding="async"
                        className={cn(
                          "h-full w-full",
                          item.imageContain ? "object-contain" : "object-cover",
                        )}
                      />
                    ) : (
                      <div className="card-mockup-bg flex h-full w-full items-center justify-center">
                        <Server className="h-14 w-14 text-white/25" strokeWidth={1.2} />
                      </div>
                    )}
                  </div>

                  <div
                    className={cn(
                      "flex flex-col justify-center p-8 sm:p-12 lg:p-14",
                      imageFirst ? "sm:order-2" : "sm:order-1",
                    )}
                  >
                    <h3 className="font-display text-2xl font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    {item.checklist && <Checklist items={item.checklist} className="mt-6" />}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </CaseStudyContainer>
    </section>
  );
}
