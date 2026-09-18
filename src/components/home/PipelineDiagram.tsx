import type { ComponentType } from "react";
import { usePauseOffscreen } from "@/hooks/usePauseOffscreen";

export type PipelineStage = {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  desc: string;
};

/** A row of stage cards, all shown in their full/solid state by default - no
 * hover or tap required to read any of them. */
export function PipelineDiagram({ stages }: { stages: PipelineStage[] }) {
  // The connectors' flowing dashes animate background-position (a repaint per frame).
  const ref = usePauseOffscreen<HTMLDivElement>();
  return (
    <div ref={ref} className="flex flex-col lg:flex-row lg:items-stretch">
      {stages.map((stage, i) => (
        <div key={stage.title} className="flex flex-1 flex-col lg:flex-row lg:items-stretch">
          <div className="premium-card web-card relative flex w-full flex-1 flex-col gap-4 rounded-2xl border p-6 text-left">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <stage.icon className="h-5 w-5" strokeWidth={2} />
            </span>
            <h3 className="text-lg font-bold text-foreground">{stage.title}</h3>
            <p className="text-sm leading-6 text-muted-foreground">{stage.desc}</p>
          </div>
          {i < stages.length - 1 && <div className="pipeline-connector" aria-hidden="true" />}
        </div>
      ))}
    </div>
  );
}
