import { Link } from "@tanstack/react-router";
import { Check, ArrowUpRight, Sparkles } from "lucide-react";
import { Reveal } from "./Reveal";

type Row = { label: string; values: [string, string, string] };

const tiers = [
  {
    name: "Foundation",
    tag: "Basic",
    price: "$299",
    blurb: "The essentials to get online and stay online.",
    cta: "Start with Foundation",
    highlight: false,
  },
  {
    name: "Growth",
    tag: "Pro",
    price: "$599",
    blurb: "Faster support, more reviews, and an AI receptionist.",
    cta: "Choose Growth",
    highlight: true,
  },
  {
    name: "Infrastructure",
    tag: "Elite",
    price: "$1,200+",
    blurb: "Dedicated infrastructure and a true CTO partner.",
    cta: "Go Elite",
    highlight: false,
  },
];

const rows: Row[] = [
  {
    label: "Website Hosting",
    values: ["Managed WP (Cloudways)", "Managed WP (Cloudways)", "Dedicated Server"],
  },
  {
    label: "IT Support",
    values: ["Email (24hr response)", "Priority Slack / Phone", "1 on 1 CTO Support"],
  },
  {
    label: "GMB Operations",
    values: ["Monthly Updates", "Weekly + Review Replies", "Daily + Competitor Tracking"],
  },
  {
    label: "AI Booking",
    values: ["Standard SMS Bot", "AI Voice Receptionist", "Full CRM API Sync"],
  },
  {
    label: "Security",
    values: ["SSL & Backups", "2FA + Malware Monitoring", "Full Workspace Management"],
  },
];

export function Pricing() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-widest text-primary mb-4">Pricing</p>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-gradient">
              Service packages built for home service operators.
            </h2>
            <p className="mt-5 text-muted-foreground">
              Flat monthly pricing. No surprises. Switch tiers anytime.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <div
                className={`relative h-full rounded-3xl p-8 flex flex-col ${
                  t.highlight ? "bg-gradient-brand shadow-glow text-primary-foreground" : "glass"
                }`}
              >
                {t.highlight && (
                  <span className="absolute -top-3 left-8 inline-flex items-center gap-1 rounded-full bg-background px-3 py-1 text-[10px] uppercase tracking-widest text-primary border border-primary/30">
                    <Sparkles className="h-3 w-3" /> Most Popular
                  </span>
                )}
                <p
                  className={`text-xs uppercase tracking-widest ${t.highlight ? "text-primary-foreground/80" : "text-primary"}`}
                >
                  {t.tag}
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold">{t.name}</h3>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-bold">{t.price}</span>
                  <span
                    className={`text-sm ${t.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                  >
                    /month
                  </span>
                </div>
                <p
                  className={`mt-3 text-sm ${t.highlight ? "text-primary-foreground/85" : "text-muted-foreground"}`}
                >
                  {t.blurb}
                </p>
                <ul className="mt-6 space-y-2.5 text-sm flex-1">
                  {rows.map((r, idx) => (
                    <li key={r.label} className="flex items-start gap-2">
                      <Check
                        className={`h-4 w-4 mt-0.5 flex-none ${t.highlight ? "text-primary-foreground" : "text-primary"}`}
                      />
                      <span>
                        <span
                          className={
                            t.highlight ? "text-primary-foreground/80" : "text-muted-foreground"
                          }
                        >
                          {r.label}:{" "}
                        </span>
                        <span className="font-medium">{r.values[i]}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className={`mt-8 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition ${
                    t.highlight
                      ? "bg-background text-foreground hover:scale-[1.03]"
                      : "bg-gradient-brand text-primary-foreground hover:scale-[1.03]"
                  }`}
                >
                  {t.cta} <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
