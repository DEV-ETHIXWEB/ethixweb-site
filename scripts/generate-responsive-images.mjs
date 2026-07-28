// One-off local script: generates smaller-width WebP variants of the large
// case-study photos so the browser can pick a size matching the viewport
// instead of always downloading the full-resolution source (see the
// `srcSet`/`sizes` on the <img> tags in src/components/case-study/*.tsx).
//
// For each source image, writes `<name>-<width>w.webp` siblings at every
// breakpoint narrower than the source (the source itself remains the
// largest/fallback entry in the srcSet). Re-run whenever a case-study photo
// is replaced.
//
// Usage: node scripts/generate-responsive-images.mjs

import sharp from "sharp";
import { readdir } from "node:fs/promises";
import path from "node:path";

const WIDTHS = [640, 1024, 1600];

const CASE_STUDY_DIRS = [
  "public/images/case-studies/all-phase-plumbing",
  "public/images/case-studies/garys-pipeline",
];

// Only these source files get variants - small logos/icons in the same
// folders are already tiny and not worth the extra requests.
const TARGET_FILES = new Set([
  "hero.webp",
  "before-screenshot.webp",
  "after-screenshot.webp",
  "devices-mockup-cutout.webp",
  "spotlight-homeowner-framed.webp",
  "spotlight-intentional-framed.webp",
  "after-photo.webp",
  "showcase-devices.webp",
  "spotlight-enquiry-flow.webp",
  "spotlight-chat-assistant.webp",
]);

for (const dir of CASE_STUDY_DIRS) {
  const entries = await readdir(dir);
  for (const file of entries) {
    if (!TARGET_FILES.has(file)) continue;

    const srcPath = path.join(dir, file);
    const { width: naturalWidth } = await sharp(srcPath).metadata();
    const ext = path.extname(file);
    const base = path.basename(file, ext);

    for (const width of WIDTHS) {
      if (!naturalWidth || width >= naturalWidth) continue; // never upscale
      const outPath = path.join(dir, `${base}-${width}w.webp`);
      await sharp(srcPath).resize({ width }).webp({ quality: 82 }).toFile(outPath);
      console.log(`Generated ${outPath}`);
    }
  }
}
