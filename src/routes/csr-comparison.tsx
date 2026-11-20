import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  Check,
  Headset,
  LineChart,
  MessageSquareText,
  Minus,
  PlugZap,
  Siren,
  SlidersHorizontal,
  X,
  type LucideIcon,
} from "lucide-react";
import { jsonLdStringify } from "@/lib/json-ld";
import { OG_IMAGE, SITE_URL, siteUrl } from "@/lib/site";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/shared/PageHero";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { EditorialHeader } from "@/components/shared/EditorialHeader";
import { CTASection } from "@/components/shared/CTASection";
import { FaqList, faqSchema, type Faq } from "@/components/shared/FaqList";

const URL = siteUrl("/csr-comparison");
const TITLE = "CSR for HVAC & Plumbing: How We Compare | Ethixweb";
const DESCRIPTION =
  "Ethixweb's customer service response (CSR) answers every call, books jobs into your software and routes emergencies by your rules. See how it compares.";

export const Route = createFileRoute("/csr-comparison")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLdStringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "@id": `${URL}#service`,
          name: "Customer service response (CSR) for contractors",
          serviceType: "Call answering and booking for home service contractors",
          description: DESCRIPTION,
          url: URL,
          provider: { "@id": `${SITE_URL}/#organization`, "@type": "Organization", name: "Ethixweb", url: SITE_URL },
          areaServed: { "@type": "Country", name: "United States" },
        }),
      },
      faqSchema(FAQS),
    ],
  }),
  component: CsrComparison,
});

type Mark = "yes" | "partly" | "no";
type Cell = { mark: Mark; note: string };
type Row = { label: string; ours: Cell; service: Cell; inHouse: Cell };

const COLUMNS = [
  { key: "ours", label: "Ethixweb CSR" },
  { key: "service", label: "Typical answering service" },
  { key: "inHouse", label: "Doing it in-house" },
] as const;

const ROWS: Row[] = [
  {
    label: "Answers at 2am on a Sunday",
    ours: { mark: "yes", note: "Every call, 24/7" },
    service: { mark: "yes", note: "Usually, yes" },
    inHouse: { mark: "partly", note: "Only with an on-call rota" },
  },
  {
    label: "Books the job during the call",
    ours: { mark: "yes", note: "Into ServiceTitan, Jobber or Housecall Pro" },
    service: { mark: "no", note: "Takes a message for a callback" },
    inHouse: { mark: "partly", note: "When someone is free to pick up" },
  },
  {
    label: "Emergencies reach the on-call tech",
    ours: { mark: "yes", note: "Straight away, by call or text" },
    service: { mark: "partly", note: "Relayed, often after a delay" },
    inHouse: { mark: "partly", note: "Depends on who answers" },
  },
  {
    label: "Knows your services, areas and financing",
    ours: { mark: "yes", note: "Set up from your business" },
    service: { mark: "partly", note: "A general script" },
    inHouse: { mark: "yes", note: "Your team knows it" },
  },
  {
    label: "Texts back callers who hang up",
    ours: { mark: "yes", note: "Automatically" },
    service: { mark: "no", note: "Not usually included" },
    inHouse: { mark: "partly", note: "If someone remembers" },
  },
  {
    label: "Shows which calls became booked jobs",
    ours: { mark: "yes", note: "Summaries and reporting" },
    service: { mark: "partly", note: "A message log" },
    inHouse: { mark: "partly", note: "Whatever gets written down" },
  },
  {
    label: "Rules change when your business does",
    ours: { mark: "yes", note: "Tuned with you, any time" },
    service: { mark: "partly", note: "Within their standard options" },
    inHouse: { mark: "yes", note: "Retrain the team" },
  },
  {
    label: "Keeps your phone number",
    ours: { mark: "yes", note: "Calls forward from your line" },
    service: { mark: "yes", note: "Usually, yes" },
    inHouse: { mark: "yes", note: "Yes" },
  },
];

const MARK_ICON: Record<Mark, LucideIcon> = { yes: Check, partly: Minus, no: X };
const MARK_LABEL: Record<Mark, string> = { yes: "Yes", partly: "Partly", no: "No" };

const REASONS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: BookOpenCheck,
    title: "It books, not just answers",
    body: "Routine work is booked into your schedule on the call, using your real availability. The homeowner hangs up with a time, not a promise of a callback.",
  },
  {
    icon: Siren,
    title: "Emergencies go out in seconds",
    body: "No heat, no cooling in a heat wave, an active leak: whatever you call an emergency goes to your on-call tech by call or text, at any hour.",
  },
  {
    icon: Headset,
    title: "It sounds like your business",
    body: "Your services, service areas, hours, financing and policies, so callers get the answer your best office person would give.",
  },
  {
    icon: PlugZap,
    title: "Works with your software",
    body: "Bookings and customer details land in ServiceTitan, Jobber or Housecall Pro, where your team already works. No extra inbox to check.",
  },
  {
    icon: MessageSquareText,
    title: "No caller is left hanging",
    body: "Anyone who hangs up gets a text straight away, so the conversation carries on instead of moving to the next number in the search results.",
  },
  {
    icon: LineChart,
    title: "You see what it earns",
    body: "A short summary of every call goes to your team, with reporting on how many calls turned into booked jobs.",
  },
];

