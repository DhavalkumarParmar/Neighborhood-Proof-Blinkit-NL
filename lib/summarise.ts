/**
 * LLM SUMMARISING LAYER
 *
 * The model's only job is to read the retrieved review strings and name the
 * recurring complaint in one or two plain sentences.
 *
 * It never produces a number. Every figure on the proof card comes from
 * lib/proof-core.ts. The model is given the numbers as read-only context so
 * its wording does not contradict them, and a guard below drops any sentence
 * containing a figure we did not supply.
 *
 * On any failure - no key, timeout, bad response, blocked output - this
 * returns null and the UI renders the numbers on their own. No error message,
 * no apology.
 *
 * API shape verified against ai.google.dev/gemini-api/docs (Interactions API,
 * July 2026): POST /v1beta/interactions, not the older generateContent.
 */

import type { ProofFacts } from "./proof-core";

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";
const MODEL = "gemini-3.6-flash";
const TIMEOUT_MS = 8000;

const SYSTEM_PROMPT = `You write one short honest summary of what people near a shopper said about a product they bought from a quick-commerce app in India.

Your only job is to name the recurring theme in the reviews. You are given counts for context so your wording does not contradict them, but the app already prints every number on the screen directly above your sentence.

Rules you must follow:
- Never write a digit. Never restate a count, a rate or a percentage. The screen already shows them, and repeating them reads as clutter.
- If you need to describe a quantity, use a word: "most", "a few", "several", "after a few weeks".
- Never invent or estimate a figure of any kind.
- If the reviews contain a recurring negative, you must name it. A summary that is only positive when negatives exist is a failure.
- If most reviews are happy and there is no repeated problem, say briefly what people liked instead.
- Separate the product from its packaging or delivery when the reviews do. If the thing inside is fine and the bottle or box is the problem, say so.
- Simple everyday English for Indian readers. Short sentences. No jargon. No marketing language. No exclamation marks.
- One or two sentences. Maximum 40 words. Plain text only, no bullet points, no bold, no quotes.

Good examples of tone:
Main issue people had: the pump stops working after a few weeks. The serum itself is fine.
Most who sent it back said it came leaking.
People mostly said the smell is too strong for a closed room.
No repeated complaint. People said it cleans well and lasts a while.`;

function buildInput(facts: ProofFacts): string {
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

  return [
    `Product category: ${facts.categoryLabel}`,
    `Homes that bought it: ${facts.households}`,
    `Homes that sent it back: ${facts.returns}`,
    `Return rate: ${pct(facts.returnRate)}`,
    `Average return rate for ${facts.categoryLabel}: ${pct(facts.categoryReturnRate)}`,
    `How this product compares to its category: ${facts.verdict}`,
    "",
    "Reviews from those orders:",
    ...facts.reviews.map((r) => `- ${r}`),
  ].join("\n");
}

/**
 * Strips formatting, then drops any sentence containing a digit.
 *
 * The card renders every figure itself, directly above this sentence, so the
 * model has no reason to write one. Allowing it to echo "the numbers we gave
 * it" turned out to be worse than banning digits outright: given a return rate
 * of 4.2% it produced "The return rate was 4." - a technically-supplied figure,
 * stated nakedly and meaning nothing. A blanket ban removes that whole class of
 * failure, and the plain-language reads beside every number are generated in
 * lib/copy.ts where they cannot drift from the arithmetic.
 */
export function sanitise(raw: string, _facts: ProofFacts): string | null {
  const cleaned = raw
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return null;

  const sentences = (cleaned.match(/[^.!?]+[.!?]*/g) ?? [cleaned])
    .map((s) => s.trim())
    .filter(Boolean);

  const kept = sentences.filter((sentence) => !/\d/.test(sentence));

  // Two sentences is the brief. Anything longer is the model ignoring it.
  const result = kept.slice(0, 2).join(" ").trim();
  return result.length > 2 ? result : null;
}

function requestBody(facts: ProofFacts) {
  return JSON.stringify({
    model: MODEL,
    system_instruction: SYSTEM_PROMPT,
    input: buildInput(facts),
    generation_config: {
      temperature: 0.3,
      max_output_tokens: 400,
      thinking_level: "minimal",
    },
  });
}

/**
 * Same call as summarise(), but reports why it failed instead of swallowing it.
 *
 * The app degrades silently by design, which means a wrong key, an unavailable
 * model or a blocked response all look exactly like "working but quiet". This
 * exists so that misconfiguration is diagnosable during setup. Nothing in the
 * app imports it - only scripts/check-summary.mjs does.
 */
export type Diagnosis = {
  ok: boolean;
  status: number | null;
  detail: string;
  rawText: string | null;
  summary: string | null;
};

export async function diagnose(facts: ProofFacts): Promise<Diagnosis> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      ok: false,
      status: null,
      detail: "GEMINI_API_KEY is not set in the environment.",
      rawText: null,
      summary: null,
    };
  }

  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: requestBody(facts),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    const name = error instanceof Error ? error.name : "Error";
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      status: null,
      detail:
        name === "TimeoutError"
          ? `Request did not finish within ${TIMEOUT_MS}ms.`
          : `${name}: ${message}`,
      rawText: null,
      summary: null,
    };
  }

  const body = await response.text();

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      detail: `HTTP ${response.status} ${response.statusText}. Response body:\n${body.slice(0, 900)}`,
      rawText: null,
      summary: null,
    };
  }

  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch {
    return {
      ok: false,
      status: response.status,
      detail: `Response was not JSON:\n${body.slice(0, 400)}`,
      rawText: null,
      summary: null,
    };
  }

  const rawText = extractText(data);

  if (!rawText) {
    return {
      ok: false,
      status: response.status,
      detail:
        "Call succeeded but no text came back. The model may have returned only " +
        `thoughts, or the output was blocked. Response body:\n${body.slice(0, 900)}`,
      rawText: null,
      summary: null,
    };
  }

  const summary = sanitise(rawText, facts);

  return {
    ok: summary !== null,
    status: response.status,
    detail:
      summary === null
        ? "Model replied, but every sentence was dropped by the invented-figure guard."
        : "OK",
    rawText,
    summary,
  };
}

/** Pulls the text out of an Interactions response, whichever shape it arrives in. */
function extractText(data: unknown): string {
  const payload = data as { output_text?: unknown; steps?: unknown };

  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  if (Array.isArray(payload?.steps)) {
    return payload.steps
      .flatMap((step: { content?: unknown }) =>
        Array.isArray(step?.content) ? step.content : [],
      )
      .filter((block: { type?: string }) => block?.type === "text")
      .map((block: { text?: string }) => block.text ?? "")
      .join(" ")
      .trim();
  }

  return "";
}

async function callGemini(facts: ProofFacts, apiKey: string): Promise<string | null> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: requestBody(facts),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) return null;

  const text = extractText(await response.json());
  return text ? sanitise(text, facts) : null;
}

/** Cached per sku+store so repeat views in a demo do not re-bill or re-wait. */
const cache = new Map<string, string | null>();

export async function summarise(facts: ProofFacts): Promise<string | null> {
  const key = `${facts.skuId}|${facts.storeId}|${facts.scope}`;
  if (cache.has(key)) return cache.get(key) ?? null;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || facts.reviews.length === 0) return null;

  try {
    const summary = await callGemini(facts, apiKey);
    cache.set(key, summary);
    return summary;
  } catch {
    // Silent degrade. The numbers are already on the screen and they are the
    // part that matters; a missing sentence is better than an error state.
    return null;
  }
}
