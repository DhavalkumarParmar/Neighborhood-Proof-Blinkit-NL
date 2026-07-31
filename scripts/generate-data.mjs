/**
 * Generates the synthetic data layer: stores.json, catalog.json, ledger.json, profiles.json.
 *
 * Deterministic (seeded PRNG) so the committed data is reproducible.
 *
 * Dates are stored as `daysAgo` (0-29) rather than absolute dates so the
 * "last 30 days" window stays true whenever the demo is opened.
 *
 * Volumes are deliberately tuned so that all four display states occur
 * naturally in the data. See DISPLAY STATES at the bottom of this file.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  BRANDS,
  PRODUCTS,
  ISSUES,
  POSITIVE_BY_TRAIT,
  GENERIC_POSITIVE_LINES,
  NEUTRAL_LINES,
  traitsFor,
} from "./catalog-source.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = join(ROOT, "data");

/* ---------------------------------------------------------------- PRNG ---- */

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rngFor = (...parts) => mulberry32(hashString(parts.join("|")));
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const between = (rng, lo, hi) => lo + rng() * (hi - lo);

/* -------------------------------------------------------------- stores ---- */

const STORES = [
  {
    id: "ST-ALK",
    name: "Alkapuri",
    city: "Vadodara",
    area: "Alkapuri, Vadodara",
    pincode: "390007",
    density: "high",
    // Multiplier on a SKU's base demand. Alkapuri is the dense reference store.
    densityFactor: 1.0,
  },
  {
    id: "ST-GTR",
    name: "Gotri",
    city: "Vadodara",
    area: "Gotri Road, Vadodara",
    pincode: "390021",
    density: "low",
    densityFactor: 0.45,
  },
  {
    id: "ST-N62",
    name: "Sector 62",
    city: "Noida",
    area: "Sector 62, Noida",
    pincode: "201309",
    density: "high",
    densityFactor: 0.92,
  },
  {
    id: "ST-N128",
    name: "Sector 128",
    city: "Noida",
    area: "Sector 128, Noida",
    pincode: "201304",
    density: "medium",
    densityFactor: 0.5,
  },
  {
    id: "ST-KRL",
    name: "Karjat",
    city: "Karjat",
    area: "Karjat, Raigad",
    pincode: "410201",
    density: "very-low",
    densityFactor: 0.11,
  },
];

const CITY_CODE = { Vadodara: "VAD", Noida: "NOI", Karjat: "KRL" };

/* ------------------------------------------------------------- catalog ---- */

const TARGET_PER_CATEGORY = {
  beauty: 38,
  pet: 24,
  baby: 24,
  home: 32,
  electronics: 32,
};

const SKU_PREFIX = {
  beauty: "BEA",
  pet: "PET",
  baby: "BAB",
  home: "HOM",
  electronics: "ELE",
};

function buildCatalog() {
  const catalog = [];

  for (const category of CATEGORIES) {
    const products = PRODUCTS[category];
    const brands = BRANDS[category];
    const target = TARGET_PER_CATEGORY[category];
    let made = 0;

    // Walk brand-offset diagonals so the first SKU of each category is
    // brands[0] x products[0], and combinations stay unique.
    for (let round = 0; round < brands.length && made < target; round++) {
      for (let p = 0; p < products.length && made < target; p++) {
        const brand = brands[(p + round) % brands.length];
        const [name, loPrice, hiPrice, unit] = products[p];
        const id = `${SKU_PREFIX[category]}-${String(made + 1).padStart(4, "0")}`;
        const rng = rngFor("price", id, brand, name);

        // Round prices to something a shop would actually print.
        const raw = between(rng, loPrice, hiPrice);
        const price = Math.round(raw / 10) * 10 - 1;
        const mrp = Math.round((price * between(rng, 1.15, 1.6)) / 10) * 10 - 1;

        catalog.push({
          id,
          brand,
          name,
          title: `${brand} ${name}`,
          category,
          categoryLabel: CATEGORY_LABEL[category],
          unit,
          price,
          mrp,
          discountPercent: Math.round(((mrp - price) / mrp) * 100),
        });
        made++;
      }
    }
  }

  return catalog;
}

/* ------------------------------------------- per-SKU behaviour profile ---- */