const CONTROLS: { title: string; body: string }[] = [
  {
    title: "When it answers",
    body: "After hours only, during busy periods, or every call nobody picks up. You can change it by season.",
  },
  {
    title: "What counts as an emergency",
    body: "Your definition, not a template. A dead furnace in January and a slow drain in May get very different treatment.",
  },
  {
    title: "Who gets the call, and how",
    body: "Pick the on-call tech, the order to try people in, and whether they get a call, a text or both.",
  },
  {
    title: "Where and what you serve",
    body: "Service areas and job types you want, so the schedule fills with work you would actually take.",
  },
  {
    title: "How bookings are made",
    body: "Slot lengths, job types per slot, and how far ahead customers can book, matched to how your crews run.",
  },
  {
    title: "What callers hear",
    body: "Greetings, financing offers, policies and answers to the questions your customers ask most.",
  },
];

const STEPS = [
  { title: "Map your calls", body: "We look at your call volume, missed calls and what callers usually need." },
  { title: "Set the rules", body: "Services, areas, hours, booking rules and what counts as an emergency." },
  { title: "Connect and test", body: "Phone forwarding and your field software, with test calls you can listen to first." },
  { title: "Go live and tune", body: "We review calls in the first weeks and refine answers and routing." },
];

const FAQS: Faq[] = [
  {
    q: "What does CSR mean here?",
    a: "Customer service response: how your business answers, books and follows up every call. Ethixweb's CSR is an AI receptionist set up around your business that answers every call, books routine work and routes emergencies.",
  },
  {
    q: "How is it different from a traditional answering service?",
    a: "A traditional service usually takes a message for you to return. Our CSR books the appointment during the call, answers common questions about your business and sends emergencies straight to your on-call tech.",
  },
  {
    q: "Can I decide what counts as an emergency?",
    a: "Yes. You set the rules, and you can change them whenever your season or team changes. Matching calls go to your on-call technician immediately by call or text.",
  },
  {
    q: "Does it work with ServiceTitan, Jobber and Housecall Pro?",
    a: "Yes. Bookings and customer details go straight into the software you already use.",
  },
  {
    q: "Will callers know it's AI?",
    a: "The voice sounds natural, but we recommend being upfront. Most homeowners care most about getting help fast and a confirmed time.",
  },
  {
    q: "Do I keep my phone number?",
    a: "Yes. Calls forward from your existing line, so nothing changes on your website, ads or trucks.",
  },
];

