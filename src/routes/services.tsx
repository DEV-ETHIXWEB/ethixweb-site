import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import {
  Code2,
  Megaphone,
  Search,
  Palette,
  BarChart3,
  PhoneCall,
  ShoppingCart,
  Share2,
  ArrowUpRight,
} from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services - Ethixweb" },
      {
        name: "description",
        content:
          "Websites, Google Ads, Local Services Ads, SEO, conversion tracking and lead gen for US home service businesses.",
      },
      { property: "og:title", content: "Ethixweb Services" },
      {
        property: "og:description",
        content: "Marketing services for plumbing, HVAC and electrical contractors.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://ethixweb.com/ethixweb.png" },
      { property: "og:url", content: "https://ethixweb.com/services" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Ethixweb Services" },
      { name: "twitter:description", content: "Websites, Google Ads, Local Services Ads, SEO, conversion tracking and lead gen for US home service businesses." },
      { name: "twitter:image", content: "https://ethixweb.com/ethixweb.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://ethixweb.com/services" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Ethixweb Services",
          url: "https://ethixweb.com/services",
          description: "Websites, Google Ads, Local Services Ads, SEO, conversion tracking and lead gen for US home service businesses.",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Website Design & Development", url: "https://ethixweb.com/web-development" },
            { "@type": "ListItem", position: 2, name: "AI & Workflow Automation", url: "https://ethixweb.com/ai-automation" },
            { "@type": "ListItem", position: 3, name: "Social Media Marketing", url: "https://ethixweb.com/marketing" },
            { "@type": "ListItem", position: 4, name: "Graphic Design & Branding", url: "https://ethixweb.com/graphic-design" },
          ],
        }),
      },
    ],
  }),
  component: Services,
});

const items = [
  {
    icon: Code2,
    t: "Website Design & Dev",
    d: "WordPress, Astro and headless builds - fast, mobile first, built to convert.",
    to: "/web-development",
  },
  {
    icon: Megaphone,
    t: "Google Ads",
    d: "Search campaigns managed by senior media buyers, optimized weekly for booked jobs.",
    to: "/marketing",
  },
  {
    icon: PhoneCall,
    t: "Local Services Ads",
    d: "Google LSA setup, verification and optimization for top of page placement.",
    to: "/marketing",
  },
  {
    icon: Search,
    t: "SEO & Local SEO",
    d: "Technical SEO, content engines, GBP optimization and local authority building.",
    to: "/services",
  },
  {
    icon: BarChart3,
    t: "Conversion Tracking",
    d: "GA4, GTM and CallRail setup so every lead is attributed to its real source.",
    to: "/services",
  },
  {
    icon: Share2,
    t: "Social & Content",
    d: "Social media management and content that builds trust in your local market.",
    to: "/marketing",
  },
  {
    icon: Palette,
    t: "Brand & Creative",
    d: "Identity, ad creative and photography direction that looks trustworthy and premium.",
    to: "/services",
  },
  {
    icon: ShoppingCart,
    t: "CRM & Lead Systems",
    d: "CRM integrations, lifecycle flows and lead routing that turn calls into customers.",
    to: "/ai-automation",
  },
];

function Services() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Services" title="Everything a home service business needs to grow.">
        Websites, ads, SEO and tracking - handled by a senior team that actually answers the phone.
      </PageHero>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((s, i) => (
            <Reveal key={s.t} delay={i * 0.05}>
              <Link
                to={s.to}
                className="group block h-full glass rounded-3xl p-7 hover:bg-white/[0.06] transition"
              >
                <s.icon className="h-9 w-9 text-primary mb-5" strokeWidth={1.5} />
                <h3 className="font-display text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
                <ArrowUpRight className="mt-5 h-4 w-4 text-primary group-hover:rotate-45 transition" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
