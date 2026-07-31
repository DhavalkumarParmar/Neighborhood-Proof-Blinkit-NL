/**
 * Product image lookup, from the manifest built by scripts/build-image-manifest.mjs.
 *
 * Returns null when a SKU has no image, and the UI falls back to a tinted tile.
 * That fallback is the normal case, not an error state: a concept demo does not
 * need 150 product shots, and the ones that matter are the handful a reviewer
 * actually clicks through.
 */

import manifest from "../data/images.json";

const images = manifest as Record<string, string>;

export function imageFor(skuId: string): string | null {
  return images[skuId] ?? null;
}

export function imageCount(): number {
  return Object.keys(images).length;
}
