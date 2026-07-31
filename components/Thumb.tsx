/**
 * Stand-in for product photography. Real catalogue images are not part of a
 * concept demo, so each SKU gets a stable tinted tile derived from its id -
 * consistent between the listing and the product page.
 */

const TINTS: Record<string, [string, string]> = {
  beauty: ["#fdeff4", "#f7dbe6"],
  pet: ["#eef4fd", "#dbe6f7"],
  baby: ["#fff6e8", "#fbe7c8"],
  home: ["#eefaf1", "#d6f0de"],
  electronics: ["#f1f0fb", "#e0ddf4"],
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
  const [from, to] = TINTS[category] ?? ["#f4f4f4", "#e8e8e8"];

  return (
    <div
      className={variant === "pdp" ? "pdp-media" : "thumb"}
      style={{ background: `linear-gradient(150deg, ${from}, ${to})` }}
      role="img"
      aria-label={`${brand} ${name}`}
    >
      {variant === "pdp" ? (
        <div>
          <div>{shortLabel(brand)}</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 10, letterSpacing: 0 }}>
            {brand}
          </div>
        </div>
      ) : (
        shortLabel(brand)
      )}
    </div>
  );
}
