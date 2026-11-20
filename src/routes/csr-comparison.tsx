import { createFileRoute, Link } from "@tanstack/react-router";
import { jsonLdStringify } from "@/lib/json-ld";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { EditorialHeader } from "@/components/shared/EditorialHeader";
import { FaqList, faqSchema } from "@/components/shared/FaqList";
import {
  CheckCircle2,
  XCircle,
  Zap,
  Lock,
  Settings,
  TrendingUp,
  Phone,
  Clock,
  DollarSign,
} from "lucide-react";
import { OG_IMAGE, siteUrl } from "@/lib/site";

export const Route = createFileRoute("/csr-comparison")({
  head: () => ({
    meta: [
      { title: "Ethixweb vs Traditional Answering Services | Customer Service Response Comparison" },
      {
        name: "description",
        content:
          "Compare Ethixweb's AI-powered customer service solution with traditional answering services and in-house support. Customizable, flexible, and built for contractors.",
      },
      { property: "og:title", content: "CSR Solutions: Ethixweb vs The Alternatives" },
      {
        property: "og:description",
        content:
          "Why Ethixweb's customer service response system outperforms traditional answering services and DIY support.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:url", content: siteUrl("/csr-comparison") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "CSR Solutions Comparison" },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: siteUrl("/csr-comparison") }],
    scripts: [
      faqSchema(FAQS),
      {
        type: "application/ld+json",
        children: jsonLdStringify({
          "@context": "https://schema.org",
          "@type": "ComparisonChart",
          name: "Ethixweb vs Traditional Customer Service Response",
          url: siteUrl("/csr-comparison"),
          description: "Side-by-side comparison of customer service solutions",
        }),
      },
    ],
  }),
  component: CSRComparison,
});

