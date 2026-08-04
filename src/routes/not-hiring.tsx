import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/shared/PageHero";
import { Reveal } from "@/components/shared/Reveal";
import { Container } from "@/components/shared/Container";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/not-hiring")({
  head: () => ({
    meta: [
      { title: "Careers | Ethixweb - No Current Openings" },
      {
        name: "description",
        content:
          "Ethixweb is not currently hiring. We have no open positions at this time, but check back in the future for new opportunities.",
      },
      { property: "og:title", content: "Careers | Ethixweb - No Current Openings" },
      {
        property: "og:description",
        content:
          "Ethixweb is not currently hiring. Check back in the future for new opportunities.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://ethixweb.com/ethixweb.png" },
      { property: "og:url", content: "https://ethixweb.com/not-hiring" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Careers | Ethixweb - No Current Openings" },
      {
        name: "twitter:description",
        content:
          "Ethixweb is not currently hiring. Check back in the future for new opportunities.",
      },
      { name: "twitter:image", content: "https://ethixweb.com/ethixweb.png" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "https://ethixweb.com/not-hiring" }],
  }),
  component: NotHiring,
});

function NotHiring() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Careers" title="We're Not Hiring Right Now">
        Thank you for your interest in joining Ethixweb. We currently do not have any open
        positions. Please check back in the future for new opportunities.
      </PageHero>
      <section className="pb-24 pt-4">
        <Container size="medium" className="text-center">
          <Reveal>
            <Link
              to="/"
              className="btn-primary group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
            >
              Back to Home
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Reveal>
        </Container>
      </section>
    </SiteLayout>
  );
}
