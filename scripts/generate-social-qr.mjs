// One-off local script: generates QR PNGs for the /hackathon social cards
// that point directly at external profile URLs (not the /qr/<slug> redirect
// pattern used by generate-qr.mjs - these are meant to be scanned from
// someone else's phone straight to Instagram/LinkedIn, not tied to a
// business card that might get repointed later).
//
// Facebook and X already have designer-provided QR assets in
// a:\HACKATHON FOLDER\Ethixweb-QR-Kit\ (copied into public/qr/ as-is) -
// this script only covers the two platforms missing a QR asset.
//
// Usage: node scripts/generate-social-qr.mjs

import QRCode from "qrcode";
import { mkdir } from "node:fs/promises";

const TARGETS = {
  instagram: "https://www.instagram.com/ethix.web/",
  linkedin: "https://www.linkedin.com/company/ethixweb/",
};

await mkdir("public/qr", { recursive: true });

for (const [slug, url] of Object.entries(TARGETS)) {
  const outPath = `public/qr/${slug}.png`;
  await QRCode.toFile(outPath, url, {
    errorCorrectionLevel: "H",
    width: 600,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });
  console.log(`Generated ${outPath} -> ${url}`);
}
