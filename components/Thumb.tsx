/**
 * Stand-in for product photography. Real catalogue images are not part of a
 * concept demo, so each SKU gets a stable tinted tile derived from its brand -
 * consistent between the listing and the product page.
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
  variant = "card",
}: {
  brand: string;
  name: string;
  category: string;
  variant?: "card" | "pdp";
}) {
  const [from, to] = TINTS[category] ?? ["#f5f5f5", "#e9e9e9"];
  const label = `${brand} ${name}`;

  if (variant === "pdp") {
    return (
      <div
        className="pdp-media"
        style={{ background: `linear-gradient(155deg, ${from}, ${to})` }}
        role="img"
        aria-label={label}
      >
        <div>
          <div>{shortLabel(brand)}</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 10, letterSpacing: 0 }}>
            {brand}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        aspectRatio: "1 / 1",
        borderRadius: 8,
        display: "grid",
        placeItems: "center",
        fontWeight: 800,
        fontSize: 21,
        letterSpacing: "-0.03em",
        color: "rgba(0,0,0,0.4)",
        background: `linear-gradient(155deg, ${from}, ${to})`,
      }}
      role="img"
      aria-label={label}
    >
      {shortLabel(brand)}
    </div>
  );
}
