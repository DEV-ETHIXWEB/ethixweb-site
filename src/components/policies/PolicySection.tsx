import { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Was defined byte-identically inside policies.privacy.tsx, policies.terms.tsx,
// and policies.refunds.tsx.
export function PolicySection({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("glass rounded-2xl p-8", className)}>
      <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">{children}</div>
    </div>
  );
}
