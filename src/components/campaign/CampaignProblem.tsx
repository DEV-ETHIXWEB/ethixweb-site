import { Reveal } from "@/components/shared/Reveal";
import { GlowBlob } from "@/components/shared/GlowBlob";
import { CampaignSection } from "@/components/campaign/CampaignSection";
import type { CampaignConfig } from "@/lib/campaigns/types";

export function CampaignProblem({ config }: { config: CampaignConfig }) {
  const { problem, painPoints } = config;
  const Icon = problem.icon;

  return (
    <CampaignSection compact>
      <Reveal>
        <div className="glass-strong relative overflow-hidden rounded-[2rem] p-8 sm:p-10 lg:p-14">
          <GlowBlob size="md" color="primary" className="-top-24 -left-24" />
          <div className="relative flex items-start gap-4">
            <Icon className="mt-1 h-8 w-8 shrink-0 text-primary" strokeWidth={1.5} />
            <div>
              <p className="text-sm uppercase tracking-widest text-primary-text">
                {problem.eyebrow}
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold text-gradient pb-1 sm:text-4xl">
                {problem.headline}
              </h2>
            </div>
          </div>
          {problem.body.map((p) => (
            <p key={p} className="relative mt-5 max-w-3xl text-muted-foreground leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </Reveal>

      {painPoints.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {painPoints.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.05}>
              <div className="group glass h-full rounded-2xl p-6">
                <p.icon
                  className="h-6 w-6 text-primary transition-transform duration-300 group-hover:-translate-y-0.5"
                  strokeWidth={1.5}
                />
                <h3 className="mt-4 font-display text-base font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </CampaignSection>
  );
}
