// Tells IndexNow search engines (Bing, Yandex, Seznam, Naver) that pages
// changed, so they recrawl in hours instead of weeks. Google does not use
// IndexNow; it reads the sitemap and Search Console instead.
//
// Usage, after a deploy is live:  node scripts/indexnow.mjs [url ...]
// With no arguments it submits every URL in public/sitemap.xml.
// The key is the public/<key>.txt file served from the site root.
import { readdirSync, readFileSync } from "node:fs";

const HOST = "www.ethixweb.com";
const keyFile = readdirSync("public").find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error("No IndexNow key file (public/<32 hex>.txt) found");
const key = keyFile.replace(/\.txt$/, "");

const urls = process.argv.length > 2
  ? process.argv.slice(2)
  : [...readFileSync("public/sitemap.xml", "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${keyFile}`, urlList: urls }),
});
console.log(`IndexNow: ${res.status} ${res.statusText} for ${urls.length} URLs`);
