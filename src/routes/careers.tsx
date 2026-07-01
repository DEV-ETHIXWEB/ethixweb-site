import { createFileRoute, Outlet } from "@tanstack/react-router";

// Pathless layout for everything under /careers (index, $slug, apply). It
// renders nothing of its own - each child route brings its own full page
// (including its own SiteLayout) - but the file must exist so the route
// generator has a concrete parent to attach /careers/apply and /careers/
// to instead of inferring a dangling one.
export const Route = createFileRoute("/careers")({
  component: Outlet,
});
