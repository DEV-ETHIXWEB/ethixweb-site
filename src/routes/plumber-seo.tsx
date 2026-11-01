import { createFileRoute } from "@tanstack/react-router";
import { SolutionPage, solutionHead } from "@/components/solutions/SolutionPage";
import plumberSeo from "@/data/solutions/plumber-seo";

export const Route = createFileRoute("/plumber-seo")({
  head: () => solutionHead(plumberSeo),
  component: () => <SolutionPage s={plumberSeo} />,
});