function MarkBadge({ cell, strong = false }: { cell: Cell; strong?: boolean }) {
  const Icon = MARK_ICON[cell.mark];
  const tone =
    cell.mark === "yes"
      ? strong
        ? "bg-primary text-primary-foreground"
        : "bg-foreground/10 text-foreground"
      : cell.mark === "partly"
        ? "bg-foreground/5 text-muted-foreground"
        : "border border-border text-muted-foreground/70";
  return (
    <span className="flex items-start gap-2.5">
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${tone}`}>
        <Icon className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
        <span className="sr-only">{MARK_LABEL[cell.mark]}:</span>
      </span>
      <span className={`text-sm leading-snug ${strong ? "text-foreground" : "text-muted-foreground"}`}>
        {cell.note}
      </span>
    </span>
  );
}

function CsrComparison() {
  return (
    <SiteLayout>
      <PageHero icon={Headset} eyebrow="CSR · just launched" title="Every call answered. Your rules, not ours.">
        <p>
          Ethixweb's customer service response answers every call your team misses, books the job into your
          software and sends emergencies to whoever is on call, set up around how your business actually runs.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/contact"
            className="btn-primary group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
          >
            Book a free call
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#compare"
            className="btn-secondary inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
          >
            See the comparison
          </a>
        </div>
      </PageHero>

      <Container>
        <Breadcrumbs items={[{ label: "Services", to: "/services" }, { label: "CSR" }]} />
      </Container>

      {/* Comparison */}
      <section id="compare" className="scroll-mt-28 py-16">
        <Container>
          <EditorialHeader
            className="mb-12"
            index="01"
            eyebrow="How the options compare"
            title="Three ways to answer the phone. One books the job."
            sub="An honest look at the usual choices. Each has its place; this is where they differ."
          />

          {/* Desktop table */}
          <Reveal>
            <div className="glass hidden overflow-hidden rounded-3xl md:block">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">
                  Ethixweb CSR compared with a typical answering service and handling calls in-house
                </caption>
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="w-[28%] px-6 py-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      What matters
                    </th>
                    {COLUMNS.map((c) => (
                      <th
                        key={c.key}
                        scope="col"
                        className={`w-[24%] px-6 py-5 font-display text-base font-semibold ${
                          c.key === "ours" ? "relative bg-primary/[0.07] text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {c.key === "ours" ? (
                          <>
                            <span className="absolute inset-x-0 top-0 h-0.5 bg-primary" aria-hidden="true" />
                            {c.label}
                          </>
                        ) : (
                          c.label
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r, i) => (
                    <tr key={r.label} className={i < ROWS.length - 1 ? "border-b border-border" : ""}>
                      <th scope="row" className="px-6 py-5 align-top text-sm font-semibold text-foreground">
                        {r.label}
                      </th>
                      <td className="bg-primary/[0.07] px-6 py-5 align-top">
                        <MarkBadge cell={r.ours} strong />
                      </td>
                      <td className="px-6 py-5 align-top">
                        <MarkBadge cell={r.service} />
                      </td>
                      <td className="px-6 py-5 align-top">
                        <MarkBadge cell={r.inHouse} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          {/* Phone: one card per question */}
          <ul className="grid gap-3 md:hidden">
            {ROWS.map((r) => (
              <li key={r.label} className="glass rounded-2xl p-5">
                <p className="font-display text-base font-semibold">{r.label}</p>
                <dl className="mt-4 space-y-3">
                  {COLUMNS.map((c) => (
                    <div key={c.key}>
                      <dt
                        className={`text-[11px] font-semibold uppercase tracking-widest ${
                          c.key === "ours" ? "text-primary-text" : "text-muted-foreground"
                        }`}
                      >
                        {c.label}
                      </dt>
                      <dd className="mt-1.5">
                        <MarkBadge cell={r[c.key]} strong={c.key === "ours"} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>

          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
            "Typical answering service" describes a common message-taking setup, not any particular company.
            Services vary, so ask any provider exactly what is included.
          </p>
        </Container>
      </section>

      {/* Why ours */}
      <section className="py-16">
        <Container>
          <EditorialHeader
            className="mb-12"
            index="02"
            eyebrow="Why ours is different"
            title="Built like your best office person, awake all night."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {REASONS.map((r, i) => (
              <Reveal key={r.title} delay={0.04 * i}>
                <div className="glass h-full rounded-3xl p-7">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                    <r.icon className="h-[18px] w-[18px] text-primary-text" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold">{r.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Customisation */}
      <section className="py-16">
        <Container>
          <EditorialHeader
            className="mb-12"
            index="03"
            eyebrow="Shaped to your business"
            title="Your rules. We build around them."
            sub="No two shops run the same way, so nothing here is a fixed package. These are the dials we set with you, and change whenever you need."
          />
          <Reveal>
            <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {CONTROLS.map((c, i) => (
                <div key={c.title} className="bg-card p-7">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-sm font-bold tabular-nums text-primary-text">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <SlidersHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Cost of a missed call */}
      <section className="py-16">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-brand p-8 sm:p-12">
              <div className="absolute inset-0 grid-bg opacity-30" aria-hidden="true" />
              <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_1.2fr]">
                <div>
                  <p className="text-sm uppercase tracking-widest text-primary-foreground/70">One example from our calculator</p>
                  <p className="mt-3 font-display text-6xl font-extrabold leading-none tracking-tight text-primary-foreground sm:text-7xl">
                    $93,600
                  </p>
                  <p className="mt-3 text-base text-primary-foreground/80">a year, or 208 first-time jobs, lost to unanswered calls</p>
                </div>
                <div className="text-primary-foreground/85">
                  <p className="leading-relaxed">
                    That figure is built from typical missed-call and close rates, not a promise. Your number will
                    be different, so put in your own missed calls, booking rate and job value and see what the
                    phone is costing you.
                  </p>
                  <Link
                    to="/tools/missed-call-calculator"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground px-6 py-3 text-sm font-semibold text-[#16100f] transition-transform hover:-translate-y-0.5"
                  >
                    Work out your number
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Setup */}
      <section className="py-16">
        <Container>
          <EditorialHeader className="mb-12" index="04" eyebrow="Going live" title="Four steps, tested before a single real call." />
          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} as="li" delay={0.04 * i}>
                <div className="h-full rounded-3xl border border-border p-6">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <Container>
          <EditorialHeader className="mb-10" index="05" eyebrow="Questions" title="What owners ask before switching." />
          <FaqList faqs={FAQS} />
        </Container>
      </section>

      <CTASection
        icon={Headset}
        title="Hear it answer your calls."
        description="Book a free call and we'll map your calls, then set up test calls you can listen to before anything goes live."
        ctaLabel="Book a free call"
        ctaTo="/contact"
      />
    </SiteLayout>
  );
}
