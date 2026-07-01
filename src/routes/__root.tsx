import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
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

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
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

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
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
      { property: "og:image", content: "https://ethixweb.com/ethixweb.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Ethixweb - Premium Technology Partner" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ethixweb" },
      { name: "twitter:image", content: "https://ethixweb.com/ethixweb.png" },
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
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const SCHEMA_ORG_ORGANIZATION = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Ethixweb",
  url: "https://ethixweb.com",
  logo: "https://ethixweb.com/ethixweb.png",
  description:
    "Digital operations, AI automation, websites, software, CRM integrations, SEO, ads, and fast support for US focused teams.",
  email: "akash@ethixweb.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kent",
    addressRegion: "WA",
    addressCountry: "US",
  },
});

const SCHEMA_ORG_WEBSITE = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Ethixweb",
  url: "https://ethixweb.com",
  description: "Premium technology partner for US home service businesses.",
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
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
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
