import { Reveal } from "@/components/shared/Reveal";
import { ViewWebsiteButton } from "@/components/case-study/ViewWebsiteButton";
import type { CaseStudyDetail } from "@/data/case-studies/types";

// Hero intentionally doesn't use CaseStudyContainer: the reference bleeds the
// photo almost to the true viewport edge while keeping the text column on
// the normal left gutter, so the two sides need independent padding instead
// of one symmetric container.
export function CaseStudyHero({ study }: { study: CaseStudyDetail }) {
  return (
    <section className="relative -mt-24 overflow-hidden bg-background pb-16 pt-40 sm:pb-20 sm:pt-[13.25rem]">
      <div className="relative grid gap-8 px-6 sm:px-10 lg:grid-cols-[460px_1fr] lg:items-center lg:gap-7 lg:pl-[120px] lg:pr-5">
        <div>
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {study.status}
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <img
              src={study.client.logo.src}
              alt={study.client.logo.alt}
              width={study.client.logo.width}
              height={study.client.logo.height}
              className="mt-8 h-[100px] w-auto max-w-[240px] object-contain object-left"
            />
          </Reveal>

          <Reveal delay={0.12}>
            <h1 className="mt-8 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground">
              {study.title}
            </h1>
          </Reveal>

          <Reveal delay={0.18}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              {study.summary}
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-6 flex flex-wrap gap-2">
              {study.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-card px-2.5 py-1.5 text-[11px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Reveal>

          {study.websiteUrl && (
            <Reveal delay={0.3}>
              <ViewWebsiteButton href={study.websiteUrl} className="mt-9" />
            </Reveal>
          )}
        </div>

        <Reveal delay={0.15} className="relative">
          {/* The 50px right-shift is the desktop bleed-to-the-edge effect;
           * below lg (single column) it would just push the panel off the
           * right side of the screen, so it only applies at lg+. */}
          {/* Dark mode drops the shared shadow-lg white hairline ring: on this
           * full-bleed photo panel the ring's left edge sits against the near-
           * black page background and reads as a stray white line. */}
          <div className="aspect-[4/2.55] overflow-hidden rounded-[2rem] shadow-lg dark:shadow-[0_20px_48px_-20px_rgba(0,0,0,0.6)] lg:translate-x-[50px]">
            <img
              src={study.heroImage.src}
              srcSet={study.heroImage.srcSet}
              sizes="(min-width: 1024px) 55vw, 100vw"
              alt={study.heroImage.alt}
              width={study.heroImage.width}
              height={study.heroImage.height}
              className="h-full w-full object-cover"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
