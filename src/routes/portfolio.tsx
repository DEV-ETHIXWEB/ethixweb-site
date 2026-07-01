import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { ArrowUpRight, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Our Work - Ethixweb" },
      {
        name: "description",
        content:
          "Real case studies from Ethixweb - websites, SEO and paid media that generated thousands of qualified leads.",
      },
      { property: "og:title", content: "Our Work - Ethixweb Case Studies" },
      { property: "og:description", content: "Selected client work and measurable results." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://ethixweb.com/ethixweb.png" },
      { property: "og:url", content: "https://ethixweb.com/portfolio" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Our Work - Ethixweb Case Studies" },
      { name: "twitter:description", content: "Real case studies from Ethixweb - websites, SEO and paid media that generated thousands of qualified leads." },
      { name: "twitter:image", content: "https://ethixweb.com/ethixweb.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://ethixweb.com/portfolio" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Ethixweb Portfolio",
          url: "https://ethixweb.com/portfolio",
          description: "Real case studies from Ethixweb - websites, SEO and paid media that generated thousands of qualified leads.",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Bals Mobile Dental Hygiene", description: "45% traffic lift and 1,500+ patient inquiries in year one." },
            { "@type": "ListItem", position: 2, name: "MTO Cabinets", description: "2,500+ qualified leads in 12 months at $6 CPL during peak." },
          ],
        }),
      },
    ],
  }),
  component: Portfolio,
});

const projects = [
  {
    t: "Bals Mobile Dental Hygiene",
    c: "Healthcare · 2023",
    d: "Targeted digital marketing + website revamp. 45% traffic lift and 1,500+ patient inquiries in year one, with cost per lead as low as $5.",
    tag: "Web · SEO · Paid",
  },
  {
    t: "MTO Cabinets",
    c: "Custom Cabinetry · 2021",
    d: "Website redesign plus SEO, paid ads and social. 2,500+ qualified leads in 12 months at $6 CPL during peak.",
    tag: "Web · SEO · Paid",
  },
  {
    t: "Bimini Buddie",
    c: "Marine / Boating · 2022",
    d: "UX overhaul plus paid social, search and email. 40% traffic lift and 1,500+ leads in six months, $5 CPL at peak.",
    tag: "Web · Paid · Email",
  },
  {
    t: "Catch Zone",
    c: "Fishing · 2023",
    d: "Performance driven cross channel campaigns. 2,000+ qualified leads with CPL dipping to $3.50 during peak.",
    tag: "Paid · SEO",
  },
  {
    t: "Sharpe Wysman",
    c: "Legal & Financial · 2022",
    d: "Advanced SEO, content and precision targeted ads. 50% traffic increase and 1,800+ qualified leads in year one at $7 CPL.",
    tag: "SEO · Content · Paid",
  },
  {
    t: "Always Natural",
    c: "Wellness / DTC · 2023",
    d: "Site redesign plus SEO, paid ads and social. 60% traffic increase and 2,200+ new leads in six months at $4.50 CPL.",
    tag: "Web · Paid · Social",
  },
];

function Portfolio() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Our work" title="Real clients. Real results.">
        A selection of projects where design, SEO and paid media combined to move the business
        forward.
      </PageHero>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-5">
          {projects.map((p, i) => (
            <Reveal key={p.t} delay={i * 0.06}>
              <div className="group relative overflow-hidden rounded-3xl glass p-8 flex flex-col gap-5 hover:bg-white/[0.06] transition">
                <div className="absolute inset-0 bg-gradient-brand opacity-[0.06] group-hover:opacity-20 transition" />
                <div className="absolute -bottom-32 -right-20 h-64 w-64 rounded-full bg-primary/40 blur-3xl opacity-30 group-hover:opacity-70 transition" />
                <div className="relative">
                  <span className="text-xs uppercase tracking-widest text-primary">{p.tag}</span>
                </div>
                <div className="relative">
                  <p className="text-sm text-muted-foreground">{p.c}</p>
                  <h3 className="mt-1 font-display text-3xl font-bold">{p.t}</h3>
                  <p className="mt-4 text-foreground/85 leading-relaxed">{p.d}</p>
                  <Link
                    to="/contact"
                    className="mt-6 inline-flex items-center gap-1 text-sm text-primary"
                  >
                    See live site <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-16 glass-strong rounded-[2rem] p-12 text-center">
            <h2 className="font-display text-3xl lg:text-4xl font-bold text-gradient pb-1">
              Your business could be next.
            </h2>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 font-medium shadow-glow"
            >
              Start a project <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
