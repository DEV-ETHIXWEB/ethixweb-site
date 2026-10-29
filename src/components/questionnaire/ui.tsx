import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Small building blocks every questionnaire screen shares, in the main
// site's vocabulary (btn-primary/btn-secondary, mono eyebrow labels, the
// red accent) but deliberately without the homepage's decorative effects:
// this is a form, and clarity comes first.

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function PrimaryButton({
  children,
  loading,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      className={cn(
        "btn-primary group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-[15px] font-bold disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "btn-secondary inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-bold disabled:pointer-events-none disabled:opacity-0",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Small label above a heading: which part of the form you're in. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-sm font-semibold text-primary-text", className)}>{children}</p>;
}

/** Fixed background: the site's near-black with one faint red wash at the
 * top, enough to read as Ethixweb without competing with the questions. */
export function Ambient() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(138,24,28,0.16),transparent_70%)]" />
    </div>
  );
}
