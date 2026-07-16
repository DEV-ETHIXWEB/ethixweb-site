import { motion, useReducedMotion } from "framer-motion";

/**
 * Slightly rotated, full-bleed crimson ticker - the one deliberately loud
 * element on a page. Duplicated content + a -50% translate loop makes the
 * scroll seamless; when the user prefers reduced motion it just sits still.
 * Shared by the Careers and Our Work pages so the band feels like one
 * site-level motif rather than two similar one-offs.
 */
export function MarqueeBand({ items }: { items: string[] }) {
  const reduceMotion = useReducedMotion();

  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center">
      {items.map((item) => (
        <span
          key={`${key}-${item}`}
          className="flex items-center gap-8 pr-8 text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground"
        >
          {item}
          <span aria-hidden="true" className="text-primary-foreground/50">
            ✦
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div aria-hidden="true" className="relative z-10 -my-5 -rotate-[1.2deg]">
      <div className="-mx-[2%] w-[104%] overflow-hidden bg-primary py-3.5 shadow-glow">
        <motion.div
          className="flex w-max"
          animate={reduceMotion ? undefined : { x: ["0%", "-50%"] }}
          transition={{ duration: 28, ease: "linear", repeat: Infinity }}
        >
          {row("a")}
          {row("b")}
        </motion.div>
      </div>
    </div>
  );
}
