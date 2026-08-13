import { useId, useState } from "react";
import { ArrowDown } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";
import { CampaignSection } from "@/components/campaign/CampaignSection";
import type { CampaignConfig, CampaignFaq as CampaignFaqEntry } from "@/lib/campaigns/types";

export function CampaignFaqSection({ config }: { config: CampaignConfig }) {
  return (
    <CampaignSection band narrow>
      <Reveal>
        <div className="text-center">
          <p className="text-sm uppercase tracking-widest text-primary-text">FAQ</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-gradient pb-1 sm:text-5xl">
            Questions {config.industry.toLowerCase()} business owners ask.
          </h2>
        </div>
      </Reveal>
      <div className="mt-12 space-y-3">
        {config.faqs.map((f, i) => (
          <Reveal key={f.q} delay={Math.min(i * 0.03, 0.3)}>
            <FaqItem faq={f} />
          </Reveal>
        ))}
      </div>
    </CampaignSection>
  );
}

function FaqItem({ faq }: { faq: CampaignFaqEntry }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-inset"
        >
          <span className="font-semibold">{faq.q}</span>
          <ArrowDown
            aria-hidden="true"
            className={`h-4 w-4 shrink-0 text-primary transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </h3>
      <div id={panelId} role="region" hidden={!open}>
        <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
      </div>
    </div>
  );
}
