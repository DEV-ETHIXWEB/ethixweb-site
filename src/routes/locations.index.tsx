import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { jsonLdStringify } from "@/lib/json-ld";
import { OG_IMAGE, SITE_URL, siteUrl } from "@/lib/site";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/shared/PageHero";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Reveal } from "@/components/shared/Reveal";
import { Container } from "@/components/shared/Container";
import { CTASection } from "@/components/shared/CTASection";
import { LOCATIONS } from "@/data/locations";

const TITLE = "Service Areas: Seattle, Puget Sound & Nationwide | Ethixweb";
const DESCRIPTION =
  "Ethixweb helps HVAC, plumbing and home service contractors in Seattle, SeaTac, Tacoma, Bellevue and across Puget Sound, and works with contractors nationwide.";

export const Route = createFileRoute("/locations/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:url", content: siteUrl("/locations") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: siteUrl("/locations") }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLdStringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Ethixweb service areas",
          itemListElement: LOCATIONS.map((l, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${l.city}, ${l.state}`,
            url: siteUrl(`/locations/${l.slug}`),
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: jsonLdStringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          "@id": `${SITE_URL}/#service-areas`,
          name: "Ethixweb",
          url: SITE_URL,
          image: OG_IMAGE,
          description: DESCRIPTION,
          areaServed: [
            ...LOCATIONS.map((l) => ({ "@type": "City", name: l.city, sameAs: l.wiki })),
            { "@type": "Country", name: "United States" },
          ],
        }),
      },
    ],
  }),
  component: LocationsHub,
});

function LocationsHub() {
  return (
    <SiteLayout>
      <PageHero icon={MapPin} eyebrow="Service areas" title="Where we help contractors grow">
        Based in Washington, working with HVAC, plumbing and home service companies across Puget
        Sound and the rest of the US.
      </PageHero>
      <Container>
        <Breadcrumbs items={[{ label: "Service areas" }]} />
      </Container>

      <section className="py-16">
        <Container>
          <Reveal>
            <p className="text-sm uppercase tracking-widest text-primary-text">Puget Sound</p>
            <h2 className="mt-3 max-w-3xl font-display text-3xl font-bold text-gradient pb-1 sm:text-4xl">
              Seattle, the south end and the Eastside.
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LOCATIONS.map((l, i) => (
              <Reveal as="li" key={l.slug} delay={Math.min(i * 0.04, 0.2)}>
                <Link
                  to="/locations/$slug"
                  params={{ slug: l.slug }}
                  className="glass group flex h-full flex-col rounded-3xl p-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary-text">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {l.county}
                  </span>
                  <h3 className="mt-3 font-display text-2xl font-semibold">
                    {l.city}, {l.state}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {l.intro}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold">
                    Marketing in {l.city}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16">
        <Container className="grid items-start gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="text-sm uppercase tracking-widest text-primary-text">Nationwide</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-gradient pb-1 sm:text-4xl">
              Not in Washington? We work with contractors across the US.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="space-y-5 leading-relaxed text-muted-foreground">
              <p>
                Everything we do for a Seattle contractor works the same way in Phoenix, Dallas or
                Salt Lake City: a fast website with a page for every service and area, a Google
                Business Profile that earns its place in the Map Pack, ads tracked to booked jobs,
                and an AI receptionist so no call goes to voicemail.
              </p>
              <p>
                One of our case studies is a plumbing and HVAC company in Northern Utah, and our
                team works across US time zones. Start with a free call and we will tell you
                honestly whether we can help in your market.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/hvac-plumbing-marketing"
                  className="btn-secondary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
                >
                  HVAC & plumbing marketing
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-3 text-sm font-semibold hover:text-primary"
                >
                  All services <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <CTASection
        title="Want to own your local market?"
        description="Book a free call and we'll show you where you rank today and what it takes to reach the Map Pack."
        ctaLabel="Book a free call"
        ctaTo="/contact"
      />
    </SiteLayout>
  );
}
