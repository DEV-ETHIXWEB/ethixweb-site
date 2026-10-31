import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Transition,
  type TargetAndTransition,
} from "framer-motion";

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export interface RotatingTextHandle {
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  reset: () => void;
}

interface RotatingTextProps {
  texts: string[];
  transition?: Transition;
  initial?: TargetAndTransition;
  animate?: TargetAndTransition;
  exit?: TargetAndTransition;
  animatePresenceMode?: "wait" | "sync" | "popLayout";
  animatePresenceInitial?: boolean;
  rotationInterval?: number;
  loop?: boolean;
  auto?: boolean;
  onNext?: (index: number) => void;
  mainClassName?: string;
  elementLevelClassName?: string;
  style?: CSSProperties;
}

// Rotates through `texts` as a single crossfading unit (no per-character
// split). A single motion element is the only structure AnimatePresence's
// mode="wait" can track with zero ambiguity about when the outgoing word has
// actually finished exiting - splitting into many independently-animated
// characters proved unreliable in practice (the incoming word could start
// rendering before the outgoing one had fully cleared, producing a visible
// double-exposure overlap).
export const RotatingText = forwardRef<RotatingTextHandle, RotatingTextProps>((props, ref) => {
  const {
    texts,
    transition = { type: "spring", damping: 25, stiffness: 300 },
    initial = { y: "100%", opacity: 0 },
    animate = { y: 0, opacity: 1 },
    exit = { y: "-120%", opacity: 0 },
    animatePresenceMode = "wait",
    animatePresenceInitial = false,
    rotationInterval = 2000,
    loop = true,
    auto = true,
    onNext,
    mainClassName,
    elementLevelClassName,
    style,
  } = props;

  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const handleIndexChange = useCallback(
    (newIndex: number) => {
      setCurrentTextIndex(newIndex);
      onNext?.(newIndex);
    },
    [onNext],
  );

  const next = useCallback(() => {
    const nextIndex =
      currentTextIndex === texts.length - 1 ? (loop ? 0 : currentTextIndex) : currentTextIndex + 1;
    if (nextIndex !== currentTextIndex) handleIndexChange(nextIndex);
  }, [currentTextIndex, texts.length, loop, handleIndexChange]);

  const previous = useCallback(() => {
    const prevIndex =
      currentTextIndex === 0 ? (loop ? texts.length - 1 : currentTextIndex) : currentTextIndex - 1;
    if (prevIndex !== currentTextIndex) handleIndexChange(prevIndex);
  }, [currentTextIndex, texts.length, loop, handleIndexChange]);

  const jumpTo = useCallback(
    (index: number) => {
      const validIndex = Math.max(0, Math.min(index, texts.length - 1));
      if (validIndex !== currentTextIndex) handleIndexChange(validIndex);
    },
    [texts.length, currentTextIndex, handleIndexChange],
  );

  const reset = useCallback(() => {
    if (currentTextIndex !== 0) handleIndexChange(0);
  }, [currentTextIndex, handleIndexChange]);

  useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }), [
    next,
    previous,
    jumpTo,
    reset,
  ]);

  const reduceMotion = useReducedMotion();

  // Only rotate while on screen. Off screen, every tick still re-rendered and
  // ran a spring animation nobody could see, which kept framer's frame loop
  // busy for about a second out of every three or four.
  const rootRef = useRef<HTMLSpanElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!auto || reduceMotion || !onScreen) return;
    const intervalId = setInterval(next, rotationInterval);
    return () => clearInterval(intervalId);
  }, [next, rotationInterval, auto, reduceMotion, onScreen]);

  // The box is sized by every word at once, so it never changes size.
  //
  // Each word used to size the box on its own, and in "wait" mode there is a
  // beat with no word at all while one leaves before the next arrives. In a
  // headline that wraps (any phone), each rotation re-wrapped the line twice
  // and moved everything below it: the blog hero measured a 0.22 layout shift
  // every 3.2 seconds, more than double Google's "poor" line. Every word now
  // sits invisible in one shared grid cell, the cell takes the widest, and the
  // animated word plays inside that fixed box.
  return (
    <span ref={rootRef} className={cn("text-rotate", mainClassName)} style={style}>
      <span className="inline-grid">
        {texts.map((text) => (
          <span
            key={text}
            aria-hidden="true"
            className={cn(
              "invisible col-start-1 row-start-1 whitespace-nowrap",
              elementLevelClassName,
            )}
          >
            {text}
          </span>
        ))}
        <span className="col-start-1 row-start-1 whitespace-nowrap">
          <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
            <motion.span
              key={currentTextIndex}
              initial={initial}
              animate={animate}
              exit={exit}
              transition={transition}
              // Its own fill. Headings that use it are gradient text, which sets
              // -webkit-text-fill-color: transparent; that inherits, and once
              // the word sits in its own box (the fixed-width grid above) the
              // heading's clipped gradient no longer paints it, so it rendered
              // invisible. currentColor shows the color the caller asked for.
              className={cn(
                "text-rotate-element inline-block [-webkit-text-fill-color:currentColor]",
                elementLevelClassName,
              )}
            >
              {texts[currentTextIndex]}
            </motion.span>
          </AnimatePresence>
        </span>
      </span>
    </span>
  );
});

RotatingText.displayName = "RotatingText";
