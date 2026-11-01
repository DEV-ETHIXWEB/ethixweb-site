import { createFileRoute, Link } from "@tanstack/react-router";
import { useId, useState } from "react";
import { ArrowRight, ArrowUpRight, Calculator, Link2 } from "lucide-react";
import { jsonLdStringify } from "@/lib/json-ld";
import { OG_IMAGE, SITE_URL, siteUrl } from "@/lib/site";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/shared/PageHero";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Container } from "@/components/shared/Container";
import { CTASection } from "@/components/shared/CTASection";
import { FaqList, faqSchema, type Faq } from "@/components/shared/FaqList";

const TITLE = "Missed Call Revenue Calculator for Contractors | Ethixweb";
const DESCRIPTION =
  "Free calculator: see how much revenue missed calls cost your HVAC, plumbing or home service business each month and year, from your own numbers.";
const URL = siteUrl("/tools/missed-call-calculator");

const FAQS: Faq[] = [
  {
    q: "How is the lost revenue calculated?",
    a: "Missed calls per week, times the share of those callers who would have booked, times your average job value. That gives lost revenue per week, which is multiplied out to a month (52 weeks divided by 12) and a year.",
  },
  {
    q: "How do I find my number of missed calls?",
    a: "Check your phone system or carrier's call log for unanswered calls over a normal week, and leave out spam and repeat calls from the same number. Call tracking software reports it directly.",
  },
  {
    q: "What booking rate should I use?",
    a: "Use the share of answered calls that turn into booked jobs for your business. If you don't know it, start with a conservative guess and adjust it once you track calls properly.",
  },
  {
    q: "Does this include repeat business?",
    a: "No. It only counts the first job. Customers you lose also take their future maintenance, repeat work and referrals with them, so the real cost is usually higher.",
  },
  {
    q: "How can I stop losing missed calls?",
    a: "Answer more of them: extra office cover at peak times, a call-back routine, or an AI receptionist that picks up whenever your team can't and books the job.",
  },
];

export const Route = createFileRoute("/tools/missed-call-calculator")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLdStringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Missed Call Revenue Calculator",
          url: URL,
          description: DESCRIPTION,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Any",
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          publisher: { "@id": `${SITE_URL}/#organization`, "@type": "Organization", name: "Ethixweb", url: SITE_URL },
        }),
      },
      faqSchema(FAQS),
    ],
  }),
  component: CalculatorPage,
});

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function NumberField({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      <div className="mt-3 flex items-center gap-3">
        <input
          type="range"
          aria-label={`${label} slider`}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-[var(--primary)]"
        />
        <div className="flex w-32 items-center rounded-xl border border-border bg-background px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-primary/50">
          {prefix && <span className="text-muted-foreground">{prefix}</span>}
          <input
            id={id}
            type="number"
            inputMode="decimal"
            min={min}
            step={step}
            value={value}
            onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
            className="w-full bg-transparent text-right font-semibold tabular-nums outline-none"
          />
          {suffix && <span className="ml-1 text-muted-foreground">{suffix}</span>}
        </div>
      </div>
    </div>
  );
}

