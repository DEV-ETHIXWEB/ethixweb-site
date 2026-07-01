import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";

import { Reveal } from "@/components/Reveal";
import {
  Wrench,
  Anchor,
  Bot,
  ShieldCheck,
  MapPin,
  ShoppingBag,
  Mail,
  ArrowUpRight,
} from "lucide-react";

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title: "Industries - Ethixweb" },
      {
        name: "description",
        content:
          "Specialized tech and marketing systems for HVAC, plumbing and fishing charter operators.",
      },
      { property: "og:title", content: "Industries - HVAC, Plumbing & Fishing" },
      {
        property: "og:description",
        content: "Industry specific websites, AI booking and CRM management.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://ethixweb.com/ethixweb.png" },
      { property: "og:url", content: "https://ethixweb.com/industries" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Industries - HVAC, Plumbing & Fishing" },
      { name: "twitter:description", content: "Specialized tech and marketing systems for HVAC, plumbing and fishing charter operators." },
      { name: "twitter:image", content: "https://ethixweb.com/ethixweb.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://ethixweb.com/industries" }],
  }),
  component: Industries,
});

const hvac = [
  {
    i: Bot,
    t: "CRM / FSM Management",
    d: "Expert setup and management of ServiceTitan, Jobber and Housecall Pro.",
  },
  {
    i: ShieldCheck,
    t: "AI Lead Protection",
    d: "24/7 AI receptionist that texts and books customers instantly if you miss a call.",
  },
  {
    i: MapPin,
    t: "Map Pack Dominance",
    d: "Weekly GMB updates and automated review harvesting to own local search.",
  },
  {
    i: Mail,
    t: "IT & Security",
    d: "Secure business email (Google Workspace) and field team communication setup.",
  },
];

const fishing = [
  {
    i: Anchor,
    t: "Booking Engine Integration",
    d: "FareHarbor, Peek Pro and Bókun management to ensure zero overbookings.",
  },
  {
    i: ShoppingBag,
    t: "E Commerce Merch Store",
    d: "Fully managed Shopify integration to sell your brand's gear 24/7.",
  },
  {
    i: MapPin,
    t: "Catch of the Day SEO",
    d: "We handle catch reports and fishing logs to boost local SEO.",
  },
  {
    i: Mail,
    t: "Reliable Email & IT",
    d: "Pro grade business email and tech support for booking hardware on the boat.",
  },
];

const INDUSTRIES_SCHEMA = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Industry-Specific Technology Systems",
  provider: { "@type": "Organization", name: "Ethixweb", url: "https://ethixweb.com" },
  description: "Specialized tech and marketing systems for HVAC, plumbing and fishing charter operators.",
  url: "https://ethixweb.com/industries",
  areaServed: { "@type": "Country", name: "United States" },
  serviceType: "Industry-Specific Digital Operations",
});

function Industries() {
  return (
    <SiteLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: INDUSTRIES_SCHEMA }} />
      <PageHero eyebrow="Industries" title="Built for the businesses that build America.">
        We specialize in two worlds: home services and fishing charters. Different operations, same
        problem - calls and bookings can't wait.
      </PageHero>

      <IndustryBlock
        eyebrow="HVAC & Plumbing"
        icon={Wrench}
        title="You handle the pipes. We handle the tech."
        pain="You spend $200+ per lead, but miss 30% of your calls while on a job. That's thousands in lost revenue every month."
        items={hvac}
      />

      <IndustryBlock
        eyebrow="Fishing & Charters"
        icon={Anchor}
        title="Your business shouldn't stop at the shoreline."
        pain="You're at sea 10 hours a day. While you're fishing, customers are trying to book. If they can't book instantly, they find another boat."
        items={fishing}
        flipped
      />

      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl glass-strong rounded-[2rem] p-12 text-center">
          <h2 className="font-display text-4xl font-bold text-gradient pb-1">
            Which industry are you in?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
            Tell us about your operation. We'll come back with a clear plan tailored to your
            industry.
          </p>
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 font-medium shadow-glow"
          >
            Book a consultation <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}

function IndustryBlock({
  eyebrow,
  icon: Icon,
  title,
  pain,
  items,
  flipped,
}: {
  eyebrow: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  pain: string;
  items: {
    i: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    t: string;
    d: string;
  }[];
  flipped?: boolean;
}) {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-7xl glass-strong rounded-[2rem] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-hero opacity-60" />
        <div
          className={`relative grid lg:grid-cols-2 gap-10 p-10 lg:p-16 items-start ${flipped ? "lg:[&>*:first-child]:order-2" : ""}`}
        >
          <Reveal>
            <div>
              <div className="inline-flex items-center gap-2 text-primary text-sm uppercase tracking-widest">
                <Icon className="h-5 w-5" strokeWidth={1.5} /> {eyebrow}
              </div>
              <h2 className="mt-4 font-display text-3xl lg:text-4xl font-bold text-gradient leading-tight pb-1">
                {title}
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">{pain}</p>
              <p className="mt-6 text-sm text-foreground/80">
                We build websites that don't just look good - they're built to convert visitors into
                paying customers.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid sm:grid-cols-2 gap-4">
              {items.map((x) => (
                <div key={x.t} className="glass rounded-2xl p-5">
                  <x.i className="h-7 w-7 text-primary mb-3" strokeWidth={1.5} />
                  <h3 className="font-display text-base font-semibold">{x.t}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{x.d}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
