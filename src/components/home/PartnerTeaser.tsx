import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Blocks, Handshake, Layers, UserPlus, type LucideIcon } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";

const PATHS: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: UserPlus, title: "Refer a business", body: "Introduce a contractor who needs more booked jobs." },
  { icon: Layers, title: "Agencies & freelancers", body: "We deliver for your clients, under your brand." },
  { icon: Blocks, title: "Software & industry", body: "Help the same contractors, together." },
];

export function PartnerTeaser() {
  return (
    <section className="px-4 py-10 xs:px-6 sm:py-16 lg:px-8">
      <Reveal>
        <Container className="relative overflow-hidden rounded-4xl border border-border bg-card/70 py-10 sm:py-12 lg:py-14">
            <div className="pointer-events-none absolute inset-0 grid-bg opacity-25" aria-hidden="true" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-[90px]"
            />
            <div className="relative grid items-center gap-10 sm:px-4 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:px-10">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary-text">
                  <Handshake className="h-3.5 w-3.5" aria-hidden="true" />
                  Partner program
                </p>
                <h2 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
                  Know a contractor who keeps <span className="text-primary">missing calls?</span>
                </h2>
                <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
                  Send them our way, or bring us in on your clients' projects. Leave your details and we'll talk
                  through how partnering works for you.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    to="/partners"
                    hash="apply"
                    className="btn-primary group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
                  >
                    Become a partner
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    to="/partners"
                    className="btn-secondary inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold"
                  >
                    How it works
                  </Link>
                </div>
              </div>

              <ul className="grid gap-3">
                {PATHS.map((p, i) => (
                  <li key={p.title}>
                    <Link
                      to="/partners"
                      className="group flex items-center gap-4 rounded-2xl border border-border bg-background/40 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:p-5"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                        <p.icon className="h-5 w-5 text-primary-text" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-2">
                          <span className="font-display text-xs font-bold tabular-nums text-muted-foreground/60">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="font-display text-base font-semibold text-foreground">{p.title}</span>
                        </span>
                        <span className="mt-0.5 block text-sm text-muted-foreground">{p.body}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary-text" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
        </Container>
      </Reveal>
    </section>
  );
}
