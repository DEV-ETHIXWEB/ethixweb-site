import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { upload } from "@vercel/blob/client";
import {
  AlertTriangle,
  ArrowUpRight,
  Camera,
  Check,
  Clock,
  FileText,
  Loader2,
  Maximize,
  Mic,
  MonitorX,
  ShieldCheck,
  Timer,
  UploadCloud,
  Video,
} from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { ExamRoom } from "@/components/assessment/ExamRoom";
import { useMediaRecording } from "@/hooks/useMediaRecording";
import { JOBS, getJob } from "@/lib/careers-data";
import { formInputClass, formLabelClass } from "@/lib/form-styles";
import {
  EXAM_DURATION_MINUTES,
  TOTAL_QUESTIONS,
  type AnswerMap,
  type CandidateQuestion,
  type SubmitReason,
  type Violation,
} from "@/lib/assessment/types";

const searchSchema = z.object({
  role: z.string().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  resume: z.string().optional(),
  experience: z.string().optional(),
});

export const Route = createFileRoute("/careers/assessment")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [{ title: "Candidate Assessment - Ethixweb" }, { name: "robots", content: "noindex" }],
  }),
  component: AssessmentPage,
});

const STORAGE_KEY = "ethixweb-assessment-session";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EXPERIENCE_OPTIONS = ["0-1 years", "1-3 years", "3-5 years", "5-8 years", "8+ years"];
const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/** The application form collects experience as free text ("3", "2 years") -
 * map whatever arrives via the query string onto our buckets. */
function normalizeExperience(raw: string | undefined): string {
  if (!raw) return "";
  if (EXPERIENCE_OPTIONS.includes(raw)) return raw;
  const years = Number.parseFloat(raw);
  if (!Number.isFinite(years)) return "";
  if (years <= 1) return "0-1 years";
  if (years <= 3) return "1-3 years";
  if (years <= 5) return "3-5 years";
  if (years <= 8) return "5-8 years";
  return "8+ years";
}

type Stage =
  | "details"
  | "briefing"
  | "permissions"
  | "generating"
  | "exam"
  | "finalizing"
  | "done"
  | "resume-gate"
  | "unsupported"
  | "error";

interface ExamData {
  assessmentId: string;
  sessionToken: string;
  roleTitle: string;
  candidateName: string;
  questions: CandidateQuestion[];
  answers: AnswerMap;
  violations: Violation[];
  expiresAt: string;
  serverNow: string;
}

function readStoredSession(): { id: string; token: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id?: unknown; token?: unknown };
    return typeof parsed.id === "string" && typeof parsed.token === "string"
      ? { id: parsed.id, token: parsed.token }
      : null;
  } catch {
    return null;
  }
}

