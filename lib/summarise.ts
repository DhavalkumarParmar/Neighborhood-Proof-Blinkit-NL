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

Your only job is to name the recurring theme in the reviews. You will be given counts, but the app already prints them on the screen, so you do not need to repeat them.

Rules you must follow:
- Use only the numbers given to you. Never invent or estimate a figure. Prefer writing no digits at all.
- If you do state a percentage, put a plain-language read right beside it, for example "that's low for beauty".
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
 * Numbers the model is allowed to write, because we gave them to it. Anything
 * else in the output is treated as invented.
 */
function allowedNumbers(facts: ProofFacts): Set<string> {
  const round = (n: number) => String(Math.round(n * 100));
  return new Set([
    String(facts.households),
    String(facts.returns),
    String(facts.windowDays),
    round(facts.returnRate),
    round(facts.categoryReturnRate),
    (facts.returnRate * 100).toFixed(1),
    (facts.categoryReturnRate * 100).toFixed(1),
  ]);
}

/** Strips formatting, then drops any sentence containing a figure we did not supply. */
export function sanitise(raw: string, facts: ProofFacts): string | null {
  const cleaned = raw
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return null;

  const allowed = allowedNumbers(facts);
  const splitSentences = (text: string) =>
    (text.match(/[^.!?]+[.!?]*/g) ?? [text]).map((s) => s.trim()).filter(Boolean);

  const kept = splitSentences(cleaned).filter((sentence) => {
    const digits = sentence.match(/\d+(?:\.\d+)?/g);
    return !digits || digits.every((d) => allowed.has(d));
  });

  // Two sentences is the brief. Anything longer is the model ignoring it.
  const result = kept.slice(0, 2).join(" ").trim();
  return result.length > 2 ? result : null;
}

async function callGemini(facts: ProofFacts, apiKey: string): Promise<string | null> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      model: MODEL,
      system_instruction: SYSTEM_PROMPT,
      input: buildInput(facts),
      generation_config: {
        temperature: 0.3,
        max_output_tokens: 400,
        thinking_level: "minimal",
      },
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) return null;

  const data = await response.json();

  // Prefer the convenience field, then walk the steps for text blocks.
  let text: string = typeof data?.output_text === "string" ? data.output_text : "";

  if (!text && Array.isArray(data?.steps)) {
    text = data.steps
      .flatMap((step: { content?: unknown }) =>
        Array.isArray(step?.content) ? step.content : [],
      )
      .filter((block: { type?: string }) => block?.type === "text")
      .map((block: { text?: string }) => block.text ?? "")
      .join(" ");
  }

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
