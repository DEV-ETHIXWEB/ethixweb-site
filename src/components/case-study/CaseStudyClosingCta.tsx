import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { CaseStudyContainer } from "@/components/case-study/CaseStudyContainer";
import type { CaseStudyDetail } from "@/data/case-studies/types";
import { getNextCaseStudy } from "@/data/case-studies";
import spiderweb from "@/assets/spiderweb.svg";

/** Forced-dark closing panel (colors hardcoded, like the site's other
 * closing CTAs) plus the "back to Our Work" / "next case study" nav row
 * underneath - this is the only fully custom-colored section on the page,
 * matching the reference's solid near-black treatment rather than the
 * site's usual crimson-gradient CTA. */
export function CaseStudyClosingCta({ study }: { study: CaseStudyDetail }) {
  const next = getNextCaseStudy(study.slug);
  const { intro, description, primaryCta, secondaryCta } = study.closingCta;

  return (
    <section className="relative overflow-hidden bg-[#141414] py-20 sm:py-28">
      {/* Same spiderweb web asset the site footer uses - here radiating out of
          the top-right corner (hub aligned to the corner via the overflow
          offsets + radial mask). */}
      <img
        src={spiderweb}
        alt=""
        aria-hidden="true"
        draggable={false}
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute max-w-none select-none"
        style={{
          width: 560,
          right: -250,
          top: -190,
          opacity: 0.75,
          filter: "drop-shadow(0 0 5px rgba(229,29,37,0.5))",
          WebkitMaskImage: "radial-gradient(circle at 55.3% 45.7%, black 28%, transparent 72%)",
          maskImage: "radial-gradient(circle at 55.3% 45.7%, black 28%, transparent 72%)",
        }}
      />
      <CaseStudyContainer className="relative z-10">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#e8334a]">
            {intro.eyebrow}
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="mt-4 max-w-xl font-display text-5xl font-extrabold leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-7xl">
            <HighlightedWhite text={intro.title} highlight={intro.highlight} />
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/70">{description}</p>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <CtaButton {...primaryCta} variant="filled" />
            <CtaButton {...secondaryCta} variant="outline" />
          </div>
        </Reveal>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8 sm:mt-20">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Our Work
          </Link>
          {next && (
            <Link
              to="/portfolio/$slug"
              params={{ slug: next.slug }}
              className="inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white"
            >
              Next case study
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </CaseStudyContainer>
    </section>
  );
}

function HighlightedWhite({ text, highlight }: { text: string; highlight?: string }) {
  if (!highlight) return <>{text}</>;
  const i = text.indexOf(highlight);
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="text-[#e8334a]">{highlight}</span>
      {text.slice(i + highlight.length)}
    </>
  );
}

function CtaButton({
  label,
  href,
  external,
  variant,
}: {
  label: string;
  href: string;
  external?: boolean;
  variant: "filled" | "outline";
}) {
  const shared = "magnetic inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-bold";
  const filled = "bg-white text-[#141414] shadow-lg";
  const outline = "border border-white/35 text-white hover:bg-white/10";
  const isInternal = href.startsWith("/");

  if (isInternal) {
    return (
      <Link to={href} className={`${shared} ${variant === "filled" ? filled : outline}`}>
        {label}
        {variant === "filled" && <ArrowRight className="h-4 w-4" />}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`${shared} ${variant === "filled" ? filled : outline}`}
    >
      {label}
      {variant === "filled" ? (
        <ArrowRight className="h-4 w-4" />
      ) : (
        <ArrowUpRight className="h-4 w-4" />
      )}
    </a>
  );
}