// Average return rate we want each category to land near. Electronics really
// do come back more often than baby care; the category baseline in the UI is
// only meaningful if these differ.
const CATEGORY_RETURN_MEAN = {
  beauty: 0.07,
  pet: 0.08,
  baby: 0.045,
  home: 0.06,
  electronics: 0.11,
};

/** Issues that are both right for the category and physically possible for
 *  this product - a kajal pencil has no pump to break. */
function issuesFor(item, traits) {
  return Object.keys(ISSUES).filter((key) => {
    const issue = ISSUES[key];
    if (!issue.categories.includes(item.category)) return false;
    return issue.requires.some((trait) => traits.has(trait));
  });
}

/** Praise that could plausibly be written about this product. */
function positivesFor(traits) {
  const lines = [...GENERIC_POSITIVE_LINES];
  for (const trait of traits) {
    if (POSITIVE_BY_TRAIT[trait]) lines.push(...POSITIVE_BY_TRAIT[trait]);
  }
  return lines;
}

function buildSkuBehaviour(catalog) {
  const behaviour = {};

  for (const sku of catalog) {
    const rng = rngFor("behaviour", sku.id);

    // Long tail: most SKUs are niche, a few are hero products. The tail is
    // what makes the "too few orders near you" path fire naturally. The floor
    // is set so a dense store almost always has *something* to show — either
    // locally or once widened to the city.
    const popularity = 0.09 + 0.91 * Math.pow(rng(), 1.9);

    const mean = CATEGORY_RETURN_MEAN[sku.category];
    let returnRate = mean * (0.2 + 1.95 * Math.pow(rng(), 1.5));
    returnRate = Math.min(0.38, Math.max(0.004, returnRate));

    // A product people send back usually has one specific thing wrong with it.
    const traits = traitsFor(sku);
    const candidates = issuesFor(sku, traits);
    const hasIssue = returnRate > mean * 1.6 ? true : rng() < 0.42;
    const issue = hasIssue && candidates.length ? pick(rng, candidates) : null;

    behaviour[sku.id] = {
      traits,
      positives: positivesFor(traits),
      popularity,
      returnRate,
      issue,
      issueStrength: between(rng, 0.6, 0.9),
      reviewRate: between(rng, 0.12, 0.2),
    };
  }

  return behaviour;
}

/* ----------------------------------------------- hand-pinned hero SKUs ---- */

// The demo needs three specific cards to read exactly as designed, so these
// (sku, store) pairs get exact counts instead of drawn ones. Everything else
// in the ledger is generated.
const HERO_SPECS = [
  {
    label: "normal",
    product: "10% Niacinamide Face Serum",
    issue: "pump_breaks",
    // Low return rate, but a real recurring complaint the summary must surface.
    forced: { "ST-ALK": { households: 212, returns: 9 } },
  },
  {
    label: "honest-negative",
    product: "Onion Hair Oil",
    issue: "leaking",
    forced: { "ST-ALK": { households: 38, returns: 11 } },
  },
  {
    label: "widened-to-city",
    product: "Cat Scratching Post",
    issue: "cheap_plastic",
    // Under 30 at the store, comfortably over 30 across Vadodara.
    forced: {
      "ST-ALK": { households: 14, returns: 1 },
      "ST-GTR": { households: 27, returns: 3 },
    },
  },
];

function applyHeroes(catalog, behaviour) {
  const heroes = {};

  for (const spec of HERO_SPECS) {
    const sku = catalog.find((c) => c.name === spec.product);
    if (!sku) {
      throw new Error(`Hero SKU not found in catalog: ${spec.product}`);
    }
    behaviour[sku.id].issue = spec.issue;
    behaviour[sku.id].issueStrength = 0.8;
    behaviour[sku.id].reviewRate = 0.17;
    behaviour[sku.id].forced = spec.forced;
    heroes[spec.label] = { skuId: sku.id, title: sku.title, forced: spec.forced };
  }

  return heroes;
}

/* -------------------------------------------------------------- ledger ---- */

function buildHouseholdPools() {
  const pools = {};
  let n = 0;
  for (const store of STORES) {
    const size = Math.max(80, Math.round(900 * store.densityFactor));
    pools[store.id] = Array.from(
      { length: size },
      () => `HH-${CITY_CODE[store.city]}-${String(++n).padStart(5, "0")}`,
    );
  }
  return pools;
}

