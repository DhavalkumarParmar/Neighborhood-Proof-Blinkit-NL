/**
 * Downscales everything in public/products to something a phone screen actually
 * needs, in place.
 *
 * Source photos are full-resolution stock (up to 8192px, 8 MB each). They render
 * at roughly 160px in the listing and 400px on the product page, so shipping the
 * originals would put tens of megabytes into the repo and make the browse page
 * download all of it for thumbnails.
 *
 * Idempotent: an already-processed file is under the size cap and gets skipped,
 * so this is safe to run repeatedly as more images are added.
 *
 * Run: npm run images:optimise
 */

import { readdirSync, statSync, renameSync, unlinkSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIRS = [join(ROOT, "public", "products"), join(ROOT, "public", "products", "types")];

const MAX_EDGE = 900; // Comfortably above the ~400px the product page renders at.
const QUALITY = 80;
const EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const kb = (bytes) => Math.round(bytes / 1024);

let before = 0;
let after = 0;
let done = 0;
let skipped = 0;

for (const dir of DIRS) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    continue;
  }

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!EXTENSIONS.has(extname(entry.name).toLowerCase())) continue;

    const path = join(dir, entry.name);
    const sizeBefore = statSync(path).size;
    const meta = await sharp(path).metadata();

    if (Math.max(meta.width ?? 0, meta.height ?? 0) <= MAX_EDGE && sizeBefore < 200 * 1024) {
      skipped++;
      before += sizeBefore;
      after += sizeBefore;
      continue;
    }

    // sharp cannot read and write the same path in one pass.
    const tmp = `${path}.tmp`;
    await sharp(path)
      .rotate() // honour EXIF orientation before stripping it
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(tmp);

    unlinkSync(path);
    renameSync(tmp, path);

    const sizeAfter = statSync(path).size;
    before += sizeBefore;
    after += sizeAfter;
    done++;

    console.log(
      `  ${entry.name.padEnd(34)} ${String(meta.width) + "x" + meta.height}`.padEnd(50) +
        `${kb(sizeBefore)} KB -> ${kb(sizeAfter)} KB`,
    );
  }
}

console.log(
  `\n  ${done} resized, ${skipped} already small enough. ` +
    `${kb(before)} KB -> ${kb(after)} KB` +
    (before > 0 ? ` (${Math.round((1 - after / before) * 100)}% smaller)` : ""),
);
