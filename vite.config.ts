import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  logLevel: "info",
  build: {
    target: ["es2019", "safari14"],
    rollupOptions: {
      onwarn(warning, warn) {
        const id = warning.id ?? "";
        if (
          id.includes("node_modules") &&
          (warning.code === "MODULE_LEVEL_DIRECTIVE" || warning.code === "UNUSED_EXTERNAL_IMPORT")
        ) {
          return;
        }
        warn(warning);
      },
    },
  },
  plugins: [
    tailwindcss(),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart(),
    nitro({ preset: "vercel" }),
    viteReact(),
  ],
});
