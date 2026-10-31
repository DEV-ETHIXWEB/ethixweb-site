import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import emblem from "@/assets/emblem-transparent-sm.webp";

/** The bubble, and only the bubble.
 *
 * This file is what every page pays for: a launcher button and a bit of
 * state. The panel, the retrieval code and - later, and only if someone asks
 * a question - the several-megabyte model runtime all arrive through lazy
 * imports, so a visitor who never opens the chat downloads none of it. */

const ChatPanel = lazy(() =>
  import("@/components/chat/ChatPanel").then((m) => ({ default: m.ChatPanel })),
);

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  // Rendered once opened, then kept mounted behind `hidden` so closing the
  // bubble does not throw away the conversation or reload the panel chunk.
  const [opened, setOpened] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setOpened(true);
  }, [open]);

  // Escape closes, the way every other dismissible surface on the web does.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {opened && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Ethixweb assistant"
          // The wheel scrolls the transcript, settings and text box inside
          // the panel, never the page behind it (see useSmoothScroll).
          data-lenis-prevent=""
          aria-hidden={!open}
          className={cn(
            // Phone: a sheet with a comfortable margin. Desktop: a panel
            // pinned above the launcher.
            "glass-strong fixed inset-x-3 bottom-3 top-20 z-50 flex flex-col overflow-hidden rounded-3xl",
            "sm:inset-x-auto sm:bottom-24 sm:right-5 sm:top-auto sm:h-[min(34rem,calc(100vh-9rem))] sm:w-[25.5rem]",
            "transition-[opacity,transform] duration-200 ease-out",
            open
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none translate-y-3 opacity-0",
          )}
        >
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            }
          >
            <ChatPanel onClose={() => setOpen(false)} />
          </Suspense>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Ask the Ethixweb assistant"}
        aria-expanded={open}
        className={cn(
          // Below the consent banner's z-45 so a first time visitor answers
          // that before this competes for the same corner.
          "group fixed bottom-5 right-5 z-40 h-16 w-16 rounded-full",
          "transition-transform duration-200 hover:scale-105 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background",
          // On a phone the open sheet covers the screen; its own close button
          // takes over so the launcher is not floating on top of the panel.
          open && "max-sm:hidden",
        )}
      >
        {/* Soft crimson halo and a still gradient ring. Deliberately not
            animated: an always-on spin or pulse in the corner of every page
            repaints every frame for decoration alone, and reads as busy
            rather than premium. The gradient gives the ring its sheen. */}
        <span aria-hidden="true" className="absolute -inset-2 rounded-full bg-primary/25 blur-md" />
        <span
          aria-hidden="true"
          className="absolute -inset-[3px] rounded-full bg-[conic-gradient(from_210deg,#c0272d,#ff8a8f,#8a181c,#e0555a,#c0272d)]"
        />
        {/* Neutral disc so the crimson E reads in both themes, rather than
            crimson on crimson. */}
        <span className="relative flex h-full w-full items-center justify-center rounded-full bg-background shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
          {open ? (
            <X className="h-5 w-5 text-foreground" />
          ) : (
            <img
              src={emblem}
              alt=""
              // Lazy + low priority keeps React from preloading it in the page
              // head, where it competed with the stylesheet for a phone's
              // bandwidth during first paint. It still loads straight after.
              loading="lazy"
              fetchPriority="low"
              width={32}
              height={33}
              className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-110"
            />
          )}
        </span>
      </button>
    </>
  );
}
