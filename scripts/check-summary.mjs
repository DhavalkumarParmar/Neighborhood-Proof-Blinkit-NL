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
import { diagnose, sanitise, summarise } from "../lib/summarise.ts";

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

/* ---------------------------------------------------- figure guard -------- */

console.log("\nFigure guard (the model may not write any digit):\n");

check(
  "keeps a clean sentence with no digits",
  sanitise("Main issue people had: the pump stops working. The serum is fine.", normal) ===
    "Main issue people had: the pump stops working. The serum is fine.",
);

check(
  "keeps quantities written as words",
  sanitise("Most buyers were happy. A few said the cap leaks.", normal) ===
    "Most buyers were happy. A few said the cap leaks.",
);

check(
  "drops an invented figure",
  sanitise("The pump breaks often. 87 percent of buyers complained.", normal) ===
    "The pump breaks often.",
);

check(
  "drops a bare restated rate, the live regression this guard exists for",
  sanitise("The pump dispenser stops working. The return rate was 4.", normal) ===
    "The pump dispenser stops working.",
);

check(
  "drops a supplied count too, since the card already prints it above",
  sanitise(`${normal.households} homes bought it. The pump breaks.`, normal) ===
    "The pump breaks.",
  `households = ${normal.households}`,
);

check(
  "returns null when every sentence carries a figure",
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
  // diagnose() reports why a call failed. The app itself stays silent, so this
  // is the only place a wrong key or an unavailable model becomes visible.
  const first = await diagnose(normal);
  console.log(`  endpoint  POST /v1beta/interactions`);
  console.log(`  model     gemini-3.6-flash`);
  console.log(`  status    ${first.status ?? "no response"}`);

  if (!first.ok) {
    console.log(`\n FAIL  live call did not produce a usable sentence`);
    console.log(`\n  ${first.detail}\n`);
    if (first.rawText) console.log(`  Raw model text was:\n  "${first.rawText}"\n`);
    failures++;
  } else {
    console.log(`  raw       "${first.rawText}"`);
    console.log(`  shown     "${first.summary}"\n`);
  }

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
