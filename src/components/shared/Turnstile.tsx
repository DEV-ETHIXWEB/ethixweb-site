import { useEffect, useId, useImperativeHandle, useRef, type RefObject } from "react";

// Cloudflare Turnstile - invisible/low-friction bot check used to gate the
// public lead-capture forms (contact, careers apply). Loads the official
// script once per page and renders into a div by id; no npm package needed,
// this is the same approach Cloudflare's own docs recommend for React.
declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

// render=explicit: we call turnstile.render() ourselves. Without it the
// script also scans for .cf-turnstile containers and tries to render into
// them on its own, logging "skipped implicit render because a widget already
// exists in this container" on every form page.
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Turnstile script failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile script failed"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/** How long to wait for Cloudflare's script before telling the visitor the
 * check could not load. Generous enough for a slow connection, short enough
 * that nobody sits in front of a form that will never submit. */
const SCRIPT_TIMEOUT_MS = 12_000;

export interface TurnstileHandle {
  /** Discards the consumed token and asks the widget for a fresh one.
   * Turnstile tokens are single-use, so a form MUST call this after a failed
   * submit - otherwise a retry replays a token Cloudflare has already spent
   * and the server rejects it every time. */
  reset: () => void;
}

export function Turnstile({
  onVerify,
  onExpire,
  onUnavailable,
  theme = "auto",
  handleRef,
}: {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  /** Called when the widget cannot be reached at all (blocked script,
   * offline, Cloudflare outage) so the form can explain itself instead of
   * leaving a permanently disabled button with no reason given. */
  onUnavailable?: (reason: string) => void;
  theme?: "light" | "dark" | "auto";
  handleRef?: RefObject<TurnstileHandle | null>;
}) {
  const containerId = `turnstile-${useId().replace(/:/g, "")}`;
  const widgetId = useRef<string | undefined>(undefined);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onUnavailableRef = useRef(onUnavailable);
  onVerifyRef.current = onVerify;
  onExpireRef.current = onExpire;
  onUnavailableRef.current = onUnavailable;

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  // Exposed to the parent form so it can reset the widget between attempts.
  // Stable across renders, and a no-op before the widget has rendered.
  useImperativeHandle(
    handleRef,
    () => ({
      reset: () => {
        if (widgetId.current && window.turnstile) {
          window.turnstile.reset(widgetId.current);
        }
      },
    }),
    [],
  );

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;

    // The script can also simply never resolve (a blocker that swallows the
    // request without firing onerror), so the timeout - not just .catch() -
    // is what guarantees the visitor hears about it.
    const timeout = setTimeout(() => {
      if (!cancelled && !widgetId.current) {
        onUnavailableRef.current?.(
          "The human-verification check could not load. Disable any ad or privacy blocker for this page, or email info@ethixweb.com and we'll take your details directly.",
        );
      }
    }, SCRIPT_TIMEOUT_MS);

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !window.turnstile) return;
        const el = document.getElementById(containerId);
        if (!el) return;
        widgetId.current = window.turnstile.render(el, {
          sitekey: siteKey,
          theme,
          callback: (token) => onVerifyRef.current(token),
          "expired-callback": () => onExpireRef.current?.(),
          "error-callback": () => onExpireRef.current?.(),
        });
      })
      .catch(() => {
        if (cancelled) return;
        onUnavailableRef.current?.(
          "The human-verification check could not load. Disable any ad or privacy blocker for this page, or email info@ethixweb.com and we'll take your details directly.",
        );
      });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = undefined;
      }
    };
  }, [containerId, siteKey, theme]);

  if (!siteKey) return null;

  // Reserves the height the widget takes once rendered (71px measured live:
  // the 65px frame plus its inline gap) from the first paint. The
  // script arrives late, and without this the form grew by the widget's
  // height on load, pushing the submit button down (and, on the campaign
  // pages, re-centring the hero text beside the form).
  return <div id={containerId} className="cf-turnstile min-h-[71px]" />;
}
