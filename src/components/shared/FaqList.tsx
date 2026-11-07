import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { jsonLdStringify } from "@/lib/json-ld";

export type Faq = { q: string; a: string };

/** FAQPage JSON-LD for a route's head `scripts`. Only use it on a page that
 * also renders the same questions with <FaqList>, since Google requires the
 * marked-up answers to be visible on the page. */
export function faqSchema(faqs: Faq[]) {
  return {
    type: "application/ld+json",
    children: jsonLdStringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    }),
  };
}

/** Accordion of questions. Answers are always in the HTML (collapsed with the
 * `hidden` attribute), so search engines read them on the first crawl; an
 * accordion that only mounts the answer on click hides it from them.
 *
 * `columns` is a prop rather than something a caller overrides through
 * `className`: both would be `lg:grid-cols-*` utilities, and which one wins
 * is decided by their order in the generated stylesheet, not by the order
 * they are written in. A one-column list also drops `items-start`, which
 * only matters when two cards share a row. */
export function FaqList({
  faqs,
  className = "",
  columns = 2,
}: {
  faqs: Faq[];
  className?: string;
  /** 2 (default) pairs them up; 1 stacks them at the full width given. */
  columns?: 1 | 2;
}) {
  return (
    <div className={`grid gap-3 ${columns === 2 ? "items-start lg:grid-cols-2" : ""} ${className}`}>
      {faqs.map((f) => (
        <FaqItem key={f.q} faq={f} />
      ))}
    </div>
  );
}

function FaqItem({ faq }: { faq: Faq }) {
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
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50 sm:px-6 sm:py-5"
        >
          <span className="text-sm font-semibold sm:text-base">{faq.q}</span>
          <ChevronDown
            aria-hidden="true"
            className={`h-4 w-4 shrink-0 text-primary transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </h3>
      <div id={panelId} role="region" hidden={!open}>
        <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground sm:px-6">{faq.a}</p>
      </div>
    </div>
  );
}
