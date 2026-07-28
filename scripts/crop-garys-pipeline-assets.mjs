// One-off script: crops the production image assets for the Gary's
// Pipelining case study out of the source design export
// (public/NEW FORMAT/Gary's Pipeline.png, a 5933x32768 Figma frame) at full
// resolution, and converts each to WebP. Run once; the cropped outputs are
// what ships. Not meant to be re-run unless the source design changes.
//
// Usage: node scripts/crop-garys-pipeline-assets.mjs

import sharp from "sharp";

const SRC = "public/NEW FORMAT/Gary's Pipeline.png";
const OUT = "public/images/case-studies/garys-pipeline";

const CROPS = [
  { name: "hero", left: 2450, top: 690, width: 3470, height: 2650, quality: 84 },
  { name: "client-logo", left: 520, top: 4340, width: 660, height: 220, quality: 90 },
  { name: "before-screenshot", left: 3929, top: 10388, width: 1567, height: 1866, quality: 84 },
  { name: "after-photo", left: 3320, top: 7075, width: 1450, height: 1240, quality: 84 },
  { name: "showcase-devices", left: 200, top: 9820, width: 5600, height: 2650, quality: 84 },
  { name: "spotlight-enquiry-flow", left: 686, top: 16690, width: 2580, height: 2705, quality: 84 },
  {
    name: "spotlight-chat-assistant",
    left: 480,
    top: 19700,
    width: 2500,
    height: 2350,
    quality: 84,
  },
];

for (const c of CROPS) {
  const outPath = `${OUT}/${c.name}.webp`;
  const img = await sharp(SRC)
    .extract({ left: c.left, top: c.top, width: c.width, height: c.height })
    .webp({ quality: c.quality });
  await img.toFile(outPath);
  const meta = await sharp(outPath).metadata();
  console.log(`${outPath} -> ${meta.width}x${meta.height}`);
}
