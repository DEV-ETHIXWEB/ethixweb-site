import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Check, Target } from "lucide-react";
import { jsonLdStringify } from "@/lib/json-ld";
import { OG_IMAGE, SITE_URL, siteUrl } from "@/lib/site";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/shared/PageHero";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Reveal } from "@/components/shared/Reveal";
import { Container } from "@/components/shared/Container";
import { CTASection } from "@/components/shared/CTASection";
import { FaqList, faqSchema } from "@/components/shared/FaqList";
import { CASE_STUDIES } from "@/lib/portfolio-data";
import { LOCATIONS } from "@/data/locations";
import type { Solution } from "@/data/solutions/types";

/** Route `head` for a keyword landing page: title, description, social
 * tags, canonical, Service and FAQPage structured data. */
export function solutionHead(s: Solution) {
  const url = siteUrl(`/${s.slug}`);
  return {
    meta: [
      { title: s.metaTitle },
      { name: "description", content: s.metaDescription },
      { property: "og:title", content: s.metaTitle },
      { property: "og:description", content: s.metaDescription },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: s.metaTitle },
      { name: "twitter:description", content: s.metaDescription },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLdStringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "@id": `${url}#service`,
          name: s.serviceName,
          serviceType: s.serviceType,
          description: s.metaDescription,
          url,
          provider: { "@id": `${SITE_URL}/#organization`, "@type": "Organization", name: "Ethixweb", url: SITE_URL },
          areaServed: [
            { "@type": "Country", name: "United States" },
            ...LOCATIONS.map((l) => ({ "@type": "City", name: l.city, sameAs: l.wiki })),
          ],
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: s.deliverablesHeading,
            itemListElement: s.deliverables.map((d) => ({
              "@type": "Offer",
              itemOffered: { "@type": "Service", name: d.title, description: d.body },
            })),
          },
        }),
      },
      faqSchema(s.faqs),
    ],
  };
}

export function SolutionPage({ s }: { s: Solution }) {
  const proof = s.proof
    .map((slug) => CASE_STUDIES.find((c) => c.slug === slug))
    .filter((c): c is (typeof CASE_STUDIES)[number] => Boolean(c));

  return (
    <SiteLayout>
      <PageHero icon={Target} eyebrow={s.label} title={s.h1} titleSize="text-7xl sm:text-6xl">
        <p>{s.intro}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/contact"
            className="btn-primary group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
          >
            Book a free call
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/our-work"
            className="btn-secondary inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
          >
            See contractor results
          </Link>
        </div>
      </PageHero>

      <Container>
        <Breadcrumbs items={[{ label: "Services", to: "/services" }, { label: s.label }]} />
      </Container>

      {/* The problem */}
      <section className="py-16">
        <Container className="grid items-start gap-10 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <h2 className="font-display text-3xl font-bold text-gradient pb-1 sm:text-4xl">
              {s.problemHeading}
            </h2>
            <div className="mt-6 space-y-5 leading-relaxed text-muted-foreground">
              {s.problem.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="glass-strong rounded-3xl p-8">
              <h3 className="font-display text-xl font-semibold">Keep reading</h3>
              <ul className="mt-5 space-y-3">
                {s.related.map((r) => (
                  <li key={r.to}>
                    <Link
                      to={r.to}
                      className="group inline-flex items-center gap-1.5 text-sm font-semibold hover:text-primary"
                    >
                      {r.label}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Deliverables */}
      <section className="py-16">
        <Container>
          <Reveal>
            <h2 className="max-w-3xl font-display text-3xl font-bold text-gradient pb-1 sm:text-4xl">
              {s.deliverablesHeading}
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {s.deliverables.map((d, i) => (
              <Reveal key={d.title} delay={Math.min(i * 0.05, 0.2)}>
                <div className="glass h-full rounded-3xl p-7">
                  <Check className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 font-display text-lg font-semibold">{d.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="py-16">
        <Container>
          <Reveal>
            <h2 className="font-display text-3xl font-bold text-gradient pb-1 sm:text-4xl">
              How it works
            </h2>
          </Reveal>
          <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {s.steps.map((step, i) => (
              <li key={step.title} className="rounded-3xl border border-border p-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Proof */}
      {proof.length > 0 && (
        <section className="py-16">
          <Container>
            <Reveal>
              <h2 className="font-display text-3xl font-bold text-gradient pb-1 sm:text-4xl">
                Contractors we work with
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {proof.map((c) => (
                <Link
                  key={c.slug}
                  to="/our-work/$slug"
                  params={{ slug: c.slug }}
                  className="glass group flex flex-col rounded-3xl p-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <span className="text-xs font-semibold uppercase tracking-widest text-primary-text">
                    {c.industry}
                  </span>
                  <h3 className="mt-2 font-display text-xl font-semibold">{c.client}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {c.impact}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold">
                    Read the case study
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* FAQ */}
      <section className="py-16">
        <Container>
          <Reveal>
            <h2 className="font-display text-3xl font-bold text-gradient pb-1 sm:text-4xl">
              Questions about {s.label.toLowerCase()}
            </h2>
          </Reveal>
          <FaqList faqs={s.faqs} className="mt-10" />
        </Container>
      </section>

      <CTASection
        title="Want more booked jobs?"
        description="Book a free call. We'll review your website, Google profile and ads, and show you where the jobs are leaking."
        ctaLabel="Book a free call"
        ctaTo="/contact"
      />
    </SiteLayout>
  );
}
