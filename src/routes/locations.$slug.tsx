import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useId, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  MapPin,
  Megaphone,
  PhoneCall,
  Search,
} from "lucide-react";
import { jsonLdStringify } from "@/lib/json-ld";
import { OG_IMAGE, SITE_URL, siteUrl } from "@/lib/site";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/shared/PageHero";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Reveal } from "@/components/shared/Reveal";
import { Container } from "@/components/shared/Container";
import { CardGrid } from "@/components/shared/CardGrid";
import { CTASection } from "@/components/shared/CTASection";
import { getLocation, type Location } from "@/data/locations";
import type { LocationFaq } from "@/data/locations/types";
import { CASE_STUDIES } from "@/lib/portfolio-data";
import { POSTS } from "@/data/posts";

/** One service-area page per city. Everything local (market, areas, FAQs,
 * nearby cities, which case studies to show) comes from the city's data
 * file in src/data/locations; this route only lays it out. */
export const Route = createFileRoute("/locations/$slug")({
  loader: ({ params }) => {
    const location = getLocation(params.slug);
    if (!location) throw notFound();
    return location;
  },
  head: ({ loaderData }) => {
    const loc = loaderData as Location | undefined;
    if (!loc) {
      return {
        meta: [
          { title: "Service area not found - Ethixweb" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const url = siteUrl(`/locations/${loc.slug}`);
    const cityName = `${loc.city}, ${loc.state}`;
    return {
      meta: [
        { title: loc.metaTitle },
        { name: "description", content: loc.metaDescription },
        { property: "og:title", content: loc.metaTitle },
        { property: "og:description", content: loc.metaDescription },
        { property: "og:type", content: "website" },
        { property: "og:image", content: OG_IMAGE },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: loc.metaTitle },
        { name: "twitter:description", content: loc.metaDescription },
        { name: "twitter:image", content: OG_IMAGE },
        { name: "robots", content: "index, follow" },
        { name: "geo.region", content: `US-${loc.state}` },
        { name: "geo.placename", content: cityName },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          // A service-area business: the city goes in areaServed, never a
          // street address (the site publishes none).
          children: jsonLdStringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "@id": `${url}#service`,
            name: `Ethixweb - ${cityName}`,
            url,
            image: OG_IMAGE,
            description: loc.metaDescription,
            email: "info@ethixweb.com",
            priceRange: "$$",
            parentOrganization: { "@type": "Organization", name: "Ethixweb", url: SITE_URL },
            areaServed: [
              {
                "@type": "City",
                name: loc.city,
                sameAs: loc.wiki,
                containedInPlace: {
                  "@type": "AdministrativeArea",
                  name: `${loc.county}, Washington`,
                },
              },
              ...loc.areas.map((a) => ({ "@type": "Place", name: `${a}, ${loc.state}` })),
            ],
            knowsAbout: [
              "HVAC marketing",
              "Plumbing marketing",
              "Home service website design",
              "Google Ads",
              "Google Local Services Ads",
              "Local SEO",
              "Google Business Profile optimization",
            ],
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: `Marketing services for contractors in ${cityName}`,
              itemListElement: SERVICES.map((s) => ({
                "@type": "Offer",
                itemOffered: { "@type": "Service", name: s.title, areaServed: loc.city },
              })),
            },
          }),
        },
        {
          type: "application/ld+json",
          children: jsonLdStringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: loc.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
      ],
    };
  },
  component: LocationPage,
});

const SERVICES = [
  {
    icon: Code2,
    title: "Contractor websites",
    description: "Fast, mobile-first sites with a page for every service and area you want more of.",
    to: "/web-development",
  },
  {
    icon: Search,
    title: "Map Pack & local SEO",
    description: "Google Business Profile, reviews and local pages that move you into the top three.",
    to: "/hvac-plumbing-marketing",
  },
  {
    icon: Megaphone,
    title: "Google Ads & Local Services Ads",
    description: "Campaigns aimed at the jobs you want, with every call tracked to a booked job.",
    to: "/google-ads-management",
  },
  {
    icon: PhoneCall,
    title: "AI receptionist",
    description: "Answers missed and after-hours calls, books the job or captures the details.",
    to: "/ai-automation",
  },
];

