import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight, Sun, Moon } from "lucide-react";
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
];

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <motion.button
      onClick={toggle}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 pt-4">
      <div
        className={`mx-auto max-w-7xl rounded-2xl overflow-hidden transition-all duration-500 ${
          scrolled || open ? "glass-strong" : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-3">
          <Logo />
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) =>
              LIVE_PATHS.has(l.to) ? (
                <Link
                  key={l.to}
                  to={l.to}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
                  activeProps={{
                    className: "px-4 py-2 text-sm text-foreground rounded-lg bg-white/5",
                  }}
                  activeOptions={{ exact: l.to === "/" }}
                >
                  {l.label}
                </Link>
              ) : (
                <div
                  key={l.to}
                  title="Coming soon"
                  className="relative flex items-center cursor-not-allowed px-4 py-2 rounded-lg select-none"
                >
                  <span className="text-sm text-muted-foreground/35">{l.label}</span>
                </div>
              )
            )}
          </nav>
          <div className="hidden lg:flex items-center gap-3">
            <TimezoneWidget />
            <ThemeToggle />
            <Link
              to="/contact"
              className="magnetic group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              Start a project
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
            </Link>
          </div>
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 rounded-lg glass"
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
                    <div
                      key={l.to}
                      className="flex items-center px-4 py-3 rounded-lg cursor-not-allowed select-none"
                    >
                      <span className="text-sm text-muted-foreground/35">{l.label}</span>
                    </div>
                  )
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
    </header>
  );
}
