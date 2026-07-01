import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { upload } from "@vercel/blob/client";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useTheme } from "@/components/ThemeProvider";
import { JOBS, getJob } from "@/lib/careers-data";
import {
  Mail,
  MapPin,
  ArrowUpRight,
  Check,
  UploadCloud,
  FileText,
  X,
  Loader2,
} from "lucide-react";

const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_RESUME_BYTES = 10 * 1024 * 1024;

const NOTICE_PERIODS = [
  { id: "immediate", label: "Immediate" },
  { id: "15-days", label: "15 days" },
  { id: "30-days", label: "30 days" },
  { id: "60-days", label: "60 days" },
  { id: "90-days", label: "90+ days" },
];

const searchSchema = z.object({ role: z.string().optional() });

const slide = {
  enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
};

export const Route = createFileRoute("/careers/apply")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Apply - Careers at Ethixweb" },
      { name: "description", content: "Apply for an open role at Ethixweb in a few quick steps." },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "https://ethixweb.com/careers/apply" }],
  }),
  component: ApplyPage,
});

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ApplyPage() {
  const { role } = Route.useSearch();
  const preselected = getJob(role);

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const stepDotBorder = isDark ? "rgba(255,255,255,0.15)" : "rgba(16,15,20,0.18)";
  const stepLineBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(16,15,20,0.1)";

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [roleId, setRoleId] = useState(preselected?.id ?? "");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [github, setGithub] = useState("");
  const [experience, setExperience] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentCtc, setCurrentCtc] = useState("");
  const [expectedCtc, setExpectedCtc] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");
  const [availability, setAvailability] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeStatus, setResumeStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [resumeError, setResumeError] = useState<string | null>(null);

  const stepLabels = ["About you", "Experience", "Resume & details"];
  const totalSteps = stepLabels.length;

  const canContinue =
    (step === 1 && !!fullName.trim() && !!email.trim() && !!phone.trim() && !!roleId) ||
    (step === 2 && !!experience.trim() && !!expectedCtc.trim()) ||
    step === 3;

  const canSubmit = resumeStatus === "done" && !!noticePeriod && !submitting;

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  async function handleResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_RESUME_TYPES.includes(file.type)) {
      setResumeError("Please upload a PDF, DOC or DOCX file.");
      setResumeStatus("error");
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      setResumeError("Resume must be 10MB or smaller.");
      setResumeStatus("error");
      return;
    }

    setResumeError(null);
    setResumeFile(file);
    setResumeStatus("uploading");

    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/careers/upload",
      });
      setResumeUrl(blob.url);
      setResumeStatus("done");
    } catch {
      setResumeStatus("error");
      setResumeError("Upload failed. Please try again.");
    }
  }

  function clearResume() {
    setResumeFile(null);
    setResumeUrl("");
    setResumeStatus("idle");
    setResumeError(null);
  }

  async function submitApplication() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/careers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: roleId,
          fullName,
          email,
          phone,
          linkedin,
          portfolio,
          github,
          resumeUrl,
          resumeName: resumeFile?.name ?? "",
          coverLetter,
          experience,
          currentCompany,
          currentCtc,
          expectedCtc,
          noticePeriod,
          availability,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Request failed");
      }
      setSent(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please email info@ethixweb.com directly.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const status = sent ? "SENT ✓" : canContinue ? "READY TO CONTINUE" : "WAITING FOR YOU";

  return (
    <SiteLayout>
      <PageHero eyebrow="Apply" title={preselected ? preselected.title : "Apply to Ethixweb"}>
        A few quick steps. We typically respond within a few business days.
      </PageHero>

      <Breadcrumbs
        items={[
          { label: "Careers", to: "/careers" },
          ...(preselected ? [{ label: preselected.title, to: `/careers/${preselected.slug}` }] : []),
          { label: "Apply" },
        ]}
      />

      <section className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="relative grid lg:grid-cols-[1fr_1.55fr] gap-0 overflow-hidden rounded-3xl shadow-elegant text-white">
              {/* Left panel */}
              <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-hero px-8 py-10 text-foreground">
                <AnimatePresence>
                  {!sent && (
                    <motion.img
                      src="/Ethan%20view%202.webp"
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none absolute bottom-0 -right-25 z-10 h-150 max-h-[55vh] w-auto object-contain object-bottom lg:-bottom-12 lg:h-198 lg:max-h-[85vh]"
                      loading="lazy"
                      decoding="async"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, x: 25, y: step >= 2 ? 30 : 20 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  )}
                </AnimatePresence>
                <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-primary/30 blur-[90px]" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-primary/10 blur-[70px]" />

                <div className="relative z-20">
                  <h2 className="text-3xl font-extrabold leading-tight lg:text-4xl">
                    Let&apos;s get to<br />
                    <span className="text-primary">know you.</span>
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    Tell us about yourself. We&apos;ll take it from there.
                  </p>

                  <div className="mt-10">
                    {stepLabels.map((label, i) => {
                      const done = i + 1 < step;
                      const active = i + 1 === step;
                      const pending = i + 1 > step;
                      return (
                        <div key={label} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <motion.div
                              animate={{
                                backgroundColor: done || active ? "var(--color-primary)" : "transparent",
                                borderColor: done || active ? "var(--color-primary)" : stepDotBorder,
                              }}
                              transition={{ duration: 0.3 }}
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold"
                            >
                              {done ? (
                                <Check className="h-3.5 w-3.5 text-primary-foreground" />
                              ) : (
                                <span className={active ? "text-primary-foreground" : "text-muted-foreground/70"}>
                                  {i + 1}
                                </span>
                              )}
                            </motion.div>
                            {i < stepLabels.length - 1 && (
                              <motion.div
                                animate={{ backgroundColor: done ? "rgba(192,39,45,0.45)" : stepLineBg }}
                                transition={{ duration: 0.4 }}
                                className="my-1 w-px"
                                style={{ height: 28 }}
                              />
                            )}
                          </div>
                          <p
                            className={`mb-0 pb-6 pt-0.5 text-sm font-medium transition-all duration-300 leading-none ${
                              active
                                ? "text-foreground"
                                : done
                                  ? "text-muted-foreground"
                                  : pending
                                    ? "text-muted-foreground/60"
                                    : ""
                            }`}
                          >
                            {label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="relative mt-8 space-y-5">
                  <motion.p
                    key={status}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`relative z-20 text-xs font-bold uppercase tracking-[0.22em] ${
                      status === "WAITING FOR YOU"
                        ? "text-muted-foreground/70"
                        : status === "SENT ✓"
                          ? "text-primary"
                          : "text-primary/80"
                    }`}
                  >
                    {status}
                  </motion.p>
                  <div className="relative z-0 border-t border-border" />
                  <div className="relative z-20 space-y-3 pt-2">
                    {[
                      { i: Mail, v: "info@ethixweb.com" },
                      { i: MapPin, v: "Remote (India)" },
                    ].map(({ i: I, v }) => (
                      <div key={v} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                        <I className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        {v}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right panel */}
              <div className="relative flex flex-col bg-gradient-hero px-8 py-10 overflow-hidden text-foreground">
                {!sent ? (
                  <>
                    <AnimatePresence mode="wait" custom={dir}>
                      <motion.div
                        key={`h-${step}`}
                        custom={dir}
                        variants={slide}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.24, ease: "easeOut" }}
                        className="mb-6"
                      >
                        <h3 className="text-xl font-bold">
                          {step === 1 && "Tell us about yourself"}
                          {step === 2 && "Your experience & expectations"}
                          {step === 3 && "Resume & final details"}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Step {step} of {totalSteps}
                        </p>
                      </motion.div>
                    </AnimatePresence>

                    <div className="flex-1">
                      <AnimatePresence mode="wait" custom={dir}>
                        {step === 1 && (
                          <motion.div
                            key="s1"
                            custom={dir}
                            variants={slide}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.24, ease: "easeOut" }}
                            className="space-y-4"
                          >
                            <SelectField
                              label="Applying for"
                              value={roleId}
                              onChange={setRoleId}
                              options={[
                                { value: "", label: "Select a role…" },
                                ...JOBS.map((j) => ({ value: j.id, label: j.title })),
                                { value: "general", label: "General Application" },
                              ]}
                            />
                            <div className="grid sm:grid-cols-2 gap-4">
                              <TextField label="Full name" value={fullName} onChange={setFullName} />
                              <TextField label="Email" type="email" value={email} onChange={setEmail} />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                              <TextField label="Phone" type="tel" value={phone} onChange={setPhone} />
                              <TextField
                                label="LinkedIn (optional)"
                                value={linkedin}
                                onChange={setLinkedin}
                                required={false}
                                placeholder="https://linkedin.com/in/…"
                              />
                            </div>
                          </motion.div>
                        )}

                        {step === 2 && (
                          <motion.div
                            key="s2"
                            custom={dir}
                            variants={slide}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.24, ease: "easeOut" }}
                            className="space-y-4"
                          >
                            <div className="grid sm:grid-cols-2 gap-4">
                              <TextField
                                label="Years of experience"
                                value={experience}
                                onChange={setExperience}
                                placeholder="e.g. 2 years"
                              />
                              <TextField
                                label="Current company (optional)"
                                value={currentCompany}
                                onChange={setCurrentCompany}
                                required={false}
                              />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                              <TextField
                                label="Current CTC (optional)"
                                value={currentCtc}
                                onChange={setCurrentCtc}
                                required={false}
                                placeholder="e.g. ₹4,50,000 / year"
                              />
                              <TextField
                                label="Expected CTC"
                                value={expectedCtc}
                                onChange={setExpectedCtc}
                                placeholder="e.g. ₹5,50,000 / year"
                              />
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                              <TextField
                                label="Portfolio (optional)"
                                value={portfolio}
                                onChange={setPortfolio}
                                required={false}
                                placeholder="https://…"
                              />
                              <TextField
                                label="GitHub (optional)"
                                value={github}
                                onChange={setGithub}
                                required={false}
                                placeholder="https://github.com/…"
                              />
                            </div>
                          </motion.div>
                        )}

                        {step === 3 && (
                          <motion.div
                            key="s3"
                            custom={dir}
                            variants={slide}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.24, ease: "easeOut" }}
                            className="space-y-4"
                          >
                            <div>
                              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                                Resume <span className="text-primary">*</span>
                              </label>
                              <div className="mt-2">
                                {!resumeFile || resumeStatus === "error" ? (
                                  <label
                                    htmlFor="resume-upload"
                                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-black/85 px-4 py-8 text-center transition hover:border-primary/40"
                                  >
                                    <UploadCloud className="h-7 w-7 text-primary/70" />
                                    <span className="text-sm text-white/80">
                                      Click to upload your resume
                                    </span>
                                    <span className="text-xs text-white/40">PDF, DOC or DOCX · Max 10MB</span>
                                    <input
                                      id="resume-upload"
                                      type="file"
                                      accept=".pdf,.doc,.docx"
                                      onChange={handleResumeChange}
                                      className="sr-only"
                                      aria-label="Upload resume"
                                    />
                                  </label>
                                ) : (
                                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/85 px-4 py-3.5">
                                    {resumeStatus === "uploading" ? (
                                      <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
                                    ) : (
                                      <FileText className="h-5 w-5 shrink-0 text-primary" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-sm font-medium text-white">{resumeFile.name}</p>
                                      <p className="text-xs text-white/40">
                                        {formatBytes(resumeFile.size)} ·{" "}
                                        {resumeStatus === "uploading" ? "Uploading…" : "Uploaded"}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={clearResume}
                                      aria-label="Remove resume"
                                      className="shrink-0 rounded-full p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                )}
                                {resumeError && <p className="mt-2 text-sm text-red-400">{resumeError}</p>}
                              </div>
                            </div>

                            <SelectField
                              label="Notice period"
                              value={noticePeriod}
                              onChange={setNoticePeriod}
                              options={[
                                { value: "", label: "Select notice period…" },
                                ...NOTICE_PERIODS.map((n) => ({ value: n.id, label: n.label })),
                              ]}
                            />

                            <TextField
                              label="Availability (optional)"
                              value={availability}
                              onChange={setAvailability}
                              required={false}
                              placeholder="e.g. Available from June 1st"
                            />

                            <div>
                              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                                Cover letter (optional)
                              </label>
                              <textarea
                                rows={4}
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                placeholder="Tell us why you're a good fit…"
                                className="mt-2 w-full resize-none rounded-xl bg-black/85 border border-white/10 px-4 py-3 text-base sm:text-sm text-white placeholder:text-white/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 transition"
                              />
                            </div>

                            {submitError && <p className="text-sm text-red-400">{submitError}</p>}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-6">
                      {step > 1 ? (
                        <button
                          onClick={() => go(step - 1)}
                          className="-ml-2 px-2 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          ← Back
                        </button>
                      ) : (
                        <div />
                      )}

                      {step === 3 ? (
                        <motion.button
                          whileHover={canSubmit ? { scale: 1.02 } : {}}
                          whileTap={canSubmit ? { scale: 0.97 } : {}}
                          onClick={canSubmit ? submitApplication : undefined}
                          className={`group inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold transition disabled:cursor-not-allowed ${
                            canSubmit
                              ? "bg-gradient-brand text-white shadow-glow cursor-pointer"
                              : "border border-border bg-foreground/5 text-muted-foreground/60"
                          }`}
                        >
                          {submitting ? "Submitting…" : "Submit application"}
                          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={canContinue ? { scale: 1.02 } : {}}
                          whileTap={canContinue ? { scale: 0.97 } : {}}
                          onClick={canContinue ? () => go(step + 1) : undefined}
                          className={`inline-flex items-center gap-2 rounded-full border px-7 py-3 text-sm font-bold transition-all duration-300 ${
                            canContinue
                              ? "border-primary bg-primary text-primary-foreground shadow-glow hover:bg-primary/90 cursor-pointer"
                              : "border-border bg-foreground/5 text-muted-foreground/60 cursor-not-allowed"
                          }`}
                        >
                          Continue
                          <ArrowUpRight
                            className={`h-4 w-4 transition-all ${canContinue ? "text-primary-foreground" : "text-muted-foreground/40"}`}
                          />
                        </motion.button>
                      )}
                    </div>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="relative flex min-h-100 flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center sm:px-10"
                  >
                    <div className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/15 blur-[90px] sm:h-64 sm:w-64 lg:h-72 lg:w-72" />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.25, type: "spring", stiffness: 260, damping: 20 }}
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15"
                    >
                      <Check className="h-6 w-6 text-primary" />
                    </motion.div>
                    <h3
                      className={`text-2xl font-bold text-foreground ${isDark ? "drop-shadow-[0_0_18px_rgba(255,255,255,0.5)]" : "drop-shadow-[0_0_14px_rgba(192,39,45,0.25)]"}`}
                    >
                      Application received!
                    </h3>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
                      className="max-w-sm text-lg leading-relaxed text-foreground/90"
                    >
                      We've received your application and resume. Our team will reach out within a few
                      business days if there's a fit.
                    </motion.p>
                    <Link
                      to="/careers"
                      className="relative z-10 mt-2 text-sm font-semibold text-primary hover:underline"
                    >
                      ← Back to all roles
                    </Link>
                    <motion.img
                      src="/Ethan%20view%203.webp"
                      alt=""
                      aria-hidden="true"
                      className="pointer-events-none relative z-10 mt-1 h-72 w-auto object-contain sm:h-80 lg:-mt-3 lg:h-88"
                      loading="lazy"
                      decoding="async"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.65, delay: 0.5, ease: "easeOut" }}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = true,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl bg-black/85 border border-white/10 px-4 py-3 text-base sm:text-sm text-white placeholder:text-white/25 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">
        {label} <span className="text-primary">*</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl bg-black/85 border border-white/10 px-4 py-3 text-base sm:text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-black text-white">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
