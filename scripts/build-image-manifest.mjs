/**
 * Scans public/products/ and writes data/images.json.
 *
 * A manifest rather than a runtime filesystem check: files under public/ are
 * served as static assets and are not reliably readable from a serverless
 * function, so resolution has to happen at build time.
 *
 * Lookup order for a SKU, first match wins:
 *   1. public/products/<SKU>.<ext>              e.g. BEA-0001.jpg
 *   2. public/products/types/<slug>.<ext>       e.g. onion-hair-oil.jpg
 *   3. no image, and the UI falls back to a tinted tile
 *
 * The type file is shared by every brand of the same product, so one
 * onion-hair-oil.jpg covers all the onion hair oils in the catalogue.
 *
 * Run: npm run images   (also runs as part of npm run data)
 */

import { readdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PRODUCTS_DIR = join(ROOT, "public", "products");
const TYPES_DIR = join(PRODUCTS_DIR, "types");

const EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

/** "10% Niacinamide Face Serum" -> "10-niacinamide-face-serum" */
export function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function indexDir(dir) {
  if (!existsSync(dir)) return new Map();

  const found = new Map();
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const ext = extname(entry.name).toLowerCase();
    if (!EXTENSIONS.has(ext)) continue;
    found.set(basename(entry.name, ext).toLowerCase(), entry.name);
  }
  return found;
}

const catalog = JSON.parse(readFileSync(join(ROOT, "data", "catalog.json"), "utf8"));

const bySku = indexDir(PRODUCTS_DIR);
const byType = indexDir(TYPES_DIR);

const manifest = {};
let skuHits = 0;
let typeHits = 0;

for (const item of catalog) {
  const skuFile = bySku.get(item.id.toLowerCase());
  if (skuFile) {
    manifest[item.id] = `/products/${skuFile}`;
    skuHits++;
    continue;
  }

  const typeFile = byType.get(slugify(item.name));
  if (typeFile) {
    manifest[item.id] = `/products/types/${typeFile}`;
    typeHits++;
  }
}

writeFileSync(join(ROOT, "data", "images.json"), JSON.stringify(manifest, null, 2));

const covered = skuHits + typeHits;
console.log(
  `images.json    ${covered} of ${catalog.length} SKUs have an image ` +
    `(${skuHits} exact, ${typeHits} by product type)`,
);

if (covered < catalog.length) {
  // Name the product types that would cover the most SKUs next, so whoever is
  // sourcing images knows where the next file gives the most benefit.
  const missing = new Map();
  for (const item of catalog) {
    if (manifest[item.id]) continue;
    const slug = slugify(item.name);
    missing.set(slug, (missing.get(slug) ?? 0) + 1);
  }
  const top = [...missing.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log(`               ${missing.size} product types still uncovered. Highest value:`);
  for (const [slug, count] of top) {
    console.log(`                 types/${slug}.jpg  (covers ${count} SKU${count > 1 ? "s" : ""})`);
  }
}
