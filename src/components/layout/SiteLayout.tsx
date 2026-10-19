import { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { ConsentBanner } from "@/components/layout/ConsentBanner";
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
      <ScrollProgress />
      <div className="dust-field" />
      <div className="relative z-10">
        <Navbar />
        <main id="main-content" className="pt-24">
          {children}
        </main>
        <Footer />
      </div>
      <ConsentBanner />
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
