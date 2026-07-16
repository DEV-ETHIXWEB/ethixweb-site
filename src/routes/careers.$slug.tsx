import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { jsonLdStringify } from "@/lib/json-ld";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Container } from "@/components/Container";
import { GlowBlob } from "@/components/GlowBlob";
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
      return {
        meta: [{ title: "Role not found - Ethixweb" }, { name: "robots", content: "noindex" }],
      };
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
          children: jsonLdStringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: job.title,
            description: job.about,
            datePosted: job.datePosted,
            // Rolling window rather than a fixed date, since this is a
            // standing/evergreen listing, not a one-off posting with a known
            // close date - refreshed on every render.
            validThrough: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
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

// Compact editorial section header for the job "document": small outlined
// index + title + fading hairline, echoing the big numbered headers on the
// careers landing page at a scale that suits body sections.
function DocHeader({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <span
        aria-hidden="true"
        className="select-none font-display text-3xl font-extrabold leading-none text-transparent [-webkit-text-stroke:1.2px_rgba(165,28,34,0.45)]"
      >
        {n}
      </span>
      <h2 className="shrink-0 font-display text-2xl font-semibold">{title}</h2>
      <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
    </div>
  );
}

function JobDetail() {
  const job = Route.useLoaderData();
  const otherJobs = JOBS.filter((j) => j.id !== job.id);

  const metaChips = [
    { icon: MapPin, label: job.location },
    { icon: Clock, label: job.type },
    { icon: Briefcase, label: job.experience },
    { icon: IndianRupee, label: job.salary },
  ];

  return (
    <SiteLayout>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative -mt-24 overflow-hidden bg-gradient-hero pb-14 pt-36 sm:pt-44">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <GlowBlob
          size="lg"
          color="primary"
          blur={120}
          className="top-0 left-1/2 -translate-x-1/2"
        />
        <Container size="medium" className="relative">
          <Breadcrumbs items={[{ label: "Careers", to: "/careers" }, { label: job.title }]} />
          <Reveal>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary-text">
                {job.department}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/4.5 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                </span>
                Actively hiring
              </span>
            </div>
            <h1 className="mt-5 font-display text-5xl font-bold text-gradient leading-[1.08] pb-1 sm:text-6xl">
              {job.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{job.summary}</p>

            <div className="mt-7 flex flex-wrap gap-2">
              {metaChips.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/4.5 px-3.5 py-1.5 text-sm text-foreground/85"
                >
                  <chip.icon className="h-4 w-4 text-primary" /> {chip.label}
                </span>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/careers/apply"
                search={{ role: job.id }}
                className="magnetic group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-bold text-primary-foreground shadow-glow"
              >
                Apply for this role
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
              </Link>
              <Link
                to="/careers"
                className="magnetic inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4.5 px-7 py-3.5 font-bold text-foreground hover:border-primary/40 hover:bg-primary/10"
              >
                See all roles
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <section className="px-4 py-16 xs:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          {/* Main content */}
          <div className="space-y-14">
            <Reveal>
              <div>
                <DocHeader n="01" title="Overview" />
                <p className="mt-4 leading-relaxed text-muted-foreground">{job.about}</p>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div>
                <DocHeader n="02" title="Responsibilities" />
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
                <DocHeader n="03" title="Requirements" />
                <div className="mt-5 flex flex-wrap gap-2">
                  {job.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-sm font-medium text-foreground/90 transition-colors hover:border-primary/50"
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
                      <li
                        key={r}
                        className="flex items-start gap-2.5 text-sm text-muted-foreground"
                      >
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
                <DocHeader n="04" title="Benefits" />
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {job.benefits.map((b) => (
                    <div
                      key={b}
                      className="flex items-start gap-2.5 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 transition-colors hover:border-primary/25"
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
                <DocHeader n="05" title="Hiring process" />
                {/* Mini vertical rail, echoing the timeline on the careers page */}
                <div className="relative mt-6">
                  <div
                    aria-hidden="true"
                    className="absolute bottom-2 left-[13.5px] top-2 w-px bg-primary/15"
                  />
                  <ol className="space-y-6">
                    {HIRING_PROCESS.map((step, i) => (
                      <li key={step.title} className="relative pl-12">
                        <span className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-brand text-[11px] font-bold text-white shadow-glow ring-4 ring-background">
                          {i + 1}
                        </span>
                        <p className="font-display text-sm font-semibold sm:text-base">
                          {step.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                          {step.description}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <div>
                <DocHeader n="06" title="FAQs" />
                <div className="mt-5 space-y-3">
                  {job.faqs.map((faq) => (
                    <Faq key={faq.q} q={faq.q} a={faq.a} />
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Compact crimson closer, matching the site's finale panels.
                Forced-dark in both themes - colors are hardcoded. */}
            <Reveal delay={0.3}>
              <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#9d1b20_0%,#6b1114_45%,#30090b_100%)] p-8 text-center ring-1 ring-white/10 sm:p-10">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-7xl font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.09)] sm:text-8xl"
                >
                  APPLY
                </span>
                <div className="relative">
                  <h2 className="font-display text-3xl font-extrabold text-white">
                    Sound like you?
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/75">
                    The application takes under five minutes - a resume and a short note, no
                    essays.
                  </p>
                  <Link
                    to="/careers/apply"
                    search={{ role: job.id }}
                    className="magnetic group mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-bold text-[#7a1418] shadow-[0_14px_40px_-12px_rgba(0,0,0,0.55)]"
                  >
                    Apply for this role
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Sticky apply sidebar */}
          <div className="lg:sticky lg:top-28">
            <Reveal delay={0.1}>
              {/* Forced-dark branded panel (colors hardcoded), so the key
                  facts + apply action pop against the light page body. */}
              <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#3a0b0d_0%,#1c0607_55%,#120405_100%)] p-7 ring-1 ring-white/10">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-3 -top-8 select-none font-display text-[7rem] font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.08)]"
                >
                  {job.title.charAt(0)}
                </span>
                <p className="relative text-xs uppercase tracking-widest text-white/50">
                  Quick facts
                </p>
                <dl className="relative mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-white/55">Location</dt>
                    <dd className="text-right font-medium text-white">{job.location}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-white/55">Employment</dt>
                    <dd className="text-right font-medium text-white">{job.type}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-white/55">Experience</dt>
                    <dd className="text-right font-medium text-white">{job.experience}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                    <dt className="text-white/55">Salary</dt>
                    <dd className="text-right font-semibold text-[#f2545b]">{job.salary}</dd>
                  </div>
                </dl>
                <Link
                  to="/careers/apply"
                  search={{ role: job.id }}
                  className="magnetic group relative mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-[#7a1418] shadow-[0_14px_40px_-12px_rgba(0,0,0,0.55)]"
                >
                  Apply for this role
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                </Link>
                <Link
                  to="/careers"
                  className="relative mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  See all roles
                </Link>
              </div>
            </Reveal>

            {otherJobs.length > 0 && (
              <Reveal delay={0.15}>
                <div className="mt-6 rounded-3xl border border-white/5 bg-white/[0.02] p-7">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Other open roles
                  </p>
                  <div className="mt-4 space-y-3">
                    {otherJobs.map((j) => (
                      <Link
                        key={j.id}
                        to="/careers/$slug"
                        params={{ slug: j.slug }}
                        className="group block rounded-xl border border-white/5 px-4 py-3 hover:border-primary/30 hover:bg-white/[0.04] transition"
                      >
                        <p className="text-sm font-semibold transition-colors group-hover:text-primary">
                          {j.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {j.location} &middot; {j.type}
                        </p>
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
