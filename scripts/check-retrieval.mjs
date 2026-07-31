/**
 * Exercises the real retrieval layer (lib/proof-core.ts) against the generated
 * data and asserts that all four display states are reachable.
 *
 * Run: npm run check:retrieval
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildProofIndex, MIN_HOUSEHOLDS } from "../lib/proof-core.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => JSON.parse(readFileSync(join(ROOT, "data", f), "utf8"));

const catalog = read("catalog.json");
const stores = read("stores.json");
const ledger = read("ledger.json");
const profiles = read("profiles.json");
const pointers = read("demo-pointers.json");

const index = buildProofIndex(catalog, stores, ledger);

let failures = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "  ok  " : " FAIL "} ${name}${detail ? `  ${detail}` : ""}`);
  if (!ok) failures++;
};

/* ------------------------------------------- state census, per store ------ */

console.log("State census (SKUs per state, by store):\n");
const census = {};

for (const store of stores) {
  const tally = { normal: 0, widened: 0, noData: 0 };
  for (const item of catalog) {
    const f = index.getProof(item.id, store.id);
    if (f.noData) tally.noData++;
    else if (f.widened) tally.widened++;
    else tally.normal++;
  }
  census[store.id] = tally;
  console.log(
    `  ${store.id.padEnd(8)} ${store.city.padEnd(9)} ${store.density.padEnd(9)}` +
      ` normal ${String(tally.normal).padStart(3)}` +
      `  widened ${String(tally.widened).padStart(3)}` +
      `  noData ${String(tally.noData).padStart(3)}`,
  );
}

/* ------------------------------------------------------ invariants -------- */

console.log("\nInvariants:\n");

// Nothing below the threshold may be reported as store-scoped, and nothing
// reported as widened may be above it at store level.
let scopeViolations = 0;
let arithmeticViolations = 0;
let widenViolations = 0;

for (const store of stores) {
  for (const item of catalog) {
    const f = index.getProof(item.id, store.id);
    if (f.noData) continue;

    if (f.households < MIN_HOUSEHOLDS) scopeViolations++;
    if (f.returns > f.households) arithmeticViolations++;
    if (Math.abs(f.returnRate - f.returns / f.households) > 1e-9) arithmeticViolations++;

    if (f.widened) {
      const local = index.getProof(item.id, store.id);
      if (!local.noData && f.scope !== "city") widenViolations++;
      if (f.scopeLabel !== store.city) widenViolations++;
    } else if (f.scopeLabel !== store.name) {
      scopeViolations++;
    }
  }
}

check("no result is ever reported below the 30-household floor", scopeViolations === 0);
check("returns never exceed households; rate matches the counts", arithmeticViolations === 0);
check("widened results are always labelled with the city", widenViolations === 0);

/* -------------------------------------------------- the four states ------- */

console.log("\nThe four display states:\n");

const normal = index.getProof(pointers.normal.skuId, "ST-ALK");
check(
  "1. normal",
  !normal.noData && !normal.widened && normal.verdict === "low",
  !normal.noData
    ? `${normal.households} homes, ${normal.returns} returns, ` +
        `${(100 * normal.returnRate).toFixed(1)}% vs ${(100 * normal.categoryReturnRate).toFixed(1)}% ` +
        `baseline -> "${normal.verdict}"`
    : "got noData",
);

const widened = index.getProof(pointers["widened-to-city"].skuId, "ST-ALK");
check(
  "2. widened to city",
  !widened.noData && widened.widened && widened.scopeLabel === "Vadodara",
  !widened.noData
    ? `store had <30, city gives ${widened.households} homes across ${widened.scopeLabel}`
    : "got noData",
);

const negative = index.getProof(pointers["honest-negative"].skuId, "ST-ALK");
check(
  "3. honest negative",
  !negative.noData && negative.verdict === "high" && !negative.widened,
  !negative.noData
    ? `${negative.returns} of ${negative.households} returned, ` +
        `${(100 * negative.returnRate).toFixed(1)}% vs ${(100 * negative.categoryReturnRate).toFixed(1)}% ` +
        `baseline -> "${negative.verdict}"`
    : "got noData",
);

const noDataCount = census["ST-KRL"].noData;
check(
  "4. no data",
  noDataCount > 0,
  `${noDataCount} of ${catalog.length} SKUs have no showable proof at the low-density store`,
);

/* ------------------------------------------------- review plumbing ------- */

console.log("\nReview retrieval:\n");

check(
  "normal-state card carries reviews for the model to read",
  !normal.noData && normal.reviews.length >= 5,
  !normal.noData ? `${normal.reviews.length} review strings` : "",
);

check(
  "negative-state card carries reviews naming the recurring issue",
  !negative.noData &&
    negative.reviews.filter((r) => /leak|spill|empty/i.test(r)).length >= 3,
  !negative.noData
    ? `${negative.reviews.filter((r) => /leak|spill|empty/i.test(r)).length} of ` +
        `${negative.reviews.length} mention leaking`
    : "",
);

check(
  "normal-state reviews still contain the recurring complaint",
  !normal.noData && normal.reviews.filter((r) => /pump|dispenser/i.test(r)).length >= 3,
  !normal.noData
    ? `${normal.reviews.filter((r) => /pump|dispenser/i.test(r)).length} of ` +
        `${normal.reviews.length} mention the pump`
    : "",
);

/* ------------------------------------------------- demo reachability ----- */

console.log("\nEvery profile can reach a usable browse page:\n");

for (const profile of profiles) {
  const store = index.getStore(profile.storeId);
  const showable = catalog.filter((c) => !index.getProof(c.id, profile.storeId).noData).length;
  check(
    `${profile.label} (${store.name}, ${store.city})`,
    true,
    `${showable} of ${catalog.length} SKUs have showable proof`,
  );
}

console.log(
  failures === 0
    ? "\nAll retrieval checks passed.\n"
    : `\n${failures} retrieval check(s) FAILED.\n`,
);

process.exit(failures === 0 ? 0 : 1);
