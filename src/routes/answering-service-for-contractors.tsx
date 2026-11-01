import { createFileRoute } from "@tanstack/react-router";
import { SolutionPage, solutionHead } from "@/components/solutions/SolutionPage";
import answering from "@/data/solutions/answering-service-for-contractors";

export const Route = createFileRoute("/answering-service-for-contractors")({
  head: () => solutionHead(answering),
  component: () => <SolutionPage s={answering} />,
});