function AssessmentPage() {
  const search = Route.useSearch();

  const [stage, setStage] = useState<Stage>("details");
  // Move focus to the new stage's heading on change so keyboard/screen-reader
  // users get a signal the "page" changed - these stages swap in place with
  // no navigation event to announce it otherwise. Every stage renders its own
  // <h2> (see below), so focus that directly rather than the wrapper div -
  // an unlabeled div gets no reliable announcement, a heading does. Falls
  // back to the wrapper itself if a stage is ever added without one. Skip on
  // first mount so we don't steal focus from wherever the user landed.
  const stageContentRef = useRef<HTMLDivElement>(null);
  const isFirstStageRender = useRef(true);
  useEffect(() => {
    if (isFirstStageRender.current) {
      isFirstStageRender.current = false;
      return;
    }
    const heading = stageContentRef.current?.querySelector<HTMLElement>("h1, h2, h3");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus();
    } else {
      stageContentRef.current?.focus();
    }
  }, [stage]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Candidate details (prefilled from the application flow's query params)
  const [roleId, setRoleId] = useState(search.role && getJob(search.role) ? search.role : "");
  const [name, setName] = useState(search.name ?? "");
  const [email, setEmail] = useState(search.email ?? "");
  const [phone, setPhone] = useState(search.phone ?? "");
  const [experience, setExperience] = useState(() => normalizeExperience(search.experience));
  const [resumeUrl, setResumeUrl] = useState(search.resume ?? "");
  const [resumeName, setResumeName] = useState(search.resume ? "Resume from your application" : "");
  const [resumeStatus, setResumeStatus] = useState<"idle" | "uploading" | "done" | "error">(
    search.resume ? "done" : "idle",
  );
  const [consent, setConsent] = useState(false);

  const [examData, setExamData] = useState<ExamData | null>(null);
  const [uploadNote, setUploadNote] = useState<string | null>(null);

  const recording = useMediaRecording();

  // --- Session restore after refresh/crash ---------------------------------
  useEffect(() => {
    const stored = readStoredSession();
    if (!stored) return;
    void (async () => {
      try {
        const res = await fetch("/api/assessment/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assessmentId: stored.id, sessionToken: stored.token }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          localStorage.removeItem(STORAGE_KEY);
          return;
        }
        if (data.status === "in_progress") {
          const job = getJob(data.roleId);
          setExamData({
            assessmentId: stored.id,
            sessionToken: stored.token,
            roleTitle: job?.title ?? data.roleId,
            candidateName: data.candidateName,
            questions: data.questions,
            answers: data.answers ?? {},
            violations: data.violations ?? [],
            expiresAt: data.expiresAt,
            serverNow: data.serverNow,
          });
          setStage("resume-gate");
        } else {
          // Finished (possibly via lazy expiry) - nothing to resume.
          localStorage.removeItem(STORAGE_KEY);
          if (data.status === "scored" || data.status === "submitted") setStage("done");
        }
      } catch {
        // Network hiccup - leave the stored session for the next visit.
      }
    })();
  }, []);

  // --- Resume upload (same direct-to-Blob path as the application form) ----
  async function handleResumeFile(file: File | undefined) {
    if (!file) return;
    if (!ALLOWED_RESUME_TYPES.includes(file.type)) {
      setErrorMsg("Please upload a PDF, DOC or DOCX resume.");
      setResumeStatus("error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Resume must be under 10MB.");
      setResumeStatus("error");
      return;
    }
    setErrorMsg(null);
    setResumeStatus("uploading");
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/careers/upload",
      });
      setResumeUrl(blob.url);
      setResumeName(file.name);
      setResumeStatus("done");
    } catch {
      setResumeStatus("error");
      setErrorMsg("Resume upload failed. Please try again.");
    }
  }

  const detailsComplete =
    name.trim().length > 1 &&
    EMAIL_RE.test(email) &&
    !!getJob(roleId) &&
    experience.length > 0 &&
    resumeStatus === "done" &&
    resumeUrl.length > 0;

  function continueToBriefing() {
    // Fullscreen + a real screen are non-negotiable for exam integrity.
    if (!document.fullscreenEnabled || window.innerWidth < 768) {
      setStage("unsupported");
      return;
    }
    setStage("briefing");
  }

  // --- Launch: fullscreen -> generate -> exam -------------------------------
  const launch = useCallback(async () => {
    setErrorMsg(null);
    try {
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    } catch {
      setErrorMsg("Fullscreen was blocked. Please allow fullscreen and try again.");
      return;
    }

    if (examData) {
      // Resume path - questions already exist server-side.
      if (!recording.startRecording()) {
        // Stream died between the gate and now (unplugged camera) - re-ask.
        const stream = await recording.requestPermissions();
        if (!stream) {
          await document.exitFullscreen().catch(() => {});
          setStage("permissions");
          return;
        }
        recording.startRecording();
      }
      setStage("exam");
      return;
    }

    setStage("generating");
    try {
      const res = await fetch("/api/assessment/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleId,
          candidateName: name.trim(),
          candidateEmail: email.trim(),
          candidatePhone: phone.trim(),
          resumeUrl,
          experienceYears: experience,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not start the assessment");

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ id: data.assessmentId, token: data.sessionToken }),
      );
      setExamData({
        assessmentId: data.assessmentId,
        sessionToken: data.sessionToken,
        roleTitle: getJob(roleId)?.title ?? roleId,
        candidateName: name.trim(),
        questions: data.questions,
        answers: {},
        violations: [],
        expiresAt: data.expiresAt,
        serverNow: data.serverNow,
      });
      recording.startRecording();
      setStage("exam");
    } catch (err) {
      await document.exitFullscreen().catch(() => {});
      recording.releaseStream();
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStage("error");
    }
  }, [examData, recording, roleId, name, email, phone, resumeUrl, experience]);

  // --- Post-submit: upload the recording, then confirm ----------------------
  const handleSubmitted = useCallback(
    async (_reason: SubmitReason, _violations: Violation[]) => {
      setStage("finalizing");
      const data = examData;
      const blob = await recording.stopRecording();
      recording.releaseStream();
      await document.exitFullscreen().catch(() => {});

      if (blob && data) {
        const ext = recording.getMimeType().includes("mp4") ? "mp4" : "webm";
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            const uploaded = await upload(
              `assessment-recordings/${data.assessmentId}.${ext}`,
              blob,
              {
                access: "public",
                handleUploadUrl: "/api/assessment/recording-upload",
                clientPayload: JSON.stringify({
                  assessmentId: data.assessmentId,
                  sessionToken: data.sessionToken,
                }),
                multipart: blob.size > 20 * 1024 * 1024,
                contentType: blob.type || `video/${ext}`,
              },
            );
            await fetch("/api/assessment/save", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                assessmentId: data.assessmentId,
                sessionToken: data.sessionToken,
                recordingUrl: uploaded.url,
              }),
            });
            setUploadNote(null);
            break;
          } catch (err) {
            console.error(`[assessment] recording upload attempt ${attempt} failed:`, err);
            if (attempt === 2) {
              setUploadNote(
                "Your answers were submitted successfully, but the session recording could not be uploaded.",
              );
            }
          }
        }
      }

      localStorage.removeItem(STORAGE_KEY);
      setStage("done");
    },
    [examData, recording],
  );

  // --- Exam layer (covers the whole site chrome) ----------------------------
  if (stage === "exam" && examData) {
    return (
      <ExamRoom
        assessmentId={examData.assessmentId}
        sessionToken={examData.sessionToken}
        roleTitle={examData.roleTitle}
        candidateName={examData.candidateName}
        questions={examData.questions}
        initialAnswers={examData.answers}
        initialViolations={examData.violations}
        expiresAt={examData.expiresAt}
        serverNow={examData.serverNow}
        stream={recording.getStream()}
        onSubmitted={handleSubmitted}
      />
    );
  }

  if (stage === "generating" || stage === "finalizing") {
    return (
      <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {stage === "generating" ? (
          <>
            <h2 className="font-display text-2xl font-bold">Building your assessment</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Our AI is generating {TOTAL_QUESTIONS} questions tailored to your resume and the role.
              This takes up to a minute - stay in fullscreen, the exam begins the moment it's ready.
            </p>
          </>
        ) : (
          <>
            <h2 className="font-display text-2xl font-bold">Finalizing your submission</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Uploading your session recording. Please keep this window open.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <SiteLayout>
      <PageHero eyebrow="Candidate Assessment" title="The Ethixweb hiring assessment.">
        {TOTAL_QUESTIONS} questions, {EXAM_DURATION_MINUTES} minutes, generated uniquely for you
        from your resume and the role you applied for. Proctored, recorded, and reviewed by our
        hiring team.
      </PageHero>

      <section className="py-8 sm:py-16">
        <Container size="medium">
          <div ref={stageContentRef} tabIndex={-1} className="focus:outline-none">
            {stage === "details" && (
              <Reveal>
                <div className="premium-card rounded-3xl p-6 sm:p-8">
                  <h2 className="font-display text-xl font-bold">Your details</h2>
                  {errorMsg && (
                    <p
                      role="alert"
                      className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-error-text"
                    >
                      {errorMsg}
                    </p>
                  )}
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className={formLabelClass}>Full name *</span>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={formInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className={formLabelClass}>Email *</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={formInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className={formLabelClass}>Phone</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={formInputClass}
                      />
                    </label>
                    <label className="block">
                      <span className={formLabelClass}>Role you're applying for *</span>
                      <select
                        value={roleId}
                        onChange={(e) => setRoleId(e.target.value)}
                        className={formInputClass}
                      >
                        <option value="">Select a role...</option>
                        {JOBS.map((job) => (
                          <option key={job.id} value={job.id}>
                            {job.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className={formLabelClass}>Years of experience *</span>
                      <select
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className={formInputClass}
                      >
                        <option value="">Select...</option>
                        {EXPERIENCE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="block">
                      <span className={formLabelClass}>Resume *</span>
                      {resumeStatus === "done" ? (
                        <p className="mt-2 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
                          <FileText className="h-4 w-4 shrink-0" />
                          <span className="truncate">{resumeName}</span>
                          <Check className="ml-auto h-4 w-4 shrink-0" />
                        </p>
                      ) : (
                        <label
                          htmlFor="assessment-resume"
                          className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-input/40 px-4 py-3 text-sm text-muted-foreground transition hover:border-primary/50"
                        >
                          {resumeStatus === "uploading" ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : (
                            <UploadCloud className="h-4 w-4" />
                          )}
                          {resumeStatus === "uploading"
                            ? "Uploading..."
                            : "Upload PDF, DOC or DOCX"}
                          <input
                            id="assessment-resume"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="sr-only"
                            onChange={(e) => void handleResumeFile(e.target.files?.[0])}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!detailsComplete}
                    onClick={continueToBriefing}
                    className="magnetic mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-bold text-primary-foreground shadow-glow disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Continue
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </Reveal>
            )}

            {stage === "briefing" && (
              <Reveal>
                <div className="premium-card rounded-3xl p-6 sm:p-8">
                  <h2 className="font-display text-xl font-bold">
                    Before you begin - read carefully.
                  </h2>
                  <ul className="mt-5 space-y-3.5 text-sm text-foreground/85">
                    <BriefingItem icon={Timer}>
                      <strong>
                        {TOTAL_QUESTIONS} questions in {EXAM_DURATION_MINUTES} minutes.
                      </strong>{" "}
                      The timer never pauses. When it expires, your answers are submitted
                      automatically.
                    </BriefingItem>
                    <BriefingItem icon={Maximize}>
                      <strong>Fullscreen is mandatory.</strong> The exam runs in fullscreen from
                      start to finish. Exiting fullscreen, switching tabs, minimizing, or clicking
                      outside this window is detected and recorded. You get two warnings and one
                      final warning - after that, your assessment is submitted automatically.
                    </BriefingItem>
                    <BriefingItem icon={Video}>
                      <strong>Your camera and microphone are recorded</strong> for the duration of
                      the assessment. We ask for this to keep the process fair for every candidate;
                      the recording is reviewed only by the Ethixweb hiring team. The exam cannot
                      start without these permissions.
                    </BriefingItem>
                    <BriefingItem icon={ShieldCheck}>
                      <strong>Copy, paste, right-click, and text selection are disabled.</strong>{" "}
                      Every attempt is logged alongside your submission.
                    </BriefingItem>
                    <BriefingItem icon={Clock}>
                      <strong>Answers auto-save after every interaction.</strong> If your browser
                      crashes, reopen this page in the same browser to resume with the clock still
                      running.
                    </BriefingItem>
                    <BriefingItem icon={AlertTriangle}>
                      <strong>Results are not shown at the end.</strong> Your responses are
                      evaluated after submission and our team will contact you about next steps.
                    </BriefingItem>
                  </ul>
                  <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-input/40 px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-[var(--primary-text)]"
                    />
                    <span className="text-sm text-foreground/85">
                      I understand the rules above and consent to my camera and microphone being
                      recorded during this assessment.
                    </span>
                  </label>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setStage("details")}
                      className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-bold text-foreground transition hover:border-primary/50"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!consent}
                      onClick={() => setStage("permissions")}
                      className="magnetic inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-bold text-primary-foreground shadow-glow disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Continue to system check
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Reveal>
            )}

            {(stage === "permissions" || stage === "resume-gate") && (
              <PermissionGate
                isResume={stage === "resume-gate"}
                recording={recording}
                errorMsg={errorMsg}
                onLaunch={launch}
              />
            )}

            {stage === "done" && (
              <Reveal>
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Check className="h-7 w-7" />
                  </span>
                  <h2 className="font-display text-2xl font-bold">Assessment submitted.</h2>
                  <p className="max-w-md text-muted-foreground">
                    Thanks{name ? `, ${name.split(" ")[0]}` : ""}. Your responses have been recorded
                    and our hiring team will review them and contact you about next steps by email.
                  </p>
                  {uploadNote && (
                    <p className="max-w-md rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-500">
                      {uploadNote}
                    </p>
                  )}
                  <Link
                    to="/careers"
                    className="mt-2 text-sm font-semibold text-primary hover:underline"
                  >
                    ← Back to careers
                  </Link>
                </div>
              </Reveal>
            )}

            {stage === "unsupported" && (
              <Reveal>
                <div className="premium-card flex flex-col items-center gap-3 rounded-3xl p-8 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-500">
                    <MonitorX className="h-7 w-7" />
                  </span>
                  <h2 className="font-display text-2xl font-bold">
                    A desktop browser is required.
                  </h2>
                  <p className="max-w-md text-sm text-muted-foreground">
                    This proctored assessment needs fullscreen support and a screen at least 768px
                    wide. Please reopen this page on a laptop or desktop using Chrome, Edge, or
                    Firefox.
                  </p>
                </div>
              </Reveal>
            )}

            {stage === "error" && (
              <Reveal>
                <div className="premium-card flex flex-col items-center gap-3 rounded-3xl p-8 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-error-text">
                    <AlertTriangle className="h-7 w-7" />
                  </span>
                  <h2 className="font-display text-2xl font-bold">Something went wrong.</h2>
                  <p role="alert" className="max-w-md text-sm text-muted-foreground">
                    {errorMsg ?? "An unexpected error occurred."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setStage("details");
                    }}
                    className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 font-bold text-primary-foreground shadow-glow"
                  >
                    Start over
                  </button>
                </div>
              </Reveal>
            )}
          </div>
        </Container>
      </section>
    </SiteLayout>
  );
}

function BriefingItem({ icon: Icon, children }: { icon: typeof Timer; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-text">
        <Icon className="h-4 w-4" />
      </span>
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}

function PermissionGate({
  isResume,
  recording,
  errorMsg,
  onLaunch,
}: {
  isResume: boolean;
  recording: ReturnType<typeof useMediaRecording>;
  errorMsg: string | null;
  onLaunch: () => Promise<void>;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    if (recording.permission === "granted" && videoRef.current) {
      videoRef.current.srcObject = recording.getStream();
    }
  }, [recording, recording.permission]);

  return (
    <Reveal>
      <div className="premium-card rounded-3xl p-6 sm:p-8">
        {isResume && (
          <p className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-500">
            You have an assessment in progress. The timer kept running while you were away - grant
            permissions and re-enter fullscreen to continue where you left off.
          </p>
        )}
        <h2 className="font-display text-xl font-bold">Camera & microphone check</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We record your camera and microphone during the assessment to keep the process fair for
          every candidate. The recording is reviewed only by the Ethixweb hiring team. The exam
          cannot begin without both permissions.
        </p>

        {errorMsg && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-error-text"
          >
            {errorMsg}
          </p>
        )}

        <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="space-y-3">
            <StatusRow icon={Camera} label="Camera" state={recording.permission} />
            <StatusRow icon={Mic} label="Microphone" state={recording.permission} />
            {recording.permission === "denied" && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-error-text">
                Permission was denied, so the assessment cannot start. Click the camera icon in your
                browser's address bar, allow camera and microphone access, then try again.
              </p>
            )}
          </div>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`aspect-[4/3] w-full rounded-2xl border border-border bg-black object-cover sm:w-56 ${
              recording.permission === "granted" ? "" : "opacity-30"
            }`}
          />
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          {recording.permission !== "granted" ? (
            <button
              type="button"
              disabled={recording.permission === "requesting"}
              onClick={() => void recording.requestPermissions()}
              className="magnetic inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-bold text-primary-foreground shadow-glow disabled:cursor-not-allowed disabled:opacity-40"
            >
              {recording.permission === "requesting" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              {recording.permission === "denied" ? "Try again" : "Grant camera & microphone access"}
            </button>
          ) : (
            <button
              type="button"
              disabled={launching}
              onClick={() => {
                setLaunching(true);
                void onLaunch().finally(() => setLaunching(false));
              }}
              className="magnetic inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-bold text-primary-foreground shadow-glow disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Maximize className="h-4 w-4" />
              {isResume ? "Enter fullscreen & resume" : "Enter fullscreen & start the assessment"}
            </button>
          )}
        </div>
      </div>
    </Reveal>
  );
}

function StatusRow({
  icon: Icon,
  label,
  state,
}: {
  icon: typeof Camera;
  label: string;
  state: "idle" | "requesting" | "granted" | "denied";
}) {
  return (
    <p className="flex items-center gap-3 rounded-xl border border-border bg-input/40 px-4 py-3 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="font-semibold">{label}</span>
      <span
        className={`ml-auto text-xs font-bold uppercase tracking-widest ${
          state === "granted"
            ? "text-emerald-500"
            : state === "denied"
              ? "text-error-text"
              : "text-muted-foreground"
        }`}
      >
        {state === "granted" ? "Ready" : state === "denied" ? "Blocked" : "Not granted"}
      </span>
    </p>
  );
}
