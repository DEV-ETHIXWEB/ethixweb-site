import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";

type Theme = "dark" | "light";
type ToggleOrigin = { x: number; y: number };

const ThemeCtx = createContext<{ theme: Theme; toggle: (origin?: ToggleOrigin) => void }>({
  theme: "dark",
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeCtx);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Starts at the same "dark" default the server renders (see html className in
  // __root.tsx) so the first client render matches the SSR output exactly; a
  // stored preference is applied in the effect below, once mounted. The
  // pre-paint script in __root.tsx has already put the right class on <html>
  // by this point, so there is no visible flash - this only brings React's
  // state into line with what is on screen.
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ethix-theme");
      if (stored === "light" || stored === "dark") setTheme(stored);
    } catch {
      // ignore (e.g. localStorage unavailable)
    }
  }, []);

  // Only a real choice is persisted. This effect used to write on every mount,
  // which meant a visitor who never touched the toggle still got "dark" saved
  // for them - and from then on the site could never change its own default
  // for that person, because the stored value always won.
  const hasChosen = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    if (!hasChosen.current) return;
    try {
      localStorage.setItem("ethix-theme", theme);
    } catch {
      // ignore (e.g. localStorage unavailable)
    }
  }, [theme]);

  // Circular-reveal theme switch via the View Transitions API, expanding
  // from the toggle button's screen position. Falls back to an instant swap
  // when the API is unsupported (Firefox, older Safari) or the visitor
  // prefers reduced motion - both branches just flip the class, so there's
  // no functional difference, only presentation.
  const toggle = (origin?: ToggleOrigin) => {
    const next = theme === "dark" ? "light" : "dark";
    hasChosen.current = true;
    const apply = () => setTheme(next);

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (
      typeof document === "undefined" ||
      !document.startViewTransition ||
      reduceMotion ||
      !origin
    ) {
      apply();
      return;
    }

    const root = document.documentElement;
    const radius = Math.hypot(
      Math.max(origin.x, window.innerWidth - origin.x),
      Math.max(origin.y, window.innerHeight - origin.y),
    );
    root.style.setProperty("--theme-toggle-x", `${origin.x}px`);
    root.style.setProperty("--theme-toggle-y", `${origin.y}px`);
    root.style.setProperty("--theme-toggle-radius", `${radius}px`);

    document.startViewTransition(() => flushSync(apply));
  };

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}
