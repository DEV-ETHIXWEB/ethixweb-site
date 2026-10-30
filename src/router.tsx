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
    // Fetch a page's code on intent (hover, or touchstart on a phone) rather
    // than on the click itself. Without it every page change on a phone
    // waited on 3-4 chunk requests after the tap (~0.3s at mobile latency).
    // The nav links go further and preload when they are on screen.
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  return router;
};
