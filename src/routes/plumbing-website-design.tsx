import { createFileRoute } from "@tanstack/react-router";
import { SolutionPage, solutionHead } from "@/components/solutions/SolutionPage";
import plumbingWebsite from "@/data/solutions/plumbing-website-design";

export const Route = createFileRoute("/plumbing-website-design")({
  head: () => solutionHead(plumbingWebsite),
  component: () => <SolutionPage s={plumbingWebsite} />,
});
