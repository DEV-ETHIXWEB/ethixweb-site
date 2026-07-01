import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight, Sun, Moon, Ban } from "lucide-react";
import { Logo } from "./Logo";
import { TimezoneWidget } from "./TimezoneWidget";
import { useTheme } from "./ThemeProvider";

const LIVE_PATHS = new Set(["/", "/contact"]);

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/industries", label: "Industries" },
  { to: "/services", label: "Services" },
  { to: "/portfolio", label: "Our Work" },
  { to: "/blog", label: "Blog" },
  { to: "/careers", label: "Careers" },
];

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <motion.button
      onClick={toggle}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
          transition={{ duration: 0.18 }}
          className="flex"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const comingSoonTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(
    () => () => {
      if (comingSoonTimer.current) clearTimeout(comingSoonTimer.current);
    },
    [],
  );

  const announceComingSoon = (label: string) => {
    if (comingSoonTimer.current) clearTimeout(comingSoonTimer.current);
    setComingSoon(label);
    comingSoonTimer.current = setTimeout(() => setComingSoon(null), 2200);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
      <div
        className={`mx-auto max-w-7xl overflow-hidden rounded-2xl transition-all duration-500 ${
          scrolled || open ? "glass-strong" : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between gap-4 px-5 py-2.5 lg:px-6">
          <Logo />
          <nav className="hidden lg:flex items-center gap-0.5">
            {links.map((l) =>
              LIVE_PATHS.has(l.to) ? (
                <Link
                  key={l.to}
                  to={l.to}
                  className="flex h-9 items-center px-3.5 text-sm text-muted-foreground/80 transition-colors hover:text-foreground"
                  activeProps={{
                    className: "flex h-9 items-center px-3.5 text-sm font-medium text-foreground",
                  }}
                  activeOptions={{ exact: l.to === "/" }}
                >
                  {l.label}
                </Link>
              ) : (
                <button
                  key={l.to}
                  type="button"
                  onClick={() => announceComingSoon(l.label)}
                  className="group relative flex h-9 items-center px-3.5 select-none"
                >
                  <span className="text-sm text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/60">
                    {l.label}
                  </span>
                </button>
              ),
            )}
          </nav>
          <div className="hidden lg:flex items-center gap-3">
            <TimezoneWidget />
            <ThemeToggle />
            <Link
              to="/contact"
              className="magnetic group inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4.5 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              Start a project
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
            </Link>
          </div>
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-white/8 backdrop-blur-2xl"
            >
              <div className="flex flex-col gap-1 p-4">
                {links.map((l) =>
                  LIVE_PATHS.has(l.to) ? (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className="px-4 py-3 rounded-lg hover:bg-white/5 text-foreground"
                    >
                      {l.label}
                    </Link>
                  ) : (
                    <button
                      key={l.to}
                      type="button"
                      onClick={() => announceComingSoon(l.label)}
                      className="flex items-center px-4 py-3 rounded-lg select-none text-left transition-colors hover:bg-white/5"
                    >
                      <span className="text-sm text-muted-foreground/35">{l.label}</span>
                    </button>
                  ),
                )}
                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
                >
                  Start a project <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className="pointer-events-none fixed inset-x-0 top-20 z-60 flex justify-center px-4"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence>
          {comingSoon && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="glass-strong flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-foreground shadow-elegant"
            >
              <Ban className="h-4 w-4 shrink-0 text-primary/70" />
              {comingSoon} is coming soon
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
