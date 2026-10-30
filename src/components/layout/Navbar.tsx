import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight, Sun, Moon, Volume2, VolumeX } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { TimezoneWidget } from "@/components/layout/TimezoneWidget";
import { useTheme } from "@/components/layout/ThemeProvider";
import { isClickSoundMuted, setClickSoundMuted } from "@/hooks/useClickSound";

export const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/industries", label: "Industries" },
  { to: "/services", label: "Services" },
  { to: "/our-work", label: "Our Work" },
  { to: "/blog", label: "Blog" },
];

/** Lets a visitor silence the site-wide click sound, which previously had no
 * off switch at all.
 *
 * Rendered from the first paint in the default (sound on) state, and the
 * stored choice is applied after hydration. It used to render nothing until
 * mounted, since the server cannot read localStorage, and a 44px button
 * appearing late in the right-hand group slid every desktop nav link 28px
 * sideways on every page load. The icon swap for a muted visitor is the same
 * size, so it moves nothing. */
function SoundToggle() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(isClickSoundMuted());
  }, []);

  return (
    <motion.button
      onClick={() => {
        const next = !muted;
        setMuted(next);
        setClickSoundMuted(next);
      }}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      whileTap={{ scale: 0.9 }}
      aria-pressed={muted}
      aria-label={muted ? "Turn click sound on" : "Turn click sound off"}
      title={muted ? "Click sound off" : "Click sound on"}
    >
      {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </motion.button>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <motion.button
      onClick={(e) => toggle({ x: e.clientX, y: e.clientY })}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
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
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        // Send focus back to the control that opened the panel, rather than
        // leaving it on an element that has just been unmounted.
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // The page behind the open panel used to stay scrollable, so a touch drag
  // over the overlay scrolled the content underneath it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Opening the panel on a phone and then widening the viewport (rotation, a
  // desktop resize) left `open` true: the panel itself is lg:hidden so it
  // vanished, but the bar kept its opened-state glass treatment and the
  // button kept reporting aria-expanded="true" for a panel nobody could see.
  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, [open]);

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
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                // The six top-level pages are what people tap next; their code
                // is small, so fetch it as soon as the link is on screen.
                preload="viewport"
                // The active treatment (bolder label + glowing underline) is
                // pure CSS off the `data-status="active"` attribute the router
                // sets here - see `.nav-label` in styles.css.
                className="flex h-9 items-center px-3.5 text-sm text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg aria-[current=page]:text-foreground"
                activeOptions={{ exact: l.to === "/" }}
              >
                <span className="nav-label">{l.label}</span>
              </Link>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-3">
            <TimezoneWidget />
            <SoundToggle />
            <ThemeToggle />
            <Link
              to="/contact"
              className="btn-primary group inline-flex h-9 items-center gap-2 rounded-full px-4.5 text-sm font-semibold"
            >
              Start a project
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
          <div className="lg:hidden flex items-center gap-2">
            <SoundToggle />
            <ThemeToggle />
            <button
              ref={menuButtonRef}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              onClick={() => setOpen((v) => !v)}
              // Was always "Menu", so a screen reader announced the same
              // thing whether the panel was about to open or close.
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-nav-menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-nav-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-border backdrop-blur-2xl"
            >
              <div className="flex flex-col gap-1 p-4">
                <nav aria-label="Mobile" className="flex flex-col gap-1">
                  {links.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      preload="viewport"
                      onClick={() => setOpen(false)}
                      activeOptions={{ exact: l.to === "/" }}
                      className="px-4 py-3 rounded-lg hover:bg-foreground/5 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                      <span className="nav-label">{l.label}</span>
                    </Link>
                  ))}
                </nav>
                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className="btn-primary mt-2 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
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
