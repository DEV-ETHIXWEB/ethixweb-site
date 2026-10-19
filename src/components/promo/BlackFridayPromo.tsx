import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { PromoDate } from "@/components/promo/PromoDate";
import { PROMO, promoPhase, promoRemaining, promoVisible } from "@/lib/promo";

/**
 * Seasonal promotion band for the homepage, sitting under the hero.
 *
 * Drawn as editorial layout rather than assembled from the usual landing
 * page parts. The first version of this used a dot-in-a-pill kicker, ticked
 * circles for the service list and four identical boxes for the clock -
 * three patterns that appear on every generated template, which is exactly
 * why they read as generated. They are gone:
 *
 *   kicker     a hairline and letterspaced caps, like a magazine standfirst
 *   services   an indexed list on hairline rules, numbers set in the accent
 *   clock      one baseline of tabular numerals, split by thin rules
 *
 * Nothing here is centred for the sake of it and nothing is evenly spaced.
 * The weight sits left, the date carries the right, and the two are tied
 * together by the rules that run across both.
 *
 * Renders nothing outside the campaign window. See lib/promo.ts.
 */
export function BlackFridayPromo() {
  // The window is time-based and the server renders at a different instant
  // than the browser, so this is decided on the client after mount: SSR and
  // the first client render stay identical, with no hydration mismatch.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null || !promoVisible(now)) return null;

  const live = promoPhase(now) === "live";
  const left = promoRemaining(now);

  return (
    <section
      aria-labelledby="promo-heading"
      className="promo-band relative overflow-hidden py-20 sm:py-28"
    >
      <div className="promo-band-grain pointer-events-none absolute inset-0" />

      <Container className="relative grid items-center gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
        <div className="min-w-0">
          <Reveal>
            {/* Kicker: a rule and letterspaced caps. No pill, no dot. */}
            <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold tracking-[0.2em] text-[#e0555a] uppercase sm:tracking-[0.3em]">
              <span className="h-px w-10 shrink-0 bg-[#e0555a]/60" />
              {live ? "Live now" : "Coming"}
              <span className="text-white/25">/</span>
              <span className="text-white/55">{PROMO.windowLabel}</span>
            </p>
          </Reveal>

          <Reveal delay={0.06}>
            <h2
              id="promo-heading"
              className="font-display mt-6 text-[clamp(1.9rem,4.6vw,3rem)] leading-[0.92] font-extrabold tracking-[-0.035em] text-white"
            >
              Black <span className="promo-friday">Friday</span>
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="font-display mt-6 text-[clamp(1.15rem,2.6vw,1.65rem)] leading-[1.25] font-bold tracking-tight text-balance text-white">
              Every service. One week.{" "}
              <span className="relative inline-block text-[#e0555a]">
                Once a year.
                {/* Hand-drawn underline rather than a border: it tapers and
                    sits slightly off the baseline, the way a drawn mark
                    would. */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 240 12"
                  preserveAspectRatio="none"
                  className="promo-underline absolute -bottom-2 left-0 h-3 w-full overflow-visible"
                >
                  {/* Tapered, so it reads as one pass of a brush rather than
                      a border: the stroke is drawn as a filled outline that
                      is thin at both ends and fullest two thirds along. */}
                  <path
                    d="M3 8.4 C 52 4.1, 132 2.9, 237 5.2 C 132 5.9, 52 7.1, 3 10.1 Z"
                    fill="#c0272d"
                  />
                </svg>
              </span>
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-7 max-w-lg text-[15px] leading-[1.75] text-white/65">
              {live ? PROMO.liveBody : PROMO.teaserBody}
            </p>
          </Reveal>

          <Reveal delay={0.14}>
            {/* Indexed list on rules. Reads as a contents page, not a feature
                grid with ticks. */}
            <ul className="mt-10 border-t border-white/10">
              {PROMO.services.map((s, i) => (
                <li
                  key={s.name}
                  className="flex items-baseline gap-5 border-b border-white/10 py-3.5"
                >
                  <span className="font-display w-6 shrink-0 text-xs font-bold text-[#e0555a]/80 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display min-w-0 flex-1 text-[15px] font-bold tracking-tight text-white">
                    {s.name}
                  </span>
                  <span className="hidden text-right text-xs text-white/45 sm:block">
                    {s.detail}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.18}>
            <Countdown label={live ? "Closes in" : "Opens in"} left={left} />
          </Reveal>

          <Reveal delay={0.22}>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                to="/contact"
                className="promo-cta font-display group inline-flex items-center gap-2.5 text-[15px] font-bold text-white"
              >
                {live ? PROMO.ctaLive : PROMO.ctaTeaser}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <p className="text-xs text-white/45">{PROMO.scopeNote}</p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.12} className="w-full">
          <PromoDate day="27" month="November" range={PROMO.windowLabel} wordmark="Black Friday" />
        </Reveal>
      </Container>
    </section>
  );
}

/** One baseline of numerals split by hairlines, like a departure board.
 * Four identical bordered boxes is the single most templated way to show a
 * countdown, so this does not use them. */
function Countdown({
  label,
  left,
}: {
  label: string;
  left: { days: number; hours: number; minutes: number; seconds: number };
}) {
  const cells = [
    { v: left.days, l: "days" },
    { v: left.hours, l: "hrs" },
    { v: left.minutes, l: "min" },
    { v: left.seconds, l: "sec" },
  ];
  return (
    <div className="mt-10">
      <p className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">{label}</p>
      {/* role=timer with aria-live off: a value that changes every second
          must not be announced every second. */}
      <div
        role="timer"
        aria-live="off"
        className="mt-3 grid grid-cols-4 gap-x-3 sm:flex sm:items-stretch sm:gap-x-0"
      >
        {cells.map((c, i) => (
          <div key={c.l} className="flex items-stretch">
            {i > 0 && <span className="mx-7 hidden w-px self-stretch bg-white/12 sm:block" />}
            <div className="flex items-baseline gap-1.5 sm:gap-2.5">
              <span className="font-display text-[2.1rem] leading-none font-extrabold tracking-[-0.03em] text-white tabular-nums sm:text-[2.6rem]">
                {String(c.v).padStart(2, "0")}
              </span>
              <span className="text-[10px] font-bold tracking-[0.14em] text-white/35 uppercase">
                {c.l}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
