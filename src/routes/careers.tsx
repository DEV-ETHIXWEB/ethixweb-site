import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

// Pathless layout for everything under /careers (index, $slug, apply,
// assessment, screening). Ethixweb is not currently hiring - this
// beforeLoad sends every /careers/* URL (including old job/application
// links that may still be indexed or shared externally) to /not-hiring
// instead of the old listings/application flow. The child route files
// are left in place, untouched, so hiring can resume by removing this
// beforeLoad.
export const Route = createFileRoute("/careers")({
  beforeLoad: () => {
    throw redirect({ to: "/not-hiring" });
  },
  component: Outlet,
});
