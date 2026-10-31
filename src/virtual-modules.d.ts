/** The site stylesheet as a string, for inlining into the server-rendered
 * HTML. Resolves to the real CSS in the server build and to "" in the
 * browser build (see serverOnlyInlineCss in vite.config.ts), so the CSS is
 * never shipped inside the client JavaScript. */
declare module "virtual:app-css-inline" {
  const css: string;
  export default css;
}
