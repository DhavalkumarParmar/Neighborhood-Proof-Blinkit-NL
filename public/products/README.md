# Product images

Drop image files in here, then run `npm run images` to rebuild the manifest.
No code changes needed — anything without an image falls back to a tinted tile.

## Naming

Two ways to name a file. The first that matches wins.

**By product type** — put it in `types/`, named after the product with spaces
replaced by hyphens, lowercased. Shared by every brand of that product, so one
file covers several SKUs. This is the efficient option.

```
public/products/types/onion-hair-oil.jpg
public/products/types/10-niacinamide-face-serum.jpg
public/products/types/cat-scratching-post.jpg
public/products/types/adult-dog-dry-food-chicken.jpg
```

**By SKU** — put it directly in `products/`, named after the SKU id. Overrides
the type image for that one product.

```
public/products/BEA-0001.jpg
```

`npm run images` prints which product types are still uncovered, sorted by how
many SKUs each one would cover, so you always know which file to add next.

## What works

- `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`
- Square-ish, product centred on a plain white or very light background. The UI
  uses `object-fit: contain` so other aspect ratios still render without
  distortion, they just letterbox.
- Roughly 600×600 is plenty. These are rendered at about 180px wide on a phone.

## What not to use

Brand names in this catalogue are **invented** — Aurvi, Sattva Skin, Pawrush and
so on are not real companies. So do not use a real brand's product photography:
it will not match the name printed on the card, and it puts someone else's
copyrighted image on a public URL. Generic unbranded product shots, or your own
photos, or royalty-free stock.
