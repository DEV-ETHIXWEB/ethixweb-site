// One-off local script: (re)generates the static QR PNGs for team business
// cards. Each QR encodes a permanent https://www.ethixweb.com/qr/<slug> URL
// (see src/routes/qr.$slug.ts), which server-side redirects to whatever
// that slug currently points to in src/lib/qr-links.ts. So printed cards
// never go stale - to repoint someone's card, edit qr-links.ts and
// redeploy; the QR image itself never needs to be regenerated or reprinted.
//
// Keep the SLUGS list below in sync with the keys in src/lib/qr-links.ts.
//
// Usage: node scripts/generate-qr.mjs

import QRCode from "qrcode";
import { mkdir } from "node:fs/promises";

const SITE_URL = "https://www.ethixweb.com";
const SLUGS = ["amar"];

await mkdir("public/qr", { recursive: true });

for (const slug of SLUGS) {
  const url = `${SITE_URL}/qr/${slug}`;
  const outPath = `public/qr/${slug}.png`;
  await QRCode.toFile(outPath, url, {
    errorCorrectionLevel: "H",
    width: 600,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  });
  console.log(`Generated ${outPath} -> ${url}`);
}
