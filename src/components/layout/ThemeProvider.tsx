import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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
  // stored preference (only ever set once the user toggles) is applied in the
  // effect below, once mounted.
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ethix-theme") as Theme | null;
      if (stored) setTheme(stored);
    } catch {
      // ignore (e.g. localStorage unavailable)
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
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