function CalculatorPage() {
  const [missed, setMissed] = useState(8);
  const [rate, setRate] = useState(50);
  const [jobValue, setJobValue] = useState(450);

  const perWeek = missed * (Math.min(rate, 100) / 100) * jobValue;
  const perMonth = (perWeek * 52) / 12;
  const perYear = perWeek * 52;
  const jobsPerYear = missed * (Math.min(rate, 100) / 100) * 52;

  return (
    <SiteLayout>
      <PageHero
        icon={Calculator}
        eyebrow="Free tool"
        title={
          <>
            What are missed calls
            {/* Fixed break: unbroken, this line fits on one line in Kumbh
                Sans but two in the fallback font, so the page jumped. */}
            <br className="hidden sm:block" /> costing you?
          </>
        }
        titleSize="text-7xl sm:text-6xl"
      >
        A free calculator for HVAC, plumbing and home service businesses. Enter your own numbers
        to see the revenue that goes to competitors when calls ring out.
      </PageHero>

      <Container>
        <Breadcrumbs items={[{ label: "Missed call calculator" }]} />
      </Container>

      <section className="py-12">
        <Container className="grid items-start gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="glass-strong space-y-8 rounded-3xl p-6 sm:p-8">
            <NumberField
              label="Missed calls per week"
              hint="Unanswered calls from new customers, not spam or repeat callers."
              value={missed}
              onChange={setMissed}
              min={0}
              max={60}
              step={1}
            />
            <NumberField
              label="Share that would have booked"
              hint="Of calls you answer, how many usually become a booked job?"
              value={rate}
              onChange={(v) => setRate(Math.min(v, 100))}
              min={0}
              max={100}
              step={5}
              suffix="%"
            />
            <NumberField
              label="Average job value"
              hint="Average invoice across repairs, installs and service calls."
              value={jobValue}
              onChange={setJobValue}
              min={0}
              max={10000}
              step={50}
              prefix="$"
            />
          </div>

          <div aria-live="polite" className="rounded-3xl bg-[linear-gradient(135deg,#9d1b20_0%,#6b1114_55%,#30090b_100%)] p-6 text-white shadow-glow sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
              Revenue lost to missed calls
            </p>
            <p className="mt-4 font-display text-5xl font-extrabold tabular-nums sm:text-6xl">
              {usd.format(perYear)}
              <span className="ml-2 text-lg font-semibold text-white/70">/ year</span>
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/15 pt-6">
              <div>
                <dt className="text-xs uppercase tracking-widest text-white/60">Per month</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums">{usd.format(perMonth)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest text-white/60">Jobs lost / year</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums">
                  {Math.round(jobsPerYear).toLocaleString("en-US")}
                </dd>
              </div>
            </dl>
            <p className="mt-6 text-sm leading-relaxed text-white/75">
              First jobs only. Lost customers also take their repeat work and referrals with them.
            </p>
            <Link
              to="/answering-service-for-contractors"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#7a1418]"
            >
              Stop missing calls
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold text-gradient pb-1">
              Why missed calls cost so much
            </h2>
            <div className="mt-5 space-y-4 leading-relaxed text-muted-foreground">
              <p>
                Most homeowners with an urgent problem don&apos;t leave a voicemail. They go back to
                Google and call the next company, so an unanswered call is usually a lost job, not a
                delayed one.
              </p>
              <p>
                It also wastes marketing. If you pay for Google Ads or Local Services Ads, every
                missed call is a lead you paid for and handed to a competitor, and Local Services
                Ads show less often for businesses that don&apos;t answer.{" "}
                <Link
                  to="/blog/$slug"
                  params={{ slug: "missed-calls-ai-receptionist" }}
                  className="font-semibold text-foreground underline decoration-primary/50 underline-offset-4 hover:text-primary"
                >
                  Read the full guide to missed calls
                </Link>
                .
              </p>
            </div>
          </div>
          <div className="glass rounded-3xl p-7">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" aria-hidden="true" />
              <h2 className="font-display text-lg font-semibold">Share this calculator</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Free to link to from your blog, newsletter or training material.
            </p>
            <code className="mt-4 block overflow-x-auto rounded-xl bg-foreground/[0.06] p-4 text-xs leading-relaxed">
              {`<a href="${URL}">Missed Call Revenue Calculator</a> by Ethixweb`}
            </code>
            <Link
              to="/blog"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold hover:text-primary"
            >
              More free guides for contractors <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <h2 className="font-display text-3xl font-bold text-gradient pb-1">Calculator FAQ</h2>
          <FaqList faqs={FAQS} className="mt-8" />
        </Container>
      </section>

      <CTASection
        title="Never miss a call again"
        description="An AI receptionist answers when your team can't, books the job and routes emergencies."
        ctaLabel="See how it works"
        ctaTo="/answering-service-for-contractors"
      />
    </SiteLayout>
  );
}
