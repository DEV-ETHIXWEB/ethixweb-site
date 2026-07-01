import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import {
  Bot,
  Workflow,
  Brain,
  MessageSquare,
  ArrowUpRight,
  Sparkles,
  Cable,
  Gauge,
} from "lucide-react";

export const Route = createFileRoute("/ai-automation")({
  head: () => ({
    meta: [
      { title: "AI & Automation - Ethixweb" },
      {
        name: "description",
        content: "Custom AI agents, internal copilots and end to end workflow automation.",
      },
      { property: "og:title", content: "AI & Automation Solutions" },
      { property: "og:description", content: "Production-ready AI systems for modern businesses." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://ethixweb.com/ethixweb.png" },
      { property: "og:url", content: "https://ethixweb.com/ai-automation" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AI & Automation - Ethixweb" },
      { name: "twitter:description", content: "Custom AI agents, internal copilots and end to end workflow automation." },
      { name: "twitter:image", content: "https://ethixweb.com/ethixweb.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://ethixweb.com/ai-automation" }],
  }),
  component: Page,
});

const f = [
  { i: Bot, t: "Custom AI Agents", d: "Domain trained agents for support, sales and ops." },
  {
    i: Workflow,
    t: "Workflow Automation",
    d: "Zapier on steroids: connect any tool, automate any flow.",
  },
  { i: Brain, t: "Internal Copilots", d: "RAG over your docs. Faster decisions everywhere." },
  {
    i: MessageSquare,
    t: "Conversational UX",
    d: "Chat, voice and multi modal interfaces users love.",
  },
];

const SERVICE_SCHEMA = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Service",
  name: "AI & Workflow Automation",
  provider: { "@type": "Organization", name: "Ethixweb", url: "https://ethixweb.com" },
  description: "Custom AI agents, internal copilots and end to end workflow automation for modern businesses.",
  url: "https://ethixweb.com/ai-automation",
  areaServed: { "@type": "Country", name: "United States" },
  serviceType: "AI Automation and Integration",
});

function Page() {
  return (
    <SiteLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SERVICE_SCHEMA }} />
      <PageHero eyebrow="AI & Automation" title="Software that thinks. Workflows that scale.">
        We build production-grade AI that quietly transforms how your business runs.
      </PageHero>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
          <Reveal>
            <div className="premium-card relative mx-auto max-w-xl overflow-hidden rounded-[2rem] p-7">
              <div className="absolute inset-0 ambient-red opacity-70" />
              <div className="absolute inset-0 grid-bg opacity-35" />
              <div className="relative rounded-2xl border border-white/10 bg-[#0C0D10]/70 p-5">
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                    Automation layer
                  </p>
                  <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                </div>
                <div className="mt-5 grid gap-3">
                  {[
                    { icon: Bot, t: "AI receptionist", d: "Answers and qualifies leads" },
                    { icon: Cable, t: "CRM handoff", d: "Creates records and tasks" },
                    { icon: Gauge, t: "Operations signal", d: "Reports actions in real time" },
                  ].map((item) => (
                    <div
                      key={item.t}
                      className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.045] p-4"
                    >
                      <item.icon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-bold">{item.t}</p>
                        <p className="text-sm text-muted-foreground">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-5">
            {f.map((x, i) => (
              <Reveal key={x.t} delay={i * 0.07}>
                <div className="glass rounded-3xl p-7 h-full">
                  <x.i className="h-9 w-9 text-primary mb-5" strokeWidth={1.5} />
                  <h3 className="font-display text-lg font-semibold">{x.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{x.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <CTA />
    </SiteLayout>
  );
}

function CTA() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-7xl glass-strong rounded-[2rem] p-12 text-center">
        <Sparkles className="h-10 w-10 text-primary mx-auto mb-4" />
        <h2 className="font-display text-4xl font-bold text-gradient pb-1">
          Let's automate your hardest process.
        </h2>
        <Link
          to="/contact"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-3.5 font-medium shadow-glow"
        >
          Book a discovery call <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
