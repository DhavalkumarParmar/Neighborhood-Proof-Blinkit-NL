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

---

## Naming map for the supplied image set

Identified by sight from the images shared for this demo. Rename each to the
filename on the right and drop it in `types/`.

| The image | Rename to |
|---|---|
| Clear glass dropper bottle, olive-green cap, on a leaf | `10-niacinamide-face-serum.jpg` |
| Frosted serum bottle on oranges (20% Vitamin C) | `vitamin-c-face-serum.jpg` |
| Amber square dropper bottle, yellow label, on beige | `onion-hair-oil.jpg` |
| Purple cleanser tube with foam swatch | `ubtan-face-wash.jpg` |
| Green jars of cucumber aloe vera gel | `aloe-vera-gel.jpg` |
| Clear face-mist bottle beside a pale flower | `rose-water-face-mist.jpg` |
| Tall dark "OIL" bottle among green leaves | `body-lotion-cocoa.jpg` |
| Amber pump bottle under a white arch, pebbles | `baby-shampoo-no-tears.jpg` |
| White cosmetic tube on pink, yellow flowers | `baby-lotion-milky-soft.jpg` |
| Baby on a blue blanket wearing a diaper | `baby-diaper-pants-medium.jpg` |
| Baby on a white blanket, pink polka-dot pants | `baby-diaper-pants-large.jpg` |
| Baby wipes pack flat-lay with toys, blue background | `baby-wet-wipes.jpg` |
| Two bags of adult dog food, chicken and duck | `adult-dog-dry-food-chicken.jpg` |
| Cat pawing a sisal scratching post | `cat-scratching-post.jpg` |
| Mop, bucket and a floor-cleaner sachet | `floor-cleaner-lemon.jpg` |
| Blue wireless earbuds in an open case | `wireless-earbuds.jpg` |
| Black and red neckband earphones, flat-lay | `neckband-bluetooth-earphone.jpg` |
| Black over-ear headphones beside a keyboard | `over-ear-headphones.jpg` |
| Large black trolley party speaker outdoors | `bluetooth-party-speaker.jpg` |
| Silver power bank, 10,000 mAh | `power-bank-10000mah.jpg` |
| Black marbled power bank | `power-bank-20000mah.jpg` |

Any extension works (`.jpg`, `.png`, `.webp`). After copying them in, run
`npm run images` — or just `npm run build`, which rebuilds the manifest anyway.
