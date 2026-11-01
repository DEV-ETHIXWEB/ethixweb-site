import { createFileRoute } from "@tanstack/react-router";
import { SolutionPage, solutionHead } from "@/components/solutions/SolutionPage";
import hvacWebsite from "@/data/solutions/hvac-website-design";

export const Route = createFileRoute("/hvac-website-design")({
  head: () => solutionHead(hvacWebsite),
  component: () => <SolutionPage s={hvacWebsite} />,
});
