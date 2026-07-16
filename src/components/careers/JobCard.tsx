import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Briefcase, Clock, IndianRupee, MapPin } from "lucide-react";
import { WebSpotlight } from "@/components/WebSpotlight";
import { trackWebSpotlight } from "@/lib/web-spotlight";
import type { Job } from "@/lib/careers-data";

const SHOWN_SKILLS = 4;

// Full-width interactive row rather than a boxed card: with only a couple of
// open roles, two small cards float in whitespace, while big rows read as a
// deliberate, editorial list. The whole row links to the detail page via a
// stretched link; the Apply button sits above it on its own z-index.
export function JobCard({ job }: { job: Job }) {
  const shownSkills = job.skills.slice(0, SHOWN_SKILLS);
  const moreSkills = job.skills.length - shownSkills.length;

  return (
    <div
      onMouseMove={trackWebSpotlight}
      className="group web-card relative overflow-hidden rounded-3xl border border-border bg-white/[0.02] transition-colors duration-300 hover:border-primary/35"
    >
      <WebSpotlight />

      {/* Everything interactive lives INSIDE this wrapper: styles.css has a
          `.web-card > * { position: relative }` rule (it lifts card content
          above the decorative corner masks) that flattens any absolutely-
          positioned DIRECT child - a stretched link placed at this level
          collapses to zero size and becomes unclickable. */}
      <div className="relative grid items-center gap-7 p-7 sm:p-9 lg:grid-cols-[1.5fr_1fr_auto] lg:gap-10">
        {/* Crimson sweep that fades in from the left edge on hover */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-primary/[0.08] via-primary/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Stretched details link - covers the row; the actions column sits
            above it on z-[2] so Apply Now stays clickable. */}
        <Link
          to="/careers/$slug"
          params={{ slug: job.slug }}
          className="absolute inset-0 z-[1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50"
          aria-label={`${job.title} - view details`}
        />
        <div>
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
          <h3 className="mt-4 font-display text-3xl font-semibold leading-tight transition-colors duration-300 group-hover:text-primary sm:text-4xl">
            {job.title}
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {job.summary}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0 text-primary/70" /> {job.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 shrink-0 text-primary/70" /> {job.type}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 shrink-0 text-primary/70" /> {job.experience}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IndianRupee className="h-4 w-4 shrink-0 text-primary/70" /> {job.salary}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {shownSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-white/10 bg-white/4.5 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors group-hover:border-primary/20"
              >
                {skill}
              </span>
            ))}
            {moreSkills > 0 && (
              <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary-text">
                +{moreSkills} more
              </span>
            )}
          </div>
        </div>

        <div className="relative z-[2] flex items-center gap-4 lg:flex-col lg:items-end lg:gap-5">
          <Link
            to="/careers/apply"
            search={{ role: job.id }}
            className="magnetic inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            Apply Now
          </Link>
          {/* Real link, not decoration: it sits in the z-[2] actions column,
              ABOVE the stretched row link, so if it were a plain span it
              would swallow clicks and read as a dead button. */}
          <Link
            to="/careers/$slug"
            params={{ slug: job.slug }}
            aria-label={`${job.title} - view details`}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 text-foreground transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
          </Link>
        </div>
      </div>
    </div>
  );
}
