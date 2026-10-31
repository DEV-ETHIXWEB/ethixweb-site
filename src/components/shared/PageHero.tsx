import { ReactNode } from "react";
import { Reveal } from "@/components/shared/Reveal";
import { Container } from "@/components/shared/Container";
import { GlowBlob } from "@/components/shared/GlowBlob";
import { PageTag } from "@/components/shared/PageTag";
import type { LucideIcon } from "lucide-react";

export function PageHero({
  eyebrow,
  icon,
  title,
  children,
}: {
  eyebrow: ReactNode;
  /** The mark in the page tag; omitted, the brand's flame and snowflake. */
  icon?: LucideIcon;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative -mt-24 overflow-hidden bg-gradient-hero pb-16 pt-36 sm:pb-20 sm:pt-40">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <GlowBlob size="lg" color="primary" className="top-0 left-1/2 -translate-x-1/2" />
      <Container size="medium" className="relative text-center">
        <Reveal>
          <PageTag items={[eyebrow]} icon={icon} />
          <h1 className="mt-5 font-display text-7xl font-bold leading-[1.15] text-gradient pb-1">
            {title}
          </h1>
          {children && (
            <div className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{children}</div>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
