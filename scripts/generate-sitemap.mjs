// Generates public/sitemap.xml. Runs before every build (see package.json).
//
// Why a script instead of a hand-written file: the static sitemap silently fell
// behind - four indexable campaign landing pages were never added, and no entry
// had a <lastmod>, so Google had no signal that pages had changed.
//
// Guarantees:
//   1. Every page route must be listed in PAGES or EXCLUDED below. A new route
//      that is in neither fails the build, so a page can't be forgotten again.
//   2. <lastmod> is the last git commit touching the page or its own content.
//      Vercel builds from a shallow clone, so when git has no history for a
//      page, the date already committed in public/sitemap.xml is kept instead
//      of guessing.
//
// Usage: node scripts/generate-sitemap.mjs   (also: npm run sitemap)
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";

const SITE = "https://www.ethixweb.com";
const OUT = "public/sitemap.xml";
const ROUTES_DIR = "src/routes";
const CASE_STUDIES_DIR = "src/data/case-studies";

/** Indexable pages. `files` = what counts as "this page changed" for <lastmod>. */
const PAGES = [
  { path: "/", files: ["src/routes/index.tsx", "src/components/home"], priority: "1.0" },
  { path: "/services", files: ["src/routes/services.tsx"], priority: "0.9" },
  { path: "/contact", files: ["src/routes/contact.tsx"], priority: "0.9" },
  { path: "/locations/kent-wa", files: ["src/routes/locations.kent-wa.tsx"], priority: "0.9" },
  { path: "/web-development", files: ["src/routes/web-development.tsx"], priority: "0.8" },
  { path: "/ai-automation", files: ["src/routes/ai-automation.tsx"], priority: "0.8" },
  { path: "/marketing", files: ["src/routes/marketing.tsx"], priority: "0.8" },
  { path: "/graphic-design", files: ["src/routes/graphic-design.tsx"], priority: "0.8" },
  { path: "/about", files: ["src/routes/about.tsx"], priority: "0.8" },
  {
    path: "/our-work",
    files: [
      "src/routes/our-work.index.tsx",
      "src/routes/our-work.tsx",
      "src/lib/portfolio-data.ts",
    ],
    priority: "0.8",
  },
  ...campaignPage("/hvac-plumbing-marketing", "hvac-plumbing-marketing"),
  ...campaignPage("/google-ads-management", "google-ads-management"),
  ...campaignPage("/fishing-marine-marketing", "fishing-marine-marketing"),
  ...campaignPage(
    "/landing/fishing-marketing/seattle",
    "fishing-marketing-seattle",
    "landing.fishing-marketing.seattle",
  ),
  { path: "/industries", files: ["src/routes/industries.tsx"], priority: "0.7" },
  { path: "/blog", files: ["src/routes/blog.tsx"], priority: "0.7" },
  {
    path: "/policies/privacy",
    files: ["src/routes/policies.privacy.tsx"],
    priority: "0.3",
    changefreq: "yearly",
  },
  {
    path: "/policies/terms",
    files: ["src/routes/policies.terms.tsx"],
    priority: "0.3",
    changefreq: "yearly",
  },
  {
    path: "/policies/refunds",
    files: ["src/routes/policies.refunds.tsx"],
    priority: "0.3",
    changefreq: "yearly",
  },
];

/** Route files deliberately left out of the sitemap, with the reason. */
const EXCLUDED = {
  "__root.tsx": "app shell, not a page",
  "our-work.$slug.tsx": "expanded per case study below",
  "careers.tsx": "redirects to /not-hiring while hiring is paused",
  "careers.index.tsx": "behind the /careers redirect",
  "careers.$slug.tsx": "noindex",
  "careers.apply.tsx": "noindex",
  "careers.screening.tsx": "noindex",
  "careers.assessment.tsx": "noindex",
  "not-hiring.tsx": "noindex",
  "assessment.google-ads.$token.tsx": "private single-use exam link, noindex",
  "qr.$slug.ts": "QR redirect endpoint",
  "hackathon.tsx": "temporary event page",
};

