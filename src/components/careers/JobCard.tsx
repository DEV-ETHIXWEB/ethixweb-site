import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock, IndianRupee, ArrowUpRight } from "lucide-react";
import type { Job } from "@/lib/careers-data";

export function JobCard({ job }: { job: Job }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group glass relative flex h-full flex-col rounded-3xl p-7 hover:bg-white/[0.06] transition-colors"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-primary">{job.department}</p>
      <h3 className="mt-2 font-display text-2xl font-semibold leading-snug">{job.title}</h3>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-primary/70" /> {job.location}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-primary/70" /> {job.type}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Briefcase className="h-4 w-4 text-primary/70" /> {job.experience}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <IndianRupee className="h-4 w-4 text-primary/70" /> {job.salary}
        </span>
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{job.summary}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <Link
          to="/careers/apply"
          search={{ role: job.id }}
          className="magnetic inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
        >
          Apply Now
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
        </Link>
        <Link
          to="/careers/$slug"
          params={{ slug: job.slug }}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-foreground hover:border-primary/40 hover:bg-primary/10 transition-colors"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
}
