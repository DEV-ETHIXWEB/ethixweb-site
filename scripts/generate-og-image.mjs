// Generates public/og-image.png - the 1200x630 card used by every page's
// og:image / twitter:image.
//
// Why this exists: those tags used to point at public/ethixweb.png, which is
// the 422x63 white wordmark. Every page also declared og:image:width 1200 /
// og:image:height 630, so the markup promised a large card and delivered a
// thin strip. At 422x63 the image is below Facebook's and LinkedIn's minimum
// for a large preview and nowhere near Twitter's 2:1 summary_large_image
// ratio, so shares either dropped the image or squashed it. ethixweb.png is
// still the right asset for the schema.org `logo` field and the email
// template - a wordmark is what those want - so it stays as it is, and the
// social card is built here instead.
//
// Usage: node scripts/generate-og-image.mjs   (also: npm run og-image)
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 630;
const OUT = "public/og-image.png";

const WORDMARK = "public/ethixweb.png";
const EMBLEM = "src/assets/emblem-transparent.webp";

// Brand tokens, kept in step with --background / --primary in src/styles.css.
const BACKGROUND = "#0c0d10";
const PRIMARY = "#c0272d";

// Background: flat brand ink plus two soft brand-red glows, echoing the
// GlowBlob treatment the site uses behind its own hero sections.
const backdrop = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
     <defs>
       <radialGradient id="glowA" cx="0.12" cy="0.08" r="0.75">
         <stop offset="0%" stop-color="${PRIMARY}" stop-opacity="0.38"/>
         <stop offset="100%" stop-color="${PRIMARY}" stop-opacity="0"/>
       </radialGradient>
       <radialGradient id="glowB" cx="0.92" cy="1.02" r="0.85">
         <stop offset="0%" stop-color="${PRIMARY}" stop-opacity="0.30"/>
         <stop offset="100%" stop-color="${PRIMARY}" stop-opacity="0"/>
       </radialGradient>
     </defs>
     <rect width="${WIDTH}" height="${HEIGHT}" fill="${BACKGROUND}"/>
     <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glowA)"/>
     <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glowB)"/>
   </svg>`,
);

// Tagline + rule. A generic sans stack on purpose: the brand face is a woff2
// that librsvg can't load, and the wordmark above already carries the brand
// lettering as artwork, so this line only has to be clean and legible.
const caption = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
     <rect x="96" y="372" width="86" height="4" rx="2" fill="${PRIMARY}"/>
     <text x="96" y="438" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
           font-size="46" font-weight="700" fill="#ffffff">Premium Technology Partner</text>
     <text x="96" y="492" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
           font-size="27" font-weight="400" fill="#a7a9b0">Websites, AI automation, SEO and ads</text>
     <text x="96" y="533" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
           font-size="27" font-weight="400" fill="#a7a9b0">for US home service businesses.</text>
   </svg>`,
);

// Emblem bled off the right edge as a watermark, faint enough that the text
// stays the subject. Composite inputs may not exceed the canvas, so it is
// cropped to the strip that actually lands on the card rather than being
// placed oversized and relying on sharp to clip it (sharp throws instead).
const EMBLEM_LEFT = 830;
const EMBLEM_HEIGHT = 470;
const emblemFull = sharp(readFileSync(EMBLEM)).resize({ height: EMBLEM_HEIGHT });
const emblemMeta = await emblemFull.metadata();
const emblemWidth = Math.min(emblemMeta.width, WIDTH - EMBLEM_LEFT);
const emblemOpaque = await emblemFull
  .extract({ left: 0, top: 0, width: emblemWidth, height: EMBLEM_HEIGHT })
  .ensureAlpha()
  .png()
  .toBuffer();

// Knock the emblem back to a watermark by intersecting its alpha with a flat
// low-alpha layer of the same size (dest-in keeps the overlap).
const emblem = await sharp(emblemOpaque)
  .composite([
    {
      input: {
        create: {
          width: emblemWidth,
          height: EMBLEM_HEIGHT,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 0.16 },
        },
      },
      blend: "dest-in",
    },
  ])
  .png()
  .toBuffer();

// Wordmark at 2.1x its native 422x63, which lands it comfortably inside the
// safe area rather than hugging the edge.
const wordmark = await sharp(readFileSync(WORDMARK)).resize({ width: 700 }).png().toBuffer();

const card = await sharp(backdrop)
  .composite([
    { input: emblem, top: 118, left: EMBLEM_LEFT },
    { input: wordmark, top: 196, left: 96 },
    { input: caption, top: 0, left: 0 },
  ])
  .png({ compressionLevel: 9 })
  .toBuffer();

writeFileSync(OUT, card);

const { width, height } = await sharp(card).metadata();
console.log(`[og-image] wrote ${OUT} at ${width}x${height} (${(card.length / 1024).toFixed(0)}KB)`);
if (width !== WIDTH || height !== HEIGHT) {
  console.error(`[og-image] expected ${WIDTH}x${HEIGHT}`);
  process.exit(1);
}
