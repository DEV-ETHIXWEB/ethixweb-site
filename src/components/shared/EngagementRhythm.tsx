import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type Step = { icon: LucideIcon; t: string; d: string };

/** The four-beat engagement strip. When the section has been in view for a
 * continuous 2s, a glowing fill sweeps the rail from step 1 to step 4; each
 * icon pops + ripples as the fill reaches it. Fires exactly once. */
export function EngagementRhythm({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1 along the rail
  const doneRef = useRef(false);
  const n = steps.length;

  // Dwell: 2s continuously in view -> start once. Leaving early clears the
  // timer (cleanup); doneRef guarantees it never re-fires.
  useEffect(() => {
    if (!inView || doneRef.current) return;
    const t = setTimeout(() => {
      doneRef.current = true;
      setStarted(true);
    }, 2000);
    return () => clearTimeout(t);
  }, [inView]);

  // Drive the fill 0 -> 1.
  useEffect(() => {
    if (!started) return;
    if (reduce) {
      setProgress(1);
      return;
    }
    const DURATION = 2200;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / DURATION);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, reduce]);

  // Icon i sits at rail fraction i/(n-1); it lights once the fill passes it.
  const litFor = (i: number) => started && progress >= i / (n - 1) - 0.0001;

  return (
    <div ref={ref} className="relative">
      {/* Base connector rail (desktop) */}
      <div
        aria-hidden="true"
        className="absolute left-[12.5%] right-[12.5%] top-6 hidden h-px bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40 lg:block"
      />
      {/* Bright animated fill + glowing head that ride on top of the rail */}
      <div
        aria-hidden="true"
        className="absolute left-[12.5%] right-[12.5%] top-6 hidden h-px lg:block"
      >
        <div
          className="h-full origin-left rounded-full"
          style={{
            transform: `scaleX(${progress})`,
            background: "linear-gradient(90deg, rgba(229,29,37,0.55), rgba(229,29,37,0.95))",
            boxShadow: "0 0 10px 2px rgba(229,29,37,0.55)",
          }}
        />
        {started && progress < 1 && !reduce && (
          <span
            className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
            style={{ left: `${progress * 100}%`, boxShadow: "0 0 14px 5px rgba(229,29,37,0.9)" }}
          />
        )}
      </div>

      <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <StepNode key={step.t} step={step} i={i} lit={litFor(i)} reduce={!!reduce} />
        ))}
      </ol>
    </div>
  );
}

function StepNode({
  step,
  i,
  lit,
  reduce,
}: {
  step: Step;
  i: number;
  lit: boolean;
  reduce: boolean;
}) {
  const Icon = step.icon;
  const rippling = lit && !reduce;

  return (
    <motion.li
      className="relative"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: i * 0.08 }}
    >
      <div className="flex flex-col items-start lg:items-center lg:text-center">
        <span className="relative z-10 flex h-12 w-12 items-center justify-center">
          {/* Ripple rings - mount once when this step lights up */}
          {rippling && (
            <>
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-primary/60"
                initial={{ scale: 0.9, opacity: 0.7 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 1.1, ease: "easeOut" }}
              />
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-primary/40"
                initial={{ scale: 0.9, opacity: 0.5 }}
                animate={{ scale: 2.7, opacity: 0 }}
                transition={{ duration: 1.4, ease: "easeOut", delay: 0.12 }}
              />
            </>
          )}
          {/* The badge itself: base look until lit, then a stronger, sustained
              glow plus a one-shot pop. */}
          <motion.span
            className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-glow ring-4 ring-background transition-[filter] duration-500"
            style={
              lit
                ? {
                    filter:
                      "drop-shadow(0 0 8px rgba(229,29,37,0.8)) drop-shadow(0 0 18px rgba(229,29,37,0.45))",
                  }
                : undefined
            }
            animate={rippling ? { scale: [1, 1.16, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
            <Icon className="relative h-5 w-5" strokeWidth={2} />
          </motion.span>
        </span>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-primary-text">
          Step {i + 1}
        </p>
        <h3 className="mt-1 font-display text-xl font-semibold">{step.t}</h3>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{step.d}</p>
      </div>
    </motion.li>
  );
}
