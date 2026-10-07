import { defineConfig } from "vite";
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

export default defineConfig({
  logLevel: "info",
  build: {
    target: ["es2019", "safari14"],
    rollupOptions: { onwarn: silenceDependencyNoise },
  },
  environments: {
    client: {
      build: {
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
