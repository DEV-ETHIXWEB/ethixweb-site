import { useEffect, useState, type ReactNode } from "react";
import { jsonLdStringify } from "@/lib/json-ld";
import {
  Outlet,
  Link,
  createRootRoute,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { LOGO_IMAGE, OG_IMAGE, SITE_URL } from "@/lib/site";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-extrabold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for does not exist or has moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

// A deploy replaces the hashed asset files, so a tab opened before it can ask
// for a chunk that no longer exists and land here. There is nothing for anyone
// to fix by reading an error page: the fresh index.html lists the new chunks,
// so just go and get it. Guarded by a sessionStorage flag so a genuine load
// failure cannot turn into a reload loop.
const CHUNK_RELOAD_KEY = "ethixweb:chunk-reload";

function isStaleChunkError(error: unknown): boolean {
  const message = error instanceof Error ? `${error.name} ${error.message}` : String(error ?? "");
  return /ChunkLoadError|dynamically imported module|Importing a module script failed|error loading dynamically imported/i.test(
    message,
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    if (!isStaleChunkError(error)) return;
    try {
      if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return;
      sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
    } catch {
      // Private mode or blocked storage: without somewhere to record the
      // attempt there is no loop guard, so leave the error page up.
      return;
    }
    setReloading(true);
    window.location.reload();
  }, [error]);

  // Clear the guard once a page has survived, so the next deploy gets its own
  // single retry rather than being locked out by a flag from weeks ago.
  useEffect(() => {
    if (isStaleChunkError(error)) return;
    try {
      sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    } catch {
      /* nothing to clear */
    }
  }, [error]);

  if (reloading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <p className="text-sm text-muted-foreground">Loading the latest version…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page did not load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try refreshing or return home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "google-site-verification",
        content: "AY34OQVxeZfI32SF5epPG28oaIZ_0zRi0SFW_ELitzw",
      },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0c0d10" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Ethixweb" },
      { name: "format-detection", content: "telephone=no" },
      { title: "Ethixweb - Premium Technology Partner" },
      {
        name: "description",
        content:
          "Ethixweb manages digital operations, AI automation, websites, software, CRM integrations, SEO, ads, and fast support for US focused teams.",
      },
      { property: "og:title", content: "Ethixweb - Premium Technology Partner" },
      {
        property: "og:description",
        content:
          "Digital operations, AI automation, software development, CRM integrations, SEO, ads, and support for modern teams.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Ethixweb" },
      { property: "og:locale", content: "en_US" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Ethixweb - Premium Technology Partner" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ethixweb" },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      {
        rel: "preload",
        href: "/fonts/kumbh-sans-var.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
    ],
    // No analytics or advertising tag here on purpose. Google Ads gtag.js
    // used to load from this head on every page, which set an advertising
    // cookie before the visitor had been asked. It is now injected by
    // ConsentBanner (see lib/consent.ts) only after an explicit accept,
    // which is what the privacy policy says we do.
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const SCHEMA_ORG_ORGANIZATION = jsonLdStringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Ethixweb",
  url: SITE_URL,
  logo: LOGO_IMAGE,
  description:
    "Digital operations, AI automation, websites, software, CRM integrations, SEO, ads, and fast support for US focused teams.",
  email: "info@ethixweb.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kent",
    addressRegion: "WA",
    addressCountry: "US",
  },
});

const SCHEMA_ORG_WEBSITE = jsonLdStringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Ethixweb",
  url: SITE_URL,
  description: "Premium technology partner for US home service businesses.",
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: SCHEMA_ORG_ORGANIZATION }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: SCHEMA_ORG_WEBSITE }}
        />
        {/* Applies the stored theme before first paint. The server has to
            render a fixed class on <html> (there is no request-time signal
            for a preference kept in localStorage), so without this a visitor
            who chose light mode saw a full dark page on every single
            navigation until hydration swapped it. Runs synchronously in
            <head>, ahead of any body content, so the correct theme is what
            actually gets painted. ThemeProvider reads the same key and
            starts from whatever this set, so the first React render agrees
            with the DOM. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('ethix-theme');" +
              "if(t==='light'||t==='dark'){var r=document.documentElement;" +
              "r.classList.remove('dark','light');r.classList.add(t);}}catch(e){}})()",
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
