import { createFileRoute } from "@tanstack/react-router";
import { SolutionPage, solutionHead } from "@/components/solutions/SolutionPage";
import hvacSeo from "@/data/solutions/hvac-seo";

export const Route = createFileRoute("/hvac-seo")({
  head: () => solutionHead(hvacSeo),
  component: () => <SolutionPage s={hvacSeo} />,
});
