/**
 * RETRIEVAL LAYER (pure)
 *
 * Every number the UI shows is computed here, in code, from the ledger.
 * Nothing in this file calls a model, and no number it returns is ever
 * produced by a model. The LLM layer receives this output as read-only input.
 *
 * Rules:
 *   - Under 30 households at store level -> widen to the whole city, widened: true
 *   - Still under 30 city-wide           -> noData: true
 *
 * This file deliberately takes its data as arguments so it can be exercised
 * outside of Next.js (see scripts/check-retrieval.mjs).
 */

export const MIN_HOUSEHOLDS = 30;
export const WINDOW_DAYS = 30;
const MAX_REVIEWS = 24;

export type Store = {
  id: string;
  name: string;
  city: string;
  area: string;
  pincode: string;
  density: string;
  densityFactor: number;
};

export type CatalogItem = {
  id: string;
  brand: string;
  name: string;
  title: string;
  category: string;
  categoryLabel: string;
  unit: string;
  price: number;
  mrp: number;
  discountPercent: number;
};

export type LedgerRecord = {
  household: string;
  sku: string;
  store: string;
  daysAgo: number;
  returned: boolean;
  review?: string;
};

export type NoDataFacts = {
  noData: true;
  skuId: string;
  storeId: string;
  storeName: string;
  city: string;
};

export type ProofFacts = {
  noData: false;
  /** True when the store had fewer than MIN_HOUSEHOLDS and we fell back to the city. */
  widened: boolean;
  scope: "store" | "city";
  /** What the provenance line names: the store area, or the whole city. */
  scopeLabel: string;
  storeId: string;
  storeName: string;
  city: string;
  skuId: string;
  category: string;
  categoryLabel: string;
  households: number;
  returns: number;
  returnRate: number;
  categoryReturnRate: number;
  /** Decided in code by comparing this product to its category baseline. */
  verdict: "low" | "normal" | "high";
  windowDays: number;
  reviews: string[];
};

export type Facts = ProofFacts | NoDataFacts;

/** Compares a product's return rate to its category baseline. In code. */
export function verdictFor(
  returnRate: number,
  baseline: number,
): "low" | "normal" | "high" {
  if (baseline <= 0) return "normal";
  const ratio = returnRate / baseline;
  if (ratio < 0.75) return "low";
  if (ratio <= 1.4) return "normal";
  return "high";
}

type Counted = { households: number; returns: number; reviews: string[] };

function count(records: LedgerRecord[]): Counted {
  const households = new Set<string>();
  let returns = 0;
  const returnedReviews: string[] = [];
  const keptReviews: string[] = [];

  for (const record of records) {
    households.add(record.household);
    if (record.returned) returns++;
    if (record.review) {
      (record.returned ? returnedReviews : keptReviews).push(record.review);
    }
  }

  // Reviews from people who sent it back go first, so that trimming the list
  // can never drop a recurring complaint in favour of praise.
  return {
    households: households.size,
    returns,
    reviews: [...returnedReviews, ...keptReviews].slice(0, MAX_REVIEWS),
  };
}

export type ProofIndex = {
  getProof(skuId: string, storeId: string): Facts;
  getCategoryReturnRate(category: string): number;
  getItem(skuId: string): CatalogItem | undefined;
  getStore(storeId: string): Store | undefined;
};

export function buildProofIndex(
  catalog: CatalogItem[],
  stores: Store[],
  ledger: LedgerRecord[],
): ProofIndex {
  const itemById = new Map(catalog.map((c) => [c.id, c]));
  const storeById = new Map(stores.map((s) => [s.id, s]));

  const bySkuStore = new Map<string, LedgerRecord[]>();
  const byCategory = new Map<string, LedgerRecord[]>();

  for (const record of ledger) {
    if (record.daysAgo >= WINDOW_DAYS) continue;

    const key = `${record.sku}|${record.store}`;
    const bucket = bySkuStore.get(key);
    if (bucket) bucket.push(record);
    else bySkuStore.set(key, [record]);

    const category = itemById.get(record.sku)?.category;
    if (category) {
      const catBucket = byCategory.get(category);
      if (catBucket) catBucket.push(record);
      else byCategory.set(category, [record]);
    }
  }

  const storesByCity = new Map<string, string[]>();
  for (const store of stores) {
    const list = storesByCity.get(store.city);
    if (list) list.push(store.id);
    else storesByCity.set(store.city, [store.id]);
  }

  /**
   * Category baseline across every store in the network, not per store. A
   * baseline is only useful if it is stable, and one store does not have the
   * volume to make a per-category rate mean anything.
   */
  const categoryReturnRate = new Map<string, number>();
  for (const [category, records] of byCategory) {
    const returns = records.reduce((n, r) => n + (r.returned ? 1 : 0), 0);
    categoryReturnRate.set(category, records.length ? returns / records.length : 0);
  }

  const forStore = (skuId: string, storeId: string) =>
    bySkuStore.get(`${skuId}|${storeId}`) ?? [];

  const forCity = (skuId: string, city: string) =>
    (storesByCity.get(city) ?? []).flatMap((id) => forStore(skuId, id));

  function getProof(skuId: string, storeId: string): Facts {
    const store = storeById.get(storeId);
    const item = itemById.get(skuId);

    if (!store || !item) {
      return {
        noData: true,
        skuId,
        storeId,
        storeName: store?.name ?? "",
        city: store?.city ?? "",
      };
    }

    const base = { skuId, storeId, storeName: store.name, city: store.city };

    let scope: "store" | "city" = "store";
    let scopeLabel = store.name;
    let counted = count(forStore(skuId, storeId));
    let widened = false;

    if (counted.households < MIN_HOUSEHOLDS) {
      const cityCounted = count(forCity(skuId, store.city));
      if (cityCounted.households >= MIN_HOUSEHOLDS) {
        scope = "city";
        scopeLabel = store.city;
        counted = cityCounted;
        widened = true;
      } else {
        return { noData: true, ...base };
      }
    }

    const returnRate = counted.returns / counted.households;
    const baseline = categoryReturnRate.get(item.category) ?? 0;

    return {
      noData: false,
      widened,
      scope,
      scopeLabel,
      ...base,
      category: item.category,
      categoryLabel: item.categoryLabel,
      households: counted.households,
      returns: counted.returns,
      returnRate,
      categoryReturnRate: baseline,
      verdict: verdictFor(returnRate, baseline),
      windowDays: WINDOW_DAYS,
      reviews: counted.reviews,
    };
  }

  return {
    getProof,
    getCategoryReturnRate: (category) => categoryReturnRate.get(category) ?? 0,
    getItem: (skuId) => itemById.get(skuId),
    getStore: (storeId) => storeById.get(storeId),
  };
}
