/**
 * Screen 2 - browse listing of the non-grocery categories.
 *
 * The proof line under each card is computed here, server-side, once per SKU
 * for this shopper's store. That is also what makes the listing honest: a SKU
 * with nothing to say says nothing rather than borrowing another store's
 * numbers.
 */

import { redirect } from "next/navigation";
import { BrowseClient, type BrowseItem } from "@/components/BrowseClient";
import { listingProofLine } from "@/lib/copy";
import {
  CATEGORY_ORDER,
  catalog,
  etaMinutes,
  getProfile,
  getProof,
  getStore,
} from "@/lib/retrieval";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p } = await searchParams;
  const profile = getProfile(p ?? "");
  if (!profile) redirect("/");

  const store = getStore(profile.storeId);
  if (!store) redirect("/");

  // Lead with what this shopper is most likely to be tempted by, then the rest.
  const ordered = [
    ...profile.interests,
    ...CATEGORY_ORDER.filter((c) => !profile.interests.includes(c)),
  ];

  const items: BrowseItem[] = catalog
    .slice()
    .sort((a, b) => ordered.indexOf(a.category) - ordered.indexOf(b.category))
    .map((item) => {
      const facts = getProof(item.id, profile.storeId);
      return {
        id: item.id,
        brand: item.brand,
        name: item.name,
        title: item.title,
        category: item.category,
        unit: item.unit,
        price: item.price,
        mrp: item.mrp,
        discountPercent: item.discountPercent,
        proofLine: facts.noData ? "No orders near you yet" : listingProofLine(facts),
        hasProof: !facts.noData,
      };
    });

  return (
    <BrowseClient
      items={items}
      categories={ordered}
      profileId={profile.id}
      storeArea={store.area}
      eta={etaMinutes(store)}
    />
  );
}
