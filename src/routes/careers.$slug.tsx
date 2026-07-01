import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JOBS, HIRING_PROCESS, getJob, type Job } from "@/lib/careers-data";
import {
  ArrowUpRight,
  MapPin,
  Clock,
  Briefcase,
  IndianRupee,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

export const Route = createFileRoute("/careers/$slug")({
  loader: ({ params }) => {
    const job = getJob(params.slug);
    if (!job) throw notFound();
    return job;
  },
  head: ({ loaderData }) => {
    const job = loaderData as Job | undefined;
    if (!job) {
      return { meta: [{ title: "Role not found - Ethixweb" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${job.title} - Careers at Ethixweb` },
        { name: "description", content: job.summary },
        { property: "og:title", content: `${job.title} - Ethixweb` },
        { property: "og:description", content: job.summary },
        { property: "og:type", content: "website" },
        { property: "og:image", content: "https://ethixweb.com/ethixweb.png" },
        { property: "og:url", content: `https://ethixweb.com/careers/${job.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${job.title} - Ethixweb` },
        { name: "twitter:description", content: job.summary },
        { name: "twitter:image", content: "https://ethixweb.com/ethixweb.png" },
        { name: "robots", content: "index, follow" },
      ],
      links: [{ rel: "canonical", href: `https://ethixweb.com/careers/${job.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: job.title,
            description: job.about,
            datePosted: "2026-01-01",
            employmentType: "FULL_TIME",
            hiringOrganization: {
              "@type": "Organization",
              name: "Ethixweb",
              sameAs: "https://ethixweb.com",
              logo: "https://ethixweb.com/ethixweb.png",
            },
            jobLocationType: "TELECOMMUTE",
            applicantLocationRequirements: { "@type": "Country", name: "India" },
            skills: job.skills.join(", "),
          }),
        },
      ],
    };
  },
  component: JobDetail,
});

function JobDetail() {
  const job = Route.useLoaderData();
  const otherJobs = JOBS.filter((j) => j.id !== job.id);

  return (
    <SiteLayout>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative -mt-24 overflow-hidden bg-gradient-hero px-6 pb-14 pt-36 sm:pt-44">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-72 w-[40rem] bg-primary/30 blur-[120px] rounded-full" />
        <div className="relative mx-auto max-w-5xl">
          <Breadcrumbs items={[{ label: "Careers", to: "/careers" }, { label: job.title }]} />
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">{job.department}</p>
            <h1 className="mt-5 font-display text-4xl lg:text-6xl font-bold text-gradient leading-[1.1] pb-1">
              {job.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{job.summary}</p>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-foreground/85">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" /> {job.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" /> {job.type}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-primary" /> {job.experience}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <IndianRupee className="h-4 w-4 text-primary" /> {job.salary}
              </span>
            </div>

            <div className="mt-9">
              <Link
                to="/careers/apply"
                search={{ role: job.id }}
                className="magnetic group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-bold text-primary-foreground shadow-glow"
              >
                Apply for this role
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          {/* Main content */}
          <div className="space-y-14">
            <Reveal>
              <div>
                <h2 className="font-display text-2xl font-semibold">Overview</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">{job.about}</p>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div>
                <h2 className="font-display text-2xl font-semibold">Responsibilities</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {job.responsibilities.map((r) => (
                    <li key={r} className="flex items-start gap-2.5 text-sm text-foreground/85">
                      <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5 text-primary" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div>
                <h2 className="font-display text-2xl font-semibold">Requirements</h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {job.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-sm font-medium text-foreground/90"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                {job.bonus.length > 0 && (
                  <>
                    <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                      Bonus
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.bonus.map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm text-foreground/70"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </>
                )}
                {job.otherRequirements.length > 0 && (
                  <ul className="mt-6 grid gap-2.5">
                    {job.otherRequirements.map((r) => (
                      <li key={r} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-primary/70" />
                        {r}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div>
                <h2 className="font-display text-2xl font-semibold">Benefits</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {job.benefits.map((b) => (
                    <div
                      key={b}
                      className="flex items-start gap-2.5 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3"
                    >
                      <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5 text-primary" />
                      <span className="text-sm text-foreground/85">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div>
                <h2 className="font-display text-2xl font-semibold">Hiring process</h2>
                <ol className="mt-5 grid gap-4 sm:grid-cols-2">
                  {HIRING_PROCESS.map((step, i) => (
                    <li key={step.title} className="flex items-start gap-3 rounded-2xl glass p-4">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-sm">{step.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <div>
                <h2 className="font-display text-2xl font-semibold">Frequently asked questions</h2>
                <div className="mt-5 space-y-3">
                  {job.faqs.map((faq) => (
                    <Faq key={faq.q} q={faq.q} a={faq.a} />
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          {/* Sticky apply sidebar */}
          <div className="lg:sticky lg:top-28">
            <Reveal delay={0.1}>
              <div className="glass-strong rounded-3xl p-7">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Quick facts</p>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Location</dt>
                    <dd className="font-medium text-right">{job.location}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Employment</dt>
                    <dd className="font-medium text-right">{job.type}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Experience</dt>
                    <dd className="font-medium text-right">{job.experience}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                    <dt className="text-muted-foreground">Salary</dt>
                    <dd className="font-semibold text-right text-primary">{job.salary}</dd>
                  </div>
                </dl>
                <Link
                  to="/careers/apply"
                  search={{ role: job.id }}
                  className="magnetic group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-glow"
                >
                  Apply for this role
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                </Link>
                <Link
                  to="/careers"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-foreground hover:border-primary/40 hover:bg-primary/10 transition-colors"
                >
                  See all roles
                </Link>
              </div>
            </Reveal>

            {otherJobs.length > 0 && (
              <Reveal delay={0.15}>
                <div className="mt-6 rounded-3xl border border-white/5 bg-white/[0.02] p-7">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Other open roles</p>
                  <div className="mt-4 space-y-3">
                    {otherJobs.map((j) => (
                      <Link
                        key={j.id}
                        to="/careers/$slug"
                        params={{ slug: j.slug }}
                        className="group block rounded-xl border border-white/5 px-4 py-3 hover:border-primary/30 hover:bg-white/[0.04] transition"
                      >
                        <p className="text-sm font-semibold">{j.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{j.location} &middot; {j.type}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-medium text-sm sm:text-base">{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-primary transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
