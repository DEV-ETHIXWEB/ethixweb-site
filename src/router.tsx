import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    // Page changes land instantly. styles.css sets `scroll-behavior: smooth`
    // on <html> for in-page anchor links, and without this the router's own
    // scroll to the top inherited it: every navigation opened the new page at
    // the old page's scroll position and then visibly glided up through the
    // whole thing (measured: 1.3s from y=6689 to 0 on a phone), and Back did
    // the same in reverse. An explicit behavior on the router's scrollTo wins
    // over the CSS, so anchors still glide and page changes do not.
    scrollRestorationBehavior: "instant",
    defaultPreloadStaleTime: 0,
  });

  return router;
};
