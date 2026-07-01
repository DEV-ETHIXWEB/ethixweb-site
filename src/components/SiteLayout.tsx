import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ThemeProvider } from "./ThemeProvider";
import { useClickSound } from "@/hooks/useClickSound";

function Inner({ children }: { children: ReactNode }) {
  useClickSound();
  return (
    <div className="site-vignette relative min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="dust-field" />
      <div className="relative z-10">
        <Navbar />
        <main id="main-content" className="pt-24">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <Inner>{children}</Inner>
    </ThemeProvider>
  );
}
