import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import type { RollupLog } from "rollup";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Dependencies ship "use client" directives for React Server Components and
// re-export types they don't use. Neither means anything in this app - there
// is no RSC boundary here - but together they bury a build in ~85 lines of
// noise. Drop them for node_modules only, so the same warning about our own
// code still gets through.
function silenceDependencyNoise(warning: RollupLog, warn: (w: RollupLog) => void) {
  const id = warning.id ?? warning.loc?.file ?? "";
  const from = warning.message ?? "";
  const isDependency = id.includes("node_modules") || from.includes("node_modules");
  if (
    isDependency &&
    (warning.code === "MODULE_LEVEL_DIRECTIVE" || warning.code === "UNUSED_EXTERNAL_IMPORT")
  ) {
    return;
  }
  // Nitro pre-declares a chunk per vendor package and tree-shaking empties the
  // ones the server never reaches. Its own handler hid these; ours replaces
  // that handler, so skip them explicitly. Scoped to Nitro's _libs/ prefix so
  // an empty chunk of our own still gets reported.
  if (warning.code === "EMPTY_BUNDLE" && from.includes('"_libs/')) {
    return;
  }
  warn(warning);
}

/** The stylesheet as a string for the server-rendered HTML only.
 *
 * __root.tsx inlines the CSS into the page so first paint never waits on a
 * separate stylesheet request. Imported directly with ?inline, the same 174kB
 * string was also bundled into the browser's main JavaScript chunk, where it
 * is never used: the CSS downloaded twice and that chunk crossed the 500kB
 * budget. `virtual:app-css-inline` resolves to the real ?inline CSS in the
 * server build and to an empty string in the client build; in the browser
 * the root reads the text back from the <style> element the server already
 * sent, so server and client render the same thing. */
function serverOnlyInlineCss(): Plugin {
  const ID = "virtual:app-css-inline";
  const EMPTY = "\0app-css-inline:client";
  const stylesheet = fileURLToPath(new URL("./src/styles.css", import.meta.url));
  return {
    name: "ethixweb:server-only-inline-css",
    enforce: "pre",
    resolveId(id) {
      if (id !== ID) return;
      return this.environment.name === "client" ? EMPTY : `${stylesheet}?inline`;
    },
    load(id) {
      if (id === EMPTY) return "export default '';";
    },
  };
}

/** Client chunk size budget with its one deliberate exception.
 *
 * Vite's built-in warning fires on any client chunk over 500kB, and the
 * chatbot's in-browser model runtime (@mlc-ai/web-llm, ~6MB) always trips it,
 * though it is lazy-loaded and fetched only when a desktop visitor asks the
 * chatbot a general question. Raising the global limit would also hide a real
 * regression in the app's own chunks, so the built-in check is lifted past
 * that runtime and this one holds every other chunk to 500kB. */
const CHUNK_BUDGET_KB = 500;
function chunkBudget(): Plugin {
  return {
    name: "ethixweb:chunk-budget",
    apply: "build",
    generateBundle(_options, bundle) {
      if (this.environment.name !== "client") return;
      for (const [file, chunk] of Object.entries(bundle)) {
        if (chunk.type !== "chunk") continue;
        if (chunk.moduleIds.some((id) => id.includes("@mlc-ai/web-llm"))) continue;
        const kb = Buffer.byteLength(chunk.code) / 1024;
        if (kb > CHUNK_BUDGET_KB) {
          this.warn(`${file} is ${kb.toFixed(1)} kB, over the ${CHUNK_BUDGET_KB} kB budget.`);
        }
      }
    },
  };
}

export default defineConfig({
  logLevel: "info",
  build: {
    target: ["es2019", "safari14"],
    rollupOptions: { onwarn: silenceDependencyNoise },
  },
  environments: {
    client: {
      build: {
        // See chunkBudget above: lifted past the lazy chatbot runtime only;
        // the plugin keeps every other client chunk to 500kB.
        chunkSizeWarningLimit: 7000,
        rollupOptions: {
          output: {
            // React and Framer Motion are most of the entry chunk and change
            // only when their versions do. Splitting them out drops the entry
            // under the 500 kB warning threshold and, more usefully, lets a
            // returning visitor keep both cached across our deploys.
            manualChunks(id: string) {
              if (!id.includes("node_modules")) return;
              if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return "react-vendor";
              if (/node_modules\/(framer-motion|motion-dom|motion-utils)\//.test(id)) {
                return "motion-vendor";
              }
            },
          },
        },
      },
    },
  },
  plugins: [
    serverOnlyInlineCss(),
    chunkBudget(),
    tailwindcss(),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    // @ts-expect-error - `autoCodeSplitting` is the stable, runtime-required
    // option (the plugin throws at startup if the old `experimental.
    // enableCodeSplitting` path is used instead), but this package's shipped
    // .d.ts hasn't caught up yet. Verified via `npm run dev`/`npm run build`.
    tanstackStart({ router: { autoCodeSplitting: true } }),
    nitro({
      preset: "vercel",
      // Nitro bundles the server function with its own Rollup pass, after
      // Vite's client and ssr builds, so build.rollupOptions above never
      // reaches it - this is where those directive warnings come from.
      rollupConfig: { onwarn: silenceDependencyNoise },
      vercel: {
        // Assessment generation waits on multiple Gemini calls - give those
        // routes room beyond the default serverless duration.
        functionRules: {
          "/api/assessment/**": { maxDuration: 300 },
          // Finalizing a Google Ads assessment renders a PDF and sends two
          // emails synchronously - comfortably under a minute, but well
          // beyond the platform default.
          "/api/gads/submit": { maxDuration: 60 },
        },
      },
    }),
    viteReact(),
  ],
});
