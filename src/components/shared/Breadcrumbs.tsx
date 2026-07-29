import { Link } from "@tanstack/react-router";
import { jsonLdStringify } from "@/lib/json-ld";
import { ChevronRight, Home } from "lucide-react";
import { SITE_URL } from "@/lib/site";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ label: "Home", to: "/" }, ...items].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: item.to ? `${SITE_URL}${item.to}` : undefined,
    })),
  };

  return (
    // No horizontal padding/max-width of its own: this always renders inside
    // a <Container>, which already owns both. Duplicating them here used to
    // stack an extra 24px of padding on top of the Container's own
    // (responsive) padding, nudging the breadcrumb row out of alignment with
    // the heading/content directly below it.
    <nav aria-label="Breadcrumb" className="relative z-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdStringify(schema) }}
      />
      <ol className="flex flex-wrap items-center gap-1.5 py-4 text-xs text-muted-foreground">
        <li className="flex items-center gap-1.5">
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            aria-label="Home"
          >
            <Home className="h-3.5 w-3.5" />
          </Link>
          <ChevronRight className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
        </li>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {item.to && !isLast ? (
                <Link to={item.to} className="hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? "text-foreground font-medium" : ""}
                >
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
