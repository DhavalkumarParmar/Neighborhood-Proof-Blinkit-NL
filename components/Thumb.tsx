/**
 * Product imagery.
 *
 * Renders a real photo when one exists in public/products (see the README
 * there), and otherwise a stable tinted tile derived from the brand. Both
 * variants keep the same footprint, so a catalogue that is only partly
 * photographed still lays out evenly.
 */

const TINTS: Record<string, [string, string]> = {
  beauty: ["#fdf0f5", "#f8dfe8"],
  pet: ["#eff5fd", "#dde8f8"],
  baby: ["#fff7ea", "#fbe9cd"],
  home: ["#eff9f2", "#daf0e1"],
  electronics: ["#f2f1fb", "#e3e0f5"],
};

function shortLabel(brand: string): string {
  const words = brand.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function Thumb({
  brand,
  name,
  category,
  image,
  variant = "card",
}: {
  brand: string;
  name: string;
  category: string;
  image?: string | null;
  variant?: "card" | "pdp";
}) {
  const [from, to] = TINTS[category] ?? ["#f5f5f5", "#e9e9e9"];
  const label = `${brand} ${name}`;
  const isPdp = variant === "pdp";

  if (image) {
    return (
      <div className={isPdp ? "pdp-media" : "thumb"} data-photo="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={label} loading={isPdp ? "eager" : "lazy"} />
      </div>
    );
  }

  return (
    <div
      className={isPdp ? "pdp-media" : "thumb"}
      style={{ background: `linear-gradient(155deg, ${from}, ${to})` }}
      role="img"
      aria-label={label}
    >
      {isPdp ? (
        <div>
          <div>{shortLabel(brand)}</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 10, letterSpacing: 0 }}>
            {brand}
          </div>
        </div>
      ) : (
        shortLabel(brand)
      )}
    </div>
  );
}
