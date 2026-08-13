import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { CampaignSection } from "@/components/campaign/CampaignSection";
import type { CampaignConfig } from "@/lib/campaigns/types";

const LLM_OPTIONS = ["OpenAI", "Anthropic", "Google", "Other"] as const;

/**
 * Client-side simulated conversation - no live LLM call, no API key exposed.
 * Preset questions swap in canned answers from the campaign config with a
 * short "typing" delay so it reads as a real exchange rather than an
 * instant content swap.
 */
export function CampaignAiDemoSection({ config }: { config: CampaignConfig }) {
  const { aiSection } = config;

  return (
    <CampaignSection innerClassName="grid items-start gap-12 lg:grid-cols-2">
      <Reveal>
        <p className="text-sm uppercase tracking-widest text-primary-text">{aiSection.eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl font-bold text-gradient pb-1 sm:text-5xl">
          {aiSection.headline}
        </h2>
        <p className="mt-5 text-muted-foreground leading-relaxed">{aiSection.body}</p>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm font-semibold text-foreground">Answers, captures and qualifies.</p>
          <p className="mt-1 text-sm text-muted-foreground">{aiSection.boundaryNote}</p>
        </div>
        <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
          {aiSection.capabilities.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">{t}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            LLM-flexible architecture
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {LLM_OPTIONS.map((name) => (
              <span
                key={name}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-muted-foreground"
              >
                {name}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Built to switch or combine model providers as your needs change, not locked to one
            vendor.
          </p>
        </div>
      </Reveal>
      <Reveal delay={0.1}>
        <InteractiveDemoCard config={config} />
      </Reveal>
    </CampaignSection>
  );
}

type Turn = { question: string; answer: string };

function InteractiveDemoCard({ config }: { config: CampaignConfig }) {
  const { aiSection } = config;
  const reduce = useReducedMotion();
  const [history, setHistory] = useState<Turn[]>([aiSection.demo.opening]);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [askedIds, setAskedIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState(0);

  const askPreset = (turn: Turn) => {
    if (pendingQuestion) return;
    setAskedIds((prev) => new Set(prev).add(turn.question));
    setPendingQuestion(turn.question);
    const delay = reduce ? 0 : 650;
    window.setTimeout(() => {
      setHistory((h) => [...h, turn]);
      setPendingQuestion(null);
    }, delay);
  };

  const remainingPresets = aiSection.demo.presets.filter((p) => !askedIds.has(p.question));
  const categories = aiSection.knowledgeCategories;
  const activeItems = categories[activeCategory]?.items ?? [];

  return (
    <div className="premium-card relative mx-auto max-w-md overflow-hidden rounded-[2rem] p-6 sm:p-7">
      <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative flex items-center justify-between gap-2 border-b border-white/10 pb-4">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary-text">
          Business knowledge
        </p>
        <Sparkles className="h-4 w-4 shrink-0 text-primary" />
      </div>

      {categories.length > 1 && (
        <div
          className="relative mt-4 flex flex-wrap gap-1.5"
          role="tablist"
          aria-label="Knowledge categories"
        >
          {categories.map((cat, i) => {
            const active = i === activeCategory;
            return (
              <button
                key={cat.label}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveCategory(i)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                  active
                    ? "border-primary/50 bg-primary/15 text-foreground"
                    : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground"
                }`}
              >
                <cat.icon className="h-3 w-3" />
                {cat.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="relative mt-4 grid grid-cols-2 gap-x-4 gap-y-2" role="tabpanel">
        {activeItems.map((item) => (
          <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
            {item}
          </div>
        ))}
      </div>

      <div className="relative mt-6 rounded-2xl border border-white/10 bg-[#0C0D10]/70 p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Try it: click a question below
        </p>
        <div className="space-y-2.5 max-h-72 overflow-y-auto themed-scroll pr-1" aria-live="polite">
          {history.map((turn, i) => (
            <div key={`${turn.question}-${i}`} className="space-y-2.5">
              <div className="ml-auto max-w-[85%] rounded-xl rounded-tr-sm bg-white/[0.08] px-3.5 py-2.5 text-xs text-foreground">
                {turn.question}
              </div>
              <div className="mr-auto max-w-[90%] rounded-xl rounded-tl-sm bg-primary/15 px-3.5 py-2.5 text-xs text-foreground">
                {turn.answer}
              </div>
            </div>
          ))}
          <AnimatePresence>
            {pendingQuestion && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2.5"
              >
                <div className="ml-auto max-w-[85%] rounded-xl rounded-tr-sm bg-white/[0.08] px-3.5 py-2.5 text-xs text-foreground">
                  {pendingQuestion}
                </div>
                <div className="mr-auto flex items-center gap-1.5 rounded-xl rounded-tl-sm bg-primary/15 px-3.5 py-2.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> Typing...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {remainingPresets.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
            {remainingPresets.map((turn) => (
              <button
                key={turn.question}
                type="button"
                onClick={() => askPreset(turn)}
                disabled={!!pendingQuestion}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground disabled:opacity-50"
              >
                {turn.question}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
