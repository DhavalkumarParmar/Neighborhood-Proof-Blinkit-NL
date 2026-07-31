/**
 * Checks the LLM summarising layer.
 *
 * The invented-figure guard and the silent-degrade path are checked offline.
 * The live Gemini call is only exercised when GEMINI_API_KEY is present:
 *
 *   GEMINI_API_KEY=... npm run check:summary
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildProofIndex } from "../lib/proof-core.ts";
import { sanitise, summarise } from "../lib/summarise.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => JSON.parse(readFileSync(join(ROOT, "data", f), "utf8"));

const index = buildProofIndex(read("catalog.json"), read("stores.json"), read("ledger.json"));
const pointers = read("demo-pointers.json");

let failures = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "  ok  " : " FAIL "} ${name}${detail ? `  ${detail}` : ""}`);
  if (!ok) failures++;
};

const normal = index.getProof(pointers.normal.skuId, "ST-ALK");
const negative = index.getProof(pointers["honest-negative"].skuId, "ST-ALK");

/* ------------------------------------------- invented-figure guard -------- */

console.log("\nInvented-figure guard:\n");

check(
  "keeps a clean sentence with no digits",
  sanitise("Main issue people had: the pump stops working. The serum is fine.", normal) ===
    "Main issue people had: the pump stops working. The serum is fine.",
);

check(
  "keeps a figure we actually supplied",
  (sanitise(`${normal.households} homes bought it.`, normal) ?? "").includes(
    String(normal.households),
  ),
  `households = ${normal.households}`,
);

check(
  "drops a sentence containing a figure we never supplied",
  sanitise("The pump breaks often. 87 percent of buyers complained.", normal) ===
    "The pump breaks often.",
);

check(
  "returns null when every sentence is invented",
  sanitise("About 640 homes rated it 4.7 stars.", normal) === null,
);

check(
  "strips markdown emphasis and bullets",
  sanitise("**Main issue:** the pump stops working.", normal) ===
    "Main issue: the pump stops working.",
);

check("returns null on empty model output", sanitise("   ", normal) === null);

check(
  "trims a rambling answer to two sentences",
  (sanitise(
    "Pump breaks early. Serum is fine. People also liked the smell. And the box was nice.",
    normal,
  ) ?? "") === "Pump breaks early. Serum is fine.",
);

/* -------------------------------------------------- silent degrade -------- */

console.log("\nSilent degrade:\n");

const savedKey = process.env.GEMINI_API_KEY;
delete process.env.GEMINI_API_KEY;
const withoutKey = await summarise(normal);
check("returns null with no API key, throws nothing", withoutKey === null);
if (savedKey) process.env.GEMINI_API_KEY = savedKey;

/* ------------------------------------------------------- live call -------- */

console.log("\nLive Gemini call:\n");

if (!process.env.GEMINI_API_KEY) {
  console.log("  skipped  GEMINI_API_KEY is not set.");
  console.log("           The card renders its numbers without the sentence until it is.");
  console.log("           Run: GEMINI_API_KEY=... npm run check:summary\n");
} else {
  for (const [label, facts] of [
    ["normal (low returns, real complaint)", normal],
    ["honest negative (high returns)", negative],
  ]) {
    const started = Date.now();
    const summary = await summarise(facts);
    const ms = Date.now() - started;

    if (summary === null) {
      check(`${label} returned a sentence`, false, `null after ${ms}ms`);
      continue;
    }

    console.log(`  ${label}  (${ms}ms)`);
    console.log(`    "${summary}"`);

    check(`  ${label}: within 40 words`, summary.split(/\s+/).length <= 40);
    check(
      `  ${label}: contains no invented figure`,
      sanitise(summary, facts) === summary,
    );
  }

  // The important one: a low return rate must not stop it naming the complaint.
  const normalSummary = await summarise(normal);
  check(
    "  names the recurring complaint even when returns are low",
    /pump|dispens/i.test(normalSummary ?? ""),
    normalSummary ? `"${normalSummary}"` : "null",
  );

  const negativeSummary = await summarise(negative);
  check(
    "  names leaking on the high-return product",
    /leak|spill|empt/i.test(negativeSummary ?? ""),
    negativeSummary ? `"${negativeSummary}"` : "null",
  );
}

console.log(
  failures === 0 ? "All summary checks passed.\n" : `${failures} summary check(s) FAILED.\n`,
);

process.exit(failures === 0 ? 0 : 1);
