import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

// Pathless layout for everything under /careers (index, $slug, apply,
// assessment, screening). Ethixweb is not currently hiring - this
// beforeLoad sends the browsable /careers/* URLs (including old job and
// application links that may still be indexed or shared externally) to
// /not-hiring instead of the old listings/application flow. The child
// route files are left in place, untouched, so hiring can resume by
// emptying INVITE_ONLY_PATHS and removing this beforeLoad.
//
// The two invite-only flows are exempt. They are reached only from a link
// we emailed to a specific candidate, carry their own token, and are
// noindex - nobody lands on them by browsing. Redirecting them too meant a
// candidate who was midway through an assessment when hiring paused
// followed their link and got "We're Not Hiring Right Now", with their
// part-finished attempt still sitting in the database and no way back to
// it. Their own gates still decide whether the token is valid.
const INVITE_ONLY_PATHS = new Set(["/careers/screening", "/careers/assessment"]);

export const Route = createFileRoute("/careers")({
  beforeLoad: ({ location }) => {
    if (INVITE_ONLY_PATHS.has(location.pathname.replace(/\/+$/, ""))) return;
    throw redirect({ to: "/not-hiring" });
  },
  component: Outlet,
});
