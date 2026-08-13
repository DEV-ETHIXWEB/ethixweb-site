import { useState } from "react";
import { Check, Database } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { CampaignSection } from "@/components/campaign/CampaignSection";
import type { CampaignConfig } from "@/lib/campaigns/types";

/**
 * Client-side simulated conversation - no live LLM call, no API key exposed.
 * Preset questions swap in canned answers from the campaign config.
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
  const [history, setHistory] = useState<Turn[]>([aiSection.demo.opening]);
  const [askedIds, setAskedIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState(0);

  const askPreset = (turn: Turn) => {
    setAskedIds((prev) => new Set(prev).add(turn.question));
    setHistory((h) => [...h, turn]);
  };

  const remainingPresets = aiSection.demo.presets.filter((p) => !askedIds.has(p.question));
  const categories = aiSection.knowledgeCategories;
  const activeItems = categories[activeCategory]?.items ?? [];

  return (
    <div className="premium-card relative mx-auto max-w-md overflow-hidden rounded-[2rem] p-6 sm:p-7">
      <div className="relative flex items-center justify-between gap-2 border-b border-white/10 pb-4">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary-text">
          Business knowledge
        </p>
        <Database className="h-4 w-4 shrink-0 text-primary" />
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
          Sample questions and answers
        </p>
        <div className="space-y-4 max-h-72 overflow-y-auto themed-scroll pr-1" aria-live="polite">
          {history.map((turn, i) => (
            <div key={`${turn.question}-${i}`}>
              <p className="text-xs font-semibold text-foreground">{turn.question}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{turn.answer}</p>
            </div>
          ))}
        </div>

        {remainingPresets.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
            {remainingPresets.map((turn) => (
              <button
                key={turn.question}
                type="button"
                onClick={() => askPreset(turn)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
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
