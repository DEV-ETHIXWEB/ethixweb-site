import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Check, Clock, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { Reveal } from "@/components/shared/Reveal";
import { getJob } from "@/lib/careers-data";
import { useProctoringSignals } from "@/hooks/useProctoringSignals";
import { useQuestionTimer } from "@/hooks/useQuestionTimer";

const searchSchema = z.object({
  role: z.string().default("seo-specialist"),
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  resume: z.string().optional(),
});

export const Route = createFileRoute("/careers/screening")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [{ title: "Screening test - Ethixweb" }, { name: "robots", content: "noindex" }],
  }),
  component: ScreeningPage,
});

interface Question {
  id: string;
  type: "scenario" | "critique";
  prompt: string;
  timeLimitSeconds: number;
}

type Stage = "intro" | "loading" | "testing" | "submitting" | "done" | "error";

function ScreeningPage() {
  const search = Route.useSearch();
  const job = getJob(search.role);

  const [stage, setStage] = useState<Stage>("intro");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [name, setName] = useState(search.name ?? "");
  const [email, setEmail] = useState(search.email ?? "");
  const [phone, setPhone] = useState(search.phone ?? "");

  const [testId, setTestId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const proctoring = useProctoringSignals();

  const current = questions[step];
  const canStart = name.trim().length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function startTest() {
    setStage("loading");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/screening/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleId: search.role,
          candidateName: name,
          candidateEmail: email,
          candidatePhone: phone,
          resumeUrl: search.resume ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not start the test");
      setTestId(data.testId);
      setQuestions(data.questions);
      setStage("testing");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStage("error");
    }
  }

  async function submitTest(finalAnswers: Record<string, string>) {
    if (!testId) return;
    setStage("submitting");
    try {
      const { tabSwitchCount, blurCount } = proctoring.getCounts();
      const res = await fetch("/api/screening/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId,
          answers: Object.entries(finalAnswers).map(([questionId, answer]) => ({
            questionId,
            answer,
          })),
          tabSwitchCount,
          blurCount,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not submit the test");
      setStage("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStage("error");
    }
  }

  function goNext(currentAnswer: string) {
    const next = { ...answers, [current.id]: currentAnswer };
    setAnswers(next);
    if (step + 1 < questions.length) {
      setStep(step + 1);
    } else {
      void submitTest(next);
    }
  }

  if (!job) {
    return (
      <SiteLayout>
        <PageHero eyebrow="Screening" title="This role isn't available right now.">
          The link you followed doesn&apos;t match an open position.
        </PageHero>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHero eyebrow={`Screening: ${job.title}`} title="A short test before the interview.">
        A handful of scenario questions specific to this role. It takes about 15-20 minutes, and
        every result gets reviewed by a person before any decision is made.
      </PageHero>

      <section className="py-8 sm:py-16">
        <Container>
          <AnimatePresence mode="wait">
            {stage === "intro" || stage === "error" ? (
              <Reveal key="intro">
                <div className="premium-card rounded-3xl p-6 sm:p-8">
                  {stage === "error" && (
                    <p
                      role="alert"
                      className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-error-text"
                    >
                      {errorMsg}
                    </p>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">
                        Full name *
                      </span>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-black/85 px-4 py-3 text-base text-white transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">
                        Email *
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-black/85 px-4 py-3 text-base text-white transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm"
                      />
                    </label>
                  </div>
                  <label className="mt-4 block">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                      Phone (optional)
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/85 px-4 py-3 text-base text-white transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm"
                    />
                  </label>
                  <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                    <li>Each question has its own time limit and auto-advances when it's up.</li>
                    <li>
                      Open resources if you'd genuinely use them on the job. Be ready to defend your
                      answers live afterward.
                    </li>
                    <li>Nothing here is auto-rejected. A person reviews every result.</li>
                  </ul>
                  <button
                    type="button"
                    disabled={!canStart}
                    onClick={startTest}
                    className="magnetic mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-bold text-primary-foreground shadow-glow disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Start the test
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </Reveal>
            ) : null}

            {stage === "loading" && (
              <Reveal key="loading">
                <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p>Generating your test...</p>
                </div>
              </Reveal>
            )}

            {stage === "testing" && current && (
              <QuestionCard
                key={current.id}
                index={step}
                total={questions.length}
                question={current}
                onSubmit={goNext}
              />
            )}

            {stage === "submitting" && (
              <Reveal key="submitting">
                <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p>Scoring your answers...</p>
                </div>
              </Reveal>
            )}

            {stage === "done" && (
              <Reveal key="done">
                <div className="flex flex-col items-center gap-3 py-20 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Check className="h-7 w-7" />
                  </span>
                  <h2 className="font-display text-2xl font-bold">Test submitted.</h2>
                  <p className="max-w-md text-muted-foreground">
                    Thanks, {name.split(" ")[0] || "there"}. A person on our team will review your
                    answers and follow up by email either way.
                  </p>
                </div>
              </Reveal>
            )}
          </AnimatePresence>
        </Container>
      </section>
    </SiteLayout>
  );
}

function QuestionCard({
  index,
  total,
  question,
  onSubmit,
}: {
  index: number;
  total: number;
  question: Question;
  onSubmit: (answer: string) => void;
}) {
  const [answer, setAnswer] = useState("");
  const secondsLeft = useQuestionTimer(question.timeLimitSeconds, () => onSubmit(answer));
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="premium-card rounded-3xl p-6 sm:p-8"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-widest text-primary-text">
          Question {index + 1} of {total} · {question.type === "critique" ? "Critique" : "Scenario"}
        </span>
        <span
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tabular-nums ${
            secondsLeft <= 30
              ? "border-red-500/40 text-error-text"
              : "border-white/10 text-muted-foreground"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
      </div>
      <p className="mt-5 text-base leading-relaxed text-foreground/90">{question.prompt}</p>
      <textarea
        autoFocus
        rows={8}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer..."
        className="mt-5 w-full resize-none rounded-xl border border-white/10 bg-black/85 px-4 py-3 text-base text-white placeholder:text-white/25 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 sm:text-sm"
      />
      <button
        type="button"
        onClick={() => onSubmit(answer)}
        className="magnetic mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-bold text-primary-foreground shadow-glow"
      >
        {index + 1 === total ? "Submit test" : "Next question"}
        <ArrowUpRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
