import { useCallback, useEffect, useRef, useState } from "react";
import {
  MINDSET_MAJOR_VIOLATIONS,
  type MindsetViolation,
  type MindsetViolationType,
} from "@/lib/mindset/types";

// Exam-mode proctoring for the mindset assessment - a trimmed fork of
// useGadsExamGuard.ts: same core detectors (fullscreen/tab/blur/devtools,
// copy/paste/cut, context menu, blocked shortcuts, refresh attempt), minus
// the gads-only multi-monitor/print-screen/resize/network signals that
// aren't relevant to a strict 1-warning ladder. Everything here is a
// deterrent + evidence trail, not a hard guarantee (nothing in a browser
// is) - major signals feed the warning ladder that ends in forced
// auto-submit (MINDSET_MAX_MAJOR_VIOLATIONS = 1); minor signals are
// blocked/logged without interrupting the sitting.

const MAJOR_DEDUPE_MS = 1500;
const DEVTOOLS_POLL_MS = 2000;
const DEVTOOLS_DELTA_PX = 200;

export interface MindsetExamGuardState {
  violations: MindsetViolation[];
  majorCount: number;
  lastMajor: { type: MindsetViolationType; count: number } | null;
}

export function useMindsetExamGuard(active: boolean) {
  const [state, setState] = useState<MindsetExamGuardState>({
    violations: [],
    majorCount: 0,
    lastMajor: null,
  });
  const lastMajorAtRef = useRef(0);
  const devtoolsOpenRef = useRef(false);

  const record = useCallback((type: MindsetViolationType, detail?: string) => {
    const isMajor = MINDSET_MAJOR_VIOLATIONS.has(type);
    const now = Date.now();
    if (isMajor) {
      if (now - lastMajorAtRef.current < MAJOR_DEDUPE_MS) return;
      lastMajorAtRef.current = now;
    }
    setState((prev) => {
      const violation: MindsetViolation = { type, at: new Date(now).toISOString(), detail };
      const majorCount = prev.majorCount + (isMajor ? 1 : 0);
      return {
        violations: [...prev.violations, violation].slice(-500),
        majorCount,
        lastMajor: isMajor ? { type, count: majorCount } : prev.lastMajor,
      };
    });
  }, []);

  useEffect(() => {
    if (!active) return;

    const onFullscreenChange = () => {
      if (!document.fullscreenElement) record("fullscreen_exit");
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") record("tab_hidden");
    };
    const onBlur = () => record("window_blur");

    const onContextMenu = (e: Event) => {
      e.preventDefault();
      record("context_menu");
    };
    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      record("copy_attempt");
    };
    const onCut = (e: ClipboardEvent) => {
      e.preventDefault();
      record("cut_attempt");
    };
    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      record("paste_attempt");
    };
    const onDragStart = (e: Event) => e.preventDefault();
    const onSelectStart = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT")) return;
      e.preventDefault();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;

      if (key === "f5" || (mod && key === "r")) {
        e.preventDefault();
        record("refresh_attempt");
        return;
      }

      const blocked =
        e.key === "F12" ||
        (mod && e.shiftKey && ["i", "j", "c", "k"].includes(key)) ||
        (mod && ["u", "s", "p", "a"].includes(key));
      if (blocked) {
        e.preventDefault();
        record(
          "shortcut_blocked",
          `${e.ctrlKey ? "Ctrl+" : e.metaKey ? "Meta+" : ""}${e.shiftKey ? "Shift+" : ""}${e.key}`,
        );
      }
    };

    const devtoolsTimer = window.setInterval(() => {
      const gapW = window.outerWidth - window.innerWidth;
      const gapH = window.outerHeight - window.innerHeight;
      const open = gapW > DEVTOOLS_DELTA_PX || gapH > DEVTOOLS_DELTA_PX + 50;
      if (open && !devtoolsOpenRef.current) {
        devtoolsOpenRef.current = true;
        record("devtools_suspected", `window gap ${gapW}x${gapH}px`);
      } else if (!open) {
        devtoolsOpenRef.current = false;
      }
    }, DEVTOOLS_POLL_MS);

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCut);
    document.addEventListener("paste", onPaste);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("selectstart", onSelectStart);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearInterval(devtoolsTimer);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("selectstart", onSelectStart);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [active, record]);

  return state;
}