function reviewFor(rng, beh, returned) {
  const issue = beh.issue ? ISSUES[beh.issue] : null;

  if (returned) {
    // Someone who sent it back almost always says why.
    if (issue && rng() < beh.issueStrength) return pick(rng, issue.lines);
    return pick(rng, NEUTRAL_LINES);
  }

  // Plenty of people keep a product and still name the one thing wrong with
  // it. This is the case the summary must not gloss over.
  if (issue && rng() < 0.28) return pick(rng, issue.lines);
  return rng() < 0.85 ? pick(rng, beh.positives) : pick(rng, NEUTRAL_LINES);
}

function buildLedger(catalog, behaviour) {
  const pools = buildHouseholdPools();
  const ledger = [];

  for (const sku of catalog) {
    const beh = behaviour[sku.id];

    for (const store of STORES) {
      const rng = rngFor("ledger", sku.id, store.id);
      const forced = beh.forced?.[store.id];

      let households;
      let forcedReturns = null;

      if (forced) {
        households = forced.households;
        forcedReturns = forced.returns;
      } else {
        const jitter = between(rng, 0.8, 1.25);
        households = Math.round(290 * beh.popularity * store.densityFactor * jitter);
      }

      if (households <= 0) continue;

      const pool = pools[store.id];
      // Sample distinct households: one order per household per SKU per store,
      // so "9 of 212 sent it back" is arithmetic on the same 212 rows.
      const chosen = new Set();
      let guard = 0;
      while (chosen.size < Math.min(households, pool.length) && guard++ < households * 40) {
        chosen.add(pool[Math.floor(rng() * pool.length)]);
      }

      // Households were sampled in random order, so taking the first N rows as
      // the returns is as good as scattering them.
      const ids = [...chosen];

      ids.forEach((household, i) => {
        const returned =
          forcedReturns === null ? rng() < beh.returnRate : i < forcedReturns;

        const record = {
          household,
          sku: sku.id,
          store: store.id,
          daysAgo: Math.floor(rng() * 30),
          returned,
        };

        if (rng() < beh.reviewRate) {
          record.review = reviewFor(rng, beh, returned);
        }

        ledger.push(record);
      });
    }
  }

  return ledger;
}

/* ------------------------------------------------------------ profiles ---- */

const PROFILES = [
  {
    id: "regular",
    name: "Priya Shah",
    label: "Grocery-only regular",
    blurb: "Orders atta, milk and vegetables every week. Has never opened a beauty page.",
    storeId: "ST-ALK",
    interests: ["beauty", "home"],
  },
  {
    id: "parent",
    name: "Ankit Verma",
    label: "Young parent",
    blurb: "Buys diapers and wipes at odd hours. Careful about what touches the baby.",
    storeId: "ST-N62",
    interests: ["baby", "home"],
  },
  {
    id: "bachelor",
    name: "Rohit Kadam",
    label: "Bachelor snacker",
    blurb: "Late-night chips and cold drinks. New pincode, very few orders around him.",
    storeId: "ST-KRL",
    interests: ["electronics", "home"],
  },
];

/* ----------------------------------------------------------------- run ---- */

const catalog = buildCatalog();
const behaviour = buildSkuBehaviour(catalog);
const heroes = applyHeroes(catalog, behaviour);
const ledger = buildLedger(catalog, behaviour);

mkdirSync(DATA_DIR, { recursive: true });

const write = (file, value) =>
  writeFileSync(join(DATA_DIR, file), JSON.stringify(value, null, file === "ledger.json" ? 0 : 2));

write("stores.json", STORES);
write("catalog.json", catalog);
write("ledger.json", ledger);
write("profiles.json", PROFILES);
write("demo-pointers.json", heroes);

const returned = ledger.filter((r) => r.returned).length;
const reviews = ledger.filter((r) => r.review).length;

console.log(`catalog.json   ${catalog.length} SKUs`);
console.log(`stores.json    ${STORES.length} dark stores`);
console.log(`ledger.json    ${ledger.length} records, ${returned} returns, ${reviews} reviews`);
console.log(`profiles.json  ${PROFILES.length} shoppers`);
console.log("\nHero SKUs:");
for (const [label, h] of Object.entries(heroes)) {
  console.log(`  ${label.padEnd(16)} ${h.skuId}  ${h.title}`);
}