function CSRComparison() {
  return (
    <SiteLayout>
      <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Hero Section */}
        <Container>
          <div className="py-20 md:py-32 space-y-8">
            <Reveal>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Customer Service Response:<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Stop Choosing Between Inflexible Systems
                </span>
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">
                Every contractor's needs are different. So why settle for a one-size-fits-all answering service? Ethixweb's customer service solution is built for flexibility, customization, and real control over your phone answering.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="flex flex-wrap gap-4 pt-8">
                <Link
                  to="/answering-service-for-contractors"
                  className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold transition"
                >
                  See How It Works
                </Link>
                <Link
                  to="/contact"
                  className="px-8 py-3 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 rounded-lg font-semibold transition"
                >
                  Request a Demo
                </Link>
              </div>
            </Reveal>
          </div>
        </Container>

        {/* Comparison Table */}
        <Container>
          <div className="py-20 space-y-12">
            <Reveal>
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-4xl font-bold">Head-to-Head Comparison</h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  How Ethixweb stacks up against traditional approaches to customer service response.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-800 bg-opacity-50">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-6 font-semibold text-slate-200">Feature</th>
                      <th className="text-center p-6 font-semibold">Ethixweb AI</th>
                      <th className="text-center p-6 font-semibold">Traditional Service</th>
                      <th className="text-center p-6 font-semibold">In-House Staff</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {COMPARISON_DATA.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-700 hover:bg-opacity-30 transition">
                        <td className="p-6 font-medium text-slate-200">{row.feature}</td>
                        <td className="p-6 text-center">
                          {row.ethixweb ? (
                            <CheckCircle2 className="w-6 h-6 text-cyan-400 mx-auto" />
                          ) : (
                            <XCircle className="w-6 h-6 text-slate-500 mx-auto" />
                          )}
                        </td>
                        <td className="p-6 text-center">
                          {row.traditional ? (
                            <CheckCircle2 className="w-6 h-6 text-slate-500 mx-auto" />
                          ) : (
                            <XCircle className="w-6 h-6 text-slate-500 mx-auto" />
                          )}
                        </td>
                        <td className="p-6 text-center">
                          {row.inhouse ? (
                            <CheckCircle2 className="w-6 h-6 text-slate-500 mx-auto" />
                          ) : (
                            <XCircle className="w-6 h-6 text-slate-500 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
          </div>
        </Container>

        {/* Benefits Section */}
        <Container>
          <div className="py-20 space-y-16">
            <Reveal>
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold">Why Ethixweb Wins</h2>
                <p className="text-slate-400 text-lg">The features that make a real difference to your bottom line.</p>
              </div>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-8">
              {BENEFITS.map((benefit, idx) => (
                <Reveal key={idx} delay={0.05 * idx}>
                  <div className="p-8 rounded-xl border border-slate-700 bg-slate-800 bg-opacity-50 hover:bg-opacity-100 hover:border-cyan-400 transition space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-cyan-500 bg-opacity-20 rounded-lg">
                        {benefit.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-cyan-400">{benefit.title}</h3>
                      </div>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{benefit.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>

        {/* Customization Focus */}
        <Container>
          <div className="py-20 space-y-12">
            <Reveal>
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-12 md:p-16 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold">Built for Your Business, Not Ours</h2>
                  <p className="text-xl text-slate-300">
                    Every contractor has different rules, priorities, and workflows. Ethixweb adapts to you—not the other way around.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-8">
                  {CUSTOMIZATION_OPTIONS.map((option, idx) => (
                    <Reveal key={idx} delay={0.05 * idx}>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Zap className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                          <h3 className="font-semibold text-lg">{option.title}</h3>
                        </div>
                        <p className="text-slate-300">{option.description}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </Container>

        {/* Cost Analysis */}
        <Container>
          <div className="py-20 space-y-12">
            <Reveal>
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold">The Real Cost of Inflexibility</h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  It's not just about monthly fees. Missed calls, lost customization, and wasted time add up.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="grid md:grid-cols-3 gap-8">
                {COST_FACTORS.map((factor, idx) => (
                  <div key={idx} className="p-8 rounded-xl border border-slate-700 bg-slate-800 bg-opacity-50 space-y-4">
                    <div className="text-4xl font-bold text-cyan-400">{factor.impact}</div>
                    <h3 className="text-xl font-semibold">{factor.title}</h3>
                    <p className="text-slate-300 text-sm">{factor.description}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </Container>

        {/* FAQ */}
        <Container>
          <div className="py-20">
            <Reveal>
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-4xl font-bold">Common Questions</h2>
              </div>
            </Reveal>
            <FaqList items={FAQS} />
          </div>
        </Container>

        {/* CTA Section */}
        <Container>
          <div className="py-20 space-y-8">
            <Reveal>
              <div className="bg-gradient-to-r from-cyan-900 to-blue-900 border border-cyan-400 rounded-2xl p-12 md:p-16 text-center space-y-6">
                <h2 className="text-4xl font-bold">Ready to Control Your Customer Service?</h2>
                <p className="text-xl text-slate-200 max-w-2xl mx-auto">
                  Stop compromising on flexibility. See how Ethixweb's fully customizable CSR solution works for your business.
                </p>
                <Link
                  to="/contact"
                  className="inline-block px-10 py-4 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold text-lg transition"
                >
                  Start Your Free Consultation
                </Link>
              </div>
            </Reveal>
          </div>
        </Container>
      </div>
    </SiteLayout>
  );
}

const COMPARISON_DATA = [
  {
    feature: "Real-Time Call Routing",
    ethixweb: true,
    traditional: false,
    inhouse: true,
  },
  {
    feature: "Custom Emergency Rules",
    ethixweb: true,
    traditional: false,
    inhouse: true,
  },
  {
    feature: "Direct Field Software Integration",
    ethixweb: true,
    traditional: false,
    inhouse: false,
  },
  {
    feature: "Instant Caller Notifications",
    ethixweb: true,
    traditional: false,
    inhouse: true,
  },
  {
    feature: "24/7 Availability",
    ethixweb: true,
    traditional: true,
    inhouse: false,
  },
  {
    feature: "Flexible Pricing Tiers",
    ethixweb: true,
    traditional: false,
    inhouse: false,
  },
  {
    feature: "No Long-Term Contracts",
    ethixweb: true,
    traditional: false,
    inhouse: false,
  },
  {
    feature: "Payroll & Benefits Overhead",
    ethixweb: false,
    traditional: false,
    inhouse: true,
  },
  {
    feature: "Human Receptionist",
    ethixweb: false,
    traditional: true,
    inhouse: true,
  },
  {
    feature: "Complete Customization",
    ethixweb: true,
    traditional: false,
    inhouse: true,
  },
];

const BENEFITS = [
  {
    icon: <Zap className="w-6 h-6 text-cyan-400" />,
    title: "AI Speed with Human Touch",
    description:
      "Instant responses to emergency calls without the delays of message-taking. Automated and intelligent, never cold.",
  },
  {
    icon: <Lock className="w-6 h-6 text-cyan-400" />,
    title: "Complete Control",
    description:
      "Set your own rules for what's an emergency, who gets contacted, and how. No black-box decisions made for you.",
  },
  {
    icon: <Settings className="w-6 h-6 text-cyan-400" />,
    title: "Flexible Integration",
    description:
      "Works with ServiceTitan, Jobber, Housecall Pro, or any field software you're already using. No ripping and replacing.",
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-cyan-400" />,
    title: "Scales with You",
    description:
      "Start small, grow fast. Add features, change rules, and adjust capacity as your business changes. No rigid tiers.",
  },
  {
    icon: <DollarSign className="w-6 h-6 text-cyan-400" />,
    title: "Pay Only for What You Use",
    description:
      "Transparent pricing that doesn't surprise you. No hidden fees, no minimums, no penalties for flexibility.",
  },
  {
    icon: <Phone className="w-6 h-6 text-cyan-400" />,
    title: "Real Support When You Need It",
    description:
      "Direct access to the team that knows your setup. Not a tier-1 call center, not a chatbot. Real expertise.",
  },
];

const CUSTOMIZATION_OPTIONS = [
  {
    title: "Emergency Definitions",
    description:
      "You decide what counts as an emergency—no heat, burst pipes, active leaks, or anything custom to your business.",
  },
  {
    title: "Routing Rules",
    description:
      "Real emergencies go to your on-call tech by SMS. Routine work books directly into your software. Voicemail gets texts.",
  },
  {
    title: "Service Area Limits",
    description:
      "Filter calls by location, ZIP code, or service type. Only handle the work you actually want.",
  },
  {
    title: "Hours & Availability",
    description:
      "Open 24/7, or just during your preferred hours. Holidays, seasonal changes, or one-off closures—you control it.",
  },
  {
    title: "Integration Depth",
    description:
      "Light integration for starters, or deep automation that syncs everything. Scale up as you're ready.",
  },
  {
    title: "Pricing & Scaling",
    description:
      "Month-to-month, no contracts. Add more calls, teams, or features instantly. Remove them just as fast.",
  },
];

const COST_FACTORS = [
  {
    impact: "$93.6K",
    title: "Annual Cost of Missed Calls",
    description:
      "One contractor loses roughly 208 first-time jobs per year to unanswered calls. That's $93,600 of revenue walking to your competitor.",
  },
  {
    impact: "50-70%",
    title: "Caller Abandonment Rate",
    description:
      "When a homeowner calling at 11pm doesn't reach you, they don't leave a message. They call the next number. And the one after that.",
  },
  {
    impact: "2-3 hrs",
    title: "Setup & Training Time",
    description:
      "Generic systems waste your team's time figuring out workflows, troubleshooting integrations, and retraining staff.",
  },
];

const FAQS = [
  {
    q: "How is Ethixweb's CSR different from traditional answering services?",
    a: "Traditional services take messages and pass them along later. Ethixweb answers immediately, categorizes the call in real time, routes emergencies to your tech by SMS, and books routine work straight into your field software. No delays, no lost context, no games.",
  },
  {
    q: "Can I customize what counts as an emergency?",
    a: "Yes, completely. You define the rules. No heat, burst pipes, active leaks—or anything specific to your business. If it matches your emergency criteria, the on-call tech gets instant notification. Everything else routes to booking or voicemail.",
  },
  {
    q: "Does it work with my existing field software?",
    a: "If you use ServiceTitan, Jobber, Housecall Pro, or most standard platforms, yes. Integrations are built-in. Bookings land where your team already works. No separate inbox to check, no duplicate data entry.",
  },
  {
    q: "What if I need to change my rules mid-month?",
    a: "Change them anytime, instantly. No penalties, no contracts, no waiting for support to process your request. It's your system—modify it whenever your needs shift.",
  },
  {
    q: "How much more expensive is Ethixweb than a traditional service?",
    a: "Pricing is competitive and transparent. The question isn't cost—it's what you're actually paying for. A missed call during a freeze week costs far more than an extra dollar per call. Flexibility and control have real value.",
  },
  {
    q: "Can I start small and add features later?",
    a: "Yes. Start with basic routing, add SMS notifications when you're ready, integrate deeper with your software over time. Month-to-month, no contracts. Scale at your pace.",
  },
];
