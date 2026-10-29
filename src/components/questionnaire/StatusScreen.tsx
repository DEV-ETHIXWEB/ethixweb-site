import { motion, useReducedMotion } from "framer-motion";
import { Clock3, Link2Off, Loader2, ShieldAlert, WifiOff } from "lucide-react";
import { EASE_PREMIUM } from "@/lib/motion";
import { PrimaryButton } from "./ui";

// Every non-question screen: loading, the success celebration, and the
// states a link can be in when the form isn't available.

export type StatusKind =
  "loading" | "done" | "submitted" | "expired" | "revoked" | "invalid" | "error";

const COPY: Record<Exclude<StatusKind, "loading" | "done">, { title: string; body: string }> = {
  submitted: {
    title: "Response already submitted",
    body: "This invitation has already been used to submit a response, so the form can't be filled in again. Thank you for taking part. If you think something went wrong, reply to the email your invitation came in.",
  },
  expired: {
    title: "This invitation has expired",
    body: "The link is past its deadline. If you'd still like to take part, reply to the email your invitation came in and we can send a new one.",
  },
  revoked: {
    title: "This invitation is no longer active",
    body: "The link has been withdrawn. If you weren't expecting this, reply to the email your invitation came in.",
  },
  invalid: {
    title: "We couldn't find this invitation",
    body: "The link may be incomplete. Try opening it again from the original message, making sure the whole link was copied.",
  },
  error: {
    title: "Something went wrong",
    body: "We couldn't load the questionnaire. Check your connection and try again.",
  },
};

const ICONS = {
  submitted: ShieldAlert,
  expired: Clock3,
  revoked: Link2Off,
  invalid: Link2Off,
  error: WifiOff,
};

export function StatusScreen({ kind, onRetry }: { kind: StatusKind; onRetry?: () => void }) {
  if (kind === "loading") {
    return (
      <div className="flex flex-col items-center text-center" role="status">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Opening your questionnaire…</p>
      </div>
    );
  }
  if (kind === "done") return <Success />;

  const Icon = ICONS[kind];
  const copy = COPY[kind];
  return (
    <div className="mx-auto flex max-w-md flex-col items-center text-center">
      <span className="flex h-14 w-14 border border-border bg-card items-center justify-center rounded-2xl text-primary-text">
        <Icon className="h-6 w-6" />
      </span>
      <h1 className="mt-6 font-display text-3xl text-foreground font-extrabold tracking-tight sm:text-4xl">
        {copy.title}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">{copy.body}</p>
      {kind === "error" && onRetry && (
        <PrimaryButton className="mt-7" onClick={onRetry}>
          Try again
        </PrimaryButton>
      )}
    </div>
  );
}

function Success() {
  const reduce = useReducedMotion();
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center text-center">
      <motion.div
        aria-hidden
        className="flex h-16 w-16 items-center justify-center rounded-full bg-primary"
        initial={reduce ? { opacity: 0 } : { scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: EASE_PREMIUM }}
      >
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="white"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.15, ease: EASE_PREMIUM }}
          />
        </svg>
      </motion.div>
      <h1 className="mt-7 font-display text-[clamp(2.25rem,4.5vw,3.25rem)] leading-[1.05] font-extrabold tracking-[-0.025em] text-foreground">
        You're all set!
      </h1>
      <p className="mt-4 text-lg leading-8 text-foreground/80">
        Thank you for taking the time to share your answers. Your response has been submitted
        successfully.
      </p>
      <p className="mt-6 text-sm text-muted-foreground">You can close this window now.</p>
    </div>
  );
}
