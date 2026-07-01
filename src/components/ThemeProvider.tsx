import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light";
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeCtx);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Starts at the same "light" default the server renders (see html className in
  // __root.tsx) so the first client render matches the SSR output exactly; the
  // real stored preference is applied in the effect below, once mounted.
  const [theme, setTheme] = useState<Theme>("light");

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

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}
