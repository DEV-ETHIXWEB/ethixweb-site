import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Headset } from "lucide-react";

const STORE_KEY = "ew-csr-tab";
const W = 148;
const H = 268;
const F = 22; // flare where the tab meets the screen edge

/** Outline that flares out of the screen edge at the top and bottom, like a
 * ticket stub. Open on the right so the stroke stops at the screen. */
function outline(w: number, h: number, f: number, r: number) {
  return `M${w},0 C${w},${f * 0.55} ${w - f * 0.45},${f} ${w - f},${f} L${r},${f} Q0,${f} 0,${f + r} L0,${h - f - r} Q0,${h - f} ${r},${h - f} L${w - f},${h - f} C${w - f * 0.45},${h - f} ${w},${h - f * 0.55} ${w},${h}`;
}

const OUTLINE = outline(W, H, F, 28);
const HANDLE = { w: 40, h: 156, d: outline(40, 156, F, 18) };
const HANDLE_PHONE = { w: 28, h: 132, d: outline(28, 132, 14, 12) };

function readTucked(): boolean | null {
  try {
    const v = localStorage.getItem(STORE_KEY);
    return v === null ? null : v === "tucked";
  } catch {
    return null;
  }
}

function saveTucked(tucked: boolean) {
  try {
    localStorage.setItem(STORE_KEY, tucked ? "tucked" : "open");
  } catch {
    /* private mode: the tab just forgets */
  }
}

/** Small pull tab on the right edge announcing the CSR service. Rendered
 * off screen on the server and slid in after load, so it never shifts the
 * page or causes a hydration mismatch. */
export function CSRNotificationBanner() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [shown, setShown] = useState(false);
  const [tucked, setTucked] = useState(true);
  const [phone, setPhone] = useState(false);
  // Past the hero the open tab would sit over page content, so it folds to
  // the slim handle there unless the visitor opened it themselves.
  const [scrolled, setScrolled] = useState(false);
  const [manual, setManual] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const saved = readTucked();
    // Phones start tucked to the slim handle so it never covers content.
    const isPhone = window.matchMedia("(max-width: 639px)").matches;
    setPhone(isPhone);
    setTucked(saved ?? isPhone);
    const t = window.setTimeout(() => setShown(true), 900);
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.55);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    // Step aside while someone is filling in a form, so the tab never sits
    // beside the field they're typing in.
    const isField = (el: EventTarget | null) =>
      el instanceof HTMLElement && el.matches("input:not([type=checkbox]):not([type=radio]), textarea, select");
    const onFocusIn = (e: FocusEvent) => setTyping(isField(e.target));
    const onFocusOut = () => setTyping(false);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  if (pathname === "/csr-comparison") return null;

  const handle = phone ? HANDLE_PHONE : HANDLE;
  const toggle = (next: boolean) => {
    setManual(true);
    setTucked(next);
    saveTucked(next);
  };
  const folded = tucked || (scrolled && !manual);

  return (
    <aside
      aria-label="New: CSR service"
      className={`csr-tab fixed right-0 top-1/2 z-30 -translate-y-1/2 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        shown && !typing ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-full opacity-0"
      }`}
    >
      {folded ? (
        <button
          type="button"
          onClick={() => toggle(false)}
          aria-label="Open: CSR launched"
          className="group relative block focus-visible:outline-none"
          style={{ width: handle.w, height: handle.h }}
        >
          <svg
            width={handle.w}
            height={handle.h}
            viewBox={`0 0 ${handle.w} ${handle.h}`}
            className="csr-tab-shape absolute inset-0 overflow-visible"
            aria-hidden="true"
          >
            <path d={`${handle.d} Z`} className="fill-card" />
            <path
              d={handle.d}
              fill="none"
              strokeWidth="1.5"
              className="stroke-primary-text/80 transition-colors group-hover:stroke-primary-text group-focus-visible:stroke-primary-text"
            />
          </svg>
          <span className={`relative flex h-full flex-col items-center justify-center ${phone ? "gap-2" : "gap-2.5 pl-0.5"}`}>
            <ChevronLeft className="h-3.5 w-3.5 text-primary-text transition-transform group-hover:-translate-x-0.5" />
            <span className={`font-display ${phone ? "text-[10px]" : "text-[11px]"} font-bold uppercase tracking-[0.22em] text-foreground [writing-mode:vertical-rl] rotate-180`}>
              CSR
            </span>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
          </span>
        </button>
      ) : (
        <div className="group relative" style={{ width: W, height: H }}>
          <svg
            width={W}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            className="csr-tab-shape absolute inset-0 overflow-visible"
            aria-hidden="true"
          >
            <path d={`${OUTLINE} Z`} className="fill-card" />
            <path d={OUTLINE} fill="none" strokeWidth="1.5" className="stroke-primary-text" />
          </svg>

          <button
            type="button"
            onClick={() => toggle(true)}
            aria-label="Tuck away"
            className="absolute left-2.5 top-[30px] z-10 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          <div
            className="relative flex h-full flex-col items-center justify-center text-center"
            style={{ paddingTop: F, paddingBottom: F }}
          >
            <span className="csr-orb-wrap relative flex h-[60px] w-[60px] items-center justify-center">
              <span className="csr-orb-ring absolute inset-0 rounded-full" aria-hidden="true" />
              <span className="csr-orb relative flex h-[50px] w-[50px] items-center justify-center rounded-full">
                <Headset className="csr-orb-icon relative h-[22px] w-[22px] text-white" strokeWidth={1.75} />
              </span>
              <span className="absolute right-[3px] top-[3px] flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50 motion-reduce:animate-none" />
                <span className="csr-orb-dot relative inline-flex h-3 w-3 rounded-full" />
              </span>
            </span>

            <Link to="/csr-comparison" className="mt-3.5 block focus-visible:outline-none">
              <span className="block font-display text-[22px] font-extrabold leading-none tracking-tight text-foreground">
                CSR
              </span>
              <span className="mt-1 block font-display text-[15px] font-semibold leading-tight text-foreground/85">
                launched
              </span>
            </Link>

            <span className="mt-3.5 h-px w-8 bg-gradient-to-r from-transparent via-primary to-transparent" />

            <Link
              to="/csr-comparison"
              className="group/cta mt-4 inline-flex items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-[12px] font-semibold text-primary-foreground shadow-[0_6px_18px_-6px_rgba(192,39,45,0.7)] transition-[background-color,transform] hover:-translate-y-px hover:bg-[#d63238] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              Know more
              <ChevronRight className="h-3 w-3 transition-transform group-hover/cta:translate-x-0.5" />
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}
