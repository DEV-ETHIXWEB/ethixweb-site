import { createFileRoute, Link } from "@tanstack/react-router";
import { jsonLdStringify } from "@/lib/json-ld";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/shared/PageHero";
import { Reveal } from "@/components/shared/Reveal";
import { Container } from "@/components/shared/Container";
import { CardGrid } from "@/components/shared/CardGrid";
import { CTASection } from "@/components/shared/CTASection";
import { Bot, Workflow, Brain, MessageSquare, Cable, Gauge } from "lucide-react";
import { OG_IMAGE, SITE_URL, siteUrl } from "@/lib/site";
import { FaqList, faqSchema, type Faq } from "@/components/shared/FaqList";
import { ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/ai-automation")({
  head: () => ({
    meta: [
      { title: "AI Receptionist & Automation for Contractors | Ethixweb" },
      {
        name: "description",
        content: "An AI receptionist that answers every call, books jobs into ServiceTitan, Jobber or Housecall Pro and texts back missed calls, plus automation for the busywork.",
      },
      { property: "og:title", content: "AI Receptionist & Automation for Contractors" },
      { property: "og:description", content: "An AI receptionist that answers every call, books jobs into ServiceTitan, Jobber or Housecall Pro and texts back missed calls, plus automation for the busywork." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:url", content: siteUrl("/ai-automation") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "AI Receptionist & Automation for Contractors | Ethixweb" },
      {
        name: "twitter:description",
        content: "An AI receptionist that answers every call, books jobs into ServiceTitan, Jobber or Housecall Pro and texts back missed calls, plus automation for the busywork.",
      },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: siteUrl("/ai-automation") }],
    scripts: [faqSchema(FAQS)],
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
  name: "AI Receptionist & Workflow Automation",
  provider: { "@type": "Organization", name: "Ethixweb", url: SITE_URL },
  description:
    "AI receptionists that answer and book calls for home service businesses, plus custom AI agents and workflow automation connected to field software and CRMs.",
  url: siteUrl("/ai-automation"),
  areaServed: { "@type": "Country", name: "United States" },
  serviceType: "AI receptionist and business automation",
  audience: { "@type": "BusinessAudience", audienceType: "HVAC, plumbing and home service contractors" },
});

const STEPS = [
  {
    t: "It answers in your company's name",
    d: "Every call your team misses, after hours or all the time, whichever you choose. Your number stays the same.",
  },
  {
    t: "It asks the right questions",
    d: "What the problem is, the address, how urgent it is and the best number to reach them, using your services, areas and hours.",
  },
  {
    t: "It books or escalates",
    d: "Routine jobs go straight into an open slot. Emergencies, like no heat or a burst pipe, go to your on-call tech by call or text.",
  },
  {
    t: "Your team gets the summary",
    d: "A short write-up of every call lands in your CRM and your phone, and anyone who hung up gets a text back.",
  },
];

const CONNECTS = [
  "ServiceTitan, Jobber and Housecall Pro for bookings and customer records",
  "Your existing business phone number and call forwarding",
  "Google Business Profile and Local Services Ads leads",
  "Website forms and chat, so every lead lands in one place",
  "Call tracking, so you can see which marketing produced each booked job",
  "Text messaging for missed-call text back and appointment reminders",
];

const FAQS: Faq[] = [
  {
    q: "What is an AI receptionist?",
    a: "A voice assistant that answers your business phone when your team can't. It knows your services, service area and hours, books appointments, captures job details and sends everything to your team, day or night.",
  },
  {
    q: "Will my customers know they're talking to AI?",
    a: "Modern voice assistants sound natural, but we recommend being upfront. Most homeowners care far more about getting a fast answer and a booked time than about who picked up.",
  },
  {
    q: "Can it handle emergency calls?",
    a: "Yes. You set the rules. For example, no heat in winter or an active leak can be sent straight to your on-call technician, while routine requests are booked into the next open slot.",
  },
  {
    q: "Does it work with ServiceTitan, Jobber or Housecall Pro?",
    a: "Yes. Bookings and customer details go into the field software you already use, so nobody has to copy information over by hand.",
  },
  {
    q: "Do I need a new phone number?",
    a: "No. Calls can ring your team first and only go to the AI receptionist when nobody answers, or go to it directly after hours. Your number stays the same.",
  },
  {
    q: "How long does setup take?",
    a: "Most setups are live in one to two weeks, including your services, service areas, booking rules and the connection to your field software. You hear test calls before it answers real customers.",
  },
];

function Page() {
  return (
    <SiteLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SERVICE_SCHEMA }} />
      <PageHero
        icon={Bot}
        eyebrow="AI & Automation"
        title="AI receptionists and automation that never miss a call."
      >
        An AI receptionist that answers every call, books the job and texts back the ones you
        miss, plus the automation that moves every lead into your CRM without anyone retyping it.
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
      {/* How it works */}
      <section className="py-20">
        <Container className="grid items-start gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="text-sm uppercase tracking-widest text-primary-text">How it works</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-gradient pb-1 sm:text-4xl">
              What happens when a customer calls and your team can&apos;t pick up.
            </h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              Most callers with an urgent problem do not leave a voicemail. They call the next
              company. The AI receptionist answers in your company&apos;s name, handles the call the
              way a trained office person would, and hands your team a booked job or a clear
              summary.{" "}
              <Link
                to="/blog/$slug"
                params={{ slug: "missed-calls-ai-receptionist" }}
                className="font-semibold text-foreground underline decoration-primary/50 underline-offset-4 hover:text-primary"
              >
                What missed calls really cost a contractor
              </Link>
              .
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <ol className="space-y-4">
              {STEPS.map((step, i) => (
                <li key={step.t} className="glass flex gap-4 rounded-2xl p-5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{step.t}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      </section>

      {/* Integrations */}
      <section className="py-20">
        <Container>
          <Reveal>
            <p className="text-sm uppercase tracking-widest text-primary-text">Connected</p>
            <h2 className="mt-3 max-w-3xl font-display text-3xl font-bold text-gradient pb-1 sm:text-4xl">
              It works inside the tools you already run.
            </h2>
          </Reveal>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CONNECTS.map((c) => (
              <li key={c} className="flex items-start gap-3 rounded-2xl border border-border p-5 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <Container>
          <Reveal>
            <p className="text-sm uppercase tracking-widest text-primary-text">FAQ</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-gradient pb-1 sm:text-4xl">
              Questions about AI receptionists.
            </h2>
          </Reveal>
          <FaqList faqs={FAQS} className="mt-10" />
          <Link
            to="/hvac-plumbing-marketing"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold hover:text-primary"
          >
            See the full system for HVAC & plumbing companies <ArrowRight className="h-4 w-4" />
          </Link>
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
