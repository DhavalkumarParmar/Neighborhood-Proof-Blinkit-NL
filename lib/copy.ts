/**
 * Turns retrieved facts into the exact words on screen.
 *
 * This is the plain-language layer, and it is code, not a model. The reads
 * beside the numbers ("that's low for beauty") are decided here from the
 * verdict that lib/proof-core.ts computed, so the wording can never drift from
 * the arithmetic.
 */

import type { ProofFacts } from "./proof-core";

/** Everyday word for each category. No one says "Beauty & Personal Care" out loud. */
const CATEGORY_WORD: Record<string, string> = {
  beauty: "beauty",
  pet: "pet care",
  baby: "baby care",
  home: "home items",
  electronics: "electronics",
};

export function categoryWord(category: string): string {
  return CATEGORY_WORD[category] ?? category;
}

/** "212 homes near you" / "41 homes in Vadodara" */
export function boughtHeadline(facts: ProofFacts): { count: string; where: string } {
  return {
    count: `${facts.households} ${facts.households === 1 ? "home" : "homes"}`,
    where: facts.widened ? `in ${facts.city}` : "near you",
  };
}

/** "9 sent it back. That's low for beauty." */
export function returnsLine(facts: ProofFacts): string {
  const word = categoryWord(facts.category);

  if (facts.returns === 0) {
    return `Nobody sent it back. That's unusual for ${word}.`;
  }

  // When a product is genuinely bad, the denominator belongs in the sentence.
  // Hiding it behind a bare count is how a rating strip flatters a product.
  if (facts.verdict === "high") {
    return `${facts.returns} of ${facts.households} sent it back. That's high.`;
  }

  const read = facts.verdict === "low" ? `That's low for ${word}.` : `That's about normal for ${word}.`;
  return `${facts.returns} sent it back. ${read}`;
}

/** "Too few orders near you. Showing all of Vadodara instead." */
export function widenedNotice(facts: ProofFacts): string | null {
  if (!facts.widened) return null;
  return `Too few orders near you. Showing all of ${facts.city} instead.`;
}

/** "From real orders at your Alkapuri store, last 30 days." */
export function provenanceLine(facts: ProofFacts): string {
  const where = facts.widened
    ? `across ${facts.city}`
    : `at your ${facts.storeName} store`;
  return `From real orders ${where}, last ${facts.windowDays} days.`;
}

/** The short line used on a listing card, where there is room for one number. */
export function listingProofLine(facts: ProofFacts): string {
  const { count, where } = boughtHeadline(facts);
  return `${count} ${where} bought this`;
}

export const NO_DATA_HEADLINE = "New here.";
export const NO_DATA_LINE = "No orders yet to show you.";
export const NO_DATA_SUB =
  "We will show real numbers once enough homes near you have tried it.";
