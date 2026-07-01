import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import {
  Code2,
  Smartphone,
  Wrench,
  Search,
  Layers,
  MousePointerClick,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/web-development")({
  head: () => ({
    meta: [
      { title: "Website Design - Expert Web Design for Home Service Businesses | Ethixweb" },
      {
        name: "description",
        content:
          "Transform your online presence with expert website design. Custom, conversion focused websites for home service businesses - modern, fast, SEO ready.",
      },
      { property: "og:title", content: "Website Design - Ethixweb" },
      {
        property: "og:description",
        content: "Modern and visually stunning websites engineered to convert.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://ethixweb.com/ethixweb.png" },
      { property: "og:url", content: "https://ethixweb.com/web-development" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Website Design - Ethixweb" },
      { name: "twitter:description", content: "Transform your online presence with expert website design. Custom, conversion focused websites for home service businesses." },
      { name: "twitter:image", content: "https://ethixweb.com/ethixweb.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://ethixweb.com/web-development" }],
  }),
  component: Page,
});

const processSteps = [
  {
    n: "01",
    t: "Discovery & Strategy",
    d: "We learn your business, goals and customers before a single pixel is drawn.",
  },
  {
    n: "02",
    t: "Competitor Research",
    d: "We benchmark the local market so your site stands out and outperforms.",
  },
  {
    n: "03",
    t: "Strategic SEO Content",
    d: "Content architected around the terms your future customers actually search.",
  },
  {
    n: "04",
    t: "Personalised Web Design",
    d: "Custom design tailored to your brand - never a template.",
  },
];

const services = [
  {
    i: Code2,
    t: "Custom Website Design",
    d: "Unique, professional designs tailored to reflect your brand and stand out from the competition.",
  },
  {
    i: MousePointerClick,
    t: "Lead Generation Features",
    d: "Integrated forms, call to action buttons and booking systems designed to convert visitors into valuable leads.",
  },
  {
    i: Wrench,
    t: "Maintenance & Support",
    d: "Continuous updates, security monitoring and technical support to keep your website running smoothly and securely.",
  },
  {
    i: Smartphone,
    t: "Responsive Design",
    d: "Optimized for all devices, ensuring a seamless experience for visitors on desktop, tablet and mobile.",
  },
  {
    i: Layers,
    t: "CMS",
    d: "Easy to use platforms like WordPress, allowing you to update content without technical knowledge.",
  },
  {
    i: Search,
    t: "SEO Optimization",
    d: "Built with SEO best practices, increasing visibility and improving rankings to attract more organic traffic.",
  },
];

const promises = [
  "Modern and visually pleasing",
  "User friendly and easy to navigate",
  "Designed for optimal conversions",
  "Responsive across all devices",
  "Interactive with chat and click to call",
  "Fast loading",
];

const SERVICE_SCHEMA = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Website Design & Development",
  provider: { "@type": "Organization", name: "Ethixweb", url: "https://ethixweb.com" },
  description: "Custom, conversion focused websites for home service businesses - modern, fast, and SEO ready.",
  url: "https://ethixweb.com/web-development",
  areaServed: { "@type": "Country", name: "United States" },
  serviceType: "Web Design and Development",
});

function Page() {
  return (
    <SiteLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SERVICE_SCHEMA }} />
      <PageHero
        eyebrow="Website Design"
        title="Transform Your Online Presence with Expert Website Design"
      >
        Modern and visually stunning websites - built for home service businesses that want to
        dominate their local market.
      </PageHero>

      {/* What We Do */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl text-center">
          <Reveal>
            <p className="text-sm uppercase tracking-widest text-primary mb-4">What We Do</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-gradient pb-1">
              Expert Website Design for Home Service Businesses
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              A well designed website is crucial for any home service business looking to stand out
              in today's competitive market. Our expert website design services focus on creating
              visually appealing, user friendly websites that not only represent your brand but also
              drive results.
            </p>
            <Link
              to="/contact"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 font-medium shadow-glow hover:scale-[1.03] transition-transform"
            >
              Contact Us <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Website Process */}
      <section className="px-6 py-24 border-y border-white/5 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-widest text-primary mb-4">Website Process</p>
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-gradient pb-1">
                Designing digital experiences that inspire.
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed max-w-xl">
                Our structured SEO approach ensures long term success and measurable results.
              </p>
            </div>
          </Reveal>
          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {processSteps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <div className="glass rounded-3xl p-8 h-full hover:bg-white/[0.06] transition">
                  <div className="font-display text-5xl font-bold text-gradient-brand">{s.n}</div>
                  <h3 className="mt-6 font-display text-xl font-semibold">{s.t}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-widest text-primary mb-4">Services</p>
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-gradient pb-1">
                Everything you need under one roof.
              </h2>
            </div>
          </Reveal>
          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <Reveal key={s.t} delay={i * 0.05}>
                <div className="group relative h-full overflow-hidden rounded-3xl glass p-8 hover:bg-white/[0.06] transition">
                  <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/30 blur-3xl opacity-0 group-hover:opacity-100 transition" />
                  <s.i className="h-10 w-10 text-primary mb-6" strokeWidth={1.5} />
                  <h3 className="font-display text-xl font-semibold">{s.t}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* All of Our Websites Are */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl glass-strong rounded-[2.5rem] p-10 lg:p-16 relative overflow-hidden">
          <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/20 blur-[120px]" />
          <Reveal>
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <p className="text-sm uppercase tracking-widest text-primary">
                All of Our Websites Are
              </p>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-gradient max-w-2xl pb-1">
              Built to look great, load fast, and convert.
            </h2>
          </Reveal>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {promises.map((p, i) => (
              <Reveal key={p} delay={i * 0.05}>
                <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] border border-white/5 px-5 py-4">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm">{p}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 rounded-full glass px-7 py-3.5 font-medium hover:bg-white/10 transition"
            >
              See our work <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 font-medium shadow-glow hover:scale-[1.03] transition-transform"
            >
              Request a consultation <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