function campaignPage(path, configName, routeName = configName) {
  return [
    {
      path,
      files: [
        `src/routes/${routeName}.tsx`,
        `src/lib/campaigns/${configName}.ts`,
        "src/components/campaign",
      ],
      priority: "0.8",
    },
  ];
}

// ── Case studies: one URL per data file ────────────────────────────────────
const caseStudies = readdirSync(CASE_STUDIES_DIR)
  .filter((f) => f.endsWith(".ts") && f !== "index.ts" && f !== "types.ts")
  .map((f) => f.replace(/\.ts$/, ""))
  .sort();
for (const slug of caseStudies) {
  PAGES.push({
    path: `/our-work/${slug}`,
    files: [`${CASE_STUDIES_DIR}/${slug}.ts`, "src/routes/our-work.$slug.tsx"],
    priority: "0.7",
  });
}

// ── Guard: every route file must be accounted for ─────────────────────────
const listed = new Set(PAGES.flatMap((p) => p.files).filter((f) => f.startsWith(`${ROUTES_DIR}/`)));
const unaccounted = readdirSync(ROUTES_DIR)
  .filter((f) => /\.tsx?$/.test(f) && !f.startsWith("api.") && f !== "routeTree.gen.ts")
  .filter((f) => !listed.has(`${ROUTES_DIR}/${f}`) && !(f in EXCLUDED));
if (unaccounted.length) {
  console.error(
    `\n[sitemap] These routes are in neither PAGES nor EXCLUDED in scripts/generate-sitemap.mjs:\n` +
      unaccounted.map((f) => `  - ${ROUTES_DIR}/${f}`).join("\n") +
      `\nAdd each one to PAGES (indexable) or EXCLUDED (with a reason).\n`,
  );
  process.exit(1);
}
for (const page of PAGES) {
  for (const f of page.files) {
    if (!existsSync(f)) {
      console.error(`[sitemap] ${page.path}: listed file does not exist: ${f}`);
      process.exit(1);
    }
  }
}

// ── <lastmod> ──────────────────────────────────────────────────────────────
const previous = new Map();
if (existsSync(OUT)) {
  for (const [, loc, body] of readFileSync(OUT, "utf8").matchAll(
    /<url>\s*<loc>([^<]+)<\/loc>([\s\S]*?)<\/url>/g,
  )) {
    const lastmod = body.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
    if (lastmod) previous.set(loc, lastmod);
  }
}
function git(args) {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}
// In a shallow clone the oldest fetched commit appears to add every file, so any
// page untouched within the fetched window would wrongly get that commit's date.
// Dates coming from a shallow boundary commit are ignored (the committed date wins).
const shallowFile = git(["rev-parse", "--git-path", "shallow"]);
const shallowBoundary = new Set(
  shallowFile && existsSync(shallowFile) ? readFileSync(shallowFile, "utf8").split(/\s+/) : [],
);
function gitDate(files) {
  const [hash, date] = git(["log", "-1", "--format=%H %cs", "--", ...files]).split(" ");
  return hash && !shallowBoundary.has(hash) ? date : "";
}
const today = new Date().toISOString().slice(0, 10);

const entries = PAGES.map((p) => {
  const loc = SITE + (p.path === "/" ? "/" : p.path);
  const fromGit = gitDate(p.files);
  const kept = previous.get(loc);
  // Prefer the newer of git and the committed date, so a date never moves backwards.
  const lastmod = [fromGit, kept].filter(Boolean).sort().at(-1) ?? today;
  return { loc, lastmod, changefreq: p.changefreq ?? "monthly", priority: p.priority };
});

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  entries
    .map(
      (e) =>
        `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n` +
        `    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>\n`,
    )
    .join("") +
  `</urlset>\n`;

writeFileSync(OUT, xml);
console.log(`[sitemap] wrote ${entries.length} URLs to ${OUT}`);
