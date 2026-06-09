import { motion, useInView, type Variants } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";

const v: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [fallback, setFallback] = useState(false);

  // Safety net: force visible after 1.4s if IntersectionObserver never fires
  // (older iOS Safari has known bugs with rootMargin)
  useEffect(() => {
    const t = setTimeout(() => setFallback(true), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView || fallback ? "show" : "hidden"}
      variants={v}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
