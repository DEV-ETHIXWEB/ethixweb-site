import { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { ConsentBanner } from "@/components/layout/ConsentBanner";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { useClickSound } from "@/hooks/useClickSound";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";

function Inner({ children }: { children: ReactNode }) {
  useClickSound();
  useSmoothScroll();
  return (
    <div className="site-vignette relative min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Skip to content
      </a>
      {/* Don't paint until the whole header has been parsed. The HTML
          streams in, and Chrome sometimes painted the first frame with only
          part of the navbar received: the right-hand controls were missing,
          so the links sat ~86px off and jumped sideways a moment later. The
          header is the first content in <body>, so this waits a few hundred
          bytes at most. React lifts the <link> into <head>, so only pages
          that render this layout (and so the #nav-end marker) carry it;
          browsers without render-blocking support ignore it. */}
      <link rel="expect" href="#nav-end" blocking="render" />
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
      <ChatWidget />
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