function LocationPage() {
  const loc = Route.useLoaderData();
  const cityName = `${loc.city}, ${loc.state}`;
  const proof = loc.proof
    .map((slug) => CASE_STUDIES.find((c) => c.slug === slug))
    .filter((c): c is (typeof CASE_STUDIES)[number] => Boolean(c));
  const nearby = loc.nearby
    .map((slug) => getLocation(slug))
    .filter((l): l is Location => Boolean(l));

  return (
    <SiteLayout>
      <PageHero icon={MapPin} eyebrow={cityName} title={<HeroTitle text={loc.h1} />} titleSize="text-7xl sm:text-6xl">
        <p>{loc.intro}</p>
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
            className="btn-secondary group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
          >
            See contractor results
          </Link>
        </div>
      </PageHero>

      <Container>
        <Breadcrumbs items={[{ label: "Service areas", to: "/locations" }, { label: cityName }]} />
      </Container>

      {/* Local market */}
      <section className="py-16">
        <Container className="grid items-start gap-10 lg:grid-cols-[1.5fr_1fr]">
          <Reveal>
            <p className="text-sm uppercase tracking-widest text-primary-text">
              The {loc.city} market
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-gradient pb-1 sm:text-4xl">
              {loc.marketHeading}
            </h2>
            <div className="mt-6 space-y-5 leading-relaxed text-muted-foreground">
              {loc.market.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="glass-strong rounded-3xl p-8">
              <h3 className="font-display text-xl font-semibold">Areas we cover from {loc.city}</h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {loc.areas.map((a) => (
                  <li
                    key={a}
                    className="rounded-full bg-foreground/[0.05] px-3 py-1.5 text-sm text-foreground/85 ring-1 ring-foreground/10"
                  >
                    {a}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                {loc.county}, Washington. We also work with home service companies across the US.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* What matters here */}
      <section className="py-16">
        <Container>
          <Reveal>
            <p className="text-sm uppercase tracking-widest text-primary-text">
              What we focus on in {loc.city}
            </p>
            <h2 className="mt-3 max-w-3xl font-display text-3xl font-bold text-gradient pb-1 sm:text-4xl">
              Built around the jobs {loc.city} homeowners search for.
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {loc.focus.map((f, i) => (
              <Reveal key={f.title} delay={Math.min(i * 0.06, 0.2)}>
                <div className="glass h-full rounded-3xl p-7">
                  <Check className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Services, linked to the full service pages */}
      <section className="py-16">
        <Container>
          <Reveal>
            <p className="text-sm uppercase tracking-widest text-primary-text">
              Services in {cityName}
            </p>
            <h2 className="mt-3 max-w-3xl font-display text-3xl font-bold text-gradient pb-1 sm:text-4xl">
              Everything that keeps a {loc.city} schedule full.
            </h2>
          </Reveal>
          <div className="mt-10">
            <CardGrid items={SERVICES} cols={4} />
          </div>
        </Container>
      </section>

      {/* Proof from this area */}
      {proof.length > 0 && (
        <section className="py-16">
          <Container>
            <Reveal>
              <p className="text-sm uppercase tracking-widest text-primary-text">Local results</p>
              <h2 className="mt-3 max-w-3xl font-display text-3xl font-bold text-gradient pb-1 sm:text-4xl">
                Contractors we already work with.
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {proof.map((c, i) => (
                <Reveal key={c.slug} delay={Math.min(i * 0.06, 0.2)}>
                  <Link
                    to="/our-work/$slug"
                    params={{ slug: c.slug }}
                    className="glass group flex h-full flex-col overflow-hidden rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    {c.image && (
                      <img
                        src={c.image.src}
                        alt={c.image.alt}
                        width={c.image.width}
                        height={c.image.height}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[16/9] w-full object-cover object-top"
                      />
                    )}
                    <div className="flex flex-1 flex-col p-7">
                      <p className="text-xs font-semibold uppercase tracking-widest text-primary-text">
                        {c.industry}
                      </p>
                      <h3 className="mt-2 font-display text-xl font-semibold">{c.client}</h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {c.impact}
                      </p>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-foreground">
                        Read the case study
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* FAQ */}
      <section className="py-16">
        <Container>
          <Reveal>
            <p className="text-sm uppercase tracking-widest text-primary-text">FAQ</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-gradient pb-1 sm:text-4xl">
              Questions {loc.city} contractors ask.
            </h2>
          </Reveal>
          <div className="mt-10 grid items-start gap-3 lg:grid-cols-2">
            {loc.faqs.map((f, i) => (
              <Reveal key={f.q} delay={Math.min(i * 0.03, 0.2)}>
                <FaqItem faq={f} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Guides: links the articles from every city page */}
      <section className="py-12">
        <Container>
          <h2 className="font-display text-xl font-semibold">Free guides for {loc.city} contractors</h2>
          <ul className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {POSTS.slice(0, 3).map((p) => (
              <li key={p.slug}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="glass group flex h-full items-start justify-between gap-3 rounded-2xl px-5 py-4 text-sm font-semibold transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {p.metaTitle}
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Nearby service areas: internal links between the city pages */}
      {nearby.length > 0 && (
        <section className="py-12">
          <Container>
            <h2 className="font-display text-xl font-semibold">Nearby service areas</h2>
            <ul className="mt-5 flex flex-wrap gap-3">
              {nearby.map((n) => (
                <li key={n.slug}>
                  <Link
                    to="/locations/$slug"
                    params={{ slug: n.slug }}
                    className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                    {n.city}, {n.state}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/locations"
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  All service areas <ArrowRight className="h-4 w-4" />
                </Link>
              </li>
            </ul>
          </Container>
        </section>
      )}

      <CTASection
        title={`Ready for a fuller schedule in ${loc.city}?`}
        description="Book a free call. We'll look at your website, your Google profile and your ads, and show you where the jobs are leaking."
        ctaLabel="Book a free call"
        ctaTo="/contact"
      />
    </SiteLayout>
  );
}

/** Breaks the headline before "in {City}" from sm up. Left to wrap on its
 * own, a headline that nearly fills two lines could take two lines in the
 * fallback font and three in Kumbh Sans, so the page below jumped when the
 * web font arrived. Two short lines fit in either font. */
function HeroTitle({ text }: { text: string }) {
  const i = text.lastIndexOf(" in ");
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <br className="hidden sm:block" />
      <span className="sm:hidden"> </span>
      {text.slice(i + 1)}
    </>
  );
}

function FaqItem({ faq }: { faq: LocationFaq }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50"
        >
          <span className="font-semibold">{faq.q}</span>
          <ArrowDown
            aria-hidden="true"
            className={`h-4 w-4 shrink-0 text-primary transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </h3>
      <div id={panelId} role="region" hidden={!open}>
        <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
      </div>
    </div>
  );
}
