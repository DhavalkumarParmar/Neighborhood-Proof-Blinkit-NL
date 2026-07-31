/**
 * Returns just the complaint sentence for a product at a store.
 *
 * The facts are recomputed here from the ledger rather than accepted from the
 * client, so nothing the browser sends can change a number on the card.
 *
 * The proof card renders its counts immediately from the server render; this
 * route fills in the one sentence afterwards. That way a slow or dead model
 * never delays the numbers, and a failure just means no sentence appears.
 */

import { NextResponse } from "next/server";
import { getProof } from "@/lib/retrieval";
import { summarise } from "@/lib/summarise";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sku = searchParams.get("sku");
  const store = searchParams.get("store");

  if (!sku || !store) {
    return NextResponse.json({ summary: null });
  }

  const facts = getProof(sku, store);
  if (facts.noData) {
    return NextResponse.json({ summary: null });
  }

  const summary = await summarise(facts);
  return NextResponse.json({ summary });
}
