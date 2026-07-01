import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import {
  Check,
  MapPin,
  ArrowUpRight,
  Code2,
  Search,
  Megaphone,
  Palette,
  PhoneCall,
  MousePointerClick,
} from "lucide-react";

export const Route = createFileRoute("/locations/kent-wa")({
  head: () => ({
    meta: [
      { title: "Website Design Services in Kent, WA - Ethixweb" },
      {
        name: "description",
        content:
          "Professional web design, SEO and digital marketing for Kent WA home service businesses, restaurants, contractors and local shops.",
      },
      { property: "og:title", content: "Web Design Services in Kent, WA" },
      {
        property: "og:description",
        content:
          "Modern, mobile friendly websites that help Kent WA businesses attract more customers.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://ethixweb.com/ethixweb.png" },
      { property: "og:url", content: "https://ethixweb.com/locations/kent-wa" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Web Design Services in Kent, WA - Ethixweb" },
      { name: "twitter:description", content: "Professional web design, SEO and digital marketing for Kent WA businesses." },
      { name: "twitter:image", content: "https://ethixweb.com/ethixweb.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://ethixweb.com/locations/kent-wa" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://ethixweb.com/" },
            { "@type": "ListItem", position: 2, name: "Locations", item: "https://ethixweb.com/locations" },
            { "@type": "ListItem", position: 3, name: "Kent, WA", item: "https://ethixweb.com/locations/kent-wa" },
          ],
        }),
      },
    ],
  }),
  component: Page,
});

const services = [
  {
    i: Code2,
    t: "Custom Website Design",
    d: "Fully customized website design tailored to your brand, goals and customers.",
  },
  {
    i: Search,
    t: "Search Engine Optimization",
    d: "Boost your online visibility and attract more customers with result driven SEO.",
  },
  {
    i: Megaphone,
    t: "Social Media Marketing",
    d: "Engage your audience and grow your brand with impactful social campaigns.",
  },
  {
    i: Palette,
    t: "Graphic Design & Branding",
    d: "Transform your brand's identity with creative and impactful design solutions.",
  },
  {
    i: PhoneCall,
    t: "Local Services Ads (LSA)",
    d: "Connect with trusted local professionals near you for fast, reliable services.",
  },
  {
    i: MousePointerClick,
    t: "Pay Per Click (PPC)",
    d: "Drive targeted traffic and boost sales with cost effective PPC ads.",
  },
];

const benefits = [
  "Build trust instantly with a clean, modern design.",
  "Show up on Google when local customers search for your services.",
  "Generate leads 24/7 with easy to use forms and click to call features.",
  "Look great on mobile - since most customers search on their phones.",
];

const industries = [
  "Plumbing, HVAC & Home Services",
  "Restaurants & Food Businesses",
  "Real Estate & Contractors",
  "Retail & E commerce Stores",
  "Professional Services (lawyers, consultants, healthcare)",
];

const LOCAL_BUSINESS_SCHEMA = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Ethixweb",
  url: "https://ethixweb.com",
  logo: "https://ethixweb.com/ethixweb.png",
  image: "https://ethixweb.com/ethixweb.png",
  description:
    "Professional web design, SEO and digital marketing for Kent WA home service businesses, restaurants, contractors and local shops.",
  email: "akash@ethixweb.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kent",
    addressRegion: "WA",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 47.3809,
    longitude: -122.2348,
  },
  areaServed: {
    "@type": "City",
    name: "Kent",
    sameAs: "https://en.wikipedia.org/wiki/Kent,_Washington",
  },
  priceRange: "$$",
});

function Page() {
  return (
    <SiteLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: LOCAL_BUSINESS_SCHEMA }}
      />
      <PageHero
        eyebrow={
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Kent, WA
          </span>
        }
        title="Website Design Services in Kent, WA"
      >
        Modern, mobile friendly websites that help Kent WA businesses attract more customers and
        grow faster.
      </PageHero>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl glass-strong rounded-[2rem] p-10 lg:p-14">
          <Reveal>
            <p className="text-sm uppercase tracking-widest text-primary">Local web design</p>
            <h2 className="mt-3 font-display text-3xl lg:text-4xl font-bold text-gradient pb-1">
              Professional web design for local businesses in Kent WA.
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              If you run a business in Kent WA, you already know how important it is to stand out.
              Whether you're a plumber, HVAC contractor, restaurant owner or retail shop, your
              website is often the first impression customers have of your business. At Ethixweb, we
              create modern, mobile friendly websites that help local businesses in Kent attract
              more customers and grow faster.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-widest text-primary mb-4">
                Our services in Kent WA
              </p>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-gradient pb-1">
                Built to look good - and convert.
              </h2>
            </div>
          </Reveal>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <Reveal key={s.t} delay={i * 0.05}>
                <div className="glass rounded-3xl p-7 h-full">
                  <s.i className="h-9 w-9 text-primary mb-5" strokeWidth={1.5} />
                  <h3 className="font-display text-lg font-semibold">{s.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-10 items-start">
          <Reveal>
            <div className="glass-strong rounded-3xl p-8">
              <p className="text-sm uppercase tracking-widest text-primary">Why it matters</p>
              <h3 className="mt-3 font-display text-2xl font-semibold">
                Your Kent WA business needs a professional site.
              </h3>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Most Kent WA customers search online before making a decision. If your website looks
                outdated, loads slowly, or doesn't show up in Google results, you're likely losing
                business to competitors.
              </p>
              <ul className="mt-6 space-y-3">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 mt-0.5 text-primary flex-none" /> <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="glass-strong rounded-3xl p-8">
              <p className="text-sm uppercase tracking-widest text-primary">Industries we serve</p>
              <h3 className="mt-3 font-display text-2xl font-semibold">
                From plumbers to professional services.
              </h3>
              <ul className="mt-6 space-y-3">
                {industries.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 mt-0.5 text-primary flex-none" /> <span>{b}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-muted-foreground">
                No matter your industry, our goal is the same: help your Kent WA business grow with
                a website that works.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl glass-strong rounded-[2rem] p-12 text-center">
          <h2 className="font-display text-4xl font-bold text-gradient pb-1">
            Ready to grow in Kent, WA?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            Request a free consultation and we'll map out your local growth plan.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 font-medium shadow-glow"
          >
            Request a consultation <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
