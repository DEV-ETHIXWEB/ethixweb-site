import { createFileRoute } from "@tanstack/react-router";
import { jsonLdStringify } from "@/lib/json-ld";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/shared/PageHero";
import { Reveal } from "@/components/shared/Reveal";
import { Container } from "@/components/shared/Container";
import { CardGrid } from "@/components/shared/CardGrid";
import { CTASection } from "@/components/shared/CTASection";
import { Bot, Workflow, Brain, MessageSquare, Cable, Gauge } from "lucide-react";

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
      { property: "og:image", content: "https://www.ethixweb.com/ethixweb.png" },
      { property: "og:url", content: "https://www.ethixweb.com/ai-automation" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AI & Automation - Ethixweb" },
      {
        name: "twitter:description",
        content: "Custom AI agents, internal copilots and end to end workflow automation.",
      },
      { name: "twitter:image", content: "https://www.ethixweb.com/ethixweb.png" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://www.ethixweb.com/ai-automation" }],
  }),
  component: Page,
});

const f = [
  {
    icon: Bot,
    title: "Custom AI Agents",
    description: "Domain trained agents for support, sales and ops.",
  },
  {
    icon: Workflow,
    title: "Workflow Automation",
    description: "Zapier on steroids: connect any tool, automate any flow.",
  },
  {
    icon: Brain,
    title: "Internal Copilots",
    description: "RAG over your docs. Faster decisions everywhere.",
  },
  {
    icon: MessageSquare,
    title: "Conversational UX",
    description: "Chat, voice and multi modal interfaces users love.",
  },
];

const SERVICE_SCHEMA = jsonLdStringify({
  "@context": "https://schema.org",
  "@type": "Service",
  name: "AI & Workflow Automation",
  provider: { "@type": "Organization", name: "Ethixweb", url: "https://www.ethixweb.com" },
  description:
    "Custom AI agents, internal copilots and end to end workflow automation for modern businesses.",
  url: "https://www.ethixweb.com/ai-automation",
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
      <section className="py-20">
        <Container className="grid items-center gap-12 sm:grid-cols-2 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <div className="premium-card relative mx-auto max-w-xl overflow-hidden rounded-[2rem] p-7">
              <div className="absolute inset-0 ambient-red opacity-70" />
              <div className="absolute inset-0 grid-bg opacity-35" />
              <div className="relative rounded-2xl border border-white/10 bg-[#0C0D10]/70 p-5">
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary-text">
                    Automation layer
                  </p>
                  <Workflow className="h-4 w-4 shrink-0 text-primary" />
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
          <div>
            <h2 className="sr-only">Core capabilities</h2>
            <CardGrid items={f} />
          </div>
        </Container>
      </section>
      <CTASection
        icon={Workflow}
        title="Let's automate your hardest process."
        ctaLabel="Book a discovery call"
        ctaTo="/contact"
      />
    </SiteLayout>
  );
}
