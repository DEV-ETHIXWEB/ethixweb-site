import { jsonLdStringify } from "@/lib/json-ld";
import type { CampaignConfig } from "./types";

const SITE_URL = "https://ethixweb.com";

/** Builds the full TanStack Start `head()` return value from a campaign
 * config, so every campaign route gets consistent, correct meta/OG/Twitter/
 * canonical/JSON-LD tags without re-writing them per page. */
export function buildCampaignHead(config: CampaignConfig) {
  const canonical = `${SITE_URL}${config.seo.path}`;

  return {
    meta: [
      { title: config.seo.title },
      { name: "description", content: config.seo.description },
      { property: "og:title", content: config.seo.ogTitle },
      { property: "og:description", content: config.seo.ogDescription },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `${SITE_URL}/ethixweb.png` },
      { property: "og:url", content: canonical },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: config.seo.title },
      { name: "twitter:description", content: config.seo.ogDescription },
      { name: "twitter:image", content: `${SITE_URL}/ethixweb.png` },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLdStringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: config.schema.serviceName,
          provider: { "@type": "Organization", name: "Ethixweb", url: SITE_URL },
          description: config.schema.serviceDescription,
          url: canonical,
          areaServed: config.schema.areaServed.map((a) => ({ "@type": a.type, name: a.name })),
          serviceType: config.schema.serviceType,
        }),
      },
      {
        type: "application/ld+json",
        children: jsonLdStringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: config.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  };
}
